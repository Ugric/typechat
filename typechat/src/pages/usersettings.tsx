import { Link, Redirect } from "react-router-dom";
import { useData } from "../hooks/datahook";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen } from "@fortawesome/free-solid-svg-icons";
import "./css/usersettings.css";
import ProfilePage from "./profilePage";
import { useState } from "react";
import Modal from "react-modal";

function Changebutton({
  name,
  children,
  onClick = () => {},
  clickable,
}: {
  name: string;
  children: any;
  onClick?: (e: any) => void;
  clickable: boolean;
}) {
  return (
    <div
      style={{
        border: "solid 1px var(--light-bg-colour)",
        borderRadius: "10px",
        backgroundColor: "var(--main-bg-colour)",
        padding: "1rem",
        margin: "1rem",
      }}
    >
      <p style={{ margin: "0", color: "lightgray" }}>{name}</p>
      <p style={{ margin: "0" }}>
        <a
          onClick={clickable ? onClick : undefined}
          className={clickable ? "changebutton" : ""}
          style={{ color: "white" }}
        >
          {children}
        </a>
      </p>
    </div>
  );
}
Modal.setAppElement("#root");
function UserSettings() {
  const { loggedin, user, rechecklogged } = useData();
  const [UsernameModelIsOpen, setUsernameModelIsOpen] = useState(false);
  if (!loggedin) {
    return <Redirect to="/" />;
  }
  return (
    <div>
      <h1 style={{ textAlign: "center" }}>User Settings</h1>
      <div
        style={{
          margin: "1rem",
          border: "solid 1px var(--light-bg-colour)",
          borderRadius: "10px",
          backgroundColor: "var(--dark-bg-colour)",
          padding: "1rem",
        }}
      >
        <ProfilePage user={user} />
        <div style={{ textAlign: "center" }}>EDIT</div>
        <Changebutton
          name="PROFILE PICTURE"
          onClick={() => {
            console.log("hi");
          }}
          clickable={true}
        >
          <img
            src={"/files/" + user.profilePic}
            style={{
              height: "75px",
              margin: "0 1rem 0 0",
              borderRadius: "50%",
            }}
          />
          <FontAwesomeIcon icon={faPen} />
        </Changebutton>
        <Changebutton
          name="USERNAME"
          onClick={() => {
            setUsernameModelIsOpen(true);
          }}
          clickable={true}
        >
          <span style={{ color: "white" }}>
            {user.username}
            <span style={{ color: "lightgray" }}>#{user.tag}</span>
            <FontAwesomeIcon icon={faPen} />
          </span>
        </Changebutton>
        <Modal
          isOpen={UsernameModelIsOpen}
          onRequestClose={() => {
            setUsernameModelIsOpen(false);
          }}
          style={{
            overlay: { backgroundColor: "rgb(18 18 18 / 50%)" },
            content: {
              backgroundColor: "var(--dark-mode)",
              top: "50%",
              left: "50%",
              right: "auto",
              bottom: "auto",
              marginRight: "-50%",
              transform: "translate(-50%, -50%)",
            },
          }}
          contentLabel="Example Modal"
        >
          <div>
            <input
              style={{
                color: "white",
                backgroundColor: "transparent",
                border: "none",
              }}
              defaultValue={user.username}
            ></input>
            <span
              style={{
                color: "lightgray",
                borderLeft: "solid 1px white",
                paddingLeft: "1rem",
              }}
            >
              #{user.tag}
            </span>
          </div>
        </Modal>
      </div>
    </div>
  );
}

export default UserSettings;
