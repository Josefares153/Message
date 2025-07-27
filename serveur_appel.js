const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());

// ✅ Ajoute ceci pour servir call.html
app.use(express.static(path.join(__dirname)));

// ✅ Page par défaut quand on va sur /
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "call.html"));
});

io.on("connection", (socket) => {
  console.log("🟢 Nouveau client connecté :", socket.id);

  socket.on("message", (data) => {
    console.log("💬 Reçu :", data);
    io.emit("message", data);
  });

  socket.on("disconnect", () => {
    console.log("🔴 Client déconnecté :", socket.id);
  });
});
socket.on("join", (room) => {
  socket.join(room);
  socket.to(room).emit("joined");
});

socket.on("offer", ({ room, offer }) => {
  socket.to(room).emit("offer", { offer });
});

socket.on("answer", ({ room, answer }) => {
  socket.to(room).emit("answer", { answer });
});

socket.on("candidate", ({ room, candidate }) => {
  socket.to(room).emit("candidate", { candidate });
});


const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});
