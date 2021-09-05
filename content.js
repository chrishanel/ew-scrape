var scrapeEpisodeData=function(){

    let linkCollect = new Array;
    let descriptionCollect = new String;
    let audioIntro = new String;
    let audioOutro = new String;
    let audioInter = new Array;
    let episodeTitle = new String;
    let episodeDate = new String;
    let clipboardText = new String;

    //get episode Date
    let dateDiv = $('.postmeta').find('div').last();
    episodeDate = dateDiv.text();
    console.log(episodeDate);

    //episode link
    let titleDiv = $('.posttitle').first();
    episodeTitle = titleDiv.text();
    let epLinkText = "*[" + window.location.href + " " + episodeTitle + "]\n"
    linkCollect.push(epLinkText);

    //cycle through post and grab data we care about
    $('.fullpostentry').find('p').each(function( index ) {
      let textChecker = $(this).text();
      console.log(typeof textChecker);
      console.log(textChecker);

      if (index == 0 ) {
        console.log("new description");
        let descriptRaw = $(this).text();
        if (descriptRaw.startsWith("\n", 0)) {
          descriptRaw = descriptRaw.substring(1);
        }
        descriptionCollect = descriptRaw;
      }

      else if (textChecker.startsWith("Link", 1)) {
        $(this).find('a').each(function() {
          console.log("new link");
          let linkHref = $(this).attr('href');
          let linkText = $(this).text();

          let newLink = "*[" + linkHref + " " + linkText + "]\n"

          linkCollect.push(newLink);
          console.log(newLink);
        });
      }

      else if ( textChecker.startsWith("Audio", 0)) {
        let lines = textChecker.split("\n");
        jQuery.each(lines, function( index ) {
            console.log(this);
            if (index == 0) {
              audioIntro = this.substring(13);
              console.log('new intro');
            }

            //outro is always last one
            else if (index == lines.length - 1) {
              audioOutro = this.substring(13);
              console.log('new outro');
            }

            // interstitial if there's only one
            else if (lines.length < 4) {
              audioInter.push(this.substring(20));
              console.log('new interstitial');
            }

            //interstitials when there's multiple
            else {
              audioInter.push(this.substring(22));
              console.log('new interstitial');
            }
        });
      }
    });

    clipboardText = "==Date==\n" + episodeDate + "\n\n==Summary==\n\'\'";
    clipboardText += descriptionCollect + "\'\'\n\n";
    clipboardText += "==Topics==\n* {List or summarize the main topics, noting " +
                  "prominently mentioned players or teams and making internal " +
                  "wiki links to them (even if those pages have not been created " +
                  "yet).} \n\n==Intro==\n";
    clipboardText += audioIntro;

    if (audioInter.length > 0) {
      let interHeader = audioInter.length > 1 ?
        "\n\n==Interstitials==\n" : "\n\n==Interstitial==\n";
      clipboardText += interHeader;
      jQuery.each(audioInter, function( index ) {
        clipboardText += this + "\n";
      });
      clipboardText += "\n";
    } else {
      clipboardText += "\n\n";
    }

    clipboardText += "==Outro==\n" + audioOutro + "\n\n";
    clipboardText += "==Banter==\n{- If applicable.\n- For banter, note " +
                  "prominent teams and players, and make internal links for " +
                  "them.\n- Links and mentions do NOT have to be made for " +
                  "players and teams mentioned in passing.}\n\n" +
                  "==Email Questions==\n* {For EMAIL episodes: note the " +
                  "question asker, transcribe the question, and link " +
                  "prominent teams and players.}\n\n" +
                  "==Play Index or StatBlast==\n{For PLAY INDEX segment: " +
                  "transcribe the Play Index scenario that the host is trying " +
                  "to answer (you do NOT have to transcribe the method used " +
                  "within the PI)}\n\n" +
                  "==Notes==\n* {List noteworthy tangents, quotes, " +
                  "highlights, miscellany not covered above.}\n\n" +
                  "==Links==\n";
    jQuery.each(linkCollect, function( index ) {
      clipboardText += this;
    });

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
