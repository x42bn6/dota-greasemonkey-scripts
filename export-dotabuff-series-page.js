// ==UserScript==
// @name        Export Dotabuff match to Liquipedia format (from series page)
// @description Exports data Liquipedia format.  Useful when the Valve API goes down.
// @version     1
// @grant       none
// @include     https://www.dotabuff.com/esports/series/*
// @require     https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js
// ==/UserScript==
const Team = {
  A: 0,
  B: 1,
  NOBODY: 2
};

const Direction = {
  A_VS_B: 0,
  B_VS_A: 1
};

class Map {
  constructor(mapNumber, isLive, matchId, duration, winner, teamA, teamB, factionA, factionB, picksA, picksB, bansA, bansB) {
    this.mapNumber = mapNumber;
    this.isLive = isLive;
    this.matchId = matchId;
    this.duration = duration;
    this.winner = winner;
    this.teamA = teamA;
    this.teamB = teamB;
    this.factionA = factionA;
    this.factionB = factionB;
    this.picksA = picksA;
    this.picksB = picksB;
    this.bansA = bansA;
    this.bansB = bansB;
  }
  
  getMapDuration() {
    if (this.duration === "") {
      return "";
    }
    var minutes = -1;
    var seconds = -1;
    var components = this.duration.split(":");
    if (components.length === 3) {
      minutes = parseInt(components[0]) * 60 + parseInt(components[1]);
      seconds = parseInt(components[2]).toString().padStart(2, '0');
    } else {
      minutes = parseInt(components[0]);
      seconds = parseInt(components[1]).toString().padStart(2, '0');
    }
    return minutes + "m" + seconds + "s";
  }
}

class Series {
  constructor(seriesStartTime, maps) {
    this.seriesStartTime = seriesStartTime;
    this.maps = maps;
  }
  
  getSeriesStartTime() {
    const date = this.seriesStartTime;
    const options = { month: "long" };
    const month = new Intl.DateTimeFormat("en-US", options).format(date);
    const dd = String(date.getDate()).padStart(2, "0");
    const yyyy = date.getFullYear();
    const hh = String(date.getHours()).padStart(2, "0");
    const mm = String(date.getMinutes()).padStart(2, "0");

    const formatted = `${month} ${dd}, ${yyyy} - ${hh}:${mm}`;
    return formatted;
  }
  
  getLiquipediaMapInput(mapNumber, direction) {
    const map = this.maps[mapNumber];
    let normalisedMap;
    if (direction === Direction.A_VS_B) {
      normalisedMap = {
        mapNumber: map.mapNumber,
        isLive: map.isLive,
        matchId: map.matchId,
        duration: map.getMapDuration(),
        winner: map.winner + 1,
        teamA: map.teamA,
        teamB: map.teamB,
        factionA: map.factionA,
        factionB: map.factionB,
        picksA: map.picksA.concat(Array(7 - map.picksA.length).fill("")),
        picksB: map.picksB.concat(Array(7 - map.picksB.length).fill("")),
        bansA: map.bansA.concat(Array(7 - map.bansA.length).fill("")),
        bansB: map.bansB.concat(Array(7 - map.bansB.length).fill(""))
      };
    } else if (direction === Direction.B_VS_A) {
      normalisedMap = {
        mapNumber: map.mapNumber,
        isLive: map.isLive,
        matchId: map.matchId,
        duration: map.getMapDuration(),
        winner: 1 - map.winner + 1,
        teamA: map.teamB,
        teamB: map.teamA,
        factionA: map.factionB,
        factionB: map.factionA,
        picksA: map.picksB.concat(Array(7 - map.picksB.length).fill("")),
        picksB: map.picksA.concat(Array(7 - map.picksA.length).fill("")),
        bansA: map.bansB.concat(Array(7 - map.bansB.length).fill("")),
        bansB: map.bansA.concat(Array(7 - map.bansA.length).fill(""))
      };
    } else {
      throw new Error("Invalid direction " + direction);
    }
    
    if (normalisedMap.isLive) {
      normalisedMap.winner = "";
    }
    
    let output = `|map${normalisedMap.mapNumber}={{Map
|team1side=${normalisedMap.factionA}
|t1h1=${normalisedMap.picksA[0]}|t1h2=${normalisedMap.picksA[1]}|t1h3=${normalisedMap.picksA[2]}|t1h4=${normalisedMap.picksA[3]}|t1h5=${normalisedMap.picksA[4]}
|t1b1=${normalisedMap.bansA[0]}|t1b2=${normalisedMap.bansA[1]}|t1b3=${normalisedMap.bansA[2]}|t1b4=${normalisedMap.bansA[3]}|t1b5=${normalisedMap.bansA[4]}|t1b6=${normalisedMap.bansA[5]}|t1b7=${normalisedMap.bansA[6]}
|team2side=${normalisedMap.factionB}
|t2h1=${normalisedMap.picksB[0]}|t2h2=${normalisedMap.picksB[1]}|t2h3=${normalisedMap.picksB[2]}|t2h4=${normalisedMap.picksB[3]}|t2h5=${normalisedMap.picksB[4]}
|t2b1=${normalisedMap.bansB[0]}|t2b2=${normalisedMap.bansB[1]}|t2b3=${normalisedMap.bansB[2]}|t2b4=${normalisedMap.bansB[3]}|t2b5=${normalisedMap.bansB[4]}|t2b6=${normalisedMap.bansB[5]}|t2b7=${normalisedMap.bansB[6]}
|length=${normalisedMap.duration}|winner=${normalisedMap.winner}
}}`
    return output;
  }
}

