import React, { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const OtpPage = () => {
  const location = useLocation();
  const history = useNavigate();
  const navigate = useNavigate();
  
  const { userId, mobileNumber } = location.state || {}; // Get mobile number passed from SignUpPage

  const [otp, setOtp] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);


  const inputRefs = useRef([]);
  
  console.log("mobileNumber on Otp page: " + mobileNumber);

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input
    if (value && index < 3) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otp.some((digit) => digit === "")) {
      setError("Please enter all 4 digits.");
      return;
    }

    setError("");
    setVerifying(true);

    const fullOtp = otp.join("");

    try {
      const response = await fetch("http://localhost:8081/v1/otp/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ mobileNumber: mobileNumber, otp: fullOtp })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "OTP verification failed");
      }

      // Navigate to Home on success
      navigate("/home", { state: { userId, mobileNumber } });
    } catch (err) {
      setError(err.message);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card p-4 shadow" style={{ width: "100%", maxWidth: "400px", borderRadius: "1rem" }}>
        <h4 className="mb-3 text-center">Verify OTP</h4>
        <p className="text-center mb-4">
          Enter the 4-digit code sent to <strong>{mobileNumber || "your number"}</strong>
        </p>

        <form onSubmit={handleSubmit}>
          <div className="d-flex justify-content-between mb-3">
            {[0, 1, 2, 3].map((i) => (
              <input
                key={i}
                type="text"
                maxLength="1"
                className="form-control text-center mx-1"
                style={{ width: "60px", height: "60px", fontSize: "24px", borderRadius: "0.75rem" }}
                value={otp[i]}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                ref={(el) => (inputRefs.current[i] = el)}
              />
            ))}
          </div>

          {error && <div className="text-danger text-center mb-3">{error}</div>}

          <button
            type="submit"
            className="btn btn-success w-100"
            disabled={verifying}
          >
            {verifying ? "Verifying..." : "Verify"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default OtpPage;
