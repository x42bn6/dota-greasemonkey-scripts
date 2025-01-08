// ==UserScript==
// @name        Esportal TeamCard exporter
// @description Exports basic TeamCards from Esportal.
// @version     2
// @grant       none
// @include     https://esportal.com/*/team/*
// @require     https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js
// ==/UserScript==
$(document).ready(function() {
  var addIds = function(id64) {
    var id32 = Number(BigInt(id64) - BigInt("76561197960265728"));
    var secondComponent = BigInt(id64) % 2n;
    var steamIDText = id32 + "\n" + id64 + "\nSTEAM_0:" + secondComponent + ":" + Math.floor(id32/2);

    return "<div>" +
    			 "<span class='steam-id' style='font-size: 90%; cursor: pointer;' title='Click to copy'>" + id32 + "</span><br/>" +
           "<span class='steam-id' style='font-size: 90%; cursor: pointer;' title='Click to copy'>" + id64 + "</span><br/>" +
           "<span class='steam-id' style='font-size: 90%; cursor: pointer;' title='Click to copy'>" + "\nSTEAM_0:" + secondComponent + ":" + Math.floor(id32/2) + "</span>" +
      		 "</div>";
  };

  var waitForEl = function(selector, callback) {
    if ($(selector).length) {
      callback();
    } else {
      setTimeout(function() {
        waitForEl(selector, callback);
      }, 1000);
    }
  };
  
  var selector = "h2.sc-iGgWBj";
  waitForEl(selector, function() {
    var teamName = $("h2.sc-iGgWBj").text();
    var output = "";
    output += "{{box|break|padding=2em}}\n";
    output += "{{TeamCard|nostorage=true\n";
    output += "|team=" + teamName + "\n";
    output += "|ref=<ref>{{cite web|url=" + window.location.href + "|title=" + teamName + "|publisher=Esportal}}</ref>\n";
    
    var i = 1;
    $("div.sc-cYFnBh.hqByQu:first div.sc-dTci.bYJASH.StyledPlayerTableCell").each(function() {
      console.log($(this));
      var container = $(this).find("div.sc-iBpsyw.lmRjSJ").find("div.sc-dMdMQj.bCfBtY");
      var playerName = $(container).find("div.sc-gSpvol.bpSqjZ").find("a").text();
      console.log($(container).find("div.sc-gSpvol.bpSqjZ").find("a").text());
      var flagContainer = $(container).find("div.sc-ffZAAA.jqmlyd.flagIcon").find("span");
      if (flagContainer.length > 0) {
        var flag = flagContainer.attr("class").split(" ")[1].split("-")[1];
        output += "|p" + i + "flag=" + flag +"|p" + i + "=" + playerName + "|p" + i+ "id=\n";
        i++;
      }
  	});
    output += "}}";
    
    $("div.sc-bVHCgj.RsLAl").append("<span id='candidate' style='cursor: pointer' title='Click to copy'>Click to copy candidate TeamCard</span>");
    
    var lastClickedDiv = null;
    $(document).on('click', '#candidate', function() {
      navigator.clipboard.writeText(output).catch(function(err) {
        console.error('Error copying to clipboard: ', err);
      });
      
      if (lastClickedDiv) {
        lastClickedDiv.find('.tick').remove();
      }

      var tick = "<span class='tick' style='color: green; margin-left: 5px;'>✔</span>";
      $(this).append(tick);

      lastClickedDiv = $(this);
    });
  });
});
