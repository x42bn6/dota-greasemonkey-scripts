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
        winner = $(this).attr("class");
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
      minutes = parseInt(components[0]) * 60 + parseInt(components[1]);
      seconds = parseInt(components[2]).toString().padStart(2, '0');
    } else {
      minutes = parseInt(components[0]);
      seconds = parseInt(components[1]).toString().padStart(2, '0');
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
  if (flip) {
    if (winner === "radiant") {
      winnerIndex = 2;
    } else {
      winnerIndex = 1;
    }
  } else {
    if (winner === "radiant") {
      winnerIndex = 1;
    } else {
      winnerIndex = 2;
    }
  }
  s += "|winner=" + winnerIndex;
  s += "\n";
  s += "}}"

  navigator.clipboard.writeText(s);
}

$(document).ready(function() {
  var getTeams = function() {
    var teamA = "Radiant";
    var teamB = "Dire";
    var aOrB = 0;
    
    var teamSelector = function(side) {
      return "div.team-results > section." + side + " > header > a.team-link > span.team-text";
    }
    
    console.log($(teamSelector("dire")))
    if ($(teamSelector("radiant")).length > 0) {
      teamA = $(teamSelector("radiant")).text();
    }
    if ($(teamSelector("dire")).length > 0) {
      teamB = $(teamSelector("dire")).text();
    }
    
    return [ teamA, teamB ];
  }
  let teamA, teamB;
  [teamA, teamB] = getTeams();
  
  var normal = $("<a>", {
    class: "esports-team esports-link team-link",
    html: "Copy Liquipedia output for <span style=\"color: #92A525;\">" + teamA + "</span> vs. <span style=\"color: #C23C2A;\">" + teamB + "</span> to clipboard",
    href: "#",
    click: function(event) {
      event.preventDefault();
      generateOutput(false);
    }
  });
  
  var flipped = $("<a>", {
    class: "esports-team esports-link team-link",
    html: "Copy Liquipedia output for <span style=\"color: #C23C2A;\">" + teamB + "</span> vs. <span style=\"color: #92A525;\">" + teamA + "</span> to clipboard",
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
