import React, { useEffect, useState } from "react";
import "../style/ViewEvents.css";

interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  tags: string[]; // assuming backend sends this as array, or split if it's a comma-separated string
  category: string;
  imageUrl: string; // changed from 'image'
}

const ViewEvents: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("http://localhost:5122/api/event/my-events", {
          credentials: "include",
        });
        const data = await res.json();

        // If tags are received as a comma-separated string, convert to array
        const parsedEvents = data.map((event: any) => ({
          ...event,
          tags: typeof event.tags === "string" ? event.tags.split(",") : event.tags,
        }));

        setEvents(parsedEvents);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch events", err);
        setLoading(false);
      }
    };

    fetchEvents();
    const interval = setInterval(() => {
      fetchEvents();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const filteredEvents =
    selectedCategory === "All"
      ? events
      : events.filter((event) => event.category === selectedCategory);

  return (
    <div className="view-events-container">
      <h2>Upcoming Events</h2>

      <div className="filter-buttons">
        {["All", "Workshop", "Conference", "Webinar"].map((category) => (
          <button
            key={category}
            className={`filter-button ${
              selectedCategory === category ? "active" : ""
            }`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="event-grid">
        {loading ? (
          <p>Loading events...</p>
        ) : filteredEvents.length > 0 ? (
          filteredEvents.map((event) => (
            <div key={event.id} className="event-card">
              <img
                src={`http://localhost:5122${event.imageUrl}`}
                alt={event.title}
                className="event-image"
              />
              <div className="event-details">
                <h3>{event.title}</h3>
                <p><strong>Date:</strong> {event.date}</p>
                <p><strong>Time:</strong> {event.time}</p>
                <p><strong>Location:</strong> {event.location}</p>
                <p className="event-description">{event.description}</p>
                <div className="event-tags">
                  {event.tags.map((tag) => (
                    <span key={tag} className="event-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="no-events-message">No events available in this category.</p>
        )}
      </div>
    </div>
  );
};

export default ViewEvents;
