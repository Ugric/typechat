import { useState, useEffect } from "react";

interface userApiInterface {
  loading: boolean;
  data: any;
  error: boolean | unknown;
  reload: Function;
}

const useApi = (url: string): userApiInterface => {
  const [data, setData] = useState<JSON | unknown>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [request, setrequest] = useState<number>(0);
  const [error, setError] = useState<boolean | unknown>(undefined);
  function reload() {
    setrequest(request + 1);
    setLoading(true);
    setError(undefined);
    setData(undefined);
  }
  useEffect(() => {
    (async () => {
      try {
        const result = await (await fetch(url)).json();
        setData(result);
      } catch (e) {
        setError(e);
      }
      setLoading(false);
    })();
  }, [url, request]);

  return { loading, data, error, reload };
};

export default useApi;
