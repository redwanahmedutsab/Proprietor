export default function SignUp() {
  return (
    <div className="auth-container">

      <div className="auth-card">

        <h2>Create Account</h2>

        <input type="text" placeholder="Full Name" />

        <input type="email" placeholder="Email" />

        <input type="password" placeholder="Password" />

        <button>Sign Up</button>

      </div>

    </div>
  );
}