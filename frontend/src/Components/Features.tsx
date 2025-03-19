import React from "react";
import Image1 from "../assets/chat.png";
import Image2 from "../assets/up.png";
import Image3 from "../assets/ui.png";
//import './Features.css'; // Separate CSS for the features section

const Features = () => {
  return (
    <section className="features">
      <h2>Our Features</h2>
      <div className="feature-list">
        <div className="feature-item">
          <img src={Image1} alt="Feature One" className="feature-image" />
          <h3>Enhanced Communication Tools</h3>
          <p>
            Implement Real-time Chat Between The HR Department And The Employee
            For Clear Communication And Understanding.
          </p>
        </div>
        <div className="feature-item">
          <img src={Image2} alt="Feature Two" className="feature-image" />
          <h3>Competitive Work Environment</h3>
          <p>
            Provides A Competitive Environment For The Employees To Encourage
            Them To Put In The Work And Effort Which They Will Be Rewarded For.
          </p>
        </div>
        <div className="feature-item">
          <img src={Image3} alt="Feature Three" className="feature-image" />
          <h3>Intuitive User-Experience</h3>
          <p>Design With a User-friendly Interface With Focus on Useability.</p>
        </div>
      </div>
    </section>
  );
};

export default Features;
