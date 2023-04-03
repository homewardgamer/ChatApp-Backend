const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middlewares/errorMiddleware");

// Update env vars from `.env` file
dotenv.config();

const app = express();

// connect to mongodb
connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// attach api routes and handlers here

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, () =>
  console.log(`Server listening on port ${PORT}`)
);

process.on("unhandledRejection", (err, _) => {
  console.log(`Logged error: ${err.message}`);
  server.close(() => process.exit(1));
});
