import { Link, Redirect } from "react-router-dom";
import { useData } from "../hooks/datahook";
import TypeChat from "../images/logos/TypeChat.svg";

function Home() {
  const { loggedin } = useData();
  if (!loggedin) {
    return (
      <div>
        <div>
          <img
            src={TypeChat}
            alt="TypeChat"
            style={{
              width: "100%",
              maxWidth: "250px",
              display: "block",
              margin: "1rem auto 0",
            }}
          ></img>
        </div>
        <p style={{ textAlign: "center" }}>
          Type to your friends. Powered by TypeScript.
        </p>
        <p style={{ textAlign: "center" }}>
          <span>
            <Link to="/login" style={{ color: "var(--secondary-text-colour)" }}>
              login
            </Link>
          </span>{" "}
          or{" "}
          <span>
            <Link
              to="/signup"
              style={{ color: "var(--secondary-text-colour)" }}
            >
              create an account
            </Link>
          </span>
          !
        </p>
      </div>
    );
  }
  return <Redirect to="/contacts"></Redirect>;
}

export default Home;
