// ==UserScript==
// @name        Dotabuff ID shower
// @description On a match screen, this script adds Steam IDs (ID32, ID64 and ID) beneath each player's name.  This is useful for verifying match IDs against rosters.
// @version     1
// @grant       none
// @include     https://www.dotabuff.com/matches/*
// @require     https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js
// ==/UserScript==
$(document).ready(function() {
  var addIds = function(id32) {
    var id64 = BigInt("76561197960265728") + BigInt(id32);
    var secondComponent = id64 % 2n;
    return "<div style=\"font-size: 90%;\">" + id32 + "<br/>" + id64 + "<br/>STEAM_0:" + secondComponent + ":" + Math.floor(id32/2) + "</div>";
  }
  $("a.player-link span.player-text").each(function() {
    var hrefSplit = $(this).parent().attr("href").split("/");
    var id32 = hrefSplit[hrefSplit.length-1].split("-")[0];
    $(this).parent().parent().append(addIds(id32));
  });
  $("a.link-type-player").each(function() {
    var hrefSplit = $(this).attr("href").split("/");
    var id32 = hrefSplit[hrefSplit.length-1].split("-")[0];
    $(this).parent().append(addIds(id32));
  });
});
