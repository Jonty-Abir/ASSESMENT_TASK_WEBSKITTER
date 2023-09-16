const mongoose = require("mongoose");

function connection() {
  mongoose
    .connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("DB Connection successfull.... :)");
    })
    .catch((err) => console.log("Connection Faild.... :(", err));
}

module.exports = { connection };
