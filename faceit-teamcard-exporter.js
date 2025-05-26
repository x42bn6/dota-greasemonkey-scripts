// ==UserScript==
// @name     FACEIT TeamCard exporter
// @version  1
// @grant       none
// @include     https://*.faceit.com/*/teams/*
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
  
  function waitForText(selector) {
    return new Promise((resolve) => {
      const interval = setInterval(function () {
        const text = $(selector).text().trim();
        if (text !== '') {
          clearInterval(interval);
          resolve(text);
        }
      }, 1000);
    });
  }
  
  var selector = "h4[class*=\"styles__Nickname\"]";
  waitForEl(selector, function() {
    (async () => {
      var teamNameWithBrackets = await waitForText(selector);
      const removeBrackets = /^(.+)\(.*\)$/;
      console.log(teamNameWithBrackets.match(removeBrackets));
      var teamName = teamNameWithBrackets.match(removeBrackets)[1];
      var output = "";
      output += "{{box|break|padding=2em}}\n";
      output += "{{TeamCard|nostorage=true\n";
      output += "|team=" + teamName + "\n";
      output += "|ref=<ref>{{cite web|url=" + window.location.href + "|title=" + teamName + "|publisher=FACEIT}}</ref>\n";

      var i = 1;
      $("span[class*=\"styles__Name\"]").each(function() {
        output += "|p" + i + "flag=|p" + i + "=" + $(this).text() + "|p" + i+ "id=\n";
        i++;
      });
      output += "}}";

      $(selector).parent().append("<span id='candidate' style='cursor: pointer' title='Click to copy'>Click to copy candidate TeamCard</span>");

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
    })();
  });
});