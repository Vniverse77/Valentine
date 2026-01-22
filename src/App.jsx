import { useState, useEffect, useRef } from 'react'

const quotes = [
  "Distance means so little when someone means so much.",
  "I'm jealous of the people who get to see you every day.",
  "Together forever, never apart. Maybe in distance, but never in heart.",
  "Distance gives us a reason to love harder.",
  "The miles between us are just a test of how far love can travel.",
  "My heart is your home, no matter how far you go.",
]

const tracks = [
  { title: "Ara Beni Lutfen", cover: "/img/covers/arabeni.png", src: "/music/Ara Beni Lütfen [LZnXSIQdvhs].mp3" },
  { title: "Daylight", cover: "/img/covers/daylight.png", src: "/music/Daylight [Y1gswBe-DjM].mp3" },
  { title: "Love Me Harder", cover: "/img/covers/lovemeharder.png", src: "/music/Love Me Harder [uvXtC13GlxQ].mp3" },
  { title: "Seni Dusundum", cover: "/img/covers/senidusundum.png", src: "/music/Seni Düşündüm [ooEzDusqxXU].mp3" },
  { title: "napiyosun mesela ?", cover: "/img/covers/napiyosunmesela.png", src: "/music/napıyosun mesela ？ [X7rAgqfJexM].mp3" },
]

const heartColors = ["#ff4d6d", "#ffccd5", "#c9184a", "#e91e63", "#f8bbd0", "#ff80ab"]

