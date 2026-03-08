import mongoose from "mongoose";

const ambulanceSchema = new mongoose.Schema(
  {
    vehicleNumber: { type: String, required: true, unique: true },
    driverName: { type: String, required: true },
    status: {
      type: String,
      enum: ["available", "busy", "offline"],
      default: "available"
    },
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
    },
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital"
    }
  },
  { timestamps: true }
);

ambulanceSchema.index({ location: "2dsphere" });

export const Ambulance = mongoose.model("Ambulance", ambulanceSchema);

