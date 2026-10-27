const tripForm = document.getElementById("tripForm");
const tripList = document.getElementById("tripList");
const budgetForm = document.getElementById("budgetForm");
const packingForm = document.getElementById("packingForm");

// Load saved data
let trips = JSON.parse(localStorage.getItem("tripTroveTrips")) || [];
let packingItems = JSON.parse(localStorage.getItem("tripTrovePacking")) || [];

function saveTrips() {
    localStorage.setItem("tripTroveTrips", JSON.stringify(trips));
}

function savePacking() {
    localStorage.setItem("tripTrovePacking", JSON.stringify(packingItems));
}

// Show a message
function showMessage(message) {
    alert(message);
}

// Create and display trips
function displayTrips() {
    if (!tripList) return;

    tripList.innerHTML = "";

    if (trips.length === 0) {
        tripList.innerHTML = "<p class='empty-message'>Your adventures start here. Plan your first trip! ✈️</p>";
        return;
    }

    trips.forEach((trip, index) => {
        const card = document.createElement("div");
        card.className = "trip-card";

        const title = document.createElement("h3");
        title.textContent = "📍 " + trip.destination;

        const details = document.createElement("p");
        details.textContent =
            `${trip.days} days · ${trip.travelers} traveller(s) · Budget ₹${trip.budget}`;

        const removeButton = document.createElement("button");
        removeButton.textContent = "Delete Trip";
        removeButton.type = "button";
        removeButton.addEventListener("click", () => {
            if (confirm("Do you want to delete this trip?")) {
                trips.splice(index, 1);
                saveTrips();
                displayTrips();
            }
        });

        card.append(title, details, removeButton);
        tripList.appendChild(card);
    });
}

if (tripForm) {
    tripForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const destination = document.getElementById("destination").value.trim();
        const days = Number(document.getElementById("days").value);
        const travelers = Number(document.getElementById("travelers").value);
        const budget = Number(document.getElementById("tripBudget").value);

        if (!destination || days < 1 || travelers < 1 || budget < 0) {
            showMessage("Please enter valid trip details.");
            return;
        }

        trips.push({ destination, days, travelers, budget });
        saveTrips();
        displayTrips();
        tripForm.reset();

        showMessage("Your trip has been saved! 🤎");
    });
}

// Budget calculator
if (budgetForm) {
    budgetForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const transport = Number(document.getElementById("transport").value) || 0;
        const hotel = Number(document.getElementById("hotel").value) || 0;
        const food = Number(document.getElementById("food").value) || 0;
        const activities = Number(document.getElementById("activities").value) || 0;
        const travelers = Math.max(
            1,
            Number(document.getElementById("budgetTravelers").value) || 1
        );

        const total = transport + hotel + food + activities;
        const perPerson = total / travelers;

        document.getElementById("totalBudget").textContent =
            "₹" + total.toLocaleString("en-IN");

        document.getElementById("perPerson").textContent =
            "₹" + perPerson.toLocaleString("en-IN", {
                maximumFractionDigits: 2
            });

        const result = document.getElementById("budgetResult");
        if (result) result.hidden = false;
    });
}

// Packing checklist
function displayPacking() {
    const packingList = document.getElementById("packingList");
    if (!packingList) return;

    packingList.innerHTML = "";

    packingItems.forEach((item, index) => {
        const li = document.createElement("li");

        const label = document.createElement("label");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = item.done;

        checkbox.addEventListener("change", () => {
            packingItems[index].done = checkbox.checked;
            savePacking();
            displayPacking();
        });

        const text = document.createElement("span");
        text.textContent = item.name;

        if (item.done) text.className = "packed";

        const removeButton = document.createElement("button");
        removeButton.type = "button";
        removeButton.textContent = "×";
        removeButton.setAttribute("aria-label", "Remove " + item.name);

        removeButton.addEventListener("click", () => {
            packingItems.splice(index, 1);
            savePacking();
            displayPacking();
        });

        label.append(checkbox, text);
        li.append(label, removeButton);
        packingList.appendChild(li);
    });
}

if (packingForm) {
    packingForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const input = document.getElementById("packingItem");
        const name = input.value.trim();

        if (!name) return;

        packingItems.push({ name, done: false });
        savePacking();
        displayPacking();
        input.value = "";
    });
}

// Itinerary planner
const itineraryForm = document.getElementById("itineraryForm");
const itineraryList = document.getElementById("itineraryList");

let itinerary = JSON.parse(localStorage.getItem("tripTroveItinerary")) || [];

function displayItinerary() {
    if (!itineraryList) return;

    itineraryList.innerHTML = "";

    itinerary.forEach((item, index) => {
        const card = document.createElement("div");
        card.className = "itinerary-card";

        const heading = document.createElement("h3");
        heading.textContent = `Day ${item.day}: ${item.place}`;

        const activity = document.createElement("p");
        activity.textContent = item.activity;

        const remove = document.createElement("button");
        remove.type = "button";
        remove.textContent = "Remove";
        remove.addEventListener("click", () => {
            itinerary.splice(index, 1);
            localStorage.setItem("tripTroveItinerary", JSON.stringify(itinerary));
            displayItinerary();
        });

        card.append(heading, activity, remove);
        itineraryList.appendChild(card);
    });
}

if (itineraryForm) {
    itineraryForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const day = Number(document.getElementById("itineraryDay").value);
        const place = document.getElementById("itineraryPlace").value.trim();
        const activity = document.getElementById("itineraryActivity").value.trim();

        if (day < 1 || !place || !activity) {
            showMessage("Please fill in all itinerary details.");
            return;
        }

        itinerary.push({ day, place, activity });
        itinerary.sort((a, b) => a.day - b.day);

        localStorage.setItem("tripTroveItinerary", JSON.stringify(itinerary));
        displayItinerary();
        itineraryForm.reset();
    });
}

// Smooth navigation
document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener("click", function (event) {
        const target = document.querySelector(this.getAttribute("href"));

        if (target) {
            event.preventDefault();
            target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    });
});

// Initial display
displayTrips();
displayPacking();
displayItinerary();
