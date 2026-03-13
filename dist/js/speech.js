// ============================================
// SPEECH RECOGNITION
// ============================================

import { searchKnowledgeBase, fuzzySearch } from './knowledge.js';
import { getRecommendedChineseVoice } from './voice-helper.js';

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

// 优先使用本地知识库，失败后再调用 AI API
async function getResponse(query) {
  // 1. 先尝试精确匹配
  let result = searchKnowledgeBase(query);
  
  if (result && result.found) {
    console.log('Found in knowledge base (exact match)');
    return result.answer;
  }
  
  // 2. 尝试模糊匹配
  result = fuzzySearch(query, 0.4);
  
  if (result && result.found) {
    console.log('Found in knowledge base (fuzzy match, confidence:', result.confidence, ')');
    return result.answer;
  }
  
  // 3. 如果本地知识库没有答案，使用 AI API（可选）
  console.log('Not found in knowledge base, using AI API');
  try {
    return await getHuggingFaceResponse(query);
  } catch (error) {
    console.error('AI API error:', error);
    return result ? result.answer : '抱歉，我暂时无法回答这个问题。';
  }
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

    const response = await getResponse(transcript);
    console.log('Response:', response);
    
    // 使用语音合成朗读回答
    if ('speechSynthesis' in window) {
      const synth = window.speechSynthesis;
      const utterance = new SpeechSynthesisUtterance(response);
      utterance.lang = 'zh-CN';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      // 等待语音列表加载完成
      const setVoice = () => {
        const voices = synth.getVoices();
        console.log('Available voices:', voices.length);
        
        // 使用推荐的中文语音
        const recommendedVoice = getRecommendedChineseVoice();
        if (recommendedVoice) {
          utterance.voice = recommendedVoice;
        } else {
          // 备用方案：查找任何中文语音
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
      
      // 处理语音列表异步加载
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
