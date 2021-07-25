import {
  faCommentSlash,
  faFile,
  faPaperPlane,
  faPlus,
  faSadCry,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useRef, useState } from "react";
import { Link, Redirect, useHistory, useParams } from "react-router-dom";
import "./css/message.css";
import { useData } from "../hooks/datahook";
import useApi from "../hooks/useapi";
import LoadError from "./error";
import Loader from "./loader";
import useWebSocket, { ReadyState } from "react-use-websocket";
import KeyboardEventHandler from "react-keyboard-event-handler";
import TextareaAutosize from "react-textarea-autosize";
import SyntaxHighlighter from "react-syntax-highlighter";
import playSound from "../playsound";

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
  time: number;
  mine: boolean;
}

interface messageWithText extends messageTypes {
  message: string;
  file: undefined;
}
interface messageWithFile extends messageTypes {
  file: string;
  message: undefined;
}

function MessageMaker({
  messages,
  typingdata,
  scrollref,
  toscroll,
}: {
  messages: Array<messageWithText | messageWithFile>;
  typingdata: {
    typing: Boolean;
    length: Number;
    specialchars: { [key: number]: any };
  };
  scrollref: React.RefObject<any>;
  toscroll: any;
}) {
  const [output, setoutput] = useState(<></>);
  const [faketext, setfaketext] = useState("");
  useEffect(() => {
    const output = [];
    let tempmessages: Array<any> = [];
    let lastmessagegrouptime;
    for (let i = 0; i < messages.length; i++) {
      const message = messages[i].message;
      const file = messages[i].file;
      tempmessages.push(
        <div className="message" key={i}>
          {message ? (
            message
              .split("```")
              .map((value, index) =>
                index % 2 === 0 ? (
                  <div key={index}>{value.trim()}</div>
                ) : (
                  <SyntaxHighlighter>{value.trim()}</SyntaxHighlighter>
                )
              )
          ) : (
            <div>
              <div
                onClick={() => {
                  window.open(
                    `http://${window.location.hostname}:5050/files/${file}`,
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
            </div>
          )}
        </div>
      );
      if (!messages[i + 1] || messages[i + 1].mine !== messages[i].mine) {
        output.push(
          <div className="messagegroup" key={i}>
            {lastmessagegrouptime &&
            messages[i].time - lastmessagegrouptime > 300000 ? (
              <p
                style={{
                  margin: "0",
                  color: `lightgray`,
                  fontSize: "10px",
                  textAlign: "center",
                }}
              >
                {new Date(lastmessagegrouptime).toLocaleString()}
              </p>
            ) : (
              <></>
            )}
            <div
              className={`${messages[i].mine ? "mine" : "yours"} messages`}
              key={i}
            >
              {tempmessages}
            </div>
            {!messages[i + 1] ? (
              <p
                style={{
                  margin: "0",
                  color: `lightgray`,
                  fontSize: "10px",
                  textAlign: "center",
                }}
              >
                {new Date(messages[i].time).toLocaleString()}
              </p>
            ) : (
              <></>
            )}
          </div>
        );
        lastmessagegrouptime = messages[i].time;
        tempmessages = [];
      }
    }
    setoutput(<>{output}</>);
  }, [messages]);
  useEffect(() => {
    let output = [];
    for (let i = 0; i <= Number(typingdata.length); i++) {
      output.push(
        typingdata.specialchars && i - 1 in typingdata.specialchars
          ? typingdata.specialchars[i - 1]
          : numToSSColumn(random(i) * 26)
      );
    }
    setfaketext(output.join("").toLowerCase());
  }, [typingdata]);
  useEffect(() => {
    document.body.onscroll = (e: any) => {
      toscroll.current =
        document.documentElement.scrollHeight -
          document.documentElement.scrollTop -
          document.documentElement.clientHeight <=
        200;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
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
        style={{ margin: "90px auto 3rem auto", maxWidth: "900px" }}
      >
        {messages.length > 0 ? (
          output
        ) : (
          <p style={{ color: "gray", textAlign: "center" }}>
            this chat is empty... say hi!
          </p>
        )}
        {typingdata.typing ? (
          <div className={`yours messages`}>
            <div
              className="message"
              style={{
                opacity: 0.5,
                textShadow: "0 0 7px black",
                color: "transparent",
              }}
            >
              {faketext}
            </div>
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
  const history = useHistory();
  const { id: chattingto } = useParams<{ id: string }>();
  const { setchattingto, notifications } = useData();
  const { error, loading, data } = useApi(
    "/api/userdatafromid?" + new URLSearchParams({ id: chattingto }).toString()
  );
  const [metypingdata, setmetypingdata] = useState({
    type: "typing",
    typing: false,
    length: 0,
    specialchars: {},
  });
  const [socketUrl] = useState(`ws://${window.location.hostname}:5050/chat`);
  const [typingdata, settypingdata] = useState<{
    typing: Boolean;
    length: Number;
    specialchars: { [key: number]: any };
  }>({ typing: false, length: 0, specialchars: {} });
  const metypinglengthref = useRef<number>(0);
  const metypingref = useRef<any>(false);
  const typingTimer = useRef<any>(null);
  const inputref = useRef<any>(null);
  const scrollerref = useRef<any>(null);
  const bottomref = useRef<any>(null);
  const toscroll = useRef(true);
  const [loadingchatmessages, setloadingchatmessages] = useState(true);
  useEffect(() => {
    setchattingto(chattingto);
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
  const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(
    socketUrl,
    {
      shouldReconnect: () => true,
      onOpen() {
        sendJsonMessage({ type: "start", to: chattingto });
      },
    }
  );
  const scrolltobottom = () => {
    const scrollingElement = document.scrollingElement || document.body;
    scrollingElement.scrollTop = scrollingElement.scrollHeight;
  };
  const fileref = useRef<any>(null);

  useEffect(() => {
    if (lastJsonMessage) {
      if (lastJsonMessage.type === "message") {
        if (!lastJsonMessage.mine) {
          playSound("/sounds/newmessage.mp3");
        }
        setchats((c) => c.concat(lastJsonMessage.message));

        settypingdata({
          typing: false,
          length: 0,
          specialchars: {},
        });
        if (toscroll.current) {
          setTimeout(scrolltobottom, 0);
        } else {
          notifications.addNotification({
            title: `${data.username}`,
            message: truncate(lastJsonMessage.message.message, 25),
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
          });
        }
      } else if (lastJsonMessage.type === "typing") {
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
        setloadingchatmessages(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastJsonMessage]);
  useEffect(() => {
    sendJsonMessage(metypingdata);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metypingdata]);
  window.onload = () => setTimeout(scrolltobottom, 0);
  useEffect(() => {
    setTimeout(scrolltobottom, 0);
  }, [loading, data, readyState]);
  useEffect(() => {
    if (toscroll.current) {
      setTimeout(scrolltobottom, 0);
    }
  }, [chats]);
  if (
    error ||
    loading ||
    readyState !== ReadyState.OPEN ||
    loadingchatmessages
  ) {
    return error ? <LoadError error={String(error)} /> : <Loader />;
  } else if (!data.exists) {
    return <ChatNotFound></ChatNotFound>;
  }
  return (
    <div>
      <div>
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
          <img
            src={"/files/" + String(data.profilePic)}
            style={{
              display: "block",
              height: "65%",
              margin: "auto",
              borderRadius: "100%",
            }}
            alt={data.username}
          />
          <p style={{ textAlign: "center" }}>{data.username}</p>
        </div>
        <KeyboardEventHandler
          handleKeys={["alphanumeric", "space", "shift", "cap"]}
          onKeyEvent={() => {
            inputref.current.focus();
          }}
        />
        <MessageMaker
          scrollref={scrollerref}
          messages={chats}
          typingdata={typingdata}
          toscroll={toscroll}
        />
        <div
          ref={bottomref}
          onLoad={() => {
            console.log("Hello");
          }}
        ></div>
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
                if (e.target.files) {
                  const file = e.target.files[0];
                  if (file.size <= 10000000) {
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
                        sendJsonMessage({
                          type: "file",
                          file: resp.id,
                        });
                        setchats(
                          chats.concat({
                            mine: true,
                            message: undefined,
                            file: resp.id,
                            time,
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
                        animationOut: ["animate__animated", "animate__fadeOut"],
                      });
                    }
                  } else {
                    console.log("hello");
                    notifications.addNotification({
                      title: "File too big!",
                      message: "file needs to be less the 10MB!",
                      type: "danger",
                      insert: "top",
                      container: "top-right",
                      animationIn: ["animate__animated", "animate__fadeIn"],
                      animationOut: ["animate__animated", "animate__fadeOut"],
                    });
                  }
                }
              }}
            />
            ​
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
                fileref.current.click();
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
                  sendJsonMessage({
                    type: "message",
                    message,
                  });
                  setchats(
                    chats.concat({ mine: true, file: undefined, message, time })
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
              style={{
                width: "100%",
                display: "flex",
              }}
            >
              <TextareaAutosize
                ref={inputref}
                onInput={(e: any) => {
                  const message = e.target.value.trim();
                  if (message.length <= 2000) {
                    metypinglengthref.current = message.length;
                    if (metypinglengthref.current > 0) {
                      metypingref.current = true;
                      const specialchars: { [key: string]: any } = {};
                      for (let i = 0; i < message.length; i++) {
                        if (bypassChars.includes(message[i])) {
                          specialchars[i.toString()] = message[i];
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
                    e.target.value = e.target.value.substring(0, 2000);
                  }
                }}
                onKeyDown={() => {
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
                onClick={(e: any) => {
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
  );
}

function Chat() {
  const { loggedin, user } = useData();
  const { id: chattingto } = useParams<{ id: string }>();
  if (!loggedin) {
    return <Redirect to="/"></Redirect>;
  } else if (chattingto && chattingto !== user.id) {
    return <ChatPage />;
  }
  return <ChatNotFound></ChatNotFound>;
}

export default Chat;
