# Morio - 智能语音交互助手

一个具有动态着色器背景、音频反应性动画和本地知识库的智能语音交互系统。

## 功能特点

- 🎨 WebGL 着色器动态背景
- 🎵 音频反应性 Blob 动画
- 🎤 语音识别与语音合成
- 📚 本地知识库系统
- 🔊 音频播放与可视化

## 快速开始

1. 克隆仓库
```bash
git clone https://github.com/salixfrost/Morio.git
cd Morio
```

2. 使用 HTTP 服务器运行（推荐）
```bash
# 使用 Python
python -m http.server 8000

# 或使用 Node.js
npx serve dist
```

3. 打开浏览器访问 `http://localhost:8000/dist/`

## 项目结构

```
Morio/
├── dist/                    # 生产版本
│   ├── index.html
│   ├── style.css
│   ├── bundle.js           # 打包版本（推荐）
│   ├── knowledge-base.json # 知识库
│   └── js/                 # 模块化版本
│       ├── main.js
│       ├── shader.js
│       ├── audio.js
│       ├── speech.js
│       ├── blob.js
│       └── knowledge.js
└── src/                    # 源代码
```

## 使用说明

### 控制按钮

- 🎤 麦克风：点击开始语音识别
- ▶️ 播放：播放音频并启动音频反应动画
- 💧 形状：切换 Blob 有机形状

### 本地知识库

编辑 `dist/knowledge-base.json` 添加自定义问答：

```json
{
  "questions": [
    {
      "id": 1,
      "keywords": ["关键词1", "关键词2"],
      "answer": "回答内容"
    }
  ]
}
```

详细说明请查看 `dist/README-知识库.md`

## 技术栈

- WebGL (着色器渲染)
- Web Audio API (音频分析)
- Web Speech API (语音识别/合成)
- ES6 Modules
- CSS Animations

## 浏览器支持

- Chrome/Edge (推荐)
- Firefox
- Safari (部分功能)

## 开发

项目使用原生 JavaScript，无需构建工具。

## License

MIT
