import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const AuthChecker = ({ setIsLoggedIn }: { setIsLoggedIn: (loggedIn: boolean) => void }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const publicRoutes = ["/login", "/signup", "/forgot-password", "/email-verified", "/reset-password" , "/"];

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("http://localhost:5122/api/auth/verify-token", {
          method: "GET",
          credentials: "include",
        });

        if (response.ok) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
          if (!publicRoutes.includes(location.pathname)) {
            navigate("/login");
          }
        }
      } catch (error) {
        setIsLoggedIn(false);
        if (!publicRoutes.includes(location.pathname)) {
          navigate("/login");
        }
      }
    };

    checkAuth();
  }, []); // ✅ Run only once on initial mount

  return null;
};

export default AuthChecker;
