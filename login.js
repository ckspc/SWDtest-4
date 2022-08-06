const mysql = require("mysql2");
const express = require("express");
const session = require("express-session");
const path = require("path");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");

const dbcon = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "swduser",
});

const app = express();

app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + "/login.html"));
});

app.post("/auth", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  if (username && password) {
    dbcon.query(
      "SELECT * FROM users WHERE username = ? AND password = ?",
      [username, password],
      (err, result, fields) => {
        if (result.length > 0) {
          req.session.login = true;
          req.session.username = username;
          res.redirect("/home");
        } else {
          res.send("Wrong username or password");
        }
        res.end();
      }
    );
  } else {
    res.send("Enter username password");
    res.end();
  }
});

app.post("/approve", (req, res) => {
  dbcon.connect((err) => {
    if (err) throw err;
    dbcon.query(
      `UPDATE users SET approve_status = 1 WHERE username = '${req.session.username}'`,
      (err, result) => {
        if (err) throw err;
        
      }
    );
  });
  res.redirect("/checkstatus");
});

const transport = nodemailer.createTransport({
  service: "hotmail",
  auth: {
    user: "execute159753@hotmail.com", 
    pass: "0965641765Choke", 
  },
});

const mailOptions = {
  from: 'Supachoke Punyaboon <execute159753@hotmail.com>', 
  to: "napat.s@swiftdynamics.co.th",
  subject: "Supachoke Punyaboon", 
  html: "<p><strong>สวัสดีครับ ผมศุภโชค ปัญญาบุญ</strong></p><p><strong>Hello I'm Supachoke Punyaboon</strong></p>"
};

app.get("/checkstatus", (req, res) => {
  dbcon.connect((err) => {
    if (err) throw err;
    dbcon.query(
      "SELECT COUNT(approve_status) FROM users WHERE approve_status =1;",
      function (err, rows, fields) {
        if (err) throw err;
        if (Object.values(rows[0])[0] == 3) {
          dbcon.query(
            "UPDATE users SET approve_status = 0 WHERE username IN ('user1','user2','user3')",
            function (err, rows, fields) {
              if (err) throw err;
              res.redirect("/sendEmail");
            }
          );
        }
      }
    );
  });
});

app.get("/sendEmail", (req, res) => {
  transport.sendMail(mailOptions, function (err, info) {
    if (err) console.log(err);
    else console.log(info);
  });
  res.send("Send Email Complete");
});

app.post("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

app.get("/home", (req, res) => {
  if (req.session.login) {
    res.sendFile(path.join(__dirname, "/home.html"));
  } else {
    res.send("plese login");
    res.end();
  }
});

app.listen(3000);
