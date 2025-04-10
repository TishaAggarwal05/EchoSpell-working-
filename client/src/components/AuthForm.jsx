import React, { useState } from "react";
import "./../styles/auth.css";

const AuthForm = ({ formType }) => {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        parent: "",
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // const handleSubmit = (e) => {
    //     e.preventDefault();
    //     onSubmit(formData);
    // };
    const handleSubmit = (e) => {
        e.preventDefault();
    
        fetch("http://localhost:5500/user/new", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
        })
        
        .then((res) => res.json())
        .then((data) => {
            console.log("Redirecting to:", data.redirect);
            window.location.href = `http://localhost:5500/realtime/${data.userId}`;
        });
    };
    
    

    return (
        <div className="magic-container">
            <div className="magic-aura"></div> {/* Glowing background effect */}
            <h2 className="magic-title">{formType === "signup" ? "✨ Enchanting Signup ✨" : "🔮 Mystical Login 🔮"}</h2>

            <form onSubmit={handleSubmit} className="magic-form">
                {formType === "signup" && (
                    <div className="input-group">
                        <label>Wizard Name</label>
                        <input type="text" name="username" required onChange={handleChange} />
                    </div>
                )}

                <div className="input-group">
                    <label>Spellbook Email</label>
                    <input type="email" name="email" required onChange={handleChange} />
                </div>

                <div className="input-group">
                    <label>Secret Incantation</label>
                    <input type="password" name="password" required onChange={handleChange} />
                </div>

                {formType === "signup" && (
                    <div className="input-group">
                        <label>Guardian Mage</label>
                        <input type="text" name="parent" required onChange={handleChange} />
                    </div>
                )}

                <button type="submit" className="magic-button">{formType === "signup" ? "Join the Order" : "Enter the Realm"}</button>

                {formType === "signup" ? (
                    <p>Already a wizard? <a href="/login">Login to your spellbook</a></p>
                ) : (
                    <p>New to the magic? <a href="/signup">Start your journey</a></p>
                )}
            </form>
        </div>
    );
};

export default AuthForm;