let processSeries = function() {
  const teamA = $("div.sm\\:tw-text-lg").eq(0).children("a").eq(0).text();
  const teamB = $("div.sm\\:tw-text-lg").eq(1).children("a").eq(0).text();
  
  const maps = [];
  
  // Completed matches
  $("div.odd\\:tw-bg-black\\/10").each(function() {
    const mapNumber = $(this).children("div").eq(0).children("div").eq(0).children("div").eq(0).text().split("#")[1];
    const matchId = $(this).children("div").eq(0).children("div").eq(0).children("div").eq(1).children("a").text();
    const duration = $(this).children("div").eq(0).children("div").eq(0).children("div").eq(2).children("div").eq(0).children("div").eq(0).text();
    
    // Side A
    let winner;
    let factionA, factionB;
    const picksA = [];
    const bansA = [];
    $(this).children("div").eq(2).children("div.tw-items-start").eq(0).each(function() {
      if ($(this).find("svg").length) {
        winner = Team.A;
      } else {
        winner = Team.B;
      }

      if ($(this).find("span.tw-text-faction-radiant").length) {
        factionA = "radiant";
        factionB = "dire";
      } else {
        factionA = "dire";
        factionB = "radiant";
      }
      
      $(this).children("div").eq(1).find("img").each(function() {
        picksA.push($(this).attr("alt").toLowerCase());
      });
      
      $(this).children("div").eq(2).find("img").each(function() {
        bansA.push($(this).attr("alt").toLowerCase());
      });
    });
    
    // Side B
    const picksB = [];
    const bansB = [];
    $(this).children("div").eq(2).children("div.tw-items-end").eq(0).each(function() {
      $(this).children("div").eq(1).find("img").each(function() {
        picksB.push($(this).attr("alt").toLowerCase());
      });
      
      $(this).children("div").eq(2).find("img").each(function() {
        bansB.push($(this).attr("alt").toLowerCase());
      });
    });
    
    if (typeof mapNumber !== 'undefined') {
      maps.push(new Map(mapNumber, false, matchId, duration, winner, teamA, teamB, factionA, factionB, picksA, picksB, bansA, bansB));
    }
  });
  
  // Live series
  $("div").filter(function() {
    return $(this).children().length === 0 && $(this).text() === "Live Status";
  }).parent().parent().parent().children("div").eq(1).children("div").eq(0).each(function() {
    const mapNumber = $(this).children("div").eq(0).children("div").eq(0).children("div").eq(0).children("div").eq(0).text().split("#")[1];
    // For some reason, this isn't available on this page.  It can only be seen on the league page...
    const matchId = "";
    const duration = "";
    const winner = Team.NOBODY;
    
    // Don't ask me why this has a completely different structure
    // Side A
    const picksA = [];
    const bansA = [];
    let factionA;
    let factionB;
    $(this).children("div").eq(1).children("div").eq(0).each(function() {
      $(this).children("div").eq(1).children("div").eq(0).find("img").each(function() {
        picksA.push($(this).attr("alt").toLowerCase());
      });
      
      $(this).children("div").eq(1).children("div").eq(1).find("img").each(function() {
        bansA.push($(this).attr("alt").toLowerCase());
      });
      
      if ($(this).children("div").eq(0).find("span.tw-text-faction-radiant").length) {
        factionA = "radiant";
        factionB = "dire";
      } else {
        factionA = "dire";
        factionB = "radiant";
      }
    });
    
    // Side B
    const picksB = [];
    const bansB = [];
    $(this).children("div").eq(1).children("div").eq(1).children("div").eq(1).each(function() {
      $(this).children("div").eq(0).find("img").each(function() {
        picksB.push($(this).attr("alt").toLowerCase());
      });
      
      $(this).children("div").eq(1).find("img").each(function() {
        bansB.push($(this).attr("alt").toLowerCase());
      });
    });
    
    maps.push(new Map(mapNumber, true, matchId, duration, winner, teamA, teamB, factionA, factionB, picksA, picksB, bansA, bansB));
  });
  
  return new Series(new Date($("div.sm\\:tw-text-sm").eq(1).text().split("Started on ")[1] + " 2025"), maps);
}

