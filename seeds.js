const mongoose = require("mongoose"),
	  Campground = require("./models/campgrounds"),
	  Comment   = require("./models/comment");

const data = [
	{
		name: "Kipahulu Campground",
	 	image: "https://purewows3.imgix.net/images/articles/2019_04/Ki__772_pahulu_Campground_maui_hawaii.jpg?auto=format,compress&cs=strip",
		description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Eaque aliquam saepe beatae sapiente natus dolorum ad nostrum distinctio sequi, accusamus ipsum ab voluptas ex temporibus rerum illo praesentium aut perferendis."	
	},
	{
		name: "OZ Farm",
		image: "https://purewows3.imgix.net/images/articles/2019_04/oz_farm_mendocino_california.jpg?auto=format,compress&cs=strip",
		description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Amet, quia nam, vel ipsam doloremque, ipsum quo ratione magnam voluptates laborum tenetur, aut quod voluptatem quos eum in. Et, voluptatem recusandae?"
	},
	{
		name: "BARTLETT COVE CAMPGROUND",
		image: "https://purewows3.imgix.net/images/articles/2019_04/bartlett_cove_campground_glacier_bay_alaska.jpg?auto=format,compress&cs=strip", 
		description: "You’ll have to go on a short stroll to access Bartlett Cove Campground, a walk-in-only campsite in Glacier Bay, Alaska. Just make sure you bring layers and a Furnice!"
	},
	    {
        name: "Cloud's Rest", 
        image: "https://farm4.staticflickr.com/3795/10131087094_c1c0a1c859.jpg",
        description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Eaque aliquam saepe beatae sapiente natus dolorum ad nostrum distinctio sequi, accusamus ipsum ab voluptas ex temporibus rerum illo praesentium aut perferendis."
    }
] 

function seedDB(){
	//remove campgrounds
		Campground.deleteMany({}, (err)=>{
		if(err){
			console.log(err);
		}
		console.log("Removed Campground");
	//add a few campgrounds
	data.forEach(function(seed){
		Campground.create(seed, (err, campground)=>{
			if(err){
				console.log(err);
			} else {
				console.log("ADDED A CAMPGROUND!");
				//create a comment
				Comment.create(
					{
						text: "this place is great but the internet sucks ass crack",
						author: "your mama"
						
					}, (err, comment)=>{
						if(err){
							console.log(err);
						} else {
							campground.comments.push(comment);
							campground.save();
							console.log("Created New Comment!");
						}
					});
			}
		});	
	 });
		
  });
}

module.exports = seedDB;
