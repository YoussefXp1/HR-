import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const EmailVerified: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        setTimeout(() => {
            navigate("/login"); // After verifing the email the user will be redirect to login page after 3 seconds
        }, 3000);
    }, [navigate]);

    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            <h2>Email Verified Successfully 🎉</h2>
            <p>Redirecting to login...</p>
        </div>
    );
};

export default EmailVerified;
