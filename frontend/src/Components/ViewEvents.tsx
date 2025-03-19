import React, { useState } from "react";
import "../style/ViewEvents.css";



interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  tags: string[];
  category: string; // e.g., "Workshop", "Conference", "Webinar"
  image: string;
}

const eventList: Event[] = [
  {
    id: 1,
    title: "React Workshop",
    date: "2024-01-15",
    time: "10:00 AM - 2:00 PM",
    location: "Online",
    description: "Learn React basics and build a simple application.",
    tags: ["React", "JavaScript", "Frontend"],
    category: "Workshop",
    image: "/Images/react-picture.jpg",
  },
  {
    id: 2,
    title: "Tech Conference 2024",
    date: "2024-02-10",
    time: "9:00 AM - 5:00 PM",
    location: "San Francisco, CA",
    description: "Discover the latest trends in technology.",
    tags: ["AI", "Cloud", "Networking"],
    category: "Conference",
    image: "/Images/tech-image1.png",
  },
  {
    id: 3,
    title: "Web Development Webinar",
    date: "2024-01-25",
    time: "5:00 PM - 7:00 PM",
    location: "Online",
    description: "Explore modern web development practices.",
    tags: ["Web Dev", "HTML", "CSS"],
    category: "Webinar",
    image: "/Images/web-image.png",
  },
];

const ViewEvents: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const filteredEvents = selectedCategory === "All"
    ? eventList
    : eventList.filter(event => event.category === selectedCategory);

  return (
    <div className="view-events-container">
      {/* Header */}
      <h2>Upcoming Events</h2>

      {/* Filter Buttons */}
      <div className="filter-buttons">
        {["All", "Workshop", "Conference", "Webinar"].map(category => (
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

      {/* Event Cards */}
      <div className="event-grid">
        {filteredEvents.length > 0 ? (
          filteredEvents.map(event => (
            <div key={event.id} className="event-card">
              <img src={event.image} alt={event.title} className="event-image" />
              <div className="event-details">
                <h3>{event.title}</h3>
                <p>
                  <strong>Date:</strong> {event.date}
                </p>
                <p>
                  <strong>Time:</strong> {event.time}
                </p>
                <p>
                  <strong>Location:</strong> {event.location}
                </p>
                <p className="event-description">{event.description}</p>
                <div className="event-tags">
                  {event.tags.map(tag => (
                    <span key={tag} className="event-tag">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="event-actions">
                  <button className="rsvp-button">Confirm</button>
                  <button className="save-calendar-button">Save to Calendar</button>
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
