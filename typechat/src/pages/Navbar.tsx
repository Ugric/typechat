import { useData } from "../hooks/datahook"
import { Nav, Navbar } from 'react-bootstrap';
import bigLogo from "../images/logos/TypeChat.svg";
import smallLogo from "../images/logos/TS.svg";
import 'bootstrap/dist/css/bootstrap.min.css';
import "./css/nav.css"
import useWindowSize from "../hooks/usescreensize";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHome, faUserFriends, faPlus, faSignInAlt } from '@fortawesome/free-solid-svg-icons'
import { Link, useLocation } from "react-router-dom";
const PageNav = () => {
    const { width } = useWindowSize()
    const { loggedin, user } = useData()
    const location = useLocation()
    console.log(width)
    return <Navbar bg="darkpurple" variant="dark" sticky="top">
        <Navbar.Brand as={Link} to="/"><img src={width > 500 ? bigLogo : smallLogo} style={{
            height: "40px",
        }} /> </Navbar.Brand>
        <Nav className="mc-auto">
            <Nav.Link as={Link} to="/" style={{ color: location.pathname === "/" ? "white" : "" }}><FontAwesomeIcon icon={faHome} /></Nav.Link>
            <Nav.Link as={Link} to="/contacts" style={{ color: location.pathname === "/contacts" ? "white" : "" }}><FontAwesomeIcon icon={faUserFriends} /></Nav.Link>
            <Nav.Link as={Link} to="/add" style={{ color: location.pathname === "/add" ? "white" : "" }}><FontAwesomeIcon icon={faPlus} /></Nav.Link>
        </Nav>
        <Nav> {loggedin ?
            <Nav.Link as={Link} to="/settings" style={{ color: location.pathname === "/settings" ? "white" : "" }}>{user.username}</Nav.Link> : <Nav.Link as={Link} to="/signin" style={{ color: location.pathname === "/signin" ? "white" : "" }}><FontAwesomeIcon icon={faSignInAlt} /></Nav.Link>}</Nav>
    </Navbar>
}
export default PageNav