type HapticPattern = number | number[];

export function vibrate(pattern: HapticPattern = [35, 25, 55]) {
  if (typeof navigator === "undefined" || !("vibrate" in navigator)) {
    return;
  }

  navigator.vibrate(pattern);
}
