import { faFileCode } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";

function Error404() {
  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        textAlign: "center",
        color: "gray",
      }}
    >
      <div style={{ fontSize: "50px" }}>
        <FontAwesomeIcon icon={faFileCode} />
      </div>
      <h1>Page Not Found!</h1>
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

export default Error404;
