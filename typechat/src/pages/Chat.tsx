/* eslint-disable no-useless-escape */
import {
  faCommentSlash,
  faCopy,
  faDesktop,
  faEyeSlash,
  faFile,
  faGift,
  faMobileAlt,
  faPaperPlane,
  faPencilAlt,
  faPlus,
  faSadCry,
  faTimes,
  faTrash,
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

function isMobileDevice() {
  var check = false;
  (function (a) {
    if (
      /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
        a
      ) ||
      /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
        a.substr(0, 4)
      )
    )
      check = true;
  })(navigator.userAgent || navigator.vendor || (window as any).opera);
  return check;
}

const chatSettings = createContext({ isGroupChat: false, time: 0 });
const usersContext = createContext<{
  exists: boolean;
  users: { [key: string]: any };
}>({ exists: false, users: {} });

function onlyContainsEmojis(str: string) {
  const ranges = emoji.join("|");

  const removeEmoji = (str: string) =>
    str.replace(new RegExp("[" + ranges + "]", "g"), "");

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
                <p>
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
                </p>
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
                    src={`/files/${file}`}
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
                    style={{ width: "100%", maxHeight: "300px" }}
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
                        `/files/${file}`,
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
        {messages[i].from === user.id && messages[i].ID ? (
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
          !messages[i + 1] ||
          messages[i + 1].from !== messages[i].from ||
          (messages[i + 1] && messages[i + 1].time - messages[i].time > 300000)
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
}: {
  messages: Array<messageWithText | messageWithFile | giftMessage>;
  typingdata: {
    typing: Boolean;
    length: Number;
    specialchars: { [key: number]: any };
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
}) {
  const { user } = useData();
  const { users } = useContext(usersContext);
  const output = useMemo(() => {
    console.time("chatrender");
    const output = [];
    let lastmessage: messageWithText | messageWithFile | giftMessage | null =
      null;
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
      if (!lastmessage || messages[i].from !== lastmessage.from) {
        output.push(
          messages[i].from === user.id || users[messages[i].from] ? (
            <div
              data-private
              key={messages[i].ID + "topname"}
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
                }`}
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
          ) : (
            <></>
          )
        );
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
    return output;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, canloadmore, loadingmore, chatUpdateID]);
  const { id: chattingto } = useParams<{ id: string }>();
  const location = useLocation();
  const faketext = useMemo(() => {
    let output = [];
    for (let i = 0; i <= typingdata.length; i++) {
      output.push(
        typingdata.specialchars && i - 1 in typingdata.specialchars
          ? typingdata.specialchars[i - 1]
          : numToSSColumn(random(i) * 26)
      );
    }
    return output.join("").toLowerCase();
  }, [typingdata]);
  // const [isMessageMenuOpen, setIsMessageMenuOpen] = useState(false);
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
          margin: `90px auto 3rem auto`,
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
        {typingdata.typing ? (
          <div
            className="message message-yours last-yours"
            style={{
              opacity: 0.5,
              textShadow: "0 0 7px black",
              color: "transparent",
            }}
          >
            {faketext}
          </div>
        ) : (
          <></>
        )}
      </div>
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
  const isFocussed = useWindowVisable();
  const history = useHistory();
  const { id: chattingto } = useParams<{ id: string }>();
  const { notifications, user, NotificationAPI } = useData();

  const { isGroupChat } = useContext(chatSettings);
  const [usersdata, setusersdata] = useState<
    undefined | { exists: boolean; users: { [key: string]: any } }
  >();
  const [groupchatdata /*setgroupchatdata*/] = useState({
    picture: "",
    name: "",
  });
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
    typing: Boolean;
    length: Number;
    specialchars: { [key: number]: any };
  }>({ typing: false, length: 0, specialchars: {} });
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
      document.title = `${usersdata.users[chattingto].username} - TypeChat`;
    }
    return () => {
      document.title = "TypeChat";
    };
  }, [chattingto, usersdata]);
  const [oldmessagsize, setoldmessagesize] = useState(chats.length > 0);
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

  useEffect(() => {
    if (lastJsonMessage) {
      if (lastJsonMessage.type === "message") {
        if (lastJsonMessage.message.from !== user.id && ReceiveSound) {
          playSound("/sounds/newmessage.mp3");
        }
        setchats((chats) => chats.concat(lastJsonMessage.message));

        settypingdata({
          typing: false,
          length: 0,
          specialchars: {},
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
              !isFocussed &&
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
      } else if (lastJsonMessage.type === "gift") {
        if (lastJsonMessage.message.from !== user.id && ReceiveSound) {
          playSound("/sounds/gift.mp3");
        }
        lastJsonMessage.message.gift = true;
        setchats((chats) => chats.concat(lastJsonMessage.message));

        settypingdata({
          typing: false,
          length: 0,
          specialchars: {},
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
              !isFocussed &&
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
      } else if (lastJsonMessage.type === "online") {
        if (!lastJsonMessage.online && (isonline === "M" || isonline === "1")) {
          playSound("/sounds/leave.mp3");
        } else if (lastJsonMessage.online && isonline === "0") {
          playSound("/sounds/join.mp3");
        }
        setisonline(
          lastJsonMessage.online ? (lastJsonMessage.mobile ? "M" : "1") : "0"
        );
      } else if (lastJsonMessage.type === "typing") {
        if (Recipienttyping) {
          if (lastJsonMessage.length > typingdata.length) {
            playSound(`/sounds/click${Math.floor(Math.random() * 3 + 1)}.mp3`);
          } else if (lastJsonMessage.length < typingdata.length) {
            playSound(`/sounds/click3.mp3`);
          }
        }
        if (toscroll.current) {
          setTimeout(scrolltobottom, 0);
        }
        settypingdata({
          typing: lastJsonMessage.typing,
          length: lastJsonMessage.length,
          specialchars: lastJsonMessage.specialchars,
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
      sendJsonMessage({ type: "setFocus", focus: isFocussed });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFocussed]);
  useEffect(() => {
    if (JSON.stringify(oldmetypingdata) !== JSON.stringify(metypingdata)) {
      sendJsonMessage(metypingdata);
      setoldmetypingdata(metypingdata);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metypingdata]);
  window.onload = () => setTimeout(scrolltobottom, 0);
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
  if (
    (!usersdata ||
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
      <div>
        <div>
          <div
            style={{
              position: "fixed",
              width: "100%",
              height: "90px",
              padding: "10px",
              zIndex: 10,
              background:
                "linear-gradient(0deg, transparent, var(--dark-mode))",
            }}
          >
            {usersdata && readyState === ReadyState.OPEN ? (
              <>
                {" "}
                <img
                  src={
                    "/files/" +
                    String(
                      isGroupChat
                        ? groupchatdata.picture
                        : usersdata.users[chattingto].profilePic
                    )
                  }
                  data-private
                  style={{
                    display: "block",
                    height: "65%",
                    margin: "auto",
                    borderRadius: "100%",
                    aspectRatio: "1/1",
                  }}
                  alt={usersdata.users[chattingto].username}
                />
                <p style={{ textAlign: "center" }} data-private>
                  {usersdata.users[chattingto].username}{" "}
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
                </p>
                <div data-private>
                  <Badge
                    badges={usersdata.users[chattingto].badges}
                    size="20px"
                  ></Badge>
                </div>
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
          />
          <div ref={bottomref}></div>
          <div
            style={{
              position: "fixed",
              padding: "1rem",
              width: "100%",
              bottom: "0px",
              background:
                "linear-gradient(180deg, transparent, var(--dark-mode))",
              display: "flex",
            }}
          >
            <div
              style={{
                margin: "auto",
                width: "100%",
                maxWidth: "800px",
                display: "flex",
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
                    data-private="lipsum"
                    onInput={(e: any) => {
                      const message = e.target.value.trim();
                      const messagetoarray: string[] = Array.from(message);
                      const maxlength =
                        3000 + 250 * (user.blast ? user.blast : 0);
                      if (
                        messagetoarray.length <= maxlength &&
                        !(key.current === 13 && !shiftkey.current)
                      ) {
                        if (personaltyping) {
                          playSound(
                            `/sounds/click${Math.floor(
                              Math.random() * 3 + 1
                            )}.mp3`
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
                      <img
                        src={GiftIcon}
                        height="30px"
                        alt="🎁"
                        className="icon"
                      />
                    </div>
                    <div className="btnBottom"></div>
                  </button>
                </form>
              </ReactModal>
              <button
                style={{
                  width: "45px",
                  marginRight: "5px",
                  backgroundColor: "var(--dark-bg-colour)",
                  padding: "5px",
                  borderRadius: "20px",
                  border: "solid 1px var(--light-bg-colour)",
                  color: "white",
                  textAlign: "center",
                  opacity:
                    usersdata && usersdata.users[chattingto].id !== "TypeChat"
                      ? 1
                      : 0.5,
                }}
                disabled={
                  !(usersdata && usersdata.users[chattingto].id !== "TypeChat")
                }
                onClick={
                  usersdata && usersdata.users[chattingto].id !== "TypeChat"
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
                        .slice(Math.max(chats.length - StartMessagesLength, 0))
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
                    );
                    setTimeout(scrolltobottom, 0);
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
                }}
              >
                <TextareaAutosize
                  data-private="lipsum"
                  ref={inputref}
                  onInput={(e: any) => {
                    if (key.current === 13 && !shiftkey.current) {
                      submitref.current.click();
                      inputref.current.value = "";
                    }
                    const message = e.target.value.trim();
                    const messagetoarray: string[] = Array.from(message);
                    const maxlength =
                      3000 + 1000 * (user.blast ? user.blast : 0);
                    if (
                      messagetoarray.length <= maxlength &&
                      !(key.current === 13 && !shiftkey.current)
                    ) {
                      if (personaltyping) {
                        playSound(
                          `/sounds/click${Math.floor(
                            Math.random() * 3 + 1
                          )}.mp3`
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
                  placeholder="Type Something..."
                />
                <button
                  ref={submitref}
                  style={{
                    width: "60px",
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
        </div>
      </div>
    </usersContext.Provider>
  );
}

function Chat({
  isGroupChat,
  chattingto,
}: {
  isGroupChat: boolean;
  chattingto: string;
}) {
  const { loggedin, user } = useData();
  const time = useMemo(() => new Date().getTime(), []);
  if (!loggedin) {
    return <Redirect to="/"></Redirect>;
  } else if (chattingto && chattingto !== user.id) {
    return (
      <chatSettings.Provider value={{ isGroupChat, time }}>
        <ChatPage />
      </chatSettings.Provider>
    );
  }
  return <ChatNotFound></ChatNotFound>;
}

export default Chat;
