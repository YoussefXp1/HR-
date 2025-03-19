import React from "react";
import bannerImage from "../assets/banner.jpg"; // Adjust the path to your image file

//import './Intro.css'; // Separate CSS for the intro section

const Intro = () => {
  return (
    <section
      className="intro"
      style={{
        backgroundImage: `url(${bannerImage})`,
      }}
    >
      <h1>HR Horizon</h1>
      <p>Simplify Your HR Operations And Focus On Building a Thriving Workplace With Us</p>
    </section>
  );
};

export default Intro;
