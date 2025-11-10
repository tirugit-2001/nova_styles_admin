import { useNavigate } from "react-router-dom";
import "./login.css";
import { useState } from "react";
// import logo from "../../../public/ar-logo1.png";
import { axios } from "../config/axios";

interface LoginInputType {
  email: string;
  password: string;
}

export function LoginPage() {
  const navigate = useNavigate();
  const [loginType, setLoginType] = useState<"forAdmin" | "forStudents">(
    "forAdmin"
  );
  const [data, setData] = useState<LoginInputType>({ email: "", password: "" });
  const [running, setRunning] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // 🔐 Handle login
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setRunning(true);

    try {
      const deviceId = localStorage.getItem("deviceId") || crypto.randomUUID();
      localStorage.setItem("deviceId", deviceId);

      const res = await axios.post(
        "/api/v1/auth/login", // ✅ Uses configured axios with withCredentials for cookies
        {
          email: data.email,
          password: data.password,
          deviceId,
        }
      );

      // ✅ Backend sets HTTP-only cookies (accessToken, refreshToken) automatically
      // Store tokens in localStorage only for client-side route protection check
      // Actual authentication is handled by HTTP-only cookies
      if (res.data.accessToken && res.data.refreshToken) {
        localStorage.setItem("accessToken", res.data.accessToken);
        localStorage.setItem("refreshToken", res.data.refreshToken);
      } else {
        // If backend only uses cookies (doesn't return tokens), set a flag for ProtectedRoute
        localStorage.setItem("accessToken", "cookie-based-auth");
      }

      // ✅ Redirect to admin dashboard
      navigate("/admin");
    } catch (err: any) {
      console.error(err);

      // Handle different types of errors
      if (
        err.code === "ERR_NETWORK" ||
        err.message?.includes("Network Error")
      ) {
        setError(
          "Network error: Unable to connect to the server. Please check if the backend is running."
        );
      } else if (err.code === "ERR_CANCELED") {
        setError("Request was cancelled. Please try again.");
      } else if (err.response?.status === 401) {
        setError(
          err.response?.data?.message ||
            "Invalid email or password. Please try again."
        );
      } else if (err.response?.status === 403) {
        setError("Access forbidden. Please check your credentials.");
      } else if (err.response?.status >= 500) {
        setError("Server error. Please try again later.");
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="login_main_container">
      <div
        className={`login_container ${
          loginType === "forStudents" && "right-panel-active"
        }`}
        id="login_container"
      >
        <div className={`form-container sign-in-container ${loginType}`}>
          <form onSubmit={handleSubmit}>
            <h1 className="login">Admin Login</h1>

            {/* <input type="text" placeholder="username" name="user_name" ... /> */}

            <input
              type="email"
              placeholder="Email"
              name="email"
              required
              onChange={(e) =>
                setData((prev) => ({ ...prev, email: e.target.value }))
              }
            />

            <input
              type="password"
              placeholder="Password"
              name="password"
              required
              onChange={(e) =>
                setData((prev) => ({ ...prev, password: e.target.value }))
              }
            />

            {error && <p className="error-message">{error}</p>}

            <button className="mt-3" disabled={running}>
              {running ? (
                <div className="container">
                  <div className="loadingspinner">
                    <div id="square1"></div>
                    <div id="square2"></div>
                    <div id="square3"></div>
                    <div id="square4"></div>
                    <div id="square5"></div>
                  </div>
                </div>
              ) : (
                "Login"
              )}
            </button>
          </form>
        </div>

        {/* right side content */}
        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <h1 className="brand">Campus Meal Management</h1>
              <p>Efficient Meal Management For Campus Communities</p>
              <button
                onClick={() => setLoginType("forAdmin")}
                className="ghost"
                id="signIn"
              >
                Login as admin
              </button>
            </div>
            <div className="overlay-panel overlay-right">
              <div>
                {/* <img
                  className="w-[25%] mx-auto rounded logoo"
                  src={logo}
                  alt="logo"
                /> */}
                <h1 className="brand">Nova-Style Admin Panel</h1>
              </div>
              {/* <img src={ims2} alt="" /> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
