import react from "react";

export function RouterForm({
  action,
  beforecallback,
  callback,
  children,
  style,
  appendtoformdata = (fd: FormData) => {
    return fd;
  },
  onerror = (e: any) => {
    console.error(e);
  },
}: {
  action: string;
  beforecallback: (e: any) => boolean | undefined;
  callback(responce: any): void;
  children: any;
  style?: react.CSSProperties;
  appendtoformdata?(fd: FormData): FormData;
  onerror?(e: any): void;
}): JSX.Element {
  return (
    <form
      style={style}
      onSubmit={async (e: any) => {
        e.preventDefault();
        if (beforecallback(e)) {
          const fd = new FormData();
          for (let index = 0; index < e.target.length; index++) {
            const element = e.target[index];
            if (element.type !== "submit") {
              if (element.type === "file") {
                for (let file = 0; file < element.files.length; file++) {
                  fd.append(element.name, element.files[file]);
                }
              } else if (
                element.type !== "radio" &&
                element.type !== "checkbox"
              ) {
                fd.append(element.name, element.value);
              } else if (element.checked) {
                fd.append(element.name, element.checked);
              }
            }
          }
          const newformdata = appendtoformdata(fd);
          try {
            const result = await (
              await fetch(action, {
                method: "POST",
                body: newformdata,
              })
            ).json();
            callback(result);
          } catch (e) {
            onerror(e);
          }
        }
      }}
    >
      {children}
    </form>
  );
}
