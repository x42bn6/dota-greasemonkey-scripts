// ==UserScript==
// @name        Export Dotabuff match to Liquipedia format
// @description Exports a match to Liquipedia format.  Useful when the Valve API goes down.
// @version     1
// @grant       none
// @include     https://www.dotabuff.com/matches/*
// @require     https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js
// ==/UserScript==
var generateOutput = function(flip) {
  var s = "|map1={{Map\n";
  var i = 0;
  var sides = [];
  var winner = 0;
  var teamIndex = 1;
  var pickIndex = 1;
  var banIndex = 1;
  $("section").each(function() {
    var clazz = $(this).attr("class")
    if (clazz === "radiant" || clazz === "dire") {
      sides.push(clazz);
      if ($(this).find("header span.victory-icon")[0]) {
        winner = sides.length;
      }
    }
  });

  var generateDraft = function(n, side, winner) {
    var output = ""
    var picks = [];
    var bans = [];
    $("div.picks-inline:eq(" + n + ") div div div a[href^='/heroes/'] img[src^='/assets/']").each(function() {
      var ban = $(this).parent().parent().parent().parent().attr("class") === "ban";
      var hero = $(this).attr("alt").toLowerCase();
      if (ban) {
        bans.push(hero);
      } else {
        picks.push(hero);
      }
    });

    return { side, picks, bans, winner };
  }

  var convertMatchDuration = function(duration) {
    var minutes = -1;
    var seconds = -1;
    var components = duration.split(":");
    if (components.length === 3) {
      minutes = parseInt(components[0] * 60 + components[1]);
      seconds = parseInt(components[2]);
    } else {
      minutes = parseInt(components[0]);
      seconds = parseInt(components[1]);
    }
    return minutes + "m" + seconds + "s";
  }

  var outputTop = generateDraft(0, sides[0], winner === sides[0]);
  var outputBottom = generateDraft(1, sides[1], winner === sides[1]);
  var generateDraftOutput = function(n, draft) {
    var output = "|team" + n + "side=" + draft.side;
    output += "\n";
    for (var j = 0; j < draft.picks.length; j++) {
      output += "|t" + n + "h" + (j + 1) + "=" + draft.picks[j];
    }
    
    // Sometimes there's no bans...
    if (draft.bans.length > 0) {
	    output += "\n";
      for (var j = 0; j < draft.bans.length; j++) {
        output += "|t" + n + "b" + (j + 1) + "=" + draft.bans[j];
      }
    }
    return output;
  }

  if (flip) {
    s += generateDraftOutput(1, outputBottom);
  } else {
    s += generateDraftOutput(1, outputTop);
  }
  s += "\n";
  if (flip) {
    s += generateDraftOutput(2, outputTop);
  } else {
    s += generateDraftOutput(2, outputBottom);
  }
  s += "\n";
  s += "|length=" + convertMatchDuration($("div.match-victory-subtitle span.duration").text());
  s += "|winner=" + (flip ? (winner === "1" ? "2" : "1") : winner);
  s += "\n";
  s += "}}"

  navigator.clipboard.writeText(s);
}

$(document).ready(function() {
  var getTeams = function() {
    var teamA = "Radiant";
    var teamB = "Dire";
    var aOrB = 0;
    var teamNameSelector = function(n) {
      return "section header a span.team-text-full:eq(" + n + ")";
    }
    if ($(teamNameSelector(0))) {
      teamA = $(teamNameSelector(0)).text()
    }
    if ($(teamNameSelector(1))) {
      teamB = $(teamNameSelector(1)).text()
    }
    return [ teamA, teamB ];
  }
  let teamA, teamB;
  [teamA, teamB] = getTeams();
  
  var normal = $("<a>", {
    class: "esports-team esports-link team-link",
    text: "Copy Liquipedia output for " + teamA + " vs. " + teamB + " to clipboard",
    href: "#",
    click: function(event) {
      event.preventDefault();
      generateOutput(false);
    }
  });
  
  var flipped = $("<a>", {
    class: "esports-team esports-link team-link",
    text: "Copy Liquipedia output for " + teamB + " vs. " + teamA + " to clipboard",
    href: "#",
    click: function(event) {
      event.preventDefault();
      generateOutput(true);
    }
  });
  
  $("div.header-content-title").append(normal);
  $("div.header-content-title").append("<br/>");
  $("div.header-content-title").append(flipped);
});
