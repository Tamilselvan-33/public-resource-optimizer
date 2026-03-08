import { Request } from "../models/Request.js";
import { Ambulance } from "../models/Ambulance.js";
import { Village } from "../models/Village.js";
import { analyzeEmergency } from "../services/geminiService.js";
import { optimizeResources } from "../services/optimizationService.js";

const haversineKm = (coords1, coords2) => {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const [lng1, lat1] = coords1;
  const [lng2, lat2] = coords2;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const computePriorityScore = (village, severity) => {
  const maxPopulation = village.maxPopulationReference || 10000;
  const populationScore = village.population / maxPopulation;
  const elderlyScore = village.elderlyPopulation / Math.max(village.population, 1);
  const severityScore = severity / 4;
  const distanceScore = Math.min(village.nearestHospitalDistance / 50, 1);
  const availabilityScore =
    1 - Math.min(village.availableResources / Math.max(village.maxResourcesCapacity, 1), 1);
  const vulnerabilityScore = village.vulnerabilityIndex;

  return (
    0.25 * severityScore +
    0.20 * elderlyScore +
    0.15 * populationScore +
    0.15 * distanceScore +
    0.15 * vulnerabilityScore +
    0.10 * availabilityScore
  );
};

export const createRequest = async (req, res, next) => {
  try {
    const { type, severity, location, emergencyDescription, villageId } = req.body;

    let aiAnalysis = null;
    if (emergencyDescription) {
      try {
        aiAnalysis = await analyzeEmergency(emergencyDescription);
      } catch (e) {
        console.warn("Gemini emergency analysis failed:", e.message);
      }
    }

    const village = villageId ? await Village.findById(villageId) : null;
    let priorityScore = null;
    if (village) {
      priorityScore = computePriorityScore(village, severity);
    }

    const newRequest = await Request.create({
      userId: req.user._id,
      type,
      severity,
      location,
      emergencyDescription,
      villageId,
      aiAnalysis,
      priorityScore
    });

    res.status(201).json(newRequest);
  } catch (err) {
    next(err);
  }
};

export const getRequests = async (_req, res, next) => {
  try {
    const requests = await Request.find().populate("userId", "name phone").populate("villageId");
    res.json(requests);
  } catch (err) {
    next(err);
  }
};

export const assignResource = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { ambulanceId } = req.body;

    const request = await Request.findById(id);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    const ambulance = await Ambulance.findById(ambulanceId);
    if (!ambulance) {
      return res.status(404).json({ message: "Ambulance not found" });
    }

    const distanceKm = haversineKm(
      request.location.coordinates,
      ambulance.location.coordinates
    );
    const avgSpeedKmH = 40;
    const etaMinutes = Math.round((distanceKm / avgSpeedKmH) * 60);

    ambulance.status = "busy";
    await ambulance.save();

    request.status = "assigned";
    request.assignedResource = ambulance._id.toString();
    request.etaMinutes = etaMinutes;
    await request.save();

    res.json({ request, ambulance });
  } catch (err) {
    next(err);
  }
};

export const optimizeActiveRequests = async (_req, res, next) => {
  try {
    const requests = await Request.find({ status: { $in: ["pending", "assigned"] } }).populate(
      "villageId"
    );
    const ambulances = await Ambulance.find({ status: "available" });

    const payload = {
      requests: requests.map((r) => ({
        id: r._id.toString(),
        severity: r.severity,
        village: r.villageId
          ? {
              id: r.villageId._id.toString(),
              name: r.villageId.name,
              population: r.villageId.population,
              elderlyPopulation: r.villageId.elderlyPopulation,
              vulnerabilityIndex: r.villageId.vulnerabilityIndex,
              nearestHospitalDistance: r.villageId.nearestHospitalDistance,
              availableResources: r.villageId.availableResources ?? 0,
              maxResourcesCapacity: r.villageId.maxResourcesCapacity ?? 10,
              currentSituationSeverity: r.villageId.currentSituationSeverity ?? 0
            }
          : null
      })),
      ambulances: ambulances.map((a) => ({
        id: a._id.toString(),
        location: a.location.coordinates
      }))
    };

    const result = await optimizeResources(payload);

    res.json(result);
  } catch (err) {
    next(err);
  }
};

