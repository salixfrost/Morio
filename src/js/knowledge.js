// ============================================
// LOCAL KNOWLEDGE BASE
// ============================================

let knowledgeBase = null;

// 加载知识库
export async function loadKnowledgeBase() {
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

// 关键词匹配
function matchKeywords(query, keywords) {
  const lowerQuery = query.toLowerCase();
  return keywords.some(keyword => lowerQuery.includes(keyword.toLowerCase()));
}

// 替换动态内容
function replaceDynamicContent(answer) {
  // 替换时间
  if (answer.includes('{time}')) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
    answer = answer.replace('{time}', timeStr);
  }
  
  // 可以添加更多动态内容替换
  // 例如：{date}, {user}, {weather} 等
  
  return answer;
}

// 搜索知识库
export function searchKnowledgeBase(query) {
  if (!knowledgeBase) {
    console.warn('Knowledge base not loaded');
    return null;
  }

  // 遍历所有问题，查找匹配的关键词
  for (const item of knowledgeBase.questions) {
    if (matchKeywords(query, item.keywords)) {
      let answer = item.answer;
      answer = replaceDynamicContent(answer);
      return {
        found: true,
        answer: answer,
        id: item.id
      };
    }
  }

  // 没有找到匹配，返回默认回复
  return {
    found: false,
    answer: knowledgeBase.defaultResponse,
    id: null
  };
}

// 添加新的知识条目（可选功能）
export function addKnowledge(keywords, answer) {
  if (!knowledgeBase) {
    console.warn('Knowledge base not loaded');
    return false;
  }

  const newId = Math.max(...knowledgeBase.questions.map(q => q.id)) + 1;
  knowledgeBase.questions.push({
    id: newId,
    keywords: keywords,
    answer: answer
  });

  console.log('New knowledge added:', newId);
  return true;
}

// 导出知识库（用于保存修改）
export function exportKnowledgeBase() {
  if (!knowledgeBase) {
    console.warn('Knowledge base not loaded');
    return null;
  }

  return JSON.stringify(knowledgeBase, null, 2);
}

// 相似度计算（简单版本）
function calculateSimilarity(str1, str2) {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();
  
  // 简单的包含检查
  if (s1.includes(s2) || s2.includes(s1)) {
    return 0.8;
  }
  
  // 计算共同字符数
  const chars1 = new Set(s1);
  const chars2 = new Set(s2);
  const intersection = new Set([...chars1].filter(x => chars2.has(x)));
  const union = new Set([...chars1, ...chars2]);
  
  return intersection.size / union.size;
}

// 模糊搜索（当精确匹配失败时使用）
export function fuzzySearch(query, threshold = 0.3) {
  if (!knowledgeBase) {
    return null;
  }

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
    let answer = bestMatch.answer;
    answer = replaceDynamicContent(answer);
    return {
      found: true,
      answer: answer,
      id: bestMatch.id,
      confidence: bestScore
    };
  }

  return null;
}
