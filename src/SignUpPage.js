import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "./config";

const SignUpPage = () => {
  const [username, setUsername] = useState("");
  const [mobile, setMobile] = useState("");
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("signup"); // 👈 "signup" or "login"

  const navigate = useNavigate();

  useEffect(() => {
    const existingUserId = sessionStorage.getItem("userId");
    if (existingUserId) {
      navigate("/home");
    }
  }, [navigate]);

  const handleUsernameSubmit = (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setError("Please enter your name.");
      return;
    }
    setError("");
    setStep(2);
  };

	const handleMobileSubmit = async (e) => {
	  e.preventDefault();

	  const phoneRegex = /^[0-9]{10}$/;
	  if (!phoneRegex.test(mobile)) {
		setError("Please enter a valid 10-digit mobile number.");
		return;
	  }

	  setError("");
	  setLoading(true);

	  try {
		let userId;

		if (mode === "signup") {
		  const response = await fetch(`${API_BASE_URL}/v1/users`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ name: username, mobileNumber: mobile }),
		  });

		  const data = await response.json();

		  if (!response.ok) {
			throw new Error(data.message || "Signup failed");
		  }

		  userId = data.id;

		} else {
		  // For login, we don't check verification; just send OTP
		  const response = await fetch(`${API_BASE_URL}/v1/users/verified`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ mobileNumber: mobile }),
		  });

		  const data = await response.json();

		  if (!response.ok || !data.id) {
			throw new Error(data.message || "Login failed");
		  }

		  userId = data.id;
		}

		// Send OTP (in both modes)
		const otpResponse = await fetch(`${API_BASE_URL}/v1/otp/send`, {
		  method: "POST",
		  headers: { "Content-Type": "application/json" },
		  body: JSON.stringify({ mobileNumber: mobile }),
		});

		const otpData = await otpResponse.json();

		if (!otpResponse.ok) {
		  throw new Error(otpData.message || "Failed to send OTP");
		}

		sessionStorage.setItem("userId", userId);
		navigate("/otp", { state: { userId, mobileNumber: mobile } });

	  } catch (err) {
		setError(err.message);
	  } finally {
		setLoading(false);
	  }
	};


  return (
    <div className="container d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow-lg p-4" style={{ width: "100%", maxWidth: "400px", borderRadius: "1rem" }}>
        <h3 className="text-center mb-4">
          {mode === "signup" ? "Sign Up" : "Login"}
        </h3>

        {/* 👤 Name input (Sign Up only) */}
        {step === 1 && mode === "signup" && (
          <form onSubmit={handleUsernameSubmit}>
            <div className="mb-3">
              <label htmlFor="username" className="form-label">Name</label>
              <input
                type="text"
                id="username"
                className={`form-control ${error ? "is-invalid" : ""}`}
                placeholder="Enter your name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              {error && <div className="invalid-feedback">{error}</div>}
            </div>
            <button type="submit" className="btn btn-primary w-100">Continue</button>
          </form>
        )}

        {/* 📱 Mobile number input (Step 2 for signup or step 1 for login) */}
        {(step === 2 || mode === "login") && (
          <form onSubmit={handleMobileSubmit}>
            <div className="mb-3">
              <label htmlFor="mobile" className="form-label">Mobile Number</label>
              <input
                type="tel"
                id="mobile"
                className={`form-control ${error ? "is-invalid" : ""}`}
                placeholder="Enter 10-digit mobile number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
              />
              {error && <div className="invalid-feedback">{error}</div>}
            </div>
            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
              {loading
                ? mode === "signup"
                  ? "Signing Up..."
                  : "Logging In..."
                : mode === "signup"
                ? "Sign Up"
                : "Login"}
            </button>
          </form>
        )}

        {/* 🔄 Toggle between Sign Up and Login */}
        <div className="text-center mt-3">
          {mode === "signup" ? (
            <>
              Already have an account?{" "}
              <button
                className="btn btn-link p-0"
                onClick={() => {
                  setMode("login");
                  setStep(2);
                  setError("");
                }}
              >
                Login
              </button>
            </>
          ) : (
            <>
              Don't have an account?{" "}
              <button
                className="btn btn-link p-0"
                onClick={() => {
                  setMode("signup");
                  setStep(1);
                  setUsername("");
                  setError("");
                }}
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
