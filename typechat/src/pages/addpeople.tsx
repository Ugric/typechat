import { useEffect } from "react";
import { useState } from "react";
import useApi from "../hooks/useapi";

function AddPeople() {
  const [search, setsearch] = useState("");
  const { data, setData } = useApi(
    search
      ? "/api/searchusers?" + new URLSearchParams({ q: search }).toString()
      : null
  );
  useEffect(() => {
    if (!search) setData(undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);
  return (
    <div>
      <input
        onKeyUp={(e: any) => {
          setsearch(e.target.value.trim());
        }}
      ></input>
      <div>{JSON.stringify(data)}</div>
    </div>
  );
}

export default AddPeople;
