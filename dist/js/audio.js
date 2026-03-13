// ============================================
// AUDIO PLAYBACK & REACTIVITY
// ============================================

const CONFIG = {
  intensity: 1.5,
  baseDepth: 0.3,
  fftSize: 256,
  onsetThreshold: 0.015,
  onsetSensitivity: 3,
  energySmoothing: 0.3,
  depthSmoothing: 0.5,
  depthDecay: 0.92
};

let audioContext = null;
let analyser = null;
let audioSource = null;
let dataArray = null;
let isAnimating = false;

let depth = CONFIG.baseDepth;
let smoothedDepth = CONFIG.baseDepth;
let prevEnergy = 0;
let smoothedEnergy = 0;

export async function initAudio(elements) {
  if (audioContext) return;

  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = CONFIG.fftSize;
    dataArray = new Uint8Array(analyser.frequencyBinCount);

    audioSource = audioContext.createMediaElementSource(elements.audioPlayer);
    audioSource.connect(analyser);
    analyser.connect(audioContext.destination);
  } catch (error) {
    console.error('Failed to initialize Web Audio API:', error);
  }
}

export async function togglePlayback(elements) {
  await initAudio(elements);

  if (elements.audioPlayer.paused) {
    try {
      await elements.audioPlayer.play();
      elements.playPauseBtn.classList.add('active');
      elements.playIcon.style.display = 'none';
      elements.pauseIcon.style.display = 'block';

      if (!isAnimating) {
        isAnimating = true;
        updateDepthFromAudio(elements);
      }
    } catch (error) {
      console.error('Failed to play audio:', error);
    }
  } else {
    elements.audioPlayer.pause();
    elements.playPauseBtn.classList.remove('active');
    elements.playIcon.style.display = 'block';
    elements.pauseIcon.style.display = 'none';
  }
}

function updateDepthFromAudio(elements) {
  if (!analyser) {
    requestAnimationFrame(() => updateDepthFromAudio(elements));
    return;
  }

  analyser.getByteTimeDomainData(dataArray);

  let sumSquares = 0;
  for (let i = 0; i < dataArray.length; i++) {
    const normalized = (dataArray[i] - 128) / 128;
    sumSquares += normalized * normalized;
  }
  const rmsEnergy = Math.sqrt(sumSquares / dataArray.length);

  smoothedEnergy += (rmsEnergy - smoothedEnergy) * CONFIG.energySmoothing;

  const energyDelta = smoothedEnergy - prevEnergy;
  prevEnergy = smoothedEnergy;

  if (energyDelta > CONFIG.onsetThreshold) {
    const impulse = energyDelta * CONFIG.onsetSensitivity * CONFIG.intensity;
    depth = Math.min(1.0, depth + impulse);
  }

  depth = CONFIG.baseDepth + (depth - CONFIG.baseDepth) * CONFIG.depthDecay;
  smoothedDepth += (depth - smoothedDepth) * CONFIG.depthSmoothing;

  elements.blob.style.setProperty('--depth', smoothedDepth.toFixed(3));

  requestAnimationFrame(() => updateDepthFromAudio(elements));
}

export function setupAudioEvents(elements) {
  elements.playPauseBtn.addEventListener('click', () => togglePlayback(elements));

  elements.audioPlayer.addEventListener('ended', () => {
    elements.playIcon.style.display = 'block';
    elements.pauseIcon.style.display = 'none';
    elements.playPauseBtn.classList.remove('active');
  });

  elements.audioPlayer.addEventListener('error', (e) => {
    console.error('Audio loading error:', e);
    alert('Failed to load audio. This may be due to CORS restrictions.');
  });
}
