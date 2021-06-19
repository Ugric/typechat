import { useData } from "../hooks/datahook"
import { useState } from "react"
import Loader from "./loader"
import { useHistory } from "react-router-dom"
import logo from "../images/logos/TS.svg"
import { RouterForm } from "./RouterForm"
import cookies from "../cookies"


function Login() {
    const { rechecklogged, logged } = useData()
    const [error, seterror] = useState("");
    const history = useHistory();
    const [loading, setloading] = useState(false);
    if (logged) {
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
                    Login
                </h1>
                <RouterForm
                    action={"/login"}
                    beforecallback={(e: any) => {
                        if (e.target[0].value !== "") {
                            setloading(true);
                            return true;
                        } else {
                            seterror("input a password!");
                        }
                    }}
                    style={{ width: "fit-content", margin: "auto" }}
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
                            maxWidth: "300px",
                            width: "100%",
                            paddingBottom: "0.5rem",
                            fontFamily: "'Source Sans Pro', sans-serif",
                            fontSize: "17px",
                            color: "white",
                        }}
                    />
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
                </RouterForm>
            </div>
        </>
    );
}


export default Login