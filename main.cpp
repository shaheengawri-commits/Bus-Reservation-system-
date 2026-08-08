/*
    Bus Reservation System (C++ Version)
    -------------------------------------
    A simple console-based bus reservation system built using
    Object-Oriented Programming concepts for a Software Development
    Fundamentals project.

    Concepts used: Classes, Objects, Arrays, Functions, Loops,
    Conditional Statements, File Handling (fstream).
*/

#include <iostream>
#include <fstream>
#include <sstream>
#include <string>
#include "Bus.h"
using namespace std;

const int TOTAL_BUSES = 5;
const string DATA_FILE = "data/reservations.txt";

// Function prototypes
void loadReservations(Bus buses[], int busCount);
void saveReservations(Bus buses[], int busCount);
void displayAllBuses(Bus buses[], int busCount);
int selectBus(Bus buses[], int busCount);
void checkSeatAvailability(Bus buses[], int busCount);
void bookSeatMenu(Bus buses[], int busCount);
void cancelSeatMenu(Bus buses[], int busCount);

int main() {
    // 5 predefined buses with route and departure time
    Bus buses[TOTAL_BUSES] = {
        Bus(101, "Delhi to Jaipur", "06:00 AM"),
        Bus(102, "Delhi to Agra", "08:30 AM"),
        Bus(103, "Delhi to Chandigarh", "10:00 AM"),
        Bus(104, "Delhi to Lucknow", "01:00 PM"),
        Bus(105, "Delhi to Dehradun", "04:30 PM")
    };

    // Load any previously saved reservation data
    loadReservations(buses, TOTAL_BUSES);

    int choice;
    do {
        cout << "\n===== Bus Reservation System =====" << endl;
        cout << "1. Display Buses" << endl;
        cout << "2. Check Seat Availability" << endl;
        cout << "3. Book Seat" << endl;
        cout << "4. Cancel Seat" << endl;
        cout << "5. Exit" << endl;
        cout << "Enter your choice: ";
        cin >> choice;

        switch (choice) {
            case 1:
                displayAllBuses(buses, TOTAL_BUSES);
                break;
            case 2:
                checkSeatAvailability(buses, TOTAL_BUSES);
                break;
            case 3:
                bookSeatMenu(buses, TOTAL_BUSES);
                break;
            case 4:
                cancelSeatMenu(buses, TOTAL_BUSES);
                break;
            case 5:
                cout << "Thank you for using the Bus Reservation System!" << endl;
                break;
            default:
                cout << "Invalid choice. Please try again." << endl;
        }
    } while (choice != 5);

    return 0;
}

// Displays basic info for every bus
void displayAllBuses(Bus buses[], int busCount) {
    cout << "\n--- Available Buses ---" << endl;
    for (int i = 0; i < busCount; i++) {
        buses[i].displayBusInfo();
    }
}

// Lets the user pick a bus by its bus number, returns array index or -1
int selectBus(Bus buses[], int busCount) {
    int busNumber;
    displayAllBuses(buses, busCount);
    cout << "Enter Bus Number: ";
    cin >> busNumber;

    for (int i = 0; i < busCount; i++) {
        if (buses[i].getBusNumber() == busNumber) {
            return i;
        }
    }
    cout << "Bus not found!" << endl;
    return -1;
}

void checkSeatAvailability(Bus buses[], int busCount) {
    int index = selectBus(buses, busCount);
    if (index == -1) return;
    buses[index].displaySeatAvailability();
}

void bookSeatMenu(Bus buses[], int busCount) {
    int index = selectBus(buses, busCount);
    if (index == -1) return;

    buses[index].displaySeatAvailability();

    int seatNumber;
    cout << "Enter seat number to book (1-" << TOTAL_SEATS << "): ";
    cin >> seatNumber;

    if (seatNumber < 1 || seatNumber > TOTAL_SEATS) {
        cout << "Invalid seat number!" << endl;
        return;
    }

    if (buses[index].bookSeat(seatNumber)) {
        cout << "Seat " << seatNumber << " booked successfully!" << endl;
        cout << "Seat Type: " << buses[index].getSeatType(seatNumber)
             << " | Price: Rs." << buses[index].getSeatPrice(seatNumber) << endl;
        saveReservations(buses, busCount); // update file after booking
    } else {
        cout << "Sorry, seat " << seatNumber << " is already booked." << endl;
    }
}

void cancelSeatMenu(Bus buses[], int busCount) {
    int index = selectBus(buses, busCount);
    if (index == -1) return;

    buses[index].displaySeatAvailability();

    int seatNumber;
    cout << "Enter seat number to cancel (1-" << TOTAL_SEATS << "): ";
    cin >> seatNumber;

    if (seatNumber < 1 || seatNumber > TOTAL_SEATS) {
        cout << "Invalid seat number!" << endl;
        return;
    }

    if (buses[index].cancelSeat(seatNumber)) {
        cout << "Seat " << seatNumber << " cancelled successfully." << endl;
        saveReservations(buses, busCount); // update file after cancellation
    } else {
        cout << "Seat " << seatNumber << " was not booked." << endl;
    }
}

// Loads booked seats from data/reservations.txt
// File format: one line per booking -> busNumber,seatNumber
void loadReservations(Bus buses[], int busCount) {
    ifstream inFile(DATA_FILE);
    if (!inFile) {
        // No reservation file yet, that's fine on first run
        return;
    }

    string line;
    while (getline(inFile, line)) {
        if (line.empty()) continue;

        stringstream ss(line);
        string busNumStr, seatNumStr;
        getline(ss, busNumStr, ',');
        getline(ss, seatNumStr, ',');

        int busNumber = stoi(busNumStr);
        int seatNumber = stoi(seatNumStr);

        for (int i = 0; i < busCount; i++) {
            if (buses[i].getBusNumber() == busNumber) {
                buses[i].setSeatStatus(seatNumber, true);
                break;
            }
        }
    }
    inFile.close();
}

// Saves all currently booked seats to data/reservations.txt
// Overwrites the file each time to keep it in sync with memory
void saveReservations(Bus buses[], int busCount) {
    ofstream outFile(DATA_FILE);
    if (!outFile) {
        cout << "Warning: could not open reservation file for saving." << endl;
        return;
    }

    for (int i = 0; i < busCount; i++) {
        for (int seat = 1; seat <= TOTAL_SEATS; seat++) {
            if (buses[i].isSeatBooked(seat)) {
                outFile << buses[i].getBusNumber() << "," << seat << endl;
            }
        }
    }
    outFile.close();
}
