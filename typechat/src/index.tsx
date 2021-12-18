import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import "./index.css";
import "./pages/css/toggleswitch.css";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import "./pages/css/scrollbar.css";
import Home from "./pages/Home";
import Login from "./pages/Login";
import { data as datahook } from "./hooks/datahook";
import PageNav from "./pages/Navbar";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import "./colourPallete.css";
import reportWebVitals from "./reportWebVitals";
import useApi from "./hooks/useapi";
import Loader from "./pages/loader";
import Signup from "./pages/Signup";
import Chat from "./pages/Chat";
import "./pages/css/highlight.css";
import Error404 from "./pages/404";
import useLocalStorage from "./hooks/useLocalStorage";
import UserSettings from "./pages/usersettings";
import snooze from "./snooze";
import Contacts from "./pages/contacts";
import ReactNotification, {
  ReactNotificationOptions,
  store,
} from "react-notifications-component";

import "react-notifications-component/dist/theme.css";
import AddPeople from "./pages/addpeople";
import NotificationComponent from "./notification";
import LoadError from "./pages/error";
import Settings from "./pages/settings";
import Verify from "./pages/Verify";
import LinkDiscord from "./pages/LinkDiscord";
import Drive from "./pages/Drive";
import RequestNewPassword from "./pages/requestNewPassword";
import Blast from "./pages/blast";
import ReactGA from "react-ga4";
import LogRocket from "logrocket";
import TandC from "./pages/T&C";
LogRocket.init("b1hvjh/typechat");

if (!(!process.env.NODE_ENV || process.env.NODE_ENV === "development")) ReactGA.initialize("G-26D01FTK1T");


if (!JSON.parse(String(localStorage.getItem("tabCount")))) {
  localStorage.setItem("tabCount", JSON.stringify(0));
}
localStorage.setItem(
  "tabCount",
  JSON.stringify(JSON.parse(String(localStorage.getItem("tabCount"))) + 1)
);

navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(console.error);

function App() {
  const { data, error, loading, reload } = useApi<any>("/api/userdata");
  const [navbarsize, setnavbarsize] = useState({ width: 0, height: 0 });
  const [chattingto, setchattingto] = useLocalStorage("chattingto", null);
  const [deferredprompt, setdeferredprompt] = useState<any>(null);
  const [alreadyshownInstall, setalreadyshownInstall] = useState(false);
  const [getuserdataonupdate, setgetuserdataonupdate] = useState(false);
  const [userdata, setuserdata] = useState(data);
  const [catchedcontacts, setcachedcontacts] = useState<any>(null);
  useEffect(() => {
    setuserdata(data);
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
      setdeferredprompt(event)
      return false;
    });
    window.addEventListener("appinstalled", (event: any) => {
      setalreadyshownInstall(true)
      store.addNotification({
        title: "Installed TypeChat",
        message: "TypeChat has been successfully installed",
        type: "success",
        insert: "top",
        container: "top-right",
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
  }, [])
  useEffect(() => {
    if (userdata?.loggedin) {
      console.log(userdata);
      LogRocket.identify(userdata.user.id, {
        name: `${userdata.user.username}#${userdata.user.tag}`,
      });
      if (!alreadyshownInstall && deferredprompt) {
        setalreadyshownInstall(true);
        store.addNotification({
          title: "Install TypeChat",
          message: "Click to install TypeChat to get the best experience!",
          type: "info",
          insert: "top",
          container: "top-right",
          animationIn: ["animated", "fadeIn"],
          animationOut: ["animated", "fadeOut"],
          onRemoval: (_: string, type: any) => {
            if (type === "click") {
              deferredprompt.prompt();
              setdeferredprompt(null);
            }
          },
          dismiss: {
            duration: 10000,
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
        <div style={{ overflowWrap: "anywhere" }}>
          {error || loading ? (
            error ? (
              <LoadError error={String(error)}></LoadError>
            ) : (
              <Loader></Loader>
            )
          ) : (
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
              <PageNav />
              <ReactNotification />
              <NotificationComponent />
              <div>
                <Switch>
                  <Route path="/" exact>
                    <Home />
                  </Route>
                  <Route path="/chat" exact>
                    <Redirect to={chattingto ? `/chat/${chattingto}` : "/"} />
                  </Route>
                  <Route
                    path="/chat/:id"
                    render={({ match }) => (
                      <Chat isGroupChat={false} chattingto={match.params.id} />
                    )}
                    exact
                  ></Route>
                  <Route path="/contacts" exact>
                    <Contacts />
                  </Route>
                  <Route path="/blast" exact>
                    <Blast.Blast />
                  </Route>
                  <Route path="/T&C" exact>
                    <TandC />
                  </Route>
                  <Route path="/verify/:id" exact>
                    <Verify />
                  </Route>
                  <Route path="/settings" exact>
                    <Settings />
                  </Route>
                  <Route path="/login" exact>
                    <Login />
                  </Route>
                  <Route path="/link/:id" exact>
                    <LinkDiscord />
                  </Route>
                  <Route path="/signup" exact>
                    <Signup />
                  </Route>
                  <Route path="/user/drive" exact>
                    <Drive.Drive />
                  </Route>
                  <Route path="/drive/:id" exact>
                    <Drive.Image />
                  </Route>
                  <Route path="/requestNewPassword" exact>
                    <RequestNewPassword.RequestNewPassword />
                  </Route>
                  <Route path="/updatepassword/:id" exact>
                    <RequestNewPassword.ChangePassword />
                  </Route>

                  <Route path="/user/settings" exact>
                    <UserSettings />
                  </Route>
                  <Route path="/add" exact>
                    <AddPeople></AddPeople>
                  </Route>
                  <Route>
                    <Error404></Error404>
                  </Route>
                </Switch>
              </div>
            </datahook.Provider>
          )}
        </div>
      </Router>
    </GoogleReCaptchaProvider>
  );
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("app")
);
reportWebVitals();
export default App;
