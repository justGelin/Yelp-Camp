const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/user");

router.get("/", (req, res) => {
    res.render("landing");
});

router.get("/register", (req, res)=>{
	res.render("register", {page: 'register'});
});

router.post("/register", (req, res)=>{
	let newUser = new User ({
			username: req.body.username, 
			firstName: req.body.firstName,
			lastName: req.body.lastName,
		 	email: req.body.email
		});
	if(req.body.adminCode === process.env.ADMIN_PASSWORD){
		newUser.isAdmin = true;
	}
	User.register(newUser, req.body.password, (err, user)=>{
		if(err){
    		console.log(err);
    		return res.render("register", {error: err.message});
		}	
		passport.authenticate("local")(req, res,()=>{
			req.flash("success", "Welcome to YelpCamp " + user.username);
			res.redirect("/campgrounds");
		});
	});
});

//====================
// LOGIN/LOGOUT ROUTES
//====================

router.get("/login", (req, res)=>{
	res.render("login", {page: 'login'});
});

router.post("/login", passport.authenticate("local", 
	{
		successRedirect: "/campgrounds",
		failureRedirect: "/login"
	}), (req, res)=>{
});

router.get("/logout", (req, res)=>{
	req.logout();
	req.flash("success", "Logged Out");
	res.redirect("/campgrounds");
});

//USER PROFILE
router.get("/users/:id", (req, res)=>{
	User.findById(req.params.id, (err, foundUser)=>{
		if(err){
			req.flash("error", "Something Went Wrong, Cannot Find User");
			res.redirect("back");
		} else {
			res.render("users/show", {user: foundUser});	
		}
	});
});

module.exports = router;