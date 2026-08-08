/* =========================================================
   Smart Bus Reservation System — script.js
   Vanilla JavaScript, no frameworks.
   Uses localStorage so booked seats and bookings survive
   a page refresh, matching the C++ version's 5 buses / 10 seats.
   ========================================================= */

// ---------- Static bus data (kept identical to the C++ version) ----------
const BUSES = [
  { busNumber: 101, route: "Delhi to Jaipur", departure: "06:00 AM" },
  { busNumber: 102, route: "Delhi to Agra", departure: "08:30 AM" },
  { busNumber: 103, route: "Delhi to Chandigarh", departure: "10:00 AM" },
  { busNumber: 104, route: "Delhi to Lucknow", departure: "01:00 PM" },
  { busNumber: 105, route: "Delhi to Dehradun", departure: "04:30 PM" },
];

const TOTAL_SEATS = 10;
const SEATS_KEY = "busReservationSeats";
const BOOKINGS_KEY = "busReservationBookings";

// 3x5 seat map layout (null = aisle gap, matches the CSS 5-column grid)
const SEAT_ROWS = [
  [1, 2, null, 3, 4],
  [5, 6, null, 7, 8],
  [9, 10, null, null, null],
];

// ---------- App state (kept in memory while the user moves through the flow) ----------
let currentBusNumber = null;
let currentSeatNumber = null;
let currentTravelDate = null;
let currentFilteredRoute = "";

// =================== Local Storage helpers ===================

// Seat state shape: { "101": [false, false, ...10 items], "102": [...], ... }
function loadSeatState() {
  const raw = localStorage.getItem(SEATS_KEY);
  if (raw) {
    return JSON.parse(raw);
  }
  // First run: every seat on every bus starts available
  const initial = {};
  BUSES.forEach((bus) => {
    initial[bus.busNumber] = new Array(TOTAL_SEATS).fill(false);
  });
  localStorage.setItem(SEATS_KEY, JSON.stringify(initial));
  return initial;
}

function saveSeatState(state) {
  localStorage.setItem(SEATS_KEY, JSON.stringify(state));
}

function loadBookings() {
  const raw = localStorage.getItem(BOOKINGS_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveBookings(bookings) {
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
}

// =================== Seat pricing (matches the C++ version's rule) ===================

function getSeatType(seatNumber) {
  return seatNumber % 2 === 0 ? "Window" : "Regular";
}

function getSeatPrice(seatNumber) {
  return seatNumber % 2 === 0 ? 500 : 400;
}

function getAvailableSeatCount(busNumber) {
  const state = loadSeatState();
  return state[busNumber].filter((booked) => !booked).length;
}

// =================== Section navigation ===================

function showSection(sectionId) {
  const sections = [
    "results-section",
    "seat-section",
    "passenger-section",
    "confirmation-section",
  ];
  sections.forEach((id) => {
    document.getElementById(id).hidden = id !== sectionId;
  });
  document.getElementById(sectionId).scrollIntoView({ behavior: "smooth", block: "start" });
}

// =================== Toast messages ===================

let toastTimer = null;
function showToast(message, isError = false) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.hidden = false;
  toast.classList.toggle("toast--error", isError);
  // Force reflow so the transition re-triggers on repeated toasts
  void toast.offsetWidth;
  toast.classList.add("is-visible");

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove("is-visible");
    setTimeout(() => { toast.hidden = true; }, 250);
  }, 2600);
}

// =================== Homepage search ===================

document.getElementById("search-form").addEventListener("submit", (e) => {
  e.preventDefault();
  currentFilteredRoute = document.getElementById("route").value;
  currentTravelDate = document.getElementById("travel-date").value;
  renderBusResults();
  document.getElementById("results-section").hidden = false;
  document.getElementById("results-section").scrollIntoView({ behavior: "smooth", block: "start" });
});

function renderBusResults() {
  const list = currentFilteredRoute
    ? BUSES.filter((bus) => bus.route === currentFilteredRoute)
    : BUSES;

  const grid = document.getElementById("bus-results");
  const noResults = document.getElementById("no-results");
  const subtitle = document.getElementById("results-subtitle");

  subtitle.textContent = currentTravelDate
    ? `Showing buses for ${formatDate(currentTravelDate)}`
    : "Showing all upcoming buses";

  grid.innerHTML = "";

  if (list.length === 0) {
    noResults.hidden = false;
    return;
  }
  noResults.hidden = true;

  list.forEach((bus) => {
    const available = getAvailableSeatCount(bus.busNumber);
    const card = document.createElement("div");
    card.className = "bus-card";
    card.innerHTML = `
      <div class="bus-card__top">
        <span class="bus-card__number">Bus #${bus.busNumber}</span>
        <span class="bus-card__badge ${available <= 2 ? "bus-card__badge--low" : ""}">
          ${available} seat${available === 1 ? "" : "s"} left
        </span>
      </div>
      <div class="bus-card__route">${bus.route.replace("to", "→")}</div>
      <div class="bus-card__meta">
        <span>Departs ${bus.departure}</span>
        <span class="bus-card__price">From ₹400</span>
      </div>
      <button class="btn btn--primary btn--block" data-select-bus="${bus.busNumber}">Select Bus</button>
    `;
    grid.appendChild(card);
  });

  // Wire up the "Select Bus" buttons
  grid.querySelectorAll("[data-select-bus]").forEach((btn) => {
    btn.addEventListener("click", () => {
      openSeatSelection(Number(btn.dataset.selectBus));
    });
  });
}

