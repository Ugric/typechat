import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import "./index.css";
import "./pages/css/toggleswitch.css";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import "./pages/css/scrollbar.css";
import Home from "./pages/Home";
import Login from "./pages/Login";
import { data as datahook } from "./hooks/datahook";
import PageNav from "./pages/Navbar";
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
import snooze from "./snooze"

function App() {
  const { data, error, loading, reload } = useApi("/api/userdata");
  const [navbarsize, setnavbarsize] = useState({ width: 0, height: 0 });
  const [chattingto, setchattingto] = useLocalStorage("chattingto", null);
  const [getuserdataonupdate, setgetuserdataonupdate] = useState(false)
  const [userdata, setuserdata] = useState(data)
  useEffect(() => { setuserdata(data) }, [data])
  useEffect(() => {
    (async () => {
      try {
        if (!getuserdataonupdate) {
          setgetuserdataonupdate(true)
          const response = (await (await fetch("/api/getuserdataonupdate")).json())
          if (!response.reconnect) {
            setuserdata(response)
          }
          setgetuserdataonupdate(false)
        }
      } catch {
        await snooze(1000)
        setgetuserdataonupdate(false)
      }
    })()
  })
  return (
    <div style={{ overflowWrap: "anywhere" }}>
      {error || loading ? (
        <Loader></Loader>
      ) : (
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
            }}
          >
            <PageNav />
            <div>
              <Switch>
                <Route path="/" exact>
                  <Home />
                </Route>
                <Route path="/chat" exact>
                  <Chat />
                </Route>
                <Route path="/login" exact>
                  <Login />
                </Route>
                <Route path="/signup" exact>
                  <Signup />
                </Route>
                <Route path="/user/settings" exact>
                  <UserSettings />
                </Route>
                <Route>
                  <Error404></Error404>
                </Route>
              </Switch>
            </div>
          </datahook.Provider>
        </Router>
      )}
    </div>
  );
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);
reportWebVitals();
export default App;
