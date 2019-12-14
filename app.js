require('dotenv').config();

const express    = require("express"),
 	  app        = express(),
	  User       = require("./models/user"),
 	  bodyParser = require("body-parser"),
	  passport = require("passport"),
 	  mongoose   = require("mongoose"),
	  flash		 = require("connect-flash"),
	  methodOverride = require("method-override"),
	  Campground =	require("./models/campgrounds"),
	  Comment    = require("./models/comment"),
	  seedDB   	 = require("./seeds"),
	  LocalStrategy = require("passport-local");

const commentRoutes = require("./routes/comments"),
	  campgroundRoutes = require("./routes/campgrounds"),
	  authRoutes = require("./routes/auth.js");

mongoose.connect("mongodb://localhost:27017/yelp_camp", {useUnifiedTopology: true, useCreateIndex: true, useNewUrlParser: true});

app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");

app.use(express.static(__dirname + "/public"));

app.use(methodOverride("_method"));

app.use(flash());

app.use(require("express-session")({
	secret: "On the dark side of the moon",
	resave: false,
	saveUninitialized: false
}));

app.locals.moment = require('moment');

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
});

app.use("/", authRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);

app.listen(3000, ()=> {
    console.log("//YELP SERVER HAS STARTED//");
});