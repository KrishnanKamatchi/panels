// const mongoose = require("mongoose");
const schema = require("../database/schema");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

class user {
  constructor(parent) {
    this.parent = parent;
    this.db = parent.db;
  }

  signup(data) {
    return new Promise((resolve, reject) => {
      let docs = new schema(data);

      docs
        .save()
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  getAllUsers() {
    return new Promise((resolve, reject) => {
      schema
        .find()
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  checkUserVerfied(data) {
    return new Promise((resolve, reject) => {
      schema
        .findOne({
          mail: data.mail,
          password: data.password,
        })
        .then((res) => {
          resolve(res.verified ? true : false);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  verfiUser({ mail, password }) {
    return new Promise((resolve, reject) => {
      schema
        .updateOne(
          {
            mail: mail,
            password: password,
          },
          {
            verified: true,
          }
        )
        .then((res) => {
          resolve(res ? true : false);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  mailer({ username, password, from, to }) {
    return new Promise((resolve, reject) => {
      // We can use any secure token don't mind the below one.
      const securetoken = jwt.sign(
        { username, password },
        "Krishnan_Nodejs_SecureToken",
        { expiresIn: "1h" }
      );

      const transporter = nodemailer.createTransport({
        service: "gmail", //smtp server service add here
        auth: {
          user: username, //your smtp user login name
          pass: password, //and your password here
        },
      });

      // We can use any email-templates as well/

      const mailOptions = {
        from: from,
        to: to,
        subject: "Email verification",
        text: `Hello ${username},\n\nPlease verify your email by clicking on the link below:\nhttp://localhost:3000/verify?token=${securetoken}`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
          reject(error);
        } else {
          resolve(info);
        }
      });
    });
  }
}

module.exports = (parent) => new user(parent);
