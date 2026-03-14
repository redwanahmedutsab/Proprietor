import {useEffect, useState} from "react";

export default function Hero() {

    const [message, setMessage] = useState("");

    useEffect(() => {
        fetch("https://proprietor.onrender.com/api/test/")
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                setMessage(data.message);
            })
            .catch((error) => console.error("Error:", error));
    }, []);

    return (
        <div className="hero">

            <h1>Proprietor</h1>
            <h2>Welcome to Proprietor a website where will be able to bus sell your properties in a convinient
                way...</h2>

            <p>{message}</p>

            <button>Get Started</button>

        </div>
    );
}