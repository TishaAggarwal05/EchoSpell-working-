import React from "react";

const Footer = () => {
    return (
        <footer style={styles.footer}>
            <p>© {new Date().getFullYear()} EchoSpell. All rights reserved.</p>
            <p>Made by Team BrewBytes</p>
        </footer>
    );
};

const styles = {
    footer: {
        background: "#061c27",
        color: "white",
        textAlign: "center",
        padding: "10px",
        position: "relative",
        bottom: "0",
        width: "100%",
    },
};

export default Footer;