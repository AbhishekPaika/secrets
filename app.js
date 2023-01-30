require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");


const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//connect to MongoDB by specifying port to access MongoDB server
main().catch(err => console.log(err));

async function main() {
mongoose.set('strictQuery', false);
await mongoose.connect("mongodb://localhost:27017/userDB");
}

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

const User = new mongoose.model("User", userSchema);

app.get("/", function(req,res){
  res.render("home");
});

app.route("/login")

.get(function(req,res){
  res.render("login");
})

.post(function(req, res){
  const username = req.body.username;
  const password = req.body.password;

  User.findOne({email: username}, function(err, foundUser){
    if(err){
      console.log(err);
    }else{
      if(foundUser){
        bcrypt.compare(password, foundUser.password, function(err, result){
          if(result === true){
            res.render("secrets");
          }
        });
      }
    }
  });
});

app.route("/register")

.get(function(req,res){
  res.render("register");
})

.post(function(req, res){

  bcrypt.hash(req.body.password, 10, function(err, hash){
    const newUser = new User({
      email: req.body.username,
      password: hash
    });

    newUser.save(function(err){
      if(!err){
        res.render("secrets")
      }else{
        console.log(err);
      }
    });
  });
});

app.listen(3000, function(){
  console.log("Successfully started server on port 3000");
});
