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

  const handleLogout = async() => {
    try {
      await fetch("http://localhost:5122/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      setIsLoggedIn(false);
      navigate("/"); // Redirect to homepage after logout
    } catch (error){
      console.error("logout failed", error);
    }
    
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
                <Link to="/signup">Sign up</Link>
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
