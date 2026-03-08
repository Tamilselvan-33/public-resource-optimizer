import mongoose from "mongoose";

const disasterEventSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["flood", "earthquake", "cyclone", "other"],
      required: true
    },
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
    severity: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    description: {
      type: String
    },
    requiredResources: {
      ambulances: { type: Number, default: 0 },
      medicalTeams: { type: Number, default: 0 },
      reliefUnits: { type: Number, default: 0 }
    },
    aiAnalysis: {
      summary: String,
      affectedRegions: [String],
      suggestedStrategy: String,
      raw: mongoose.Schema.Types.Mixed
    }
  },
  { timestamps: true }
);

disasterEventSchema.index({ location: "2dsphere" });

export const DisasterEvent = mongoose.model("DisasterEvent", disasterEventSchema);

