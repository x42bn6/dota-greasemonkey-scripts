// ==UserScript==
// @name     		Backup Liquipedia edit
// @description	When submitting an edit to Liquipedia, this stores the contents of that edit to localStorage (under the key "x42bn6.lastEditContent").  This also adds a button to the toolbar to restore the contents of the save to the clipboard.  This means that if, say, Liquipedia goes down, or your Internet goes down, the contents of your last save can be retrieved.  Note that this is one value across all wikis, and it only stores the last edit.
// @version  		1
// @grant    		none
// @include     https://liquipedia.net/*/*&action=edit*
// @include     https://liquipedia.net/*/*&action=submit*
// ==/UserScript==
(function() {
  "use strict";
  
  document.addEventListener("DOMContentLoaded", () => {
    function waitForEl(selector, callback) {
      if (document.querySelector(selector)) {
        callback();
      } else {
        setTimeout(function() {
          waitForEl(selector, callback);
        }, 1000);
      }
    };

    waitForEl(".CodeMirror", () => {
      const ta = document.getElementsByTagName("textarea")[0];
      const targetForm = document.getElementById("editform");
      const saveText = function(e) {
        if (e.target === targetForm) {
          localStorage.setItem("x42bn6.lastEditContent", ta.value);
        }
      }
      // Listen to *all* submit events.  Due to event bubbling, this is executed last - this allows us to get the textarea's value after CodeMirror sets it.
      document.body.addEventListener("submit", saveText);

      waitForEl("#wikiEditor-section-advanced", () => {
        const restoreFromLocalStorageDiv = document.createElement("div");
        restoreFromLocalStorageDiv.className = "group";

        const restoreFromLocalStorageA = document.createElement("a");
        restoreFromLocalStorageA.className = "label skin-invert";
        restoreFromLocalStorageA.href = "#";
        restoreFromLocalStorageA.text = "Restore last submitted edit to clipboard";
        restoreFromLocalStorageA.style = "cursor: pointer;";
        restoreFromLocalStorageA.onclick = () => {
          navigator.clipboard.writeText(localStorage.getItem("x42bn6.lastEditContent"));
          alert("Restored last submitted edit to clipboard");
        }

        restoreFromLocalStorageDiv.appendChild(restoreFromLocalStorageA);
        document.getElementById("wikiEditor-section-advanced").appendChild(restoreFromLocalStorageDiv);
      });
    });
  });
})();