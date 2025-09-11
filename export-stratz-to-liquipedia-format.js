// ==UserScript==
// @name        Export Stratz match to Liquipedia format
// @description Exports a match to Liquipedia format.  Useful when the Valve API goes down.
// @version     1
// @grant       none
// @include     https://stratz.com/matches/*
// @require     https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js
// ==/UserScript==
$(document).ready(function() {
  let waitForEl = function(selector, callback) {
    if ($(selector).length) {
      callback();
    } else {
      setTimeout(function() {
        waitForEl(selector, callback);
      }, 1000);
    }
  };
  
  let getOutput = function() {
    let mapNumber;
    let draft = [
      {
        side: "radiant",
        picks: [],
        bans: []
      },
      {
        side: "dire",
        picks: [],
        bans: []
      }
    ];
    let duration;
    let winner;
    
    mapNumber = $("a[role='menuitem'][data-selected=true] div span").text().split(" ")[1];
    
    let canonicalNameMap = {};
    canonicalNameMap["windrunner"] = "windranger";
    canonicalNameMap["nevermore"] = "shadow fiend";
    canonicalNameMap["obsidian destroyer"] = "outworld destroyer";
    canonicalNameMap["vengefulspirit"] = "vengeful spirit";
    canonicalNameMap["queenofpain"] = "queen of pain";
    canonicalNameMap["doom bringer"] = "doom";
    canonicalNameMap["shredder"] = "timbersaw";
    canonicalNameMap["necrolyte"] = "necrophos";
    canonicalNameMap["wisp"] = "io";
    canonicalNameMap["rattletrap"] = "clockwerk";
    canonicalNameMap["furion"] = "natures prophet";
    canonicalNameMap["antimage"] = "anti-mage";
    canonicalNameMap["zuus"] = "zeus";
    canonicalNameMap["skeleton king"] = "wraith king";
    canonicalNameMap["life stealer"] = "lifestealer";
    canonicalNameMap["magnataur"] = "magnus";
    canonicalNameMap["abyssal underlord"] = "underlord";
    canonicalNameMap["centaur"] = "centaur warrunner";

    let draftEl = $("span.hitagi__sc-6oal1n-0.bmpRUI").parent();
    let phases = $(draftEl.children("div")[0]).children("div");
    for (let i = 0; i < phases.length; i++) {
      let phaseType = $(phases[i]).children("span").text().split(" ")[0];
      let team1 = $(phases[i]).children("div")[0];
      let team2 = $(phases[i]).children("div")[1];
      let populateDraft = function(teamIndex, rows) {
        let imgTags = $(rows).find("img");
        imgTags.each(function() {
          let arr;
          if (phaseType === "Ban") {
            arr = draft[teamIndex].bans;
          } else {
            arr = draft[teamIndex].picks;
          }
          let src = $(this).attr("src");
          let srcSplit = src.split("/");
          let hero = srcSplit[srcSplit.length - 1].split("_icon")[0].replace("_", " ");
          if (canonicalNameMap[hero]) {
            hero = canonicalNameMap[hero];
          }
          arr.push(hero);
        });
      }
      populateDraft(0, team1);
      populateDraft(1, team2);
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
    duration = convertMatchDuration($("span.hitagi__sc-6oal1n-0.fbjXUW").text());
    
    let header = $("div.hitagi__sc-1ah81hi-0.hitagi__sc-f2pi9q-0.hitagi__sc-1qujzc6-1.jDLHDm.feqtbA.enFVqj")
    let containsWon = function(el) {
      let res = $("div", el).filter(function() { 
        return $(this).text().includes("Won");
      });
      return res.length > 0;
    }
    if (containsWon(header.children("div")[0])) {
      winner = 1;
    } else {
      winner = 2;
    }
    
    return {
      "mapNumber": mapNumber,
      "draft": draft,
      "duration": duration,
      "winner": winner
    };
  }
  
  let copyOutputToClipboard = function(flip) {
    let output = getOutput();
    let createOutputString = function(output, flip) {
      let s = "|map" + output.mapNumber + "={{Map\n";
      if (flip) {
        let newOutput = {
          "mapNumber": output.mapNumber,
          "draft": [
            {
              side: "dire",
              picks: output.draft[1].picks,
              bans: output.draft[1].bans
            },
            {
              side: "radiant",
              picks: output.draft[0].picks,
              bans: output.draft[0].bans
            }
          ],
          "duration": output.duration,
          "winner": (output.winner === 1 ? 2 : 1)
        };
        output = newOutput;
      }
      let outputRow = function(arr, prefix) {
        for (let i = 0; i < arr.length; i++) {
          s += "|" + prefix + (i + 1) + "=" + arr[i];
        }
        s += "\n";
      }
      s += "|team1side=" + output.draft[0].side + "\n";
      outputRow(output.draft[0].picks, "t1h");
      outputRow(output.draft[0].bans, "t1b");
      s += "|team2side=" + output.draft[1].side + "\n";
      outputRow(output.draft[1].picks, "t2h");
      outputRow(output.draft[1].bans, "t2b");

      s += "|length=" + output.duration + "|winner=" + output.winner + "\n}}";
      return s;
    }
    
    navigator.clipboard.writeText(createOutputString(output, flip));
  }
  
  let selector = "svg.recharts-surface";
  let doWork = function() {
    let teamA = $($("span.hitagi__sc-6oal1n-0.jwbyOL")[0]).text();
    let teamB = $($("span.hitagi__sc-6oal1n-0.jwbyOL")[1]).text();

    let normal = $("<a>", {
      html: "Copy Liquipedia output for <span style=\"color: #92A525;\">" + teamA + "</span> vs. <span style=\"color: #C23C2A;\">" + teamB + "</span> to clipboard",
      href: "#",
      click: function(event) {
        event.preventDefault();
        copyOutputToClipboard(false);
        $("#normalTick").show();
        $("#flippedTick").hide();
      }
    });
    let normalTick = $("<span>", {
      id: "normalTick",
      html: "✓"
    });

    let flipped = $("<a>", {
      html: "Copy Liquipedia output for <span style=\"color: #C23C2A;\">" + teamB + "</span> vs. <span style=\"color: #92A525;\">" + teamA + "</span> to clipboard",
      href: "#",
      click: function(event) {
        event.preventDefault();
        copyOutputToClipboard(true);
        $("#normalTick").hide();
        $("#flippedTick").show();
      }
    });
    let flippedTick = $("<span>", {
      id: "flippedTick",
      html: "✓"
    });
    normalTick.hide();
    flippedTick.hide();
    let container = $("<div style=\"text-align: center;\">").append(normal).append(" ").append(normalTick).append("<br/>").append(flipped).append(" ").append(flippedTick);

    let appendAfter = "div.hitagi__sc-1qujzc6-0.cRVawq";
    $(appendAfter).append(container);
  }
  
  waitForEl(selector, function() {
    doWork();
  }, 2000);
  waitForEl(selector, function() {
    $("a.hitagi__sc-10hnw33-0.hdkmIm[data-selected='true'] div span").click()
  }, 1000);
});