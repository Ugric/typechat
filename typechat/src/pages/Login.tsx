import { useData } from "../hooks/datahook"

function Login() {
    const { loggedin } = useData()
    return <div>{!loggedin ? "not " : <></>}logged in</div>
}

export default Login