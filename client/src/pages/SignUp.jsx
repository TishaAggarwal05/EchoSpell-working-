import React from "react";
import AuthForm from "../components/AuthForm";

const Signup = () => {
    const handleSignup = (data) => {
        console.log("Signup Data:", data);
    };

    return <AuthForm formType="signup" onSubmit={handleSignup} />;
};

export default Signup;
