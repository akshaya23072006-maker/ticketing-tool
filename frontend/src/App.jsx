import { useState, useEffect } from "react";
import "./App.css";

const API_URL = "http://localhost:5000/api/tickets";

function App() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);

  const [title, setTitle] = useState("");
  const [requester, setRequester] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [category, setCategory] = useState("TECHNICAL");
  const [description, setDescription] = useState("");

  const [activePage, setActivePage] = useState("Dashboard");
  const [currentUser, setCurrentUser] = useState("");

  // Fetch tickets from backend
  useEffect(() => {
    async function fetchTickets() {
      try {
        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error("Failed to fetch tickets");
        }

        const data = await response.json();
        setTickets(data);
        setError("");
      } catch (error) {
        console.error("Error fetching tickets:", error);
        setError("Unable to load tickets. Please check your backend.");
      } finally {
        setLoading(false);
      }
    }

    fetchTickets();
  }, []);

  // Filter tickets
  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      `${ticket.title} ${ticket.requester || ""} ${ticket.id}`
        .toLowerCase()
        .includes(search.toLowerCase());

    const reverseStatusMap = {
      "OPEN": "Open",
      "IN_PROGRESS": "In Progress",
      "CLOSED": "Resolved"
    };

    const displayStatus = reverseStatusMap[ticket.status] || ticket.status;
    const matchesStatus = filter === "All" || displayStatus === filter;

    const matchesPage =
      activePage !== "My Requests" ||
      (currentUser.trim() !== "" &&
        (ticket.requester || "").toLowerCase() ===
          currentUser.trim().toLowerCase());

    return matchesSearch && matchesStatus && matchesPage;
  });

  // Create ticket and save it in backend
  async function createTicket(event) {
    event.preventDefault();

    if (!title.trim() || !requester.trim()) return;

    const newTicket = {
      title: title.trim(),
      description: description.trim() || "Support request submitted via portal",
      priority: priority.toUpperCase(),
      status: "OPEN",
      category: category.toUpperCase(),
      requester: requester.trim(),
    };

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTicket),
      });

      if (!response.ok) {
        throw new Error("Failed to create ticket");
      }

      const data = await response.json();
      const savedTicket = data.ticket || data;

      setTickets((current) => [savedTicket, ...current]);
      setCurrentUser(requester.trim());

      setTitle("");
      setDescription("");
      setRequester("");
      setPriority("MEDIUM");
      setCategory("TECHNICAL");
      setShowForm(false);
      setActivePage("All Tickets");
      setSearch("");
      setFilter("All");

    } catch (error) {
      console.error("Error creating ticket:", error);
      alert("Unable to create ticket. Please try again.");
    }
  }

  // Update ticket status in backend
  async function updateStatus(id, newStatus) {
    const statusMap = {
      "Open": "OPEN",
      "In Progress": "IN_PROGRESS",
      "Resolved": "CLOSED"
    };

    const backendStatus = statusMap[newStatus] || "OPEN";
    const currentTicket = tickets.find((t) => t.id === id);

    if (!currentTicket) return;

    const updatedData = {
      title: currentTicket.title,
      description: currentTicket.description || "Updated ticket description",
      priority: currentTicket.priority,
      status: backendStatus,
      category: currentTicket.category
    };

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      const data = await response.json();
      const updatedTicket = data.ticket || data;

      const reverseStatusMap = {
        "OPEN": "Open",
        "IN_PROGRESS": "In Progress",
        "CLOSED": "Resolved"
      };

      const normalizedTicket = {
        ...updatedTicket,
        status: reverseStatusMap[updatedTicket.status] || updatedTicket.status
      };

      setTickets((current) =>
        current.map((ticket) =>
          ticket.id === id ? normalizedTicket : ticket
        )
      );
    } catch (error) {
      console.error("Error updating ticket status:", error);
      alert("Unable to update ticket status. Please try again.");
    }
  }

  // Delete ticket from backend
  async function deleteTicket(id) {
    if (!window.confirm("Are you sure you want to delete this ticket?")) return;

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete ticket");
      }

      setTickets((current) => current.filter((ticket) => ticket.id !== id));
    } catch (error) {
      console.error("Error deleting ticket:", error);
      alert("Unable to delete ticket. Please try again.");
    }
  }

  // Navigation
  function navigateTo(page) {
    setActivePage(page);
    setSearch("");
    setFilter("All");
    setShowForm(false);
  }

  // Dashboard statistics helper
  const openCount = tickets.filter(
    (ticket) => ticket.status === "OPEN" || ticket.status === "Open"
  ).length;

  const progressCount = tickets.filter(
    (ticket) => ticket.status === "IN_PROGRESS" || ticket.status === "In Progress"
  ).length;

  const resolvedCount = tickets.filter(
    (ticket) => ticket.status === "CLOSED" || ticket.status === "Resolved"
  ).length;

  return (
    <main className="app">

      {/* Sidebar */}
      <aside className="sidebar">

        <div className="brand">
          <span>NS</span> NeoStark
        </div>

        <p className="side-label">WORKSPACE</p>

        <div
          className={`nav-item ${
            activePage === "Dashboard" ? "active" : ""
          }`}
          onClick={() => navigateTo("Dashboard")}
          role="button"
          tabIndex={0}
        >
          ▦ &nbsp; Dashboard
        </div>

        <div
          className={`nav-item ${
            activePage === "All Tickets" ? "active" : ""
          }`}
          onClick={() => navigateTo("All Tickets")}
          role="button"
          tabIndex={0}
        >
          ▤ &nbsp; All Tickets
        </div>

        <div
          className={`nav-item ${
            activePage === "My Requests" ? "active" : ""
          }`}
          onClick={() => navigateTo("My Requests")}
          role="button"
          tabIndex={0}
        >
          ◷ &nbsp; My Requests
        </div>

        <div
          className={`nav-item ${
            activePage === "Settings" ? "active" : ""
          }`}
          onClick={() => navigateTo("Settings")}
          role="button"
          tabIndex={0}
        >
          ⚙ &nbsp; Settings
        </div>

        <div className="profile">
          <div className="avatar">NS</div>
          <div>
            <strong>Support Team</strong>
            <small>Administrator</small>
          </div>
        </div>

      </aside>

      {/* Main Content */}
      <section className="content">

        {/* Header */}
        <header className="topbar">
          <div>
            <span className="eyebrow">SUPPORT CENTER</span>
            <h1>{activePage}</h1>
          </div>

          {activePage !== "Settings" && (
            <button
              className="primary"
              onClick={() => setShowForm((visible) => !visible)}
            >
              + Create Ticket
            </button>
          )}
        </header>

        {/* Dashboard */}
        {activePage === "Dashboard" && (
          <>
            <section className="welcome">
              <div>
                <p className="eyebrow">NEOSTARK SUPPORT</p>
                <h2>How can we help today?</h2>
                <p>
                  Track issues, manage requests, and keep work moving.
                </p>
              </div>

              <div className="welcome-icon">✳</div>
            </section>

            <section className="stats">

              <article className="stat-card">
                <span>Total Tickets</span>
                <strong>{tickets.length}</strong>
                <small>All support requests</small>
              </article>

              <article className="stat-card">
                <span>Open</span>
                <strong>{openCount}</strong>
                <small>Awaiting attention</small>
              </article>

              <article className="stat-card">
                <span>In Progress</span>
                <strong>{progressCount}</strong>
                <small>Being worked on</small>
              </article>

              <article className="stat-card">
                <span>Resolved</span>
                <strong>{resolvedCount}</strong>
                <small>Successfully completed</small>
              </article>

            </section>
          </>
        )}

        {/* Loading and Error Messages */}
        {loading && (
          <p>Loading tickets...</p>
        )}

        {error && (
          <p className="empty">{error}</p>
        )}

        {/* Create Ticket Form */}
        {showForm && activePage !== "Settings" && (
          <form
            className="ticket-form"
            onSubmit={createTicket}
          >
            <h2>Create a support ticket</h2>

            <label>
              Issue title
              <input
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                placeholder="Describe your issue"
                required
              />
            </label>

            <label>
              Description
              <input
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                placeholder="Detailed description"
              />
            </label>

            <label>
              Requester name
              <input
                value={requester}
                onChange={(event) =>
                  setRequester(event.target.value)
                }
                placeholder="Your name"
                required
              />
            </label>

            <label>
              Category
              <select
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value)
                }
              >
                <option value="TECHNICAL">Technical Support</option>
                <option value="ACCESS">Access Request</option>
                <option value="HARDWARE">Hardware</option>
                <option value="OTHER">Other</option>
              </select>
            </label>

            <label>
              Priority
              <select
                value={priority}
                onChange={(event) =>
                  setPriority(event.target.value)
                }
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </label>

            <div className="form-actions">

              <button
                type="button"
                className="secondary"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>

              <button
                className="primary"
                type="submit"
              >
                Submit Ticket
              </button>

            </div>
          </form>
        )}

        {/* Settings Page */}
        {activePage === "Settings" ? (

          <section className="ticket-section">

            <div className="section-heading">
              <div>
                <h2>Settings</h2>
                <p>View your support workspace profile.</p>
              </div>
            </div>

            <div className="ticket-form">
              <h2>Profile information</h2>

              <label>
                Team name
                <input value="Support Team" readOnly />
              </label>

              <label>
                Role
                <input value="Administrator" readOnly />
              </label>

              <p>
                This is a frontend prototype. Profile editing
                and saving settings are not connected yet.
              </p>
            </div>

          </section>

        ) : (

          /* All Tickets and My Requests */
          activePage !== "Dashboard" && (

            <section className="ticket-section">

              <div className="section-heading">
                <div>
                  <h2>
                    {activePage === "My Requests"
                      ? "My Requests"
                      : "Support Tickets"}
                  </h2>

                  <p>
                    {activePage === "My Requests"
                      ? currentUser
                        ? `Requests submitted by ${currentUser}.`
                        : "Create a ticket first to see your requests here."
                      : "Review and manage incoming requests."}
                  </p>
                </div>
              </div>

              {/* Search and Filter */}
              <div className="toolbar">

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search tickets, requesters, or ID..."
                />

                <select
                  value={filter}
                  onChange={(event) =>
                    setFilter(event.target.value)
                  }
                >
                  <option>All</option>
                  <option>Open</option>
                  <option>In Progress</option>
                  <option>Resolved</option>
                </select>

              </div>

              {/* Ticket Table */}
              <div className="table-wrap">

                <table>

                  <thead>
                    <tr>
                      <th>Ticket</th>
                      <th>Requester</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>

                    {filteredTickets.map((ticket) => {
                      const reverseStatusMap = {
                        "OPEN": "Open",
                        "IN_PROGRESS": "In Progress",
                        "CLOSED": "Resolved"
                      };
                      const displayStatus = reverseStatusMap[ticket.status] || ticket.status;

                      return (
                        <tr key={ticket.id}>

                          <td>
                            <strong>#{ticket.id}</strong>

                            <div className="ticket-title">
                              {ticket.title}
                            </div>

                            <small>{ticket.category}</small>
                          </td>

                          <td>{ticket.requester || "N/A"}</td>

                          <td>
                            <span
                              className={`priority ${(ticket.priority || "").toLowerCase()}`}
                            >
                              {ticket.priority}
                            </span>
                          </td>

                          <td>
                            <span
                              className={`status ${displayStatus
                                .toLowerCase()
                                .replace(" ", "-")}`}
                            >
                              {displayStatus}
                            </span>
                          </td>

                          <td>
                            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                              <select
                                aria-label={`Update ticket ${ticket.id}`}
                                value={displayStatus}
                                onChange={(event) =>
                                  updateStatus(
                                    ticket.id,
                                    event.target.value
                                  )
                                }
                              >
                                <option>Open</option>
                                <option>In Progress</option>
                                <option>Resolved</option>
                              </select>

                              <button
                                className="secondary"
                                style={{ padding: "4px 8px", cursor: "pointer", color: "#e74c3c", borderColor: "#e74c3c" }}
                                onClick={() => deleteTicket(ticket.id)}
                              >
                                Delete
                              </button>
                            </div>
                          </td>

                        </tr>
                      );
                    })}

                    {filteredTickets.length === 0 &&
                      !loading && (

                      <tr>
                        <td colSpan="5" className="empty">
                          {activePage === "My Requests" &&
                          !currentUser
                            ? "Create a ticket to see your requests here."
                            : "No tickets match your search or filter."}
                        </td>
                      </tr>

                    )}

                  </tbody>

                </table>

              </div>

            </section>

          )

        )}

        <footer>
          NeoStark Support Ticketing Tool · Frontend prototype
        </footer>

      </section>

    </main>
  );
}

export default App;