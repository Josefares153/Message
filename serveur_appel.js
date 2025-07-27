const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const path = require("path");

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
  res.sendFile(path.join(__dirname, "public", "call.html"));
});

io.on("connection", (socket) => {
  console.log("🟢 Nouveau client :", socket.id);

  socket.on("join", ({ room, user }) => {
    socket.join(room);
    socket.to(room).emit("incoming", `📞 Appel de ${user}`);
    socket.emit("joined", `✅ Connecté à la salle ${room}`);
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

  socket.on("disconnect", () => {
    console.log("🔴 Déconnecté :", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("🚀 Serveur WebRTC lancé sur http://localhost:" + PORT);
});
