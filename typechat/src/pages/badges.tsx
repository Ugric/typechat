import {
  faDev,
  faRocketchat,
  faSuperpowers,
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
}[] = [
  {
    name: "Beta Tester",
    desc: "Beta Tester",
    icon: faRocketchat,
    color: "#6495ed",
  },
  {
    name: "Blast",
    desc: "WOW, thats a Blast user!",
    icon: faRocket,
    color: "#5656ff",
  },
  {
    name: "brain",
    desc: "This a a big brain person, who gave a big brain idea!",
    icon: faBrain,
    color: "#ff7676",
  },
  {
    name: "bug",
    desc: "Bug Catcher!",
    icon: faBug,
    color: "#9c00a7",
  },
  {
    name: "new",
    desc: "A new user, say hi!",
    icon: faUserAstronaut,
    color: "#fbb03b",
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
  {
    name: "verified",
    desc: "Verified",
    icon: faCheck,
    color: "#9b9b9b",
  },
].reverse();

function Badge({
  badges,
  side,
}: {
  badges: { name: string }[];
  side?: string;
}) {
  const badgerender = useMemo(() => {
    const output = [];
    for (const badgetype of badgestype) {
      for (const badge of badges) {
        if (badge.name === badgetype.name) {
          output.push(
            <abbr
              title={badgetype.desc}
              style={{
                backgroundColor: badgetype.color,
                borderRadius: "5px",
                margin: " 0 2px",
                padding: "0 5px",
              }}
            >
              <FontAwesomeIcon
                key={badgetype.name}
                icon={badgetype.icon}
                style={{ width: "15px", height: "15px" }}
              />
            </abbr>
          );
        }
      }
    }
    return output;
  }, [badges]);
  return badgerender.length > 0 ? (
    <div
      style={{
        display: "flex",
        justifyContent: side ? side : "center",
      }}
    >
      {badgerender}
    </div>
  ) : (
    <></>
  );
}

export default Badge;