function formatDate(isoDate) {
  const d = new Date(isoDate + "T00:00:00");
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

// =================== Seat selection ===================

function openSeatSelection(busNumber) {
  currentBusNumber = busNumber;
  currentSeatNumber = null;

  const bus = BUSES.find((b) => b.busNumber === busNumber);
  document.getElementById("seat-bus-summary").textContent =
    `Bus #${bus.busNumber} · ${bus.route.replace("to", "→")} · Departs ${bus.departure}`;

  renderSeatMap();
  resetSeatInfoPanel();
  showSection("seat-section");
}

function renderSeatMap() {
  const state = loadSeatState();
  const bookedSeats = state[currentBusNumber];

  const map = document.getElementById("seat-map");
  map.innerHTML = "";

  SEAT_ROWS.forEach((row) => {
    row.forEach((seatNumber) => {
      if (seatNumber === null) {
        const gap = document.createElement("div");
        gap.className = "seat aisle-gap";
        map.appendChild(gap);
        return;
      }

      const isBooked = bookedSeats[seatNumber - 1];
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "seat" + (isBooked ? " is-booked" : "");
      btn.textContent = seatNumber;
      btn.disabled = isBooked;
      btn.setAttribute("aria-label", `Seat ${seatNumber}, ${getSeatType(seatNumber)}, ₹${getSeatPrice(seatNumber)}`);

      btn.addEventListener("click", () => selectSeat(seatNumber, btn));
      map.appendChild(btn);
    });
  });
}

function selectSeat(seatNumber, btnEl) {
  // Clear any previous selection highlight
  document.querySelectorAll(".seat.is-selected").forEach((el) => el.classList.remove("is-selected"));

  currentSeatNumber = seatNumber;
  btnEl.classList.add("is-selected");

  document.getElementById("seat-info-empty").hidden = true;
  document.getElementById("seat-info-filled").hidden = false;
  document.getElementById("info-seat-number").textContent = seatNumber;
  document.getElementById("info-seat-type").textContent = getSeatType(seatNumber);
  document.getElementById("info-seat-price").textContent = `₹${getSeatPrice(seatNumber)}`;

  document.getElementById("continue-to-passenger").disabled = false;
}

function resetSeatInfoPanel() {
  document.getElementById("seat-info-empty").hidden = false;
  document.getElementById("seat-info-filled").hidden = true;
  document.getElementById("continue-to-passenger").disabled = true;
}

document.getElementById("continue-to-passenger").addEventListener("click", () => {
  if (!currentSeatNumber) return;
  renderTripSummary();
  showSection("passenger-section");
});

// =================== Passenger details ===================

function renderTripSummary() {
  const bus = BUSES.find((b) => b.busNumber === currentBusNumber);
  const summary = document.getElementById("trip-summary");
  summary.innerHTML = `
    <div><dt>Bus</dt><dd>#${bus.busNumber}</dd></div>
    <div><dt>Route</dt><dd>${bus.route.replace("to", "→")}</dd></div>
    <div><dt>Departure</dt><dd>${bus.departure}</dd></div>
    <div><dt>Travel date</dt><dd>${currentTravelDate ? formatDate(currentTravelDate) : "Not specified"}</dd></div>
    <div><dt>Seat</dt><dd>${currentSeatNumber} (${getSeatType(currentSeatNumber)})</dd></div>
    <div><dt>Price</dt><dd>₹${getSeatPrice(currentSeatNumber)}</dd></div>
  `;
}

document.getElementById("passenger-form").addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("passenger-name").value.trim();
  const phone = document.getElementById("passenger-phone").value.trim();

  if (!name) {
    showToast("Please enter the passenger's name.", true);
    return;
  }
  if (!/^[0-9]{10}$/.test(phone)) {
    showToast("Please enter a valid 10-digit phone number.", true);
    return;
  }

  confirmBooking(name, phone);
});

// =================== Booking confirmation ===================

function generateBookingId() {
  const year = new Date().getFullYear();
  const randomPart = Math.floor(1000 + Math.random() * 9000); // 4-digit number
  return `BUS-${year}-${randomPart}`;
}

