import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import apiRoutes from "./routes/apiRoutes.js";
import editor from "./controllers/socketController.js";
import authRoutes from "./routes/authRoutes.js";
import path from "path";

dotenv.config();

const __dirname = path.resolve();

const app = express();
app.use(cors({
  origin: "http://localhost:5173", // React port
  credentials: true
}));
app.use(express.json());

// API Routes
app.use("/api", apiRoutes);
app.use("/api/auth", authRoutes);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    withCredentials: true,
  },
});

// Handle WebSocket events
editor(io);

const PORT = process.env.PORT || 5001;

// Connect to MongoDB then start server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully!"); // <-- added this line

    const serverInstance = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    serverInstance.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.error(`Port ${PORT} is already in use. Exiting...`);
        process.exit(1);
      } else {
        console.error(err);
      }
    });
  })
  .catch((err) => console.error("MongoDB connection failed:", err));

// Serve frontend in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}
