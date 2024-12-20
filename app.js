// For Filter-Button Toggling
document.addEventListener("DOMContentLoaded", () => {
  const filterButton = document.querySelector(".filter");
  const filterOptions = document.querySelectorAll(".filterOptions");

  filterButton.addEventListener("click", () => {
    filterOptions.forEach((option) => {
      if (option.style.display === "block") {
        option.style.display = "none";
      } else {
        option.style.display = "block";
      }
    });
  });
});

// getting the relevent HTML element 
const locationBtn = document.querySelector(".location-btn button");
const searchBar = document.querySelector(".search");
const restaurantContainer = document.querySelector(".restaurant-container");
const ratingFilters = document.querySelectorAll(".rating-filter .dropdown-item");
const distanceFilter = document.querySelector(".distance-filter .dropdown-item");
const cafesFilter = document.querySelector(".cafes-filter");
const restaurantFilter = document.querySelector(".restaurant-filter");

let restaurantData = [];  // To store the response from the JSON API in Array
let activeFilter = null;  // Track active type filter ('cafe' or 'restaurant')

const CON_URL = "https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_208,h_208,c_fit/";

// Utility function to create restaurant cards
function createRestaurantCard(data) {
  // Determine the class based on the restaurant type
  let typeClass = "";
  if (data.type.toLowerCase() === "cafe") {
    typeClass = "cafe";
  } else if (data.type.toLowerCase() === "restaurant") {
    typeClass = "restaurant";
  }

  return `
    <div class="col-12 col-sm-6 col-md-4 col-lg-3 restaurant-card">
      <a href="${data.cta.mapLink}" target="_blank">
        <div class="card">
          <div class="row restaurant-image-details">

            <!------- Image Section ------->
            <div class="col-6 col-sm-12 px-2 px-sm-3 restaurant-image position-relative">
              <img src="${CON_URL + data.cloudinaryImageId}" alt="${data.name}" class="img-fluid"/>
              <div class="card-img-overlay">
                <p class="restaurant-type m-0 ${typeClass}">${data.type}</p>
              </div>
            </div>

            <!------- Detail Section ------->
            <div class="col-6 col-sm-12 px-2 px-sm-3 restaurant-details">
              <div class="card-body p-1 pt-2 mb-2">
                <h5 class="restaurant-name m-0">${data.name}</h5>
                <p class="restaurant-locality m-0">${data.areaName}</p>
                <div class="rating-price">
                  <p class="restaurant-rating m-0"><i class="fa-solid fa-star"></i>${data.avgRatingString}</p>
                  <p class="restaurant-distance ms-4 ms-sm-5 mb-0 ">${data.distanceInMeters}m</p>                  
                </div>
                <p class="restaurant-total-rating m-0 mt-1">${data.totalRatingsString} ratings</p>
              </div>              
            </div>

          </div>
        </div>
      </a>
    </div>
  `;
}

// Function to display restaurants in the container
function displayRestaurants(restaurants) {
  restaurantContainer.innerHTML = "";
  restaurants.forEach((restaurant) => {
    restaurantContainer.innerHTML += createRestaurantCard(restaurant.info);
  });
}

// Fetch restaurant data
async function fetchRestaurantData() {
  try {
    const response = await fetch("mockdata.json");
    restaurantData = await response.json();
    restaurantContainer.innerHTML = `<h3 class="loading-data">Loading Data ...</h3>`
    setTimeout(() => {
      displayRestaurants(restaurantData);
    }, 3000)
  } catch (error) {
    console.error("Error fetching restaurant data:", error);
  }
}

// Geolocation functionality
locationBtn.addEventListener("click", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log("User Location : ", position.coords);
        fetchRestaurantData();
      },
      (error) => {
        console.error("Geolocation error : ", error);
      }
    );
  } else {
    alert("Geolocation is not supported by your browser.");
  }
});

// Search functionality
searchBar.addEventListener("keyup", (event) => {
  const query = event.target.value.toLowerCase().trim();
  let filteredData = restaurantData.filter((restaurant) => {
    const { name, type } = restaurant.info;
    return (
      name.toLowerCase().includes(query) ||
      (type && type.toLowerCase().includes(query))
    );
  });

  // Display "Not Found" message if no results are found
  if (filteredData.length === 0) {
    restaurantContainer.innerHTML = `<h3 class="not-found-data">Not Found !</h3>`;
  } else {
    displayRestaurants(filteredData);
  }

  // Clear search input when "Enter" key is pressed
  if (event.key === "Enter") {
    searchBar.value = "";
  }
});

// Apply active filters to the data
function applyFilters() {
  let filteredData = [...restaurantData];

  // Filter by type (Cafe/Restaurant)
  if (activeFilter) {
    filteredData = filteredData.filter(
      (restaurant) => restaurant.info.type === activeFilter
    );
  }

  // Sort by rating
  const activeRatingFilter = document.querySelector(
    ".rating-filter .dropdown-item.active"
  );
  if (activeRatingFilter) {
    const index = [...ratingFilters].indexOf(activeRatingFilter);
    filteredData.sort((a, b) => {
      const ratingA = parseFloat(a.info.avgRatingString);
      const ratingB = parseFloat(b.info.avgRatingString);
      if (ratingA === ratingB) {
        const totalRatingsA = parseInt(
          a.info.totalRatingsString.replace(/\D/g, "")
        );
        const totalRatingsB = parseInt(
          b.info.totalRatingsString.replace(/\D/g, "")
        );
        return index === 0
          ? totalRatingsA - totalRatingsB
          : totalRatingsB - totalRatingsA;
      }
      return index === 0 ? ratingA - ratingB : ratingB - ratingA;
    });
  }

  // Sort by distance
  if (distanceFilter.classList.contains("active")) {
    filteredData.sort(
      (a, b) => a.info.distanceInMeters - b.info.distanceInMeters
    );
  }

  displayRestaurants(filteredData);
}

// Cafes filter
cafesFilter.addEventListener("click", () => {
  activeFilter = "cafe";
  applyFilters();
});

// Restaurants filter
restaurantFilter.addEventListener("click", () => {
  activeFilter = "restaurant";
  applyFilters();
});

// Rating filter
ratingFilters.forEach((filter, index) => {
  filter.addEventListener("click", () => {
    ratingFilters.forEach((item) => item.classList.remove("active"));
    filter.classList.add("active");
    applyFilters();
  });
});

// Distance filter
if (distanceFilter) {
  distanceFilter.addEventListener("click", () => {
    distanceFilter.classList.toggle("active");
    applyFilters();
  });
}

// Reset filters
function resetFilters() {
  activeFilter = null;
  ratingFilters.forEach((filter) => filter.classList.remove("active"));
  distanceFilter.classList.remove("active");
  displayRestaurants(restaurantData);
}

