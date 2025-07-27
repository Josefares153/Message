// serveur_appel.js - Serveur Node.js pour appels directs entre utilisateurs

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const utilisateursConnectes = {}; // username -> socket.id

io.on("connection", (socket) => {
  console.log("🔌 Nouveau client :", socket.id);

  // Étape 1 : enregistrement du username
  socket.on("register", (username) => {
    utilisateursConnectes[username] = socket.id;
    socket.username = username;
    console.log("✅ Utilisateur enregistré :", username);
  });

  // Étape 2 : appel lancé vers un autre utilisateur
  socket.on("appel_utilisateur", ({ to, from }) => {
    const destSocketId = utilisateursConnectes[to];
    if (destSocketId) {
      io.to(destSocketId).emit("appel_recu", { from });
      console.log(`📞 Appel de ${from} vers ${to}`);
    } else {
      socket.emit("erreur_appel", `${to} n'est pas en ligne`);
    }
  });

  // Étape 3 : acceptation de l'appel (par l'appelé)
  socket.on("appel_accepte", ({ from }) => {
    const fromSocketId = utilisateursConnectes[from];
    if (fromSocketId) {
      io.to(fromSocketId).emit("appel_accepte_par", { by: socket.username });
    }
  });

  // Étape 4 : refus de l'appel
  socket.on("appel_refuse", ({ from }) => {
    const fromSocketId = utilisateursConnectes[from];
    if (fromSocketId) {
      io.to(fromSocketId).emit("appel_refuse_par", { by: socket.username });
    }
  });

  // Déconnexion : suppression de la map
  socket.on("disconnect", () => {
    if (socket.username) {
      console.log("❌ Déconnecté :", socket.username);
      delete utilisateursConnectes[socket.username];
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log("🚀 Serveur d'appel WebRTC lancé sur port", PORT);
});
