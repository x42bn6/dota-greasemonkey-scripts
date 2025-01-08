// ==UserScript==
// @name        Esportal ID shower
// @description On a player page, this script adds Steam IDs (ID32, ID64, and ID) beneath each player's name. This is useful for verifying match IDs against rosters.
// @version     2
// @grant       none
// @include     https://esportal.com/*/profile/*
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
  
  var selector = "a.sc-jvFFNA.bufjTN";
  waitForEl(selector, function() {
    // Append the IDs to the match player entries
    $("a.sc-jvFFNA.bufjTN").each(function() {
      var hrefSplit = $(this).attr("href").split("/");
      var id32 = hrefSplit[hrefSplit.length - 1].split("-")[0];
      $(this).parent().append(addIds(id32));
    });

    var lastClickedDiv = null;

    $(document).on('click', '.steam-id', function() {
      var content = $(this).clone()
        .find('.tick').remove()
        .end()
        .text();

      navigator.clipboard.writeText(content).catch(function(err) {
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
