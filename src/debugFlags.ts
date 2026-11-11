// TEMPORARY, only on the local branch debug/firefox-back-crash. Never merge.
// Open the app with ?debug=flag1,flag2 to switch pieces off; the flags stay
// for the tab (sessionStorage). ?debug= (empty) clears them.
const fromUrl = new URLSearchParams(window.location.search).get("debug");
if (fromUrl !== null) {
  sessionStorage.setItem("debug-flags", fromUrl);
}

const active = new Set(
  (sessionStorage.getItem("debug-flags") ?? "").split(",").filter(Boolean)
);

// "css" switches off every CSS flag at once.
const cssFlags = ["no3d", "noanim", "nofilter", "noglass", "noglow", "nochip"];
if (active.has("css")) {
  cssFlags.forEach((flag) => active.add(flag));
}
active.forEach((flag) => document.documentElement.classList.add(`dbg-${flag}`));

export function debugFlag(name: string): boolean {
  return active.has(name);
}
