import { useEffect } from "react";
import { useHistory } from "react-router-dom";
import useWebSocket from "react-use-websocket";
import { useData } from "./hooks/datahook";
import playSound from "./playsound";

function NotificationComponent() {
  const { loggedin, notifications } = useData();
  const history = useHistory();
  const { lastJsonMessage } = useWebSocket(
    `ws://${window.location.hostname}:5050/notifications`,
    {
      shouldReconnect: () => true,
    },
    loggedin
  );
  useEffect(() => {
    if (lastJsonMessage) {
      if (lastJsonMessage.type === "notification") {
        playSound("/sounds/notification.mp3");
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastJsonMessage]);
  return <></>;
}
export default NotificationComponent;
