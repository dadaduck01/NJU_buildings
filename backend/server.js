const express = require('express');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// 中间件
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 确保音频目录存在
const audioDir = path.join(__dirname, 'uploads', 'audio');
if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
}

// 数据库连接
const dbPath = path.join(__dirname, 'database', 'buildings.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('数据库连接失败:', err.message);
  } else {
    console.log('已连接到SQLite数据库');
  }
});

// 建筑信息路由
const buildingRoutes = require('./routes/buildings');
app.use('/api/buildings', buildingRoutes);

// DashScope API调用函数
async function callDashScope(buildingName) {
  try {
    // 从环境变量获取API Key和App ID
    const apiKey = process.env.DASHSCOPE_API_KEY;
    const appId = process.env.DASHSCOPE_APP_ID;

    if (!apiKey || !appId) {
      throw new Error('DASHSCOPE_API_KEY 或 DASHSCOPE_APP_ID 未配置');
    }

    const url = `https://dashscope.aliyuncs.com/api/v1/apps/${appId}/completion`;

    const data = {
      input: {
        prompt: `你是一位大学院长，现在要为本校学生介绍一座校园建筑。我将提供两项内容：
- 建筑名称
- 该建筑在知识库中的检索结果

请你以一位大学院长的身份，面向学生，根据检索结果撰写一段150～300字的导览文字。

写作要求：
- 内容必须基于提供的知识库，不得编造；
- 语气：亲切自然，稳重温和，体现校长对学生的关怀；
- 目的：不仅讲述建筑信息，更传达学校精神、办学理念；
- 内容应包括（如有）：建筑历史、风格特点、用途、相关院系或重要人物/事件；
- 内容中尽量避免出现英文和其他非常特殊的符号，不要有落款文字，不要有问候语，平实的介绍文字即可
- 若信息不足以撰写完整内容，请回复："未找到足够信息生成导览内容。"`,
        biz_params: {
          'name': buildingName,
        },
      },
      parameters: {},
      debug: {},
    };

    console.log(`正在为建筑"${buildingName}"生成介绍...`);

    const response = await axios.post(url, data, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30秒超时
    });

    if (response.status === 200) {
      if (response.data.output && response.data.output.text) {
        return {
          success: true,
          description: response.data.output.text
        };
      } else {
        console.error('API响应格式异常:', response.data);
        return {
          success: false,
          error: 'API响应格式异常'
        };
      }
    } else {
      console.error('API请求失败:', response.status, response.data);
      return {
        success: false,
        error: `API请求失败: ${response.status}`
      };
    }
  } catch (error) {
    console.error(`调用DashScope API失败: ${error.message}`);
    if (error.response) {
      console.error(`响应状态: ${error.response.status}`);
      console.error(`响应数据: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    return {
      success: false,
      error: `生成介绍失败: ${error.message}`
    };
  }
}

// 建筑介绍生成接口
app.post('/api/generate-description', async (req, res) => {
  const { buildingName } = req.body;
  
  if (!buildingName) {
    return res.status(400).json({
      success: false,
      error: '建筑名称不能为空'
    });
  }

  try {
    const result = await callDashScope(buildingName);
    res.json(result);
  } catch (error) {
    console.error('生成建筑介绍失败:', error);
    res.status(500).json({
      success: false,
      error: '服务器内部错误'
    });
  }
});

// 文本转语音接口
app.post('/api/text-to-speech', async (req, res) => {
  const { text } = req.body;
  
  if (!text) {
    return res.status(400).json({
      success: false,
      error: '文本内容不能为空'
    });
  }

  try {
    // 检查API Key是否配置
    if (!process.env.DASHSCOPE_API_KEY) {
      return res.status(500).json({
        success: false,
        error: '语音功能需要配置API Key，请联系管理员'
      });
    }

    // 确保音频目录存在
    const audioDir = path.join(__dirname, 'uploads', 'audio');
    if (!fs.existsSync(audioDir)) {
      fs.mkdirSync(audioDir, { recursive: true });
    }

    // 生成唯一的文件名
    const fileName = `tts-${Date.now()}.mp3`;
    const outputPath = path.join(audioDir, fileName);

    // 调用Node.js TTS模块
    const tts = require('./node/tts');
    await tts(text, outputPath);

    // 复制音频文件到nginx静态目录
    try {
      const nginxAudioDir = '/var/www/uploads/audio';
      if (!fs.existsSync(nginxAudioDir)) {
        fs.mkdirSync(nginxAudioDir, { recursive: true });
      }
      const destPath = path.join(nginxAudioDir, fileName);
      fs.copyFileSync(outputPath, destPath);
    } catch (copyError) {
      console.warn('复制音频文件到nginx目录失败:', copyError);
    }

    // 返回音频文件URL
    res.json({
      success: true,
      audioUrl: `/uploads/audio/${fileName}`
    });
  } catch (error) {
    console.error('文本转语音失败:', error);
    res.status(500).json({
      success: false,
      error: `文本转语音失败: ${error.message}`
    });
  }
});

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: '服务器运行正常' });
});

// 全局错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: '服务器内部错误' });
});

app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
}); 