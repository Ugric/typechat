import blastIcon from "./images/Blast icon.svg";
import fuelIcon from "./images/fuel-pump.svg";
import meteorites from "./images/meteorites.svg";
import "./css/blast.css";
import { useState, useMemo, MouseEventHandler, useRef } from "react";
import useWindowSize from "../hooks/usescreensize";
import useApi from "../hooks/useapi";
import { useHistory } from "react-router-dom";
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
import { PayPalButton } from "react-paypal-button-v2";
import { GoogleReCaptcha } from "react-google-recaptcha-v3";

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
      onClick={ !disabled ? onClick : undefined }
      onPointerDown={ () => {
        playSound("/sounds/click2.mp3");
      } }
      onPointerUp={ () => {
        playSound("/sounds/click1.mp3");
      } }
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
      style={ { top: `${y}vh`, left: `${x}vw`, animationDelay: `-${delay}s` } }
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
      style={ { top: `${y}vh`, left: `${x}vw`, animationDelay: `-${delay}s` } }
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
      style={ {
        top: `${y}vh`,
        left: `${x}vw`,
        animationDelay: `-${delay}s`,
        backgroundImage: `url(${file})`,
      } }
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
      style={ {
        top: `${y}vh`,
        left: `${x}vw`,
        animationDelay: `-${delay}s`,
        backgroundImage: `url(${file})`,
      } }
    ></div>
  );
}

