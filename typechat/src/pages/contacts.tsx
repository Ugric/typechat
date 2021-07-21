import { useState } from "react";
import { useData } from "../hooks/datahook";
import ColorThief from "colorthief";
import { useHistory } from "react-router-dom";

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
      }}
      onClick={() => {
        history.push(`/chat/${user.id}`);
      }}
    >
      <img
        alt="profile"
        loading="lazy"
        src={"/files/" + user.profilePic}
        style={{
          maxHeight: "75px",
          maxWidth: "100%",
          height: "auto",
          width: "auto",
          borderRadius: "50%",
        }}
        onLoad={async (e: any) => {
          const colorThief = new ColorThief();
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
            fontSize: "25px",
            marginLeft: "1rem",
          }}
        >
          {user.username}
          <span
            style={{
              color: "lightgray",
              fontWeight: "normal",
            }}
          >
            #{user.tag}
          </span>
        </span>
      </span>
    </div>
  );
}

function Contacts() {
  const { user } = useData();
  return (
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
          <Contact user={user}></Contact>
          <Contact user={user}></Contact>
          <Contact user={user}></Contact>
          <Contact user={user}></Contact>
          <Contact user={user}></Contact>
          <Contact user={user}></Contact>
          <Contact user={user}></Contact>
          <Contact user={user}></Contact>
          <Contact user={user}></Contact>
        </div>
      </div>
    </div>
  );
}

export default Contacts;
