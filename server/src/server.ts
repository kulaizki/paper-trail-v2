/* eslint-disable @typescript-eslint/no-explicit-any */
import dotenv from "dotenv";
dotenv.config({ path: ".env" });
import http from "http";
import app from "./app";
import env from "./config/env.config";
import { Server } from "socket.io";
import jwt, { VerifyErrors } from "jsonwebtoken";
import documentService from "./services/document.service";
import SocketEvent from "./types/enums/socket-events-enum";

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: env.FRONTEND_URL,
    methods: "*"
  }
});

server.listen(env.PORT, () => {
  console.log(`Server listening on port ${env.PORT}...`);
});

io.on("connection", (socket) => {
  const accessToken = socket.handshake.query.accessToken as string | undefined;
  const documentId = socket.handshake.query.documentId as string | undefined;

  if (!accessToken || !documentId) return socket.disconnect();
  else {
    jwt.verify(accessToken, env.ACCESS_TOKEN_SECRET, (err: VerifyErrors | null, decoded: unknown) => {
      const { id, fullName } = decoded as RequestUser;
      (socket as any).username = fullName;

      documentService
        .findDocumentById(parseInt(documentId), parseInt(id))
        .then(async (document) => {
          if (document === null) return socket.disconnect();

          socket.join(documentId);
          io.in(documentId)
            .fetchSockets()
            .then((clients) => {
              io.sockets.in(documentId).emit(
                SocketEvent.CURRENT_USERS_UPDATE,
                clients.map((client) => (client as any).username)
              );
            });

          socket.on(SocketEvent.SEND_COMMENT, (newComments) => {
            socket.broadcast.to(documentId).emit(SocketEvent.RECEIVE_COMMENT, newComments);
          });

          socket.on(SocketEvent.SEND_ASSIGNEE, (newAssigneeId) => {
            socket.broadcast.to(documentId).emit(SocketEvent.RECEIVE_ASSIGNEE, newAssigneeId);
          });

          socket.on(SocketEvent.SEND_STATUS, (newStatus) => {
            socket.broadcast.to(documentId).emit(SocketEvent.RECEIVE_STATUS, newStatus);
          });

          socket.on(SocketEvent.SEND_CHANGES, (rawDraftContentState) => {
            socket.broadcast.to(documentId).emit(SocketEvent.RECEIVE_CHANGES, rawDraftContentState);
          });

          socket.on("disconnect", async () => {
            socket.leave(documentId);
            socket.disconnect();
            io.in(documentId)
              .fetchSockets()
              .then((clients) => {
                io.sockets.in(documentId).emit(
                  SocketEvent.CURRENT_USERS_UPDATE,
                  clients.map((client) => (client as any).username)
                );
              });
          });
        })
        .catch((error) => {
          console.log(error);
          return socket.disconnect();
        });
    });
  }
});
