require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const { connectWhatsApp } = require("./config/whatsapp");
const queueRoutes = require("./routes/queue.routes");
const http = require("http");
const { Server } = require("socket.io");

connectDB();
connectWhatsApp();

const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
  }),
);

app.use(express.json());

app.use("/api/queue", queueRoutes);

const server = http.createServer(app);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
