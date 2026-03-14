import { useNavigate } from "react-router-dom";

export default function Login() {

  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/dashboard");
  };

  return (
    <div className="auth-container">

      <div className="auth-card">

        <h2>Login</h2>

        <input type="email" placeholder="Email" />

        <input type="password" placeholder="Password" />

        <button onClick={handleLogin}>Login</button>

      </div>

    </div>
  );
}