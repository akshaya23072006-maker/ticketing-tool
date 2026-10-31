const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// Allowed ticket values
const priorities = ["LOW", "MEDIUM", "HIGH"];
const statuses = ["OPEN", "IN_PROGRESS", "CLOSED"];
const categories = ["TECHNICAL", "ACCESS", "HARDWARE", "OTHER"];

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/neostark";

mongoose.connect(MONGO_URI)
  .then(() => console.log("Connected to MongoDB successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Define Mongoose Ticket Schema & Model
const ticketSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  priority: { type: String, enum: priorities, required: true },
  status: { type: String, enum: statuses, required: true },
  category: { type: String, enum: categories, required: true },
  requester: { type: String, required: true, trim: true }
});

const Ticket = mongoose.model("Ticket", ticketSchema);

// Validate ticket fields helper
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
    message: "NeoStark Ticketing API is running with MongoDB",
  });
});

// GET: Retrieve all tickets
app.get("/api/tickets", async (req, res) => {
  try {
    const tickets = await Ticket.find().sort({ id: -1 });
    res.status(200).json(tickets);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tickets", error: error.message });
  }
});

// POST: Create a new ticket
app.post("/api/tickets", async (req, res) => {
  const errors = validateTicket(req.body);

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    // Find highest ID to auto-increment
    const latestTicket = await Ticket.findOne().sort({ id: -1 });
    const nextId = latestTicket ? latestTicket.id + 1 : 1001;

    const newTicket = new Ticket({
      id: nextId,
      title: req.body.title.trim(),
      description: req.body.description.trim(),
      priority: req.body.priority,
      status: req.body.status,
      category: req.body.category,
      requester: req.body.requester.trim(),
    });

    const savedTicket = await newTicket.save();

    return res.status(201).json({
      message: "Ticket created successfully",
      ticket: savedTicket,
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating ticket", error: error.message });
  }
});

// GET: Retrieve a single ticket by ID
app.get("/api/tickets/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ message: "Invalid ticket ID" });
  }

  try {
    const ticket = await Ticket.findOne({ id });

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    return res.status(200).json(ticket);
  } catch (error) {
    res.status(500).json({ message: "Error fetching ticket", error: error.message });
  }
});

// PUT: Update an existing ticket
app.put("/api/tickets/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ message: "Invalid ticket ID" });
  }

  const errors = validateTicket(req.body);

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    const updatedTicket = await Ticket.findOneAndUpdate(
      { id },
      {
        title: req.body.title.trim(),
        description: req.body.description.trim(),
        priority: req.body.priority,
        status: req.body.status,
        category: req.body.category,
      },
      { new: true }
    );

    if (!updatedTicket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    return res.status(200).json({
      message: "Ticket updated successfully",
      ticket: updatedTicket,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating ticket", error: error.message });
  }
});

// DELETE: Delete a ticket
app.delete("/api/tickets/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ message: "Invalid ticket ID" });
  }

  try {
    const deletedTicket = await Ticket.findOneAndDelete({ id });

    if (!deletedTicket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    return res.status(200).json({ message: "Ticket deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting ticket", error: error.message });
  }
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`NeoStark API running at http://localhost:${PORT}`);
});