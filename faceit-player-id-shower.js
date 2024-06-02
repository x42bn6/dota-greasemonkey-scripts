// ==UserScript==
// @name        FACEIT ID shower
// @description On a FACEIT player profile page, this script shows the player IDs (ID32, ID64 and ID) next to the Steam profile link.  However, since FACEIT's site is absolutely garbage for Greasemonkey, if you navigate from a team or bracket page to the player's profile, you will need to refresh the page.  This is also very prone to breaking, since again, FACEIT's site is garbage, and uses hard-coded, generated HTML element IDs, so this needs changing every now and then.
// @version     1
// @grant       none
// @include     https://www.faceit.com/*/players/*
// @include     https://www.faceit.com/*/players-modal/*
// @require     https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js
// ==/UserScript==
$(document).ready(function() {
  // Check if the URL path contains only four levels
  if (window.location.pathname.split('/').length !== 4) {
    return;
  }
  
  var waitForEl = function(selector, callback) {
    if ($(selector).length) {
      callback();
    } else {
      setTimeout(function() {
        waitForEl(selector, callback);
      }, 1000);
    }
  };

  // This bit is by far the most prone to change.  If this script doesn't work, try changing this.
  // In Firefox, right-click the Steam icon on the player's page, and go to Inspect.  Look for the element whose href attribute is to the Steam profile.
  var selector = "a[href*=\"http://steamcommunity.com\"]";
  waitForEl(selector, function() {
    var addIds = function(id64) {
      var id32 = Number(BigInt(id64) - BigInt("76561197960265728"));
      var secondComponent = BigInt(id64) % 2n;
      return "<div style=\"font-size: 90%;\">" + id32 + "<br/>" + id64 + "<br/>STEAM_0:" + secondComponent + ":" + Math.floor(id32/2) + "</div>";
    }
    $(selector).each(function() {
      var hrefSplit = $(this).attr("href").split("/");
      var id64 = hrefSplit[hrefSplit.length-1];
      var append = addIds(id64);
      console.log(append);
      $(this).parent().append(append);
    });
  });
});
