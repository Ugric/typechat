import {
  faCommentSlash,
  faPaperPlane,
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
import TimeAgo from "react-timeago";
import TextareaAutosize from "react-textarea-autosize";
import SyntaxHighlighter from "react-syntax-highlighter";

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
function MessageMaker({
  messages,
  typingdata,
  scrollref,
  toscroll,
}: {
  messages: Array<{ mine: boolean; message: string; time: number }>;
  typingdata: {
    typing: Boolean;
    length: Number;
    specialchars: { [key: number]: any };
  };
  scrollref: React.RefObject<any>;
  toscroll: any;
}) {
  const [output, setoutput] = useState(<></>);
  const { navbarsize } = useData();
  const [faketext, setfaketext] = useState("");
  useEffect(() => {
    const output = [];
    let tempmessages: Array<any> = [];
    let lastmessagegrouptime;
    for (let i = 0; i < messages.length; i++) {
      tempmessages.push(
        <div className="message" key={i}>
          {messages[i].message
            .split("```")
            .map((value, index) =>
              index % 2 === 0 ? (
                <div key={index}>{value.trim()}</div>
              ) : (
                <SyntaxHighlighter>{value.trim()}</SyntaxHighlighter>
              )
            )}
        </div>
      );
      if (!messages[i + 1] || messages[i + 1].mine !== messages[i].mine) {
        output.push(
          <>
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
                <TimeAgo
                  date={
                    lastmessagegrouptime
                      ? lastmessagegrouptime
                      : messages[i].time
                  }
                />
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
                <TimeAgo date={messages[i].time} />
              </p>
            ) : (
              <></>
            )}
          </>
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
  return (
    <div
      style={{
        width: "100%",
        position: "fixed",
        height: `calc(100vh - ${navbarsize.height}px)`,
        overflow: "overlay",
      }}
      onScroll={(e: any) => {
        toscroll.current =
          e.target.scrollHeight - e.target.scrollTop - e.target.clientHeight <=
          200;
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
  const [chats, setchats] = useState<
    { message: string; mine: boolean; time: number }[]
  >([]);
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
  const [socketUrl] = useState(`ws://${window.location.hostname}:5050/`);
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
  const toscroll = useRef(true);
  useEffect(() => {
    setchattingto(chattingto);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
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
    { shouldReconnect: () => true }
  );
  const scrolltobottom = () => {
    if (scrollerref && scrollerref.current)
      scrollerref.current.scrollTo(0, scrollerref.current.scrollHeight);
  };
  useEffect(() => {
    if (lastJsonMessage) {
      if (lastJsonMessage.type === "message") {
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
            title: `${data.username}#${data.tag}`,
            message: lastJsonMessage.message.message,
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
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastJsonMessage]);
  useEffect(() => {
    sendJsonMessage(metypingdata);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metypingdata]);
  if (error || loading || readyState !== ReadyState.OPEN) {
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
          style={{
            position: "fixed",
            padding: "1rem",
            width: "100%",
            bottom: "0px",
            background:
              "linear-gradient(180deg, transparent, var(--dark-mode))",
          }}
        >
          <form
            onSubmit={(e: any) => {
              e.preventDefault();
              const message = e.target[0].value.trim();
              if (message !== "") {
                e.target[0].value = "";
                const time = new Date().getTime();
                sendJsonMessage({
                  type: "message",
                  message: {
                    mine: false,
                    message: message,
                    time,
                  },
                });
                setchats(chats.concat({ mine: true, message: message, time }));
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
              margin: "auto",
              width: "100%",
              maxWidth: "800px",
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
            >
              <FontAwesomeIcon icon={faPaperPlane} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function Chat() {
  const { loggedin } = useData();
  const { id: chattingto } = useParams<{ id: string }>();
  if (!loggedin) {
    return <Redirect to="/"></Redirect>;
  } else if (chattingto) {
    return <ChatPage />;
  }
  return <ChatNotFound></ChatNotFound>;
}

export default Chat;
