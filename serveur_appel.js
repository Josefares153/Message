const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname)));

io.on("connection", socket => {
  console.log("🟢 Utilisateur connecté :", socket.id);

  socket.on("join", room => {
    socket.join(room);
    socket.to(room).emit("ready");
  });

  socket.on("offer", (room, offer) => {
    socket.to(room).emit("offer", offer);
  });

  socket.on("answer", (room, answer) => {
    socket.to(room).emit("answer", answer);
  });

  socket.on("ice-candidate", (room, candidate) => {
    socket.to(room).emit("ice-candidate", candidate);
  });

  socket.on("disconnect", () => {
    console.log("🔴 Déconnecté :", socket.id);
  });
});

const PORT = process.env.PORT || 3002;
server.listen(PORT, () => {
  console.log(`🚀 Serveur WebRTC en ligne sur http://localhost:${PORT}`);
});