function confirmBooking(name, phone) {
  // 1. Mark the seat as booked in storage
  const state = loadSeatState();
  state[currentBusNumber][currentSeatNumber - 1] = true;
  saveSeatState(state);

  // 2. Save the booking record
  const bus = BUSES.find((b) => b.busNumber === currentBusNumber);
  const booking = {
    id: generateBookingId(),
    busNumber: bus.busNumber,
    route: bus.route,
    departure: bus.departure,
    seatNumber: currentSeatNumber,
    seatType: getSeatType(currentSeatNumber),
    price: getSeatPrice(currentSeatNumber),
    passengerName: name,
    phone: phone,
    travelDate: currentTravelDate,
    status: "confirmed",
  };

  const bookings = loadBookings();
  bookings.push(booking);
  saveBookings(bookings);

  // 3. Render the ticket and show the confirmation section
  renderTicket(booking);
  showSection("confirmation-section");
  renderBookingsList();
  showToast("Seat booked successfully!");
}

function renderTicket(booking) {
  document.getElementById("ticket-id").textContent = booking.id;
  document.getElementById("ticket-route").textContent = booking.route.replace("to", "→");
  document.getElementById("ticket-departure").textContent = booking.departure;
  document.getElementById("ticket-name").textContent = booking.passengerName;
  document.getElementById("ticket-bus").textContent = `#${booking.busNumber}`;
  document.getElementById("ticket-seat").textContent = booking.seatNumber;
  document.getElementById("ticket-type").textContent = booking.seatType;
  document.getElementById("ticket-date").textContent = booking.travelDate ? formatDate(booking.travelDate) : "—";
  document.getElementById("ticket-price").textContent = `₹${booking.price}`;
  document.getElementById("ticket-stub-departure").textContent = booking.departure;
  document.getElementById("ticket-stub-seat").textContent = `Seat ${booking.seatNumber}`;
}

document.getElementById("book-another").addEventListener("click", () => {
  document.getElementById("passenger-form").reset();
  currentSeatNumber = null;
  document.getElementById("confirmation-section").hidden = true;
  document.getElementById("results-section").hidden = false;
  renderBusResults();
  document.getElementById("results-section").scrollIntoView({ behavior: "smooth", block: "start" });
});

// =================== Manage / cancel bookings ===================

function renderBookingsList() {
  const bookings = loadBookings();
  const list = document.getElementById("bookings-list");
  const emptyNote = document.getElementById("no-bookings");

  list.innerHTML = "";

  if (bookings.length === 0) {
    emptyNote.hidden = false;
    return;
  }
  emptyNote.hidden = true;

  // Most recent booking first
  [...bookings].reverse().forEach((booking) => {
    const row = document.createElement("div");
    row.className = "booking-row";

    const statusClass = booking.status === "confirmed"
      ? "booking-row__status--confirmed"
      : "booking-row__status--cancelled";

    row.innerHTML = `
      <div class="booking-row__info">
        <span class="booking-row__id">${booking.id}</span>
        <span class="booking-row__meta">
          Bus #${booking.busNumber} · ${booking.route.replace("to", "→")} · Seat ${booking.seatNumber} (${booking.seatType}) · ${booking.passengerName}
        </span>
      </div>
      <div class="booking-row__actions">
        <span class="booking-row__status ${statusClass}">${booking.status}</span>
        ${booking.status === "confirmed"
          ? `<button class="btn btn--secondary btn--small" data-cancel-id="${booking.id}">Cancel</button>`
          : ""}
      </div>
    `;
    list.appendChild(row);
  });

  list.querySelectorAll("[data-cancel-id]").forEach((btn) => {
    btn.addEventListener("click", () => cancelBooking(btn.dataset.cancelId));
  });
}

function cancelBooking(bookingId) {
  const bookings = loadBookings();
  const booking = bookings.find((b) => b.id === bookingId);
  if (!booking || booking.status !== "confirmed") return;

  // Free up the seat again
  const state = loadSeatState();
  state[booking.busNumber][booking.seatNumber - 1] = false;
  saveSeatState(state);

  booking.status = "cancelled";
  saveBookings(bookings);

  renderBookingsList();
  // Refresh bus results too, in case the results section is visible
  if (!document.getElementById("results-section").hidden) {
    renderBusResults();
  }
  showToast(`Booking ${bookingId} cancelled. Seat is available again.`);
}

// =================== Back buttons ===================

document.querySelectorAll(".link-back").forEach((btn) => {
  btn.addEventListener("click", () => {
    showSection(btn.dataset.back);
  });
});

// =================== Init ===================

function init() {
  loadSeatState(); // ensures storage is seeded on first visit
  renderBookingsList();

  // Default the date picker to today so the field isn't empty
  const dateInput = document.getElementById("travel-date");
  const today = new Date().toISOString().split("T")[0];
  dateInput.min = today;
  dateInput.value = today;
}

document.addEventListener("DOMContentLoaded", init);
