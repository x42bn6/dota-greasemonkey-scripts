// ==UserScript==
// @name     		Move TeamParticipants label to bottom
// @description	Provide more space for team name
// @version  		1
// @grant    		none
// @include     https://liquipedia.net/*/*
// ==/UserScript==
(function() {
  "use strict";
  
  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("div.team-participant-card").forEach(el => {
      const label = el.querySelectorAll("div.team-participant-card__label");
      const qualifier = el.querySelectorAll("div.team-participant-card__qualifier");
      console.log(qualifier);
      if (qualifier.length > 0) {
        // If there is a qualifier tournament, move it to the bottom, and don't bother showing the label (e.g. "Qualifier")
        label.forEach(el2 => {
          el2.remove();
        });
        qualifier.forEach(el2 => {
          el.append(el2);
        });
      } else {
        // Else just move the label
        label.forEach(el2 => {
          el.append(el2);
        });
      }
    });
  });
})();