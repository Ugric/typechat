import {
  faCommentSlash,
  faPaperPlane,
  faSadCry,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useRef, useState } from "react";
import { Link, Redirect, useParams } from "react-router-dom";
import "./css/message.css";
import { useData } from "../hooks/datahook";
import useApi from "../hooks/useapi";
import LoadError from "./error";
import Loader from "./loader";
import useWebSocket, { ReadyState } from "react-use-websocket";
import KeyboardEventHandler from "react-keyboard-event-handler";

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
  settoscroll,
}: {
  messages: Array<{ mine: boolean; message: string }>;
  typingdata: {
    typing: Boolean;
    length: Number;
    specialchars: { [key: number]: any };
  };
  scrollref: React.RefObject<any>;
  settoscroll: Function;
}) {
  const [output, setoutput] = useState(<></>);
  const { navbarsize } = useData();
  const [faketext, setfaketext] = useState("");
  useEffect(() => {
    const output = [];
    let tempmessages: Array<any> = [];
    for (let i = 0; i < messages.length; i++) {
      tempmessages.push(
        <div className="message" key={i}>
          {messages[i].message}
        </div>
      );
      if (!messages[i + 1] || messages[i + 1].mine !== messages[i].mine) {
        output.push(
          <div
            className={`${messages[i].mine ? "mine" : "yours"} messages`}
            key={i}
          >
            {tempmessages}
          </div>
        );
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
        console.log(
          e.target.scrollHeight - e.target.scrollTop - e.target.clientHeight,
          e.target.scrollHeight - e.target.scrollTop - e.target.clientHeight <=
            200
        );
        settoscroll(
          e.target.scrollHeight - e.target.scrollTop - e.target.clientHeight <=
            200
        );
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
  ];
  const [chats, setchats] = useState<{ message: string; mine: boolean }[]>([]);
  const { id: chattingto } = useParams<{ id: string }>();
  const { setchattingto } = useData();
  const { error, loading, data } = useApi(
    "/api/userdatafromid?" + new URLSearchParams({ id: chattingto }).toString()
  );
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
  const [toscroll, settoscroll] = useState(false);
  useEffect(() => {
    setchattingto(chattingto);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const doneTypingInterval = 5000;
  function doneTyping() {
    if (metypingref.current) {
      metypingref.current = false;
      sendJsonMessage({
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
  const scrolltobottom = () => {};
  useEffect(() => {
    if (lastJsonMessage) {
      if (lastJsonMessage.type === "message") {
        setchats((c) => c.concat(lastJsonMessage.message));
        if (toscroll) {
          setTimeout(scrolltobottom, 0);
        }
      } else if (lastJsonMessage.type === "typing") {
        settypingdata({
          typing: lastJsonMessage.typing,
          length: lastJsonMessage.length,
          specialchars: lastJsonMessage.specialchars,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastJsonMessage]);
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
          settoscroll={settoscroll}
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
                sendJsonMessage({
                  type: "message",
                  message: { mine: false, message: message },
                });
                setchats(chats.concat({ mine: true, message: message }));
                setTimeout(scrolltobottom, 0);
                metypingref.current = false;
                sendJsonMessage({
                  type: "typing",
                  typing: metypingref.current,
                  length: 0,
                });
              }
            }}
            style={{ margin: "auto", width: "100%", maxWidth: "800px" }}
          >
            <input
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
                    sendJsonMessage({
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
                    sendJsonMessage({
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
              }}
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
