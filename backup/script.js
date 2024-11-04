// 修改DOM元素获取
const inputArea = document.querySelector('.input-area');
const resultArea = document.querySelector('.result-area');
const wordCount = document.querySelector('.word-count');
const resultWordCount = document.querySelector('.result-word-count');
const rewriteBtn = document.querySelector('.btn-rewrite');
const copyBtn = document.querySelector('.btn-copy');
const toolsList = document.querySelectorAll('.tools-list li');

// 获取所有工具容器
const toolContainers = {
    '文本纠错': document.querySelector('.tool-container'),
    '社科类视频文案转公众号文章': document.querySelector('.video-to-article')
};

// 字数统计功能
function updateWordCount(text, element) {
    const count = text.trim().length;
    element.textContent = `字数：${count}`;
}

// 输入区字数统计
inputArea.addEventListener('input', () => {
    updateWordCount(inputArea.value, wordCount);
});

// 修改文本纠错功能
rewriteBtn.addEventListener('click', async () => {
    const text = inputArea.value;
    
    if (!text.trim()) {
        showToast('请输入需要纠错的文本');
        return;
    }

    try {
        console.log('开始处理文本纠错请求');
        rewriteBtn.disabled = true;
        rewriteBtn.textContent = '处理中...';
        resultArea.textContent = '正在处理...';
        updateWordCount('', resultWordCount); // 重置结果字数统计
        
        const result = await simulateRewrite(text);
        console.log('纠错完成，结果:', result);
        
        if (!result) {
            throw new Error('未获取到纠错结果');
        }
        
        // 保存到历史记录
        saveToHistory({
            original: text,
            corrected: result,
            timestamp: new Date().toISOString()
        });
        
        showToast('纠错完成');
    } catch (error) {
        console.error('纠错过程出错:', error);
        showToast(error.message || '处理失败，请稍后重试');
        resultArea.textContent = '处理失败，请重试';
        updateWordCount('', resultWordCount);
    } finally {
        rewriteBtn.disabled = false;
        rewriteBtn.textContent = '开始纠错';
    }
});

// 修改simulateRewrite函数
async function simulateRewrite(text, options = null) {
    const API_URL = 'http://192.168.0.100/v1/workflows/run';
    const API_KEY = 'app-YlMtJSBsux9fVSO2CyRp4wL1';

    try {
        const requestBody = {
            inputs: { 
                text: text,
                ...options // 如果options存在，展开添加到inputs中
            },
            response_mode: "streaming",
            user: "abc-123"
        };

        console.log('开始API调用，发送数据:', requestBody);

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(requestBody),
            mode: 'cors',
            credentials: 'same-origin'
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API错误响应:', errorText);
            throw new Error(`API请求失败: ${response.status}`);
        }

        const reader = response.body.getReader();
        let result = '';

        while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
                console.log('流式响应完成');
                break;
            }

            const chunk = new TextDecoder().decode(value);
            
            try {
                const lines = chunk.split('\n').filter(line => line.trim());
                
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const jsonStr = line.slice(6);
                        if (jsonStr === '[DONE]') continue;
                        
                        const data = JSON.parse(jsonStr);
                        
                        if (data.event === 'text_chunk' && data.data && data.data.text) {
                            result += data.data.text;
                            resultArea.textContent = result;
                            updateWordCount(result, resultWordCount); // 更新结果字数
                        }
                        else if (data.event === 'workflow_finished' && data.data && data.data.outputs && data.data.outputs.text) {
                            if (!result) {
                                result = data.data.outputs.text;
                                resultArea.textContent = result;
                                updateWordCount(result, resultWordCount);
                            }
                        }
                    }
                }
            } catch (e) {
                console.error('解析响应数据出错:', e);
            }
        }

        if (!result) {
            throw new Error('未能获取到有效的纠错结果');
        }

        return result;

    } catch (error) {
        console.error('API调用失败:', error);
        throw error;
    }
}

// 修改更新工具界面函数
function updateToolInterface(toolName) {
    const title = document.querySelector('.input-section h2');
    title.textContent = toolName;
    inputArea.value = '';
    resultArea.textContent = '';
    updateWordCount('', wordCount);
    updateWordCount('', resultWordCount);
}

// 复制功能
copyBtn.addEventListener('click', () => {
    const text = resultArea.textContent;
    if (!text.trim()) {
        showToast('没有可复制的内容');
        return;
    }
    
    navigator.clipboard.writeText(text)
        .then(() => showToast('复制成功'))
        .catch(() => showToast('复制失败，请手动复制'));
});

