import {
  faDownload,
  faPhotoVideo,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useRef } from "react";
import { Link, Redirect, useParams } from "react-router-dom";
import { useData } from "../hooks/datahook";
import useApi from "../hooks/useapi";
import Background from "./CustomBackground";
import Loader from "./loader";
import ReactGA from "react-ga4";

function downloadURI(url: string, filename: string) {
  fetch(url)
    .then((response) => response.blob())
    .then((blob) => {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
    })
    .catch(console.error);
}

function FilePreview({
  id,
  name,
  mimetype,
}: {
  id: string;
  name: string;
  mimetype: string;
}) {
  const fname = name.replace(/\.[^/.]+$/, "");
  const ext = name.substring(name.lastIndexOf("."));
  return (
    <Link
      style={ {
        color: "white",
        textDecoration: "none",
        width: "100%",
        maxWidth: "150px",
      } }
      to={ "/drive/" + id }
    >
      <div
        style={ {
          margin: "5px",
          border: "solid 1px var(--light-bg-colour)",
          borderRadius: "10px",
          backgroundColor: "var(--main-bg-colour)",
          padding: "5px",
          cursor: "pointer",
        } }
      >
        { !(mimetype && mimetype.startsWith("image")) ? (
          <div
            style={ {
              width: "100%",
              height: "75px",
              textAlign: "center",
              borderBottom: "solid 1px var(--light-bg-colour)",
              verticalAlign: "middle",
              lineHeight: "75px",
            } }
          >
            <FontAwesomeIcon icon={ faPhotoVideo } />
          </div>
        ) : (
          <img
            src={ "/files/" + id }
            alt={ name }
            loading="lazy"
            style={ { width: "100%", borderRadius: "10px" } }
          ></img>
        ) }
        <div style={ { padding: "1rem" } }>
          <p
            style={ {
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            } }
          >
            { fname }
          </p>
          <span>{ ext }</span>
        </div>
      </div>
    </Link>
  );
}

function Drive() {
  const fileref = useRef<any>();
  const { notifications, loggedin } = useData();
  const { data, setData } =
    useApi<{ id: string; filename: string; mimetype: string }[]>(
      "/api/mydrive"
    );

  useEffect(() => {
    ReactGA.send("open drive");
    document.title = `Drive - TypeChat`;
    return () => {
      document.title = "TypeChat";
    };
  }, []);
  if (!loggedin) {
    return (
      <Redirect
        to={ "/login?" + new URLSearchParams({ to: "/user/drive" }) }
      ></Redirect>
    );
  }
  return (
    <div style={ { textAlign: "center", padding: "1rem" } }><Background />
      <h1 style={ { WebkitTextStroke: "1px black" } }>My Drive</h1>
      { data ? (
        <div
          style={ {
            margin: "auto",
            border: "solid 1px var(--light-bg-colour)",
            borderRadius: "10px",
            backgroundColor: "var(--dark-bg-colour)",
            padding: "1rem",
            maxWidth: "700px",
          } }
        >
          <input
            type="file"
            style={ { display: "none" } }
            ref={ fileref }
            onInput={ async (e: any) => {
              if (e.target.files.length > 0) {
                const file = e.target.files[0];
                e.target.value = "";
                const formdata = new FormData();
                formdata.append("file", file);
                const id = Math.random();
                notifications.addNotification({
                  title: "File",
                  message: "Uploading...",
                  type: "warning",
                  insert: "top",
                  id,
                  container: "top-right",
                  animationIn: ["animate__animated", "animate__fadeIn"],
                  animationOut: ["animate__animated", "animate__fadeOut"],
                });
                try {
                  const resp = await (
                    await fetch("/api/uploadfile", {
                      method: "POST",
                      body: formdata,
                    })
                  ).json();
                  if (resp.resp) {
                    notifications.removeNotification(id);
                    setData(
                      (
                        data: {
                          id: string;
                          filename: string;
                          mimetype: string;
                        }[]
                      ) =>
                        [
                          {
                            id: resp.id,
                            filename: file.name,
                            mimetype: file.type,
                          },
                        ].concat(data)
                    );
                  } else {
                    notifications.removeNotification(id);
                    notifications.addNotification({
                      title: "Upload Error",
                      message: resp.err,
                      type: "danger",
                      insert: "top",
                      container: "top-right",
                      animationIn: ["animate__animated", "animate__fadeIn"],
                      animationOut: ["animate__animated", "animate__fadeOut"],
                    });
                  }
                  console.log(resp);
                } catch (e) {
                  notifications.removeNotification(id);
                  notifications.addNotification({
                    title: "Upload Error",
                    message: String(e),
                    type: "danger",
                    insert: "top",
                    container: "top-right",
                    animationIn: ["animate__animated", "animate__fadeIn"],
                    animationOut: ["animate__animated", "animate__fadeOut"],
                  });
                }
              }
            } }
          />

          <button
            style={ {
              marginRight: "5px",
              backgroundColor: "var(--dark-bg-colour)",
              padding: "5px",
              borderRadius: "20px",
              border: "solid 1px var(--light-bg-colour)",
              color: "white",
              textAlign: "center",
            } }
            onClick={ () => {
              if (fileref.current) fileref.current.click();
            } }
          >
            <FontAwesomeIcon icon={ faPlus } /> add file
          </button>
          <div
            style={ {
              display: "flex",
              justifyContent: "space-around",
              alignItems: "center",
              flexDirection: "row",
              flexWrap: "wrap",
              alignContent: "center",
            } }
          >
            { data.map((value) => (
              <FilePreview
                key={ value.id }
                mimetype={ value.mimetype }
                id={ value.id }
                name={ value.filename }
              ></FilePreview>
            )) }
          </div>
        </div>
      ) : (
        <Loader></Loader>
      ) }
    </div>
  );
}

