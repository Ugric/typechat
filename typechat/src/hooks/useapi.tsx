import { useState, useEffect, useRef } from "react";

interface userApiInterface<T> {
  loading: boolean;
  data: T | undefined;
  setData: Function;
  error: string | undefined;
  reload: Function;
  reloadSilent: Function;
}

function useApi<T>(url: string | null): userApiInterface<T> {
  const [data, setData] = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [request, setrequest] = useState<number>(0);
  const [error, setError] = useState<string | undefined>(undefined);
  const laststamp = useRef<number | null>(null);
  function reload() {
    setrequest(request + 1);
    setLoading(true);
    setError(undefined);
    setData(undefined);
  }
  function reloadSilent() {
    setrequest(request + 1);
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
          setError(String(e));
        }
        setLoading(false);
      })();
    }
  }, [url, request]);

  return { loading, data, setData, error, reload, reloadSilent };
}

export default useApi;
