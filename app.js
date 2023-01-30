const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption")

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

const secret = "Thisisourlittlesecret";
userSchema.plugin(encrypt, {secret: secret, encryptedFields:["password"]});

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
    if(foundUser){
      if(foundUser.password === password){
        console.log(foundUser.password);
        res.render("secrets");
      }else{
        res.render(err);
      }
    }
  });
});

app.route("/register")

.get(function(req,res){
  res.render("register");
})

.post(function(req, res){

  const newUser = new User({
    email: req.body.username,
    password: req.body.password
  });
  newUser.save(function(err){
    if(!err){
      res.render("secrets")
    }else{
      console.log(err);
    }
  });
  console.log(newUser);
});

app.listen(3000, function(){
  console.log("Successfully started server on port 3000");
});