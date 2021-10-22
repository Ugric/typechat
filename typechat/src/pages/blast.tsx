import blastIcon from "./images/Blast icon.svg";
import fuelIcon from "./images/fuel-pump.svg";
import meteorites from "./images/meteorites.svg";
import "./css/blast.css";
import { useState, useMemo, MouseEventHandler } from "react";
import useWindowSize from "../hooks/usescreensize";
import useApi from "../hooks/useapi";
import { useLocation, useHistory } from "react-router-dom";
import { parse } from "querystring";

import plant from "./images/planet.svg";
import plant1 from "./images/planet1.svg";
import plant2 from "./images/planet2.svg";
import solarsystem from "./images/solar-system.svg";

import satellite from "./images/satellite.svg";
import satellite1 from "./images/satellite1.svg";
import satellite2 from "./images/satellite2.svg";

function range(size: number, startAt = 0) {
  return [...Array(size).keys()].map((i) => i + startAt);
}

function StartButton({
  onClick,
}: {
  onClick?: MouseEventHandler<HTMLDivElement>;
}) {
  return (
    <div className="btnMain" onClick={onClick}>
      <div className="btnBox">BLAST OFF </div>
      <div className="btnBottom"></div>
    </div>
  );
}

function Star() {
  const [{ x, y, delay }] = useState({
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random(),
  });
  return (
    <div
      className="star"
      style={{ top: `${y}vh`, left: `${x}vw`, animationDelay: `-${delay}s` }}
    ></div>
  );
}

function Galaxy() {
  const [{ x, y, delay }] = useState({
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 10,
  });
  return (
    <div
      className="Galaxy"
      style={{ top: `${y}vh`, left: `${x}vw`, animationDelay: `-${delay}s` }}
    ></div>
  );
}

function Planet({ file }: { file: string }) {
  const [{ x, y, delay }] = useState({
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 10,
  });
  return (
    <div
      className="Planet"
      style={{
        top: `${y}vh`,
        left: `${x}vw`,
        animationDelay: `-${delay}s`,
        backgroundImage: `url(${file})`,
      }}
    ></div>
  );
}

function Satellite({ file }: { file: string }) {
  const [{ x, y, delay }] = useState({
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 10,
  });
  return (
    <div
      className="Satellite"
      style={{
        top: `${y}vh`,
        left: `${x}vw`,
        animationDelay: `-${delay}s`,
        backgroundImage: `url(${file})`,
      }}
    ></div>
  );
}

function StartPage() {
  const { width, height } = useWindowSize();

  const location = useLocation();
  const query: { [key: string]: string | string[] } = parse(
    location.search.slice(1)
  );
  const skip = !(String(query.skip) === "true");

  const [{ xalien, yalien }] = useState({
    xalien: 15 + Math.random() * 30 + "vw",
    yalien: 15 + Math.random() * 30 + "vh",
  });
  const stars = useMemo(
    () =>
      range(Math.round((width * height) / 10000)).map((value) => (
        <Star key={value}></Star>
      )),
    [width, height]
  );
  return (
    <div>
      <div>
        <div className="stars">{stars}</div>
        <Galaxy></Galaxy>

        <Planet file={plant} />
        <Planet file={plant1} />
        <Planet file={plant2} />
        <Planet file={solarsystem} />

        <Satellite file={satellite} />
        <Satellite file={satellite1} />
        <Satellite file={satellite2} />

        <div className="Alien" style={{ top: yalien, left: xalien }}></div>
      </div>
      {skip ? <div className="BlastRocket"></div> : <></>}
      <div className="meteorites"></div>
      <div className={`BlastMenu ${skip ? "BlastMenuAnimation" : ""}`}>
        <div
          style={{
            margin: "auto",
            border: "solid 1px var(--light-bg-colour)",
            borderRadius: "10px",
            backgroundColor: "var(--dark-glass-bg-colour)",
            padding: "1rem",
            maxWidth: "700px",
          }}
        >
          <h1 style={{ textAlign: "center" }}>
            Start Blast <img src={blastIcon} height="35px" alt="🚀" />
          </h1>
          <div
            style={{
              display: "grid",
              alignItems: "center",
              justifyContent: "center",
              alignContent: "space-evenly",
            }}
          >
            <label htmlFor="RF">
              How much Rocket Fuel do you want to spend? (max 10)
            </label>
            <input
              id="RF"
              type="number"
              min="1"
              max="10"
              defaultValue="1"
              onBlur={(e: any) => {
                e.target.value =
                  e.target.value > 10
                    ? 10
                    : e.target.value < 1
                    ? 1
                    : e.target.value;
              }}
            ></input>
            <StartButton></StartButton>
          </div>
        </div>
      </div>
    </div>
  );
}

