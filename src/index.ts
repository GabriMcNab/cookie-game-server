import http from "http";
import { Server } from "socket.io";

const server = http.createServer();
const io = new Server(server);

io.on("connection", () => {
  console.log("A user connected");
});

server.listen("5000", () => {
  console.log("Server listening on PORT 5000");
});
