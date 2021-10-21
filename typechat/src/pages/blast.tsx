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
  onClick: MouseEventHandler<HTMLDivElement>;
}) {
  return (
    <div className="wrapper">
      <div className="cta" onClick={onClick}>
        <span>START</span>
        <span>
          <svg width="66px" height="43px" style={{ verticalAlign: "top" }}>
            <g
              id="arrow"
              stroke="none"
              stroke-width="1"
              fill="none"
              fill-rule="evenodd"
            >
              <path
                className="one"
                d="M40.1543933,3.89485454 L43.9763149,0.139296592 C44.1708311,-0.0518420739 44.4826329,-0.0518571125 44.6771675,0.139262789 L65.6916134,20.7848311 C66.0855801,21.1718824 66.0911863,21.8050225 65.704135,22.1989893 C65.7000188,22.2031791 65.6958657,22.2073326 65.6916762,22.2114492 L44.677098,42.8607841 C44.4825957,43.0519059 44.1708242,43.0519358 43.9762853,42.8608513 L40.1545186,39.1069479 C39.9575152,38.9134427 39.9546793,38.5968729 40.1481845,38.3998695 C40.1502893,38.3977268 40.1524132,38.395603 40.1545562,38.3934985 L56.9937789,21.8567812 C57.1908028,21.6632968 57.193672,21.3467273 57.0001876,21.1497035 C56.9980647,21.1475418 56.9959223,21.1453995 56.9937605,21.1432767 L40.1545208,4.60825197 C39.9574869,4.41477773 39.9546013,4.09820839 40.1480756,3.90117456 C40.1501626,3.89904911 40.1522686,3.89694235 40.1543933,3.89485454 Z"
                fill="#FFFFFF"
              ></path>
              <path
                className="two"
                d="M20.1543933,3.89485454 L23.9763149,0.139296592 C24.1708311,-0.0518420739 24.4826329,-0.0518571125 24.6771675,0.139262789 L45.6916134,20.7848311 C46.0855801,21.1718824 46.0911863,21.8050225 45.704135,22.1989893 C45.7000188,22.2031791 45.6958657,22.2073326 45.6916762,22.2114492 L24.677098,42.8607841 C24.4825957,43.0519059 24.1708242,43.0519358 23.9762853,42.8608513 L20.1545186,39.1069479 C19.9575152,38.9134427 19.9546793,38.5968729 20.1481845,38.3998695 C20.1502893,38.3977268 20.1524132,38.395603 20.1545562,38.3934985 L36.9937789,21.8567812 C37.1908028,21.6632968 37.193672,21.3467273 37.0001876,21.1497035 C36.9980647,21.1475418 36.9959223,21.1453995 36.9937605,21.1432767 L20.1545208,4.60825197 C19.9574869,4.41477773 19.9546013,4.09820839 20.1480756,3.90117456 C20.1501626,3.89904911 20.1522686,3.89694235 20.1543933,3.89485454 Z"
                fill="#FFFFFF"
              ></path>
              <path
                className="three"
                d="M0.154393339,3.89485454 L3.97631488,0.139296592 C4.17083111,-0.0518420739 4.48263286,-0.0518571125 4.67716753,0.139262789 L25.6916134,20.7848311 C26.0855801,21.1718824 26.0911863,21.8050225 25.704135,22.1989893 C25.7000188,22.2031791 25.6958657,22.2073326 25.6916762,22.2114492 L4.67709797,42.8607841 C4.48259567,43.0519059 4.17082418,43.0519358 3.97628526,42.8608513 L0.154518591,39.1069479 C-0.0424848215,38.9134427 -0.0453206733,38.5968729 0.148184538,38.3998695 C0.150289256,38.3977268 0.152413239,38.395603 0.154556228,38.3934985 L16.9937789,21.8567812 C17.1908028,21.6632968 17.193672,21.3467273 17.0001876,21.1497035 C16.9980647,21.1475418 16.9959223,21.1453995 16.9937605,21.1432767 L0.15452076,4.60825197 C-0.0425130651,4.41477773 -0.0453986756,4.09820839 0.148075568,3.90117456 C0.150162624,3.89904911 0.152268631,3.89694235 0.154393339,3.89485454 Z"
                fill="#FFFFFF"
              ></path>
            </g>
          </svg>
        </span>
      </div>
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
              border: "solid 1px var(--light-bg-colour)",
              borderRadius: "10px",
              backgroundColor: "var(--dark-bg-colour)",
              padding: "1rem",
              margin: "1rem",
            }}
          >
            <input></input>
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
                Ready to go to space?{" "}
                <img src={blastIcon} height="20px" alt="🚀" />
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
