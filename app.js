const express    = require("express"),
 	  app        = express(),
 	  bodyParser = require("body-parser"),
 	  mongoose   = require("mongoose"),
	  Campground =	require("./models/campgrounds"),
	  Comment     = require("./models/comment"),
	  seedDB   	 = require("./seeds");


mongoose.connect("mongodb://localhost:27017/yelp_camp", {useUnifiedTopology: true, useNewUrlParser: true});
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.render("landing");
});

app.get("/campgrounds", (req, res) => {
	// GET ALL THE CAMPGROUNDS FROM THE DB 
	Campground.find({}, (err, allCampgrounds)=>{
		if(err){
			console.log(err);
		} else {
			res.render("INDEX.ejs", {campgrounds:allCampgrounds});
		}
	});
});

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
    res.render("new");
});

// SHOW - shows more info about a specific campground
app.get("/campgrounds/:id", (req, res)=>{
	//Find the campground with provided ID
	Campground.findById(req.params.id).populate("comments").exec(function (err, foundCampground){
		if(err){
			console.log(err);
		} else {
			console.log(foundCampground);
			res.render("show", {campground: foundCampground});
		}
	});
});

app.listen(3000, ()=> {
    console.log("//YELP SERVER HAS STARTED//");
});