// The hotcfg theme, as on hotcfg.run (web/public/theme.js + src/lib/theme.ts):
// dark by default, light under html[data-theme="light"]. The choice is
// "system", "light" or "dark", kept in localStorage under the same key.
// Loaded in <head> without async, so it runs before first paint.
//
// Also:
// - ?theme=light|dark|system sets the choice (hotcfg.run's menu links pass it,
//   and localStorage is per origin, so status. doesn't see hotcfg.run's).
// - html[data-theme-pref] names the choice, so status.css can show its icon.
// - Clicks on [data-theme-toggle] cycle system -> light -> dark. The listener
//   is on document because the page re-renders the button when it loads.
(function () {
  var KEY = "hotcfg-theme";
  var NEXT = { system: "light", light: "dark", dark: "system" };
  var root = document.documentElement;
  var media = window.matchMedia ? window.matchMedia("(prefers-color-scheme: light)") : null;

  function read() {
    try {
      var v = localStorage.getItem(KEY);
      return v === "light" || v === "dark" ? v : "system";
    } catch (e) {
      return "system"; // storage blocked
    }
  }

  function save(p) {
    try {
      if (p === "system") localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, p);
    } catch (e) {
      /* storage blocked: the choice lasts until the page closes */
    }
  }

  var pref = read();
  try {
    var asked = new URLSearchParams(location.search).get("theme");
    if (asked && NEXT[asked]) {
      pref = asked;
      save(pref);
    }
  } catch (e) {
    /* old browser: ignore the parameter */
  }

  function apply() {
    var light = pref === "light" || (pref === "system" && !!media && media.matches);
    if (light) root.setAttribute("data-theme", "light");
    else root.removeAttribute("data-theme");
    root.setAttribute("data-theme-pref", pref);
  }
  apply();

  if (media) {
    var onSystemChange = function () {
      if (pref === "system") apply();
    };
    if (media.addEventListener) media.addEventListener("change", onSystemChange);
    else if (media.addListener) media.addListener(onSystemChange);
  }

  document.addEventListener("click", function (e) {
    var t = e.target;
    if (!t || !t.closest || !t.closest("[data-theme-toggle]")) return;
    pref = NEXT[pref];
    save(pref);
    apply();
  });
})();
