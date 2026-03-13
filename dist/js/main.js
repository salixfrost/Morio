// ============================================
// MAIN ENTRY POINT
// ============================================

import { initShader } from './shader.js';
import { setupAudioEvents } from './audio.js';
import { initSpeechRecognition } from './speech.js';
import { setupBlobInteraction } from './blob.js';
import { loadKnowledgeBase } from './knowledge.js';
import { listAvailableVoices } from './voice-helper.js';

// DOM Elements
const elements = {
  blob: document.querySelector('.blob'),
  playPauseBtn: document.getElementById('playPauseBtn'),
  audioPlayer: document.getElementById('audioPlayer'),
  playIcon: document.getElementById('playIcon'),
  pauseIcon: document.getElementById('pauseIcon'),
  micBtn: document.getElementById('micBtn')
};

// Initialize all modules
async function init() {
  console.log('Initializing application...');
  
  // 加载知识库
  await loadKnowledgeBase();
  
  // 列出可用语音包（调试用）
  if ('speechSynthesis' in window) {
    await listAvailableVoices();
  }
  
  initShader();
  setupAudioEvents(elements);
  initSpeechRecognition(elements);
  setupBlobInteraction(elements);
  console.log('Application initialized');
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
