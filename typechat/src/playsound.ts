async function playSound(url: string) {
  const audio = new Audio(url);
  audio.autoplay = true;
  try {
    await audio.play();
  } catch {}
}
export default playSound;
