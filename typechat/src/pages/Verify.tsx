import { useParams } from "react-router";
import useApi from "../hooks/useapi";
import Loader from "./loader";

function Verify() {
    const { id } = useParams<{ id: string }>();
    const { data, loading, error } = useApi<{ verified: boolean, user: any }>(`/api/verify/${id}`)
    return loading || error ? <Loader></Loader> : data?.verified ? <div style={ { textAlign: "center" } }><h1>Verified!</h1><p>the account { data?.user.username }#{ data?.user.tag } has been verified!</p></div> : <h1 style={ { textAlign: "center" } }>Verification URL invalid!</h1>
}

export default Verify