document.addEventListener("DOMContentLoaded", function() {
    const YOUTUBE_API_KEY = 'AIzaSyCte6ZLHSesasLrSWH18VOdpRfjwpaRppo';
    const YELP_API_KEY = 'YOUR_YELP_API_KEY';
    const WEATHER_API_KEY = 'e5a40985f7ca9be298d5724a52032c79';

    // Handling form and budget calculation
    const featureButton = document.getElementById("featureButton");
    if (featureButton) {
        featureButton.addEventListener("click", function() {
            const formContainer = document.getElementById("formContainer");
            formContainer.style.display = formContainer.style.display === "none" ? "block" : "none";
        });
    }
    const touristForm = document.getElementById("touristForm");
    if (touristForm) {
        touristForm.addEventListener("submit", function(event) {
            event.preventDefault();
            const formData = new FormData(this);
            const data = {
                headName: formData.get("headName"),
                adults: Number(formData.get("adults")),
                children: Number(formData.get("children")),
                budget: Number(formData.get("budget")),
                travelStart: formData.get("travelStart"),
                travelEnd: formData.get("travelEnd")
            };

            fetch('/sign_up', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            .then(response => response.json())
            .then(filteredPlaces => {
                const placesContainer = document.getElementById('placesContainer');
                placesContainer.innerHTML = ''; // Clear existing places

                filteredPlaces.forEach(place => {
                    const placeBox = document.createElement('div');
                    placeBox.classList.add('box');
                    placeBox.innerHTML = `
                        <div class="face">
                            <h2>${place.place}</h2>
                            <p>Adult Price: $${place.price_adult}</p>
                            <p>Children Price: $${place.price_children}</p>
                        </div>
                    `;
                    placesContainer.appendChild(placeBox);
                });
            })
            .catch(error => console.error('Error:', error));
        });
    }

    // Handling API requests for YouTube, Yelp, and Weather
    const urlParams = new URLSearchParams(window.location.search);
    const placeName = urlParams.get('place') || document.getElementById("place-name")?.value;
    const location = urlParams.get('location') || document.getElementById("location")?.value;
    if (placeName && location) {
        fetchYouTubeVideos(placeName, 'video-container');
        fetchYelpRestaurants(location, 'restaurant-list');
        fetchWeatherData(location, 'weather-info');
    }
    function fetchYouTubeVideos(query, containerId) {
        fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&key=${YOUTUBE_API_KEY}&type=video&maxResults=3`)
            .then(response => response.json())
            .then(data => {
                const videoContainer = document.getElementById(containerId);
                videoContainer.innerHTML = ''; // Clear previous videos
                data.items.forEach(item => {
                    const videoFrame = document.createElement('iframe');
                    videoFrame.src = `https://www.youtube.com/embed/${item.id.videoId}`;
                    videoFrame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
                    videoFrame.allowFullscreen = true;
                    videoContainer.appendChild(videoFrame);
                });
            })
            .catch(error => console.error('Error fetching YouTube videos:', error));
    }
    function fetchYelpRestaurants(location, containerId) {
        fetch(`https://api.yelp.com/v3/businesses/search?location=${location}&categories=restaurants`, {
            headers: {
                Authorization: `Bearer ${YELP_API_KEY}`
            }
        })
            .then(response => response.json())
            .then(data => {
                const restaurantList = document.getElementById(containerId);
                restaurantList.innerHTML = ''; // Clear previous restaurants
                data.businesses.forEach(business => {
                    const listItem = document.createElement('li');
                    listItem.textContent = `${business.name} - ${business.rating} stars`;
                    restaurantList.appendChild(listItem);
                });
            })
            .catch(error => console.error('Error fetching Yelp restaurants:', error));
    }

    function fetchWeatherData(location, containerId) {
        fetch(`https://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&appid=${WEATHER_API_KEY}`)
            .then(response => response.json())
            .then(data => {
                const weatherInfo = document.getElementById(containerId);
                weatherInfo.textContent = `Temperature: ${data.main.temp}°C, Weather: ${data.weather[0].description}`;
            })
            .catch(error => console.error('Error fetching weather data:', error));
    }
});
