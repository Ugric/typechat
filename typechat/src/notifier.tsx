async function notify(title: string, message: string, onclick: () => void) {
  const resp = await (
    await fetch(`notify://app/?${new URLSearchParams({ title, message })}`)
  ).text();
  if (resp === "click") {
    onclick();
  }
}

export default notify;
