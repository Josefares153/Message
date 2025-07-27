const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.static("public"));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.get("/", (req, res) => {
  res.send("🟢 Serveur WebRTC en ligne !");
});

io.on("connection", (socket) => {
  console.log("🟢 Client connecté :", socket.id);

  socket.on("join", (room) => {
    socket.join(room);
    console.log(`👥 ${socket.id} a rejoint la room ${room}`);
    socket.to(room).emit("joined");
  });

  socket.on("offer", ({ room, offer }) => {
    console.log("📤 Offre reçue pour room :", room);
    socket.to(room).emit("offer", { offer });
  });

  socket.on("answer", ({ room, answer }) => {
    console.log("📥 Réponse envoyée pour room :", room);
    socket.to(room).emit("answer", { answer });
  });

  socket.on("candidate", ({ room, candidate }) => {
    socket.to(room).emit("candidate", { candidate });
  });

  socket.on("disconnect", () => {
    console.log("🔴 Client déconnecté :", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});
