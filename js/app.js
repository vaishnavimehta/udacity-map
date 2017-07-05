//Array of locations consisting of name of park, wikipedia link, coordinates, a variable thats tells if location is selected and
//a variable that determines if location is being displayed.
var locations = [
  {
    place: "Periyar National Park",
    lat: 9.4622,
    lng: 77.2368,
    is_selected: false,
    displayed: true,
  },
  {
    place: "Desert National Park",
    lat: 26.9157,
    lng: 70.9083,
    is_selected: false,
    displayed: true,
  },
  {
    place: "Simlipal National Park",
    lat: 21.5931,
    lng: 86.2945,
    is_selected: false,
    displayed: true,
  },
  {
    place: "Gangotri National Park",
    lat: 30.9426,
    lng: 79.1549,
    is_selected: false,
    displayed: true,
  },
  {
    place: "Khangchendzonga National Park",
    lat: 27.6672,
    lng: 88.3246,
    is_selected: false,
    displayed: true,
  },
  {
    place: "Sundarbans National Park",
    lat: 21.8670,
    lng: 88.8915,
    is_selected: false,
    displayed: true,
  },
  {
    place: "Jim Corbett National Park",
    lat: 29.5300,
    lng: 78.7747,
    is_selected: false,
    displayed: true,
  },
  {
    place: "Manas National Park",
    lat: 26.7460,
    lng: 91.0203,
    is_selected: false,
    displayed: true,
  },
  {
    place: "Great Himalayan National Park",
    lat: 31.6412,
    lng: 77.3865,
    is_selected: false,
    displayed: true,
  },
  {
    place: "Tadoba Andhari Tiger Project",
    lat: 20.1938,
    lng: 79.3400,
    is_selected: false,
    displayed: true,
  },
  {
    place: "Bandipur National Park",
    lat: 11.6656,
    lng: 76.6285,
    is_selected: false,
    displayed: true,
  },
  {
    place: "Pench National Park",
    lat: 21.7630,
    lng: 79.3391,
    is_selected: false,
    displayed: true,
  },
  {
    place: "Gir Forest National Park",
    lat: 21.1243,
    lng: 70.8242,
    is_selected: false,
    displayed: true,
  }
];

//viewModel function has many things which will be explained in it.
var viewModel = function () {
  var self = this;
  self.marker_array = [];
  self.search_results = ko.observable();
  self.error_msg = ko.observable();
  //the loop given below creates a Marker by name parkMarker with title, latitude, longitude, position, show, select, map(chooses map
  //to display marker on) and animation. Then it pushes markers to marker_array and shows it.
  for (var i = 0; i < locations.length; i++) {
    var parkMarker = new google.maps.Marker({
      title: locations[i].place,
      lat: locations[i].lat,
      lng: locations[i].lng,
      position: { lat: locations[i].lat, lng: locations[i].lng },
      //icon : image;
      displayed: ko.observable(locations[i].displayed),
      select: ko.observable(locations.is_selected),
      map: map,
      animation: google.maps.Animation.DROP
    });
    self.marker_array.push(parkMarker);
    var l = self.marker_array.length - 1;
    self.marker_array[l].setVisible(self.marker_array[l].displayed());
  }
  //getting description of location from wikipedia API using ajax method
  self.wiki_info = function (parkMarker) {
    $.ajax({
      type: "GET",
      url: 'https://en.wikipedia.org/w/api.php' +
      '?action=opensearch' +
      '&search=' + parkMarker.title +          // search query
      '&limit=1' +          // return only the first result
      '&namespace=0' +         // search only articles, ignoring Talk, Mediawiki, etc.
      '&format=json',
      dataType: "jsonp",
      success: function (data) {    //success function works when above connection is successfull.
        console.log('Data from Wiki', data);
        var result = data[2][0];
		var linkwiki = data[3][0];
        parkMarker.description = result;
		parkMarker.linkwiki = linkwiki;
      },
      error: function (e) {      //success function works when above connection fails.
        self.error_msg("Error encountered. check connection and reload.");
      }
    });
  };

  //Following loop add click event to markers
  for (i = 0; i < self.marker_array.length; i++) {
    (function (parkMarker) {
      self.wiki_info(parkMarker);
      parkMarker.addListener('click', function () {
        self.select_marker(parkMarker);
      });
    })(self.marker_array[i]);
  }

  //function for searching parks.
  self.find = function () {
    markerDesc.close();
    var res = self.search_results();
    if (res.length === 0) {
      self.display_all(true);
    } else {
      for (var i = 0; i < self.marker_array.length; i++) {
        if (self.marker_array[i].title.toLowerCase().indexOf(res.toLowerCase()) > -1) {
          self.marker_array[i].setVisible(true);
          self.marker_array[i].displayed(true);
        } else {
          self.marker_array[i].setVisible(false);
          self.marker_array[i].displayed(false);
        }
      }
    }
    markerDesc.close();
  };

  //Following function shows results of search.
  self.display_all = function (displayed) {
    for (var i = 0; i < self.marker_array.length; i++) {
      self.marker_array[i].setVisible(displayed);
      self.marker_array[i].displayed(displayed);
    }
  };

  //function to unmark all markers.
  self.unmarked = function () {
    for (var i = 0; i < self.marker_array.length; i++) {
      self.marker_array[i].select(false);
    }
  };

  //selects markers.
  self.select_marker = function (parkMarker) {
    self.unmarked();
    parkMarker.select(true);
    self.present = parkMarker;
    //creates a description using the one extracted from wikipedia API.
    finalDescription = function () {
      if (self.present.description === "" || self.present.description === undefined) {
        return "sorry!! Data not found";
      }
      else {
        return "<b>Description: </b>" + self.present.description;
      }
    };
	//creates a link using one extracted using wikipedia API
	finallink = function () {
      if (self.present.linkwiki === "" || self.present.linkwiki === undefined) {
        return "sorry!! Data not found";
      }
      else {
        return "<b>Wikipedia Link: </b>" + self.present.linkwiki;
      }
    };
    //creates a variable using all information about location and then sets content.
    var resinfo = "<b>Name: </b>" + self.present.title + "<br>" + "<b>Lat: </b>" + self.present.lat + "<br><b>Lng: </b>" + self.present.lng + "<br>" + finalDescription() + "<br>"+finallink() ;
    markerDesc.setContent(resinfo);
    markerDesc.open(map, parkMarker);

    //gives d bounce animation to marker when clicked
    self.animatemark = function (parkMarker) {
      parkMarker.setAnimation(google.maps.Animation.BOUNCE);
      //sets animation to null after 8000ms.
      setTimeout(function () {
        parkMarker.setAnimation(null);
      }, 1400);
    };
    self.animatemark(parkMarker);
  };
};

//initializes google map API.
var map;
function init() {
	map = new google.maps.Map(document.getElementById('map'), {
	zoom: 4,
	center: { lat: 20.5937, lng: 78.9629 },
	});
	markerDesc = new google.maps.InfoWindow();
	ko.applyBindings(new viewModel());         //calls viewMODEL()
}
//error handelling
function errorAlert() {
	window.alert("Error encountered!!! Please try again later!!!");
}