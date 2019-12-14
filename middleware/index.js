const Campground = require("../models/campgrounds");
const Comment = require("../models/comment");

const middlewareObj = {}


middlewareObj.checkCampgroundOwnership = function(req, res, next){
 if(req.isAuthenticated()){
	Campground.findById(req.params.id, function(err, foundCampground){
	   if(err || !foundCampground){
		   console.log(err);
		   req.flash("error", "Campground Not Found");
		   res.redirect("back");
	   }  else {
		   // does user own the campground?
		if(foundCampground.author.id.equals(req.user._id) || req.user.isAdmin) {
			req.campground = foundCampground;
			next();
		} else {
			req.flash("error", "You Don't Have Access");
			res.redirect("back");
		}
	   }
	});
} else {
	res.redirect("back");
    }
}

middlewareObj.checkCommentOwnership = function(req, res, next){
 if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id, function(err, foundComment){
           if(err || !foundComment){
               res.redirect("back");
           }  else {
               // does user own the comment?
            if(foundComment.author.id.equals(req.user._id) || req.user.isAdmin) {
				req.comment = foundComment;
                next();
            } else {
				req.flash("error", "You Don't Have Access");
                res.redirect("back");
            }
           }
        });
    } else {
		req.flash("error", "Must be Logged In");
        res.redirect("back");
    }
}

middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
	req.flash("error", "Must be Logged In");
    res.redirect("/login");
}

module.exports = middlewareObj;