function App() {
  const [showOverlay, setShowOverlay] = useState(true)
  const [currentQuote, setCurrentQuote] = useState(quotes[0])
  const [showMessage, setShowMessage] = useState(false)
  const [showSurpriseBtn, setShowSurpriseBtn] = useState(true)
  const [hearts, setHearts] = useState([])
  const audioRefs = useRef([])
  const currentlyPlaying = useRef(null)
  const trackTimer = useRef(null)

  const fadeDuration = 500
  const autoTrackDuration = 30
  const manualTrackDuration = 60

  // Create floating hearts
  useEffect(() => {
    const interval = setInterval(() => {
      const newHeart = {
        id: Date.now(),
        left: Math.random() * 100,
        duration: Math.random() * 3 + 3,
        size: Math.random() * 20 + 10,
        color: heartColors[Math.floor(Math.random() * heartColors.length)]
      }
      setHearts(prev => [...prev, newHeart])

      setTimeout(() => {
        setHearts(prev => prev.filter(h => h.id !== newHeart.id))
      }, 6000)
    }, 300)

    return () => clearInterval(interval)
  }, [])

  // Heart burst animation
  const createHeartBurst = () => {
    for (let i = 0; i < 15; i++) {
      setTimeout(() => {
        const newHeart = {
          id: Date.now() + i,
          left: Math.random() * 100,
          duration: Math.random() * 3 + 3,
          size: Math.random() * 20 + 10,
          color: heartColors[Math.floor(Math.random() * heartColors.length)]
        }
        setHearts(prev => [...prev, newHeart])

        setTimeout(() => {
          setHearts(prev => prev.filter(h => h.id !== newHeart.id))
        }, 6000)
      }, i * 100)
    }
  }

  // Fade volume helper
  const fadeVolume = (audio, targetVolume, duration, callback) => {
    const startVolume = audio.volume
    const volumeChange = targetVolume - startVolume
    const steps = 20
    const stepDuration = duration / steps
    let currentStep = 0

    const fadeInterval = setInterval(() => {
      currentStep++
      audio.volume = Math.max(0, Math.min(1, startVolume + (volumeChange * currentStep) / steps))

      if (currentStep >= steps) {
        clearInterval(fadeInterval)
        audio.volume = targetVolume
        if (callback) callback()
      }
    }, stepDuration)
  }

  // Fade out and stop
  const fadeOutAndStop = (audio, callback) => {
    if (audio && !audio.paused) {
      fadeVolume(audio, 0, fadeDuration, () => {
        audio.pause()
        audio.currentTime = 0
        audio.volume = 1
        if (callback) callback()
      })
    } else if (callback) {
      callback()
    }
  }

  // Play next track
  const playNextTrack = (currentIndex) => {
    const nextIndex = (currentIndex + 1) % tracks.length
    const nextAudio = audioRefs.current[nextIndex]

    fadeOutAndStop(audioRefs.current[currentIndex], () => {
      fadeInAndPlay(nextAudio, nextIndex, true)
    })
  }

  // Fade in and play
  const fadeInAndPlay = (audio, index, isAuto = false) => {
    if (trackTimer.current) {
      clearTimeout(trackTimer.current)
      trackTimer.current = null
    }

    audio.volume = 0
    audio.play().then(() => {
      fadeVolume(audio, 1, fadeDuration)
      currentlyPlaying.current = index

      const duration = isAuto ? autoTrackDuration : manualTrackDuration
      trackTimer.current = setTimeout(() => {
        playNextTrack(index)
      }, duration * 1000)
    }).catch(e => {
      console.log("Playback blocked:", e)
      audio.volume = 1
    })
  }

  // Handle overlay click
  const handleOverlayClick = () => {
    setShowOverlay(false)
    if (audioRefs.current[0]) {
      fadeInAndPlay(audioRefs.current[0], 0, true)
    }
  }

  // Handle manual track play
  const handleTrackPlay = (index) => {
    if (currentlyPlaying.current === index) return

    if (trackTimer.current) {
      clearTimeout(trackTimer.current)
      trackTimer.current = null
    }

    if (currentlyPlaying.current !== null && audioRefs.current[currentlyPlaying.current]) {
      fadeOutAndStop(audioRefs.current[currentlyPlaying.current])
    }

    currentlyPlaying.current = index
    trackTimer.current = setTimeout(() => {
      playNextTrack(index)
    }, manualTrackDuration * 1000)
  }

  // Handle surprise button
  const handleSurprise = () => {
    setShowMessage(true)
    setShowSurpriseBtn(false)
    createHeartBurst()
  }

  // Handle quote change
  const handleChangeQuote = () => {
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)]
    setCurrentQuote(randomQuote)
    createHeartBurst()
  }

  return (
    <>
      {/* Overlay */}
      {showOverlay && (
        <div className="start-overlay" onClick={handleOverlayClick}>
          <div className="overlay-title">💕 Click to Start Masham 💕</div>
          <div className="overlay-subtitle">Enjoy 😉</div>
        </div>
      )}

      {/* Floating Hearts Background */}
      <div className="hearts-bg">
        {hearts.map(heart => (
          <div
            key={heart.id}
            className="heart"
            style={{
              left: `${heart.left}vw`,
              animationDuration: `${heart.duration}s`,
              fontSize: `${heart.size}px`,
              color: heart.color
            }}
          >
            🩷
          </div>
        ))}
      </div>

      {/* Main Container */}
      <div className="container">
        <h1>Happy Anniversaries Mashajygymm!</h1>

        <div className="distance-card">
          <p className="subtitle">Miles apart, but never at heart.</p>

          {/* Main Photo */}
          <div className="photo-placeholder">
            <img src="/img/main.jpg" alt="Us" />
          </div>

          {/* Gallery */}
          <div className="gallery-title">The Meaning of My Life 💖</div>
          <div className="gallery">
            <div className="photo-placeholder" style={{ height: '150px' }}>
              <img src="/img/birtd1.jpg" alt="Memory 1" />
            </div>
            <div className="photo-placeholder" style={{ height: '150px' }}>
              <img src="/img/sunshine.jpg" alt="Memory 2" />
            </div>
            <div className="photo-placeholder" style={{ height: '150px' }}>
              <img src="/img/bchain.jpg" alt="Memory 3" />
            </div>
          </div>

          {/* Music Section */}
          <div className="music-section">
            <div className="music-section-title">🎵 Our Tracks 🎵</div>
            <div className="tracks-container">
              {tracks.map((track, index) => (
                <div key={index} className="track-card">
                  <div className="track-cover">
                    <img src={track.cover} alt={track.title} />
                  </div>
                  <div className="track-info">
                    <p className="track-title">{track.title}</p>
                  </div>
                  <audio
                    controls
                    ref={el => audioRefs.current[index] = el}
                    onPlay={() => handleTrackPlay(index)}
                    onEnded={() => playNextTrack(index)}
                  >
                    <source src={track.src} type="audio/mpeg" />
                  </audio>
                  <a href={track.src} download className="download-btn" title="Download">⬇</a>
                </div>
              ))}
            </div>
          </div>

          {/* Quote */}
          <div className="quote-box">"{currentQuote}"</div>

          {/* Surprise Button */}
          {showSurpriseBtn && (
            <button className="love-button" onClick={handleSurprise}>
              Click for a Surprise
            </button>
          )}

          {/* Hidden Message */}
          {showMessage && (
            <div className="hidden-msg">
              <h3>Delivered by Brunduk...</h3>
              <p>
                Distance is just a number. My heart is always with you.
                This little web page is a small gift to remind you how
                much I love you Kümüş. I miss you so much and I can't
                wait to spend more days with you after a few years!
              </p>
              <button className="love-button heart-btn" onClick={handleChangeQuote}>
                I Love You So Much! ❤️
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default App
