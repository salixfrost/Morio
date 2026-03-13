// ============================================
// VOICE HELPER - 语音包辅助工具
// ============================================

// 列出所有可用的语音包
export function listAvailableVoices() {
  const synth = window.speechSynthesis;
  
  return new Promise((resolve) => {
    const getVoices = () => {
      const voices = synth.getVoices();
      
      console.log('=== 可用语音包列表 ===');
      voices.forEach((voice, index) => {
        console.log(`[${index}] ${voice.name}`);
        console.log(`    语言: ${voice.lang}`);
        console.log(`    本地: ${voice.localService ? '是' : '否'}`);
        console.log(`    默认: ${voice.default ? '是' : '否'}`);
        console.log('---');
      });
      
      resolve(voices);
    };
    
    if (synth.getVoices().length > 0) {
      getVoices();
    } else {
      synth.addEventListener('voiceschanged', getVoices, { once: true });
    }
  });
}

// 按语言筛选语音包
export function getVoicesByLanguage(lang = 'zh') {
  const synth = window.speechSynthesis;
  const voices = synth.getVoices();
  
  return voices.filter(voice => 
    voice.lang.toLowerCase().includes(lang.toLowerCase())
  );
}

// 获取推荐的中文语音包
export function getRecommendedChineseVoice() {
  const synth = window.speechSynthesis;
  const voices = synth.getVoices();
  
  // 优先级列表（根据质量和可用性）
  const priorities = [
    'Microsoft Huihui',      // Windows 中文女声
    'Microsoft Kangkang',    // Windows 中文男声
    'Google 普通话',         // Google 中文
    'Ting-Ting',            // macOS 中文女声
    'Sin-ji',               // macOS 中文女声
    'Mei-Jia',              // macOS 中文女声
  ];
  
  // 按优先级查找
  for (const name of priorities) {
    const voice = voices.find(v => v.name.includes(name));
    if (voice) {
      console.log('推荐语音:', voice.name);
      return voice;
    }
  }
  
  // 如果没有找到优先语音，返回第一个中文语音
  const chineseVoice = voices.find(voice => 
    voice.lang.includes('zh') || 
    voice.lang.includes('CN') ||
    voice.name.includes('Chinese')
  );
  
  if (chineseVoice) {
    console.log('使用中文语音:', chineseVoice.name);
    return chineseVoice;
  }
  
  console.warn('未找到中文语音包');
  return null;
}

// 测试语音包
export function testVoice(voiceIndex = 0, text = '你好，这是语音测试') {
  const synth = window.speechSynthesis;
  const voices = synth.getVoices();
  
  if (voiceIndex >= voices.length) {
    console.error('语音包索引超出范围');
    return;
  }
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = voices[voiceIndex];
  utterance.lang = 'zh-CN';
  utterance.rate = 1.0;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;
  
  console.log('测试语音:', voices[voiceIndex].name);
  synth.speak(utterance);
}

// 创建语音合成器（带配置）
export function createSpeechSynthesizer(config = {}) {
  const synth = window.speechSynthesis;
  
  const defaultConfig = {
    lang: 'zh-CN',
    rate: 1.0,      // 语速 (0.1 - 10)
    pitch: 1.0,     // 音调 (0 - 2)
    volume: 1.0,    // 音量 (0 - 1)
    voiceIndex: null // 指定语音包索引
  };
  
  const settings = { ...defaultConfig, ...config };
  
  return {
    speak: (text) => {
      return new Promise((resolve, reject) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = settings.lang;
        utterance.rate = settings.rate;
        utterance.pitch = settings.pitch;
        utterance.volume = settings.volume;
        
        const setVoice = () => {
          const voices = synth.getVoices();
          
          if (settings.voiceIndex !== null && settings.voiceIndex < voices.length) {
            utterance.voice = voices[settings.voiceIndex];
          } else {
            const recommendedVoice = getRecommendedChineseVoice();
            if (recommendedVoice) {
              utterance.voice = recommendedVoice;
            }
          }
          
          utterance.onend = () => resolve();
          utterance.onerror = (error) => reject(error);
          
          synth.speak(utterance);
        };
        
        if (synth.getVoices().length > 0) {
          setVoice();
        } else {
          synth.addEventListener('voiceschanged', setVoice, { once: true });
        }
      });
    },
    
    stop: () => {
      synth.cancel();
    },
    
    pause: () => {
      synth.pause();
    },
    
    resume: () => {
      synth.resume();
    }
  };
}

// 在控制台暴露工具函数（用于调试）
if (typeof window !== 'undefined') {
  window.voiceHelper = {
    list: listAvailableVoices,
    test: testVoice,
    getByLang: getVoicesByLanguage,
    getRecommended: getRecommendedChineseVoice
  };
  
  console.log('语音助手已加载！使用 voiceHelper.list() 查看所有语音包');
}
