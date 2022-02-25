import {
  faCloud,
  faCommentSlash,
  faCopy,
  faDesktop,
  faEthernet,
  faExclamation,
  faEyeSlash,
  faFile,
  faGift,
  faMobileAlt,
  faPaperPlane,
  faPause,
  faPencilAlt,
  faPlay,
  faPlus,
  faSadCry,
  faTimes,
  faTrash,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMinusCircle, faPlusCircle } from "@fortawesome/free-solid-svg-icons";
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  createContext,
  useContext,
} from "react";
import {
  Link,
  Redirect,
  useHistory,
  useLocation,
  useParams,
} from "react-router-dom";
import "./css/message.css";
import { useData } from "../hooks/datahook";
import Loader from "./loader";
import useWebSocket, { ReadyState } from "react-use-websocket";
import KeyboardEventHandler from "react-keyboard-event-handler";
import TextareaAutosize from "react-textarea-autosize";
import SyntaxHighlighter from "react-syntax-highlighter";
import playSound from "../playsound";
import useLocalStorage from "../hooks/useLocalStorage";
import emoji from "../emojis";
import useWindowSize from "../hooks/usescreensize";
import isElectron from "is-electron";
import notify from "../notifier";
import Linkify from "react-linkify";
import ReactPlayer from "react-player/lazy";
import useApi from "../hooks/useapi";
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";
import Badge from "./badges";
import ReactModal from "react-modal";
import GiftIcon from "./images/gift.svg";
import ReactGA from "react-ga4";
import useWindowVisable from "../hooks/useWindowVisable";
import isMobileDevice from "../isMobile";
import useWindowFocus from "use-window-focus";
import "./css/audio.css";
import useIsOnline from "../hooks/isonline";
const chatSettings = createContext({ time: 0 });
const usersContext = createContext<{
  exists: boolean;
  users: { [key: string]: any };
}>({ exists: false, users: {} });

const reg = new RegExp("[" + emoji.join("|") + "]", "g");
function onlyContainsEmojis(str: string) {
  const removeEmoji = (str: string) => str.replace(reg, "");

  return !removeEmoji(str).length;
}

const truncate = (input: string, limit: number) =>
  input.length > limit ? `${input.substring(0, limit)}...` : input;

function random(seed: number) {
  var x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}
function numToSSColumn(num: number) {
  let s = "",
    t;

  while (num > 0) {
    t = (num - 1) % 26;
    s = String.fromCharCode(66 + t) + s;
    num = ((num - t) / 26) | 0;
  }
  return s || undefined;
}

interface messageTypes {
  ID?: string;
  tempid?: number;
  time: number;
  from: string;
  edited: boolean;
}

interface messageWithText extends messageTypes {
  gift: undefined;
  amount: undefined;
  message: string;
  file: undefined;
  mimetype: undefined;
}
interface messageWithFile extends messageTypes {
  gift: undefined;
  amount: undefined;
  file: string;
  message: undefined;
  mimetype: string;
}

interface giftMessage extends messageTypes {
  gift: true;
  amount: number;
  from: string;
  message: string;
  file: undefined;
  mimetype: undefined;
  time: number;
}

const videoSites = [
  "youtube.com",
  "www.youtube.com",
  "twitch.tv",
  "www.twitch.tv",
  "youtu.be",
  "soundcloud.com",
  "www.soundcloud.com",
  "dailymotion.com",
  "www.dailymotion.com",
  "facebook.com",
  "www.facebook.com",
  "vimeo.com",
  "www.vimeo.com",
];

function MetaPage({
  url,
  decoratedText,
  decoratedHref,
  mine,
}: {
  url: string;
  decoratedText: string;
  decoratedHref: string;
  mine: boolean;
}) {
  const urldata = new URL(decoratedHref, "http://.");
  const { data } = useApi<{
    url: string;
    canonical: string;
    title: string;
    image: string;
    author: string;
    description: string;
    keywords: string;
    source: string;
    price: string;
    priceCurrency: string;
    availability: string;
    robots: string;
    "og:url": string;
    "og:locale": string;
    "og:locale:alternate": string;
    "og:title": string;
    "og:type": string;
    "og:description": string;
    "og:determiner": string;
    "og:site_name": string;
    "og:image": string;
    "og:image:secure_url": string;
    "og:image:type": string;
    "og:image:width": string;
    "og:image:height": string;
    "twitter:title": string;
    "twitter:image": string;
    "twitter:image:alt": string;
    "twitter:card": string;
    "twitter:site": string;
    "twitter:site:id": string;
    "twitter:account_id": string;
    "twitter:creator": string;
    "twitter:creator:id": string;
    "twitter:player": string;
    "twitter:player:width": string;
    "twitter:player:height": string;
    "twitter:player:stream": string;
    jsonld: {};
  }>("/api/getmetadata?" + new URLSearchParams({ url: urldata.href }));
  return data ? (
    <div
      style={{
        padding: "1rem",
        border: `solid 1px ${mine ? "var(--main-bg-colour)" : "#d0d0d0"}`,
        backgroundColor: mine ? "var(--main-bg-colour)" : "#dadada",
        borderRadius: "10px",
        maxWidth: "350px",
        margin: "auto",
      }}
    >
      <a
        href={decoratedHref}
        target="blank"
        style={{
          fontSize: "24px",
        }}
      >
        <img
          alt={urldata.hostname}
          style={{
            marginRight: "5px",
            aspectRatio: "1/1",
            height: "100%",
            minHeight: "24px",
          }}
          src={`https://www.google.com/s2/favicons?${new URLSearchParams({
            size: "24",
            domain: urldata.hostname,
          })}`}
        />
        {data.title ? data.title : decoratedText}
      </a>
      <p>{data.description}</p>
      {data.image.length > 0 ? (
        <img
          src={new URL(data.image, url).href}
          style={{ width: "100%", borderRadius: "10px" }}
          alt={data.title ? data.title : decoratedText}
        ></img>
      ) : (
        <></>
      )}
    </div>
  ) : (
    <div
      style={{
        padding: "1rem",
        border: `solid 1px ${mine ? "var(--main-bg-colour)" : "#d0d0d0"}`,
        backgroundColor: mine ? "var(--main-bg-colour)" : "#dadada",
        borderRadius: "10px",
        margin: "5px",
      }}
    >
      <a
        href={decoratedHref}
        target="blank"
        style={{
          display: "flex",
          justifyContent: "space-between",
          margin: 0,
        }}
      >
        <img
          alt={urldata.hostname}
          style={{
            marginRight: "5px",
            aspectRatio: "1/1",
            height: "100%",
            minHeight: "24px",
          }}
          src={`https://www.google.com/s2/favicons?${new URLSearchParams({
            size: "24",
            domain: urldata.hostname,
          })}`}
        />
        <p style={{ maxWidth: "90%" }}>{decoratedText}</p>
      </a>
    </div>
  );
}

function MessageFaviconOrVideoRenderer({
  links,
  mine,
}: {
  links: {
    decoratedHref: string;
    decoratedText: string;
    key: number;
  }[];
  mine: boolean;
}) {
  return (
    <>
      {links.map(
        ({
          decoratedHref,
          decoratedText,
          key,
        }: {
          decoratedHref: string;
          decoratedText: string;
          key: number;
        }) => {
          try {
            const url = new URL(decoratedHref, "http://.");
            return (
              <React.Fragment key={key}>
                {videoSites.includes(url.hostname) ? (
                  <ReactPlayer
                    url={decoratedHref}
                    width="100%"
                    height="100%"
                    controls={true}
                    style={{ aspectRatio: "16/9" }}
                  />
                ) : (
                  <MetaPage
                    url={decoratedHref}
                    decoratedText={decoratedText}
                    decoratedHref={decoratedHref}
                    mine={mine}
                  ></MetaPage>
                )}
              </React.Fragment>
            );
          } catch {
            return <></>;
          }
        }
      )}
    </>
  );
}

