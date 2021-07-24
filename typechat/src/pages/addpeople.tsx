import { useEffect } from "react";
import { useState } from "react";
import useApi from "../hooks/useapi";
import ColorThief from "colorthief";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserPlus } from "@fortawesome/free-solid-svg-icons";
import Loader from "./loader";
import { useHistory } from "react-router-dom";
const colorThief = new ColorThief();

function UserListing({
  user,
  setloading,
}: {
  user: {
    profilePic: string;
    username: string;
    id: string;
    tag: string;
    backgroundImage: string | null;
    [key: string]: any;
  };
  setloading: Function;
}) {
  const [backgroundcolour, setbackgroundcolour] = useState({
    r: 86,
    g: 86,
    b: 255,
  });
  const history = useHistory();
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
        textOverflow: "ellipsis",
        overflow: "hidden",
        whiteSpace: "nowrap",
      }}
    >
      <img
        alt="profile"
        loading="lazy"
        src={"/files/" + user.profilePic}
        style={{
          maxHeight: "75px",
          maxWidth: "100%",
          height: "auto",
          width: "auto",
          borderRadius: "50%",
        }}
        onLoad={async (e: any) => {
          const resp = await colorThief.getColor(e.target);
          setbackgroundcolour({ r: resp[0], g: resp[1], b: resp[2] });
        }}
      />
      <span>
        <span
          style={{
            color: "white",
            WebkitTextStroke: "1px black",
            fontWeight: "bold",
            fontSize: "20px",
            marginLeft: "5px",
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
      </span>
      <div
        style={{
          float: "right",
          background: "var(--main-bg-colour)",
          padding: "5px",
          borderRadius: "10px",
          cursor: "pointer",
        }}
        onClick={async () => {
          setloading(true);
          const formdata = new FormData();
          formdata.append("user", user.id);
          const resp = await (
            await fetch("/api/frienduserfromid", {
              method: "POST",
              body: formdata,
            })
          ).json();
          if (resp.friends) {
            history.push(`/chat/${user.id}`);
          } else {
            history.push(`/contacts`);
          }
          setloading(false);
        }}
      >
        <FontAwesomeIcon icon={faUserPlus}></FontAwesomeIcon>
      </div>
    </div>
  );
}

function AddPeople() {
  const [search, setsearch] = useState("");
  const { data, setData } = useApi(
    search
      ? "/api/searchusers?" + new URLSearchParams({ q: search }).toString()
      : null
  );
  const [loading, setloading] = useState(false);
  useEffect(() => {
    if (!search) setData(undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);
  return loading ? (
    <Loader></Loader>
  ) : (
    <div
      style={{
        margin: "1rem",
      }}
    >
      <div
        style={{
          margin: "auto",
          border: "solid 1px var(--light-bg-colour)",
          borderRadius: "10px",
          backgroundColor: "var(--dark-bg-colour)",
          padding: "1rem",
          maxWidth: "700px",
        }}
      >
        <h1 style={{ textAlign: "center" }}>Add</h1>

        <input
          type="text"
          style={{
            width: "100%",
            backgroundColor: "var(--dark-bg-colour)",
            padding: "5px",
            borderRadius: "20px",
            border: "solid 1px var(--light-bg-colour)",
            color: "white",
          }}
          placeholder={"search users"}
          onKeyUp={(e: any) => {
            setsearch(e.target.value.trim());
          }}
        ></input>
        <div>
          {data && search ? (
            data.resp ? (
              data.data.length > 0 ? (
                <div>
                  <p style={{ textAlign: "end" }}>
                    {data.data.length} result{data.data.length === 1 ? "" : "s"}{" "}
                    found!
                  </p>
                  {data.data.map(
                    (
                      value: {
                        profilePic: string;
                        username: string;
                        id: string;
                        tag: string;
                        backgroundImage: string | null;
                        [key: string]: any;
                      },
                      index: number
                    ) => (
                      <UserListing
                        user={value}
                        setloading={setloading}
                        key={value.id}
                      />
                    )
                  )}
                </div>
              ) : (
                <p>No Results Found!</p>
              )
            ) : (
              <p style={{ color: "red", textAlign: "center" }}>{data.err}</p>
            )
          ) : (
            <p style={{ textAlign: "center" }}>
              type someones username and tag
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AddPeople;
