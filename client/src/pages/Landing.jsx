import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";

const Landing = () => {
    const navigate = useNavigate();
    return (
        <div className="landing-container">
            <Navbar />

            {/* Main Content */}
            <div className="landing-content">
                <header className="landing-header">
                    <h1>Welcome to EchoSpell</h1>
                    <p>Your journey starts here. Explore and enjoy!</p>
                    <button>Get Started</button>
                </header>

                {/* Features Section */}
                <section className="features-section">
                    <h2 className="features-heading">FEATURES</h2>
                    <div className="features-container">
                        <div className="feature-box">
                            <h3>🪄 Spell-Based Speech Exercises</h3>
                            <p>Engage in interactive spell-based challenges designed to improve your pronunciation and speech fluency.</p>
                        </div>
                        <div className="feature-box">
                            <h3>📜 Personalized Learning Paths</h3>
                            <p>Follow a customized learning journey tailored to your strengths and areas that need improvement.</p>
                        </div>
                        <div className="feature-box">
                            <h3>🎤 AI-Powered Pronunciation Check</h3>
                            <p>Receive real-time feedback on your pronunciation with our cutting-edge AI-powered speech analysis.</p>
                        </div>
                    </div>
                </section>

                {/* Storyline Section */}
                <section className="storyline-section">
                    <h2 className="section-heading">STORYLINE</h2>
                    <p className="storyline-text">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque non justo id ligula tempus
                        venenatis. Integer lacinia sapien sit amet lorem pharetra, at vulputate mauris placerat.
                        Morbi auctor felis nec justo facilisis, nec euismod nunc pulvinar. Nulla facilisi.
                    </p>
                </section>

                {/* HOW IT WORKS Section */}
                <section className="how-it-works">
                    <h2>HOW IT WORKS</h2>
                    <div className="roadmap">
                        <div className="roadmap-step">
                            <div className="step-orb">1</div>
                            <div className="step-content">Step 1: GET STARTED</div>
                        </div>
                        <div className="roadmap-step">
                            <div className="step-orb">2</div>
                            <div className="step-content">Step 2: GIVE ASSESSMENT</div>
                        </div>
                        <div className="roadmap-step">
                            <div className="step-orb">3</div>
                            <div className="step-content">Step 3: PRACTICE EXERCISES</div>
                        </div>
                        <div className="roadmap-step">
                            <div className="step-orb">4</div>
                            <div className="step-content">Step 4: IMPROVE AND MASTER</div>
                        </div>
                    </div>
                </section>
            </div>

            <Footer />
        </div>
    );
};

export default Landing;
