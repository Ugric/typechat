import { useData } from "../hooks/datahook";
import { Nav, Navbar, Dropdown } from "react-bootstrap";
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
  faRocket,
  faUserCog,
  faPhotoVideo,
} from "@fortawesome/free-solid-svg-icons";
import { faDiscord } from "@fortawesome/free-brands-svg-icons";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";
import useComponentSize from "@rehooks/component-size";
import playSound from "../playsound";
import isElectron from "is-electron";
const PageNav = () => {
  const { width } = useWindowSize();
  const Navbarref = useRef(null);
  const navbarsize = useComponentSize(Navbarref);
  const { loggedin, user, rechecklogged, setnavbarsize, chattingto } =
    useData();
  useEffect(() => {
    setnavbarsize(navbarsize);
  }, [navbarsize, setnavbarsize]);
  const location = useLocation();
  return (
    <>
      <Navbar
        ref={Navbarref}
        bg="darkpurple"
        variant="dark"
        fixed="top"
        style={{ top: isElectron() ? "30px" : undefined }}
      >
        <Navbar.Brand
          onPointerDown={() => {
            playSound("/sounds/click2.mp3");
          }}
          onPointerUp={() => {
            playSound("/sounds/click1.mp3");
          }}
          as={Link}
          to={loggedin ? "/contacts" : "/"}
        >
          <img
            alt="TypeChat"
            src={width > 700 ? bigLogo : smallLogo}
            style={{
              height: "40px",
            }}
          />
        </Navbar.Brand>

        <Nav className="mc-auto">
          {loggedin ? (
            <>
              {chattingto ? (
                <Nav.Link
                  onPointerDown={() => {
                    playSound("/sounds/click2.mp3");
                  }}
                  onPointerUp={() => {
                    playSound("/sounds/click1.mp3");
                  }}
                  as={Link}
                  to={`/chat/${chattingto}`}
                  style={{
                    color:
                      location.pathname === `/chat/${chattingto}`
                        ? "white"
                        : "",
                  }}
                  title="Chat"
                >
                  <FontAwesomeIcon icon={faComment} />
                </Nav.Link>
              ) : (
                <></>
              )}
              <Nav.Link
                onPointerDown={() => {
                  playSound("/sounds/click2.mp3");
                }}
                onPointerUp={() => {
                  playSound("/sounds/click1.mp3");
                }}
                as={Link}
                title="Contacts"
                to="/contacts"
                style={{
                  color: location.pathname === "/contacts" ? "white" : "",
                }}
              >
                <FontAwesomeIcon icon={faUserFriends} />
              </Nav.Link>
              <Nav.Link
                onPointerDown={() => {
                  playSound("/sounds/click2.mp3");
                }}
                onPointerUp={() => {
                  playSound("/sounds/click1.mp3");
                }}
                as={Link}
                to="/add"
                style={{ color: location.pathname === "/add" ? "white" : "" }}
                title="Add People"
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
            onPointerDown={() => {
              playSound("/sounds/click2.mp3");
            }}
            onPointerUp={() => {
              playSound("/sounds/click1.mp3");
            }}
            onClick={() => window.open("/invite", "blank_")}
          >
            <FontAwesomeIcon icon={faDiscord} />
          </Nav.Link>
          <Nav.Link
            onPointerDown={() => {
              playSound("/sounds/click2.mp3");
            }}
            onPointerUp={() => {
              playSound("/sounds/click1.mp3");
            }}
            as={Link}
            to="/blast"
            style={{ color: location.pathname === "/blast" ? "white" : "" }}
          >
            <FontAwesomeIcon icon={faRocket} />
          </Nav.Link>
          <Nav.Link
            onPointerDown={() => {
              playSound("/sounds/click2.mp3");
            }}
            onPointerUp={() => {
              playSound("/sounds/click1.mp3");
            }}
            as={Link}
            to="/settings"
            style={{ color: location.pathname === "/settings" ? "white" : "" }}
          >
            <FontAwesomeIcon icon={faCog} />
          </Nav.Link>
          {loggedin ? (
            <>
              <Dropdown>
                <Dropdown.Toggle
                  style={{
                    backgroundColor: "transparent",
                    border: "none",
                    margin: "0",
                    padding: "0",
                  }}
                  onPointerDown={() => {
                    playSound("/sounds/click2.mp3");
                  }}
                  onPointerUp={() => {
                    playSound("/sounds/click1.mp3");
                  }}
                >
                  <img
                    alt="Profile"
                    src={"/files/" + user.profilePic}
                    style={{ height: "40px", borderRadius: "50%" }}
                  />
                </Dropdown.Toggle>

                <Dropdown.Menu alignRight className={"db-darkpurple"}>
                  <Dropdown.Item
                    as={Link}
                    to="/user/settings"
                    onPointerDown={() => {
                      playSound("/sounds/click2.mp3");
                    }}
                    onPointerUp={() => {
                      playSound("/sounds/click1.mp3");
                    }}
                  >
                    <FontAwesomeIcon icon={faUserCog} /> User Settings
                  </Dropdown.Item>
                  <Dropdown.Item
                    as={Link}
                    to="/user/drive"
                    onPointerDown={() => {
                      playSound("/sounds/click2.mp3");
                    }}
                    onPointerUp={() => {
                      playSound("/sounds/click1.mp3");
                    }}
                  >
                    <FontAwesomeIcon icon={faPhotoVideo} /> Drive
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={async () => {
                      await fetch("/api/logout");
                      cookies.remove("token");
                      rechecklogged();
                      localStorage.removeItem("chats");
                      localStorage.removeItem("contacts");
                      localStorage.removeItem("chattingto");
                    }}
                    onPointerDown={() => {
                      playSound("/sounds/click2.mp3");
                    }}
                    onPointerUp={() => {
                      playSound("/sounds/click1.mp3");
                    }}
                  >
                    <FontAwesomeIcon icon={faSignOutAlt} /> Logout
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </>
          ) : (
            <>
              <Nav.Link
                onPointerDown={() => {
                  playSound("/sounds/click2.mp3");
                }}
                onPointerUp={() => {
                  playSound("/sounds/click1.mp3");
                }}
                as={Link}
                to="/login"
                style={{ color: location.pathname === "/login" ? "white" : "" }}
              >
                Login
              </Nav.Link>
              <Nav.Link
                onPointerDown={() => {
                  playSound("/sounds/click2.mp3");
                }}
                onPointerUp={() => {
                  playSound("/sounds/click1.mp3");
                }}
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
      <div
        style={{ height: navbarsize.height + (isElectron() ? 30 : 0) }}
      ></div>
    </>
  );
};
export default PageNav;
