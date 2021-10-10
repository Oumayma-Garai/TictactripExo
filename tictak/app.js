const express = require("express");
const mongoose = require("mongoose");
const { userInfo } = require("os");
const jwt = require('jsonwebtoken');
const app = express();
const User = require("./user");
var bodyParser = require('body-parser');

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
  autoIndex: false, // Don't build indexes
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  family: 4, // Use IPv4, skip trying IPv6
  auto_reconnect: true,
};
const JWT_SECRET = "70469e0d-200f-4834-8f35"
mongoose
  .connect("mongodb://localhost:27017/tictactrip", options)
  .then(() => console.log("connected to mongodb ..."))
  .catch((err) => console.error("could not connect to mongodb ...", err));

const port = 5000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post("/api/token", async (req, res) => {
  let email = req.body.email;
  const token = jwt.sign({ email:email }
    ,JWT_SECRET
    );
  try {
    let usr = await User.findOne({ email }).exec();
    if (!usr) {
      const created_user = new User({
        email: email,
        usedWords: 0,
      });
      usr = await created_user.save();
    }

    res.send({ token });
  } catch (error) {
    console.log(error);
    
    res.send({ error });
  }
  
});

app.get("/", async (req, res) => {});
app.use(bodyParser.text());

app.post("/api/justify", async (req, res) => {
  try {
    let tokenData = jwt.verify(req.headers.authorization.split(" ")[1],JWT_SECRET);
    // next();
    if (tokenData) {
      let email = tokenData.email;
      let usr = await User.findOne({ email });
      let today = new Date()
      var dd = today.getDate();
      var mm = today.getMonth() ;
  
      var yyyy = today.getFullYear();
      
      let date = usr.updatedAt
      
      if((date.getDate() != dd) || (date.getMonth() != mm ) || (date.getFullYear() != yyyy)){
        usr.usedWords = 0 ;
      }
      const text = req.body;
      console.log("text ",text);
      
      let mots = text.split(" ");
      let nbWords = mots.length;
      if (usr.usedWords + nbWords < 80000) {
        usr.usedWords = usr.usedWords + nbWords;
        usr.save();

        let cp = 0;
        let index = [];
        let justifyText = [];

        while (cp < text.length) {
          cp += 80;
          if (cp < text.length) {
            index.push(cp);
            if((text[cp] != " ") && (text[cp+1] != " ")){
              justifyText.push(text.slice(cp - 80, cp-1)+"-");
              cp = cp - 1
            }else{
              justifyText.push(text.slice(cp - 80, cp));
            }
            
          }
        }

        justifyText.push(text.slice(cp-80, text.length));

        var finalText = justifyText.join("\n");
        res.send(finalText);
      } else {
        res.status(402).json({ msg: "Payment Required" });
      }
    }
  } catch (error) {
    return res.status(401).json({ msg: "auth failed" });
  }
});

app.listen(port, () => {
  console.log(`listening port ${port}`);
});
