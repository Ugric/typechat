import { useEffect, useState } from "react";
import { useData } from "../hooks/datahook";
import ColorThief from "colorthief";
import { Link, Redirect, useHistory } from "react-router-dom";
import useApi from "../hooks/useapi";
import Loader from "./loader";
import LoadError from "./error";
import { useRef } from "react";
import "./css/contacts.css";
import Modal from "react-modal";
import ProfilePage from "./profilePage";
import playSound from "../playsound";
import useLocalStorage from "../hooks/useLocalStorage";
import Badge from "./badges";
import Background from "./CustomBackground";
import ReactGA from "react-ga4";

const colorThief = new ColorThief();

function Contact({
  user,
}: {
  user: {
    profilePic: string;
    username: string;
    id: string;
    tag: string;
    backgroundImage: string | null;

    badges: { name: string }[];
    aboutme: string;
    [key: string]: any;
  };
}) {
  const [backgroundcolour, setbackgroundcolour] = useState({
    r: 86,
    g: 86,
    b: 255,
  });
  const history = useHistory();
  const holdref = useRef<any>();
  const [UserModelIsOpen, setUserModelIsOpen] = useState(false);

  useEffect(() => {

    ReactGA.event({
      category: "contacts",
      action: "open contacts"
    });
    document.title = `Contacts - TypeChat`;
    return () => {
      document.title = "TypeChat";
    };
  }, []);
  return (
    <>
      <div
        onPointerDown={ (e: any) => {
          holdref.current = setTimeout(() => {
            holdref.current = undefined;
            playSound("/sounds/click1.mp3");
            setUserModelIsOpen(true);
          }, 500);
          playSound("/sounds/click2.mp3");
        } }
        onTouchMove={ () => {
          if (holdref.current) {
            clearInterval(holdref.current);
            holdref.current = undefined;
          }
        } }
        onClick={ () => {
          if (holdref.current) {
            clearInterval(holdref.current);
            playSound("/sounds/click1.mp3");
            history.push(`/chat/${user.id}`);
          }
        } }
        style={ {
          backgroundImage: user.backgroundImage
            ? `url(/files/${user.backgroundImage})`
            : "",
          backgroundColor: `rgb(${backgroundcolour.r}, ${backgroundcolour.g}, ${backgroundcolour.b})`,
          padding: "1rem",
          marginBottom: "1rem",
          backgroundRepeat: user.backgroundImage ? "no-repeat" : undefined,
          backgroundSize: user.backgroundImage ? "cover" : undefined,
          backgroundPosition: user.backgroundImage ? "center" : undefined,
          borderRadius: "10px",
          textOverflow: "ellipsis",
          overflow: "hidden",
          whiteSpace: "nowrap",
          cursor: "pointer",

          minHeight: "82px",
        } }
        className={ "contactbutton noselect" }
      >
        <div style={ {
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          flexDirection: "row"
        } }>
          <img
            alt="profile"
            loading="lazy"
            src={ "/files/" + user.profilePic }
            style={ {
              maxHeight: "50px",
              maxWidth: "100%",
              height: "auto",
              width: "auto",
              borderRadius: "50%",
            } }
            onLoad={ (e: any) => {
              const resp = colorThief.getColor(e.target);
              setbackgroundcolour({ r: resp[0], g: resp[1], b: resp[2] });
            } }
          />
          <span
            style={ {
              color: "white",
              WebkitTextStroke: "1px black",
              fontWeight: "bold",
              fontSize: "20px",
              marginLeft: "5px",
            } }
          >
            { user.username }
          </span></div>
        <Badge badges={ user.badges } side="flex-end" size="25px"></Badge>
      </div>
      <Modal
        isOpen={ UserModelIsOpen }
        onRequestClose={ () => {
          setUserModelIsOpen(false);
        } }
        style={ {
          overlay: {
            backgroundColor: "rgb(18 18 18 / 50%)",
            zIndex: 10,
          },
          content: {
            backgroundColor: "transparent",
            zIndex: 11,
            border: "none",
            top: "50%",
            left: "50%",
            right: "auto",
            bottom: "auto",
            marginRight: "-50%",
            padding: undefined,
            transform: "translate(-50%, -50%)",
            width: "75%",
            maxWidth: "750px",

            maxHeight: "500px",
          },
        } }
        contentLabel="Username Change"
      >
        <ProfilePage user={ user }></ProfilePage>
      </Modal>
    </>
  );
}

function Contacts() {
  const { loggedin } = useData();
  const { data, loading, error } = useApi<any>("/api/getallcontacts");
  const [search, setsearch] = useState("");
  const [localcontacts, setlocalcontacts] = useLocalStorage<undefined | any>(
    "contacts",
    undefined
  );
  useEffect(() => {
    document.documentElement.scrollTop = 0;
  }, []);
  useEffect(() => {
    if (data && data.contacts) {
      setlocalcontacts(data.contacts);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);
  if (!loggedin) {
    return <Redirect to="/"></Redirect>;
  }
  return (loading || error) && !localcontacts ? (
    error ? (
      <LoadError error={ String(error) }></LoadError>
    ) : (
      <Loader></Loader>
    )
  ) : (
    <div
      style={ {
        margin: "1rem 0",
      } }
    ><Background />
      <div
        style={ {
          margin: "auto",
          borderRadius: "10px",
          padding: "1rem",
          maxWidth: "700px",
        } }
      >
        <h1 style={ { textAlign: "center", WebkitTextStroke: "1px black" } }>Contacts</h1>
        <div>
          { localcontacts || data.resp ? (
            (data && data.contacts.length > 0) ||
              (localcontacts && localcontacts.length > 0) ? (
              <>
                <input
                  type="text"
                  style={ {
                    width: "100%",
                    backgroundColor: "var(--dark-bg-colour)",
                    padding: "5px",
                    borderRadius: "20px",
                    border: "solid 1px var(--light-bg-colour)",
                    color: "white",
                    marginBottom: "1rem",
                  } }
                  placeholder={ "search contacts" }
                  onKeyUp={ (e: any) => {
                    setsearch(e.target.value.trim());
                  } }
                ></input>
                { (data ? data.contacts : localcontacts).map((contact: any) =>
                  (contact.username + "#" + contact.tag)
                    .toUpperCase()
                    .includes(search.toUpperCase()) ? (
                    <Contact key={ contact.id } user={ contact }></Contact>
                  ) : (
                    <></>
                  )
                ) }
              </>
            ) : (
              <p style={ { textAlign: "center" } }>
                You have no contacts,{ " " }
                <span>
                  <Link
                    style={ { color: "var(--secondary-text-colour)" } }
                    to="/add"
                  >
                    add people
                  </Link>
                </span>{ " " }
                or wait for them to add you back!
              </p>
            )
          ) : (
            <p style={ { color: "red", textAlign: "center" } }>{ data.err }</p>
          ) }
        </div>
      </div>
    </div>
  );
}

export default Contacts;
