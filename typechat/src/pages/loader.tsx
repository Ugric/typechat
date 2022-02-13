import "./css/loader.css";
import "./css/center.css";

function Loader() {
  return (
    <div
      style={{
        display: "flex",
        marginTop: "5rem",
        justifyContent: "center",
      }}
    >
      <div className="loader"></div>
    </div>
  );
}

export default Loader;
