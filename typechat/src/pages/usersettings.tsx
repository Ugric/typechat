import { Redirect } from "react-router-dom";
import { useData } from "../hooks/datahook";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen } from "@fortawesome/free-solid-svg-icons";
import "./css/usersettings.css";
import ProfilePage from "./profilePage";
import { useState, useRef } from "react";
import Modal from "react-modal";
import { RouterForm } from "./RouterForm";
import Avatar from "react-avatar-edit";
import useApi from "../hooks/useapi";
import humanFileSize from "../bytesToHumanReadable";

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
      {clickable ? (
        <div
          onClick={onClick}
          className={"changebutton"}
          style={{ color: "white" }}
        >
          {children}
        </div>
      ) : (
        <div>{children}</div>
      )}
    </div>
  );
}
Modal.setAppElement("#app");
function UserSettings() {
  const { loggedin, user, rechecklogged } = useData();
  const [error, seterror] = useState("");
  const backgroundinputref = useRef<any>(null);
  const { data: uploadlimitdata, loading: uploadlimitloading, error: uploadlimiterror } = useApi<{ filelimit: number, limitused: number }>("/api/uploadlimit")
  const [uploading, setuploading] = useState(false);
  const [backgroundImage, setbackgroundImage] = useState<string | undefined>(
    undefined
  );
  const [profile, setprofile] = useState<Blob | null>(null);
  const [UsernameModelIsOpen, setUsernameModelIsOpen] = useState(false);
  const [ProfileModelIsOpen, setProfileModelIsOpen] = useState(false);
  if (!loggedin) {
    return <Redirect to="/" />;
  }
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
        <h1 style={{ textAlign: "center" }}>User Settings</h1>
        <ProfilePage user={user} />
        <Changebutton
          name="Upload Limit" clickable={false}>
          {uploadlimitloading || uploadlimiterror ? "loading" : `${humanFileSize(Number(uploadlimitdata?.limitused), true)} / ${humanFileSize(Number(uploadlimitdata?.filelimit), true, 0)} (${humanFileSize(Number(uploadlimitdata?.filelimit) - Number(uploadlimitdata?.limitused), true)} left)`}
        </Changebutton>
        <div style={{ textAlign: "center" }}>EDIT</div>
        <button
          style={{
            color: "white",
            backgroundColor: "var(--dark-bg-colour)",
            border: "solid 2px var(--light-bg-colour)",
            borderRadius: "5px",
            margin: "0 1rem",
          }}
          onClick={() => {
            rechecklogged();
          }}
        >
          update
        </button>
        <Changebutton
          name="Profile Picture"
          onClick={() => {
            setProfileModelIsOpen(true);
          }}
          clickable={true}
        >
          <img
            alt="profile"
            src={"/files/" + user.profilePic}
            style={{
              height: "75px",
              margin: "0 1rem 0 0",
              borderRadius: "50%",
            }}
          />
          <FontAwesomeIcon icon={faPen} />
        </Changebutton>
        <Modal
          isOpen={ProfileModelIsOpen}
          onRequestClose={() => {
            setProfileModelIsOpen(false);
          }}
          onAfterOpen={() => {
            seterror("");
          }}
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
        >
          <form
            onSubmit={async (e: any) => {
              e.preventDefault();
              setuploading(true);
              if (profile) {
                const fd = new FormData();
                fd.append("profilepic", profile);
                const resp = await (
                  await fetch("/api/setprofilepic", {
                    method: "POST",
                    body: fd,
                  })
                ).json();
                if (resp.resp) {
                  setProfileModelIsOpen(false);
                } else {
                  seterror(resp.err);
                }
              } else {
                seterror("input a profile picture!");
              }
              setuploading(false);
            }}
          >
            PROFILE PICTURE
            <Avatar
              width={300}
              height={0}
              imageWidth={300}
              onCrop={(dataURL) => {
                fetch(dataURL).then((fetched) =>
                  fetched.blob().then((blob) => setprofile(blob))
                );
              }}
              labelStyle={{ color: "white" }}
              onClose={() => {
                setprofile(null);
              }}
              exportMimeType="image/jpeg"
              exportSize={500}
              exportQuality={0.75}
              exportAsSquare
            />
            <p style={{ color: "red" }}>{error}</p>
            {!uploading ? (
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
              </button>
            ) : (
              <></>
            )}
          </form>
        </Modal>
        <Changebutton name="Background Image" clickable={false}>
          <RouterForm
            action="/api/setbackgroundimage"
            beforecallback={(e: any) => {
              setuploading(true);
              return true;
            }}
            callback={() => {
              if (backgroundinputref.current) {
                backgroundinputref.current.value = "";
                setbackgroundImage(undefined);
              }
              setuploading(false);
            }}
          >
            {backgroundImage ? (
              <img
                src={backgroundImage}
                alt="background"
                style={{
                  maxHeight: "100px",
                  maxWidth: "100px",
                }}
              />
            ) : (
              <></>
            )}
            <input
              type="file"
              name="backgroundImage"
              style={{ maxWidth: "100%" }}
              onChange={(e: any) => {
                setbackgroundImage(
                  e.target.files[0]
                    ? URL.createObjectURL(e.target.files[0])
                    : undefined
                );
              }}
              accept="image/*"
              ref={backgroundinputref}
            />{" "}
            {!uploading ? (
              <button
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
            ) : (
              <></>
            )}
          </RouterForm>
        </Changebutton>
        <Changebutton
          name="Username"
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
          onAfterOpen={() => {
            seterror("");
          }}
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
        >
          <form
            onSubmit={async (e: any) => {
              e.preventDefault();
              setuploading(true);
              if (
                e.target[0].value.trim() !== "" &&
                e.target[1].value.trim() !== ""
              ) {
                const fd = new FormData();
                fd.append("username", e.target[0].value);
                fd.append("pass", e.target[1].value);
                const resp = await (
                  await fetch("/api/setusername", { method: "POST", body: fd })
                ).json();
                if (resp.resp) {
                  setUsernameModelIsOpen(false);
                } else {
                  seterror(resp.err);
                }
              } else {
                seterror("input a username and password!");
              }
              setuploading(false);
            }}
          >
            Username
            <div
              style={{
                border: "solid 1px gray",
                backgroundColor: "var(--dark-mode)",
                borderRadius: "5px",
                width: "100%",
              }}
            >
              <input
                onInput={(e: any) => {
                  e.target.value = e.target.value.trimStart();
                  if (e.target.value.length > 30) {
                    e.target.value = e.target.value.substring(0, 30);
                  }
                }}
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
            />
            <p style={{ color: "red" }}>{error}</p>
            {!uploading ? (
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
              </button>
            ) : (
              <></>
            )}
          </form>
        </Modal>
      </div>
    </div>
  );
}

export default UserSettings;
