import Navbar from "../components/Navbar";

function Login() {
  return (
    <div>

      <Navbar />

      <div style={{
        textAlign: "center",
        marginTop: "100px"
      }}>

        <h2>Login</h2>

        <input placeholder="Email" /><br/><br/>

        <input placeholder="Password" type="password"/><br/><br/>

        <button>Login</button>

      </div>

    </div>
  );
}

export default Login;