import { useData } from "../hooks/datahook";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs";
import "prismjs/components/prism-sql";
import "./css/prism-code.css";
import { useState, useRef } from "react";
import SyntaxHighlighter from "react-syntax-highlighter/dist/esm/default-highlight";
import Error404 from "./404";

function AdminPanel() {
  const { user } = useData();
  const [code, setCode] = useState("");
  const [result, setResult] = useState("NO DATA...");
  const passwordref = useRef<any>(null);
  if (user?.admin) {
    return (
      <div style={{ userSelect: "text" }}>
        <h1 style={{ textAlign: "center" }}>Admin Panel</h1>
        <h2>Hello {user.username}!</h2>
        <Editor
          value={code}
          className="sql"
          onValueChange={(code) => setCode(code)}
          highlight={(code) => highlight(code, languages.sql, "sql")}
          padding={10}
          style={{
            fontFamily: '"Fira code", "Fira Mono", monospace',
            fontSize: 12,
            color: "#fff !important",
          }}
        />
        <input type="password" ref={passwordref} required></input>
        <button
          onClick={() => {
            setResult("...");
            const fd = new FormData();
            fd.append("sql", code);
            fd.append("pass", String(passwordref.current.value));
            passwordref.current.value = "";
            fetch("/api/admin/sqlreq", {
              method: "POST",
              body: fd,
            })
              .then((res) => res.json())
              .then((res) => {
                setResult(JSON.stringify(res, null, 2));
              });
          }}
        >
          Run
        </button>
        <SyntaxHighlighter language="json" showLineNumbers>
          {result}
        </SyntaxHighlighter>
      </div>
    );
  }
  return <Error404 />;
}

export default AdminPanel;
