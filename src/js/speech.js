// ============================================
// SPEECH RECOGNITION
// ============================================

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

export function initSpeechRecognition(elements) {
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
    if (isRecognitionActive) {
      return;
    }
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

    const response = await getHuggingFaceResponse(transcript);
    console.log('AI response:', response);
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
