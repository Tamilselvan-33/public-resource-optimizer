import { Ambulance } from "../models/Ambulance.js";

export const getAmbulances = async (_req, res, next) => {
  try {
    const ambulances = await Ambulance.find();
    res.json(ambulances);
  } catch (err) {
    next(err);
  }
};

export const createAmbulance = async (req, res, next) => {
  try {
    const ambulance = await Ambulance.create(req.body);
    res.status(201).json(ambulance);
  } catch (err) {
    next(err);
  }
};

export const updateAmbulanceStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, location } = req.body;

    const ambulance = await Ambulance.findByIdAndUpdate(
      id,
      { status, ...(location && { location }) },
      { new: true }
    );
    if (!ambulance) {
      return res.status(404).json({ message: "Ambulance not found" });
    }
    res.json(ambulance);
  } catch (err) {
    next(err);
  }
};

