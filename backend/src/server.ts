import "dotenv/config";
import http from "http";
import app from "./app";
import { initSocket } from "./infrastructure/socket/SocketServer";

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

initSocket(server);

server.listen(PORT, () => {
  console.log(`Server corriendo en port ${PORT}`);
});



