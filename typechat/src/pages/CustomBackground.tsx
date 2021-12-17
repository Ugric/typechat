import { useMemo, useState } from "react";
import { useData } from "../hooks/datahook";

function Background() {
  const { user } = useData();
  return false ? (
    <div
      style={{
        backgroundImage: `url(/files/${user.backgroundImage})`,
        width: "100vw",
        height: "100vh",
        position: "fixed",
        zIndex: -"100",
        top: "0",
        left: "0",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    />
  ) : (
    <></>
  );
}

export default Background;
