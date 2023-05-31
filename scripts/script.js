$(document).ready(function () {

    // Define variables
    var map;
    var mapOptions;
    var tweetLatidude;
    var tweetLongitude;
    var originAddress = '';
    var weatherLat = "54.9539916";
    var weatherLng = "-1.6083629";

    // Call initMap function
    initMap();

    function initMap() {

        // Define map options
        mapOptions = {
            center: new google.maps.LatLng(44.42329944115517, -13.346757230131919),
            zoom: 2.4,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            streetViewControl: true,
            overviewMapControl: false,
            rotateControl: false,
            scaleControl: false,
            panControl: false,
        };

        // Create new map object
        map = new google.maps.Map(document.getElementById("map-area"), mapOptions);

        // Create marker for Living Planet HQ
        const planetMarker = new google.maps.Marker({
            position: {
                lat: 54.9539916,
                lng: -1.6083629,
            },
            map,
            title: "Newcastle Upon Tyne, UK",
        });

        // Define content for Living's Planet HQ marker InfoWindow
        const contentInfoWindow =
            '<div id="content">' +
            '<div id="siteNotice">' +
            '</div>' +
            '<h1 id="firstHeading" class="firstHeading">' + "Newcastle Upon Tyne, UK" + '</h1>' +
            '<div id="bodyContent">' +
            '</div>' +
            '</div>';

        // Create InfoWindow for Living's Planet HQ marker
        const infoWindow = new google.maps.InfoWindow({
            content: contentInfoWindow,
            ariaLabel: "planetMarker",
        });

        // Add mouseover event listener to Living's Planet HQ marker which opens the marker
        planetMarker.addListener("mouseover", () => {
            infoWindow.open({
                anchor: planetMarker,
                map,
            });
        });

        // Add mouseout event listener to Living's Planet HQ marker which closes the marker
        planetMarker.addListener("mouseout", () => {
            infoWindow.close({
                anchor: planetMarker,
                map,
            });
        });

        planetMarker.addListener("click", () => {
            //Reset origin address
            originAddress = "";
            $('#origin-address').text("");
            $('#weather-location').text("Newcastle Upon Tyne, UK");
            // Retrieve weather information from GeoNames API using the latitude and longitude
            $.getJSON("https://api.open-meteo.com/v1/forecast?latitude=" + weatherLat + "&longitude=" + weatherLng + "&current_weather=true&daily=rain_sum&timezone=auto&forecast_days=1&daily=precipitation_probability_mean", function (result) {
                $("#temperature").text(result.current_weather.temperature + " Degrees Celsius");
                $("#windspeed").text(result.current_weather.windspeed + " km/h");
                $("#humidity").text(result.daily.rain_sum + " %");

            });
        });

        // Define marker icons
        const imageNetzero = {
            url: "styles/netzero.png",
            scaledSize: new google.maps.Size(30, 30)
        };

        const imageClimatechange = {
            url: "styles/climatechange.png",
            scaledSize: new google.maps.Size(30, 30)
        };

        const imageCombined = {
            url: "styles/combined.png",
            scaledSize: new google.maps.Size(30, 30)
        };

        // Get Twitter data
        $.getJSON("data/assignment_data.json", function (data) {

            // Create an empty array to store items
            var items = [];

            // Loop through each tweet in the data
            $.each(data.statuses, function (key, val) {

                // Check if the each tweet contains the hashtag "#netzero" or "#climatechange"
                if ((val.text.toLowerCase().includes("#netzero") || val.text.toLowerCase().includes("#climatechange"))) {

                    // Add the user's name and tweet text to the items array for each tweet
                    items.push("<dt style='margin-left : 30px; font-size : 18px'>" + "<strong>" + val.user.name + "</strong>" + "</dt>");
                    items.push("<dd style='margin-bottom : 25px'>" + val.text + "</dd>");

                    //Define function for creating marker
                    function createMarkerWithInfo(latitude, longitude, val) {
                        var markerIcon = '';
                        if (val.text.toLowerCase().includes("#climatechange")) {
                            markerIcon = imageClimatechange;
                        }
                        if (val.text.toLowerCase().includes("#netzero")) {
                            markerIcon = imageNetzero;
                        }
                        if (val.text.toLowerCase().includes("#netzero") && val.text.toLowerCase().includes("#climatechange")) {
                            markerIcon = imageCombined;
                        }

                        // Create a new marker for each tweet's location
                        let tweetMarker = new google.maps.Marker({
                            position: {
                                lat: latitude,
                                lng: longitude,
                            },
                            map,
                            // title: "Love marker",
                            icon: markerIcon,
                        });

                        // Create an info window to display the tweet's content
                        let contentInfoWindow =
                            '<div id="content">' +
                            '<div id="siteNotice">' +
                            '</div>' +
                            '<h1 id="firstHeading" class="firstHeading">' + val.user.name + '</h1>' +
                            '<div id="bodyContent">' +
                            '<p>' + val.text + '</p>' +
                            '<p>' + val.user.location + '</p>' +

                            '</div>' +
                            '</div>';
                        let infoWindow = new google.maps.InfoWindow({
                            content: contentInfoWindow,
                            ariaLabel: "Tweet content",
                        });

                        // Rest of the code for event listeners and API requests goes here
                        // ...

                        // Adds a 'click' event listener to a marker on a map
                        tweetMarker.addListener("click", () => {
                            // Updates the text of the origin-address HTML element 
                            $('#origin-address').text(val.user.location);
                            // Clears the error-message HTML element
                            document.getElementById("error-message").innerHTML = "";
                            // Assigns the value of a 'location' property of an object to a variable
                            originAddress = val.user.location;
                            // Clears the distance-info HTML element
                            document.getElementById("distance-info").innerHTML = "";
                            // Updates the text of the weather-location HTML element 
                            $('#weather-location').text(val.user.location);

                            // Gets the position of the clicked marker and assigns the latitude and longitude values to variables
                            var position = tweetMarker.getPosition();
                            var weatherTweetLat = position.lat();
                            var weatherTweetLng = position.lng();

                            // Makes a GET request to an external API with latitude and longitude values as parameters
                            $.getJSON("https://api.open-meteo.com/v1/forecast?latitude=" + weatherTweetLat + "&longitude=" + weatherTweetLng + "&current_weather=true&daily=rain_sum&timezone=auto&forecast_days=1&daily=precipitation_probability_mean", function (result) {
                                $("#temperature").text(result.current_weather.temperature + " Degrees Celsius");
                                $("#windspeed").text(result.current_weather.windspeed + " km/h");
                                $("#humidity").text(result.daily.rain_sum + " %");
                            });
                        });

                        // Adds a 'mouseover' event listener to each marker on the map which opens an infowindow
                        tweetMarker.addListener("mouseover", () => {
                            infoWindow.open({
                                anchor: tweetMarker,
                                map,
                            });
                        });

                        // Adds a 'mouseout' event listener to each marker on the map which closes the infowindow
                        tweetMarker.addListener("mouseout", () => {
                            infoWindow.close({
                                anchor: tweetMarker,
                                map,
                            });
                        });
                    }

                    // Check for different geolocation option
                    //location of the user
                    if (val.user.location) {
                        var geocoder = new google.maps.Geocoder();
                        var address = val.user.location;
                        //Geocode coordinates of the location
                        geocoder.geocode({ 'address': address }, function (results, status) {
                            if (status == google.maps.GeocoderStatus.OK) {
                                tweetLatidude = results[0].geometry.location.lat();
                                tweetLongitude = results[0].geometry.location.lng();
                                createMarkerWithInfo(tweetLatidude, tweetLongitude, val); //create marker
                            } else {
                                console.log("Geocode was not successful for the following reason: " + status);
                            }
                        });
                    }


                    //geolocation of user
                    if (val.user.geo_enabled && val.geo) {
                        // Use the coordinates provided in the tweet's 'geo' field
                        tweetLatidude = val.geo.coordinates[0];
                        tweetLongitude = val.geo.coordinates[1];
                        createMarkerWithInfo(tweetLatidude, tweetLongitude, val);//create marker

                    }

                    //geolocation of tweet
                    if (val.place && val.place.bounding_box) {
                        var coordinates = val.place.bounding_box.coordinates[0]; // Assuming the bounding box is a polygon
                        tweetLatidude = (coordinates[0][1] + coordinates[2][1]) / 2; // Calculate the average latitude
                        tweetLongitude = (coordinates[0][0] + coordinates[2][0]) / 2; // Calculate the average longitude
                        createMarkerWithInfo(tweetLatidude, tweetLongitude, val); //create marker
                    }


                }
            });
            //Append the tweets to the html file
            $("<dl/>", {
                "class": "tweet-list",
                html: items.join("")
            }).appendTo("#tweets");
        }).fail(function () {
            console.log("An error has occurred.");
        });
    }

    // Get the directions panel element and create a DirectionsService and DirectionsRenderer object
    var directionsPanel = document.getElementById("directionsPanel");
    var directionsService = new google.maps.DirectionsService();
    var directionsDisplay = new google.maps.DirectionsRenderer({
        panel: directionsPanel
    });

    // Retrieve weather information from GeoNames API using the latitude and longitude
    $.getJSON("https://api.open-meteo.com/v1/forecast?latitude=" + weatherLat + "&longitude=" + weatherLng + "&current_weather=true&daily=rain_sum&timezone=auto&forecast_days=1&daily=precipitation_probability_mean", function (result) {
        $("#temperature").text(result.current_weather.temperature + " Degrees Celsius");
        $("#windspeed").text(result.current_weather.windspeed + " km/h");
        $("#humidity").text(result.daily.rain_sum + " %");
    });

    // Listen for the click event on the submit button for directions
    $("#submit-button-directions").click(function () {
        // Remove any existing directions and panel
        directionsDisplay.setMap(null);
        directionsDisplay.setPanel(null);
        // Create a LatLng object for the destination
        var destinationAddress = new google.maps.LatLng(54.9539916, -1.6083629);

        if (originAddress !== '') {
            // Create a request object for the DirectionsService
            var travelMode = document.getElementById("travel-mode").value;
            var request;

            //Set up the request of the direction service based on travel mode
            if (travelMode === "driving") {
                request = {
                    origin: originAddress,
                    destination: destinationAddress,
                    travelMode: google.maps.TravelMode.DRIVING
                };
            } else if (travelMode === "walking") {
                request = {
                    origin: originAddress,
                    destination: destinationAddress,
                    travelMode: google.maps.TravelMode.WALKING
                };
            }


            // Call the DirectionsService to get the route information
            directionsService.route(request, function (response, status) {
                //Error handling
                if (status == google.maps.DirectionsStatus.OK) {
                    // If successful, remove any error message and display the directions on the map
                    document.getElementById("error-message").innerHTML = "";
                    directionsDisplay.setDirections(response);
                } else {
                    // If unsuccessful, display an error message
                    document.getElementById("error-message").innerHTML = "Can not retrieve journery details from this point";
                }
            });
            // Set the DirectionsRenderer to display the directions on the map and panel
            directionsDisplay.setMap(map);
            directionsDisplay.setPanel(document.getElementById("directionsPanel"));

            // Create a DistanceMatrixService object to get the distance and duration information
            var service = new google.maps.DistanceMatrixService();
            // Call the service with the origin and destination information

            //Set up distance matrix based on travel mode
            if (travelMode === "driving") {
                service.getDistanceMatrix(
                    {
                        origins: [originAddress],
                        destinations: [destinationAddress],
                        travelMode: google.maps.TravelMode.DRIVING,
                        unitSystem: google.maps.UnitSystem.IMPERIAL,
                        avoidHighways: true,
                        avoidTolls: true
                    }, callback);
            } else if (travelMode === "walking") {
                service.getDistanceMatrix(
                    {
                        origins: [originAddress],
                        destinations: [destinationAddress],
                        travelMode: google.maps.TravelMode.WALKING,
                        unitSystem: google.maps.UnitSystem.IMPERIAL,
                        avoidHighways: true,
                        avoidTolls: true
                    }, callback);
            }


            // Define a callback function to handle the response from the DistanceMatrixService
            function callback(response, status) {
                //Error handling
                if (status === "OK") {
                    var origins = response.originAddresses;
                    var destinations = response.destinationAddresses;

                    // Iterate through the origins and destinations to display the distance and duration information
                    $.each(origins, function (originIndex, origin) {
                        $.each(destinations, function (destinationIndex, destination) {
                            var element = response.rows[originIndex].elements[destinationIndex];
                            if (element.status === "OK") {
                                // Retrieve the distance and duration information from the response object
                                var distance = element.distance.text;
                                var duration = element.duration.text;

                                // Construct a string with the distance and duration information
                                var info = "From: " + origin + "<br>To: Living Planet HQ, Newcastle Upon Tyne " + "<br>Distance: " + distance + "<br>Duration: " + duration;

                                // Display the information on your web page
                                document.getElementById("distance-info").innerHTML = info;
                                document.getElementById("error-message").innerHTML = "";
                            } else {
                                console.log("Error: " + element.status);
                                document.getElementById("error-message").innerHTML = "Can not retrieve journery details from this point";
                            }
                        });
                    });
                } else {
                    console.log("Error: " + status);
                    document.getElementById("error-message").innerHTML = "Can not retrieve journery details from this point";
                }
            }
        }
        // Display an error message if no origin address has been selected
        else {
            document.getElementById("error-message").innerHTML = "No Tweet Selected";
        }
    });


    //Define actions when clear directions button is clicked
    $("#clear-directions").click(function () {
        // Remove the displayed directions from the map and panel
        directionsDisplay.setMap(null);
        directionsDisplay.setPanel(null);

        // Reset the origin address, error message, and distance info to empty strings
        $('#origin-address').text("");
        $('#error-message').text("");
        $('#distance-info').text("");
        originAddress = "";
    });
});


