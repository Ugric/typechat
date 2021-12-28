import { useEffect, useState } from "react";

// make a react hook that switches to true when it is christmas day
function useIsChistmas() {
  const date = new Date();
  const [isChristmas, setIsChristmas] = useState(
    date.getMonth() === 11 && date.getDate() > 25 && date.getDate() < 31
  );
  useEffect(() => {
    const date = new Date();
    let timeout: any;
      if (date.getMonth() === 11 && date.getDate()>25 && date.getDate()<31) {
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
        let timeToChristmas = christmas.getTime() - date.getTime();
        if (timeToChristmas < 0) {
          christmas.setFullYear(christmas.getFullYear() + 1);
          timeToChristmas = christmas.getTime() - date.getTime();
        }
        timeout = setTimeout(() => {
          setIsChristmas(true);
          timeout = setTimeout(() => {
            setIsChristmas(false);
          }, 8.64e7*6);
        }, timeToChristmas);
      }
    return () => clearTimeout(timeout);
  }, []);
  return isChristmas;
}
export default useIsChistmas;
