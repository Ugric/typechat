import { useHistory } from "react-router-dom"
import { useData } from "../hooks/datahook"
import Loader from "./loader"
function Home() {
    const { loggedin } = useData()
    const history = useHistory()
    if (!loggedin) {
        history.push("/login")
    }
    return <Loader />
}

export default Home