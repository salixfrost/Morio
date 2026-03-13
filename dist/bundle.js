// ============================================
// BUNDLED VERSION - All modules in one file
// ============================================

// KNOWLEDGE BASE MODULE
let knowledgeBase = null;

// VOICE HELPER
function getRecommendedChineseVoice() {
  const synth = window.speechSynthesis;
  const voices = synth.getVoices();
  const priorities = [
    'Microsoft Huihui',
    'Microsoft Kangkang',
    'Google 普通话',
    'Ting-Ting',
    'Sin-ji',
    'Mei-Jia',
  ];
  for (const name of priorities) {
    const voice = voices.find(v => v.name.includes(name));
    if (voice) {
      console.log('推荐语音:', voice.name);
      return voice;
    }
  }
  const chineseVoice = voices.find(voice => 
    voice.lang.includes('zh') || voice.lang.includes('CN') || voice.name.includes('Chinese')
  );
  if (chineseVoice) {
    console.log('使用中文语音:', chineseVoice.name);
    return chineseVoice;
  }
  return null;
}

async function loadKnowledgeBase() {
  try {
    const response = await fetch('./data/knowledge-base.json');
    knowledgeBase = await response.json();
    console.log('Knowledge base loaded:', knowledgeBase.questions.length, 'entries');
    return true;
  } catch (error) {
    console.error('Failed to load knowledge base:', error);
    return false;
  }
}

function matchKeywords(query, keywords) {
  const lowerQuery = query.toLowerCase();
  return keywords.some(keyword => lowerQuery.includes(keyword.toLowerCase()));
}

function replaceDynamicContent(answer) {
  if (answer.includes('{time}')) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
    answer = answer.replace('{time}', timeStr);
  }
  return answer;
}

function searchKnowledgeBase(query) {
  if (!knowledgeBase) return null;
  for (const item of knowledgeBase.questions) {
    if (matchKeywords(query, item.keywords)) {
      return {
        found: true,
        answer: replaceDynamicContent(item.answer),
        id: item.id
      };
    }
  }
  return {
    found: false,
    answer: knowledgeBase.defaultResponse,
    id: null
  };
}

function calculateSimilarity(str1, str2) {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();
  if (s1.includes(s2) || s2.includes(s1)) return 0.8;
  const chars1 = new Set(s1);
  const chars2 = new Set(s2);
  const intersection = new Set([...chars1].filter(x => chars2.has(x)));
  const union = new Set([...chars1, ...chars2]);
  return intersection.size / union.size;
}

function fuzzySearch(query, threshold = 0.3) {
  if (!knowledgeBase) return null;
  let bestMatch = null;
  let bestScore = threshold;
  for (const item of knowledgeBase.questions) {
    for (const keyword of item.keywords) {
      const score = calculateSimilarity(query, keyword);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = item;
      }
    }
  }
  if (bestMatch) {
    return {
      found: true,
      answer: replaceDynamicContent(bestMatch.answer),
      id: bestMatch.id,
      confidence: bestScore
    };
  }
  return null;
}

