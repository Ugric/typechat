import { SecureLink } from "react-secure-link";
import Linkify from "react-linkify";
import { useState } from "react";
import ColorThief from "colorthief";
import Badge from "./badges";

function ProfilePage({
  user,
}: {
  user: {
    profilePic: string;
    username: string;
    tag: string;
    backgroundImage: string | null;
    aboutme: string;
    badges: { name: string }[];
    [key: string]: any;
  };
}) {
  const [backgroundcolour, setbackgroundcolour] = useState({
    r: 86,
    g: 86,
    b: 255,
  });
  return (
    <div
      style={{
        backgroundImage: user.backgroundImage
          ? `url(/files/${user.backgroundImage}?size=666)`
          : undefined,
        backgroundColor: `rgb(${backgroundcolour.r}, ${backgroundcolour.g}, ${backgroundcolour.b})`,
        padding: "1rem",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        borderRadius: "10px",
        border: `solid 3px rgb(${backgroundcolour.r + 25}, ${
          backgroundcolour.g + 25
        }, ${backgroundcolour.b + 25})`,
        width: "100%",
        height: "100%",
        backgroundPosition: "center",
      }}
    >
      <div
        style={{
          textAlign: "center",
        }}
      >
        <img
          alt="profile"
          src={"/files/" + user.profilePic}
          width='75px'
          height='75px'
          style={{
            borderRadius: "50%",
          }}
          onLoad={(e: any) => {
            const colorThief = new ColorThief();
            const resp = colorThief.getColor(e.target);
            setbackgroundcolour({ r: resp[0], g: resp[1], b: resp[2] });
          }}
        />
        <h4>
          <span
            style={{
              color: "white",
              WebkitTextStroke: "1px black",
              fontWeight: "bold",
            }}
          >
            {user.username}
            <span
              style={{
                color: "lightgray",
                fontWeight: "normal",
              }}
            >
              #{user.tag}
            </span>
          </span>
        </h4>
      </div>
      {user.aboutme ? (
        <div
          style={{
            padding: "1rem",
            backgroundColor: "var(--dark-bg-colour)",
            borderRadius: "10px",
            border: "solid 1px var(--light-bg-colour)",
          }}
        >
          <b>About Me</b>
          <div>
            <Linkify
              componentDecorator={(
                decoratedHref: string,
                decoratedText: string,
                key: any
              ) => (
                <SecureLink
                  href={decoratedHref}
                  key={key}
                  style={{ color: "var(--secondary-text-colour)" }}
                >
                  {decoratedText}
                </SecureLink>
              )}
            >
              {user.aboutme}
            </Linkify>
          </div>
        </div>
      ) : (
        <></>
      )}
      <Badge badges={user.badges} />
    </div>
  );
}

export default ProfilePage;
