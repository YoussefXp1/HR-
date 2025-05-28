import React, { useState } from "react";
import "../style/PostEvents.css";

const PostEvent: React.FC = () => {
  const [eventData, setEventData] = useState({
    title: "",
    date: "",
    time: "",
    location: "",
    description: "",
    tags: "",
    category: "Workshop",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setEventData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!imageFile) {
      alert("Please select an image.");
      return;
    }

    const formData = new FormData();
    formData.append("title", eventData.title);
    formData.append("date", eventData.date);
    formData.append("time", eventData.time);
    formData.append("location", eventData.location);
    formData.append("description", eventData.description);
    formData.append("tags", eventData.tags);
    formData.append("category", eventData.category);
    formData.append("image", imageFile);

    try {
      const response = await fetch("http://localhost:5122/api/event/post", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (response.ok) {
        setSuccessMessage('✅ Event posted successfully!');
        setTimeout(() => setSuccessMessage(''), 5000); // Hide after 5 seconds
      } else {
        setSuccessMessage('❌ Failed to post event.');
        setTimeout(() => setSuccessMessage(''), 5000); // Hide after 5 seconds
      }
    } catch (error) {
      setSuccessMessage('❌ Failed to post event.');
      setTimeout(() => setSuccessMessage(''), 5000); // Hide after 5 seconds
    }
  };

  return (
  <div className="post-event-container">
    <h2>Post New Event</h2>

    {successMessage && (
      <div
        style={{
          backgroundColor: successMessage.startsWith("✅") ? "#d4edda" : "#f8d7da",
          color: successMessage.startsWith("✅") ? "#155724" : "#721c24",
          padding: "10px",
          borderRadius: "5px",
          marginBottom: "15px",
          border: successMessage.startsWith("✅") ? "1px solid #c3e6cb" : "1px solid #f5c6cb",
        }}
      >
        {successMessage}
      </div>
    )}

    <form className="post-event-form" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
      <div className="form-group">
        <label htmlFor="title">Event Title</label>
        <input name="title" id="title" placeholder="Enter event title" onChange={handleChange} />
      </div>

      <div className="form-group">
        <label htmlFor="date">Date</label>
        <input name="date" id="date" type="date" onChange={handleChange} />
      </div>

      <div className="form-group">
        <label htmlFor="time">Time</label>
        <input name="time" id="time" placeholder="Enter time (e.g. 10:00 AM)" onChange={handleChange} />
      </div>

      <div className="form-group">
        <label htmlFor="location">Location</label>
        <input name="location" id="location" placeholder="Enter location" onChange={handleChange} />
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          name="description"
          id="description"
          placeholder="Enter event description"
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label htmlFor="tags">Tags</label>
        <input
          name="tags"
          id="tags"
          placeholder="Comma-separated tags"
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label htmlFor="category">Category</label>
        <select name="category" id="category" onChange={handleChange}>
          <option>Workshop</option>
          <option>Conference</option>
          <option>Webinar</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="image">Event Image</label>
        <input
          id="image"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
        />
      </div>

      <div className="button-group">
        <button type="submit">Post Event</button>
      </div>
    </form>
  </div>
);

};

export default PostEvent;
