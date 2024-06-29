// ==UserScript==
// @name        Export tweet to Liquipedia
// @description Exports a tweet to Liquipedia ref format
// @version     1
// @grant       none
// @include     https://x.com/*/status/*
// @require     https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js
// ==/UserScript==
$(document).ready(function() {
  var waitForEl = function(selector, callback) {
    if ($(selector).length) {
      callback();
    } else {
      setTimeout(function() {
        waitForEl(selector, callback);
      }, 1000);
    }
  };
  
  // Twitter does this stupid thing where the initial title is "X" then it renders...
  var waitForTitle = function(callback) {
    if ($("title").text() !== "X") {
      callback();
    } else {
      setTimeout(function() {
        waitForTitle(callback);
      }, 1000);
    }
  };
  
  waitForTitle(function() {
    var title = $("title").text();
    var components = title.split(" on X: ");
    
    var username = components[0];
    
    var tweet = components[1].split(" / X")[0];
    tweet = tweet.substring(1, tweet.length - 1);
    // If tweet contains media, remove it
    var tweetSplit = tweet.split(" ");
    if (tweetSplit[tweetSplit.length - 1].startsWith("https://t.co")) {
      tweetSplit = tweetSplit.slice(0, -1);
      tweet = tweetSplit.join(" ");
    }
    
    waitForEl("time", function() {
      var date = $("time").attr("datetime").substring(0, 10);
      var ref = "<ref>{{cite web|url=" + window.location.href + "|title=" + tweet + "|author=" + username + "|date=" + date + "}}</ref>";

      var copy = $("<a>", {
        html: "Copy as Liquipedia ref to clipboard",
        class: "css-1jxf684 r-bcqeeo r-1ttztb7 r-qvutc0 r-poiln3 r-xoduu5 r-1q142lx r-1w6e6rj r-9aw3ui r-3s2u2q r-1loqt21",
        style: "text-overflow: unset; color: rgb(192, 192, 192); font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif;",
        href: "#",
        click: function(event) {
          event.preventDefault();
          navigator.clipboard.writeText(ref);
        }
      });
      var surround = copy.wrap("<div class=\"css-146c3p1 r-bcqeeo r-1ttztb7 r-qvutc0 r-1qd0xha r-a023e6 r-rjixqe r-16dba41\"></div>");
      $("article[tabindex=\"-1\"] time").parent().parent().parent().append(" · ").append(surround);
    });
  });
});
