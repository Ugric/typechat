import { useRef } from "react";

const useRunOnce = (callback: Function) => {
  const hasrun = useRef(false);
  if (!hasrun.current) {
    hasrun.current = true;
    callback();
  }
};
export default useRunOnce;
