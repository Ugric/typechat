import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";
import Home from './pages/Home';
import Login from './pages/Login';
import { data as datahook } from "./hooks/datahook"
import PageNav from './pages/Navbar';
import "./colourPallete.css"
import reportWebVitals from './reportWebVitals';
import useApi from './hooks/useapi';
import Loader from './pages/loader';

function App() {
  const { data, error, loading } = useApi("/api/userdata")
  return <div style={{ overflowWrap: "anywhere" }}>
    {error || loading ? <Loader></Loader> :
      <Router>
        <datahook.Provider value={{ loggedin: data.loggedin, user: data.user }}>
          <PageNav />
          <div>
            <Switch>
              <Route path="/" exact>
                <Home />
              </Route>
              <Route path="/login" exact>
                <Login />
              </Route>
            </Switch>
          </div></datahook.Provider>
      </Router>}</div>
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
reportWebVitals();
