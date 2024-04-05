const mongoose = require("mongoose");

class database {
  constructor() {
    // this.connectdb();
    this.server = "mongodb://127.0.0.1:27017/";
    this.collection = "panels";
  }

  connectdb() {
    mongoose.connect(`${this.server}${this.collection}`).then(() => {
      //   console.log("Connected!");
    });
  }

  closedb() {
    mongoose.disconnect().then(() => console.log("Disconnected!"));
  }
}

module.exports = new database();
