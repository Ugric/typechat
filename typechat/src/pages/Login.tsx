import { useData } from "../hooks/datahook";
import { useEffect, useRef, useState } from "react";
import Loader from "./loader";
import { useHistory, Link, useLocation } from "react-router-dom";
import logo from "../images/logos/TS.svg";
import { RouterForm } from "./RouterForm";
import cookies from "../cookies";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignInAlt } from "@fortawesome/free-solid-svg-icons";
import { parse } from "querystring";
import { GoogleReCaptcha } from "react-google-recaptcha-v3";

function validateEmail(email: string) {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

function Login() {
  const { rechecklogged, loggedin } = useData();
  const [error, seterror] = useState("");
  const recaptoken = useRef<null|string>(null)
  const history = useHistory();
  const location = useLocation();
  const query: { [key: string]: string | string[] } = parse(
    location.search.slice(1)
  );
  const [loading, setloading] = useState(false);
  const redirect = query.to
    ? Array.isArray(query.to)
      ? query.to[0]
      : query.to
    : "/";

  useEffect(() => {
    document.title = `Login - TypeChat`;
    return () => {
      document.title = "TypeChat";
    };
  }, []);
  if (loggedin) {
    history.push(redirect);
    return <></>;
  }
  return (
    <>
      <div style={{ display: loading ? "" : "none" }}>
        <Loader></Loader>
      </div>
      <div
        style={{
          margin: "5rem 0",
          textAlign: "center",
          display: !loading ? "" : "none",
        }}
      >
        <img
          src={logo}
          style={{ width: "150px", borderRadius: "10px" }}
          alt="logo"
          
        ></img>
        <h1
          style={{
            fontSize: "20px",
            fontFamily: "'Source Sans Pro', sans-serif",
          }}
        >
          <FontAwesomeIcon icon={faSignInAlt}></FontAwesomeIcon> Login
        </h1>
        <div data-private>
          <RouterForm
            action={"/login"}
            beforecallback={(e: any) => {
              if (recaptoken.current) {
                if (e.target[0].value !== "" && e.target[1].value !== "") {
                  if (validateEmail(e.target[0].value)) {
                    setloading(true);
                    return true;
                  } else {
                    seterror("input a valid email!");
                  }
                } else {
                  seterror("input an email and password!");
                }
              } else {
                seterror("waiting for recaptcha token... try again later.");
              }
            }}
            appendtoformdata={(fd) => {
              if (recaptoken.current)
                fd.append("g-recaptcha-response", recaptoken.current);
              return fd;
            }}
            style={{
              width: "fit-content",
              margin: "auto",
              maxWidth: "300px",
            }}
            callback={(resp: any) => {
              if (resp.resp) {
                cookies.set("token", resp.token, {
                  path: "/",
                  expires: new Date(Date.now() + 3.154e12),
                });
                rechecklogged();
              } else {
                setloading(false);
                seterror(resp.err);
              }
            }}
          >
            {navigator.userAgent !== "ReactSnap" ? (
              <GoogleReCaptcha
                onVerify={(token) => {
                  recaptoken.current = (token);
                }}
              />
            ) : (
              <></>
            )}
            <p
              style={{
                textAlign: "end",
                margin: "0",
              }}
            >
              Email
            </p>
            <input
              type="email"
              placeholder="Email"
              name="email"
              style={{
                background: "transparent",
                borderTop: "none",
                borderRight: "none",
                borderBottom: "1px solid white",
                borderLeft: "none",
                borderImage: "initial",
                marginBottom: "1rem",
                width: "100%",
                paddingBottom: "0.5rem",
                fontFamily: "'Source Sans Pro', sans-serif",
                fontSize: "17px",
                color: "white",
                borderRadius: "0px",
              }}
            />
            <p
              style={{
                textAlign: "end",
                margin: "0",
              }}
            >
              Password
            </p>
            <input
              type="password"
              placeholder="Password"
              name="pass"
              style={{
                background: "transparent",
                borderTop: "none",
                borderRight: "none",
                borderBottom: "1px solid white",
                borderLeft: "none",
                borderImage: "initial",
                marginBottom: "1rem",
                width: "100%",
                paddingBottom: "0.5rem",
                fontFamily: "'Source Sans Pro', sans-serif",
                fontSize: "17px",
                color: "white",
                borderRadius: "0px",
              }}
            />
            <p
              style={{
                fontSize: "13px",
              }}
            >
              By logging in, you agree to the{" "}
              <a href="/t&c" target="blank_">
                T & C's
              </a>
            </p>
            <input
              type="submit"
              value="Login"
              style={{
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
            />
            <p style={{ margin: "1rem 0", color: "red" }}>{error}</p>
            <p style={{ margin: "1rem 0 0 0", color: "white" }}>
              dont already have an account?{" "}
              <span>
                <Link
                  to={"/signup" + location.search}
                  style={{ color: "var(--secondary-text-colour)" }}
                >
                  Make one
                </Link>
              </span>
            </p>
            <p style={{ margin: "0", color: "white" }}>
              Forgot your password?{" "}
              <span>
                <Link
                  to={"/requestNewPassword"}
                  style={{ color: "var(--secondary-text-colour)" }}
                >
                  Change it
                </Link>
              </span>
            </p>
          </RouterForm>
        </div>
      </div>
    </>
  );
}

export default Login;
