/* =========================================
   TRIPTROVE - MAIN JAVASCRIPT
========================================= */

document.addEventListener("DOMContentLoaded", function () {
    const $ = (id) => document.getElementById(id);

    // Safe localStorage helpers
    function readData(key, fallback) {
        try {
            const saved = localStorage.getItem(key);
            return saved ? JSON.parse(saved) : fallback;
        } catch (error) {
            console.warn("Could not read " + key, error);
            return fallback;
        }
    }

    function writeData(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            showMessage("Your browser could not save this information.");
        }
    }

    // Toast message
    let toastTimer;

    function showMessage(message) {
        const toast = $("toast");

        if (!toast) {
            alert(message);
            return;
        }

        toast.textContent = message;
        toast.classList.add("show");

        clearTimeout(toastTimer);

        toastTimer = setTimeout(() => {
            toast.classList.remove("show");
        }, 2800);
    }

    // Main data
    let savedTrips = readData("tripTroveTrips", []);
    let activities = readData("tripTroveActivities", []);
    let customPacking = readData("tripTroveCustomPacking", []);
    let activeDay = 1;
    let currentTrip = readData("tripTroveCurrentTrip", null);

    if (!Array.isArray(savedTrips)) savedTrips = [];
    if (!Array.isArray(activities)) activities = [];
    if (!Array.isArray(customPacking)) customPacking = [];

    function formatMoney(value) {
        return "₹" + Number(value || 0).toLocaleString("en-IN", {
            maximumFractionDigits: 2
        });
    }

    // MOBILE NAVIGATION
    const menuToggle = $("menuToggle");
    const navLinks = $("navLinks");

    if (menuToggle && navLinks) {
        menuToggle.addEventListener("click", function () {
            const isOpen = navLinks.classList.toggle("open");

            menuToggle.setAttribute("aria-expanded", String(isOpen));
            menuToggle.textContent = isOpen ? "✕" : "☰";
        });

        navLinks.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", function () {
                navLinks.classList.remove("open");
                menuToggle.setAttribute("aria-expanded", "false");
                menuToggle.textContent = "☰";
            });
        });
    }

    // SMOOTH SCROLLING
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener("click", function (event) {
            const selector = this.getAttribute("href");

            if (!selector || selector === "#") return;

            const target = document.querySelector(selector);

            if (target) {
                event.preventDefault();
                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }
        });
    });

    // TRIP PLANNER
    const tripForm = $("tripForm");
    const destinationInput = $("destination");
    const startDateInput = $("startDate");
    const durationInput = $("duration");
    const travellersInput = $("travellers");

    function getTripFromForm() {
        return {
            destination: destinationInput ? destinationInput.value.trim() : "",
            startDate: startDateInput ? startDateInput.value : "",
            days: durationInput ? Number(durationInput.value) : 1,
            travellers: travellersInput ? Number(travellersInput.value) : 1
        };
    }

    function updateTripOverview(trip) {
        if (!trip) return;

        if ($("overviewTitle")) {
            $("overviewTitle").textContent =
                trip.destination || "Your next journey";
        }

        if ($("overviewDescription")) {
            $("overviewDescription").textContent = trip.startDate
                ? "Your journey begins on " + trip.startDate + ". Let the adventure begin!"
                : "Your beautiful itinerary will begin here.";
        }

        if ($("overviewDays")) {
            $("overviewDays").textContent = (trip.days || 1) + " days";
        }

        if ($("overviewTravellers")) {
            const people = trip.travellers || 1;

            $("overviewTravellers").textContent =
                people + (people === 1 ? " person" : " people");
        }

        updateBudget();
    }

    function fillTripForm(trip) {
        if (!trip) return;

        if (destinationInput) {
            destinationInput.value = trip.destination || "";
        }

        if (startDateInput) {
            startDateInput.value = trip.startDate || "";
        }

        if (durationInput) {
            durationInput.value = trip.days || 3;
        }

        if (travellersInput) {
            travellersInput.value = trip.travellers || 2;
        }

        currentTrip = trip;
        writeData("tripTroveCurrentTrip", currentTrip);

        updateTripOverview(trip);
        renderDayTabs();
        renderActivities();
    }

    if (tripForm) {
        tripForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const trip = getTripFromForm();

            if (
                !trip.destination ||
                !trip.startDate ||
                trip.days < 1 ||
                trip.days > 60 ||
                trip.travellers < 1 ||
                trip.travellers > 50
            ) {
                showMessage("Please enter valid trip details.");
                return;
            }

            currentTrip = trip;
            writeData("tripTroveCurrentTrip", currentTrip);

            updateTripOverview(trip);
            renderDayTabs();
            renderActivities();

            showMessage("Your trip details are ready! 🤎");
        });
    }

    // QUICK TRIP FORM
    const quickTripForm = $("quickTripForm");

    if (quickTripForm) {
        quickTripForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const quickDestination = $("quickDestination");
            const quickDate = $("quickDate");
            const quickDays = $("quickDays");

            if (!quickDestination || !quickDate || !quickDays) return;

            if (!quickDestination.value.trim() || !quickDate.value) {
                showMessage("Please enter a destination and departure date.");
                return;
            }

            if (destinationInput) {
                destinationInput.value = quickDestination.value.trim();
            }

            if (startDateInput) {
                startDateInput.value = quickDate.value;
            }

            if (durationInput) {
                durationInput.value = quickDays.value;
            }

            if (travellersInput && !travellersInput.value) {
                travellersInput.value = 2;
            }

            const trip = getTripFromForm();

            currentTrip = trip;
            writeData("tripTroveCurrentTrip", currentTrip);

            updateTripOverview(trip);
            renderDayTabs();
            renderActivities();

            $("planner")?.scrollIntoView({
                behavior: "smooth"
            });

            showMessage("Trip details added to your planner!");
        });
    }

    // DESTINATION CARD BUTTONS
    document.querySelectorAll(".choose-destination").forEach(button => {
        button.addEventListener("click", function () {
            const place = this.dataset.destination;

            if (destinationInput && place) {
                destinationInput.value = place;

                $("planner")?.scrollIntoView({
                    behavior: "smooth"
                });

                destinationInput.focus();

                showMessage(place + " selected. Add your travel details!");
            }
        });
    });

    // SAVED TRIPS
    function renderSavedTrips() {
        const container = $("savedTrips");

        if (!container) return;

        container.innerHTML = "";

        if (!savedTrips.length) {
            container.innerHTML = `
                <div class="empty-state">
                    <span>♡</span>
                    <p>No saved journeys yet.</p>
                    <small>Create a trip and press Save trip to keep it here.</small>
                </div>`;
            return;
        }

        savedTrips.forEach((trip, index) => {
            const card = document.createElement("article");
            card.className = "saved-trip-card";

            const label = document.createElement("span");
            label.className = "eyebrow";
            label.textContent = "SAVED JOURNEY";

            const title = document.createElement("h3");
            title.textContent = trip.destination;

            const details = document.createElement("p");

            details.textContent =
                `${trip.days} days · ${trip.travellers} traveller(s)` +
                (trip.startDate ? " · " + trip.startDate : "");

            const actions = document.createElement("div");
            actions.className = "saved-trip-actions";

            const loadButton = document.createElement("button");
            loadButton.type = "button";
            loadButton.className = "secondary-button";
            loadButton.textContent = "Open trip";

            loadButton.addEventListener("click", function () {
                fillTripForm(trip);

                $("planner")?.scrollIntoView({
                    behavior: "smooth"
                });

                showMessage("Saved trip opened.");
            });

            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.className = "secondary-button";
            deleteButton.textContent = "Delete";

            deleteButton.addEventListener("click", function () {
                if (confirm("Delete this saved trip?")) {
                    savedTrips.splice(index, 1);

                    writeData("tripTroveTrips", savedTrips);
                    renderSavedTrips();

                    showMessage("Saved trip deleted.");
                }
            });

            actions.append(loadButton, deleteButton);
            card.append(label, title, details, actions);

            container.appendChild(card);
        });
    }

    // SAVE TRIP BUTTON
    const saveTripButton = $("saveTrip");

    if (saveTripButton) {
        saveTripButton.addEventListener("click", function () {
            const trip = getTripFromForm();

            if (
                !trip.destination ||
                !trip.startDate ||
                trip.days < 1 ||
                trip.travellers < 1
            ) {
                showMessage("Please create your trip first.");

                $("planner")?.scrollIntoView({
                    behavior: "smooth"
                });

                return;
            }

            trip.id = Date.now();
            trip.savedAt = new Date().toISOString();
            trip.budget = calculateBudgetTotal();
            trip.activities = activities.map(item => ({ ...item }));

            savedTrips.unshift(trip);

            writeData("tripTroveTrips", savedTrips);
            renderSavedTrips();

            showMessage("Your trip has been saved! 🤎");
        });
    }

    // NEW TRIP BUTTON
    const newTripButton = $("newTrip");

    if (newTripButton) {
        newTripButton.addEventListener("click", function () {
            if (tripForm) tripForm.reset();

            if (durationInput) durationInput.value = 3;
            if (travellersInput) travellersInput.value = 2;

            currentTrip = null;

            writeData("tripTroveCurrentTrip", null);

            activeDay = 1;

            renderDayTabs();
            renderActivities();

            updateTripOverview({
                destination: "",
                startDate: "",
                days: 3,
                travellers: 2
            });

            showMessage("Ready to plan a new journey!");
        });
    }

    // ITINERARY
    const activityForm = $("activityForm");
    const activityList = $("activityList");

    function getTripDays() {
        const days = Number(
            durationInput?.value || currentTrip?.days || 3
        );

        return Math.min(60, Math.max(1, days));
    }

    function renderDayTabs() {
        const tabs = $("dayTabs");

        if (!tabs) return;

        const totalDays = getTripDays();

        if (activeDay > totalDays) {
            activeDay = totalDays;
        }

        tabs.innerHTML = "";

        for (let day = 1; day <= totalDays; day++) {
            const button = document.createElement("button");

            button.type = "button";
            button.className =
                "day-tab" + (day === activeDay ? " active" : "");

            button.dataset.day = String(day);
            button.textContent = "Day " + day;

            button.addEventListener("click", function () {
                activeDay = day;

                renderDayTabs();
                renderActivities();
            });

            tabs.appendChild(button);
        }
    }

    function renderActivities() {
        if (!activityList) return;

        activityList.innerHTML = "";

        const dayActivities = activities
            .filter(item => item.day === activeDay)
            .sort((a, b) =>
                (a.time || "").localeCompare(b.time || "")
            );

        if (!dayActivities.length) {
            activityList.innerHTML = `
                <div class="empty-state">
                    <span>✳</span>
                    <p>Your adventure is a blank page.</p>
                    <small>Add your first activity to begin.</small>
                </div>`;
        } else {
            dayActivities.forEach(item => {
                const row = document.createElement("div");
                row.className = "activity-item";

                const time = document.createElement("span");
                time.className = "activity-time";
                time.textContent = item.time || "Any time";

                const details = document.createElement("div");
                details.className = "activity-details";

                const name = document.createElement("strong");
                name.textContent = item.name;

                const cost = document.createElement("small");
                cost.textContent =
                    "Estimated cost: " + formatMoney(item.cost);

                details.append(name, cost);

                const remove = document.createElement("button");
                remove.type = "button";
                remove.className = "delete-activity";
                remove.textContent = "Remove";

                remove.addEventListener("click", function () {
                    activities = activities.filter(
                        activity => activity.id !== item.id
                    );

                    writeData("tripTroveActivities", activities);

                    renderActivities();
                    updateBudget();

                    showMessage("Activity removed.");
                });

                row.append(time, details, remove);
                activityList.appendChild(row);
            });
        }

        const counter = $("activityCounter");

        if (counter) {
            const count = activities.length;

            counter.textContent =
                count + (count === 1 ? " activity" : " activities");
        }
    }

    if (activityForm) {
        activityForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const name = $("activityName")?.value.trim();
            const time = $("activityTime")?.value;
            const cost = Number($("activityCost")?.value || 0);

            if (!name || !time || cost < 0) {
                showMessage("Please enter valid activity details.");
                return;
            }

            activities.push({
                id: Date.now(),
                day: activeDay,
                name: name,
                time: time,
                cost: cost
            });

            writeData("tripTroveActivities", activities);

            activityForm.reset();

            if ($("activityTime")) {
                $("activityTime").value = "10:00";
            }

            if ($("activityCost")) {
                $("activityCost").value = 0;
            }

            renderActivities();
            updateBudget();

            showMessage("Activity added to Day " + activeDay + "!");
        });
    }
    // BUDGET CALCULATOR
    const budgetInputIds = [
        "transportCost",
        "hotelCost",
        "foodCost",
        "activityBudget",
        "shoppingCost"
    ];

    function calculateBudgetTotal() {
        return budgetInputIds.reduce((sum, id) => {
            const input = $(id);

            return sum + Math.max(
                0,
                Number(input?.value || 0)
            );
        }, 0);
    }

    function updateBudget() {
        const total = calculateBudgetTotal();

        const travellers = Math.max(
            1,
            Number(travellersInput?.value || 1)
        );

        const limit = Math.max(
            0,
            Number($("budgetLimit")?.value || 0)
        );

        const remaining = limit - total;

        const percentage = limit > 0
            ? Math.round((total / limit) * 100)
            : 0;

        if ($("totalBudget")) {
            $("totalBudget").textContent = formatMoney(total);
        }

        if ($("perPerson")) {
            $("perPerson").textContent =
                formatMoney(total / travellers);
        }

        if ($("budgetUsed")) {
            $("budgetUsed").textContent =
                percentage + "% of budget";
        }

        if ($("budgetRemaining")) {
            $("budgetRemaining").textContent =
                remaining >= 0
                    ? formatMoney(remaining) + " left"
                    : formatMoney(Math.abs(remaining)) + " over budget";
        }

        if ($("budgetProgress")) {
            $("budgetProgress").style.width =
                Math.min(100, Math.max(0, percentage)) + "%";
        }

        if ($("budgetMessage")) {
            if (limit === 0) {
                $("budgetMessage").textContent =
                    "Set a maximum budget to track your expenses.";
            } else if (total > limit) {
                $("budgetMessage").textContent =
                    "Your expenses are above your planned budget.";
            } else if (total === limit) {
                $("budgetMessage").textContent =
                    "You have used your full budget.";
            } else {
                $("budgetMessage").textContent =
                    "Looking good! You have room for your adventures.";
            }
        }

        if ($("overviewBudget")) {
            $("overviewBudget").textContent = formatMoney(total);
        }

        return total;
    }

    budgetInputIds.concat(["budgetLimit", "travellers"]).forEach(id => {
        $(id)?.addEventListener("input", updateBudget);
        $(id)?.addEventListener("change", updateBudget);
    });

    // RESET BUDGET
    $("resetBudget")?.addEventListener("click", function () {
        const defaults = {
            transportCost: 2000,
            hotelCost: 3000,
            foodCost: 1500,
            activityBudget: 1000,
            shoppingCost: 500,
            budgetLimit: 10000
        };

        Object.keys(defaults).forEach(id => {
            if ($(id)) {
                $(id).value = defaults[id];
            }
        });

        updateBudget();

        showMessage("Budget has been reset.");
    });

    // PACKING CHECKLIST
    const packingList = $("packingList");

    const defaultPackingLabels = packingList
        ? Array.from(
            packingList.querySelectorAll(".packing-item")
        )
        : [];

    function updatePackingProgress() {
        const checkboxes = packingList
            ? Array.from(
                packingList.querySelectorAll(
                    'input[type="checkbox"]'
                )
            )
            : [];

        const checked = checkboxes.filter(
            box => box.checked
        ).length;

        const progress = $("packingProgress");

        if (progress) {
            progress.textContent =
                `${checked} of ${checkboxes.length} packed`;
        }
    }

    // RESTORE SAVED PACKING ITEMS
    const savedDefaultPacking = readData(
        "tripTroveDefaultPacking",
        []
    );

    defaultPackingLabels.forEach((label, index) => {
        const checkbox = label.querySelector(
            'input[type="checkbox"]'
        );

        if (!checkbox) return;

        checkbox.checked = Boolean(
            savedDefaultPacking[index]
        );

        checkbox.addEventListener("change", function () {
            const states = defaultPackingLabels.map(item => {
                return Boolean(
                    item.querySelector(
                        'input[type="checkbox"]'
                    )?.checked
                );
            });

            writeData("tripTroveDefaultPacking", states);

            updatePackingProgress();
        });
    });

    // CUSTOM PACKING ITEMS
    function renderCustomPacking() {
        if (!packingList) return;

        packingList.querySelectorAll(
            ".custom-packing-item"
        ).forEach(item => item.remove());

        customPacking.forEach((item, index) => {
            const label = document.createElement("label");

            label.className =
                "packing-item custom-packing-item";

            const checkbox = document.createElement("input");

            checkbox.type = "checkbox";
            checkbox.className = "packing-checkbox";
            checkbox.checked = Boolean(item.done);

            checkbox.addEventListener("change", function () {
                customPacking[index].done = checkbox.checked;

                writeData(
                    "tripTroveCustomPacking",
                    customPacking
                );

                updatePackingProgress();
            });

            const text = document.createElement("span");
            text.textContent = item.name;

            const category = document.createElement("small");
            category.textContent = "CUSTOM";

            label.append(checkbox, text, category);

            packingList.appendChild(label);
        });

        updatePackingProgress();
    }

    // ADD CUSTOM PACKING ITEM
    const customPackingForm = $("customPackingForm");

    if (customPackingForm) {
        customPackingForm.addEventListener(
            "submit",
            function (event) {
                event.preventDefault();

                const input = $("customPackingItem");
                const name = input?.value.trim();

                if (!name) return;

                customPacking.push({
                    name: name,
                    done: false
                });

                writeData(
                    "tripTroveCustomPacking",
                    customPacking
                );

                renderCustomPacking();

                input.value = "";

                showMessage("Packing item added.");
            }
        );
    }

    // CLEAR PACKING CHECKLIST
    $("clearPacking")?.addEventListener("click", function () {
        defaultPackingLabels.forEach(label => {
            const checkbox = label.querySelector(
                'input[type="checkbox"]'
            );

            if (checkbox) {
                checkbox.checked = false;
            }
        });

        customPacking.forEach(item => {
            item.done = false;
        });

        writeData(
            "tripTroveDefaultPacking",
            defaultPackingLabels.map(() => false)
        );

        writeData(
            "tripTroveCustomPacking",
            customPacking
        );

        renderCustomPacking();
        updatePackingProgress();

        showMessage("Packing checklist unchecked.");
    });

    // FOOTER YEAR
    if ($("currentYear")) {
        $("currentYear").textContent =
            new Date().getFullYear();
    }

    // INITIAL PAGE LOAD
    if (currentTrip) {
        fillTripForm(currentTrip);
    } else {
        updateTripOverview({
            destination: "",
            startDate: "",
            days: 3,
            travellers: 2
        });
    }

    renderDayTabs();
    renderActivities();
    renderSavedTrips();
    renderCustomPacking();
    updatePackingProgress();
    updateBudget();

    // SET MINIMUM DATE TO TODAY
    const today = new Date();

    const localToday = new Date(
        today.getTime() -
        today.getTimezoneOffset() * 60000
    ).toISOString().split("T")[0];

    if (startDateInput) {
        startDateInput.min = localToday;
    }

    if ($("quickDate")) {
        $("quickDate").min = localToday;
    }

});
