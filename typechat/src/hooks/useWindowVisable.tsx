import { useEffect, useState } from "react";

function useWindowVisable() {
    const [visable, setvisable] = useState(!document.hidden)
    useEffect(() => {
        document.addEventListener("visibilitychange", function () { setvisable(!document.hidden) })
    }, [])
    return visable
}
export default useWindowVisable