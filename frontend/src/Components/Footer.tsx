import React from "react";
//import './Footer.css'; // CSS for styling the footer

const Footer = () => {
  return (
    <footer className="footer">
      <p>&copy; {new Date().getFullYear()} HR Horizon. All rights reserved.</p>
      <ul className="footer-links">
        <li>
          <a href="#privacy">Privacy Policy</a>
        </li>
        <li>
          <a href="#terms">Terms of Service</a>
        </li>
        <li>
          <a href="#contact">Contact</a>
        </li>
      </ul>
      <div className="social-icons">
        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
          Twitter
        </a>
        <a
          href="https://facebook.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          Facebook
        </a>
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          Instagram
        </a>
      </div>
    </footer>
  );
};

export default Footer;
