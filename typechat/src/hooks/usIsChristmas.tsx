import { useEffect, useState } from "react";

// make a react hook that switches to true when it is christmas day
function useIsChistmas() {
  const date = new Date();
  const [isChristmas, setIsChristmas] = useState(
    date.getMonth() === 11 && date.getDate() === 25
  );
  useEffect(() => {
    const date = new Date();
    let timeout: any;
      if (date.getMonth() === 11 && date.getDate() === 25) {
        setIsChristmas(true);
      timeout = setTimeout(() => {
        setIsChristmas(false);
      }, 8.64e7 - (date.getTime() % 8.64e7));
    } else {
      const christmas = new Date();
      christmas.setMonth(11);
      christmas.setDate(25);
      christmas.setHours(0);
      christmas.setMinutes(0);
      christmas.setSeconds(0);
      christmas.setMilliseconds(0);
      const timeToChristmas = christmas.getTime() - date.getTime();
          timeout = setTimeout(() => {
          setIsChristmas(true);
        timeout = setTimeout(() => {
          setIsChristmas(false);
        }, 8.64e7);
      }, timeToChristmas);
    }
    return () => clearTimeout(timeout);
  }, []);
  return isChristmas;
}
export default useIsChistmas;