function VoiceMessage({
  path,
  self,
  controllable,
}: {
  path: string;
  self: boolean;
  controllable: boolean;
}) {
  const audio = useMemo(() => new Audio(), [path]);
  const [playing, setPlaying] = useState(false);
  const [progress, setprogress] = useState(0);
  useEffect(() => {
    audio.src = path;
    audio.onpause = () => setPlaying(false);
    audio.onplay = () => setPlaying(true);
    audio.ontimeupdate = () => setprogress(audio.currentTime / audio.duration);
    return () => {
      audio.pause();
    };
  }, [audio]);
  return (
    <div>
      <div
        style={{
          width: controllable ? "645px" : "250px",
          maxWidth: "100%",
          display: "flex",
          justifyContent: "space-between",
          color: self
            ? "var(--main-text-colour)"
            : "var(--secondary-text-colour)",
        }}
      >
        <FontAwesomeIcon
          icon={playing ? faPause : faPlay}
          onClick={() => {
            if (playing) {
              if (!controllable) audio.currentTime = 0;
              audio.pause();
            } else {
              audio.play();
            }
          }}
        />
        {audio.duration ? (
          <p>
            {Math.round(playing ? progress * audio.duration : audio.duration) +
              "s"}
          </p>
        ) : (
          <></>
        )}
        <div
          className={`audio-visualiser ${
            playing ? "audio-visualiser-playing" : ""
          }`}
        >
          <div
            className="column"
            style={{
              animationDuration: "0.98s",
            }}
          ></div>
          <div
            className="column"
            style={{
              left: 12,
              animationDuration: "0.67s",
              animationDelay: "0.2",
            }}
          ></div>
          <div
            className="column"
            style={{
              left: 24,
              animationDuration: "0.86s",
              animationDelay: "0.1",
            }}
          ></div>
        </div>
      </div>
      <div
        style={{ width: "100%", backgroundColor: "gray" }}
        onClick={function (e: any) {
          if (controllable) {
            const bcr = e.target.getBoundingClientRect();
            audio.currentTime =
              ((e.clientX - bcr.left) / bcr.width) * audio.duration;
          }
        }}
      >
        <div
          style={{
            width: progress * 100 + "%",
            height: "15px",
            backgroundColor: "white",
            transition: "width 0.25s",
          }}
        ></div>
      </div>
    </div>
  );
}

