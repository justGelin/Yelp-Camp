const express    = require("express"),
 	  app        = express(),
	  User      = require("./models/user"),
 	  bodyParser = require("body-parser"),
	  passport = require("passport"),
 	  mongoose   = require("mongoose"),
	  Campground =	require("./models/campgrounds"),
	  Comment     = require("./models/comment"),
	  seedDB   	 = require("./seeds"),
	  LocalStrategy = require("passport-local");

mongoose.connect("mongodb://localhost:27017/yelp_camp", {useUnifiedTopology: true, useNewUrlParser: true});
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	next();
});

//================
// PASSPORT CONFIG
//================

app.use(require("express-session")({
	secret: "On the dark side of the moon",
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.get("/", (req, res) => {
    res.render("landing");
});

app.get("/campgrounds", (req, res) => {
	// GET ALL THE CAMPGROUNDS FROM THE DB 
	Campground.find({}, (err, allCampgrounds)=>{
		if(err){
			console.log(err);
		} else {
			res.render("campgrounds/INDEX", {campgrounds:allCampgrounds, currentUser:req.user});
		}
	});
});

//=================
//CAMPGROUND ROUTES
//=================

app.post("/campgrounds", (req, res) =>{
    //get data from form and add to campgrounds array
    const name = req.body.name;
    const image = req.body.image;
    const desc = req.body.description;
    const newCampGround = { name: name, image: image, description: desc }
    // Create & Save New Campground to DB
	Campground.create(newCampGround, (err, newlyCreated)=>{
		if(err){
			console.log(err);
		} else {
			//redirect back to campgrounds page
			res.redirect("/campgrounds");
		}
	});	
});

// NEW - show form to create new campground
app.get("/campgrounds/new", (req, res)=> {
    res.render("campgrounds/new");
});

// SHOW - shows more info about a specific campground
app.get("/campgrounds/:id", (req, res)=>{
	//Find the campground with provided ID
	Campground.findById(req.params.id).populate("comments").exec(function (err, foundCampground){
		if(err){
			console.log(err);
		} else {
			res.render("campgrounds/show", {campground: foundCampground});
		}
	});
});

// ======================
// COMMENTS ROUTE
// ======================

app.get("/campgrounds/:id/comments/new", isLoggedIn, function (req, res){ 
	Campground.findById(req.params.id, function(err, campground){
	if(err){
		console.log(err);
	} else {
		res.render("comments/new", {campground: campground});
	}
		
	});
});

app.post("/campgrounds/:id/comments", isLoggedIn, function(req, res){
	//look up campground using ID
	Campground.findById(req.params.id, function(err, campground){
		if(err){
			console.log(err);
			res.redirect("/campgrounds");
		}else {
			//create new comment
			Comment.create(req.body.comment, function(err,comment){
				if(err){
					console.log(err);
				} else {
					//associate new comment to campground 
					campground.comments.push(comment);
					campground.save();
					console.log("New Comment Added");
					//redirect back to campground show page
					res.redirect("/campgrounds/" + campground._id);
				}
			});
		}
	});
});
//================
// AUTH ROUTES
//================
app.get("/register", (req, res)=>{
	res.render("register");
});

app.post("/register", (req, res)=>{
	const newUser = new User ({username: req.body.username});
	User.register(newUser, req.body.password, (err, user)=>{
		if(err){
			console.log(err);
			return res.render("register");				
		} 
		passport.authenticate("local")(req, res,()=>{
			res.redirect("/campgrounds");
		});
	});
});

//====================
// LOGIN/LOGOUT ROUTES
//====================

app.get("/login", (req, res)=>{
	res.render("login");
});

app.post("/login", passport.authenticate("local", 
	{
		successRedirect: "/campgrounds",
		failureRedirect: "/login"
	}), (req, res)=>{
});

app.get("/logout", (req, res)=>{
	req.logout();
	console.log("USER LOGGED OUT");
	res.redirect("/campgrounds");
});

function isLoggedIn(req, res ,next){
	if(req.isAuthenticated()){
	   return next();
	   }
res.redirect("/login");
}

app.listen(3000, ()=> {
    console.log("//YELP SERVER HAS STARTED//");
});