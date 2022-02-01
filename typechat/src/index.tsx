import React, { useState, useEffect } from "react";
import "./index.css";
import "./pages/css/toggleswitch.css";
import { BrowserRouter as Router } from "react-router-dom";
import "./pages/css/scrollbar.css";
import { data as datahook } from "./hooks/datahook";
import PageNav from "./pages/Navbar";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import "./colourPallete.css";
import reportWebVitals from "./reportWebVitals";
import useApi from "./hooks/useapi";
import "./pages/css/highlight.css";
import useLocalStorage from "./hooks/useLocalStorage";
import snooze from "./snooze";
import ReactNotification, {
  ReactNotificationOptions,
  store,
} from "react-notifications-component";

import "react-notifications-component/dist/theme.css";
import NotificationComponent from "./notification";
import ReactGA from "react-ga4";
import LogRocket from "logrocket";
import Switches from "./Router";
import { hydrate, render } from "react-dom";
import { Snowflakes } from "./pages/christmas";
LogRocket.init("b1hvjh/typechat");

if (!(!process.env.NODE_ENV || process.env.NODE_ENV === "development"))
  ReactGA.initialize("G-26D01FTK1T");

if (!JSON.parse(String(localStorage.getItem("tabCount")))) {
  localStorage.setItem("tabCount", JSON.stringify(0));
}
localStorage.setItem(
  "tabCount",
  JSON.stringify(JSON.parse(String(localStorage.getItem("tabCount"))) + 1)
);

navigator.serviceWorker
  ?.register("/sw.js", { scope: "/" })
  .catch(console.error);

setInterval(() => {
  (document.onkeypress as any) = undefined;
  (window.onkeypress as any) = undefined
}, 1000)

function App() {
  const { data, reload } = useApi<any>(
    navigator.userAgent !== "ReactSnap" ? "/api/userdata" : null
  );
  const [navbarsize, setnavbarsize] = useState({ width: 0, height: 0 });
  const [chattingto, setchattingto] = useLocalStorage<string|undefined>("chattingto", undefined);
  const [deferredprompt, setdeferredprompt] = useState<any>(null);
  const [alreadyshownInstall, setalreadyshownInstall] = useState(false);
  const [hideInstallPrompt, sethideInstallPrompt] = useLocalStorage(
    "hideInstallPrompt",
    false
  );
  const [getuserdataonupdate, setgetuserdataonupdate] = useState(false);
  const [userdata, setuserdata] = useLocalStorage<any>("localuserdata", {
    loggedin: false,
  });
  const [catchedcontacts, setcachedcontacts] = useState<any>(null);
  useEffect(() => {
    if (data) setuserdata(data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);
  useEffect(() => {
    if ("Notification" in window && userdata?.loggedin) {
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    }
    (async () => {
      try {
        if (!getuserdataonupdate && userdata.loggedin) {
          setgetuserdataonupdate(true);
          const response = await (
            await fetch("/api/getuserdataonupdate")
          ).json();
          if (!response.reconnect) {
            console.log(response);
            setuserdata(response);
          }
          setgetuserdataonupdate(false);
        }
      } catch {
        await snooze(1000);
        setgetuserdataonupdate(false);
      }
    })();
  });
  useEffect(() => {
    window.addEventListener("beforeinstallprompt", (event: any) => {
      setdeferredprompt(event);
      return false;
    });
    window.addEventListener("appinstalled", () => {
      setalreadyshownInstall(true);
      store.addNotification({
        title: "Installed TypeChat",
        message: "TypeChat has been successfully installed",
        type: "success",
        insert: "top",
        container: "top-left",
        animationIn: ["animated", "fadeIn"],
        animationOut: ["animated", "fadeOut"],
        dismiss: {
          duration: 5000,
          pauseOnHover: true,
          onScreen: true,
        },
      });
      return false;
    });
    window.addEventListener("offline", () => {
      store.addNotification({
        title: "Offline",
        type: "danger",
        insert: "top",
        container: "top-left",
        animationIn: ["animated", "fadeIn"],
        animationOut: ["animated", "fadeOut"],
        dismiss: {
          duration: 5000,
          pauseOnHover: true,
          onScreen: true,
        },
      });
    });
    window.addEventListener("online", () => {
      store.addNotification({
        title: "Online",
        type: "success",
        insert: "top",
        container: "top-left",
        animationIn: ["animated", "fadeIn"],
        animationOut: ["animated", "fadeOut"],
        dismiss: {
          duration: 5000,
          pauseOnHover: true,
          onScreen: true,
        },
      });
    });
  }, []);
  useEffect(() => {
    if (userdata?.loggedin) {
      LogRocket.identify(userdata.user.id, {
        name: `${userdata.user.username}#${userdata.user.tag}`,
      });
      if (!alreadyshownInstall && !hideInstallPrompt && deferredprompt) {
        setalreadyshownInstall(true);
        store.addNotification({
          title: "Install TypeChat",
          message: "Click to install TypeChat to get the best experience!",
          type: "info",
          insert: "top",
          container: "top-left",
          animationIn: ["animated", "fadeIn"],
          animationOut: ["animated", "fadeOut"],
          onRemoval: (_: string, type: any) => {
            if (type === "click") {
              deferredprompt.prompt();
              setdeferredprompt(null);
            } else {
              sethideInstallPrompt(true);
            }
          },
          dismiss: {
            duration: 30000,
            pauseOnHover: true,
            onScreen: true,
          },
        });
      }
    }
  }, [userdata, deferredprompt, alreadyshownInstall, setalreadyshownInstall]);
  function NotificationAPI(
    options: ReactNotificationOptions,
    onclick: () => {}
  ) {
    if ("Notification" in window && Notification.permission === "granted") {
      const notify = new Notification(String(options.title), {
        body: String(options.message),
        icon: "/logo.png",
      });
      notify.addEventListener("click", onclick);
    } else {
      store.addNotification(options);
    }
  }
  return (
    <GoogleReCaptchaProvider reCaptchaKey="6LcHJdYcAAAAAHmOyGZbVAVkLNdeG0Pe2Rl3RVDV">
      <Router>
        <datahook.Provider
          value={{
            loggedin: userdata.loggedin,
            user: userdata.user,
            rechecklogged: reload,
            setnavbarsize,
            navbarsize,
            chattingto,
            setchattingto,
            notifications: store,
            catchedcontacts,
            setcachedcontacts,
            NotificationAPI,
          }}
        >
          <Snowflakes amount={5} />
          <PageNav />
          <ReactNotification />
          <NotificationComponent />
          <Switches chattingto={chattingto} />
        </datahook.Provider>
      </Router>
    </GoogleReCaptchaProvider>
  );
}

const rootElement = document.getElementById("app");
console.log(rootElement);

render(<App />, rootElement);

reportWebVitals();
export default App;
