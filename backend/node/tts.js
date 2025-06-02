const WebSocket = require('ws');
const fs = require('fs');
const { v4: uuid } = require('uuid');

// 若没有将API Key配置到环境变量，可将下行替换为：apiKey = 'your_api_key'。不建议在生产环境中直接将API Key硬编码到代码中，以减少API Key泄露风险。
const apiKey = process.env.DASHSCOPE_API_KEY;
// WebSocket服务器地址
const url = 'wss://dashscope.aliyuncs.com/api-ws/v1/inference/';

function textToSpeech(text, outputFilePath = 'output.mp3', options = {}) {
    return new Promise((resolve, reject) => {
        // 清空输出文件
        fs.writeFileSync(outputFilePath, '');

        // 创建WebSocket客户端
        const ws = new WebSocket(url, {
            headers: {
                Authorization: `bearer ${apiKey}`,
                'X-DashScope-DataInspection': 'enable'
            }
        });

        let taskStarted = false;
        let taskId = uuid();

        ws.on('open', () => {
            console.log('已连接到WebSocket服务器');

            // 发送run-task指令
            const runTaskMessage = JSON.stringify({
                header: {
                    action: 'run-task',
                    task_id: taskId,
                    streaming: 'duplex'
                },
                payload: {
                    task_group: 'audio',
                    task: 'tts',
                    function: 'SpeechSynthesizer',
                    model: options.model || 'cosyvoice-v1',
                    parameters: {
                        text_type: 'PlainText',
                        voice: options.voice || 'voice', // 音色
                        format: options.format || 'mp3', // 音频格式
                        sample_rate: options.sampleRate || 22050, // 采样率
                        volume: options.volume || 50, // 音量
                        rate: options.rate || 1, // 语速
                        pitch: options.pitch || 1 // 音调
                    },
                    input: {}
                }
            });
            ws.send(runTaskMessage);
            console.log('已发送run-task消息');
        });

        const fileStream = fs.createWriteStream(outputFilePath, { flags: 'a' });
        ws.on('message', (data, isBinary) => {
            if (isBinary) {
                // 写入二进制数据到文件
                fileStream.write(data);
            } else {
                const message = JSON.parse(data);

                switch (message.header.event) {
                    case 'task-started':
                        taskStarted = true;
                        console.log('任务已开始');
                        // 发送continue-task指令
                        sendContinueTask(ws, text, taskId, taskStarted);
                        break;
                    case 'task-finished':
                        console.log('任务已完成');
                        ws.close();
                        fileStream.end(() => {
                            console.log('文件流已关闭');
                            resolve(outputFilePath);
                        });
                        break;
                    case 'task-failed':
                        console.error('任务失败：', message.header.error_message);
                        ws.close();
                        fileStream.end(() => {
                            console.log('文件流已关闭');
                            reject(new Error(message.header.error_message));
                        });
                        break;
                    default:
                        // 可以在这里处理result-generated
                        break;
                }
            }
        });

        ws.on('error', (error) => {
            console.error('WebSocket错误：', error);
            reject(error);
        });

        ws.on('close', () => {
            console.log('已断开与WebSocket服务器的连接');
        });
    });
}

function sendContinueTask(ws, text, taskId, taskStarted) {
    if (taskStarted) {
        const continueTaskMessage = JSON.stringify({
            header: {
                action: 'continue-task',
                task_id: taskId,
                streaming: 'duplex'
            },
            payload: {
                input: {
                    text: text
                }
            }
        });
        ws.send(continueTaskMessage);
        console.log(`已发送continue-task，文本：${text}`);

        // 发送finish-task指令
        setTimeout(() => {
            if (taskStarted) {
                const finishTaskMessage = JSON.stringify({
                    header: {
                        action: 'finish-task',
                        task_id: taskId,
                        streaming: 'duplex'
                    },
                    payload: {
                        input: {}
                    }
                });
                ws.send(finishTaskMessage);
                console.log('已发送finish-task');
            }
        }, 1000);
    }
}

// 如果直接运行此文件
if (require.main === module) {
    const text = process.argv[2] || '你好，这是一个测试。';
    const outputFile = process.argv[3] || 'output.mp3';
    
    textToSpeech(text, outputFile)
        .then(filePath => {
            console.log(`语音已生成：${filePath}`);
        })
        .catch(error => {
            console.error('生成语音失败：', error);
            process.exit(1);
        });
}

module.exports = textToSpeech; 