// ==UserScript==
// @name     		Copy links element to bottom
// @description	Copies the links element to the bottom-right of the screen
// @version  		1
// @grant    		none
// @include     https://liquipedia.net/*/*
// @include     https://liquipedia.net/*/*
// ==/UserScript==
(function() {
  "use strict";
  
  function getNormalisedPath() {
    return window.location.pathname.replace(/\/$/, "");
  }
  
  function isIndexPhp(path) {
    // If the last element is "index.php", don't use this
    const pathSplit = path.split("/");
    if (pathSplit[pathSplit.length - 1] === "index.php") {
      console.log("Skipping index.php");
      return true;
    }
    
    return false;
  }
  
  function findInheritedPanelHTML() {
    let path = getNormalisedPath();
    console.log(`Retrieving from ${path}`);
    if (isIndexPhp(path)) {
      return null;
    }

    while (path.length > 0) {
      const key = `wiki:panel:${path}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        return stored;
      }
      
      path = path.substring(0, path.lastIndexOf("/"));
    }

    return null;
  }

  
  document.addEventListener("DOMContentLoaded", () => {
    const el = document.querySelector("div.infobox-icons");
    if (el) {
      const clone = el.cloneNode(true);
      clone.style.position = "fixed";
      clone.style.width = "auto";
      clone.style.bottom = "0";
      clone.style.right = "0";
      clone.style.zIndex = "1000";
      clone.style.backgroundColor = "var(--clr-background)";
      clone.style.border = "1px solid var(--clr-on-background)";
      clone.style.padding = "5px";
      
      clone.querySelectorAll("i").forEach(icon => {
        // Icons have a 3px margin; remove this as it looks weird when copied
        icon.style.marginTop = "0";
      });
      
      el.parentElement.appendChild(clone);
    
			// Show the icons if it is an index.php path (e.g. looking at a revision from a page's history), but don't save it to localStorage
      const normalisedPath = getNormalisedPath();
      if (isIndexPhp(normalisedPath)) {
        return null;
      }
      const key = `wiki:panel:${normalisedPath}`;
      localStorage.setItem(key, clone.outerHTML);
    } else {
      const html = findInheritedPanelHTML();

      if (html) {
        const wrapper = document.createElement("div");
        wrapper.innerHTML = html;
        const panel = wrapper.firstElementChild;
        document.body.appendChild(panel);
      }
    }
  });
})();