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
import ReactGA from "react-ga4";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/swiper-bundle.min.css";
import "swiper/swiper.min.css";
import SwiperCore, {
  Pagination,
  Mousewheel,
  Virtual,
  EffectCoverflow,
  Navigation
} from "swiper";
import isMobileDevice from "../isMobile";

SwiperCore.use([Pagination, Mousewheel, Virtual, EffectCoverflow, Navigation]);

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
  return (
    <>
      <div
        data-private
        onPointerDown={(e: any) => {
          holdref.current = setTimeout(() => {
            holdref.current = undefined;
            playSound("/sounds/click1.mp3");
            setUserModelIsOpen(true);
          }, 500);
          playSound("/sounds/click2.mp3");
        }}
        onTouchMove={() => {
          if (holdref.current) {
            clearInterval(holdref.current);
            holdref.current = undefined;
          }
        }}
        onClick={() => {
          if (holdref.current) {
            clearInterval(holdref.current);
            playSound("/sounds/click1.mp3");
            history.push(`/chat/${user.id}`);
          }
        }}
        style={{
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
        }}
        className={"contactbutton noselect"}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            flexDirection: "row",
          }}
        >
          <img
            alt="profile"
            loading="lazy"
            src={"/files/" + user.profilePic}
            style={{
              maxHeight: "50px",
              maxWidth: "100%",
              height: "auto",
              width: "auto",
              borderRadius: "50%",
            }}
            onLoad={(e: any) => {
              const resp = colorThief.getColor(e.target);
              setbackgroundcolour({ r: resp[0], g: resp[1], b: resp[2] });
            }}
          />
          <span
            style={{
              color: "white",
              WebkitTextStroke: "1px black",
              fontWeight: "bold",
              fontSize: "20px",
              marginLeft: "5px",
            }}
          >
            {user.username}
          </span>
        </div>
        <Badge badges={user.badges} side="flex-end" size="25px"></Badge>
      </div>
      <Modal
        isOpen={UserModelIsOpen}
        onRequestClose={() => {
          setUserModelIsOpen(false);
        }}
        style={{
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
        }}
        contentLabel="Username Change"
      >
        <ProfilePage user={user}></ProfilePage>
      </Modal>
    </>
  );
}

function Groups() {
  return (
    <div
      style={{
        margin: "1rem 0",
      }}
    >
      <div
        style={{
          margin: "auto",
          borderRadius: "10px",
          padding: "1rem",
          maxWidth: "700px",
        }}
      >
        <h1 style={{ textAlign: "center", WebkitTextStroke: "1px black" }}>
          Groups coming soon!
        </h1>
      </div>
    </div>
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
  const contactsRef = useRef<any>();
  const elDistanceToTop = contactsRef.current
    ? window.pageYOffset + contactsRef.current.getBoundingClientRect().top
    : 0;
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
      <LoadError error={String(error)}></LoadError>
    ) : (
      <Loader></Loader>
    )
  ) : (
    <div
      style={{
        margin: "1rem 0",
      }}
    >
      <div
        style={{
          margin: "auto",
          borderRadius: "10px",
          padding: "1rem 2rem",
          maxWidth: "700px",
        }}
      >
        <h1 style={{ textAlign: "center", WebkitTextStroke: "1px black" }}>
          Contacts
        </h1>
        <div>
          {localcontacts || data.resp ? (
            (data && data.contacts.length > 0) ||
            (localcontacts && localcontacts.length > 0) ? (
              <>
                <input
                  data-private
                  type="text"
                  style={{
                    width: "100%",
                    backgroundColor: "var(--dark-bg-colour)",
                    padding: "5px",
                    borderRadius: "20px",
                    border: "solid 1px var(--light-bg-colour)",
                    color: "white",
                  }}
                  placeholder={"search contacts"}
                  onKeyUp={(e: any) => {
                    setsearch(e.target.value.trim());
                  }}
                ></input>
                <div
                  ref={contactsRef}
                  style={{
                    maxHeight: "calc(100vh - " + elDistanceToTop + "px)",
                    padding: "1rem",
                    overflowY: "auto",
                  }}
                >
                  {(data ? data.contacts : localcontacts).map(
                    (contact: any, i: number) =>
                      (contact.username + "#" + contact.tag)
                        .toUpperCase()
                        .includes(search.toUpperCase()) ? (
                        <Contact user={contact} key={contact.id}></Contact>
                      ) : (
                        <></>
                      )
                  )}
                </div>
              </>
            ) : (
              <p style={{ textAlign: "center" }}>
                You have no contacts,{" "}
                <span>
                  <Link
                    style={{ color: "var(--secondary-text-colour)" }}
                    to="/add"
                  >
                    add people
                  </Link>
                </span>{" "}
                or wait for them to add you back!
              </p>
            )
          ) : (
            <p style={{ color: "red", textAlign: "center" }}>{data.err}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function SwiperPages() {
  const { navbarsize } = useData();
  const [contactsShow, setcontactsShow] = useState(true);
  useEffect(() => {
    ReactGA.event({
      category: "contacts",
      action: "open contacts",
    });
    document.title = `Contacts - TypeChat`;
    return () => {
      document.title = "TypeChat";
    };
  }, []);
  return (
    <>
      <Swiper
        effect={"coverflow"}
        navigation={!isMobileDevice()}
        pagination={isMobileDevice()}
        direction="horizontal"
        mousewheel={{
          forceToAxis: true,
        }}
        coverflowEffect={{
          rotate: 50,
          stretch: 0,
          depth: 100,
          modifier: 1,
          slideShadows: false,
        }}
        virtual
        style={{
          height: `calc(100vh - ${navbarsize.height}px)`,
          overflow: "hidden",
        }}
        onTransitionEnd={(e) => {
          if (e.activeIndex !== 0) {
            setcontactsShow(false);
          }
        }}
        onTransitionStart={()=>{
          setcontactsShow(true);
        }}
      >
        <SwiperSlide virtualIndex={0}>
          {contactsShow? <Contacts />: <></>}
        </SwiperSlide>
        <SwiperSlide virtualIndex={1}>
          <Groups />
        </SwiperSlide>
      </Swiper>
    </>
  );
}

export default SwiperPages;
