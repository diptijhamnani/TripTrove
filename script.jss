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

// TripTrove: Save data in this browser
const getData = key =>
  JSON.parse(localStorage.getItem("tripTrove_" + key) || "[]");

const putData = (key, data) =>
  localStorage.setItem("tripTrove_" + key, JSON.stringify(data));

function showItems(id, items, format) {
  const box = document.getElementById(id);
  box.replaceChildren();

  items.forEach((item, index) => {
    const card = document.createElement("div");
    const text = document.createElement("p");
    text.textContent = format(item);
    const remove = document.createElement("button");
    remove.textContent = "Delete";

    remove.onclick = () => {
      items.splice(index, 1);
      putData(id, items);
      showItems(id, items, format);
    };

    card.append(text, remove);
    box.append(card);
  });
}

function saveNote() {
  const title = document.getElementById("noteTitle").value.trim();
  const text = document.getElementById("noteText").value.trim();

  if (!title || !text) return alert("Enter a title and note.");

  const notes = getData("notes");
  notes.push({ title, text });
  putData("notes", notes);
  showItems("notesList", notes, n => n.title + ": " + n.text);

  document.getElementById("noteTitle").value = "";
  document.getElementById("noteText").value = "";
}

function saveReminder() {
  const text = document.getElementById("reminderText").value.trim();
  const date = document.getElementById("reminderDate").value;

  if (!text || !date) return alert("Enter a reminder and date.");

  const reminders = getData("reminders");
  reminders.push({ text, date, notified: false });
  putData("reminders", reminders);
  showItems("remindersList", reminders,
    r => r.text + " — " + new Date(r.date).toLocaleString());

  document.getElementById("reminderText").value = "";
}

function saveTrip() {
  const name = document.getElementById("saveTripName").value.trim();
  const place = document.getElementById("saveTripPlace").value.trim();
  const date = document.getElementById("saveTripDate").value;

  if (!name || !place || !date)
    return alert("Enter the trip name, destination and date.");

  const trips = getData("savedTripsList");
  trips.push({ name, place, date });
  putData("savedTripsList", trips);
  showItems("savedTripsList", trips,
    t => t.name + " — " + t.place + " — " + t.date);

  document.getElementById("saveTripName").value = "";
  document.getElementById("saveTripPlace").value = "";
  document.getElementById("saveTripDate").value = "";
}

function calculateBudget() {
  const budget = Number(document.getElementById("tripBudget").value);
  const spent = Number(document.getElementById("tripSpent").value);
  const result = document.getElementById("budgetResult");

  if (budget <= 0 || spent < 0 ||
      document.getElementById("tripBudget").value === "" ||
      document.getElementById("tripSpent").value === "") {
    result.textContent = "Enter a valid budget and amount spent.";
    return;
  }

  const remaining = budget - spent;
  result.textContent = remaining >= 0
    ? `Remaining: ₹${remaining.toLocaleString("en-IN")}`
    : `Over budget by ₹${Math.abs(remaining).toLocaleString("en-IN")}`;
}

// Restore saved items after refreshing
showItems("notesList", getData("notes"), n => n.title + ": " + n.text);
showItems("remindersList", getData("reminders"),
  r => r.text + " — " + new Date(r.date).toLocaleString());
showItems("savedTripsList", getData("savedTripsList"),
  t => t.name + " — " + t.place + " — " + t.date);

// Reminder alerts while the website is open
function checkTripReminders() {
  const reminders = getData("reminders");
  let changed = false;

  reminders.forEach(r => {
    if (!r.notified && new Date(r.date).getTime() <= Date.now()) {
      alert("Trip reminder: " + r.text);
      r.notified = true;
      changed = true;
    }
  });

  if (changed) putData("reminders", reminders);
}

checkTripReminders();
setInterval(checkTripReminders, 30000);

