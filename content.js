var scrapeEpisodeData=function(){

    function straightenQuotes(s) {
        return s.replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"');
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

    //get episode Date
    let dateDiv = $('.postmeta').find('div').last();
    episodeDate = dateDiv.text();
    console.log(episodeDate);

    //episode link
    let titleDiv = $('.posttitle').first();
    episodeTitle = straightenQuotes(titleDiv.text());
    let epLinkText = "*[" + window.location.href + " " + episodeTitle + "]\n"
    linkCollect.push(epLinkText);
    
    let epNumber = episodeTitle.substring(episodeTitle.indexOf("Episode") + 8, episodeTitle.indexOf(":"));

    //direct download to mp3
    directLink = $('.powerpress_link_d').attr('href');

    //cycle through post and grab data we care about
    $('.fullpostentry').children('p').each(function( index ) {
      let textChecker = $(this).text();

      if (index == 0 ) {
        let descriptRaw = $(this).text();
        if (descriptRaw.startsWith("\n", 0)) {
          descriptRaw = descriptRaw.substring(1);
        }
        descriptRaw = descriptRaw.replace(/\(([\d:]+)\)/g, function (match, time) { return "({{{tcl|tc=" + time + "}}})"; });
        descriptionCollect = straightenQuotes(descriptRaw);
      }

      else if (textChecker.startsWith("Link", 1)) {
        $(this).find('a').each(function() {
          let linkHref = $(this).attr('href');
          let linkText = $(this).text();

          let newLink = "*[" + linkHref + " " + straightenQuotes(linkText) + "]\n"

          linkCollect.push(newLink);
        });
      }

      else if ( textChecker.startsWith("Audio", 0)) {
        let lines = textChecker.split("\n");
        lines.every(function(line) {
            var lower = line.toLowerCase();
            var data = straightenQuotes(line.substring(line.indexOf(":") + 2));
            if (lower.includes("intro")) {
              audioIntro = data;
            }
            //outro is always last one
            else if (lower.includes("outro")) {
              audioOutro = data;
              // stop processing after this
              return false;
            } else {
              audioInter.push(data);
            }
            return true;
        });
      }
    });

    $('.fullpostentry').find('strong').each(function( index ) {

      let strongText = $(this).text();
      let potentialLink = $(this).next('a');

      console.log(strongText);

      if (strongText.startsWith("intr", 6)) {
        console.log('intro');
        audioIntroLink = potentialLink.attr('href');
      }

      else if (strongText.startsWith("inte", 6)) {
        audioInterLinks.push( potentialLink.attr('href'));
      }

      else if (strongText.startsWith("outro", 6)) {
        console.log('outro');
        audioOutroLink = potentialLink.attr('href');
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
    clipboardText += "| hosts=\n\n"; //TO DO: ADD HOSTS
    clipboardText += "| intro=[" + audioIntroLink + " " + audioIntro + "]\n\n";
    //interstitials are funky
    if (audioInter.length > 0) {
      clipboardText += "| interstitials=";
      jQuery.each(audioInter, function( index ) {
        clipboardText += "[" + audioInterLinks[index] + " ";
        clipboardText += this + "]<br>";
      });
      clipboardText += "\n\n";
    }
    clipboardText += "| outro=[" + audioOutroLink + " " + audioOutro + "]\n\n}}";
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
                  "within the Stat Blast, but note its findings and andy other " +
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
