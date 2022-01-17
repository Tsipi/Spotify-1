//converts the miliseconds to minutes... nice way
export function millisToMinutesAndSeconds(millis) {
  const interval = 60000;
  const minutes = Math.floor(millis / interval);
  const seconds = ((millis % interval) / 1000).toFixed(0);
  return seconds == 60
    ? minutes + 1 + ":00"
    : minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
}
