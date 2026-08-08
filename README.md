# Bus Reservation System

## About the Project

This project began as a **C++ Software Development Fundamentals** assignment at Jaypee Institute of Information Technology, built to practice Object-Oriented Programming, arrays, and file handling by modelling a simple bus reservation workflow. It was later extended with a **web-based interface** — built with plain HTML, CSS, and JavaScript — to make the same booking flow easier and more interactive to use and demo.

Both versions share the same core rules: **5 predefined buses**, **10 seats per bus**, and the same odd/even seat-pricing logic, so the console app and the website behave consistently with each other.

## Features

- Bus management for 5 predefined routes
- Real-time seat availability display
- Seat booking
- Seat cancellation
- Dynamic seat pricing (odd seats = Regular, even seats = Window)
- File handling in the C++ version (`fstream`)
- Local Storage persistence in the web version
- Responsive, mobile-friendly interface

## Technologies Used

### C++ Version

- C++
- Object-Oriented Programming (OOP)
- Classes & Objects
- Arrays
- Functions
- File Handling (`fstream`)

### Web Version

- HTML5
- CSS3
- JavaScript (vanilla, no frameworks)
- Local Storage

## Project Structure

```text
Bus-Reservation-System/
│
├── README.md                  # You are here
│
├── cpp-version/                # Original console-based project
│   ├── main.cpp                 # Menu-driven entry point
│   ├── Bus.h                    # Bus class declaration
│   ├── Bus.cpp                  # Bus class implementation
│   └── data/
│       └── reservations.txt     # Saved bookings (busNumber,seatNumber per line)
│
├── web-version/                # Browser-based reimagining of the same system
│   ├── index.html               # Page structure / all app sections
│   ├── style.css                # Blue & white transportation theme
│   └── script.js                # App logic + Local Storage persistence
│
└── screenshots/                # Images used in this README
    └── README.md
```

## How to Run C++ Version

1. Open a terminal inside the `cpp-version` folder.
2. Compile the program:

   ```bash
   g++ main.cpp Bus.cpp -o bus
   ```

3. Run it:

   ```bash
   ./bus
   ```

4. Use the on-screen menu to display buses, check seat availability, book a seat, or cancel a seat.

Reservation data is automatically saved to and loaded from `data/reservations.txt`, so bookings persist the next time you run the program. Each line in the file is stored as `busNumber,seatNumber`.

## How to Run Web Version

Simply open:

```text
web-version/index.html
```

directly in any modern browser (double-click the file, or drag it into a browser tab).

For a smoother experience with auto-reload while editing, you can also open the `web-version` folder in VS Code and run it with the **Live Server** extension.

No build step, server, or dependencies are required — it's plain HTML, CSS, and JavaScript.

## Screenshots

### Home Page
![Home Page](screenshots/home.png)

### Bus Selection
![Bus Selection](screenshots/buses.png)

### Seat Selection
![Seat Selection](screenshots/seats.png)

### Booking Confirmation
![Booking Confirmation](screenshots/booking.png)

> Screenshots are placeholders — see `screenshots/README.md` for what to capture.

## Learning Outcomes

Working on this project helped build a practical understanding of:

- Object-Oriented Programming
- File Handling
- Data Management
- Problem Solving
- Frontend Development
- User Interface Design
- Converting a console-based application into a web-based interface

## Future Improvements

- Database integration (e.g., MySQL/MongoDB) instead of flat-file / Local Storage
- User authentication for passengers and admins
- Online payment integration
- Real-time bus tracking
- Admin dashboard for managing buses and routes
- Larger bus and route database

## Author

```text
Name: [Your Name]
Institution: Jaypee Institute of Information Technology
Course: Software Development Fundamentals
```