let copyToClipboard = function(s) {
  navigator.clipboard.writeText(s);
}

let createCopyMatchIdButton = function(series, mapNumber, id) {
  return $("<a>", {
    class: "",
    html: "??",
    href: "#",
    click: function(event) {
      event.preventDefault();
      copyToClipboard(series.maps[mapNumber].matchId);
      $(".x42bn6-tick").hide();
      $("#" + id).show();
    }
  });
}

let getFormattedTeamName = function(map, team) {
  let output;
  if (team === Team.A) {
  	output = "<span class=\"tw-text-faction-" + map.factionA.toLowerCase() + "\">" + map.teamA;
    if (map.winner === Team.A) {
      output += "<i class=\"fa fa-trophy\"></i>";
    }
  } else if (team === Team.B) {
    output = "<span class=\"tw-text-faction-" + map.factionB.toLowerCase() + "\">" + map.teamB;
    if (map.winner === Team.B) {
      output += "<i class=\"fa fa-trophy\"></i>";
    }
  } else {
    throw new Error("Invalid team " + team);
  }
  
  return output + "</span>";
}

let createCopyMatchAVsBButton = function(series, mapNumber, id) {
  return $("<a>", {
    class: "",
    html: getFormattedTeamName(series.maps[mapNumber], Team.A) + " vs. " + getFormattedTeamName(series.maps[mapNumber], Team.B) + "??",
    href: "#",
    click: function(event) {
      event.preventDefault();
      copyToClipboard(series.getLiquipediaMapInput(mapNumber, Direction.A_VS_B));
      $(".x42bn6-tick").hide();
      $("#" + id).show();
    }
  });
}

let createCopyMatchBVsAButton = function(series, mapNumber, id) {
  return $("<a>", {
    class: "",
    html: getFormattedTeamName(series.maps[mapNumber], Team.B) + " vs. " + getFormattedTeamName(series.maps[mapNumber], Team.A) + "??",
    href: "#",
    click: function(event) {
      event.preventDefault();
      copyToClipboard(series.getLiquipediaMapInput(mapNumber, Direction.B_VS_A));
      $(".x42bn6-tick").hide();
      $("#" + id).show();
    }
  });
}

let createTick = function(id) {
  return $("<span>", {
    id: id,
    class: "x42bn6-tick",
    html: "?"
  });
}

$(document).ready(function() {
  const series = processSeries();
  // Something is mutating the DOM and I can't figure out what.  If we don't delay, these mutations are removed
  setTimeout(function () {
    for (let i = 0; i < series.maps.length; i++) {
      if (series.maps[i].isLive) {
        $("div").filter(function() {
          return $(this).children().length === 0 && $(this).text() === "Live Status";
        }).parent().parent().parent().children("div").eq(1).children("div").eq(0).children("div").eq(0).each(function() {
          const container = $("<div>");
          
          const containerMatchIdNote = $("<div>");
          containerMatchIdNote.append($("<a>", {
            href: $("a").filter(function() {
              return $(this).attr("href").startsWith("/esports/leagues") && $(this).attr("data-state") === "closed";
            }).attr("href"),
            html: "Match ID available on the league page."
          }));
          container.append(containerMatchIdNote);
          
          const containerAVsB = $("<div>");
          containerAVsB.append(createCopyMatchAVsBButton(series, i, "copyMatchAVsB-" + i));
          containerAVsB.append(createTick("copyMatchAVsB-" + i));
          container.append(containerAVsB);
          
          const containerBVsA = $("<div>");
          containerBVsA.append(createCopyMatchBVsAButton(series, i, "copyMatchBVsA-" + i));
          containerBVsA.append(createTick("copyMatchBVsA-" + i));
          container.append(containerBVsA);
          $(this).append(container);
        });
      } else {
        // Copy match ID
        $("div.odd\\:tw-bg-black\\/10").eq(i).children("div").eq(0).children("div").eq(0).children("div").eq(1).each(function() {
          $(this).append(createCopyMatchIdButton(series, i, "copyMatchId-" + i));
          $(this).append(createTick("copyMatchId-" + i));
        });

        // Copy match
        $("div.odd\\:tw-bg-black\\/10").eq(i).children("div").eq(0).children("div").eq(0).each(function() {
          const container = $("<div>");
          const containerAVsB = $("<div>");
          const containerBVsA = $("<div>");
          containerAVsB.append(createCopyMatchAVsBButton(series, i, "copyMatchAVsB-" + i));
          containerAVsB.append(createTick("copyMatchAVsB-" + i));
          containerBVsA.append(createCopyMatchBVsAButton(series, i, "copyMatchBVsA-" + i));
          containerBVsA.append(createTick("copyMatchBVsA-" + i));
          container.append(containerAVsB);
          container.append(containerBVsA);
          $(this).append(container);
        });
      }
    }
    
    // Hide all ticks
    $(".x42bn6-tick").hide();
  }, 1000);
});