import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav style={{
      display: "flex",
      justifyContent: "space-between",
      padding: "20px",
      background: "#222",
      color: "white"
    }}>

      <h2>Proprietor AI</h2>

      <div>
        <Link to="/" style={{marginRight: "15px", color:"white"}}>Home</Link>
        <Link to="/login" style={{color:"white"}}>Login</Link>
      </div>

    </nav>
  );
}

export default Navbar;