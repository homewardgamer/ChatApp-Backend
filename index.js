const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middlewares/errorMiddleware");
const { createServer } = require("http");
const { Server } = require("socket.io");

// routers
const authRouter = require("./routers/authRouter");

// Update env vars from `.env` file
dotenv.config();

// controllers
const userControllers = require("./controllers/userControllers");

// Middleware
const { protected, protectedSocket } = require("./middlewares/authMiddleware");

const app = express();


// connect to mongodb
connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// attach api routes and handlers here
app.get("/", (_, res) => res.send("API active"));
app.use("/api/auth", authRouter);

app.use(notFound);
app.use(errorHandler);

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"],
  },
});

const onConnection = (socket) => {
  userControllers(io, socket);
};
io.use(protectedSocket);
io.on("connection", onConnection);

const PORT = process.env.PORT || 8000;
const server = httpServer.listen(PORT, () =>
  console.log(`Server listening on port ${PORT}`)
);

process.on("unhandledRejection", (err, _) => {
  console.log(`Logged error: ${err.message}`);
  server.close(() => process.exit(1));
});
