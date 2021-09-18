import blastIcon from "./images/Blast icon.svg";
import meteorites from "./images/meteorites.svg";
import "./css/blast.css"
import { useState } from "react";
import useWindowSize from "../hooks/usescreensize";

function range(size: number, startAt = 0) {
    return [...Array(size).keys()].map(i => i + startAt);
}

function Star() {
    const [{ x, y, delay }] = useState({ x: Math.random() * 100, y: Math.random() * 100, delay: Math.random() })
    return <div className="star" style={{ top: `${y}vh`, left: `${x}vw`, animationDelay: `-${delay}s` }}></div>
}

function Galaxy() {
    const [{ x, y, delay }] = useState({ x: Math.random() * 100, y: Math.random() * 100, delay: Math.random() * 10 })
    return <div className="Galaxy" style={{ top: `${y}vh`, left: `${x}vw`, animationDelay: `-${delay}s` }}></div>
}

function Blast() {
    const { price, sale } = { price: 100, sale: 0.10 }
    const { width, height } = useWindowSize()
    const [{ xalien, yalien }] = useState({ xalien: 15 + (Math.random() * 30) + "vw", yalien: 15 + (Math.random() * 30) + "vh" })
    return <div>
        <div><div className="stars">
            {range(Math.round((width * height) / 10000)).map((value) => <Star key={value}></Star>)}
        </div>
            <Galaxy></Galaxy>
            <Galaxy></Galaxy>
            <Galaxy></Galaxy>
            <Galaxy></Galaxy>
            <Galaxy></Galaxy>
            <div className="Alien" style={{ top: yalien, left: xalien }}></div>
            <div className="BlastRocket"></div>
        </div>
        <div className="BlastMenu">
            <div
                style={{
                    margin: "auto",
                    border: "solid 1px var(--light-bg-colour)",
                    borderRadius: "10px",
                    backgroundColor: "var(--dark-bg-colour)",
                    padding: "1rem",
                    maxWidth: "700px",
                }}
            >
                <h1 style={{ textAlign: "center" }}>Blast <img src={blastIcon} height="35px" alt="🚀" /></h1>
                <h3>GBP £{((price * (1 - sale)) / 100).toFixed(2)} / month</h3>
                {sale ? <h4>{sale * 100}% off <img src={meteorites} height="35px" alt="☄" /></h4> : <></>}

                <div style={{
                    border: "solid 1px var(--light-bg-colour)",
                    borderRadius: "10px",
                    backgroundColor: "var(--dark-bg-colour)",
                    padding: "1rem",
                    margin: "1rem"
                }}><h5>Features</h5>
                    <div style={{ width: "100%", height: "1px", backgroundColor: "var(--light-bg-colour)" }}></div>
                    <ul style={{
                        margin: "1rem"
                    }}>
                        <li>unlimied sized messages</li>
                        <li>Bigger monthly upload limit (2 GB)</li>
                        <li>The Blast Badge (stays after subscription ends)</li>
                        <li>Custom backgrounds</li>
                        <li>and much more!</li>
                    </ul>
                </div>
                <div style={{
                    border: "solid 1px var(--light-bg-colour)",
                    borderRadius: "10px",
                    backgroundColor: "var(--dark-bg-colour)",
                    padding: "1rem",
                    margin: "1rem"
                }}><h5>Ready to go to space? <img src={blastIcon} height="20px" alt="🚀" /></h5>
                    <button className="subbutton"><img src={blastIcon} height="20px" alt="🚀" /> Subscribe</button>
                </div>
            </div>
        </div>

    </div >
}
export default Blast