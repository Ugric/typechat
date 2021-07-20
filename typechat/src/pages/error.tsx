import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";

function LoadError({ error }: { error: String }) {
  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        textAlign: "center",
        color: "red",
      }}
    >
      <div style={{ fontSize: "50px" }}>
        <FontAwesomeIcon icon={faExclamationTriangle} />
      </div>
      <h1>ERROR</h1>
      <p>{error}</p>
      <p>
        go to the{" "}
        <span>
          <Link to="/" style={{ color: "var(--secondary-text-colour)" }}>
            Home Page
          </Link>
          !
        </span>
      </p>
    </div>
  );
}

export default LoadError;
