import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import BellNotification from "./BellNotification"; // Import the bell notification component
import AboutModal from "../Components/AboutPage"; // Import the AboutModal component

type HeaderProps = {
  isLoggedIn: boolean;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
};

const Header: React.FC<HeaderProps> = ({ isLoggedIn, setIsLoggedIn }) => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false); // State to control modal visibility

  const handleLogout = () => {
    setIsLoggedIn(false);
    navigate("/"); // Redirect to homepage after logout
  };

  const handleAboutClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    setShowModal(true); // Show the About modal
  };

  const handleCloseModal = () => {
    setShowModal(false); // Close the modal
  };

  return (
    <header className="header">
      <div className="logo">HR Horizon</div>
      <nav className="navbar">
        <ul className="nav-links">
          {isLoggedIn ? (
            <>
              <li>
                <Link to="/employee">Home</Link>
              </li>
              <li>
                <Link to="/" onClick={handleLogout}>
                  Log Out
                </Link>
              </li>
              <li>
                <BellNotification /> {/* Bell notification component */}
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <a href="/about" onClick={handleAboutClick}>About</a> {/* Trigger the modal */}
              </li>
              <li>
                <Link to="/login">Login</Link>
              </li>
              <li>
                <Link to="/signup">Sign Up</Link>
              </li>
            </>
          )}
        </ul>
      </nav>

      {/* About Modal */}
      <AboutModal showModal={showModal} handleCloseModal={handleCloseModal} />
    </header>
  );
};

export default Header;
