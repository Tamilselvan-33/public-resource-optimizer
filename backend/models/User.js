import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    role: { type: String, enum: ["citizen", "admin"], default: "citizen" },
    phone: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point"
      },
      coordinates: {
        type: [Number], // [lng, lat]
        default: [0, 0]
      }
    }
  },
  { timestamps: true }
);

userSchema.index({ location: "2dsphere" });

export const User = mongoose.model("User", userSchema);

