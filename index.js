// Adding some dependencies
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const bodyParser = require("body-parser");
const process = require("process");
const mongoose = require("mongoose");

// Initializing express
const app = express();

class Panel {
  constructor() {
    this.PORT = process.env.PORT || 3000;
    this.initMethod();
  }

  initMethod() {
    this.initMiddleWare();
    this.intiateDatabase();
    this.iniateControllers();
    this.intiateServer();
    this.intiateRoutes();
  }

  initMiddleWare() {
    app.use(cors());
    app.use(helmet());
    app.use(bodyParser.json());
  }

  intiateDatabase() {
    this.db = require("./database");
    this.db.connectdb();
    // db.closedb();

    mongoose.connection.on("error", (err) => {
      console.log(err);
      throw err;
    });
  }

  iniateControllers() {
    // console.log(this.db);
    this.userController = require("./controllers/users")(this);
  }

  intiateServer() {
    app.listen(this.PORT, (err) => {
      if (err) {
        console.log(err);
        throw err;
      }

      console.log(`Server started on port ${this.PORT}`);
    });
  }

  intiateRoutes() {
    const userRouter = require("./routes/user")(this.userController);
    const routes = [
      {
        rootPath: "/api/v1/users",
        route: userRouter.routeIt(),
      },
    ];

    routes.forEach(({ rootPath, route }) => {
      app.use(rootPath, route);
    });
  }
}

new Panel();
