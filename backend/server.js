const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// Allowed ticket values
const priorities = ["LOW", "MEDIUM", "HIGH"];
const statuses = ["OPEN", "IN_PROGRESS", "CLOSED"];
const categories = ["TECHNICAL", "ACCESS", "HARDWARE", "OTHER"];

// Sample tickets
let tickets = [
  {
    id: 1001,
    title: "Unable to login",
    description: "User cannot log in to the system",
    priority: "HIGH",
    status: "OPEN",
    category: "TECHNICAL",
  },
  {
    id: 1002,
    title: "Request for software access",
    description: "Access required for project software",
    priority: "MEDIUM",
    status: "IN_PROGRESS",
    category: "ACCESS",
  },
  {
    id: 1003,
    title: "Laptop performance issue",
    description: "Laptop is running slowly",
    priority: "LOW",
    status: "CLOSED",
    category: "HARDWARE",
  },
];

// Validate ticket fields
function validateTicket(data) {
  const errors = [];

  if (!data.title || typeof data.title !== "string" || !data.title.trim()) {
    errors.push("Title is required");
  }

  if (
    !data.description ||
    typeof data.description !== "string" ||
    !data.description.trim()
  ) {
    errors.push("Description is required");
  }

  if (!priorities.includes(data.priority)) {
    errors.push("Priority must be LOW, MEDIUM, or HIGH");
  }

  if (!statuses.includes(data.status)) {
    errors.push("Status must be OPEN, IN_PROGRESS, or CLOSED");
  }

  if (!categories.includes(data.category)) {
    errors.push("Category must be TECHNICAL, ACCESS, HARDWARE, or OTHER");
  }

  return errors;
}

// Home route
app.get("/", (req, res) => {
  res.status(200).json({
    message: "NeoStark Ticketing API is running",
  });
});

// POST: Create a new ticket
app.post("/api/tickets", (req, res) => {
  const errors = validateTicket(req.body);

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  const newTicket = {
    id: Math.max(1000, ...tickets.map((ticket) => ticket.id)) + 1,
    title: req.body.title.trim(),
    description: req.body.description.trim(),
    priority: req.body.priority,
    status: req.body.status,
    category: req.body.category,
  };

  tickets.push(newTicket);

  return res.status(201).json({
    message: "Ticket created successfully",
    ticket: newTicket,
  });
});

// GET: Retrieve all tickets
app.get("/api/tickets", (req, res) => {
  res.status(200).json(tickets);
});

// GET: Retrieve a single ticket by ID
app.get("/api/tickets/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      message: "Invalid ticket ID",
    });
  }

  const ticket = tickets.find((ticket) => ticket.id === id);

  if (!ticket) {
    return res.status(404).json({
      message: "Ticket not found",
    });
  }

  return res.status(200).json(ticket);
});

// PUT: Update an existing ticket
app.put("/api/tickets/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      message: "Invalid ticket ID",
    });
  }

  const ticketIndex = tickets.findIndex(
    (ticket) => ticket.id === id
  );

  if (ticketIndex === -1) {
    return res.status(404).json({
      message: "Ticket not found",
    });
  }

  const errors = validateTicket(req.body);

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  tickets[ticketIndex] = {
    id,
    title: req.body.title.trim(),
    description: req.body.description.trim(),
    priority: req.body.priority,
    status: req.body.status,
    category: req.body.category,
  };

  return res.status(200).json({
    message: "Ticket updated successfully",
    ticket: tickets[ticketIndex],
  });
});

// DELETE: Delete a ticket
app.delete("/api/tickets/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      message: "Invalid ticket ID",
    });
  }

  const ticketIndex = tickets.findIndex(
    (ticket) => ticket.id === id
  );

  if (ticketIndex === -1) {
    return res.status(404).json({
      message: "Ticket not found",
    });
  }

  tickets.splice(ticketIndex, 1);

  return res.status(200).json({
    message: "Ticket deleted successfully",
  });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`NeoStark API running at http://localhost:${PORT}`);
});