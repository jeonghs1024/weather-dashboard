var searchFormEl = document.getElementById("search-form");
var cityInputEl = document.getElementById("city");
var searchedEl = document.getElementById("searches");
var uI = document.getElementById("uv-index");
var cities = JSON.parse(localStorage.getItem("cities")) || [];

// loads city to recent searches
recent();

// submit handler for choosing a city
var formSubmitHandler = function (event) {
  event.preventDefault();

  var cityname = cityInputEl.value.trim();

  if (cityname) {
    getCityWeather(cityname);
    cityInputEl.value = "";
  } else {
    alert("Please enter a valid city");
  }
  // saves city to local storage on click
  saveCities(cityname);
};

// save city and display as recent search
var saveCities = function (cityname) {
  var savedCities = { city: cityname };
  cities.push(savedCities);
  localStorage.setItem("cities", JSON.stringify(cities));
  const cityButton = document.createElement("button");
  cityButton.classList.add("city-button");
  cityButton.innerText = cityname;
  $("#searches").append(cityButton);
};

// load recent searches function
function recent() {
  for (let index = 0; index < cities.length; index++) {
    const makeButton = document.createElement("button");
    makeButton.classList.add("city-button");
    makeButton.innerText = cities[index].city;
    $("#searches").append(makeButton);
  }
}

// diplsay recent search weather on click
function searched(event) {
  event.target;
  getCityWeather(event.target.innerText);
}

// gets city weather data and returns lat + lon + cityName to be used in displayCityWeather()
let getCityWeather = function (cityname) {
  let apiUrl =
    "https://api.openweathermap.org/data/2.5/weather?q=" +
    cityname +
    "&units=imperial&appid=28da97f6c34c725f70e79aba45588612";
  fetch(apiUrl).then(function (response) {
    if (response.ok) {
      response.json().then(function (data) {
        lat = data.coord.lat;
        lon = data.coord.lon;
        cityName = data.name;
        displayCityWeather();
        return lat + lon + cityName;
      });
    }
  });
};

// gets city 5 day data and displays current weather to screen. Returns 5 day data to be used in displayFiveDay()
let displayCityWeather = function () {
  fetch(
    "https://api.openweathermap.org/data/2.5/onecall?lat=" +
      lat +
      "&lon=" +
      lon +
      "&exclude=hourly&units=imperial&appid=28da97f6c34c725f70e79aba45588612"
  ).then(function (response) {
    if (response.ok) {
      response.json().then(function (data) {
        fiveDayData = data;
        $("#city-name-header").text(
          cityName + " (" + moment().format("l") + ")"
        );
        // create icon and append to city name header
        var icon = data.current.weather[0].icon;
        var iconEl = document.createElement("img");
        iconEl.classList.add("icon");
        iconEl.src = "http://openweathermap.org/img/wn/" + icon + "@2x.png";
        $("#city-name-header").append(iconEl);

        $("#temp").text("Temp: " + Math.round(data.current.temp) + " °F");
        $("#wind").text("Wind: " + data.current.wind_speed + " MPH");
        $("#humidity").text("Humidity: " + data.current.humidity + " %");
        $("#uv-index").text("UV Index: " + data.current.uvi);

        // add UI INDEX colors
        if (data.current.uvi < 3) {
          uI.classList.add("favorable");
          uI.classList.remove("moderate");
          uI.classList.remove("severe");
        } else if (data.current.uvi > 3 && data.current.uvi < 5) {
          uI.classList.add("moderate");
          uI.classList.remove("severe");
          uI.classList.remove("favorable");
        } else
          uI.classList.add("severe"),
            uI.classList.remove("moderate"),
            uI.classList.remove("favorable");

        // call 5 day function
        displayFiveDay();
        return fiveDayData;
      });
    }
  });
};

// displays 5 day data on screen
let displayFiveDay = function () {
  console.log(fiveDayData);

  var dailyRow = document.getElementById("daily-row");

  while (dailyRow.firstChild) {
    dailyRow.removeChild(dailyRow.firstChild);
  }

  for (let index = 0; index < fiveDayData.daily.length; index++) {
    let i = fiveDayData.daily[index];

    // create card
    var card = document.createElement("div");
    // card.setAttribute("id", index);
    card.classList.add("weather-card");

    // add date to card
    var todayDateEl = document.createElement("h1");
    todayDateEl.setAttribute("id", [index + 1]);
    var iD = todayDateEl.getAttribute("id");
    var fiveDate = moment().add(iD, "day").format("l");
    todayDateEl.innerText = fiveDate;
    card.appendChild(todayDateEl);

    // add icon to card
    var icon = i.weather[0].icon;
    var iconEl = document.createElement("img");
    iconEl.src = "http://openweathermap.org/img/wn/" + icon + "@2x.png";
    card.appendChild(iconEl);

    // add temp to card
    var temp = i.temp.day;
    var tempEl = document.createElement("p");
    tempEl.innerText = "Temp: " + Math.round(temp) + " °F";
    card.appendChild(tempEl);

    // add wind to card
    var wind = i.wind_speed;
    var windEl = document.createElement("p");
    windEl.innerText = "Wind: " + wind + " MPH";
    card.appendChild(windEl);

    // add humidity to card
    var humidity = i.humidity;
    var humidityEl = document.createElement("p");
    humidityEl.innerText = "Humidity: " + humidity + " %";
    card.appendChild(humidityEl);

    $("#daily-row").append(card);
    if (index === 4) {
      return;
    }
  }
};

searchedEl.addEventListener("click", searched);
searchFormEl.addEventListener("submit", formSubmitHandler);
