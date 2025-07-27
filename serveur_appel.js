const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.static("public")); // pour servir call.html

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // à restreindre si besoin
    methods: ["GET", "POST"]
  }
});

// Page d'accueil simple
app.get("/", (req, res) => {
  res.send("🟢 Serveur WebRTC en ligne !");
});

io.on("connection", (socket) => {
  console.log("🟢 Client connecté :", socket.id);

  // 1. Un utilisateur rejoint une room
  socket.on("join", (room) => {
    socket.join(room);
    console.log(`👥 ${socket.id} a rejoint la room ${room}`);
    socket.to(room).emit("joined");
  });

  // 2. Un utilisateur envoie une offre SDP
  socket.on("offer", ({ room, offer }) => {
    console.log("📤 Offre reçue pour room :", room);
    socket.to(room).emit("offer", { offer });
  });

  // 3. Un utilisateur envoie une réponse SDP
  socket.on("answer", ({ room, answer }) => {
    console.log("📥 Réponse envoyée pour room :", room);
    socket.to(room).emit("answer", { answer });
  });

  // 4. Un utilisateur envoie un candidat ICE
  socket.on("candidate", ({ room, candidate }) => {
    socket.to(room).emit("candidate", { candidate });
  });

  socket.on("disconnect", () => {
    console.log("🔴 Client déconnecté :", socket.id);
  });
});

// Lancer le serveur
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});

