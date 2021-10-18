function setIcon(path: string) {
  const links: any = document.querySelectorAll("link[rel~='icon']");
  for (let i = 0; i < links.length; i++) {
    let link = links[i];
    if (i === 0) {
      if (!link) {
        link = document.createElement("link");
        document.getElementsByTagName("head")[0].appendChild(link);
      }
      link.type = "image/x-icon";
      link.rel = "icon";
      link.href = path;
    } else {
      link.remove();
    }
  }
}
export default setIcon;