function Message({
  messages,
  i,
  toscroll,
  scrolltobottom,
  user,
  sendJsonMessage,
  deleteFromID,
  editFromID,
}: {
  messages: Array<messageWithText | messageWithFile | giftMessage>;
  i: number;
  toscroll: any;
  user: any;
  scrolltobottom: Function;
  deleteFromID: Function;
  editFromID: Function;
  sendJsonMessage: Function;
}) {
  const message = messages[i].message;
  const messagecharlist = message ? Array.from(message) : undefined;
  const [editing, setediting] = useState(false);
  const [fullyopened, setfullyopened] = useState(false);
  const file = messages[i].file;
  const mimetype = messages[i].mimetype;
  const onlyemojis = message
    ? Array.from(message).length > 3 || !onlyContainsEmojis(message)
    : false;
  const links: {
    decoratedHref: string;
    decoratedText: string;
    key: number;
  }[] = [];
  const donekeys: number[] = [];
  const history = useHistory();
  const shiftkey = useRef(false);
  const key = useRef(null);
  const submitref = useRef<any>();
  const longmessage = messagecharlist && messagecharlist.length > 500;
  const messageref = useRef(message);
  return !messages[i].gift ? (
    <>
      <ContextMenuTrigger
        id={String(messages[i].ID ? messages[i].ID : messages[i].tempid)}
      >
        <div
          data-private
          style={{ opacity: !messages[i].ID ? 0.5 : undefined }}
          className={
            onlyemojis || file
              ? `message message-${
                  messages[i].from === user.id ? "mine" : "yours"
                } ${
                  messages[i - 1]?.from == messages[i].from &&
                  messages[i - 1] &&
                  messages[i].time - messages[i - 1].time < 300000
                    ? `mid-${messages[i].from === user.id ? "mine" : "yours"}`
                    : ""
                }
              ${
                !messages[i - 1] ||
                messages[i - 1].from !== messages[i].from ||
                messages[i].time - messages[i - 1].time > 300000
                  ? `first-${messages[i].from === user.id ? "mine" : "yours"}`
                  : ""
              }  
              ${
                !messages[i + 1] ||
                messages[i + 1].from !== messages[i].from ||
                (messages[i + 1] &&
                  messages[i + 1].time - messages[i].time > 300000)
                  ? `last-${messages[i].from === user.id ? "mine" : "yours"}`
                  : ""
              }`
              : `emojimessage-${
                  messages[i].from === user.id ? "mine" : "yours"
                }`
          }
        >
          {message ? (
            editing ? (
              <>
                <form
                  onSubmit={(e: any) => {
                    e.preventDefault();
                    setediting(false);
                    const tempmessage = messageref.current;
                    if (tempmessage === "") {
                      sendJsonMessage({ type: "delete", id: messages[i].ID });
                      deleteFromID(messages[i].ID);
                    } else if (message !== tempmessage) {
                      sendJsonMessage({
                        type: "edit",
                        id: messages[i].ID,
                        message: tempmessage,
                      });
                      editFromID(messages[i].ID, tempmessage);
                    }
                  }}
                >
                  <TextareaAutosize
                    onInput={(e: any) => {
                      if (key.current === 13 && !shiftkey.current) {
                        submitref.current.click();
                      } else {
                        const message = e.target.value.trim();
                        messageref.current = message;
                      }
                      const messagetoarray: string[] = Array.from(message);
                      e.target.value = Array.from(e.target.value)
                        .slice(0, 3000)
                        .join("");
                      if (messagetoarray.length <= 3000) {
                        e.target.value = Array.from(e.target.value)
                          .slice(0, 3000)
                          .join("");
                      }
                    }}
                    onKeyDown={(e: any) => {
                      key.current = e.keyCode;
                      shiftkey.current = e.shiftKey;
                    }}
                    autoFocus
                    style={{
                      backgroundColor: "var(--dark-bg-colour)",
                      padding: "5px",
                      borderRadius: "20px",
                      border: "solid 1px var(--light-bg-colour)",
                      color: "white",
                      resize: "none",
                      width: "100%",
                    }}
                    maxRows={10}
                    placeholder="Type Something..."
                    defaultValue={message}
                  />
                  <input
                    type="submit"
                    ref={submitref}
                    style={{ display: "none" }}
                  ></input>
                </form>
              </>
            ) : (
              <>
                <div>
                  {onlyemojis ? (
                    (longmessage && messagecharlist && !fullyopened
                      ? messagecharlist.slice(0, 500).join("")
                      : message
                    )
                      .split("```")
                      .map((value: string, index: number) =>
                        index % 2 === 0 ? (
                          <React.Fragment key={index}>
                            <Linkify
                              componentDecorator={(
                                decoratedHref,
                                decoratedText,
                                key
                              ) => {
                                if (!donekeys.includes(key)) {
                                  links.push({
                                    decoratedHref,
                                    decoratedText,
                                    key,
                                  });
                                  donekeys.push(key);
                                }
                                return (
                                  <a
                                    target="blank"
                                    href={decoratedHref}
                                    key={key}
                                  >
                                    {decoratedText}
                                  </a>
                                );
                              }}
                            >
                              {value.trim()}
                            </Linkify>
                          </React.Fragment>
                        ) : (
                          <SyntaxHighlighter key={index}>
                            {value.trim()}
                          </SyntaxHighlighter>
                        )
                      )
                  ) : (
                    <h1 className="emojimessage">{message}</h1>
                  )}
                </div>
                {longmessage && !fullyopened ? "..." : ""}
                {!longmessage || fullyopened ? (
                  <MessageFaviconOrVideoRenderer
                    links={links}
                    mine={messages[i].from === user.id}
                  ></MessageFaviconOrVideoRenderer>
                ) : (
                  <></>
                )}
                {longmessage ? (
                  <p
                    onClick={() => setfullyopened(!fullyopened)}
                    style={{
                      color:
                        messages[i].from === user.id ? "lightgray" : "gray",
                      fontSize: "12px",
                    }}
                  >
                    show {fullyopened ? "less" : "more"}
                  </p>
                ) : (
                  <></>
                )}
                {messages[i].edited ? (
                  <p
                    style={{
                      color:
                        messages[i].from === user.id ? "lightgray" : "gray",
                      fontSize: "10px",
                      float: "right",
                    }}
                  >
                    edited
                  </p>
                ) : (
                  <></>
                )}
              </>
            )
          ) : file ? (
            <div>
              {mimetype ? (
                mimetype.split("/")[0] === "image" ? (
                  <img
                    alt={file}
                    src={`/files/${file}?size=615`}
                    style={{
                      maxWidth: "100%",
                      maxHeight: "300px",
                      borderRadius: "20px",
                    }}
                    loading="lazy"
                    onLoad={() => {
                      if (toscroll.current) {
                        scrolltobottom();
                      }
                    }}
                    onClick={() => {
                      window.open(
                        `/drive/${file}`,
                        file,
                        "width=600,height=400"
                      );
                    }}
                  ></img>
                ) : mimetype.split("/")[0] === "video" ? (
                  <video
                    src={`/files/${file}`}
                    style={{ width: "100%", maxHeight: "300px" }}
                    controls
                    playsInline
                    onLoad={() => {
                      if (toscroll.current) {
                        scrolltobottom();
                      }
                    }}
                  ></video>
                ) : mimetype.split("/")[0] === "audio" ? (
                  <audio
                    src={`/files/${file}`}
                    style={{ maxHeight: "300px" }}
                    controls
                    playsInline
                    onLoad={() => {
                      if (toscroll.current) {
                        scrolltobottom();
                      }
                    }}
                  ></audio>
                ) : (
                  <div
                    onClick={() => {
                      window.open(
                        `/drive/${file}`,
                        file,
                        "width=600,height=400"
                      );
                    }}
                    style={{
                      color: "var(--secondary-text-colour)",
                      cursor: "pointer",
                    }}
                  >
                    <FontAwesomeIcon icon={faFile}></FontAwesomeIcon> File
                    (click to open in new window/tab)
                  </div>
                )
              ) : (
                <div
                  onClick={() => {
                    window.open(`/files/${file}`, file, "width=600,height=400");
                  }}
                  style={{
                    color: "var(--secondary-text-colour)",
                    cursor: "pointer",
                  }}
                >
                  <FontAwesomeIcon icon={faFile}></FontAwesomeIcon> File
                </div>
              )}
            </div>
          ) : (
            <></>
          )}
        </div>
      </ContextMenuTrigger>

      <ContextMenu
        id={String(messages[i].ID ? messages[i].ID : messages[i].tempid)}
      >
        <p style={{ textAlign: "center" }}>
          {new Date(messages[i].time).toLocaleString()}
        </p>
        <MenuItem
          onClick={() => {
            navigator.clipboard.writeText(
              message
                ? message
                : `${window.location.protocol}://${
                    !process.env.NODE_ENV ||
                    process.env.NODE_ENV === "development"
                      ? window.location.hostname + ":5000"
                      : window.location.host
                  }/files/${file}`
            );
          }}
        >
          <span>
            <FontAwesomeIcon icon={faCopy} /> Copy
          </span>
        </MenuItem>
        {(messages[i].from === user.id && messages[i].ID) ||
        (user.admin && messages[i].ID) ? (
          <>
            <MenuItem
              onClick={() => {
                sendJsonMessage({ type: "delete", id: messages[i].ID });
                deleteFromID(messages[i].ID);
              }}
            >
              <span>
                <FontAwesomeIcon icon={faTrash} /> Delete
              </span>
            </MenuItem>
            {message ? (
              <MenuItem
                onClick={() => {
                  setediting(!editing);
                }}
              >
                <span>
                  {editing ? (
                    <>
                      <FontAwesomeIcon icon={faTimes} /> Cancel Edit
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faPencilAlt} /> Edit
                    </>
                  )}
                </span>
              </MenuItem>
            ) : (
              <></>
            )}
          </>
        ) : (
          <></>
        )}
        {longmessage ? (
          <MenuItem
            onClick={() => {
              setfullyopened(!fullyopened);
            }}
          >
            <span>
              <FontAwesomeIcon
                icon={fullyopened ? faMinusCircle : faPlusCircle}
              />{" "}
              Show {fullyopened ? "less" : "more"}
            </span>
          </MenuItem>
        ) : (
          <></>
        )}
      </ContextMenu>
    </>
  ) : (
    <>
      <div
        style={{
          opacity: !messages[i].ID ? 0.5 : undefined,
          textAlign: "center",
        }}
        className={`message message-${
          messages[i].from === user.id ? "mine" : "yours"
        } ${
          messages[i - 1]?.from == messages[i].from &&
          messages[i - 1] &&
          messages[i].time - messages[i - 1].time < 300000
            ? `mid-${messages[i].from === user.id ? "mine" : "yours"}`
            : ""
        }
              ${
                !messages[i - 1] ||
                messages[i].time - messages[i - 1].time > 300000
                  ? `first-${messages[i].from === user.id ? "mine" : "yours"}`
                  : ""
              }  
              ${
                !messages[i + 1] ||
                messages[i + 1].from !== messages[i].from ||
                (messages[i + 1] &&
                  messages[i + 1].time - messages[i].time > 300000)
                  ? `last-${messages[i].from === user.id ? "mine" : "yours"}`
                  : ""
              }`}
      >
        <h1>GIFT</h1>
        <div
          style={{
            width: "100%",
            height: "1px",
            backgroundColor:
              messages[i].from === user.id
                ? "var(--light-bg-colour)"
                : "#dadada",
            marginBottom: "1rem",
          }}
        ></div>
        <h4>Here is a gift of {messages[i].amount} Rocket Fuel</h4>
        {message ? <p data-private>Message: {message.trim()}</p> : <></>}
        <img
          src={GiftIcon}
          alt="🎁"
          style={{
            padding: "1rem",
            margin: "1rem 0",
            backgroundColor:
              messages[i].from === user.id
                ? "var(--light-bg-colour)"
                : "#dadada",
            borderRadius: "10px",
            display: "block",
            width: "100%",
            cursor: messages[i].from === user.id ? "not-allowed" : "pointer",
          }}
          onClick={
            messages[i].from !== user.id
              ? () => history.push("/blast")
              : undefined
          }
        ></img>
        <b>Click the present to check your Rocket Fuel Balance!</b>
      </div>
    </>
  );
}

