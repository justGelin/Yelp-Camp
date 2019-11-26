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

seedDB();

app.get("/", (req, res) => {
    res.render("landing");
});

app.get("/campgrounds", (req, res) => {
	// GET ALL THE CAMPGROUNDS FROM THE DB 
	Campground.find({}, (err, allCampgrounds)=>{
		if(err){
			console.log(err);
		} else {
			res.render("campgrounds/INDEX", {campgrounds:allCampgrounds});
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

app.get("/campgrounds/:id/comments/new", function (req, res){ 
	Campground.findById(req.params.id, function(err, campground){
	if(err){
		console.log(err);
	} else {
		res.render("comments/new", {campground: campground});
	}
		
	});
});

app.post("/campgrounds/:id/comments", function(req, res){
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

app.listen(3000, ()=> {
    console.log("//YELP SERVER HAS STARTED//");
});