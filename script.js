const quotes = [
  "Distance means so little when someone means so much.",
  "I'm jealous of the people who get to see you every day.",
  "Together forever, never apart. Maybe in distance, but never in heart.",
  "Distance gives us a reason to love harder.",
  "Thinking of you is a poison I drink often, but I love the taste.",
  "The miles between us are just a test of how far love can travel.",
  "My heart is your home, no matter how far you go.",
];

const heartColors = [
  "#ff4d6d",
  "#ffccd5",
  "#c9184a",
  "#e91e63",
  "#f8bbd0",
  "#ff80ab",
]; // Different shades of pink/red

function createHeart() {
  const heart = document.createElement("div");
  heart.classList.add("heart");
  heart.innerHTML = "<span class='emoji'>🩷</span>"; // You can also use other heart emojis or unicode characters
  heart.style.left = Math.random() * 100 + "vw";
  heart.style.animationDuration = Math.random() * 3 + 3 + "s"; // Animation duration between 3-6 seconds
  heart.style.fontSize = Math.random() * 20 + 10 + "px"; // Font size between 10-30px
  heart.style.color =
    heartColors[Math.floor(Math.random() * heartColors.length)]; // Random color from the array

  const container = document.getElementById("hearts-bg");
  if (container) {
    container.appendChild(heart);
  }

  setTimeout(() => {
    heart.remove();
  }, 6000); // Remove heart after its animation duration
}

// Start floating hearts immediately for a constant background effect
setInterval(createHeart, 300);

function showLove() {
  const msg = document.getElementById("hidden-msg");
  const surpriseBtn = document.getElementById("surprise-btn");

  if (msg) {
    msg.style.display = "block";
    // Scroll to message
    msg.scrollIntoView({ behavior: "smooth" });
  }

  // Hide the surprise button after clicking
  if (surpriseBtn) {
    surpriseBtn.style.display = "none";
  }

  // Extra heart burst animation when the button is clicked
  for (let i = 0; i < 15; i++) {
    setTimeout(createHeart, i * 100);
  }
}

// Change quote with heart burst animation
function changeQuote() {
  const quoteDisplay = document.getElementById("quote-display");

  if (quoteDisplay) {
    // Change quote randomly
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    quoteDisplay.innerText = `"${randomQuote}"`;
  }

  // Heart burst animation
  for (let i = 0; i < 15; i++) {
    setTimeout(createHeart, i * 100);
  }
}

// Music Player - Smooth transitions and single track control
document.addEventListener("DOMContentLoaded", function () {
  const audioPlayers = document.querySelectorAll(".track-card audio");
  const fadeDuration = 500; // Fade duration (ms)
  const autoTrackDuration = 30; // Auto-play tracks for 30 seconds
  const manualTrackDuration = 60; // Manually clicked tracks play for 60 seconds
  let currentlyPlaying = null;
  let musicStarted = false;
  let trackTimer = null;

  // Start music when overlay is clicked
  const overlay = document.getElementById("start-overlay");
  if (overlay) {
    overlay.addEventListener("click", function () {
      // Remove overlay
      overlay.style.opacity = "0";
      setTimeout(() => {
        overlay.style.display = "none";
      }, 500);

      // Start first track
      if (!musicStarted && audioPlayers.length > 0) {
        musicStarted = true;
        fadeInAndPlay(audioPlayers[0]);
      }
    });
  }

  // Smoothly change volume level
  function fadeVolume(audio, targetVolume, duration, callback) {
    const startVolume = audio.volume;
    const volumeChange = targetVolume - startVolume;
    const steps = 20;
    const stepDuration = duration / steps;
    let currentStep = 0;

    const fadeInterval = setInterval(() => {
      currentStep++;
      audio.volume = Math.max(
        0,
        Math.min(1, startVolume + (volumeChange * currentStep) / steps),
      );

      if (currentStep >= steps) {
        clearInterval(fadeInterval);
        audio.volume = targetVolume;
        if (callback) callback();
      }
    }, stepDuration);
  }

  // Fade out and stop
  function fadeOutAndStop(audio, callback) {
    if (audio && !audio.paused) {
      fadeVolume(audio, 0, fadeDuration, () => {
        audio.pause();
        audio.currentTime = 0;
        audio.volume = 1;
        if (callback) callback();
      });
    } else if (callback) {
      callback();
    }
  }

  // Start with fade in
  function fadeInAndPlay(audio) {
    // Clear any existing timer
    if (trackTimer) {
      clearTimeout(trackTimer);
      trackTimer = null;
    }

    audio.volume = 0;
    audio
      .play()
      .then(() => {
        fadeVolume(audio, 1, fadeDuration);
        currentlyPlaying = audio;

        // Set timer to switch to next track after 30 seconds (auto-play)
        trackTimer = setTimeout(() => {
          playNextTrack(audio);
        }, autoTrackDuration * 1000);
      })
      .catch((e) => {
        console.log("Playback blocked:", e);
        audio.volume = 1;
      });
  }

  // Play next track in the list
  function playNextTrack(currentAudio) {
    const playerArray = Array.from(audioPlayers);
    const currentIndex = playerArray.indexOf(currentAudio);
    const nextIndex = (currentIndex + 1) % playerArray.length;

    fadeOutAndStop(currentAudio, () => {
      fadeInAndPlay(playerArray[nextIndex]);
    });
  }

  // Stop other tracks smoothly when a track starts playing
  audioPlayers.forEach((player) => {
    player.addEventListener("play", function (e) {
      // If this player is already currentlyPlaying and fading in, don't interfere
      if (currentlyPlaying === player) return;

      // Clear existing timer
      if (trackTimer) {
        clearTimeout(trackTimer);
        trackTimer = null;
      }

      // Fade out the other playing track
      if (currentlyPlaying && currentlyPlaying !== player) {
        const oldPlayer = currentlyPlaying;
        fadeOutAndStop(oldPlayer);
      }

      currentlyPlaying = player;

      // Start new 60 second timer for manually selected track
      trackTimer = setTimeout(() => {
        playNextTrack(player);
      }, manualTrackDuration * 1000);
    });

    // Auto-play next track when current one ends (if it ends before 30 sec)
    player.addEventListener("ended", function () {
      if (trackTimer) {
        clearTimeout(trackTimer);
        trackTimer = null;
      }
      currentlyPlaying = null;
      playNextTrack(player);
    });
  });
});
