# Morio - 智能语音交互助手

一个具有动态着色器背景、音频反应性动画和本地知识库的智能语音交互系统。

## ✨ 功能特点

- 🎨 **WebGL 着色器动态背景** - 流动的渐变效果
- 🎵 **音频反应性动画** - Blob 随音乐律动
- 🎤 **语音识别与合成** - 语音输入输出
- 📚 **本地知识库系统** - 可自定义问答
- 🔊 **音频可视化** - 实时音频分析

## 🚀 快速开始

### 1. 克隆仓库
```bash
git clone https://github.com/salixfrost/Morio.git
cd Morio
```

### 2. 启动服务器
```bash
# 使用 Python
python -m http.server 8000

# 或使用 Node.js
npx serve dist

# 或使用 PHP
php -S localhost:8000 -t dist
```

### 3. 打开浏览器
访问 `http://localhost:8000/`

## 📁 项目结构

```
Morio/
├── docs/                    # 📚 文档
│   ├── 项目结构说明.md
│   ├── 知识库使用说明.md
│   └── 语音配置说明.md
├── dist/                    # 🚀 生产版本
│   ├── data/               # 数据文件
│   ├── js/                 # JavaScript 模块
│   ├── index.html
│   ├── style.css
│   └── bundle.js           # 打包版本（推荐）
└── src/                    # 💻 源代码
    ├── data/
    ├── js/
    ├── index.html
    └── style.css
```

详细说明请查看 [项目结构说明](docs/项目结构说明.md)

## 🎮 使用说明

### 控制按钮

- 🎤 **麦克风** - 点击开始语音识别
- ▶️ **播放** - 播放音频并启动音频反应动画
- 💧 **形状** - 切换 Blob 有机形状

### 语音交互

1. 点击麦克风图标
2. 说出你的问题
3. 系统会从本地知识库查找答案
4. 语音朗读回答

### 自定义知识库

编辑 `dist/data/knowledge-base.json`：

```json
{
  "questions": [
    {
      "id": 1,
      "keywords": ["你好", "hello"],
      "answer": "你好！有什么可以帮助你的吗？"
    }
  ]
}
```

详细说明请查看 [知识库使用说明](docs/知识库使用说明.md)

### 语音配置

系统会自动选择最佳中文语音包。如需自定义，请查看 [语音配置说明](docs/语音配置说明.md)

## 🛠️ 技术栈

- **WebGL** - 着色器渲染
- **Web Audio API** - 音频分析
- **Web Speech API** - 语音识别/合成
- **ES6 Modules** - 模块化开发
- **CSS Animations** - 动画效果

## 🌐 浏览器支持

| 浏览器 | 支持程度 |
|--------|---------|
| Chrome/Edge 90+ | ✅ 完全支持 |
| Firefox 88+ | ✅ 完全支持 |
| Safari 14+ | ⚠️ 部分功能 |
| IE | ❌ 不支持 |

## 📖 文档

- [项目结构说明](docs/项目结构说明.md)
- [知识库使用说明](docs/知识库使用说明.md)
- [语音配置说明](docs/语音配置说明.md)

## 🔧 开发

### 修改代码
1. 在 `src/` 目录修改源代码
2. 测试功能
3. 同步到 `dist/` 目录

### 调试工具
打开浏览器控制台，使用：
```javascript
// 列出所有语音包
voiceHelper.list()

// 测试语音
voiceHelper.test(0, '测试文本')
```

## 📦 部署

### 静态部署
直接将 `dist/` 目录部署到：
- GitHub Pages
- Netlify
- Vercel
- 任何静态服务器

### 配置
无需任何配置，开箱即用！

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 License

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

- 着色器代码参考自 Inigo Quilez
- 音频分析灵感来自 Web Audio API 示例

---

Made with ❤️ by [salixfrost](https://github.com/salixfrost)
