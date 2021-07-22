import { useState, useEffect, useRef } from "react";

interface userApiInterface {
  loading: boolean;
  data: any;
  setData: Function;
  error: boolean | unknown;
  reload: Function;
}

const useApi = (url: string | null): userApiInterface => {
  const [data, setData] = useState<JSON | unknown>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [request, setrequest] = useState<number>(0);
  const [error, setError] = useState<boolean | unknown>(undefined);
  const laststamp = useRef<number | null>(null);
  function reload() {
    setrequest(request + 1);
    setLoading(true);
    setError(undefined);
    setData(undefined);
  }
  useEffect(() => {
    if (url) {
      (async () => {
        try {
          const time = new Date().getTime();
          const result = await (await fetch(url)).json();
          if (!laststamp.current || time - laststamp.current > 0) {
            laststamp.current = time;
            setData(result);
          }
        } catch (e) {
          setError(e);
        }
        setLoading(false);
      })();
    }
  }, [url, request]);

  return { loading, data, setData, error, reload };
};

export default useApi;
