const quotes = [
  "Distance means so little when someone means so much.",
  "I'm jealous of the people who get to see you every day.",
  "Together forever, never apart. Maybe in distance, but never in heart.",
  "Distance gives us a reason to love harder.",
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
];

// Create floating heart
function createHeart() {
  const heart = document.createElement("div");
  heart.classList.add("heart");
  heart.innerHTML = "🩷";
  heart.style.left = Math.random() * 100 + "vw";
  heart.style.animationDuration = Math.random() * 3 + 3 + "s";
  heart.style.fontSize = Math.random() * 20 + 10 + "px";
  heart.style.color = heartColors[Math.floor(Math.random() * heartColors.length)];

  const container = document.getElementById("hearts-bg");
  if (container) {
    container.appendChild(heart);
  }

  setTimeout(() => {
    heart.remove();
  }, 6000);
}

// Start floating heards
// 
setInterval(createHeart, 300);

// Heart burst animation
function createHeartBurst() {
  for (let i = 0; i < 15; i++) {
    setTimeout(createHeart, i * 100);
  }
}

// Show love message
function showLove() {
  const msg = document.getElementById("hidden-msg");
  const surpriseBtn = document.getElementById("surprise-btn");

  if (msg) {
    msg.style.display = "block";
    msg.scrollIntoView({ behavior: "smooth" });
  }

  if (surpriseBtn) {
    surpriseBtn.style.display = "none";
  }

  createHeartBurst();
}

// Change quote
function changeQuote() {
  const quoteDisplay = document.getElementById("quote-display");

  if (quoteDisplay) {
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    quoteDisplay.innerText = `"${randomQuote}"`;
  }

  createHeartBurst();
}

// Music Player - Smooth transitions and timing control
document.addEventListener("DOMContentLoaded", function () {
  const audioPlayers = document.querySelectorAll(".track-card audio");
  const fadeDuration = 500;
  const autoTrackDuration = 30; // Auto-play: 30 seconds
  const manualTrackDuration = 60; // Manual click: 60 seconds
  let currentlyPlaying = null;
  let musicStarted = false;
  let trackTimer = null;

  // Overlay click handler
  const overlay = document.getElementById("start-overlay");
  if (overlay) {
    overlay.addEventListener("click", function () {
      overlay.style.opacity = "0";
      setTimeout(() => {
        overlay.style.display = "none";
      }, 500);

      // Start first track
      if (!musicStarted && audioPlayers.length > 0) {
        musicStarted = true;
        fadeInAndPlay(audioPlayers[0], 0, true);
      }
    });
  }

  // Fade volume helper
  function fadeVolume(audio, targetVolume, duration, callback) {
    const startVolume = audio.volume;
    const volumeChange = targetVolume - startVolume;
    const steps = 20;
    const stepDuration = duration / steps;
    let currentStep = 0;

    const fadeInterval = setInterval(() => {
      currentStep++;
      audio.volume = Math.max(0, Math.min(1, startVolume + (volumeChange * currentStep) / steps));

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

  // Play next track
  function playNextTrack(currentIndex) {
    const nextIndex = (currentIndex + 1) % audioPlayers.length;

    fadeOutAndStop(audioPlayers[currentIndex], () => {
      fadeInAndPlay(audioPlayers[nextIndex], nextIndex, true);
    });
  }

  // Fade in and play
  function fadeInAndPlay(audio, index, isAuto) {
    if (trackTimer) {
      clearTimeout(trackTimer);
      trackTimer = null;
    }

    audio.volume = 0;
    audio.play().then(() => {
      fadeVolume(audio, 1, fadeDuration);
      currentlyPlaying = index;

      const duration = isAuto ? autoTrackDuration : manualTrackDuration;
      trackTimer = setTimeout(() => {
        playNextTrack(index);
      }, duration * 1000);
    }).catch((e) => {
      console.log("Playback blocked:", e);
      audio.volume = 1;
    });
  }

  // Handle manual track play
  audioPlayers.forEach((player, index) => {
    player.addEventListener("play", function () {
      if (currentlyPlaying === index) return;

      if (trackTimer) {
        clearTimeout(trackTimer);
        trackTimer = null;
      }

      if (currentlyPlaying !== null && audioPlayers[currentlyPlaying] && currentlyPlaying !== index) {
        fadeOutAndStop(audioPlayers[currentlyPlaying]);
      }

      currentlyPlaying = index;

      // Manual click = 60 seconds
      trackTimer = setTimeout(() => {
        playNextTrack(index);
      }, manualTrackDuration * 1000);
    });

    player.addEventListener("ended", function () {
      if (trackTimer) {
        clearTimeout(trackTimer);
        trackTimer = null;
      }
      playNextTrack(index);
    });
  });
});
