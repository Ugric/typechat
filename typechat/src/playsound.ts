import { Howl } from "howler";
import { store } from "react-notifications-component";

let hasshownmuted = false;
async function playSound(url: string) {
  const localallowed = localStorage.getItem("sound effects");
  const canPlay = localallowed ? JSON.parse(localallowed) : true;
  if (canPlay) {
    let hasplayed = false;
    const audio = new Howl({
      src: url,
    });
    audio.on("play", () => {
      hasplayed = true;
    });
    audio.play();
    setTimeout(() => {
      if (!hasplayed) {
        audio.pause();
        if (!hasshownmuted) {
          store.addNotification({
            title: "sound",
            type: "danger",
            onRemoval: () => {
              hasshownmuted = false;
            },
            message:
              "you need to interact with the site for sound effects to play!",
            insert: "top",
            animationIn: ["animate__animated", "animate__fadeIn"],
            animationOut: ["animate__animated", "animate__fadeOut"],
            container: "top-right",
            dismiss: { duration: 10000, pauseOnHover: true, onScreen: true },
          });
          hasshownmuted = true;
        }
      }
    }, 5000);
  }
}
export default playSound;
