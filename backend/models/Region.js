import mongoose from "mongoose";

const regionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    population: { type: Number, required: true },
    vulnerabilityIndex: { type: Number, min: 0, max: 1, required: true },
    hospitals: [
      {
        name: String,
        location: {
          type: {
            type: String,
            enum: ["Point"],
            default: "Point"
          },
          coordinates: {
            type: [Number],
            default: [0, 0]
          }
        }
      }
    ]
  },
  { timestamps: true }
);

regionSchema.index({ "hospitals.location": "2dsphere" });

export const Region = mongoose.model("Region", regionSchema);

