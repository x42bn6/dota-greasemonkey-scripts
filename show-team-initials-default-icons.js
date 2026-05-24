// ==UserScript==
// @name     Show team initials on default icons on Liquipedia
// @version  1
// @grant    none
// @include     https://liquipedia.net/*/*
// ==/UserScript==
(function() {
  "use strict";
  
  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("table.crosstable img[src$=\"default_allmode.png\"]").forEach(el => {
      console.log(el);
      const teamName = el.alt
        .split(" ")
        .map(word => word[0])
        .join("");
      el.parentElement.parentElement.parentElement.parentElement.appendChild(document.createElement("br"));
      const teamNameEl = document.createElement("span");
      teamNameEl.textContent = teamName;
      teamNameEl.style.fontWeight = "normal";
      teamNameEl.style.fontSize = "smaller";
      el.parentElement.parentElement.parentElement.parentElement.appendChild(teamNameEl);
    });
  });
})();