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
import { data } from "./hooks/datahook"
import PageNav from './pages/Navbar';
import "./colourPallete.css"
import reportWebVitals from './reportWebVitals';

function App() {
  return <div style={{ overflowWrap: "anywhere" }}>
    <Router>
      <data.Provider value={{ loggedin: false, user: { username: "hi" } }}>
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
        </div></data.Provider>
    </Router></div>
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
reportWebVitals();
