#ifndef BUS_H
#define BUS_H

#include <string>
using namespace std;

// Total number of seats in every bus
const int TOTAL_SEATS = 10;

/*
    Bus class
    ---------
    Represents a single bus with its route information and
    a simple seat map. Each bus has 10 seats.

    Seat pricing rule:
        - Odd seat numbers  (1,3,5,7,9)  -> Regular seat -> Rs. 400
        - Even seat numbers (2,4,6,8,10) -> Window seat  -> Rs. 500
*/
class Bus {
private:
    int busNumber;
    string route;
    string departureTime;
    bool seats[TOTAL_SEATS]; // false = available, true = booked

public:
    // Constructors
    Bus();
    Bus(int busNumber, string route, string departureTime);

    // Getters
    int getBusNumber() const;
    string getRoute() const;
    string getDepartureTime() const;
    bool isSeatBooked(int seatNumber) const;
    int getAvailableSeatCount() const;

    // Core functionality
    void displayBusInfo() const;
    void displaySeatAvailability() const;
    bool bookSeat(int seatNumber);
    bool cancelSeat(int seatNumber);
    int getSeatPrice(int seatNumber) const;
    string getSeatType(int seatNumber) const;

    // Used when loading saved reservation data from file
    void setSeatStatus(int seatNumber, bool status);
};

#endif
