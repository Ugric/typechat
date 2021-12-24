import { useEffect, useRef, useState } from "react";
import ReactModal from "react-modal";
import { Redirect, useHistory } from "react-router-dom";
import { useData } from "../hooks/datahook";
import useApi from "../hooks/useapi";
import useIsChistmas from "../hooks/usIsChristmas";
import "./css/christmas.css";
import christmasbackground from "./images/backgrounds/christmas.jpg";
import present from "./images/gift.svg";

function Snowflake() {
  const [left] = useState(Math.random() * 100 + "%");
  const [animationDelay] = useState(
    `${Math.random() * 10}s, ${Math.random() * 10}s`
  );
  const snowflaketext = [
    "❅",
    "❆",
    "❄",
    "❅",
    "❆",
    "❄",
    "❅",
    "❆",
    "❄",
    "❅",
    "❆",
    "❄",
    "❅",
  ];
  const [snowflake] = useState(
    snowflaketext[Math.floor(Math.random() * snowflaketext.length)]
  );
  const [animationDuration] = useState(`${Math.random() * 5 + 4}s`);
  const [fontSize] = useState(`${Math.random() * 15 + 20}px`);
  return (
    <div
      className="snowflake"
      style={{
        left,
        animationDelay,
        animationDuration,
        fontSize,
      }}
    >
      {snowflake}
    </div>
  );
}

function Snowflakes({ amount }: { amount?: number }) {
  const isChristmas = useIsChistmas();
  return isChristmas ? (
    <div className="snowflakes">
      {new Array(amount ? amount : 10).fill(1).map((_, i) => (
        <Snowflake key={i} />
      ))}
    </div>
  ) : (
    <></>
  );
}

function Christmas() {
    const isChristmas = useIsChistmas();
    const history = useHistory()
  const { data, loading, error } = useApi<boolean>("/api/hasopened");
  const { loggedin } = useData();
  const [isOpen, setIsOpen] = useState(true);
  const [points, setPoints] = useState<number | boolean>(false);
  useEffect(() => {
    if (typeof data == "boolean") {
      setIsOpen(data);
    }
  }, [data]);
  if (!isChristmas) {
    return <Redirect to="/"></Redirect>;
  }
  return (
    <>
      <Snowflakes amount={5} />
      <div
        style={{
          position: "fixed",
          top: "0",
          left: "0",
          width: "100vw",
          height: "100vh",
          backgroundImage: `url(${christmasbackground})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center",
          zIndex: "-100",
        }}
      />
      <div style={{ padding: "1rem" }}>
        <div
          style={{
            margin: "auto",
            border: "solid 1px var(--light-bg-colour)",
            borderRadius: "10px",
            backgroundColor: "var(--dark-glass-bg-colour)",
            padding: "1rem",
            maxWidth: "700px",
            textAlign: "center",
          }}
        >
          <h1>Merry Christmas!</h1>
          <div
            style={{
              width: "100%",
              height: "1px",
              backgroundColor: "var(--light-bg-colour)",
            }}
          ></div>
          <ReactModal
            isOpen={Boolean(points)}
            shouldCloseOnEsc={true}
            shouldCloseOnOverlayClick={true}
            onRequestClose={() => setPoints(false)}
            style={{
              overlay: {
                backgroundColor: "rgb(18 18 18 / 50%)",
                zIndex: 10,
              },
              content: {
                backgroundColor: "var(--dark-mode)",
                border: "1px solid var(--dark-bg-colour)",
                borderRadius: "10px",
                padding: "1rem",
                zIndex: 11,
                top: "50%",
                left: "50%",
                right: "auto",
                bottom: "auto",
                marginRight: "-50%",
                transform: "translate(-50%, -50%)",
                width: "75%",
                maxWidth: "750px",
                textAlign: "center",
                maxHeight: "500px",
              },
            }}
          >
            <h1>Merry Chistmas from the TypeChat Team 🎅🏻</h1>
            <p>
              In your prize you got: {points} Rocket Fuel 🚀 and the Chistmas{" "}
              {new Date().getFullYear()} Profile Badge!
            </p>
          </ReactModal>
          <img
            src={present}
            style={{
              maxWidth: "300px",
              width: "100%",
              cursor: !isOpen ? "pointer" : "not-allowed",
              opacity: isOpen ? "0.25" : undefined,
            }}
                      alt="present 🎁"
                      title="present 🎁"
                      onClick={() => {
                          if (loggedin) {
                              if (!isOpen) {
                                  setIsOpen(true);
                                  fetch("/api/openchristmaspresent", {
                                      method: "POST",
                                  })
                                      .then((res) => res.json())
                                      .then((res) => {
                                          setPoints(res.points);
                                      })
                                      .catch(() => {
                                          setIsOpen(false);
                                      });
                              }
                          } else {
                              history.push("/login?" + new URLSearchParams({to: '/christmas'}));
                          }
            }}
            className={!isOpen ? "icon" : undefined}
          ></img>
          <h2>
            {isOpen
              ? loading || error?'':"You have already opened your Present for this year have a Merry Christmas! 🎅🏻"
              : "Here is a gift from the TypeChat Team! 🎁"}
          </h2>
        </div>
      </div>
    </>
  );
}

export default Christmas;
export { Snowflakes };
