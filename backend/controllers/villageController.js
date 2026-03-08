import { Village } from "../models/Village.js";

export const getVillages = async (_req, res, next) => {
  try {
    const villages = await Village.find();
    res.json(villages);
  } catch (err) {
    next(err);
  }
};

export const createVillage = async (req, res, next) => {
  try {
    const village = await Village.create(req.body);
    res.status(201).json(village);
  } catch (err) {
    next(err);
  }
};

export const updateVillage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const village = await Village.findByIdAndUpdate(id, req.body, { new: true });
    if (!village) {
      return res.status(404).json({ message: "Village not found" });
    }
    res.json(village);
  } catch (err) {
    next(err);
  }
};

