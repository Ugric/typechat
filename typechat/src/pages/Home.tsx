import { Redirect, useHistory } from "react-router-dom";
import { useData } from "../hooks/datahook";
import appPage from "./images/app page-compressed.png";
import "./css/home.css";
import playSound from "../playsound";

function isRunningStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches;
}

function Home() {
  const history = useHistory();
  const standalone = isRunningStandalone();
  const { loggedin } = useData();
  if (!loggedin) {
    return (
      <div style={{ textAlign: "center", padding: "1rem", overflow: "hidden" }}>
        <h1
          className="slideinright"
          style={{
            fontSize: "75px",
            color: "var(--primary-text-colour)",
            animationDuration: "2s",
          }}
        >
          Hello.
        </h1>
        <h1
          className="slideinleft"
          style={{
            color: "var(--secondary-text-colour)",
            animationDuration: "2s",
            animationDelay: "1.5s",
          }}
        >
          Welcome to TypeChat.
        </h1>
        <h3
          className="slideinright"
          style={{
            animationDuration: "2s",
            animationDelay: "3s",
            paddingBottom: "1rem",
          }}
        >
          Type to your friends. Powered by TypeScript.
        </h3>
        <p
          className="slideinleft"
          style={{
            animationDuration: "2s",
            animationDelay: "4.5s",
            maxWidth: "35rem",
            paddingBottom: "1rem",
            margin: "auto",
          }}
        >
          Chatting with your friends has never been easier, thanks to TypeChat,
          a free, cross-platform, and secure chat app that lets you chat with
          your friends. You can download TypeChat for free, and it runs on all
          platforms.
        </p>
        <div
          className="logindraw"
          style={{
            animationDuration: "2s",
            animationDelay: standalone ? "6s" : "7.5s",
          }}
        >
          <div>
            <button
              onPointerDown={() => {
                playSound("/sounds/click2.mp3");
              }}
              onPointerUp={() => {
                playSound("/sounds/click1.mp3");
              }}
              onClick={() => {
                history.push("/login");
              }}
              style={{
                margin: "0.5rem",
                padding: "1rem",
                maxWidth: "250px",
                width: "100%",
                border: "none",
                borderRadius: "50px",
                background:
                  "linear-gradient(45deg, var(--dark-bg-colour) 0%, var(--light-bg-colour) 100%)",
                color: "white",
                fontFamily: '"Source Sans Pro", sans-serif',
                fontSize: "20px",
                boxShadow: "rgb(0, 0, 0) 0px 6px 5px 0px",
              }}
            >
              Login
            </button>
            <button
              onPointerDown={() => {
                playSound("/sounds/click2.mp3");
              }}
              onPointerUp={() => {
                playSound("/sounds/click1.mp3");
              }}
              onClick={() => {
                history.push("/signup");
              }}
              style={{
                margin: "0.5rem",
                padding: "1rem",
                maxWidth: "250px",
                width: "100%",
                border: "none",
                borderRadius: "50px",
                background:
                  "linear-gradient(45deg, var(--dark-bg-colour) 0%, var(--light-bg-colour) 100%)",
                color: "white",
                fontFamily: '"Source Sans Pro", sans-serif',
                fontSize: "20px",
                boxShadow: "rgb(0, 0, 0) 0px 6px 5px 0px",
              }}
            >
              Sign Up
            </button>
          </div>
        </div>
        {standalone ? (
          <></>
        ) : (
          <img
            className="slideinright"
            alt="phone app"
            src={appPage}
            style={{
              width: "100%",
              maxWidth: "350px",
              animationDuration: "2s",
              animationDelay: "6s",
            }}
            
          ></img>
        )}
      </div>
    );
  }
  return <Redirect to="/contacts"></Redirect>;
}

export default Home;
