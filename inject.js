chrome.extension.onRequest.addListener(
  function(request, sender, sendResponse) {
    
    var message = "goodbye";
    
    switch (request.message) {
      case "next": 
        simulateClick('large_next_song_button');
        break;
      case "previous":
        simulateClick('large_previous_song_button');
        break;
      case "pause":
        simulateClick('pause_button');
        break;
      case "play":
        simulateClick('play_button');
        break;
      case "hide":
        simulateClick('ready_link');
        break;
      case "getSongInfo":
        sendSongInfo(sendResponse);
        // Do not respond yet
        return;
      default:
        break;
    }
    sendResponse({message: "ok"});
  });

// Simulate clicks. Chrome extensions force injected JS into a sandbox, so calling
// T61 directly is not an option.
function simulateClick(elementId) {
  var evt = document.createEvent('MouseEvents');
  evt.initMouseEvent('click', true, false,  document, 0, 0, 0, 0, 0, false, 
  false, false, false, 0, null);
  document.getElementById(elementId).dispatchEvent(evt);
}

function sendSongInfo(sendResponse) {
  // Try to get the image from background_image or background_image_next.
  // It might not be ready yet though.
  var bi = $('#background_image');
  var bin = $('#background_image_next');
  var loader = $('#ajax_loader');
  
  // HACK: Detecting change to opacity 0.99 to show the background.
  var imageUrl;
  if (bin.css('left') == '100%') {
    imageUrl = bi.attr('src');
  } else if (bi.css('left') == '100%') {
    imageUrl = bin.attr('src');
  }
  console.log('sendSongInfo.imageUrl = ' + imageUrl);
  if (!imageUrl || imageUrl.indexOf('blank.gif') != -1 || loader.css('display') != 'none') {
    // Try again in 100ms. Maybe the image will have loaded.
    setTimeout(function() {sendSongInfo(sendResponse);}, 100);
    return;
  }
  var artistUrl = 'http://www.thesixtyone.com/' + $('#song_panel_artist a').attr('href');
  // alert(artistUrl);
  // Once we have a valid image, finally respond.
  sendResponse({message: {
    imageUrl: imageUrl,
    title: $('#song_panel_title').text(),
    artist: $('#song_panel_artist').text(),
    artistUrl: artistUrl,
    paused: ($('#pause_button').css('display') == 'none')
  }});
}

$(document).ready(function() {
  // Ensure that the intro_splash screen is hidden if it shows up
  if ($('#intro_splash').css('display') != 'none') {
    simulateClick('intro_splash');
  }
});