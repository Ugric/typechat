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
        textAlign: "center",
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
      <img
        src={"/files/" + user.profilePic}
        style={{ height: "75px", borderRadius: "50%" }}
      />
      <h1>
        <span style={{ color: "var(--primary-text-colour)" }}>
          {user.username}
          <span style={{ color: "var(--secondary-text-colour)" }}>
            #{user.tag}
          </span>
        </span>
      </h1>
    </div>
  );
}

export default ProfilePage;
