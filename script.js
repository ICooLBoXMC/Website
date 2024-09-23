var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var player;
var currentVideoIndex = 0;
var playlistVideos = [];

// Extract playlist ID from the full URL
function extractPlaylistId(url) {
  const urlParams = new URL(url).searchParams;
  return urlParams.get('list');
}

// Load playlist and handle video data
function loadPlaylist(playlistId) {
  player = new YT.Player('player', {
    height: '240',
    width: '100%',
    playerVars: {
      listType: 'playlist',
      list: playlistId,
      autoplay: 0, // Changed to 0 for manual play
      loop: 1,
      modestbranding: 1,
      rel: 0
    },
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  });

  // Fetch playlist information and store the video titles
  fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=AIzaSyAV4wGT2Y3fQ7tOEvCREmKj04opN_28uyQ`)
    .then(response => response.json())
    .then(data => {
      playlistVideos = data.items.map(item => ({
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.default.url
      }));
      displayPlaylist();
    });
}

// Display the playlist in a new UI design
function displayPlaylist() {
  const playlistContainer = document.getElementById('playlist');
  playlistContainer.innerHTML = '';

  playlistVideos.forEach((video, index) => {
    const listItem = document.createElement('li');
    listItem.classList.add('playlist-item');
    listItem.innerHTML = `
      <img class="thumbnail" src="${video.thumbnail}" alt="Thumbnail">
      <div class="video-info">
        <span>${video.title}</span>
      </div>
    `;
    listItem.addEventListener('click', () => {
      currentVideoIndex = index;
      player.playVideoAt(currentVideoIndex);
      highlightCurrentVideo();
    });

    playlistContainer.appendChild(listItem);
  });

  highlightCurrentVideo();
}

// Highlight the currently playing video in the playlist
function highlightCurrentVideo() {
  const playlistItems = document.querySelectorAll('.playlist-item');
  playlistItems.forEach((item, index) => {
    item.classList.toggle('current', index === currentVideoIndex);
  });
}

// Player is ready
function onPlayerReady(event) {
  // Bind play, stop, and skip buttons to the player
  document.getElementById('playButton').addEventListener('click', () => {
    player.playVideo();
  });

  document.getElementById('skipButton').addEventListener('click', () => {
    currentVideoIndex++;
    player.nextVideo();
    highlightCurrentVideo();
  });

  document.getElementById('stopButton').addEventListener('click', () => {
    player.stopVideo();
  });
}

// Handle state changes, such as when a video ends
function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.ENDED) {
    currentVideoIndex++;
    highlightCurrentVideo();
  }
}

// Event listener for loading the playlist
document.getElementById('loadPlaylist').addEventListener('click', function () {
  var playlistURL = document.getElementById('playlistInput').value;
  var playlistId = extractPlaylistId(playlistURL);
  if (playlistId) {
    loadPlaylist(playlistId);
  } else {
    alert('Invalid playlist URL. Please enter a valid YouTube playlist link.');
  }
});
