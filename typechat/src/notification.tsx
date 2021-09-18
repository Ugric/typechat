import { useEffect } from "react";
import { useHistory } from "react-router-dom";
import useWebSocket from "react-use-websocket";
import { useData } from "./hooks/datahook";
import playSound from "./playsound";
import useWindowFocus from "use-window-focus";
import isElectron from "is-electron";
import notify from "./notifier";

function NotificationComponent() {
  const { loggedin, notifications } = useData();
  const isFocussed = useWindowFocus();
  const history = useHistory();
  const { lastJsonMessage, sendJsonMessage } = useWebSocket(
    `ws${window.location.protocol === "https:" ? "s" : ""}://${!process.env.NODE_ENV || process.env.NODE_ENV === "development"
      ? window.location.hostname + ":5000"
      : window.location.host
    }/notifications`,
    {
      shouldReconnect: () => true,
    },
    loggedin
  );

  useEffect(() => {
    sendJsonMessage({ type: "setFocus", focus: isFocussed });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFocussed]);
  useEffect(() => {
    if (lastJsonMessage) {
      if (lastJsonMessage.type === "ping") {
        sendJsonMessage({ type: "pong" });
      } else {
        if (lastJsonMessage.sound !== false) {
          playSound(
            lastJsonMessage.sound
              ? lastJsonMessage.sound
              : "/sounds/notification.mp3"
          );
        }
        if (isElectron()) {
          notify(lastJsonMessage.title, lastJsonMessage.message, () => {
            history.push(lastJsonMessage.to);
          });
        } else {
          notifications.addNotification({
            title: lastJsonMessage.title,
            message: lastJsonMessage.message,
            type: "default",
            onRemoval: (_: string, type: any) => {
              if (type === "click") {
                history.push(lastJsonMessage.to);
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
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastJsonMessage]);
  return <></>;
}
export default NotificationComponent;
