import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
    const [glowStyle, setGlowStyle] = useState({});
    const navigate = useNavigate();

    // Function to update glow position based on cursor movement
    const handleMouseMove = (e) => {
        setGlowStyle({
            left: `${e.clientX}px`,
            top: `${e.clientY}px`,
        });
    };

    return (
        <nav className="navbar" onMouseMove={handleMouseMove}>
            {/* Glowing effect follows cursor */}
            <div className="glow" style={glowStyle}></div>

            {/* Left: Logo */}
            <h1 className="navbar-logo">🪄 EchoSpell</h1>

            {/* Center: Menu */}
            <ul className="navbar-menu">
                <li><a href="#">HOME</a></li>
                <li><a href="#">SPELLS</a></li>
                <li><a href="#">THERAPY</a></li>
                <li><a href="#">CONTACT</a></li>
            </ul>

            {/* Right: Login/Signup */}
            <div className="auth-buttons">
                <button className="login" onClick={() => navigate("/login")}>Login</button>
                <button className="signup" onClick={() => navigate("/signup")}>Sign Up</button>
            </div>
        </nav>
    );
};

export default Navbar;
