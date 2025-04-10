// import React from "react";
// import AuthForm from "../components/AuthForm";

// const Login = () => {
//     const handleLogin = (data) => {
//         console.log("Login Data:", data);
//     };

//     return <AuthForm formType="login" onSubmit={handleLogin} />;
// };

// export default Login;
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthForm from "../components/AuthForm";

const Login = () => {
    const navigate = useNavigate();
    
    const handleLogin = (formData) => {
        fetch("http://localhost:5500/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include", // Ensure cookies (session) are sent
            body: JSON.stringify(formData),
        })
        .then((res) => res.json())
        .then((data) => {
            console.log("Server Response:", data);
            if (data.success) {
                // ✅ Use the correct userId received from the backend
                window.location.href = `http://localhost:5500/user/profile/${data.userId}`;
            } else {
                alert(data.message || "Login failed!");
            }
        })
        .catch((err) => console.error("Error logging in:", err));
    };
    

    return <AuthForm formType="login" onSubmit={handleLogin} />;
};

export default Login;

