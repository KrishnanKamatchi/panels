const express = require("express");
const joi = require("joi");
const multer = require("multer");
const router = express.Router();
const path = require("path");
const jwt = require("jsonwebtoken");
const upload = multer({
  // eslint-disable-next-line no-undef
  dest: path.resolve(path.join(__dirname, "../profiles/")),
});

class user {
  constructor(module) {
    this.userControllers = module.parent.userController;
    this.routeSpecificMiddleware();
  }

  routeSpecificMiddleware() {
    router.use("/", (req, res, next) => {
      next();
    });

    router.post("/signup", (req, res) => {
      try {
        const schema = joi.object({
          name: joi
            .string()
            .min(3)
            .max(10)
            .alphanum()
            .required()
            .error(new Error("Invalid name")),
          mail: joi
            .string()
            .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
            .required()
            .error(new Error("Invalid Customer Mail")),
          phno: joi
            .string()
            .pattern(/^[0-9]+$/)
            .length(10)
            .required()
            .error(new Error("Invalid Customer Phone Number")),
          password: joi
            .string()
            .pattern(
              /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,15}$/
            )
            .required()
            .error(
              new Error("Invalid Customer Password, Password not strong enough")
            ),
          cpassword: joi
            .string()
            .valid(joi.ref("password"))
            .required()
            .error(new Error("Confirm Password and password not matched")),
        });

        const isValid = schema.validate(req.body);

        if (isValid.error) {
          throw isValid.error;
        }

        if (isValid.error == null) {
          let phnoStarts = parseInt(req.body.phno.toString().charAt(0));

          const phnoStartSchema = joi
            .number()
            .integer()
            .min(6)
            .max(9)
            .error(
              new Error(
                "Invalid Customer Phone Number, Must starts with 6 or 7 or 8 or 9"
              )
            );

          const isValid = phnoStartSchema.validate(phnoStarts);

          if (isValid.error) {
            throw isValid.error;
          }
        }

        this.userControllers.signup(req.body);

        res.send("signup successful");
      } catch (err) {
        res.status(400).send(err.message);
        return;
      }
    });

    router.post("/uploadprofile", upload.single("profile"), (req, res) => {
      res.json({ code: 200, message: "Profile uploaded successfully" });
      res.end();
    });

    router.get("/getAll", async (req, res) => {
      let data = await this.userControllers.getAllUsers();
      res.send(data);
      return;
    });

    router.post("/signin", async (req, res) => {
      const schema = joi.object({
        mail: joi
          .string()
          .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
          .required()
          .error(new Error("Invalid Customer Mail")),
        password: joi
          .string()
          .pattern(
            /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,15}$/
          )
          .required()
          .error(
            new Error("Invalid Customer Password, Password not strong enough")
          ),
      });

      const isValid = schema.validate(req.body);

      if (isValid.error) {
        throw isValid.error;
      }

      const isVerified = await this.userControllers.checkUserVerfied(req.body);

      if (isVerified) {
        res.json({ code: 200, message: "signin successful" });
        res.end();
        return;
      } else {
        res.json({ code: 400, message: "User not verified" });
        res.end();
        return;
      }
    });

    router.get("/verification/:token", async (req, res) => {
      const token = req.params.token;
      // We can set this as ENV as well if you want OR We can use any hashes
      const tokenData = jwt.verify(token, "Krishnan_Nodejs_SecureToken");
      const mail = tokenData.username;
      const password = tokenData.password;

      const isVerified = await this.userControllers.verfiUser({
        mail,
        password,
      });

      if (isVerified) {
        res.json({ code: 200, message: "User verified" });
        res.end();
        return;
      } else {
        res.json({ code: 400, message: "User not verified" });
        res.end();
        return;
      }
    });
  }

  routeIt() {
    return router;
  }
}

module.exports = (parent) => new user(parent);
