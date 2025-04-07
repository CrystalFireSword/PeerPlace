// frontend/src/components/LoginPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/LoginPage.css";

const API_URL = "http://localhost:5000"; // Your backend URL

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // Step 1: Authenticate the user
      const authResponse = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const authData = await authResponse.json();

      if (!authResponse.ok) {
        throw new Error(authData.error || "Login failed");
      }

      // Store the authentication data
      localStorage.setItem('authToken', authData.idToken);
      localStorage.setItem('uid', authData.uid);
      localStorage.setItem('email', authData.email);

      // Step 2: Get user details including role
      const userResponse = await fetch(`${API_URL}/api/userByMail/email?email=${encodeURIComponent(email)}`, {
        headers: {
          'Authorization': `Bearer ${authData.idToken}`
        }
      });

      if (!userResponse.ok) {
        throw new Error("Failed to fetch user details");
      }

      const userData = await userResponse.json();

      // Step 3: Redirect based on role
      if (userData.role === 'student') {
        navigate("/StudentDashboard");
      } else if (userData.role === 'faculty') {
        navigate("/FacultyDashboard");
      } else {
        throw new Error("Unknown user role");
      }

    } catch (err) {
      setError(err.message || "Invalid email or password. Please try again.");
      console.error(err);
    }
  };

  return (
    <div className="login-container">
      <h1>Login</h1>
      <form className="login-form" onSubmit={handleLogin}>
        <div>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default LoginPage;