function Blast() {
  const { width, height } = useWindowSize();
  const { user, notifications } = useData();
  const history = useHistory();

  const [{ xalien, yalien }] = useState({
    xalien: 15 + Math.random() * 30 + "vw",
    yalien: 15 + Math.random() * 30 + "vh",
  });
  const fuel = useRef(1)
  const [buyfuel, setbuyfuel] = useState(1)
  const stars = useMemo(
    () =>
      range(Math.round((width * height) / 10000)).map((value) => (
        <Star key={ value }></Star>
      )),
    [width, height]
  );
  const [menupage, setmenupage] = useState("main");
  const { data } =
    useApi<{ price: number; sale: number; startofweek: number }>(menupage === "main" ? "/api/blastprices"
      : null);
  const max = user?.rocketFuel
    ? user.rocketFuel > 20
      ? 20 - (user.blast ? user.blast : 0)
      : user.rocketFuel
    : 0;
  const ends = data
    ? new Date(data.startofweek + 6.048e8).getUTCDate()
    : undefined;
  const [recapToken, setRecapToken] = useState<null | string>(null);
  const price = data ? ((data.price * (1 - data.sale)) / 100) : undefined
  return (
    <div>
      <div>
        <div className="stars">{ stars }</div>
        <Galaxy></Galaxy>

        <Planet file={ plant } />
        <Planet file={ plant1 } />
        <Planet file={ plant2 } />
        <Planet file={ solarsystem } />

        <Satellite file={ satellite } />
        <Satellite file={ satellite1 } />
        <Satellite file={ satellite2 } />

        <div className="Alien" style={ { top: yalien, left: xalien } }></div>
      </div>

      { data ? <div className="BlastRocket"></div> : <></> }
      <div className="meteorites"></div>
      { data ? (
        <div className={ `BlastMenu BlastMenuAnimation` }>
          <div
            style={ {
              margin: "auto",
              border: "solid 1px var(--light-bg-colour)",
              borderRadius: "10px",
              backgroundColor: "var(--dark-glass-bg-colour)",
              padding: "1rem",
              maxWidth: "700px",
            } }
          >
            { menupage === "main" ? (
              <>
                <h1 style={ { textAlign: "center" } }>
                  Blast{ " " }
                  <img
                    src={ blastIcon }
                    height="35px"
                    alt="🚀"
                    className="icon"
                  />
                </h1>
                <div style={ { textAlign: "end" } }>
                  <h3>
                    £{ price?.toFixed(2) } /
                    Rocket Fuel{ " " }
                    <img
                      src={ fuelIcon }
                      height="35px"
                      alt="⛽"
                      className="icon"
                    />
                  </h3>
                  { data.sale ? (
                    <h4>
                      <p>
                        { Math.round(data.sale * 100) }% off{ " " }
                        <img
                          src={ meteorites }
                          height="35px"
                          alt="☄"
                          className="icon"
                        />
                      </p>
                      <p style={ { fontSize: "15px" } }>
                        ends on the { ends }
                        { String(ends).endsWith("1")
                          ? "st"
                          : String(ends).endsWith("2")
                            ? "nd"
                            : String(ends).endsWith("1")
                              ? "rd"
                              : "th" }
                      </p>
                      <p style={ { fontSize: "10px" } }>
                        (was £{ (data.price / 100).toFixed(2) })
                      </p>
                    </h4>
                  ) : (
                    <></>
                  ) }
                </div>
                { user ? (
                  <h5 style={ { textAlign: "center" } }>
                    you have { user.rocketFuel } Rocket Fuel{ " " }
                    <img
                      src={ fuelIcon }
                      height="25px"
                      alt="⛽"
                      className="icon"
                    />
                  </h5>
                ) : (
                  <></>
                ) }
                <StartButton
                  onClick={ () =>
                    user
                      ? max > 0
                        ? setmenupage("start")
                        : user?.rocketFuel > 0 ?
                          notifications.addNotification({
                            title: "Unable to Add More Fuel!",
                            message: "Sorry, you have reached the monthly Blast limit, you may add Rocket Fuel when this months Rocket Fuel has ran out.",
                            type: "danger",
                            insert: "top",
                            container: "top-right",
                            animationIn: ["animate__animated", "animate__fadeIn"],
                            animationOut: ["animate__animated", "animate__fadeOut"],
                            dismiss: {
                              pauseOnHover: true,
                              duration: 5000,
                              onScreen: true,
                            },
                          }) : window.location.replace("#fuel")
                      : history.push(
                        "/login?" + new URLSearchParams({ to: "/blast" })
                      )
                  }
                />
                <div
                  style={ {
                    border: "solid 1px var(--light-bg-colour)",
                    borderRadius: "10px",
                    backgroundColor: "var(--dark-bg-colour)",
                    padding: "1rem",
                    margin: "1rem",
                  } }
                >
                  <h5>1 Rocket Fuel Gives You</h5>
                  <div
                    style={ {
                      width: "100%",
                      height: "1px",
                      backgroundColor: "var(--light-bg-colour)",
                    } }
                  ></div>
                  <ul
                    style={ {
                      margin: "1rem",
                    } }
                  >
                    <li>+1000 charicters per messages</li>
                    <li>
                      Bigger monthly upload limit (500 MB)
                    </li>
                    <li>Blast Profile Badge (stays forever!)</li>
                    <li>Custom backgrounds</li>
                    <li>and much more to come!</li>
                  </ul>
                </div>
                <div
                  style={ {
                    border: "solid 1px var(--light-bg-colour)",
                    borderRadius: "10px",
                    backgroundColor: "var(--dark-bg-colour)",
                    padding: "1rem",
                    margin: "1rem",
                  } }
                >
                  <h5>
                    Need fuel?{ " " }
                    <img
                      src={ fuelIcon }
                      height="20px"
                      alt="⛽"
                      className="icon"
                    />
                  </h5>
                  <button
                    id="fuel"
                    className="subbutton"
                    onClick={ () => setmenupage("buy") }
                  >
                    Buy Rocket Fuel{ " " }
                    <img
                      src={ fuelIcon }
                      height="25px"
                      alt="⛽"
                      className="icon"
                    />
                  </button>
                </div>
                <div
                  style={ {
                    border: "solid 1px var(--light-bg-colour)",
                    borderRadius: "10px",
                    backgroundColor: "var(--dark-glass-bg-colour)",
                    padding: "1rem",
                    margin: "1rem",
                  } }
                >
                  <h5>
                    Ready to go to space?{ " " }
                    <img
                      src={ blastIcon }
                      height="20px"
                      alt="🚀"
                      className="icon"
                    />
                  </h5>
                  <StartButton
                    onClick={ () =>
                      user
                        ? max > 0
                          ? setmenupage("start")
                          : user?.rocketFuel > 0 ?
                            notifications.addNotification({
                              title: "Unable to Add More Fuel!",
                              message: "Sorry, you have reached the monthly Blast limit, you may add Rocket Fuel when this months Rocket Fuel has ran out.",
                              type: "danger",
                              insert: "top",
                              container: "top-right",
                              animationIn: ["animate__animated", "animate__fadeIn"],
                              animationOut: ["animate__animated", "animate__fadeOut"],
                              dismiss: {
                                pauseOnHover: true,
                                duration: 5000,
                                onScreen: true,
                              },
                            }) : window.location.replace("#fuel")
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
                  icon={ faTimes }
                  onClick={ () => setmenupage("main") }
                  style={ {
                    cursor: "pointer",
                    fontSize: "30px",
                    float: "right",
                  } }
                />
                <h1 style={ { textAlign: "center" } }>
                  Start Blast{ " " }
                  <img
                    src={ blastIcon }
                    height="35px"
                    alt="🚀"
                    className="icon"
                  />
                </h1>
                <div
                  style={ {
                    display: "grid",
                    alignItems: "center",
                    justifyContent: "center",
                    alignContent: "space-evenly",
                  } }
                >
                  <label htmlFor="RF">
                    How much Rocket Fuel do you want to spend? (max { max })
                  </label>
                  <input
                    id="RF"
                    type="number"
                    min={ fuel.current }
                    max={ max }
                    defaultValue="1"
                    onBlur={ (e: any) => {
                      e.target.value = Math.floor(
                        e.target.value > max
                          ? max
                          : e.target.value < 1
                            ? 1
                            : e.target.value);
                    } }
                    onChange={ (e: any) => {
                      fuel.current = Math.floor(e.target.value > max
                        ? max
                        : e.target.value < 1
                          ? 1
                          : e.target.value)
                    } }
                  ></input>
                  <StartButton onClick={ () => {
                    setmenupage("TY")
                    const formdata = new FormData()
                    formdata.append("fuel", JSON.stringify(fuel.current))
                    fetch("/api/startrocketfuel", {
                      method: "POST",
                      body: formdata
                    }).then(console.log);
                  } }></StartButton>
                </div>
              </>
            ) : menupage === "TY" ? (
              <>
                <FontAwesomeIcon
                  icon={ faTimes }
                  onClick={ () => setmenupage("main") }
                  style={ {
                    cursor: "pointer",
                    fontSize: "30px",
                    float: "right",
                  } }
                />
                <h1 style={ { textAlign: "center" } }>Thank you</h1>
                <div
                  style={ {
                    border: "solid 1px var(--light-bg-colour)",
                    borderRadius: "10px",
                    backgroundColor: "var(--dark-bg-colour)",
                    padding: "1rem",
                    margin: "1rem",
                  } }
                >
                  <p style={ { textAlign: "center" } }>
                    Thank you { user.username }, the TypeChat team hope you like
                    Blast. If there are any suggestions, issues or complains,
                    please contact{ " " }
                    <a
                      target="blank_"
                      href="/chat/TypeChat"
                      style={ { color: "var(--secondary-text-colour)" } }
                    >
                      the offical TypeChat account
                    </a>
                    !
                  </p>
                </div>
              </>
            ) : menupage === "buy" ? <>
              <GoogleReCaptcha
                onVerify={ (token) => {
                  setRecapToken(token);
                } }
              />
              <FontAwesomeIcon
                icon={ faTimes }
                onClick={ () => setmenupage("main") }
                style={ {
                  cursor: "pointer",
                  fontSize: "30px",
                  float: "right",
                } }
              />
              <h1 style={ { textAlign: "center" } }>Buy Rocket Fuel{ " " }
                <img
                  src={ fuelIcon }
                  height="35px"
                  alt="⛽"
                  className="icon"
                /></h1><div style={ { textAlign: "end" } }>
                <h3>
                  £{ price?.toFixed(2) } /
                  Rocket Fuel{ " " }
                  <img
                    src={ fuelIcon }
                    height="35px"
                    alt="⛽"
                    className="icon"
                  />
                </h3>
                { data.sale ? (
                  <h4>
                    <p>
                      { Math.round(data.sale * 100) }% off{ " " }
                      <img
                        src={ meteorites }
                        height="35px"
                        alt="☄"
                        className="icon"
                      />
                    </p>
                    <p style={ { fontSize: "15px" } }>
                      ends on the { ends }
                      { String(ends).endsWith("1")
                        ? "st"
                        : String(ends).endsWith("2")
                          ? "nd"
                          : String(ends).endsWith("1")
                            ? "rd"
                            : "th" }
                    </p>
                    <p style={ { fontSize: "10px" } }>
                      (was £{ (data.price / 100).toFixed(2) })
                    </p>
                  </h4>
                ) : (
                  <></>
                ) }
              </div>
              <div
                style={ {
                  display: "grid",
                  alignItems: "center",
                  justifyContent: "center",
                  alignContent: "space-evenly",
                } }
              >
                <label htmlFor="RF">
                  How much Rocket Fuel do you want to buy? (max 1000)
                </label>
                <input
                  id="RF"
                  type="number"
                  max="1000"
                  defaultValue={ buyfuel }
                  onBlur={ (e: any) => {
                    e.target.value = Math.floor(
                      e.target.value > 1000
                        ? 1000
                        : e.target.value < 1
                          ? 1
                          : e.target.value);
                  } }
                  onChange={ (e: any) => {
                    setbuyfuel(Math.floor(e.target.value > 1000
                      ? 1000
                      : e.target.value < 1
                        ? 1
                        : e.target.value))
                  } }
                ></input></div>
              <div
                style={ {
                  borderRadius: "10px",
                  backgroundColor: "white",
                  padding: "1rem",
                  margin: "1rem 0",
                } }
              >
                <h2 style={ { textAlign: "end", color: "var(--dark-mode)" } }>Total: £{ (Number(price) * buyfuel).toFixed(2) }</h2>
                { recapToken ? <PayPalButton
                  amount={ String(Number(price) * buyfuel) }
                  shippingPreference="NO_SHIPPING"
                  onApprove={ async (data: { orderID: string | Blob; payerID: string | Blob; }, actions: { order: { capture: () => Promise<any>; }; }) => {
                    // Capture the funds from the transaction
                    console.log(actions)
                    const formdata = new FormData();
                    formdata.append(
                      "orderID", data.orderID);
                    formdata.append(
                      "payerID", data.payerID);
                    formdata.append("g-recaptcha-response", recapToken);
                    formdata.append("quantity", JSON.stringify(buyfuel));
                    console.log(data);
                    return await fetch("/api/paypal-buy-rocket-fuel", {
                      method: "post",
                      body: formdata
                    }).then(async (resp) => {
                      if (resp.status === 200) {
                        console.log("success")
                        setmenupage("buyTY")
                      } else {
                        console.log("error")
                        notifications.addNotification({
                          title: "Failed!",
                          message: "Sorry, there was an issue buying the Rocket Fuel, you have not been charged.",
                          type: "danger",
                          insert: "top",
                          container: "top-right",
                          animationIn: ["animate__animated", "animate__fadeIn"],
                          animationOut: ["animate__animated", "animate__fadeOut"],
                        })
                      }
                    }).catch(() =>
                      notifications.addNotification({
                        title: "Failed!",
                        message: "Sorry, there was an issue buying the Rocket Fuel, you have not been charged.",
                        type: "danger",
                        insert: "top",
                        container: "top-right",
                        animationIn: ["animate__animated", "animate__fadeIn"],
                        animationOut: ["animate__animated", "animate__fadeOut"],
                      }));
                  } }
                  onError={ () => {
                    notifications.addNotification({
                      title: "Failed!",
                      message: "Sorry, there was an issue buying the Rocket Fuel, you have not been charged.",
                      type: "danger",
                      insert: "top",
                      container: "top-right",
                      animationIn: ["animate__animated", "animate__fadeIn"],
                      animationOut: ["animate__animated", "animate__fadeOut"],
                      dismiss: {
                        pauseOnHover: true,
                        duration: 5000,
                        onScreen: true,
                      },
                    })
                  } } currency={ "GBP" }
                  options={ {
                    currency: "GBP", "clientId": !process.env.NODE_ENV || process.env.NODE_ENV === 'development' ? "AeuWaW6AFfWlxVmxWYsof3Z9Gl6a055HPJh_UQO-0v1Fb5I12UYwteo_JsiitmIncsQETAu0Yw81wfH0" : "Afdcs6hnKtTzRMY5fV_hT60anRq51JteUwrlpchS3Rs3LyEp6a33tqWmhhzj6jMkq6ZdpWmAcwB2Bkmg"
                  } }
                /> : <></> }</div>
              { !process.env.NODE_ENV || process.env.NODE_ENV === 'development' ? <p style={ { color: "red" } }>dev mode</p> : <></> }</> :
              <>
                <FontAwesomeIcon
                  icon={ faTimes }
                  onClick={ () => setmenupage("main") }
                  style={ {
                    cursor: "pointer",
                    fontSize: "30px",
                    float: "right",
                  } }
                />
                <h1 style={ { textAlign: "center" } }>Thank you for your purchase!</h1>
                <div
                  style={ {
                    border: "solid 1px var(--light-bg-colour)",
                    borderRadius: "10px",
                    backgroundColor: "var(--dark-bg-colour)",
                    padding: "1rem",
                    margin: "1rem",
                  } }
                ><h4>You were charged: £{ (Number(price) * buyfuel).toFixed(2) } for { buyfuel } Rocket Fuel.</h4>
                  <div style={ { height: "1px", width: "100%", background: "var(--light-bg-colour)", margin: "0 0 1rem 0" } } />
                  <p style={ { textAlign: "center" } }>
                    Thank you { user.username }, the TypeChat team hope you like
                    Blast. You will see the Rocket Fuel add to your account shortly. If there are any issues about the transaction, please contact{ " " }
                    <a
                      target="blank_"
                      href="/chat/TypeChat"
                      style={ { color: "var(--secondary-text-colour)" } }
                    >
                      the offical TypeChat account
                    </a>
                    !
                  </p>
                </div>
              </>
            }
          </div>
        </div>
      ) : (
        <></>
      )
      }
    </div >
  );
}
const exportedObject = { Blast };

export default exportedObject;