function MessageMaker({
  messages,
  typingdata,
  scrollref,
  toscroll,
  canloadmore,
  loadingmore,
  loadmore,
  chatUpdateID,
  scrolltobottom,
  deleteFromID,
  editFromID,
  sendJsonMessage,
  bottomMargin,
}: {
  messages: Array<messageWithText | messageWithFile | giftMessage>;
  typingdata: {
    [key: string]: {
      typing: Boolean;
      length: Number;
      specialchars: { [key: number]: any };
    };
  };
  scrollref: React.RefObject<any>;
  toscroll: any;
  canloadmore: boolean;
  loadingmore: boolean;
  loadmore: Function;
  chatUpdateID: number | null;
  scrolltobottom: Function;
  deleteFromID: Function;
  editFromID: Function;
  sendJsonMessage: Function;
  bottomMargin: number;
}) {
  const { user } = useData();
  const { users } = useContext(usersContext);
  const [output, setoutput] = useState<JSX.Element[]>([]);
  useEffect(() => {
    (async () => {
      console.time("chatrender");
      const output = [];
      let lastmessage: messageWithText | messageWithFile | giftMessage | null =
        null;
      let topIndex = 0;
      for (let i = 0; i < messages.length; i++) {
        if (
          (!lastmessage && !canloadmore) ||
          (lastmessage && messages[i].time - lastmessage.time > 300000)
        ) {
          output.push(
            <p
              key={messages[i].time}
              style={{
                margin: "0",
                color: `lightgray`,
                fontSize: "10px",
                textAlign: "center",
              }}
            >
              {new Date(messages[i].time).toLocaleString()}
            </p>
          );
        }
        if (
          (!lastmessage || messages[i].from !== lastmessage.from) &&
          (messages[i].from === user.id || users[messages[i].from])
        ) {
          output.push(
            <div
              data-private
              key={topIndex}
              style={{
                alignSelf:
                  messages[i].from === user.id ? "flex-end" : "flex-start",
              }}
            >
              {messages[i].from === user.id ? (
                <span style={{ marginRight: "5px" }}>{user.username}</span>
              ) : (
                <></>
              )}
              <img
                src={`/files/${
                  messages[i].from === user.id
                    ? user.profilePic
                    : users[messages[i].from].profilePic
                }?size=25`}
                style={{
                  width: "25px",
                  height: "25px",
                  margin: "3px",
                  borderRadius: "50%",
                }}
                alt=""
              />
              {users[messages[i].from] ? (
                <span style={{ marginLeft: "5px" }}>
                  {users[messages[i].from].username}
                </span>
              ) : (
                <></>
              )}
            </div>
          );
          topIndex++;
        }
        output.push(
          <Message
            key={messages[i].ID ? messages[i].ID : messages[i].tempid}
            messages={messages}
            deleteFromID={deleteFromID}
            i={i}
            user={user}
            toscroll={toscroll}
            scrolltobottom={scrolltobottom}
            sendJsonMessage={sendJsonMessage}
            editFromID={editFromID}
          ></Message>
        );
        lastmessage = messages[i];
      }
      console.timeEnd("chatrender");
      setoutput(output);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, canloadmore, loadingmore, chatUpdateID]);
  const { id: chattingto } = useParams<{ id: string }>();
  const location = useLocation();
  const faketext = useMemo(() => {
    const output: { [key: string]: string } = {};
    for (const key in typingdata) {
      const typing = typingdata[key];
      const faketext = [];
      for (let i = 0; i <= typing.length; i++) {
        faketext.push(
          typing.specialchars && i - 1 in typing.specialchars
            ? typing.specialchars[i - 1]
            : numToSSColumn(random(i) * 26)
        );
      }
      output[key] = faketext.join("").toLowerCase();
    }
    return output;
  }, [typingdata]);
  window.onscroll = () => {
    if (location.pathname === `/chat/${chattingto}`) {
      toscroll.current =
        document.documentElement.scrollHeight -
          document.documentElement.scrollTop -
          document.documentElement.clientHeight <=
        200;
      if (canloadmore) {
        if (document.documentElement.scrollTop < 10) {
          loadmore(messages);
        }
      }
    }
  };
  return (
    <div
      style={{
        width: "100%",
        height: `100%`,
        overflow: "overlay",
      }}
      ref={scrollref}
    >
      <div
        className="chat"
        style={{
          margin: `90px auto ${bottomMargin + 12}px auto`,
          maxWidth: "900px",
        }}
      >
        {messages.length > 0 ? (
          <>
            {canloadmore && loadingmore ? (
              <Loader key={"loader"}></Loader>
            ) : (
              <></>
            )}
            {output}
          </>
        ) : (
          <p style={{ color: "gray", textAlign: "center" }}>
            this chat is empty... say hi!
          </p>
        )}
        {Object.keys(typingdata).map((key) =>
          typingdata[key].typing ? (
            <React.Fragment key={key}>
              <div
                data-private
                style={{
                  alignSelf: "flex-start",
                }}
              >
                <img
                  src={`/files/${users[key]?.profilePic}?size=25`}
                  style={{
                    width: "25px",
                    height: "25px",
                    margin: "3px",
                    borderRadius: "50%",
                  }}
                  alt=""
                />
                <span style={{ marginLeft: "5px" }}>
                  {users[key]?.username}
                </span>
              </div>
              <div
                className="message message-yours last-yours"
                style={{
                  opacity: 0.5,
                  textShadow: "0 0 7px black",
                  color: "transparent",
                }}
              >
                {faketext[key]}
              </div>
            </React.Fragment>
          ) : (
            <React.Fragment key={key} />
          )
        )}
      </div>
    </div>
  );
}

function NoInternet() {
  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        textAlign: "center",
        color: "gray",
      }}
    >
      <div style={{ fontSize: "50px" }}>
        <FontAwesomeIcon icon={faExclamation} />
        <FontAwesomeIcon icon={faCloud} />
      </div>
      <h1>No Internet Connection!</h1>
      <p>This will disappear once you have an internet connection.</p>
    </div>
  );
}

function ChatNotFound() {
  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        textAlign: "center",
        color: "gray",
      }}
    >
      <div style={{ fontSize: "50px" }}>
        <FontAwesomeIcon icon={faSadCry} />
        <FontAwesomeIcon icon={faCommentSlash} />
      </div>
      <h1>No Chat Found!</h1>
      <p>
        go to{" "}
        <span>
          <Link
            to="/contacts"
            style={{ color: "var(--secondary-text-colour)" }}
          >
            contacts
          </Link>
          !
        </span>
      </p>
    </div>
  );
}

