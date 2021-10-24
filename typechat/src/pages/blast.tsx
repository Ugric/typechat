import blastIcon from "./images/Blast icon.svg";
import fuelIcon from "./images/fuel-pump.svg";
import meteorites from "./images/meteorites.svg";
import "./css/blast.css";
import { useState, useMemo, MouseEventHandler } from "react";
import useWindowSize from "../hooks/usescreensize";
import useApi from "../hooks/useapi";
import { useLocation, useHistory } from "react-router-dom";
import { parse } from "querystring";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import plant from "./images/planet.svg";
import plant1 from "./images/planet1.svg";
import plant2 from "./images/planet2.svg";
import solarsystem from "./images/solar-system.svg";

import satellite from "./images/satellite.svg";
import satellite1 from "./images/satellite1.svg";
import satellite2 from "./images/satellite2.svg";
import playSound from "../playsound";
import { useData } from "../hooks/datahook";

function range(size: number, startAt = 0) {
  return [...Array(size).keys()].map((i) => i + startAt);
}

function StartButton({
  onClick,
  disabled,
}: {
  onClick?: MouseEventHandler<HTMLDivElement>;
  disabled?: boolean;
}) {
  return (
    <div
      className="btnMain"
      onClick={!disabled ? onClick : undefined}
      onPointerDown={() => {
        playSound("/sounds/click2.mp3");
      }}
      onPointerUp={() => {
        playSound("/sounds/click1.mp3");
      }}
    >
      <div className="btnBox">BLAST OFF</div>
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

function Blast() {
  const { data } =
    useApi<{ price: number; sale: number; startofweek: number }>(
      "/api/blastprices"
    );
  const { width, height } = useWindowSize();
  const location = useLocation();
  const { user } = useData();
  const history = useHistory();
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
  const max = user?.rocketFuel
    ? user.rocketFuel > 10
      ? 10
      : user.rocketFuel
    : 0;
  const ends = data
    ? new Date(data.startofweek + 6.048e8).getUTCDate()
    : undefined;
  const [menupage, setmenupage] = useState("main");
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
            {menupage === "main" ? (
              <>
                <h1 style={{ textAlign: "center" }}>
                  Blast{" "}
                  <img
                    src={blastIcon}
                    height="35px"
                    alt="🚀"
                    className="icon"
                  />
                </h1>
                <div style={{ textAlign: "end" }}>
                  <h3>
                    £{((data.price * (1 - data.sale)) / 100).toFixed(2)} /
                    Rocket Fuel{" "}
                    <img
                      src={fuelIcon}
                      height="35px"
                      alt="⛽"
                      className="icon"
                    />
                  </h3>
                  {data.sale ? (
                    <h4>
                      <p>
                        {Math.round(data.sale * 100)}% off{" "}
                        <img
                          src={meteorites}
                          height="35px"
                          alt="☄"
                          className="icon"
                        />
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
                        (was £{(data.price / 100).toFixed(2)})
                      </p>
                    </h4>
                  ) : (
                    <></>
                  )}
                </div>
                {user ? (
                  <h5 style={{ textAlign: "center" }}>
                    you have {user.rocketFuel} Rocket Fuel{" "}
                    <img
                      src={fuelIcon}
                      height="25px"
                      alt="⛽"
                      className="icon"
                    />
                  </h5>
                ) : (
                  <></>
                )}
                <StartButton
                  onClick={() =>
                    user
                      ? max > 0
                        ? setmenupage("start")
                        : window.location.replace("#fuel")
                      : history.push(
                          "/login?" + new URLSearchParams({ to: "/blast" })
                        )
                  }
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
                      <img
                        src={fuelIcon}
                        height="15px"
                        alt="⛽"
                        className="icon"
                      />
                      )
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
                    Need fuel?{" "}
                    <img
                      src={fuelIcon}
                      height="20px"
                      alt="⛽"
                      className="icon"
                    />
                  </h5>
                  <button
                    id="fuel"
                    className="subbutton"
                    disabled
                    style={{ opacity: 0.25, cursor: "not-allowed" }}
                  >
                    Buy Rocket Fuel{" "}
                    <img
                      src={fuelIcon}
                      height="25px"
                      alt="⛽"
                      className="icon"
                    />
                  </button>
                  <p style={{ textAlign: "center" }}>
                    Sorry, Rocket Fuel is unable to be bought at the moment.
                    When TypeChat leaves beta, all beta testing account will get
                    1 free Rocket Fuel!
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
                    <img
                      src={blastIcon}
                      height="20px"
                      alt="🚀"
                      className="icon"
                    />
                  </h5>
                  <StartButton
                    onClick={() =>
                      user
                        ? max > 0
                          ? setmenupage("start")
                          : window.location.replace("#fuel")
                        : history.push(
                            "/login?" + new URLSearchParams({ to: "/blast" })
                          )
                    }
                  />
                </div>
              </>
            ) : menupage === "start" ? (
              <>
                <FontAwesomeIcon
                  icon={faTimes}
                  onClick={() => setmenupage("main")}
                  style={{
                    cursor: "pointer",
                    fontSize: "30px",
                    float: "right",
                  }}
                />
                <h1 style={{ textAlign: "center" }}>
                  Start Blast{" "}
                  <img
                    src={blastIcon}
                    height="35px"
                    alt="🚀"
                    className="icon"
                  />
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
                    How much Rocket Fuel do you want to spend? (max {max})
                  </label>
                  <input
                    id="RF"
                    type="number"
                    min="1"
                    max={max}
                    defaultValue="1"
                    onBlur={(e: any) => {
                      e.target.value =
                        e.target.value > max
                          ? max
                          : e.target.value < 1
                          ? 1
                          : e.target.value;
                    }}
                  ></input>
                  <StartButton onClick={() => setmenupage("TY")}></StartButton>
                </div>
              </>
            ) : (
              <>
                <FontAwesomeIcon
                  icon={faTimes}
                  onClick={() => setmenupage("main")}
                  style={{
                    cursor: "pointer",
                    fontSize: "30px",
                    float: "right",
                  }}
                />
                <h1 style={{ textAlign: "center" }}>Thank you</h1>
                <div
                  style={{
                    border: "solid 1px var(--light-bg-colour)",
                    borderRadius: "10px",
                    backgroundColor: "var(--dark-bg-colour)",
                    padding: "1rem",
                    margin: "1rem",
                  }}
                >
                  <p style={{ textAlign: "center" }}>
                    Thank you {user.username}, the TypeChat team hope you like
                    Blast. If there are any suggestions, issues or complains,
                    please contact{" "}
                    <a
                      target="blank_"
                      href="/chat/TypeChat"
                      style={{ color: "var(--secondary-text-colour)" }}
                    >
                      the offical TypeChat account
                    </a>
                    !
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}
const exportedObject = { Blast };

export default exportedObject;
