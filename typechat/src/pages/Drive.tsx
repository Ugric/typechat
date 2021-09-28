import { faPhotoVideo } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Link } from "react-router-dom"

function FilePreview({id, name}: {id: string; name: string}) {
    return <Link
    style={{color: "white", textDecoration: "none"}}
    to={"/user/drive/"+id}><div
    style={{
        margin: "1rem",
        width: "150px",
        border: "solid 1px var(--light-bg-colour)",
        borderRadius: "10px",
        backgroundColor: "var(--main-bg-colour)",
        padding: "5px",
        cursor: "pointer"
    }}
    >
        <div style={{width: "100%", height: "75px", textAlign: "center",
                    borderBottom: "solid 1px var(--light-bg-colour)",
                    verticalAlign: "middle",
                    lineHeight: "75px"}}
                    ><FontAwesomeIcon icon={faPhotoVideo} /></div>
        <p style={{padding: "1rem"}}>{name}</p>
        </div>
    </Link>
}

function Drive() {
    return <div style={{textAlign: "center", padding: "1rem"}}>
                <h1>My Drive</h1>
                <div 
                    style={{
                    margin: "auto",
                    border: "solid 1px var(--light-bg-colour)",
                    borderRadius: "10px",
                    backgroundColor: "var(--dark-bg-colour)",
                    padding: "1rem",
                    maxWidth: "700px",
                    display: "flex",
                    justifyContent: "space-around",
                    alignItems: "center",
                    flexDirection: "row",
                    flexWrap: "wrap",
                    alignContent: "center",
                    }}>
                        <FilePreview id="hi" name="hi"></FilePreview>
                </div>
           </div>
}



export default Drive