function ChatPage() {
  const bypassChars: string[] = [
    ...emoji,
    " ",
    "?",
    "!",
    "#",
    "$",
    "£",
    "*",
    '"',
    "'",
    "(",
    ")",
    ":",
    ";",
    "[",
    "]",
    "{",
    "}",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "0",
  ];
  const [chats, setchats] = useState<
    Array<messageWithText | messageWithFile | giftMessage>
  >([]);
  const isVisable = useWindowVisable();
  const isFocussed = useWindowFocus();
  const history = useHistory();
  const { id: chattingto } = useParams<{ id: string }>();
  const { notifications, user, NotificationAPI } = useData();
  const [isGroupChat, setisGroupChat] = useState(false);
  const [usersdata, setusersdata] = useState<
    undefined | { exists: boolean; users: { [key: string]: any } }
  >();
  const [groupchatdata, setgroupchatdata] = useState<
    | {
        picture: string;
        name: string;
      }
    | undefined
  >();
  const [oldmetypingdata, setoldmetypingdata] = useState({
    type: "typing",
    typing: false,
    length: 0,
    specialchars: {},
  });
  const [metypingdata, setmetypingdata] = useState({
    type: "typing",
    typing: false,
    length: 0,
    specialchars: {},
  });
  const [socketUrl] = useState(
    `ws${window.location.protocol === "https:" ? "s" : ""}://${
      !process.env.NODE_ENV || process.env.NODE_ENV === "development"
        ? window.location.hostname + ":5000"
        : window.location.host
    }/chat`
  );
  const size = useWindowSize();
  const [typingdata, settypingdata] = useState<{
    [key: string]: {
      typing: Boolean;
      length: Number;
      specialchars: { [key: number]: any };
    };
  }>({});
  const [isonline, setisonline] = useState("0");
  const metypinglengthref = useRef<number>(0);
  const metypingref = useRef<any>(false);
  const typingTimer = useRef<any>(null);
  const inputref = useRef<any>(null);
  const scrollerref = useRef<any>(null);
  const bottomref = useRef<any>(null);
  const toscroll = useRef(true);
  const [loadingchatmessages, setloadingchatmessages] = useState(true);
  const [canloadmore, setcanloadmore] = useState(true);
  const [loadingmore, setloadingmore] = useState(false);
  const isLoadMore = useRef<boolean>(false);
  const [chatUpdateID, setChatUpdateID] = useState<number | null>(null);
  const [personaltyping] = useLocalStorage("Keyboard Typing Sound", true);
  const [Recipienttyping] = useLocalStorage("Recipient Typing Sound", true);
  const [SendSound] = useLocalStorage("Send Sound", true);
  const [ReceiveSound] = useLocalStorage("Receive Sound", true);
  const [localchats, setlocalchats] = useLocalStorage<{
    [key: string]: Array<messageWithText | messageWithFile | giftMessage>;
  }>("chats", {});
  const [textareaHeight, settextareaHeight] = useState<number>(36);
  const [giftmodel, setgiftmodel] = useState(false);
  async function sendFile(file: any) {
    const id = Math.random();
    notifications.addNotification({
      title: "File",
      message: "Uploading...",
      type: "warning",
      insert: "top",
      id,
      container: "top-right",
      animationIn: ["animate__animated", "animate__fadeIn"],
      animationOut: ["animate__animated", "animate__fadeOut"],
    });
    try {
      const formdata = new FormData();
      formdata.append("file", file);
      const resp = await (
        await fetch("/api/uploadfile", {
          method: "POST",
          body: formdata,
        })
      ).json();
      if (resp.resp) {
        notifications.removeNotification(id);
        const time = new Date().getTime();
        const tempid = Math.random();
        sendJsonMessage({
          type: "file",
          file: resp.id,
          mimetype: file.type,
          tempid,
        });
        setchats((chats) =>
          chats.concat({
            gift: undefined,
            amount: undefined,
            from: user.id,
            message: undefined,
            mimetype: file.type,
            file: resp.id,
            time,
            tempid,
            edited: false,
          })
        );
        notifications.removeNotification(id);
      } else {
        notifications.removeNotification(id);
        notifications.addNotification({
          title: "Upload Error",
          message: resp.err,
          type: "danger",
          insert: "top",
          container: "top-right",
          animationIn: ["animate__animated", "animate__fadeIn"],
          animationOut: ["animate__animated", "animate__fadeOut"],
        });
      }
    } catch (e) {
      notifications.removeNotification(id);
      notifications.addNotification({
        title: "Upload Error",
        message: String(e),
        type: "danger",
        insert: "top",
        container: "top-right",
        animationIn: ["animate__animated", "animate__fadeIn"],
        animationOut: ["animate__animated", "animate__fadeOut"],
      });
    }
  }
  useEffect(() => {
    ReactGA.event({
      category: "chat",
      action: "open chat",
      label: `open to ${chattingto}`,
    });
    localStorage.setItem("chattingto", JSON.stringify(chattingto));
    const listenerfunction = function (event: any) {
      const items = (event.clipboardData || event.originalEvent.clipboardData)
        .items;
      for (const index in items) {
        const item = items[index];
        if (item.kind === "file") {
          const blob = item.getAsFile();
          console.log(blob);
          sendFile(blob);
        }
      }
    };
    window.addEventListener("paste", listenerfunction);
    return () => {
      window.removeEventListener("paste", listenerfunction);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (usersdata) {
      document.title = `${
        isGroupChat
          ? groupchatdata?.name || "Group Chat"
          : usersdata.users[chattingto]?.username
      } - TypeChat`;
    }
    return () => {
      document.title = "TypeChat";
    };
  }, [chattingto, usersdata]);
  const [oldmessagsize, setoldmessagesize] = useState(chats.length > 0);
  const [noChat, setnoChat] = useState(false);
  const messagesize = chats.length > 0;
  useEffect(() => {
    if (messagesize !== oldmessagsize) {
      scrolltobottom();
      setoldmessagesize(messagesize);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messagesize]);
  const doneTypingInterval = 5000;
  const StartMessagesLength = Math.ceil(size.height / 40 + 5);
  function doneTyping() {
    if (metypingref.current) {
      metypingref.current = false;
      setmetypingdata({
        type: "typing",
        typing: false,
        length: 0,
        specialchars: {},
      });
    }
  }
  function deleteFromID(id: string) {
    for (let i = 0; i <= chats.length; i++) {
      if (chats[i].ID === id) {
        chats.splice(i, 1);
        setchats(chats);
        setChatUpdateID(Math.random());
        break;
      }
    }
  }
  function editFromID(id: string, message: string) {
    for (let i = 0; i <= chats.length; i++) {
      if (chats[i].ID === id) {
        chats[i].message = message;
        chats[i].edited = true;
        setchats(chats);
        setChatUpdateID(Math.random());
        break;
      }
    }
  }
  const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(
    socketUrl,
    {
      shouldReconnect: () => true,
      reconnectInterval: 1,
    }
  );
  const scrolltobottom = () => {
    const scrollingElement = document.scrollingElement || document.body;
    if (window.innerHeight + window.scrollY < document.body.offsetHeight) {
      scrollingElement.scrollTo(0, scrollingElement.scrollHeight);
    }
  };
  const fileref = useRef<HTMLInputElement>(null);
  const submitref = useRef<any>(null);
  const formref = useRef<any>(null);
  const shiftkey = useRef(false);
  const key = useRef(null);
  const [chattext] = useState(
    JSON.parse(localStorage.getItem("chattext") || "{}")
  );
  useEffect(() => {
    if (lastJsonMessage) {
      if (lastJsonMessage.type === "message") {
        if (lastJsonMessage.message.from !== user.id && ReceiveSound) {
          playSound("/sounds/newmessage.mp3");
        }
        setchats((chats) => chats.concat(lastJsonMessage.message));

        settypingdata((typingdata) => {
          return {
            ...typingdata,
            [lastJsonMessage.message.from]: {
              length: 0,
              specialchars: {},
              typing: false,
            },
          };
        });
        if (usersdata) {
          let notify = true;
          if (toscroll.current) {
            setcanloadmore(true);
            isLoadMore.current = false;
            setloadingchatmessages(false);
            setchats((chats) =>
              chats.slice(Math.max(chats.length - StartMessagesLength, 0))
            );
            setTimeout(scrolltobottom, 0);
            notify = !isFocussed;
          }
          if (notify && lastJsonMessage.message.from !== user.id) {
            NotificationAPI(
              {
                title: `${
                  usersdata.users[lastJsonMessage.message.from].username
                }`,
                message: lastJsonMessage.message.message
                  ? truncate(lastJsonMessage.message.message, 25)
                  : "file",
                type: "default",
                onRemoval: (_: number, type: string) => {
                  if (type === "click") {
                    history.push(`/chat/${chattingto}`);
                    scrolltobottom();
                  }
                },
                insert: "top",
                container: "top-right",
                animationIn: ["animate__animated", "animate__fadeIn"],
                animationOut: ["animate__animated", "animate__fadeOut"],
                dismiss: {
                  pauseOnHover: true,
                  duration: 5000,
                  onScreen: true,
                },
              },
              () => {
                history.push(`/chat/${chattingto}`);
                scrolltobottom();
              }
            );
          }
        }
      } else if (lastJsonMessage.type === "online") {
        if (!lastJsonMessage.online && (isonline === "M" || isonline === "1")) {
          playSound("/sounds/leave.mp3");
        } else if (lastJsonMessage.online && isonline === "0") {
          playSound("/sounds/join.mp3");
        }
        setisonline(
          lastJsonMessage.online ? (lastJsonMessage.mobile ? "M" : "1") : "0"
        );
      } else if (lastJsonMessage.type === "nchat") {
        setnoChat(true);
      } else if (lastJsonMessage.type === "gift") {
        if (lastJsonMessage.message.from !== user.id && ReceiveSound) {
          playSound("/sounds/gift.mp3");
        }
        lastJsonMessage.message.gift = true;
        setchats((chats) => chats.concat(lastJsonMessage.message));

        settypingdata((typingdata) => {
          return {
            ...typingdata,
            [lastJsonMessage.message.from]: {
              length: 0,
              specialchars: {},
              typing: false,
            },
          };
        });
        if (usersdata) {
          if (toscroll.current) {
            setcanloadmore(true);
            isLoadMore.current = false;
            setloadingchatmessages(false);
            setchats((chats) =>
              chats.slice(Math.max(chats.length - StartMessagesLength, 0))
            );
            setTimeout(scrolltobottom, 0);
            if (
              lastJsonMessage.message.from !== user.id &&
              !isVisable &&
              isElectron()
            ) {
              notify(
                `${usersdata.users[lastJsonMessage.message.from].username}`,
                lastJsonMessage.message.message,
                () => {
                  history.push(`/chat/${chattingto}`);
                  scrolltobottom();
                }
              );
            }
          } else if (lastJsonMessage.message.from !== user.id) {
            NotificationAPI(
              {
                title: `${
                  usersdata.users[lastJsonMessage.message.from].username
                }`,
                message: lastJsonMessage.message.message
                  ? truncate(lastJsonMessage.message.message, 25)
                  : "file",
                type: "default",
                onRemoval: (_: number, type: string) => {
                  if (type === "click") {
                    history.push(`/chat/${chattingto}`);
                    scrolltobottom();
                  }
                },
                insert: "top",
                container: "top-right",
                animationIn: ["animate__animated", "animate__fadeIn"],
                animationOut: ["animate__animated", "animate__fadeOut"],
                dismiss: {
                  pauseOnHover: true,
                  duration: 5000,
                  onScreen: true,
                },
              },
              () => {
                history.push(`/chat/${chattingto}`);
                scrolltobottom();
              }
            );
          }
        }
      } else if (lastJsonMessage.type === "delete") {
        if (lastJsonMessage.from !== user.id && ReceiveSound) {
          playSound("/sounds/delete.mp3");
        }
        deleteFromID(lastJsonMessage.id);
      } else if (lastJsonMessage.type === "edit") {
        if (lastJsonMessage.from !== user.id && ReceiveSound) {
          playSound("/sounds/edit.mp3");
        }
        editFromID(lastJsonMessage.id, lastJsonMessage.message);
      } else if (lastJsonMessage.type === "start") {
        setcanloadmore(false);
        isLoadMore.current = true;
        setloadingchatmessages(true);
        sendJsonMessage({
          type: "start",
          to: chattingto,
          limit: StartMessagesLength,
          mobile: isMobileDevice(),
        });
      } else if (lastJsonMessage.type === "ping") {
        sendJsonMessage({ type: "pong" });
      } else if (lastJsonMessage.type === "sent") {
        for (const message of chats) {
          if (message.tempid === lastJsonMessage.tempid) {
            delete message.tempid;
            message.ID = lastJsonMessage.id;
          }
        }
        setChatUpdateID(Math.random());
        setchats(chats);
      } else if (lastJsonMessage.type === "init") {
        if (lastJsonMessage.isGroupChat) {
          setchats(lastJsonMessage.messages);
          setgroupchatdata(lastJsonMessage.groupChatData);
          setisGroupChat(true);
        } else {
          setchats(lastJsonMessage.messages);
          setisonline(
            lastJsonMessage.online ? (lastJsonMessage.mobile ? "M" : "1") : "0"
          );
          setisGroupChat(false);
        }
        setusersdata({ exists: true, users: lastJsonMessage.users });
        setcanloadmore(true);
        isLoadMore.current = false;
        setloadingchatmessages(false);
      } else if (lastJsonMessage.type === "typing") {
        if (Recipienttyping) {
          if (
            !typingdata[lastJsonMessage.by] ||
            lastJsonMessage.length > typingdata[lastJsonMessage.by].length
          ) {
            playSound(`/sounds/click${Math.floor(Math.random() * 3 + 1)}.mp3`);
          } else if (
            !typingdata[lastJsonMessage.by] ||
            lastJsonMessage.length < typingdata[lastJsonMessage.by].length
          ) {
            playSound(`/sounds/click3.mp3`);
          }
        }
        if (toscroll.current) {
          setTimeout(scrolltobottom, 0);
        }
        settypingdata({
          ...typingdata,
          [lastJsonMessage.by]: {
            typing: lastJsonMessage.typing,
            length: lastJsonMessage.length,
            specialchars: lastJsonMessage.specialchars,
          },
        });
      } else if (lastJsonMessage.type === "setmessages") {
        setchats(lastJsonMessage.messages);
        setusersdata({ exists: true, users: lastJsonMessage.users });
        setcanloadmore(true);
        isLoadMore.current = false;
        setloadingchatmessages(false);
      } else if (lastJsonMessage.type === "prependmessages") {
        setchats([...lastJsonMessage.messages, ...chats]);
        if (lastJsonMessage.messages.length > 0) {
          const lastheight = document.documentElement.offsetHeight;
          setTimeout(() => {
            document.documentElement.scrollTop =
              document.documentElement.scrollHeight - lastheight;
            isLoadMore.current = false;

            setloadingmore(false);
          }, 0);
        }
        setcanloadmore(lastJsonMessage.messages.length > 0);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastJsonMessage]);
  useEffect(() => {
    if (isMobileDevice()) {
      sendJsonMessage({ type: "setFocus", focus: isVisable });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisable]);
  useEffect(() => {
    if (JSON.stringify(oldmetypingdata) !== JSON.stringify(metypingdata)) {
      sendJsonMessage(metypingdata);
      setoldmetypingdata(metypingdata);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metypingdata]);
  useEffect(() => {
    setTimeout(scrolltobottom, 0);
  }, [usersdata, readyState]);
  useEffect(() => {
    if (toscroll.current) {
      setTimeout(scrolltobottom, 0);
    }
    if (!loadingchatmessages) {
      localchats[chattingto] = chats.slice(
        Math.max(chats.length - StartMessagesLength, 0)
      );
      setlocalchats(localchats);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chats, chatUpdateID]);
  useEffect(() => {
    if (usersdata && !usersdata.exists) {
      setloadingchatmessages(false);
    }
  }, [usersdata]);
  const loadmore = () => {
    if (!isLoadMore.current) {
      isLoadMore.current = true;
      setloadingmore(true);
      sendJsonMessage({
        type: "getmessages",
        start: chats.length,
        max: 50,
      });
    }
  };
  if (noChat) return <ChatNotFound></ChatNotFound>;
  if (
    (!usersdata ||
      !groupchatdata ||
      (readyState !== ReadyState.OPEN &&
        readyState !== ReadyState.UNINSTANTIATED) ||
      loadingchatmessages) &&
    !localchats[chattingto]
  ) {
    return <Loader />;
  } else if (!localchats[chattingto] || (usersdata && !usersdata.exists)) {
    return <ChatNotFound></ChatNotFound>;
  }
  return (
    <usersContext.Provider
      value={usersdata ? usersdata : { exists: false, users: {} }}
    >
      <div
        style={{
          position: "fixed",
          width: "100%",
          height: "90px",
          padding: "10px",
          zIndex: 10,
          background: "linear-gradient(0deg, transparent, var(--dark-mode))",
        }}
      >
        {(groupchatdata || usersdata) && readyState === ReadyState.OPEN ? (
          <>
            {" "}
            <img
              src={
                "/files/" +
                (groupchatdata
                  ? groupchatdata?.picture
                  : usersdata?.users[chattingto]?.profilePic) +
                "?size=45"
              }
              data-private
              style={{
                display: "block",
                margin: "auto",
                borderRadius: "100%",
                aspectRatio: "1/1",
                width: "45px",
                height: "45px",
              }}
              alt={
                groupchatdata
                  ? groupchatdata?.picture
                  : usersdata?.users[chattingto]?.profilePic
              }
            />
            <p style={{ textAlign: "center" }} data-private>
              {!groupchatdata ? (
                <>
                  {usersdata?.users[chattingto]?.username}{" "}
                  <FontAwesomeIcon
                    style={{
                      color:
                        isonline === "0" ? "var(--offline)" : "var(--online)",
                    }}
                    icon={
                      isonline === "1"
                        ? faDesktop
                        : isonline === "M"
                        ? faMobileAlt
                        : faEyeSlash
                    }
                  ></FontAwesomeIcon>
                  <div data-private>
                    <Badge
                      badges={usersdata?.users[chattingto]?.badges}
                      size="20px"
                    ></Badge>
                  </div>
                </>
              ) : (
                <>
                  {groupchatdata.name}{" "}
                  <FontAwesomeIcon
                    style={{
                      color:
                        isonline === "0" ? "var(--offline)" : "var(--online)",
                    }}
                    icon={faUsers}
                  ></FontAwesomeIcon>
                </>
              )}
            </p>
          </>
        ) : (
          <p style={{ margin: "1rem", textAlign: "center" }}>
            {ReadyState[readyState]}
          </p>
        )}
      </div>
      <KeyboardEventHandler
        handleKeys={["alphanumeric", "space", "shift", "cap"]}
        onKeyEvent={() => {
          key.current = null;
          inputref.current.focus();
        }}
      />
      <MessageMaker
        deleteFromID={deleteFromID}
        editFromID={editFromID}
        scrolltobottom={scrolltobottom}
        scrollref={scrollerref}
        messages={loadingchatmessages ? localchats[chattingto] : chats}
        typingdata={typingdata}
        toscroll={toscroll}
        canloadmore={canloadmore && readyState === ReadyState.OPEN}
        loadingmore={loadingmore}
        loadmore={loadmore}
        chatUpdateID={chatUpdateID}
        sendJsonMessage={sendJsonMessage}
        bottomMargin={textareaHeight}
      />
      <div ref={bottomref}></div>
      <div
        style={{
          position: "fixed",
          padding: "1rem",
          width: "100%",
          bottom: "0px",
          background: "linear-gradient(180deg, transparent, var(--dark-mode))",
          display: "flex",
        }}
      >
        <div
          style={{
            margin: "auto",
            width: "100%",
            maxWidth: "800px",
            display: "flex",
            alignItems: "flex-end",
          }}
        >
          <input
            type="file"
            style={{ display: "none" }}
            ref={fileref}
            onInput={async (e: any) => {
              if (e.target.files.length > 0) {
                const file = e.target.files[0];
                e.target.value = "";
                sendFile(file);
              }
            }}
          />

          <button
            style={{
              width: "45px",
              height: "36px",
              marginRight: "5px",
              backgroundColor: "var(--dark-bg-colour)",
              padding: "5px",
              borderRadius: "20px",
              border: "solid 1px var(--light-bg-colour)",
              color: "white",
              textAlign: "center",
            }}
            onClick={() => {
              if (fileref.current) fileref.current.click();
            }}
          >
            <FontAwesomeIcon icon={faPlus} />
          </button>
          <ReactModal
            isOpen={giftmodel}
            style={{
              overlay: {
                backgroundColor: "rgb(18 18 18 / 50%)",
                zIndex: 10,
              },
              content: {
                backgroundColor: "var(--dark-mode)",
                border: "1px solid var(--dark-bg-colour)",
                borderRadius: "10px",
                padding: "1rem",
                zIndex: 11,
                top: "50%",
                left: "50%",
                right: "auto",
                bottom: "auto",
                marginRight: "-50%",
                transform: "translate(-50%, -50%)",
                width: "75%",
                maxWidth: "750px",
                textAlign: "center",
                maxHeight: "500px",
              },
            }}
            onRequestClose={() => setgiftmodel(false)}
          >
            <FontAwesomeIcon
              icon={faTimes}
              onClick={() => setgiftmodel(false)}
              style={{
                cursor: "pointer",
                fontSize: "30px",
                float: "right",
              }}
            />
            <h1>Gift Rocket Fuel</h1>
            <div
              style={{
                height: "1px",
                width: "100%",
                background: "var(--dark-bg-colour)",
                margin: "0 0 1rem 0",
              }}
            />
            <form
              onSubmit={(e: any) => {
                e.preventDefault();
                ReactGA.event({
                  category: "chat",
                  action: "sent gift",
                  label: `send gift to ${chattingto}`,
                });
                console.log(e);
                const message = e.target[1].value.trim();
                const tempid = Math.random();
                const time = new Date().getTime();
                sendJsonMessage({
                  type: "gift",
                  amount: e.target[0].value,
                  message: message,
                  tempid,
                });
                setchats(
                  chats
                    .slice(Math.max(chats.length - StartMessagesLength, 0))
                    .concat({
                      from: user.id,
                      gift: true,
                      amount: e.target[0].value,
                      file: undefined,
                      mimetype: undefined,
                      message: message,
                      time,
                      tempid,
                      edited: false,
                    })
                );
                setgiftmodel(false);
              }}
            >
              <div
                style={{
                  display: "grid",
                  alignItems: "center",
                  justifyContent: "center",
                  alignContent: "space-evenly",
                  marginBottom: "1rem",
                }}
              >
                <label htmlFor="RF">
                  How much Rocket Fuel do you want to gift? (max{" "}
                  {user.rocketFuel})
                </label>
                <input
                  id="RF"
                  type="number"
                  min={"1"}
                  max={user.rocketFuel}
                  defaultValue="1"
                  onBlur={(e: any) => {
                    e.target.value = Math.floor(
                      e.target.value > user.rocketFuel
                        ? user.rocketFuel
                        : e.target.value < 1
                        ? 1
                        : e.target.value
                    );
                  }}
                ></input>
              </div>

              <TextareaAutosize
                data-private
                onInput={(e: any) => {
                  const message = e.target.value.trim();
                  const messagetoarray: string[] = Array.from(message);
                  const maxlength = 3000 + 250 * (user.blast ? user.blast : 0);
                  if (
                    messagetoarray.length <= maxlength &&
                    !(key.current === 13 && !shiftkey.current)
                  ) {
                    if (personaltyping) {
                      playSound(
                        `/sounds/click${Math.floor(Math.random() * 3 + 1)}.mp3`
                      );
                    }
                    metypinglengthref.current = messagetoarray.length;
                    if (metypinglengthref.current > 0) {
                      metypingref.current = true;
                      const specialchars: { [key: string]: any } = {};
                      for (let i = 0; i < messagetoarray.length; i++) {
                        if (bypassChars.includes(messagetoarray[i])) {
                          specialchars[i] = messagetoarray[i];
                        }
                      }
                      setmetypingdata({
                        type: "typing",
                        typing: metypingref.current,
                        length: metypinglengthref.current,
                        specialchars,
                      });
                      clearTimeout(typingTimer.current);
                      typingTimer.current = setTimeout(
                        doneTyping,
                        doneTypingInterval
                      );
                    } else {
                      metypingref.current = false;
                      setmetypingdata({
                        type: "typing",
                        typing: false,
                        length: 0,
                        specialchars: {},
                      });
                    }
                  } else {
                    e.target.value = Array.from(e.target.value)
                      .slice(0, maxlength)
                      .join("");
                  }
                }}
                onKeyDown={(e: any) => {
                  key.current = e.keyCode;
                  shiftkey.current = e.shiftKey;
                  clearTimeout(typingTimer.current);
                }}
                autoFocus
                style={{
                  backgroundColor: "var(--dark-bg-colour)",
                  padding: "5px",
                  borderRadius: "20px",
                  width: "calc(100% - 65px)",
                  border: "solid 1px var(--light-bg-colour)",
                  color: "white",
                  resize: "none",
                }}
                maxRows={10}
                placeholder="Add A Message..."
              />
              <button
                className="btnMain"
                onPointerDown={() => {
                  playSound("/sounds/click2.mp3");
                }}
                onPointerUp={() => {
                  playSound("/sounds/click1.mp3");
                }}
                style={{
                  border: "none",
                  background: "transparent",
                  padding: "0",
                }}
              >
                <div className="btnBox">
                  GIFT{" "}
                  <img src={GiftIcon} height="30px" alt="🎁" className="icon" />
                </div>
                <div className="btnBottom"></div>
              </button>
            </form>
          </ReactModal>
          {!isGroupChat ? (
            <button
              style={{
                width: "45px",
                height: "36px",
                marginRight: "5px",
                backgroundColor: "var(--dark-bg-colour)",
                padding: "5px",
                borderRadius: "20px",
                border: "solid 1px var(--light-bg-colour)",
                color: "white",
                textAlign: "center",
                opacity:
                  usersdata && usersdata.users[chattingto]?.id !== "TypeChat"
                    ? 1
                    : 0.5,
              }}
              disabled={
                !(usersdata && usersdata.users[chattingto]?.id !== "TypeChat")
              }
              onClick={
                usersdata && usersdata.users[chattingto]?.id !== "TypeChat"
                  ? () => {
                      if (user.rocketFuel > 0) {
                        setgiftmodel(true);
                      } else {
                        history.push("/blast");
                      }
                    }
                  : undefined
              }
            >
              <FontAwesomeIcon icon={faGift} />
            </button>
          ) : (
            <></>
          )}
          <form
            onSubmit={(e: any) => {
              e.preventDefault();
              const message = e.target[0].value.trim();
              if (message !== "") {
                e.target[0].value = "";
                const time = new Date().getTime();
                if (SendSound) {
                  playSound("/sounds/send.mp3");
                }
                const tempid = Math.random();
                sendJsonMessage({
                  type: "message",
                  message,
                  tempid,
                });
                setcanloadmore(true);
                isLoadMore.current = false;
                setloadingchatmessages(false);
                setchats(
                  chats
                    .concat({
                      gift: undefined,
                      amount: undefined,
                      from: user.id,
                      file: undefined,
                      mimetype: undefined,
                      message,
                      time,
                      tempid,
                      edited: false,
                    })
                    .slice(
                      toscroll.current
                        ? Math.max(chats.length - StartMessagesLength, 0)
                        : 0
                    )
                );
                if (toscroll.current) setTimeout(scrolltobottom, 0);
                metypingref.current = false;
                setmetypingdata({
                  type: "typing",
                  typing: metypingref.current,
                  length: 0,
                  specialchars: {},
                });
              }
            }}
            ref={formref}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "flex-end",
            }}
          >
            <TextareaAutosize
              data-private
              defaultValue={chattext[chattingto]}
              ref={inputref}
              onHeightChange={(height) => {
                settextareaHeight(height);
                setTimeout(
                  () =>
                    (document.documentElement.scrollTop +=
                      height - textareaHeight),
                  0
                );
              }}
              onInput={(e: any) => {
                if (key.current === 13 && !shiftkey.current) {
                  submitref.current.click();
                  inputref.current.value = "";
                }
                const message = e.target.value.trim();
                const messagetoarray: string[] = Array.from(message);
                const maxlength = 3000 + 1000 * (user.blast ? user.blast : 0);
                if (
                  messagetoarray.length <= maxlength &&
                  !(key.current === 13 && !shiftkey.current)
                ) {
                  if (personaltyping) {
                    playSound(
                      `/sounds/click${Math.floor(Math.random() * 3 + 1)}.mp3`
                    );
                  }
                  metypinglengthref.current = messagetoarray.length;
                  if (metypinglengthref.current > 0) {
                    metypingref.current = true;
                    const specialchars: { [key: string]: any } = {};
                    for (let i = 0; i < messagetoarray.length; i++) {
                      if (bypassChars.includes(messagetoarray[i])) {
                        specialchars[i] = messagetoarray[i];
                      }
                    }
                    setmetypingdata({
                      type: "typing",
                      typing: metypingref.current,
                      length: metypinglengthref.current,
                      specialchars,
                    });
                    clearTimeout(typingTimer.current);
                    typingTimer.current = setTimeout(
                      doneTyping,
                      doneTypingInterval
                    );
                  } else {
                    metypingref.current = false;
                    setmetypingdata({
                      type: "typing",
                      typing: false,
                      length: 0,
                      specialchars: {},
                    });
                  }
                } else {
                  e.target.value = Array.from(e.target.value)
                    .slice(0, maxlength)
                    .join("");
                }
                const chattext: Record<string, string> = JSON.parse(
                  localStorage.getItem("chattext")||"{}"
                );
                chattext[chattingto] = e.target.value;
                localStorage.setItem("chattext", JSON.stringify(chattext));
              }}
              onKeyDown={(e: any) => {
                key.current = e.keyCode;
                shiftkey.current = e.shiftKey;
                clearTimeout(typingTimer.current);
              }}
              autoFocus
              style={{
                backgroundColor: "var(--dark-bg-colour)",
                padding: "5px",
                borderRadius: "20px",
                width: "calc(100% - 65px)",
                border: "solid 1px var(--light-bg-colour)",
                color: "white",
                resize: "none",
              }}
              maxRows={10}
              placeholder="Type Something..."
            />
            <button
              ref={submitref}
              style={{
                width: "60px",
                height: "36px",
                marginLeft: "5px",
                backgroundColor: "var(--dark-bg-colour)",
                padding: "5px",
                borderRadius: "20px",
                border: "solid 1px var(--light-bg-colour)",
                color: "white",
                textAlign: "center",
              }}
              type="submit"
              onClick={() => {
                inputref.current.focus();
                ReactGA.event({
                  category: "chat",
                  action: "send message",
                  label: `send message to ${chattingto}`,
                });
              }}
            >
              <FontAwesomeIcon icon={faPaperPlane} />
            </button>
          </form>
        </div>
      </div>
    </usersContext.Provider>
  );
}

function Chat({ chattingto }: { chattingto: string }) {
  const { loggedin, user } = useData();
  const time = useMemo(() => new Date().getTime(), []);

  const IsOnline = useIsOnline();
  if (!loggedin) {
    return (
      <Redirect
        to={"/login?" + new URLSearchParams({ to: "/chat/" + chattingto })}
      ></Redirect>
    );
  } else if (!IsOnline) {
    return <NoInternet></NoInternet>;
  } else if (chattingto && chattingto !== user.id) {
    return (
      <chatSettings.Provider value={{ time }}>
        <ChatPage />
      </chatSettings.Provider>
    );
  }
  return <ChatNotFound></ChatNotFound>;
}

export default Chat;
