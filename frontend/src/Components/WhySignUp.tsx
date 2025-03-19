import React from "react";
import Image1 from "../assets/Empoer-image.png";
import Image2 from "../assets/All-image.png";
import Image3 from "../assets/secure-image.png";
import '../App.css'; // Separate CSS for the features section

const Features = () => {
  return (
    <section className="features">
      <h2>Why Sgin Up?</h2>
      <div className="feature-list">
        <div className="feature-item">
          <img src={Image1} alt="Feature One" className="feature-image" />
          <h3>Empower Your Team
          </h3>
          <p>
          Give Your Employees The Tools They Need To Thrive With a Competitive And Motivating Work Environment. Our Platform Fosters a Sense of Accomplishment And Growth.
          </p>
        </div>
        <div className="feature-item">
          <img src={Image2} alt="Feature Two" className="feature-image" />
          <h3>All-in-One HR Solution
          </h3>
          <p>
          Manage Your Company's Workforce With Ease. Our Platform Provides The Tools You Need To Optimize HR Operations.
          </p>
        </div>
        <div className="feature-item">
          <img src={Image3} alt="Feature Three" className="feature-image" />
          <h3>Scalable and Secure</h3>
          <p>Grow Your Business With Confidence. Our Platform Scales With Your Team, While Ensuring Your Data Is Always Protected And Secure.</p>
        </div>
      </div>
    </section>
  );
};

export default Features;
