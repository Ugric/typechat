import { useState } from "react";
import { useData } from "../hooks/datahook";
import ColorThief from "colorthief";
import { Link, Redirect, useHistory } from "react-router-dom";
import useApi from "../hooks/useapi";
import Loader from "./loader";
import LoadError from "./error";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComment, faUserCircle } from "@fortawesome/free-solid-svg-icons";
const colorThief = new ColorThief();

function Contact({
  user,
}: {
  user: {
    profilePic: string;
    username: string;
    id: string;
    tag: string;
    backgroundImage: string | null;
    [key: string]: any;
  };
}) {
  const history = useHistory();
  const [backgroundcolour, setbackgroundcolour] = useState({
    r: 86,
    g: 86,
    b: 255,
  });
  return (
    <div
      style={{
        backgroundImage: user.backgroundImage
          ? `url(/files/${user.backgroundImage})`
          : "",
        backgroundColor: `rgb(${backgroundcolour.r}, ${backgroundcolour.g}, ${backgroundcolour.b})`,
        padding: "1rem",
        backgroundRepeat: user.backgroundImage ? "no-repeat" : "",
        backgroundSize: user.backgroundImage ? "cover" : "",
        borderRadius: "10px",
        border: "solid 1px var(--light-bg-colour)",
        margin: "1rem",
        backgroundPosition: user.backgroundImage ? "center" : "",
        textOverflow: "ellipsis",
        overflow: "hidden",
        whiteSpace: "nowrap",
      }}
    >
      <Link to={`/chat/${user.id}`} style={{ textDecoration: "none" }}>
        <img
          alt="profile"
          loading="lazy"
          src={"/files/" + user.profilePic}
          style={{
            maxHeight: "50px",
            maxWidth: "100%",
            height: "auto",
            width: "auto",
            borderRadius: "50%",
          }}
          onLoad={async (e: any) => {
            const resp = await colorThief.getColor(e.target);
            setbackgroundcolour({ r: resp[0], g: resp[1], b: resp[2] });
          }}
        />
        <span>
          <span
            style={{
              color: "white",
              WebkitTextStroke: "1px black",
              fontWeight: "bold",
              fontSize: "20px",
              marginLeft: "5px",
            }}
          >
            {user.username}
          </span>
        </span>
      </Link>
      <div
        style={{
          float: "right",
          marginLeft: "3px",
          background: "var(--main-bg-colour)",
          padding: "5px",
          borderRadius: "10px",
          cursor: "pointer",
        }}
        onClick={async () => {}}
      >
        <FontAwesomeIcon icon={faUserCircle}></FontAwesomeIcon>
      </div>
    </div>
  );
}

function Contacts() {
  const { loggedin } = useData();
  const { data, loading, error } = useApi("/api/getallcontacts");
  if (!loggedin) {
    return <Redirect to="/"></Redirect>;
  }
  return loading || error ? (
    error ? (
      <LoadError error={String(error)}></LoadError>
    ) : (
      <Loader></Loader>
    )
  ) : (
    <div
      style={{
        margin: "1rem",
      }}
    >
      <div
        style={{
          margin: "auto",
          border: "solid 1px var(--light-bg-colour)",
          borderRadius: "10px",
          backgroundColor: "var(--dark-bg-colour)",
          padding: "1rem",
          maxWidth: "700px",
        }}
      >
        <h1 style={{ textAlign: "center" }}>Contacts</h1>
        <div>
          {data.resp ? (
            data.contacts.map((contact: any) => (
              <Contact key={contact.id} user={contact}></Contact>
            ))
          ) : (
            <p style={{ color: "red", textAlign: "center" }}>{data.err}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Contacts;
