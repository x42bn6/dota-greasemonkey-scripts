// ==UserScript==
// @name        Copy match ID for in-progress match
// @description At some point in 2024, Dotabuff stopped using its defunct Trackdota site.  But this means that for live matches, clicking the live link (blue circle) no longer takes you to a page where you can copy the match ID from the URL.  This script instead changes it such that clicking the live link copies the match ID to the clipboard.
// @version     1
// @grant       none
// @include     https://www.dotabuff.com/esports/leagues/*
// @require     https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js
// ==/UserScript==
$(document).ready(function() {
  $("span.icon.live span").css("cursor", "pointer")
  $("span.icon.live span").attr("title", "Click to copy match ID")
  $("span.icon.live span[rel='tooltip']").click(function() {
    var c = $(this).attr("oldtitle").split(" ");
    var matchId = c[c.length - 1];
    navigator.clipboard.writeText(matchId);
    $(this).text("✔")
  });
});
