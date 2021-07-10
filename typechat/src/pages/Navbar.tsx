import { useData } from "../hooks/datahook";
import { Nav, Navbar } from "react-bootstrap";
import bigLogo from "../images/logos/TypeChat.svg";
import smallLogo from "../images/logos/TS.svg";
import "bootstrap/dist/css/bootstrap.min.css";
import "./css/nav.css";
import cookies from "../cookies";
import useWindowSize from "../hooks/usescreensize";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faComment,
  faUserFriends,
  faPlus,
  faSignOutAlt,
  faCog,
} from "@fortawesome/free-solid-svg-icons";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";
import useComponentSize from "@rehooks/component-size";
const PageNav = () => {
  const { width } = useWindowSize();
  const Navbarref = useRef(null);
  const navbarsize = useComponentSize(Navbarref);
  const { loggedin, user, rechecklogged, setnavbarsize, chattingto } =
    useData();
  useEffect(() => {
    setnavbarsize(navbarsize);
  }, [navbarsize]);
  const location = useLocation();
  return (
    <>
      <Navbar ref={Navbarref} bg="darkpurple" variant="dark" fixed="top">
        <Navbar.Brand as={Link} to={loggedin ? "/contacts" : "/"}>
          <img
            src={width > 700 ? bigLogo : smallLogo}
            style={{
              height: "40px",
            }}
          />{" "}
        </Navbar.Brand>

        <Nav className="mc-auto">
          {loggedin ? (
            <>
              {chattingto ? (
                <Nav.Link
                  as={Link}
                  to="/chat"
                  style={{
                    color: location.pathname === "/chat" ? "white" : "",
                  }}
                >
                  <FontAwesomeIcon icon={faComment} />
                </Nav.Link>
              ) : (
                <></>
              )}
              <Nav.Link
                as={Link}
                to="/contacts"
                style={{
                  color: location.pathname === "/contacts" ? "white" : "",
                }}
              >
                <FontAwesomeIcon icon={faUserFriends} />
              </Nav.Link>
              <Nav.Link
                as={Link}
                to="/add"
                style={{ color: location.pathname === "/add" ? "white" : "" }}
              >
                <FontAwesomeIcon icon={faPlus} />
              </Nav.Link>
            </>
          ) : (
            <></>
          )}
        </Nav>
        <Nav>
          <Nav.Link
            as={Link}
            to="/settings"
            style={{ color: location.pathname === "/settings" ? "white" : "" }}
          >
            <FontAwesomeIcon icon={faCog} />
          </Nav.Link>
          {loggedin ? (
            <>
              <Nav.Link
                as={Link}
                to="/user/settings"
                style={{
                  color: location.pathname === "/user/settings" ? "white" : "",
                }}
              >
                <img
                  src={"/files/" + user.profilePic}
                  style={{ height: "24px", borderRadius: "50%" }}
                />
                <span style={{ marginLeft: "5px" }}>
                  {user.username}
                  {width > 700 ? (
                    <span style={{ color: "lightgray" }}>#{user.tag}</span>
                  ) : (
                    <></>
                  )}
                </span>
              </Nav.Link>
              <Nav.Link
                onClick={async () => {
                  await fetch("/api/logout");
                  cookies.remove("token");
                  rechecklogged();
                }}
              >
                <FontAwesomeIcon icon={faSignOutAlt} />
              </Nav.Link>
            </>
          ) : (
            <>
              <Nav.Link
                as={Link}
                to="/login"
                style={{ color: location.pathname === "/login" ? "white" : "" }}
              >
                Login
              </Nav.Link>
              <Nav.Link
                as={Link}
                to="/signup"
                style={{
                  color: location.pathname === "/signup" ? "white" : "",
                }}
              >
                Sign Up
              </Nav.Link>
            </>
          )}
        </Nav>
      </Navbar>
      <div style={{ height: navbarsize.height }}></div>
    </>
  );
};
export default PageNav;
