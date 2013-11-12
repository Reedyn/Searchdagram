/* Searchdagram - jQuery instagram search engine
Requires jQuery to function
Made by Gustav Lindqvist (http://gustavlindqvist.se)
*/

(function(){

	var	feedAmount = 12;
	var searchString = "";
	var searchType = "";
	var loading = false;
	var nextUrl = "";
	var feed = new Array();

	$(document).ready(function() {
		$('#search').keypress(function (e) {                                       
		   if (e.which == 13) {
				e.preventDefault();
				Search();
		   }
		});
		
		$("#loadMore").hide();
		$(".spinner").hide();
		$("#loadMore").click(function(event) { /* Load more images when pressing #loadMore button */
			loadMoreImages(searchString);
		});
	});

	$(window).scroll(function () { /* Load more images when scroll reaches 200px from bottom of page */
	   if ($(window).scrollTop() >= $(document).height() - $(window).height() - 200) {
		  if (loading == false && searchString != "popular") { /* Only call function if it isn't already loading images and the search isn't for "popular" */
			loadMoreImages(searchString);
		  }
	   }
	});

	function Search(){ /* Grabs the searchstring and calls the corresponding function */
		$('#errorBox').hide();
		$('#feed').empty();
		nextUrl = "";
		loading = false;
		currentPage = "0";
		searchString = $('#search').val().toLowerCase(); /* Get searchstring and convert to lowercase */
		
		if(searchString == ""){
			DisplayError("");
		} else if (searchString == "popular") {
			SearchByPopular();
		} else {
			SearchByTag(searchString);
		}
	}

	function SearchByPopular(){ /* Returns a list of popular images */
		$('#feed').empty();
		$.ajax({
			type: "GET",
			dataType: "jsonp",
			cache: false,
			url: "https://api.instagram.com/v1/media/popular?client_id=c168cd3293d544aca220f7c749cbac0c"
					
		}).done(function AddImagesToFeed(data){ /* If successful add the images to the feed */
			if (data.data.length > 0) {
				for (var i = 0; i < 12; i++) {
					feed.push(new Image(data.data[i].link, data.data[i].images.low_resolution.url, data.data[i].created_time, new User(data.data[i].user.id, data.data[i].user.username, data.data[i].user.full_name, data.data[i].user.profile_picture)));
				}
									
				for (var n = 0; n < 12; n++) {
					$('#feed').append('<div class="instagram-object"> <img src="' + feed[n].imageUrl + '" width="616px" height="616px"  alt=""/> <div class="instagram-data"> <a class="image-url" href="' + feed[n].url + '" target="_blank"> <span class="user">@' + feed[n].user.name + '</span> <span class="user-avatar"> <img src="' + feed[n].user.avatar + '" alt="Avatar for ' + feed[n].user.fullName + '" /> </span> </a> </div> </div>');
				}
			} else {
				DisplayError('Popular Images')
			}
		});
				
	}

	function SearchByTag(tag){ /* Returns a list of images with a certain tag */
		$('#feed').empty();
		$('.spinner').show();
		$('#loadMore').hide();
		$.ajax({
			timeout: 2000,
			type: "GET",
			dataType: "jsonp",
			cache: false,
			url: "https://api.instagram.com/v1/tags/" + tag + "/media/recent?&client_id=c168cd3293d544aca220f7c749cbac0c",
			error: function(data){
				$('#errorBox').show();
				$('#error').show();
				$('error').html('Your search - <strong id="errorMessage"></strong> - did not return any results.');
				$('#errorMessage').html(searchString);
				$('.spinner').hide();
			}
		}).done(function (data){ /* If successful add images to feed */
			if (data.data[1] != null) {
				
				for (var i = 0; i < 12; i++) {
					feed.push(new Image(data.data[i].link, data.data[i].images.low_resolution.url, data.data[i].created_time, new User(data.data[i].user.id, data.data[i].user.username, data.data[i].user.full_name, data.data[i].user.profile_picture)));
				}				
				for (var n = 0; n < 12; n++) {
					$('#feed').append( '<div class="instagram-object"> <img src="' + feed[n].imageUrl + '" width="616px" height="616px"  alt=""/> <div class="instagram-data"> <a class="image-url" href="' + feed[n].url + '" target="_blank"> <span class="user">@' + feed[n].user.name + '</span> <span class="user-avatar"> <img src="' + feed[n].user.avatar + '" alt="Avatar for ' + feed[n].user.fullName + '" /> </span> </a> </div> </div>');
				}
				$('.spinner').hide();
				$('#loadMore').show();
				feed.length = 0;
				nextUrl = data.pagination.next_url;
			} else {
				DisplayError(searchString);
			}
			
		});
	}

	function loadMoreImages(tag) { /* Load more images from current search */
			$('.spinner').show();
			$('#loadMore').hide();
			loading = true;
			$.ajax({
				type: "GET",
				dataType: "jsonp",
				cache: false,
				url: nextUrl
						
			}).done(function (data){ /* If successful add images to feed */
				for (var i = 0; i < 12; i++) {
					feed.push(new Image(data.data[i].link, data.data[i].images.low_resolution.url, data.data[i].created_time, new User(data.data[i].user.id, data.data[i].user.username, data.data[i].user.full_name, data.data[i].user.profile_picture)));
				}
				if (nextUrl == data.pagination.next_url) {
					console.log("end of scroll");
				} else {
				for (var n = 0; n < 12; n++) {
					$('#feed').append( '<div class="instagram-object"> <img src="' + feed[n].imageUrl + '" width="616px" height="616px"  alt=""/> <div class="instagram-data"> <a class="image-url" href="' + feed[n].url + '" target="_blank"> <span class="user">@' + feed[n].user.name + '</span> <span class="user-avatar"> <img src="' + feed[n].user.avatar + '" alt="Avatar for ' + feed[n].user.fullName + '" /> </span> </a> </div> </div>');
				}
				feed.length = 0;
				nextUrl = data.pagination.next_url;
				loading = false;
				$('.spinner').hide();
				$('#loadMore').show();
				}
				
			});
	}

	function DisplayError(search) { /* Display error */
		$('#errorBox').show();
		$('#error').show();
		$('.spinner').hide();
		if (search == "" || search == null) {
			$('error').html('You did not search for anything');
		} else {
			$('error').html('Your search - <strong id="errorMessage"></strong> - did not return any results.');
			$('#errorMessage').html(search);
		}
		


	}

	function Image(url, imageUrl, time, user) { /* Constructor for the image object */
		this.url = url;
		this.imageUrl = imageUrl;
		this.time = time;
		this.user = user;
	}

	function User (id, name, fullName, avatar) { /* Constructor for the user object */
		this.id = id;
		this.name = name;
		this.fullName = fullName;
		this.avatar = avatar;
	}

})()