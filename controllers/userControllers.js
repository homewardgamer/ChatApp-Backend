const protected = require("../middlewares/authMiddleware");

module.exports = (io, socket) => {

  const userJoin = (payload) => {
    io.use(protected);
    console.log("User Joined");
  };
  socket.on("connec", userJoin);
};
