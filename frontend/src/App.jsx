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
  const [priority, setPriority] = useState("Medium");
  const [category, setCategory] = useState("Technical Support");

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
      `${ticket.title} ${ticket.requester} ${ticket.id}`
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesStatus =
      filter === "All" || ticket.status === filter;

    const matchesPage =
      activePage !== "My Requests" ||
      (currentUser.trim() !== "" &&
        ticket.requester.toLowerCase() ===
          currentUser.trim().toLowerCase());

    return matchesSearch && matchesStatus && matchesPage;
  });

  // Create ticket and save it in backend
  async function createTicket(event) {
    event.preventDefault();

    if (!title.trim() || !requester.trim()) return;

    const newTicket = {
      title: title.trim(),
      requester: requester.trim(),
      priority,
      category,
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

      const savedTicket = await response.json();

      setTickets((current) => [savedTicket, ...current]);
      setCurrentUser(requester.trim());

      setTitle("");
      setRequester("");
      setPriority("Medium");
      setCategory("Technical Support");
      setShowForm(false);
      setActivePage("All Tickets");
      setSearch("");
      setFilter("All");

    } catch (error) {
      console.error("Error creating ticket:", error);
      alert("Unable to create ticket. Please try again.");
    }
  }

  // Update ticket status (frontend only for now)
  function updateStatus(id, status) {
    setTickets((current) =>
      current.map((ticket) =>
        ticket.id === id
          ? { ...ticket, status }
          : ticket
      )
    );
  }

  // Navigation
  function navigateTo(page) {
    setActivePage(page);
    setSearch("");
    setFilter("All");
    setShowForm(false);
  }

  // Dashboard statistics
  const openCount = tickets.filter(
    (ticket) => ticket.status === "Open"
  ).length;

  const progressCount = tickets.filter(
    (ticket) => ticket.status === "In Progress"
  ).length;

  const resolvedCount = tickets.filter(
    (ticket) => ticket.status === "Resolved"
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
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              navigateTo("Dashboard");
            }
          }}
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
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              navigateTo("All Tickets");
            }
          }}
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
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              navigateTo("My Requests");
            }
          }}
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
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              navigateTo("Settings");
            }
          }}
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
                <option>Technical Support</option>
                <option>Access Request</option>
                <option>Hardware</option>
                <option>Other</option>
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
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Urgent</option>
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
                      <th>Update status</th>
                    </tr>
                  </thead>

                  <tbody>

                    {filteredTickets.map((ticket) => (

                      <tr key={ticket.id}>

                        <td>
                          <strong>#{ticket.id}</strong>

                          <div className="ticket-title">
                            {ticket.title}
                          </div>

                          <small>{ticket.category}</small>
                        </td>

                        <td>{ticket.requester}</td>

                        <td>
                          <span
                            className={`priority ${ticket.priority.toLowerCase()}`}
                          >
                            {ticket.priority}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`status ${ticket.status
                              .toLowerCase()
                              .replace(" ", "-")}`}
                          >
                            {ticket.status}
                          </span>
                        </td>

                        <td>
                          <select
                            aria-label={`Update ticket ${ticket.id}`}
                            value={ticket.status}
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
                        </td>

                      </tr>

                    ))}

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