import {
  faDev,
  faDiscord,
  faNodeJs,
  faPython,
  faRocketchat,
  faSuperpowers,
  faTwitch,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";
import {
  faRocket,
  faUserAstronaut,
  faUserTie,
  faBrain,
  IconDefinition,
  faCheck,
  faBug,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useMemo } from "react";

const badgestype: {
  name: string;
  desc: string;
  icon: IconDefinition;
  color: string;
  link?: string
}[] = [
  {
    name: "Beta Tester",
    desc: "Beta Tester",
    icon: faRocketchat,
    color: "#6495ed",
  },
  {
    name: "Blast",
    desc: "WOW, thats a Blast Member!",
    icon: faRocket,
    color: "#5656ff",
    link: "/blast"
  },
  {
    name: "brain",
    desc: "This given to a big brain person, who gave a big brain idea!",
    icon: faBrain,
    color: "#ff7676",
  },
  {
    name: "bug",
    desc: "Bug Catcher!",
    icon: faBug,
    color: "#9c00a7",
  },
  { name: "discord", desc: "Discord", icon: faDiscord, color: "#5865f2", link: "/invite" },
  { name: "youtube", desc: "Youtube", icon: faYoutube, color: "#FF0000" },
  { name: "twitch", desc: "Twitch", icon: faTwitch, color: "#6441a5" },
  { name: "python", desc: "Python", icon: faPython, color: "linear-gradient(135deg, #008cff, #ffcc00)", link: "https://www.python.org/" },
  { name: "nodejs", desc: "Node.js", icon: faNodeJs, color: "#71a752", link: "https://nodejs.org/" },
  {
    name: "new",
    desc: "A new user, say hi!",
    icon: faUserAstronaut,
    color: "#fbb03b",
  },
  {
    name: "verified",
    desc: "Verified",
    icon: faCheck,
    color: "#1e90ff",
  },
  { name: "admin", desc: "WOW, an admin!", icon: faUserTie, color: "#ee3840" },
  {
    name: "dev",
    desc: "WOW! A developer!",
    icon: faDev,
    color: "#23c18b",
  },
  {
    name: "ceo",
    desc: "OMG. OMG. OMG. It's the CEO!",
    icon: faSuperpowers,
    color: "#e88158",
  },
].reverse();

function Badge({
  badges,
  side,
  size
}: {
  badges: { name: string; link?: string }[];
  side?: string;
  size?: string | number
}) {
  const badgerender = useMemo(() => {
    const output = [];
    if (badges) {
      for (const badgetype of badgestype) {
        for (const badge of badges) {
          if (badge.name === badgetype.name) {
            output.push(
              <abbr
                key={ badgetype.name }
                title={ badgetype.desc }
                style={ {
                  background: badgetype.color,
                  borderRadius: "5px",
                  margin: "2px",
                  padding: "0px 3px",
                  height: size ? size : "30px",
                  width: size ? size : "30px",
                  cursor: badge.link || badgetype.link ? "pointer" : undefined
                } }
                onClick={ () => badge.link ? window.open(badge.link, "blank_") : badgetype.link ? window.open(badgetype.link, "blank_") : undefined }
              >
                <FontAwesomeIcon
                  icon={ badgetype.icon }
                  style={ { width: "100%", height: "100%" } }
                />
              </abbr>
            );
            break
          }
        }
      }
    }
    return output;
  }, [badges, size]);
  return badgerender.length > 0 ? (
    <div
      style={ {
        display: "flex",
        flexWrap: "wrap",
        justifyContent: side ? side : "center",
      } }
    >
      { badgerender }
    </div>
  ) : (
    <></>
  );
}

export default Badge;
