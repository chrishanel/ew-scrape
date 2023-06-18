var scrapeEpisodeData=function(){

    function straightenQuotes(s) {
        return s.replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"');
    }

    function wikify(node) {
        // Make a copy so we can fiddle with it
        var copy = node.cloneNode(true);
        // Wikify all the links
        $(copy).find('a').each(function (index) {
            if (this.href.startsWith("https://www.fangraphs.com/players/") ||
                this.href.startsWith("http://www.fangraphs.com/statss.aspx?playerid=")) {
                this.insertAdjacentText("beforebegin", "[[");
                this.insertAdjacentText("afterend", "]]");
            } else {
                this.insertAdjacentText("beforebegin", "[" + this.href + " ");
                this.insertAdjacentText("afterend", "]");
            }
        });

        // Preserve italics
        $(copy).find('em').each(function (index) {
            this.insertAdjacentText("beforebegin", "''");
            this.insertAdjacentText("afterend", "''");
        });
        var result = straightenQuotes($(copy).text());
        result = result.replace(/']]/g, "]]'");

        // Convert intrawiki links
        result = result.replace(/\[https:\/\/effectivelywild\.fandom\.com\/wiki\/(\S+) (.*)\]/g,
            function (_, p1, p2) {
                p1 = p1.replaceAll('_', ' ');
                return "[[" + p1 + "|" + p2 + "]]";
            });

       // Convert Wikipedia links
        result = result.replace(/\[https:\/\/en\.wikipedia\.org\/wiki\/(\S+) (.*)\]/g,
            function (_, p1, p2) {
                p1 = p1.replaceAll('_', ' ');
                return "{{W|" + p1 + "|" + p2 + "}}";
            });

        return result;
    }

    let linkCollect = new Array;
    let descriptionCollect = new String;
    let audioIntro = new String;
    let audioIntroLink = new String;
    let audioOutro = new String;
    let audioOutroLink = new String;
    let audioInter = new Array;
    let audioInterLinks = new Array;
    let episodeTitle = new String;
    let episodeDate = new String;
    let clipboardText = new String;
    let directLink = new String;
    let hosts = new String;

    //get episode Date
    let dateDiv = $('.postmeta').find('div').last();
    episodeDate = dateDiv.text();
    console.log(episodeDate);

    //episode link
    let titleDiv = $('.posttitle').first();
    episodeTitle = straightenQuotes(titleDiv.text());
    let epLinkText = "*[" + window.location.href + " " + episodeTitle + "]\n"
    linkCollect.push(epLinkText);
    
    episodeTitle = episodeTitle.replace("Effectively Wild Episode", "Episode");
    let epNumber = episodeTitle.substring(episodeTitle.indexOf("Episode") + 8, episodeTitle.indexOf(":"));

    //direct download to mp3
    directLink = $('.powerpress_link_d').attr('href');

    //cycle through post and grab data we care about
    $('.fullpostentry').children('p').each(function( index ) {
      let textChecker = $(this).text();

      if (index == 0 ) {
        let descriptRaw = wikify(this);
        if (descriptRaw.startsWith("\n", 0)) {
          descriptRaw = descriptRaw.substring(1);
        }
        descriptRaw = descriptRaw.replace(/\((\d+:[\d:]+)\)/g, function (match, time) { return "({{tcl|tc=" + time + "}})"; });
        descriptionCollect = descriptRaw;

        if (descriptRaw.startsWith("Ben Lindbergh and Meg Rowley")) {
            // Alternate the order of the hosts
            if (epNumber % 2 == 0) {
                hosts = "[[Ben Lindbergh]]<br>[[Meg Rowley]]";
            } else {
                hosts = "[[Meg Rowley]]<br>[[Ben Lindbergh]]";
            }
        }
      }

      else if (textChecker.startsWith("Link", 1) || textChecker.startsWith("Link", 0)) {
        let lines = wikify(this).split("\n");
        lines.forEach(function(line) {
            line && linkCollect.push("*" + line + "\n");
        });
      }

      else if ( textChecker.startsWith("Audio", 0)) {
        let text = wikify(this);
        let lines = text.split("\n");
        lines.every(function(line) {
            var lower = line.toLowerCase();
            var data = line.substring(line.indexOf(":") + 2);
            if (lower.includes("intro")) {
              audioIntro = data;
            }
            //outro is always last one
            else if (lower.includes("outro")) {
              audioOutro = data;
              // stop processing after this
              return false;
            } else if (lower) {
              audioInter.push(data);
            }
            return true;
        });
      }
    });

    clipboardText = "__NOTOC__";
    clipboardText += "{{Episode Infobox\n\n";
    clipboardText += "| epnumber=" + epNumber + "\n\n";
    clipboardText += "| title1=" + episodeTitle + "\n\n";
    clipboardText += "| infopage=" + window.location.href + "\n\n";
    clipboardText += "| mp3download=" + directLink + "\n\n";
    clipboardText += "| date=" + episodeDate + "\n\n";
    clipboardText += "| duration=\n\n"; //TO DO: ADD DURATION
    clipboardText += "| hosts=" + hosts + "\n\n"; //TO DO: ADD HOSTS
    clipboardText += "| intro=" + audioIntro + "\n\n";

    if (audioInter.length > 0) {
      clipboardText += "| interstitials=" + audioInter.join("<br>") + "\n\n";
    }

    clipboardText += "| outro=" + audioOutro + "\n\n}}";
    clipboardText += "{{#vardefine:downloadlink|" + directLink + "}}";
    clipboardText += "{{IncompleteNotice}}\n";
    clipboardText += "==Summary==\n\'\'";
    clipboardText += descriptionCollect + "\'\'\n\n";
    clipboardText += "==Topics==\n* {List or summarize the main topics, noting " +
                  "prominently mentioned players or teams and making internal " +
                  "wiki links to them (even if those pages have not been created " +
                  "yet).} \n\n";
    clipboardText += "==Banter==\n* {- If applicable. For banter, note " +
                  "prominent teams and players, and make internal links for " +
                  "them.\n- Links and mentions do NOT have to be made for " +
                  "players and teams mentioned in passing.}\n\n" +
                  "==Email Questions==\n* {For EMAIL episodes: copy the " +
                  "question and who asked it from the [https://docs.google.com/spreadsheets/d/1-8lpspHQuR5GK7S_nNtGunLGrx60QnSa8XLG_wvRb4Q/edit#gid=0" +
                  " question database], and link " +
                  "prominent teams and players.}\n\n" +
                  "==Stat Blast==\n* {For STAT BLAST segment: " +
                  "transcribe the scenario that the host is trying " +
                  "to answer (you do NOT have to transcribe the method used " +
                  "within the Stat Blast, but note its findings and any other " +
                  "pertinent info.)}\n\n" +
                  "==Notes==\n* {List noteworthy tangents, quotes, " +
                  "highlights, miscellany not covered above.}\n\n" +
                  "==Links==\n";
    jQuery.each(linkCollect, function( index ) {
      clipboardText += this;
    });
    clipboardText += "[[Category:Episodes]]\n[[Category:Incomplete Episode Page]]\n";
    clipboardText += "[[Category:Ben Lindbergh Episodes]]\n[[Category:Meg Rowley Episodes]]\n";
    clipboardText += "[[Category: " + episodeDate.substring(episodeDate.length - 4) + " Episodes]]\n";
    clipboardText += "{{DEFAULTSORT: Episode 0" + epNumber + "}}";

    const ta = document.createElement('textarea');
    ta.style.cssText = 'opacity:0; position:fixed; width:1px; height:1px; top:0; left:0;';
    ta.value = clipboardText;
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    document.execCommand('copy');
    ta.remove();
}

//message listener for background
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse)    {
    if(request.command === 'init'){
        scrapeEpisodeData();
        sendResponse({result: "success"});
    }
});