function Image() {
  const { id } = useParams<{ id: string }>();
  const { data } = useApi<{ id: string; filename: string; mimetype: string }>(
    "/api/getimagedata?" + new URLSearchParams({ id })
  );
  const mimetype = data?.mimetype;
  const file = data?.id;
  useEffect(() => {
    ReactGA.send("open drive file");
    if (data) {
      document.title = `${data.filename} - TypeChat`;
    }
    return () => {
      document.title = "TypeChat";
    };
  }, [data]);
  return data ? (
    <div style={ { margin: "1rem" } }>
      <div
        style={ {
          margin: "1rem auto",
          border: "solid 1px var(--light-bg-colour)",
          borderRadius: "10px",
          backgroundColor: "var(--dark-bg-colour)",
          padding: "1rem",
          maxWidth: "700px",
        } }
      >
        <h1>{ data.filename }</h1>
        <div
          onClick={ () => {
            downloadURI("/files/" + file, data.filename);
          } }
          style={ {
            color: "var(--secondary-text-colour)",
            cursor: "pointer",
            fontSize: "25px",
          } }
        >
          <FontAwesomeIcon icon={ faDownload }></FontAwesomeIcon> Download
        </div>
        <div
          style={ {
            height: "1px",
            backgroundColor: "var(--light-bg-colour)",
            width: "100%",
            margin: "1rem 0",
          } }
        ></div>
        { mimetype ? (
          mimetype.split("/")[0] === "image" ? (
            <img
              alt={ file }
              src={ `/files/${file}` }
              style={ { width: "100%", borderRadius: "20px" } }
              loading="lazy"
            ></img>
          ) : mimetype.split("/")[0] === "video" ? (
            <video
              src={ `/files/${file}` }
              style={ { width: "100%" } }
              controls
              playsInline
            ></video>
          ) : mimetype.split("/")[0] === "audio" ? (
            <audio
              src={ `/files/${file}` }
              style={ { width: "100%" } }
              controls
              playsInline
            ></audio>
          ) : (
            <p>No Preview!</p>
          )
        ) : (
          <p>No Preview!</p>
        ) }
      </div>
    </div>
  ) : (
    <Loader></Loader>
  );
}

const exports = { Drive, Image };
export default exports;
