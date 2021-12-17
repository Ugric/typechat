import { Redirect, useParams } from "react-router";
import { useData } from "../hooks/datahook";
import useApi from "../hooks/useapi";
import Loader from "./loader";

function LinkDiscord() {
  const { id } = useParams<{ id: string }>();
  const { loggedin } = useData();
  const { data, error, loading } = useApi<{ linked: boolean; error?: string }>(
    loggedin ? `/api/link/${id}` : null
  );
  if (!loggedin) {
    return (
      <Redirect
        to={"/login?" + new URLSearchParams({ to: `/link/${id}` })}
      ></Redirect>
    );
  }
  return error || loading ? (
    <Loader></Loader>
  ) : (
    <div style={{ textAlign: "center" }}>
      {data?.linked ? (
        <>
          <h1>Account Linked!</h1>
          <p>you can now close this page</p>
        </>
      ) : (
        <>
          <h1>Failed to Link</h1>
          <p>{data?.error}</p>
        </>
      )}
    </div>
  );
}
export default LinkDiscord;
