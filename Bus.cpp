#include <iostream>
#include "Bus.h"
using namespace std;

// Default constructor
Bus::Bus() {
    busNumber = 0;
    route = "Unknown";
    departureTime = "00:00";
    for (int i = 0; i < TOTAL_SEATS; i++) {
        seats[i] = false; // all seats start as available
    }
}

// Parameterized constructor
Bus::Bus(int busNumber, string route, string departureTime) {
    this->busNumber = busNumber;
    this->route = route;
    this->departureTime = departureTime;
    for (int i = 0; i < TOTAL_SEATS; i++) {
        seats[i] = false;
    }
}

// ---------------- Getters ----------------

int Bus::getBusNumber() const {
    return busNumber;
}

string Bus::getRoute() const {
    return route;
}

string Bus::getDepartureTime() const {
    return departureTime;
}

bool Bus::isSeatBooked(int seatNumber) const {
    return seats[seatNumber - 1];
}

int Bus::getAvailableSeatCount() const {
    int count = 0;
    for (int i = 0; i < TOTAL_SEATS; i++) {
        if (!seats[i]) {
            count++;
        }
    }
    return count;
}

// Odd seats = Regular (Rs. 400), Even seats = Window (Rs. 500)
int Bus::getSeatPrice(int seatNumber) const {
    if (seatNumber % 2 == 0) {
        return 500; // Window seat
    }
    return 400; // Regular seat
}

string Bus::getSeatType(int seatNumber) const {
    if (seatNumber % 2 == 0) {
        return "Window";
    }
    return "Regular";
}

// ---------------- Core functionality ----------------

void Bus::displayBusInfo() const {
    cout << "Bus No: " << busNumber
         << " | Route: " << route
         << " | Departure: " << departureTime
         << " | Seats Available: " << getAvailableSeatCount() << "/" << TOTAL_SEATS
         << endl;
}

void Bus::displaySeatAvailability() const {
    cout << "\nSeat layout for Bus " << busNumber << " (" << route << ")" << endl;
    cout << "----------------------------------------------------" << endl;
    for (int i = 1; i <= TOTAL_SEATS; i++) {
        cout << "Seat " << i << " [" << getSeatType(i) << ", Rs." << getSeatPrice(i) << "] : ";
        if (isSeatBooked(i)) {
            cout << "Booked" << endl;
        } else {
            cout << "Available" << endl;
        }
    }
}

// Returns true if booking was successful
bool Bus::bookSeat(int seatNumber) {
    if (seatNumber < 1 || seatNumber > TOTAL_SEATS) {
        return false; // invalid seat number
    }
    if (seats[seatNumber - 1]) {
        return false; // already booked
    }
    seats[seatNumber - 1] = true;
    return true;
}

// Returns true if cancellation was successful
bool Bus::cancelSeat(int seatNumber) {
    if (seatNumber < 1 || seatNumber > TOTAL_SEATS) {
        return false; // invalid seat number
    }
    if (!seats[seatNumber - 1]) {
        return false; // seat was not booked
    }
    seats[seatNumber - 1] = false;
    return true;
}

// Used only while loading saved data from the reservations file
void Bus::setSeatStatus(int seatNumber, bool status) {
    if (seatNumber >= 1 && seatNumber <= TOTAL_SEATS) {
        seats[seatNumber - 1] = status;
    }
}
