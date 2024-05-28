// ==UserScript==
// @name        ChallengerMode ID shower
// @description On a player page, this script adds Steam IDs (ID32, ID64 and ID) beneath each player's name.  This is useful for verifying match IDs against rosters.
// @version     1
// @grant       none
// @include     https://www.challengermode.com/users/*
// @require     https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js
// ==/UserScript==
$(document).ready(function() {
  var addIds = function(id64) {
    var id32 = Number(id64.substr(-16,16)) - 6561197960265728;
    var secondComponent = BigInt(id64) % 2n;
    return "<div style=\"font-size: 75%;\">" + id32 + "<br/>" + id64 + "<br/>STEAM_0:" + secondComponent + ":" + Math.floor(id32/2) + "</div>";
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

  var selector = "span.ellipsis.dis--blk span a";
  waitForEl(selector, function() {
    $(selector).each(function() {
      var hrefSplit = $(this).attr("href").split("/");
      var id64 = hrefSplit[hrefSplit.length-1].split("-")[0];
      $(this).parent().parent().parent().append(addIds(id64));
    });
  });
});
