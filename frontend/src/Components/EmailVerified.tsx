import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const EmailVerified = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("Verifying email...");

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      fetch(`http://localhost:5122/api/company/verify-email?token=${token}`, {
        method: "GET",
      })
        .then(async (res) => {
          if (res.ok) {
            const data = await res.json();
            setMessage(data.message || "✅ Email verified successfully!");
            setTimeout(() => {
              window.close();
              setTimeout(() => {
                navigate("/login"); // fallback after 1 second if tab didn't close
              }, 1000);
            }, 3000);
          } else {
            const errorData = await res.json();
            setMessage(`${errorData.message || "Verification failed."}`);
          }
        })
        .catch(() => {
          setMessage("Something went wrong. Please try again later.");
        });
    } else {
      setMessage("Invalid verification link.");
    }
  }, [searchParams, navigate]);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>{message}</h2>
    </div>
  );
};

export default EmailVerified;
