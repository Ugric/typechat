import { useData } from "../hooks/datahook";
import { useState } from "react";
import Loader from "./loader";
import { useHistory, useLocation, useParams } from "react-router-dom";
import logo from "../images/logos/TS.svg";
import { RouterForm } from "./RouterForm";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faKey } from "@fortawesome/free-solid-svg-icons";
import { parse } from "querystring";
import { GoogleReCaptcha } from "react-google-recaptcha-v3";

function validateEmail(email: string) {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

function ChangePassword() {
  const [error, seterror] = useState("");
  const history = useHistory();
  const { id } = useParams<{ id: string }>();
  const [recapToken, setRecapToken] = useState<null | string>(null);
  const [loading, setloading] = useState(false);
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
          alt="logo"
          style={{ width: "150px", borderRadius: "10px" }}
        ></img>
        <h1
          style={{
            fontSize: "20px",
            fontFamily: "'Source Sans Pro', sans-serif",
          }}
        >
          <FontAwesomeIcon icon={faKey}></FontAwesomeIcon> Set Password
        </h1>
        <div>
          <RouterForm
            action={"/api/changepassword"}
            beforecallback={() => {
              if (recapToken) {
                setloading(true);
                return true;
              } else {
                seterror("waiting for recaptcha token... try again later.");
              }
            }}
            appendtoformdata={(fd) => {
              fd.append("updateID", id);
              if (recapToken) fd.append("g-recaptcha-response", recapToken);
              return fd;
            }}
            style={{ width: "fit-content", margin: "auto", maxWidth: "300px" }}
            callback={(resp: boolean) => {
              setloading(false);
              if (resp) {
                history.push("/login");
              } else {
                seterror(
                  "failed to change password, maybe the update password key has reset."
                );
              }
            }}
          >
            {navigator.userAgent !== "ReactSnap" ? (
              <GoogleReCaptcha
                onVerify={(token) => {
                  setRecapToken(token);
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
            <input
              type="submit"
              value="Change Password"
              style={{
                padding: "1rem",
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
          </RouterForm>
        </div>
      </div>
    </>
  );
}

function RequestNewPassword() {
  const { loggedin } = useData();
  const [error, seterror] = useState("");
  const history = useHistory();
  const [loading, setloading] = useState(false);
  const location = useLocation();
  const query: { [key: string]: string | string[] } = parse(
    location.search.slice(1)
  );
  const [recapToken, setRecapToken] = useState<null | string>(null);
  const redirect = query.to
    ? Array.isArray(query.to)
      ? query.to[0]
      : query.to
    : "/";
  if (loggedin) {
    history.push(redirect);
    return <></>;
  }
  return (
    <>
      <div style={ { display: loading ? "" : "none" } }>
        <Loader></Loader>
      </div>
      <div
        style={ {
          margin: "5rem 0",
          textAlign: "center",
          display: !loading ? "" : "none",
        } }
      >
        <img
          src={ logo }
          alt="logo"
          style={ { width: "150px", borderRadius: "10px" } }
        ></img>
        <h1
          style={ {
            fontSize: "20px",
            fontFamily: "'Source Sans Pro', sans-serif",
          } }
        >
          <FontAwesomeIcon icon={ faKey }></FontAwesomeIcon> Change Password
        </h1>
        <div>
          <RouterForm
            action={ "/api/requestnewpassword" }
            beforecallback={ (e: any) => {
              if (recapToken) {
                if (e.target[0].value !== "") {
                  if (validateEmail(e.target[0].value)) {
                    setloading(true);
                    return true;
                  } else {
                    seterror("input a valid email!");
                  }
                } else {
                  seterror("input a profile, username, email and password!");
                }
              } else {
                seterror("waiting for recaptcha token... try again later.");
              }
            } }
            appendtoformdata={ (fd) => {
              if (recapToken) fd.append("g-recaptcha-response", recapToken);
              return fd;
            } }
            style={ { width: "fit-content", margin: "auto", maxWidth: "300px" } }
            callback={ () => {
              history.push("/login");
            } }
          >
            <GoogleReCaptcha
              onVerify={ (token) => {
                setRecapToken(token);
              } }
            />
            <p
              style={ {
                textAlign: "end",
                margin: "0",
              } }
            >
              Email
            </p>{ " " }
            <input
              type="email"
              placeholder="Email"
              name="email"
              style={ {
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
              } }
              autoComplete="new-password"
            />
            <input
              type="submit"
              value="Request New Password"
              style={ {
                padding: "1rem",
                width: "100%",
                border: "none",
                borderRadius: "50px",
                background:
                  "linear-gradient(45deg, var(--dark-bg-colour) 0%, var(--light-bg-colour) 100%)",
                color: "white",
                fontFamily: '"Source Sans Pro", sans-serif',
                fontSize: "20px",
                boxShadow: "rgb(0, 0, 0) 0px 6px 5px 0px",
              } }
            />
            <p style={ { margin: "1rem 0", color: "red" } }>{ error }</p>
          </RouterForm>
        </div>
      </div>
    </>
  );
}

const exports = { RequestNewPassword, ChangePassword };

export default exports;
