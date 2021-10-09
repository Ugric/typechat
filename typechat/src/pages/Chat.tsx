import {
  faCommentSlash,
  faCopy,
  faDesktop,
  faEyeSlash,
  faFile,
  faMobileAlt,
  faPaperPlane,
  faPencilAlt,
  faPlus,
  faSadCry,
  faTimes,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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
import useWindowFocus from "use-window-focus";
import useWindowSize from "../hooks/usescreensize";
import isElectron from "is-electron";
import notify from "../notifier";
import Linkify from "react-linkify";
import ReactPlayer from "react-player/lazy";
import useApi from "../hooks/useapi";
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";

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
  message: string;
  file: undefined;
  mimetype: undefined;
}
interface messageWithFile extends messageTypes {
  file: string;
  message: undefined;
  mimetype: string;
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

function MetaPage({url, decoratedText, decoratedHref, mine}: {url: string, decoratedText: string, decoratedHref: string, mine: boolean}) {
  const urldata = new URL(decoratedHref);
  const {data} = useApi<{
    'url': string,
    'canonical': string,
    'title': string,
    'image': string,
    'author': string,
    'description': string,
    'keywords': string,
    'source': string,
    'price': string,
    'priceCurrency': string,
    'availability': string,
    'robots': string,
    'og:url': string,
    'og:locale': string,
    'og:locale:alternate': string,
    'og:title': string,
    'og:type': string,
    'og:description': string,
    'og:determiner': string,
    'og:site_name': string,
    'og:image': string,
    'og:image:secure_url': string,
    'og:image:type': string,
    'og:image:width': string,
    'og:image:height': string,
    'twitter:title': string,
    'twitter:image': string,
    'twitter:image:alt': string,
    'twitter:card': string,
    'twitter:site': string,
    'twitter:site:id': string,
    'twitter:account_id': string,
    'twitter:creator': string,
    'twitter:creator:id': string,
    'twitter:player': string,
    'twitter:player:width': string,
    'twitter:player:height': string,
    'twitter:player:stream': string,
    'jsonld': {}
}>("/api/getmetadata?"+new URLSearchParams({url}))
  return data? <div
  style={{
    padding: "1rem",
    border: `solid 1px ${
      mine ? "var(--main-bg-colour)" : "#d0d0d0"
    }`,
    backgroundColor: mine ? "var(--main-bg-colour)" : "#dadada",
    borderRadius: "10px",
    maxWidth: "350px",
    margin: "auto",
  }}
><a
      href={decoratedHref}
      target="blank" style={{
          fontSize: "24px"}}><img
        alt={urldata.hostname}
        style={{
          marginRight: "5px",
          aspectRatio: "1/1",
          height: "100%",
          minHeight: "24px",
        }}
        src={`https://www.google.com/s2/favicons?${new URLSearchParams(
          { size: "24", domain: urldata.hostname }
        )}`}
      />{data.title?data.title:decoratedText}</a><p>{data.description}</p>{data.image.length>0?<img src={new URL(data.image, url).href} style={{width: "100%", borderRadius: "10px"}}></img>:<></>}</div> :<div
  style={{
    padding: "1rem",
    border: `solid 1px ${
      mine ? "var(--main-bg-colour)" : "#d0d0d0"
    }`,
    backgroundColor: mine ? "var(--main-bg-colour)" : "#dadada",
    borderRadius: "10px",
    margin: "5px",
  }}
><a
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
        src={`https://www.google.com/s2/favicons?${new URLSearchParams(
          { size: "24", domain: urldata.hostname }
        )}`}
      />
      <p style={{ maxWidth: "90%" }}>{decoratedText}</p>
    </a></div>
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
  return <>{links.map(
        ({
          decoratedHref,
          decoratedText,
          key,
        }: {
          decoratedHref: string;
          decoratedText: string;
          key: number;
        }) => {
          const url = new URL(decoratedHref);
          return <React.Fragment key={key}>{(
              videoSites.includes(url.hostname) ? (
                <ReactPlayer
                  url={decoratedHref}
                  width="100%"
                  height="100%"
                  controls={true}
                  style={{ aspectRatio: "16/9" }}
                />
              ) : (
                <MetaPage url={decoratedHref} decoratedText={decoratedText} decoratedHref={decoratedHref} mine={mine}></MetaPage>
              )
          )}</React.Fragment>;
        }
      )}</>
}

function Message({messages, i, toscroll, scrolltobottom, user, sendJsonMessage, deleteFromID, editFromID}: {
  messages: Array<messageWithText | messageWithFile>;
  i: number;
  toscroll: any;
  user: any;
  scrolltobottom: Function;
  deleteFromID: Function;
  editFromID: Function;
  sendJsonMessage: Function;
  }) {
  const message = messages[i].message;
  const [editing, setediting] = useState(false)
  const file = messages[i].file;
  const mimetype = messages[i].mimetype;
  const onlyemojis = message? Array.from(message).length > 3 || !onlyContainsEmojis(message): false
  const links: {
    decoratedHref: string;
    decoratedText: string;
    key: number;
  }[] = [];
  const donekeys: number[] = [];
  const shiftkey = useRef(false);
  const key = useRef(null);
  const submitref = useRef<any>();
  const messageref = useRef(message)
  return <>
  <ContextMenuTrigger id={String(messages[i].ID ? messages[i].ID : messages[i].tempid)}>
    <div style={{ opacity: !messages[i].ID ? 0.5 : undefined }} className={onlyemojis || file?`message message-${messages[i].from === user.id ? "mine" : "yours"} ${!messages[i+1] || messages[i+1].from !== messages[i].from?`last-${messages[i].from === user.id ? "mine" : "yours"}`: ""}`: `emojimessage-${messages[i].from === user.id ? "mine" : "yours"}`}>
    {message ? (editing?<><form onSubmit={(e: any)=>{
     e.preventDefault()
     setediting(false)
     const tempmessage = messageref.current
     if (tempmessage === "") {
      sendJsonMessage({type: "delete", id: messages[i].ID})
      deleteFromID(messages[i].ID)
     } else if (message !== tempmessage) {
      sendJsonMessage({type: "edit", id: messages[i].ID, message: tempmessage})
      editFromID(messages[i].ID, tempmessage)
    }
   }}><TextareaAutosize
                  onInput={(e: any) => {
                    if (key.current === 13 && !shiftkey.current) {
                      submitref.current.click();
                    }else {
                    const message = e.target.value.trim();
                    messageref.current = message
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
                    width: "100%"
                  }}
                  maxRows={10}
                  placeholder="Type Something..."
                  defaultValue={message}
                /><input type="submit" ref={submitref} style={{display: "none"}}></input></form></>:
     <>
       {onlyemojis ? (
         message.split("```").map((value: string, index: number) =>
           index % 2 === 0 ? (
             <div key={index}>
               <Linkify
                 componentDecorator={(
                   decoratedHref,
                   decoratedText,
                   key
                 ) => {
                   if (!donekeys.includes(key)) {
                     links.push({ decoratedHref, decoratedText, key });
                     donekeys.push(key);
                   }
                   return (
                     <a target="blank" href={decoratedHref} key={key}>
                       {decoratedText}
                     </a>
                   );
                 }}
               >
                 {value.trim()}
               </Linkify>
             </div>
           ) : (
             <SyntaxHighlighter key={index}>
               {value.trim()}
             </SyntaxHighlighter>
           )
         )
       ) : (
         <h1 className="emojimessage">{message}</h1>
       )}
       <MessageFaviconOrVideoRenderer
         links={links}
         mine={messages[i].from === user.id}
       ></MessageFaviconOrVideoRenderer>{messages[i].edited?<p style={{color: messages[i].from === user.id?"lightgray":"gray", fontSize: "10px", float: "right"}}>edited</p>:<></>}
     </>
   ) : file ? (
     <div
     >
       {mimetype ? (
         mimetype.split("/")[0] === "image" ? (
           <img
             alt={file}
             src={`/files/${file}`}
             style={{ maxWidth: "100%", maxHeight: "300px", borderRadius: "20px" }}
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
</div></ContextMenuTrigger>

<ContextMenu id={String(messages[i].ID ? messages[i].ID : messages[i].tempid)}>
   <p style={{textAlign: "center"}}>{new Date(messages[i].time).toLocaleString()}</p>
 <MenuItem onClick={()=>{navigator.clipboard.writeText(message?message:`${window.location.protocol}://${!process.env.NODE_ENV || process.env.NODE_ENV === "development"
? window.location.hostname + ":5000"
: window.location.host
}/files/${file}`);}}>
   <span><FontAwesomeIcon icon={faCopy}/> Copy</span>
 </MenuItem>
 {messages[i].from === user.id && messages[i].ID?<>
 <MenuItem onClick={()=>{
   sendJsonMessage({type: "delete", id: messages[i].ID})
   deleteFromID(messages[i].ID)
 }}>
   <span><FontAwesomeIcon icon={faTrash}/> Delete</span>
 </MenuItem>
 {message?
 <MenuItem onClick={()=>{
   setediting(!editing)
 }}>
   <span>{editing?<><FontAwesomeIcon icon={faTimes}/> Cancel Edit</>:<><FontAwesomeIcon icon={faPencilAlt}/> Edit</>}</span>
 </MenuItem>:<></>}</>
 :<></>}
</ContextMenu></>
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
  sendJsonMessage
}: {
  messages: Array<messageWithText | messageWithFile>;
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
    let lastmessage: messageWithText | messageWithFile |null = null
    for (let i = 0; i < messages.length; i++) {
      if (lastmessage && messages[i].from !== lastmessage.from && messages[i].time-lastmessage.time>300000) {
        output.push(<p
        key={lastmessage.time}
                style={{
                  margin: "0",
                  color: `lightgray`,
                  fontSize: "10px",
                  textAlign: "center",
                }}
              >
                {new Date(lastmessage.time).toLocaleString()}
              </p>)
      }
      if (!lastmessage || messages[i].from !== lastmessage.from) {
        output.push(messages[i].from === user.id || users[messages[i].from] ? (
          <div key={messages[i].ID+"topname"} style={{alignSelf: messages[i].from === user.id?"flex-end":"flex-start"}}>
            {messages[i].from === user.id ? (
              <span style={{ marginRight: "5px" }}>{user.username}</span>
            ) : (
              <></>
            )}
            <img
              src={`/files/${messages[i].from === user.id
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
        ))
      }
      output.push(
        <Message key={messages[i].ID ? messages[i].ID : messages[i].tempid} messages={messages} deleteFromID={deleteFromID} i={i} user={user} toscroll={toscroll} scrolltobottom={scrolltobottom} sendJsonMessage={sendJsonMessage} editFromID={editFromID}></Message>)
      lastmessage = messages[i]
    }
    console.timeEnd("chatrender")
    return output
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
         {(canloadmore && loadingmore)?<Loader key={"loader"}></Loader>: <></>}
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
  const [chats, setchats] = useState<Array<messageWithText | messageWithFile>>(
    []
  );
  const isFocussed = useWindowFocus();
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
    `ws${window.location.protocol === "https:" ? "s" : ""}://${!process.env.NODE_ENV || process.env.NODE_ENV === "development"
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
    [key: string]: Array<messageWithText | messageWithFile>;
  }>("chats", {});
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
        setchats(chats =>
          chats.concat({
            from: user.id,
            message: undefined,
            mimetype: file.type,
            file: resp.id,
            time,
            tempid,
            edited: false
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
          animationIn: [
            "animate__animated",
            "animate__fadeIn",
          ],
          animationOut: [
            "animate__animated",
            "animate__fadeOut",
          ],
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
        animationOut: [
          "animate__animated",
          "animate__fadeOut",
        ],
      });
    }
  }
  useEffect(() => {
    localStorage.setItem("chattingto", JSON.stringify(chattingto));
    const listenerfunction = function (event: any) {
      const items = (event.clipboardData || event.originalEvent.clipboardData).items;
      for (const index in items) {
        const item = items[index];
        if (item.kind === 'file') {
          const blob = item.getAsFile();
          console.log(blob)
          sendFile(blob)
        }
      }
    }
    window.addEventListener("paste", listenerfunction);
    return () => { window.removeEventListener("paste", listenerfunction); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
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
    for (let i=0; i<=chats.length; i++) {
      if (chats[i].ID == id) {
        chats.splice(i, 1)
        setchats(chats)
        setChatUpdateID(Math.random())
        break
      }
    }
  }
  function editFromID(id: string, message: string) {
    for (let i=0; i<=chats.length; i++) {
      if (chats[i].ID == id) {
        chats[i].message = message
        chats[i].edited = true
        setchats(chats)
        setChatUpdateID(Math.random())
        break
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
        setchats(
          chats=>chats.concat(lastJsonMessage.message));

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
            setchats(
              chats=>
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
              NotificationAPI({
                title: `${usersdata.users[lastJsonMessage.message.from].username
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
              }, ()=>{
                history.push(`/chat/${chattingto}`);
                scrolltobottom();
              });
          }
        }
      } else if (lastJsonMessage.type === "delete") {
        if (lastJsonMessage.from !== user.id && ReceiveSound) {
          playSound("/sounds/delete.mp3")
        }
        deleteFromID(lastJsonMessage.id)
      } else if (lastJsonMessage.type === "edit") {
        if (lastJsonMessage.from !== user.id && ReceiveSound) {
          playSound("/sounds/edit.mp3")
        }
        editFromID(lastJsonMessage.id, lastJsonMessage.message)
      } else if (lastJsonMessage.type === "start") {
        setcanloadmore(false);
        isLoadMore.current = true;
        setloadingchatmessages(true);
        sendJsonMessage({
          type: "start",
          to: chattingto,
          limit: StartMessagesLength,
          mobile:
            /Android|webOS|iPhone|iPad|Mac|Macintosh|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
              navigator.userAgent
            ),
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
    if (
      /Android|webOS|iPhone|iPad|Mac|Macintosh|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
    ) {
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
                  style={{
                    display: "block",
                    height: "65%",
                    margin: "auto",
                    borderRadius: "100%",
                  }}
                  alt={usersdata.users[chattingto].username}
                />
                <p style={{ textAlign: "center" }}>
                  {usersdata.users[chattingto].username}{" "}
                  <FontAwesomeIcon
                    style={{
                      color: isonline === "0" ? "var(--offline)" : "var(--online)",
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
                    e.target.value = ""
                    sendFile(file)
                  }
                }}
              />

              <button
                style={{
                  width: "37px",
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
                          from: user.id,
                          file: undefined,
                          mimetype: undefined,
                          message,
                          time,
                          tempid,
                          edited: false
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
                  ref={inputref}
                  onInput={(e: any) => {
                    if (key.current === 13 && !shiftkey.current) {
                      submitref.current.click();
                      inputref.current.value = "";
                    }
                    const message = e.target.value.trim();
                    const messagetoarray: string[] = Array.from(message);
                    if (
                      messagetoarray.length <= 3000 &&
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
                        .slice(0, 3000)
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

function Chat({ isGroupChat }: { isGroupChat: boolean }) {
  const { loggedin, user } = useData();
  const { id: chattingto } = useParams<{ id: string }>();
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
