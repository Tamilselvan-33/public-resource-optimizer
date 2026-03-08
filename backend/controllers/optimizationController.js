import { optimizeResources } from "../services/optimizationService.js";

export const runOptimization = async (req, res, next) => {
  try {
    const result = await optimizeResources(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

