import mongoose from "mongoose";

const villageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point"
      },
      coordinates: {
        type: [Number],
        required: true
      }
    },
    population: { type: Number, required: true },
    elderlyPopulation: { type: Number, required: true },
    vulnerabilityIndex: { type: Number, min: 0, max: 1, required: true },
    nearestHospitalDistance: { type: Number, required: true }, // in km
    availableResources: { type: Number, default: 0 },
    maxResourcesCapacity: { type: Number, default: 10 },
    currentSituationSeverity: {
      type: Number,
      min: 0,
      max: 4,
      default: 0
    },
    regionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Region"
    }
  },
  { timestamps: true }
);

villageSchema.index({ location: "2dsphere" });

export const Village = mongoose.model("Village", villageSchema);

