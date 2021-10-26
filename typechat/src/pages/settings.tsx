import { useEffect } from "react";
import useApi from "../hooks/useapi";
import useLocalStorage from "../hooks/useLocalStorage";
import Background from "./CustomBackground";
import ToggleSwitch from "./switch";
import ReactGA from "react-ga4";

function Setting({ children }: { children: any }) {
  return (
    <div
      style={ {
        marginBottom: "1rem",
        width: "100%",
        border: "solid 1px var(--light-bg-colour)",
        borderRadius: "10px",
        backgroundColor: "var(--main-bg-colour)",
        padding: "5px",
      } }
    >
      { children }
    </div>
  );
}

function Settings() {
  const [soundEffects, setSoundEffects] = useLocalStorage(
    "sound effects",
    true
  );
  const [personaltyping, setpersonaltyping] = useLocalStorage(
    "Keyboard Typing Sound",
    true
  );
  const [Recipienttyping, setRecipienttyping] = useLocalStorage(
    "Recipient Typing Sound",
    true
  );
  const [SendSound, setSendSound] = useLocalStorage("Send Sound", true);
  const [ReceiveSound, setReceiveSound] = useLocalStorage(
    "Receive Sound",
    true
  );
  const { data: notifications } = useApi<{ discord: boolean; email: boolean }>(
    "/api/getNotificationsOn"
  );
  const [volume, setVolume] = useLocalStorage("volume", 15);
  const [discord, setdiscord] = useLocalStorage("discord", true);
  const [email, setemail] = useLocalStorage("email", true);
  useEffect(() => {
    if (notifications) {
      setdiscord(notifications.discord);
      setemail(notifications.email);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notifications]);
  useEffect(() => {
    ReactGA.send("open settings");
  }, [])
  return (
    <div
      style={ {
        margin: "1rem",
      } }
    >
      <div
        style={ {
          margin: "auto",
          border: "solid 1px var(--light-bg-colour)",
          borderRadius: "10px",
          backgroundColor: "var(--dark-bg-colour)",
          padding: "1rem",
          maxWidth: "700px",
        } }
      ><Background />
        <h1 style={ { textAlign: "center" } }>Settings</h1>

        <div>
          <Setting>
            <ToggleSwitch
              onChange={ () => {
                setSoundEffects(!soundEffects);
              } }
              checked={ soundEffects }
            >
              Sound Effects
            </ToggleSwitch>
          </Setting>
          { soundEffects ? (
            <div
              style={ {
                marginBottom: "1rem",
                width: "100%",
                border: "solid 1px var(--light-bg-colour)",
                borderRadius: "10px",
                padding: "5px",
                paddingTop: "calc(1rem + 5px)",
              } }
            >
              <Setting>
                <label
                  style={ {
                    display: "flex",
                    justifyContent: "space-between",
                    margin: 0,
                  } }
                >
                  <div>Volume { volume * 5 }%</div>
                  <input
                    type="range"
                    max="20"
                    min="0"
                    value={ volume }
                    onInput={ (e: any) => {
                      setVolume(e.target.value);
                    } }
                  ></input>
                </label>
              </Setting>
              <Setting>
                <ToggleSwitch
                  onChange={ () => {
                    setpersonaltyping(!personaltyping);
                  } }
                  checked={ personaltyping }
                >
                  Keyboard Typing Sound
                </ToggleSwitch>
              </Setting>
              <Setting>
                <ToggleSwitch
                  onChange={ () => {
                    setRecipienttyping(!Recipienttyping);
                  } }
                  checked={ Recipienttyping }
                >
                  Recipient Typing Sound
                </ToggleSwitch>
              </Setting>
              <Setting>
                <ToggleSwitch
                  onChange={ () => {
                    setSendSound(!SendSound);
                  } }
                  checked={ SendSound }
                >
                  Send Sound
                </ToggleSwitch>
              </Setting>
              <Setting>
                <ToggleSwitch
                  onChange={ () => {
                    setReceiveSound(!ReceiveSound);
                  } }
                  checked={ ReceiveSound }
                >
                  Receive Sound
                </ToggleSwitch>
              </Setting>
            </div>
          ) : (
            <></>
          ) }
          <div
            style={ {
              marginBottom: "1rem",
              width: "100%",
              border: "solid 1px var(--light-bg-colour)",
              borderRadius: "10px",
              padding: "5px",
              paddingTop: "calc(1rem + 5px)",
            } }
          >
            <Setting>
              <ToggleSwitch
                onChange={ () => {
                  setdiscord(!discord);
                  const formdata = new FormData();
                  formdata.append("toggle", JSON.stringify(!discord));
                  fetch("/api/togglediscord", {
                    method: "POST",
                    body: formdata,
                  });
                } }
                checked={ discord }
              >
                Discord Notifications
              </ToggleSwitch>
            </Setting>
            <Setting>
              <ToggleSwitch
                onChange={ () => {
                  setemail(!email);
                  const formdata = new FormData();
                  formdata.append("toggle", JSON.stringify(!email));
                  fetch("/api/toggleemail", {
                    method: "POST",
                    body: formdata,
                  });
                } }
                checked={ email }
              >
                Email Notifications
              </ToggleSwitch>
            </Setting>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