function Blast() {
  const { data } =
    useApi<{ price: number; sale: number; startofweek: number }>(
      "/api/blastprices"
    );
  const { width, height } = useWindowSize();
  const history = useHistory();
  const location = useLocation();
  const query: { [key: string]: string | string[] } = parse(
    location.search.slice(1)
  );
  const skip = !(String(query.skip) === "true");

  const [{ xalien, yalien }] = useState({
    xalien: 15 + Math.random() * 30 + "vw",
    yalien: 15 + Math.random() * 30 + "vh",
  });
  const stars = useMemo(
    () =>
      range(Math.round((width * height) / 10000)).map((value) => (
        <Star key={value}></Star>
      )),
    [width, height]
  );
  const ends = data
    ? new Date(data.startofweek + 6.048e8).getUTCDate()
    : undefined;
  return (
    <div>
      <div>
        <div className="stars">{stars}</div>
        <Galaxy></Galaxy>

        <Planet file={plant} />
        <Planet file={plant1} />
        <Planet file={plant2} />
        <Planet file={solarsystem} />

        <Satellite file={satellite} />
        <Satellite file={satellite1} />
        <Satellite file={satellite2} />

        <div className="Alien" style={{ top: yalien, left: xalien }}></div>
      </div>

      {data && skip ? <div className="BlastRocket"></div> : <></>}
      <div className="meteorites"></div>
      {data ? (
        <div className={`BlastMenu ${skip ? "BlastMenuAnimation" : ""}`}>
          <div
            style={{
              margin: "auto",
              border: "solid 1px var(--light-bg-colour)",
              borderRadius: "10px",
              backgroundColor: "var(--dark-glass-bg-colour)",
              padding: "1rem",
              maxWidth: "700px",
            }}
          >
            <h1 style={{ textAlign: "center" }}>
              Blast <img src={blastIcon} height="35px" alt="🚀" />
            </h1>
            <div style={{ textAlign: "end" }}>
              <h3>
                GBP £{((data.price * (1 - data.sale)) / 100).toFixed(2)} /
                Rocket Fuel <img src={fuelIcon} height="35px" alt="⛽" />
              </h3>
              {data.sale ? (
                <h4>
                  <p>
                    {Math.round(data.sale * 100)}% off{" "}
                    <img src={meteorites} height="35px" alt="☄" />
                  </p>
                  <p style={{ fontSize: "15px" }}>
                    ends on the {ends}
                    {String(ends).endsWith("1")
                      ? "st"
                      : String(ends).endsWith("2")
                      ? "nd"
                      : String(ends).endsWith("1")
                      ? "rd"
                      : "th"}
                  </p>
                  <p style={{ fontSize: "10px" }}>
                    (was GBP £{(data.price / 100).toFixed(2)})
                  </p>
                </h4>
              ) : (
                <></>
              )}
            </div>
            <StartButton
              onClick={() => history.push("/blast/start?skip=true")}
            />
            <div
              style={{
                border: "solid 1px var(--light-bg-colour)",
                borderRadius: "10px",
                backgroundColor: "var(--dark-bg-colour)",
                padding: "1rem",
                margin: "1rem",
              }}
            >
              <h5>Features</h5>
              <div
                style={{
                  width: "100%",
                  height: "1px",
                  backgroundColor: "var(--light-bg-colour)",
                }}
              ></div>
              <ul
                style={{
                  margin: "1rem",
                }}
              >
                <li>unlimied sized messages</li>
                <li>
                  Bigger monthly upload limit (1 GB / Rocket Fuel{" "}
                  <img src={fuelIcon} height="15px" alt="⛽" />)
                </li>
                <li>Blast Profile Badge (stays forever!)</li>
                <li>Custom backgrounds</li>
                <li>and much more to come!</li>
              </ul>
            </div>
            <div
              style={{
                border: "solid 1px var(--light-bg-colour)",
                borderRadius: "10px",
                backgroundColor: "var(--dark-bg-colour)",
                padding: "1rem",
                margin: "1rem",
              }}
            >
              <h5>
                Need fuel? <img src={fuelIcon} height="20px" alt="⛽" />
              </h5>
              <button
                className="subbutton"
                disabled
                style={{ opacity: 0.25, cursor: "not-allowed" }}
              >
                Buy Rocket Fuel <img src={fuelIcon} height="25px" alt="⛽" />
              </button>
              <p style={{ textAlign: "center" }}>
                Sorry, Rocket Fuel is unable to be bought at the moment. When
                TypeChat leaves beta, all beta testing account will get 1 free
                Rocket Fuel!
              </p>
            </div>
            <div
              style={{
                border: "solid 1px var(--light-bg-colour)",
                borderRadius: "10px",
                backgroundColor: "var(--dark-glass-bg-colour)",
                padding: "1rem",
                margin: "1rem",
              }}
            >
              <h5>
                Ready to go to space?{" "}
                <img src={blastIcon} height="20px" alt="🚀" />
              </h5>
              <StartButton
                onClick={() => history.push("/blast/start?skip=true")}
              />
            </div>
          </div>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}
const exportedObject = { Blast, StartPage };

export default exportedObject;
