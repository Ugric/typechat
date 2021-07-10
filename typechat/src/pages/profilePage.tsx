import { SecureLink } from "react-secure-link";
import Linkify from "react-linkify";

function ProfilePage({
  user,
}: {
  user: {
    profilePic: string;
    username: string;
    tag: string;
    backgroundImage: string;
    [key: string]: any;
  };
}) {
  return (
    <div
      style={{
        background: user.backgroundImage
          ? `url(/files/${user.backgroundImage})`
          : "",
        backgroundColor: "var(--main-bg-colour)",
        padding: "1rem",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        borderRadius: "10px",
        border: "solid 1px var(--light-bg-colour)",
        margin: "1rem",
        backgroundPosition: "center",
      }}
    >
      <div
        style={{
          textAlign: "center",
        }}
      >
        <img
          src={"/files/" + user.profilePic}
          style={{ height: "75px", borderRadius: "50%" }}
        />
        <h1>
          <span style={{
            color: "white",
          }}>
            {user.username}
            <span style={{
              color: "lightgray",
            }}>
              #{user.tag}
            </span>
          </span>
        </h1>
      </div>
      <div
        style={{
          padding: "1rem",
          backgroundColor: "var(--dark-bg-colour)",
          borderRadius: "10px",
          border: "solid 1px var(--light-bg-colour)",
        }}
      >
        <h4>About Me</h4>
        <div
          style={{ height: "1px", width: "100%", backgroundColor: "white" }}
        />
        <div
          style={{
            padding: "1rem",
          }}
        >
          <Linkify
            componentDecorator={(
              decoratedHref: string,
              decoratedText: string,
              key: any
            ) => (
              <SecureLink href={decoratedHref} key={key}>
                {decoratedText}
              </SecureLink>
            )}
          >
            hi
          </Linkify>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
