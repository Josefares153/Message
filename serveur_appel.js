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
  socket.on("register", (username) => {
    utilisateursConnectes[username] = socket.id;
    socket.username = username;
  });

  socket.on("appel_utilisateur", ({ to, from }) => {
    const destSocketId = utilisateursConnectes[to];
    if (destSocketId) {
      io.to(destSocketId).emit("appel_recu", { from });
    } else {
      socket.emit("erreur_appel", `${to} n'est pas en ligne.`);
    }
  });

  socket.on("appel_accepte", ({ from }) => {
    const fromSocketId = utilisateursConnectes[from];
    if (fromSocketId) io.to(fromSocketId).emit("appel_accepte_par", { by: socket.username });
  });

  socket.on("appel_refuse", ({ from }) => {
    const fromSocketId = utilisateursConnectes[from];
    if (fromSocketId) io.to(fromSocketId).emit("appel_refuse_par", { by: socket.username });
  });

  socket.on("disconnect", () => {
    if (socket.username) {
      delete utilisateursConnectes[socket.username];
    }
  });
});

server.listen(process.env.PORT || 3001, () => {
  console.log("Serveur d'appel WebRTC démarré.");
});