document.addEventListener("DOMContentLoaded", () => {
  // 1. Save trips in browser
  const saveButtons = document.querySelectorAll(
    "#saveTrip, .save-trip"
  );

  saveButtons.forEach(button => {
    button.addEventListener("click", () => {
      const trip = {
        destination:
          document.querySelector("#destination")?.value || "My Trip",
        date: document.querySelector("#travelDate")?.value || "",
        budget:
          document.querySelector("#budget")?.value || "0",
        savedAt: new Date().toLocaleDateString()
      };

      const trips = JSON.parse(
        localStorage.getItem("tripTroveTrips") || "[]"
      );

      trips.push(trip);
      localStorage.setItem(
        "tripTroveTrips",
        JSON.stringify(trips)
      );

      alert("Your trip has been saved! ✈️");
    });
  });

  // 2. Destination card animation
  document.querySelectorAll(".location-card").forEach(card => {
    card.addEventListener("click", event => {
      if (event.target.closest("a")) return;
      card.classList.toggle("selected");
    });
  });

  // 3. Destination search
  const search = document.querySelector("#destinationSearch");

  if (search) {
    search.addEventListener("input", () => {
      const query = search.value.toLowerCase();

      document.querySelectorAll(".location-card").forEach(card => {
        card.style.display = card.textContent
          .toLowerCase()
          .includes(query) ? "" : "none";
      });
    });
  }

  // 4. Smooth scrolling for section links
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener("click", event => {
      const target = document.querySelector(link.getAttribute("href"));

      if (target) {
        event.preventDefault();
        target.scrollIntoView({ behavior: "smooth" });

document.addEventListener("DOMContentLoaded", () => {
  // WORLD MAP
  const map = L.map("worldMap").setView([20, 0], 2);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);

  const places = [];
  const list = document.getElementById("destinationList");

  function addDestination(name, lat, lng) {
    if (places.some(p => p.name === name)) return;

    places.push({ name, lat, lng });

    L.marker([lat, lng]).addTo(map)
      .bindPopup(name);

    const item = document.createElement("li");
    item.textContent = name;
    list.appendChild(item);
  }

  // Click the map to add a destination
  map.on("click", e => {
    const name = prompt("Name this location:");
    if (name && name.trim()) {
      addDestination(name.trim(), e.latlng.lat, e.latlng.lng);
    }
  });

  // Search any place using OpenStreetMap
  document.getElementById("addPlace").onclick = async () => {
    const input = document.getElementById("placeName");
    const name = input.value.trim();
    if (!name) return;

    try {
      const url = "https://nominatim.openstreetmap.org/search?format=json&limit=1&q="
        + encodeURIComponent(name);

      const response = await fetch(url);
      const results = await response.json();

      if (!results.length) {
        alert("Location not found. Try another place.");
        return;
      }

      const p = results[0];
      addDestination(name, Number(p.lat), Number(p.lon));
      map.setView([p.lat, p.lon], 7);
      input.value = "";
    } catch {
      alert("Could not load location. Please try again.");
    }
  };

  // UPLOAD AND PREVIEW PHOTOS
  const photoInput = document.getElementById("tripPhotos");
  const gallery = document.getElementById("photoGallery");
  let photos = [];

  photoInput.onchange = () => {
    photos = [];
    gallery.replaceChildren();

    [...photoInput.files].forEach(file => {
      if (!file.type.startsWith("image/")) return;

      const url = URL.createObjectURL(file);
      photos.push(file);

      const img = document.createElement("img");
      img.src = url;
      img.alt = file.name;
      img.style.cssText =
        "width:110px;height:100px;object-fit:cover;border-radius:12px;margin:6px";

      gallery.appendChild(img);
    });
  };

  // SAVE TRIP DETAILS
  function showTrips() {
    const saved = JSON.parse(
      localStorage.getItem("tripTroveSaved") || "[]"
    );

    const output = document.getElementById("savedTrips");
    output.replaceChildren();

    saved.forEach(trip => {
      const card = document.createElement("div");
      const title = document.createElement("h3");
      const details = document.createElement("p");

      title.textContent = trip.title;
      details.textContent =
        `${trip.date || "No date"} · Budget ₹${trip.budget || 0} · ${trip.places.join(", ")}`;

      card.append(title, details);
      output.appendChild(card);
    });
  }

  document.getElementById("saveMyTrip").onclick = () => {
    const trip = {
      title: document.getElementById("tripTitle").value.trim() || "My Trip",
      date: document.getElementById("tripDate").value,
      budget: document.getElementById("tripBudget").value,
      notes: document.getElementById("tripNotes").value,
      places: places.map(p => p.name),
      photoNames: photos.map(p => p.name)
    };

    const saved = JSON.parse(
      localStorage.getItem("tripTroveSaved") || "[]"
    );

    saved.push(trip);
    localStorage.setItem("tripTroveSaved", JSON.stringify(saved));

    alert("Trip details saved successfully!");
    showTrips();
  };

  showTrips();
});

      }
    });
  });
});


