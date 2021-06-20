import { useData } from "../hooks/datahook"
import { useState } from "react"
import Loader from "./loader"
import { useHistory, Link } from "react-router-dom"
import logo from "../images/logos/TS.svg"
import { RouterForm } from "./RouterForm"
import cookies from "../cookies"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAddressCard } from '@fortawesome/free-solid-svg-icons'

function validateEmail(email: string) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

function Signup() {
    const { rechecklogged, loggedin } = useData()
    const [error, seterror] = useState("");
    const history = useHistory();
    const [loading, setloading] = useState(false);
    if (loggedin) {
        history.push("/");
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
                ></img>
                <h1
                    style={{
                        fontSize: "20px",
                        fontFamily: "'Source Sans Pro', sans-serif",
                    }}
                >
                    <FontAwesomeIcon icon={faAddressCard}></FontAwesomeIcon>{" "}Sign Up
                </h1>
                <RouterForm
                    action={"/signup"}
                    beforecallback={(e: any) => {
                        if (e.target[0].value !== "" && e.target[1].value !== "" && e.target[2].value !== "") {
                            if (validateEmail(e.target[1].value)) {
                                setloading(true);
                                return true;
                            } else {

                                seterror("input a valid email!");
                            }
                        } else {
                            seterror("input a username, email and password!");
                        }
                    }}
                    style={{ width: "fit-content", margin: "auto", maxWidth: "300px" }}
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
                >       <input
                        type="text"
                        placeholder="Username"
                        name="uname"
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
                        }}
                    />  <input
                        type="text"
                        placeholder="email"
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
                        }}
                    />
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
                        }}
                    />
                    <input
                        type="submit"
                        value="Sign up"
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
                    <p style={{ margin: "1rem 0", color: "white" }}>already have an account?{" "}<span><Link to="/login">Login!</Link></span></p>
                </RouterForm>
            </div>
        </>
    );
}


export default Signup