// SHADER MODULE
function initShader() {
  const canvas = document.getElementById('shaderCanvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

  if (!gl) {
    console.error('WebGL not supported');
    return;
  }

  const vertexShaderSource = `
    attribute vec2 a_position;
    void main() {
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
  `;

  const fragmentShaderSource = `
    precision mediump float;
    uniform vec2 iResolution;
    uniform float iTime;

    #define S(a,b,t) smoothstep(a,b,t)

    mat2 Rot(float a) {
      float s = sin(a);
      float c = cos(a);
      return mat2(c, -s, s, c);
    }

    vec2 hash(vec2 p) {
      p = vec2(dot(p, vec2(2127.1, 81.17)), dot(p, vec2(1269.5, 283.37)));
      return fract(sin(p) * 43758.5453);
    }

    float noise(in vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      float n = mix(
        mix(dot(-1.0 + 2.0 * hash(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)), 
            dot(-1.0 + 2.0 * hash(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
        mix(dot(-1.0 + 2.0 * hash(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)), 
            dot(-1.0 + 2.0 * hash(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x), u.y);
      return 0.5 + 0.5 * n;
    }

    void main() {
      vec2 fragCoord = gl_FragCoord.xy;
      vec2 uv = fragCoord / iResolution.xy;
      float ratio = iResolution.x / iResolution.y;
      vec2 tuv = uv;
      tuv -= 0.5;

      float degree = noise(vec2(iTime * 0.01, tuv.x * tuv.y));
      tuv.y *= 1.0 / ratio;
      tuv *= Rot(radians((degree - 0.5) * 720.0 + 180.0));
      tuv.y *= ratio;

      float frequency = 5.0;
      float amplitude = 30.0;
      float speed = iTime * 0.15;
      tuv.x += sin(tuv.y * frequency + speed) / amplitude;
      tuv.y += sin(tuv.x * frequency * 1.5 + speed) / (amplitude * 0.5);

      vec3 colorYellow = vec3(0.957, 0.804, 0.623);
      vec3 colorDeepBlue = vec3(0.192, 0.384, 0.933);
      vec3 layer1 = mix(colorYellow, colorDeepBlue, S(-0.3, 0.2, (tuv * Rot(radians(-5.0))).x));

      vec3 colorRed = vec3(0.910, 0.510, 0.8);
      vec3 colorBlue = vec3(0.350, 0.71, 0.953);
      vec3 layer2 = mix(colorRed, colorBlue, S(-0.3, 0.2, (tuv * Rot(radians(-5.0))).x));

      vec3 finalComp = mix(layer1, layer2, S(0.5, -0.3, tuv.y));
      
      gl_FragColor = vec4(finalComp, 1.0);
    }
  `;

  function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compile error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  function createProgram(gl, vertexShader, fragmentShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      return null;
    }
    return program;
  }

  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
  const program = createProgram(gl, vertexShader, fragmentShader);

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1, -1, 1, -1, -1, 1, 1, 1,
  ]), gl.STATIC_DRAW);

  const positionLocation = gl.getAttribLocation(program, 'a_position');
  const resolutionLocation = gl.getUniformLocation(program, 'iResolution');
  const timeLocation = gl.getUniformLocation(program, 'iTime');

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
  }

  const fps = 30;
  const frameInterval = 1000 / fps;
  let lastFrameTime = 0;

  function render(time) {
    const elapsed = time - lastFrameTime;
    if (elapsed < frameInterval) {
      requestAnimationFrame(render);
      return;
    }
    lastFrameTime = time - (elapsed % frameInterval);
    time *= 0.001;

    gl.useProgram(program);
    gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
    gl.uniform1f(timeLocation, time);
    gl.enableVertexAttribArray(positionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(render);
  }

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  requestAnimationFrame(render);
}

// AUDIO MODULE
const AUDIO_CONFIG = {
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
let depth = AUDIO_CONFIG.baseDepth;
let smoothedDepth = AUDIO_CONFIG.baseDepth;
let prevEnergy = 0;
let smoothedEnergy = 0;

async function initAudio(elements) {
  if (audioContext) return;
  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = AUDIO_CONFIG.fftSize;
    dataArray = new Uint8Array(analyser.frequencyBinCount);
    audioSource = audioContext.createMediaElementSource(elements.audioPlayer);
    audioSource.connect(analyser);
    analyser.connect(audioContext.destination);
  } catch (error) {
    console.error('Failed to initialize Web Audio API:', error);
  }
}

async function togglePlayback(elements) {
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
  smoothedEnergy += (rmsEnergy - smoothedEnergy) * AUDIO_CONFIG.energySmoothing;
  const energyDelta = smoothedEnergy - prevEnergy;
  prevEnergy = smoothedEnergy;
  if (energyDelta > AUDIO_CONFIG.onsetThreshold) {
    const impulse = energyDelta * AUDIO_CONFIG.onsetSensitivity * AUDIO_CONFIG.intensity;
    depth = Math.min(1.0, depth + impulse);
  }
  depth = AUDIO_CONFIG.baseDepth + (depth - AUDIO_CONFIG.baseDepth) * AUDIO_CONFIG.depthDecay;
  smoothedDepth += (depth - smoothedDepth) * AUDIO_CONFIG.depthSmoothing;
  elements.blob.style.setProperty('--depth', smoothedDepth.toFixed(3));
  requestAnimationFrame(() => updateDepthFromAudio(elements));
}

