/* eslint-disable no-undef */
/* eslint-disable no-restricted-globals */
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  clients.openWindow(e.notification.data.url);
});
const snooze = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));
const notificationwebsocket = () =>
  new Promise((resolve) => {
    let socket = new WebSocket(
      `ws${location.protocol === "https:" ? "s" : ""}://${
        location.port === "3000" ? location.hostname + ":5000" : location.host
      }/notifications`
    );
    socket.onopen = () => {
      socket.send(JSON.stringify({ type: "setFocus", focus: false }));
    };
    socket.onclose = resolve;
    socket.onmessage = ({ data }) => {
      const json = JSON.parse(data);
      if (json.type === "ping") {
        socket.send(JSON.stringify({ type: "pong" }));
      } else {
        self.registration.showNotification(String(json.title), {
          body: String(json.message),
          icon: "/logo.png",
          data: { url: new URL(json.to, self.location.origin).href },
        });
      }
    };
  });
(async () => {
  while (true) {
    await notificationwebsocket();
    await snooze(5000);
  }
})();
