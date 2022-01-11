import { useEffect, useState } from "react";

// make a react hook that switches to true when it is christmas day
function useIsChistmas() {
  const date = new Date();
  const [isChristmas, setIsChristmas] = useState(
    date.getMonth() === 11 && date.getDate() >= 25 && date.getDate() <= 31
  );
  useEffect(() => {
    const loop = setInterval(() => {
    const date = new Date();
      if (
        date.getMonth() === 11 &&
        date.getDate() >= 25 &&
        date.getDate() <= 31
      ) {
        setIsChristmas(true);
      } else {
        setIsChristmas(false);
      }
    }
      , 1000);
    return () => clearInterval(loop);
  }, []);
  return isChristmas;
}
export default useIsChistmas;