function setupAudioEvents(elements) {
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

// SPEECH MODULE
let recognition;
let isRecognitionActive = false;

async function getHuggingFaceResponse(query) {
  const response = await fetch('https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_HUGGING_FACE_API_KEY',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ inputs: query }),
  });
  const data = await response.json();
  return data.generated_text || '抱歉，我不明白您的意思。';
}

async function getResponse(query) {
  let result = searchKnowledgeBase(query);
  if (result && result.found) {
    console.log('Found in knowledge base (exact match)');
    return result.answer;
  }
  result = fuzzySearch(query, 0.4);
  if (result && result.found) {
    console.log('Found in knowledge base (fuzzy match, confidence:', result.confidence, ')');
    return result.answer;
  }
  console.log('Not found in knowledge base, using AI API');
  try {
    return await getHuggingFaceResponse(query);
  } catch (error) {
    console.error('AI API error:', error);
    return result ? result.answer : '抱歉，我暂时无法回答这个问题。';
  }
}

function initSpeechRecognition(elements) {
  if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
    console.warn('Speech recognition not supported');
    return;
  }
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'zh-CN';

  elements.micBtn.addEventListener('click', () => {
    if (isRecognitionActive) return;
    elements.micBtn.classList.add('active');
    isRecognitionActive = true;
    try {
      recognition.start();
    } catch (e) {
      console.log('Recognition already started');
    }
  });

  recognition.onresult = async function (event) {
    const transcript = event.results[0][0].transcript;
    console.log('Speech recognized:', transcript);
    const response = await getResponse(transcript);
    console.log('Response:', response);
    if ('speechSynthesis' in window) {
      const synth = window.speechSynthesis;
      const utterance = new SpeechSynthesisUtterance(response);
      utterance.lang = 'zh-CN';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      const setVoice = () => {
        const voices = synth.getVoices();
        console.log('Available voices:', voices.length);
        const recommendedVoice = getRecommendedChineseVoice();
        if (recommendedVoice) {
          utterance.voice = recommendedVoice;
        } else {
          const chineseVoice = voices.find(voice => 
            voice.lang.includes('zh') || 
            voice.lang.includes('CN') ||
            voice.name.includes('Chinese')
          );
          if (chineseVoice) {
            utterance.voice = chineseVoice;
            console.log('Selected voice:', chineseVoice.name);
          } else if (voices.length > 0) {
            utterance.voice = voices[0];
            console.log('Using default voice:', voices[0].name);
          }
        }
        synth.speak(utterance);
      };
      
      if (synth.getVoices().length > 0) {
        setVoice();
      } else {
        synth.addEventListener('voiceschanged', setVoice, { once: true });
      }
    }
  };

  recognition.onerror = function (event) {
    isRecognitionActive = false;
    elements.micBtn.classList.remove('active');
    if (event.error !== 'no-speech' && event.error !== 'aborted') {
      console.error('Speech recognition error:', event.error);
    }
  };

  recognition.onend = function () {
    isRecognitionActive = false;
    elements.micBtn.classList.remove('active');
  };
}

// BLOB MODULE
function setupBlobInteraction(elements) {
  requestAnimationFrame(() => {
    const animations = elements.blob.getAnimations();
    elements.blob.addEventListener('mouseenter', () => {
      animations.forEach(anim => { anim.playbackRate = 5; });
    });
    elements.blob.addEventListener('mouseleave', () => {
      animations.forEach(anim => { anim.playbackRate = 1; });
    });
  });
}

// MAIN
const elements = {
  blob: document.querySelector('.blob'),
  playPauseBtn: document.getElementById('playPauseBtn'),
  audioPlayer: document.getElementById('audioPlayer'),
  playIcon: document.getElementById('playIcon'),
  pauseIcon: document.getElementById('pauseIcon'),
  micBtn: document.getElementById('micBtn')
};

async function init() {
  console.log('Initializing application...');
  await loadKnowledgeBase();
  initShader();
  setupAudioEvents(elements);
  initSpeechRecognition(elements);
  setupBlobInteraction(elements);
  console.log('Application initialized');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
