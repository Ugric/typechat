function TandC() {
    return <div
        style={ {
            margin: "1rem auto",
            border: "solid 1px var(--light-bg-colour)",
            borderRadius: "10px",
            backgroundColor: "var(--dark-glass-bg-colour)",
            padding: "1rem",
            maxWidth: "700px",
            textAlign: "center"
        } }
    >
        <h1>Terms And Conditions</h1>
        <p>By Creating an account you agree to the following</p>
        <div
            style={ {
                border: "solid 1px var(--light-bg-colour)",
                borderRadius: "10px",
                backgroundColor: "var(--dark-bg-colour)",
                padding: "1rem",
                margin: "1rem",
                textAlign: "start"
            } }
        >
            <h5>What we expect from you</h5>
            <div
                style={ {
                    width: "100%",
                    height: "1px",
                    backgroundColor: "var(--light-bg-colour)",
                } }
            ></div>
            <ul
                style={ {
                    margin: "1rem",
                } }
            >
                <li>to not use the app for illigal activity</li>
                <li>keep all users on the app feeling safe and secure</li>
                <li>to report people who break any rules to the offical TypeChat account</li>
            </ul>
        </div>
        <div
            style={ {
                border: "solid 1px var(--light-bg-colour)",
                borderRadius: "10px",
                backgroundColor: "var(--dark-bg-colour)",
                padding: "1rem",
                margin: "1rem",
                textAlign: "start"
            } }
        >
            <h5>What you should expect from us</h5>
            <div
                style={ {
                    width: "100%",
                    height: "1px",
                    backgroundColor: "var(--light-bg-colour)",
                } }
            ></div>
            <ul
                style={ {
                    margin: "1rem",
                } }
            >
                <li>to keep your personal infomation safe and secure from hackers</li>
                <li>to make sure you feel save at all time while using the app</li>
            </ul>
        </div>
        <div
            style={ {
                border: "solid 1px var(--light-bg-colour)",
                borderRadius: "10px",
                backgroundColor: "var(--dark-bg-colour)",
                padding: "1rem",
                margin: "1rem",
                textAlign: "start"
            } }
        >
            <h5>Privacy Policy</h5>
            <div
                style={ {
                    width: "100%",
                    height: "1px",
                    backgroundColor: "var(--light-bg-colour)",
                } }
            ></div>
            <ul
                style={ {
                    margin: "1rem",
                } }
            >
                <li>We use your email to send you notifications about messages, this can be turned off in settings.</li>
                <li>We <b>DO NOT</b> store your passwords in plain text! The technique used is <a target="blank_" style={ { color: "var(--secondary-text-colour)" } } href="https://en.wikipedia.org/wiki/Salt_(cryptography)">hash with a salt</a>.</li>
                <li>All account infomation is stored securely in an <a target="blank_" style={ { color: "var(--secondary-text-colour)" } } href="https://en.wikipedia.org/wiki/SQL">SQL (Structured Query Language)</a> database.</li>
                <li>Our Privacy Policy is in addtion to google's <a target="blank_" style={ { color: "var(--secondary-text-colour)" } } href="https://policies.google.com/privacy">3rd party site Privacy Policy</a> due to <a target="blank" href="https://analytics.google.com/" style={ { color: "var(--secondary-text-colour)" } }>google analytics</a>.</li>
            </ul>
        </div>
        <div
            style={ {
                border: "solid 1px var(--light-bg-colour)",
                borderRadius: "10px",
                backgroundColor: "var(--dark-bg-colour)",
                padding: "1rem",
                margin: "1rem",
                textAlign: "start"
            } }
        >
            <h5>Important info</h5>
            <div
                style={ {
                    width: "100%",
                    height: "1px",
                    backgroundColor: "var(--light-bg-colour)",
                } }
            ></div>
            <ul
                style={ {
                    margin: "1rem",
                } }
            >
                <li>we use <a target="blank" href="https://analytics.google.com/" style={ { color: "var(--secondary-text-colour)" } }>google analytics</a> and <a target="blank" href="https://logrocket.com/" style={ { color: "var(--secondary-text-colour)" } }>logrocket</a> to debug and to help keep our app running</li>
                <li>
                    any illigal activity found, can be used against you.
                </li>
            </ul>
        </div>
        <p>the official TypeChat account will never ask for your password!</p>
    </div>
}

export default TandC