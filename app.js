require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
// const bcrypt = require("bcrypt");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.use(session({
  secret: "Ourlittlesecret",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

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

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function(req,res){
  res.render("home");
});

app.post("/register", function(req, res){
  User.register({username: req.body.username}, req.body.password, function(err, user){
    if(err){
      console.log(err);
      res.redirect("/register");
    }else{
      passport.authenticate("local")(req, res, function(){
        res.redirect("/secrets");
      });
    }
  });
});

app.get("/secrets", function(req, res){
  if(req.isAuthenticated()){
    res.render("secrets");
  }else{
    res.redirect("/login");
  }
});

app.post("/login", function(req, res){
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  req.login(user, function(err){
    if(err){
      console.log(err);
      res.redirect("/login");
    }else{
      passport.authenticate("local")(req, res, function(){
        res.redirect("/secrets");
      });
    }
  });
});


app.route("/login")

.get(function(req,res){
  res.render("login");
});

app.route("/register")

.get(function(req,res){
  res.render("register");
});

app.get("/logout", function(req, res){
  req.logout(function(err){
    if(err){
      console.log(err);
    }else{
      res.redirect("/");
    }
  });
});

/****************************EXPRESS EJS RENDERING***********************/
// .post(function(req, res){
//   const username = req.body.username;
//   const password = req.body.password;
//
//   User.findOne({email: username}, function(err, foundUser){
//     if(err){
//       console.log(err);
//     }else{
//       if(foundUser){
//         bcrypt.compare(password, foundUser.password, function(err, result){
//           if(result === true){
//             res.render("secrets");
//           }
//         });
//       }
//     }
//   });
// });


/****************************EXPRESS EJS RENDERING***********************/

// .post(function(req, res){
//
//   bcrypt.hash(req.body.password, 10, function(err, hash){
//     const newUser = new User({
//       email: req.body.username,
//       password: hash
//     });
//
//     newUser.save(function(err){
//       if(!err){
//         res.render("secrets")
//       }else{
//         console.log(err);
//       }
//     });
//   });
// });

app.listen(3000, function(){
  console.log("Successfully started server on port 3000");
});
