import { Redirect } from "react-router-dom"
import { useData } from "../hooks/datahook"
import Loader from "./loader"
function Home() {
    const { loggedin } = useData()
    if (!loggedin) {
        return <Redirect to="/login"></Redirect>
    }
    return <Loader />
}

export default Home