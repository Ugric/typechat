import { Redirect } from "react-router-dom";
import { useData } from "../hooks/datahook";
import appPage from "./images/app page.png";
import "./css/home.css"

function Home() {
  const { loggedin } = useData();
  if (!loggedin) {
    return (
      <>
        <div style={{margin: "1rem"}}>
        <h1 style={{fontSize:"75px", color: "var(--primary-text-colour)"}}>Hello.</h1>
        <h1 style={{ color: "var(--secondary-text-colour)"}}>Welcome to TypeChat.</h1>
        <p>
          Type to your friends. Powered by TypeScript.
        </p>
        </div>
        <div style={{width: "100%", backgroundColor: "var(--main-bg-colour)", height: "1px"}}></div>
        <div style={{textAlign: "center", margin: "1rem", width: "calc(100vw - 2rem)", overflow: "hidden"}}><h3>Add to your homepage to get the best mobile experience!</h3><img className="slideinimage" alt="phone app" src={appPage} style={{width: "100%", maxWidth: "350px"}}></img></div>
      </>
    );
  }
  return <Redirect to="/contacts"></Redirect>;
}

export default Home;
