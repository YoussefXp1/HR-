import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthChecker = ({ setIsLoggedIn }: { setIsLoggedIn: (loggedIn: boolean) => void }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("http://localhost:5122/api/auth/verify-token", {
          method: "GET",
          credentials: "include", // Sends cookie with request
        });

        if (response.ok) {
          setIsLoggedIn(true); // If token is valid, mark user as logged in
        } else {
          setIsLoggedIn(false); // If token is invalid, log user out
          navigate("/");
        }
      } catch (error) {
        setIsLoggedIn(false); // In case of error, assume not authenticated
        navigate("/login");
      }
    };

    checkAuth();
  }, []);
      return null;
};

export default AuthChecker;
