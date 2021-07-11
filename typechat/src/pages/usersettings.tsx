import { Link, Redirect } from "react-router-dom";
import { useData } from "../hooks/datahook";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen } from "@fortawesome/free-solid-svg-icons";
import "./css/usersettings.css";
import ProfilePage from "./profilePage";
import { useState, useRef } from "react";
import Modal from "react-modal";
import { RouterForm } from "./RouterForm"

function Changebutton({
  name,
  children,
  onClick = () => { },
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
  const [error, seterror] = useState("")
  const [backgroundImage, setbackgroundImage] = useState<string | undefined>(undefined)
  const [UsernameModelIsOpen, setUsernameModelIsOpen] = useState(false);
  if (!loggedin) {
    return <Redirect to="/" />;
  }
  return (
    <div
      style={{
        margin: "1rem",
      }}
    >
      <h1 style={{ textAlign: "center" }}>User Settings</h1>
      <div
        style={{
          margin: "auto",
          border: "solid 1px var(--light-bg-colour)",
          borderRadius: "10px",
          backgroundColor: "var(--dark-bg-colour)",
          padding: "1rem",
          maxWidth: "700px"
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
          name="Background Image"
          clickable={false}
        >
          <RouterForm
            action="/api/setbackgroundimage"
            beforecallback={(e: any) => true}
            callback={(resp) => { if (resp) { rechecklogged() } }}>
            <img src={backgroundImage} style={{
              maxHeight: "100px",
              maxWidth: "100px"
            }} /><input type="file" name="backgroundImage" onChange={(e: any) => {
              setbackgroundImage(e.target.files[0] ? URL.createObjectURL(e.target.files[0]) : undefined)
            }} /> <button
              style={{
                color: "white",
                backgroundColor: "var(--dark-bg-colour)",
                border: "solid 2px var(--light-bg-colour)",
                borderRadius: "5px",
              }}
              type="submit"
            >
              Save
            </button>
          </RouterForm>
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
          onAfterOpen={() => { seterror("") }}
          style={{
            overlay: { backgroundColor: "rgb(18 18 18 / 50%)" },
            content: {
              backgroundColor: "var(--main-bg-colour)",
              border: "1px solid var(--dark-bg-colour)",
              top: "50%",
              left: "50%",
              right: "auto",
              bottom: "auto",
              marginRight: "-50%",
              transform: "translate(-50%, -50%)",
            },
          }}
          contentLabel="Username Change"
        ><form onSubmit={async (e: any) => {
          e.preventDefault();
          if (e.target[0].value.trim() !== "" && e.target[1].value.trim() !== "") {
            const fd = new FormData()
            fd.append("username", e.target[0].value)
            fd.append("pass", e.target[1].value)
            const resp = await (await fetch("/api/setusername", { method: "POST", body: fd })).json()
            if (resp.resp) {
              rechecklogged()
              setUsernameModelIsOpen(false)
            } else {
              seterror(resp.err)
            }
          } else { seterror("input a username and password!") }
        }}>
            USERNAME
            <div
              style={{
                border: "solid 1px gray",
                backgroundColor: "var(--dark-mode)",
                borderRadius: "5px",
                width: "100%",
              }}
            >
              <input
                onInput={(e: any) => { e.target.value = e.target.value.trimStart() }}
                style={{
                  color: "white",
                  backgroundColor: "transparent",
                  border: "none",
                  borderRight: "solid 1px white",
                  borderRadius: "0px",
                }}
                placeholder="Username"
                autoComplete="new-password"
                type="text"
                defaultValue={user.username}
              ></input>
              <span
                style={{
                  color: "lightgray",
                  padding: "0 1rem",
                  float: "right",
                }}
              >
                #{user.tag}
              </span>
            </div>
            <input
              style={{
                width: "100%",
                color: "white",
                backgroundColor: "var(--dark-mode)",
                border: "solid 1px gray",
                borderRadius: "5px",
              }}
              placeholder="Current Password"
              autoComplete="new-password"
              type="password"
            /><p style={{ color: "red" }}>{error}</p>
            <button
              style={{
                float: "right",
                marginTop: "1rem",
                color: "white",
                backgroundColor: "var(--dark-bg-colour)",
                border: "solid 2px var(--light-bg-colour)",
                borderRadius: "5px",
              }}
              type="submit"
            >
              Save
            </button></form>
        </Modal>
      </div>
    </div>
  );
}

export default UserSettings;
