const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const connect = await mongoose.connect(process.env.MONGO_URI, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      // useCreateIndex: true,
      // useFindAndModify: true,
    });
    console.log(`Mongo connected on ${connect.connection.host}:${connect.connection.port}`);
  } catch (error) {
    console.log(error);
  }
};

module.exports = connectDB;
