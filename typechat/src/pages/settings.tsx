import useLocalStorage from "../hooks/useLocalStorage";
import ToggleSwitch from "./switch";

function Settings() {
  const [soundEffects, setSoundEffects] = useLocalStorage(
    "sound effects",
    true
  );
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
        <h1 style={{ textAlign: "center" }}>Settings</h1>
        <div>
          <ToggleSwitch
            onChange={() => {
              setSoundEffects(!soundEffects);
            }}
            defaultChecked={soundEffects}
          >
            Sound Effects
          </ToggleSwitch>
        </div>
      </div>
    </div>
  );
}

export default Settings;
