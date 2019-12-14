const express = require("express"),
	  router = express.Router(),
	  Campground = require("../models/campgrounds"),
	  middleware = require("../middleware");
const NodeGeocoder = require('node-geocoder');
 
const options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};
 
var geocoder = NodeGeocoder(options);

router.get("/", function(req, res){
    var noMatch = null;
    if(req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        // Get all campgrounds from DB
        Campground.find({name: regex}, function(err, allCampgrounds){
           if(err){
               console.log(err);
           } else {
              if(allCampgrounds.length < 1) {
                  noMatch = "No campgrounds match that query, please try again.";
              }
              res.render("campgrounds/INDEX",{campgrounds:allCampgrounds, noMatch: noMatch});
           }
        });
    } else {
        // Get all campgrounds from DB
        Campground.find({}, function(err, allCampgrounds){
           if(err){
               console.log(err);
           } else {
              res.render("campgrounds/INDEX",{campgrounds:allCampgrounds, page: 'campgrounds', noMatch: noMatch});
           }
        });
    }
});

//CREATE 
router.post("/", middleware.isLoggedIn, (req, res) =>{
    //get data from form and add to campgrounds array
    const name = req.body.name;
    const price = req.body.price;
    const image = req.body.image;
    const desc = req.body.description;
	const author = {
		id: req.user._id,
		username: req.user.username
	}
	geocoder.geocode(req.body.location, function (err, data) {
    if (err || !data.length) {
	  console.log(err);
      req.flash('error', 'Invalid address');
      return res.redirect('back');
    }
    var lat = data[0].latitude;
    var lng = data[0].longitude;
    var location = data[0].formattedAddress;
    const newCampGround = { name: name, price: price, image: image, description: desc, author: author }
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
});

// NEW - show form to create new campground
router.get("/new", middleware.isLoggedIn, (req, res)=> {
    res.render("campgrounds/new");
});

// SHOW - shows more info about a specific campground
router.get("/:id", (req, res)=>{
	//Find the campground with provided ID
	Campground.findById(req.params.id).populate("comments").exec(function (err, foundCampground){
		if(err){
			console.log(foundCampground);
		} else {
			res.render("campgrounds/show", {campground: foundCampground});
		}
	});
});

//EDIT campgrounds
router.get("/:id/edit", middleware.checkCampgroundOwnership, (req, res)=>{
	Campground.findById(req.params.id, (err, foundCampground)=>{
		res.render("campgrounds/edit", {campground:foundCampground});
	});	
});

//UPDATE campgrounds
router.put("/:id", middleware.checkCampgroundOwnership, (req, res)=>{
	geocoder.geocode(req.body.location, function (err, data) {
    if (err || !data.length) {
	  console.log(err);
      req.flash('error', 'Invalid address');
      return res.redirect('back');
    }
    req.body.campground.lat = data[0].latitude;
    req.body.campground.lng = data[0].longitude;
    req.body.campground.location = data[0].formattedAddress;
	//find and update campground
	Campground.findByIdAndUpdate(req.params.id, req.body.campground, (err, updatedCampground)=>{
		if(err){
			res.redirect("/campgrounds");
		} else {
			res.redirect("/campgrounds/" + updatedCampground._id);
		}
	});
  });
});

// DESTROY CAMPGROUND ROUTE
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
   Campground.findByIdAndRemove(req.params.id, function(err){
      if(err){
          res.redirect("/campgrounds");
      } else {
          res.redirect("/campgrounds");
      }
   });
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;