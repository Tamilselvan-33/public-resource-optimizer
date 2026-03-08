import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { Ambulance } from "../models/Ambulance.js";
import { Village } from "../models/Village.js";
import { Region } from "../models/Region.js";

dotenv.config();

const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/resource_engine";

async function seed() {
  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB, seeding sample data...");

  await Promise.all([
    User.deleteMany({}),
    Ambulance.deleteMany({}),
    Village.deleteMany({}),
    Region.deleteMany({})
  ]);

  const adminPasswordHash = await bcrypt.hash("admin123", 10);
  const citizenPasswordHash = await bcrypt.hash("citizen123", 10);

  const [admin, citizen] = await User.create(
    {
      name: "Admin User",
      phone: "9990000001",
      role: "admin",
      passwordHash: adminPasswordHash
    },
    {
      name: "Citizen User",
      phone: "9990000002",
      role: "citizen",
      passwordHash: citizenPasswordHash
    }
  );

  const region = await Region.create({
    name: "Sample Rural District",
    population: 50000,
    vulnerabilityIndex: 0.7,
    hospitals: [
      {
        name: "District Hospital",
        location: {
          type: "Point",
          coordinates: [77.5, 13.0]
        }
      }
    ]
  });

  const villages = await Village.create(
    {
      name: "Village A",
      location: { type: "Point", coordinates: [77.51, 13.01] },
      population: 3000,
      elderlyPopulation: 600,
      vulnerabilityIndex: 0.8,
      nearestHospitalDistance: 20,
      availableResources: 1,
      maxResourcesCapacity: 5,
      currentSituationSeverity: 2,
      regionId: region._id
    },
    {
      name: "Village B",
      location: { type: "Point", coordinates: [77.7, 13.2] },
      population: 1500,
      elderlyPopulation: 200,
      vulnerabilityIndex: 0.6,
      nearestHospitalDistance: 35,
      availableResources: 0,
      maxResourcesCapacity: 4,
      currentSituationSeverity: 3,
      regionId: region._id
    }
  );

  await Ambulance.create(
    {
      vehicleNumber: "AMB-001",
      driverName: "Ravi",
      status: "available",
      location: { type: "Point", coordinates: [77.5, 13.0] }
    },
    {
      vehicleNumber: "AMB-002",
      driverName: "Sita",
      status: "available",
      location: { type: "Point", coordinates: [77.6, 13.05] }
    }
  );

  console.log("Seed completed.");
  console.log("Admin login: 9990000001 / admin123");
  console.log("Citizen login: 9990000002 / citizen123");

  await mongoose.disconnect();
}

seed()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error("Seed error", err);
    process.exit(1);
  });

