import mongoose from "mongoose";

const requestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    type: {
      type: String,
      enum: ["ambulance", "staff", "teacher", "relief"],
      required: true
    },
    severity: {
      type: Number,
      min: 0,
      max: 4,
      required: true
    },
    emergencyDescription: {
      type: String
    },
    aiAnalysis: {
      emergencyType: String,
      severityLevel: Number,
      recommendedResources: [String],
      raw: mongoose.Schema.Types.Mixed
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
    villageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Village"
    },
    status: {
      type: String,
      enum: ["pending", "assigned", "in_progress", "completed", "cancelled"],
      default: "pending"
    },
    assignedResource: {
      type: String
    },
    etaMinutes: {
      type: Number
    },
    priorityScore: {
      type: Number
    }
  },
  { timestamps: true }
);

requestSchema.index({ location: "2dsphere" });

export const Request = mongoose.model("Request", requestSchema);