// 工具切换功能
toolsList.forEach(tool => {
    tool.addEventListener('click', () => {
        const toolName = tool.textContent;
        
        // 更新active类
        toolsList.forEach(t => t.classList.remove('active'));
        tool.classList.add('active');
        
        // 切换工具容器显示
        Object.entries(toolContainers).forEach(([name, container]) => {
            if (name === toolName) {
                container.style.display = 'grid';
            } else {
                container.style.display = 'none';
            }
        });
        
        // 重置表单
        updateToolInterface(toolName);
    });
});

// 辅助函数
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function saveToHistory(record) {
    const history = JSON.parse(localStorage.getItem('textHistory') || '[]');
    history.unshift(record);
    // 只保留最近20条记录
    if (history.length > 20) history.pop();
    localStorage.setItem('textHistory', JSON.stringify(history));
}

// 为视频转文章工具添加提交处理
function initVideoToArticle() {
    const container = toolContainers['社科类视频文案转公众号文章'];
    if (!container) return;

    const submitBtn = container.querySelector('.btn-rewrite');
    const inputArea = container.querySelector('.input-area');
    const resultArea = container.querySelector('.result-area');
    const sellBookCheckbox = container.querySelector('.sell-book-checkbox');
    const contentCategory = container.querySelector('.content-category');
    const minWordsCheckbox = container.querySelector('.min-words-checkbox');
    const wordCount = container.querySelector('.word-count');
    const resultWordCount = container.querySelector('.result-word-count');

    submitBtn.addEventListener('click', async () => {
        // 删除必填项验证，只验证文本内容
        const text = inputArea.value;
        if (!text.trim()) {
            showToast('请输入视频文案内容');
            return;
        }

        try {
            submitBtn.disabled = true;
            submitBtn.textContent = '处理中...';
            resultArea.textContent = '正在处理...';
            updateWordCount('', resultWordCount);

            // 调用API
            const API_URL = 'http://192.168.0.100/v1/workflows/run';
            const API_KEY = 'app-h9eX3Fln4UeIWfBnvODLCrBj';

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    inputs: {
                        originalText: text,
                        saleBook: sellBookCheckbox.checked ? 'y' : 'n',
                        contentType: contentCategory.value.trim(),
                        wordLimit: minWordsCheckbox.checked ? 'y' : 'n'
                    },
                    response_mode: "streaming",
                    user: "abc-123"
                }),
                mode: 'cors',
                credentials: 'same-origin'
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('API错误响应:', errorText);
                throw new Error(`API请求失败: ${response.status}`);
            }

            const reader = response.body.getReader();
            let result = '';

            while (true) {
                const { done, value } = await reader.read();
                
                if (done) {
                    console.log('流式响应完成');
                    break;
                }

                const chunk = new TextDecoder().decode(value);
                console.log('收到数据块:', chunk);
                
                try {
                    const lines = chunk.split('\n').filter(line => line.trim());
                    
                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const jsonStr = line.slice(6);
                            if (jsonStr === '[DONE]') continue;
                            
                            const data = JSON.parse(jsonStr);
                            
                            if (data.event === 'text_chunk' && data.data && data.data.text) {
                                result += data.data.text;
                                resultArea.textContent = result;
                                updateWordCount(result, resultWordCount);
                            }
                            else if (data.event === 'workflow_finished' && data.data && data.data.outputs && data.data.outputs.text) {
                                if (!result) {
                                    result = data.data.outputs.text;
                                    resultArea.textContent = result;
                                    updateWordCount(result, resultWordCount);
                                }
                            }
                        }
                    }
                } catch (e) {
                    console.error('解析响应数据出错:', e);
                }
            }

            if (!result) {
                throw new Error('未能获取到有效的转换结果');
            }

            // 保存到历史记录
            saveToHistory({
                original: text,
                converted: result,
                options: {
                    sell_book: sellBookCheckbox.checked,
                    content_category: contentCategory.value.trim(),
                    min_words_required: minWordsCheckbox.checked
                },
                timestamp: new Date().toISOString()
            });

            showToast('转换完成');
        } catch (error) {
            console.error('转换过程出错:', error);
            showToast(error.message || '处理失败，请稍后重试');
            resultArea.textContent = '处理失败，请重试';
            updateWordCount('', resultWordCount);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = '开始转换';
        }
    });

    // 添加输入监听
    inputArea.addEventListener('input', () => {
        updateWordCount(inputArea.value, wordCount);
    });
}

// 初始化所有工具
function initTools() {
    initVideoToArticle();
    // 可以继续添加其他工具的初始化
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initTools); 