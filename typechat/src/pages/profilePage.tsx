import { SecureLink } from "react-secure-link";
import Linkify from "react-linkify";
import { useState } from "react";

function getAverageRGB(imgEl: any) {
  var blockSize = 5, // only visit every 5 pixels
    defaultRGB = { r: 0, g: 0, b: 0 }, // for non-supporting envs
    canvas = document.createElement("canvas"),
    context = canvas.getContext && canvas.getContext("2d"),
    data,
    width,
    height,
    i = -4,
    length,
    rgb = { r: 0, g: 0, b: 0 },
    count = 0;

  if (!context) {
    return defaultRGB;
  }

  height = canvas.height =
    imgEl.naturalHeight || imgEl.offsetHeight || imgEl.height;
  width = canvas.width = imgEl.naturalWidth || imgEl.offsetWidth || imgEl.width;

  context.drawImage(imgEl, 0, 0);

  try {
    data = context.getImageData(0, 0, width, height);
  } catch (e) {
    /* security error, img on diff domain */
    return defaultRGB;
  }

  length = data.data.length;

  while ((i += blockSize * 4) < length) {
    ++count;
    rgb.r += data.data[i];
    rgb.g += data.data[i + 1];
    rgb.b += data.data[i + 2];
  }

  // ~~ used to floor values
  rgb.r = ~~(rgb.r / count);
  rgb.g = ~~(rgb.g / count);
  rgb.b = ~~(rgb.b / count);

  return rgb;
}

function ProfilePage({
  user,
}: {
  user: {
    profilePic: string;
    username: string;
    tag: string;
    backgroundImage: string;
    aboutme: string;
    [key: string]: any;
  };
}) {
  const [backgroundcolour, setbackgroundcolour] = useState({
    r: 0,
    g: 0,
    b: 0,
  });
  return (
    <div
      style={{
        backgroundImage: user.backgroundImage
          ? `url(/files/${user.backgroundImage})`
          : "",
        backgroundColor: `rgb(${backgroundcolour.r}, ${backgroundcolour.g}, ${backgroundcolour.b})`,
        padding: "1rem",
        backgroundRepeat: user.backgroundImage ? "no-repeat" : "",
        backgroundSize: user.backgroundImage ? "cover" : "",
        borderRadius: "10px",
        border: "solid 1px var(--light-bg-colour)",
        margin: "1rem",
        backgroundPosition: user.backgroundImage ? "center" : "",
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
          style={{ height: "75px", borderRadius: "50%" }}
          onLoad={(e) => {
            setbackgroundcolour(getAverageRGB(e.target));
          }}
        />
        <h4>
          <span
            style={{
              color: "white",
              textShadow:
                " -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000",
            }}
          >
            {user.username}
            <span
              style={{
                color: "lightgray",
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
    </div>
  );
}

export default ProfilePage;
