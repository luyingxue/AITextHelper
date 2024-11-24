'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast, Toaster } from "sonner"
import { ScrollArea } from "@/components/ui/scroll-area"
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github.css'  // 或者其他主题样式
import { API_CONFIG } from '@/config/api';

// API call functions (unchanged)
const callWorkflowAPI = async (text: string) => {
  try {
    const requestBody = {
      inputs: { text: text },
      response_mode: "streaming",
      user: "abc-123"
    };

    console.log('文本纠错 API 调用:');
    console.log('URL:', `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.WORKFLOW}`);
    console.log('Token:', API_CONFIG.TOKENS.CORRECTION);
    console.log('请求体:', requestBody);

    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.WORKFLOW}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_CONFIG.TOKENS.CORRECTION}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    console.log('API响应状态:', response.status);
    if (!response.ok) {
      console.error('API错误响应:', {
        status: response.status,
        statusText: response.statusText
      });
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    console.log('API调用成功');
    return response;
  } catch (error) {
    console.error('API调用出错:', error);
    throw error;
  }
};

const callVideoToArticleAPI = async (originalText: string, saleBook: boolean, contentType: string, wordLimit: boolean) => {
  try {
    const requestBody = {
      inputs: { 
        originalText: originalText,
        saleBook: saleBook ? 'y' : 'n',
        contentType: contentType,
        wordLimit: wordLimit ? 'y' : 'n'
      },
      response_mode: "streaming",
      user: "abc-123"
    };

    console.log('视频转文章 API 调��:');
    console.log('URL:', `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.WORKFLOW}`);
    console.log('Token:', API_CONFIG.TOKENS.VIDEO_TO_ARTICLE);
    console.log('请求体:', requestBody);

    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.WORKFLOW}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_CONFIG.TOKENS.VIDEO_TO_ARTICLE}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    console.log('API响应状态:', response.status);
    if (!response.ok) {
      console.error('API错误响应:', {
        status: response.status,
        statusText: response.statusText
      });
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    console.log('API调用成功');
    return response;
  } catch (error) {
    console.error('API调用出错:', error);
    throw error;
  }
};

const callSummarizeAPI = async (originalText: string, saleBook: boolean) => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.WORKFLOW}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_CONFIG.TOKENS.SUMMARIZE}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: { 
          originalText: originalText,
          saleBook: saleBook ? 'y' : 'n'
        },
        response_mode: "streaming",
        user: "abc-123"
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response;
  } catch (error) {
    console.error('API调用出错:', error);
    throw error;
  }
};

const callElderlyArticleAPI = async (originalText: string) => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.WORKFLOW}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_CONFIG.TOKENS.ELDERLY_ARTICLE}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: { originalText: originalText },
        response_mode: "streaming",
        user: "abc-123"
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response;
  } catch (error) {
    console.error('API调用出错:', error);
    throw error;
  }
};

// 添加新的 API 调用函数
const callBabyShowAPI = async (text: string) => {
  try {
    console.log('发送请求，参数:', {
      inputs: { query: text },
      response_mode: "streaming",
      user: "abc-123"
    });

    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.COMPLETION}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_CONFIG.TOKENS.BABY_SHOW}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: { query: text },
        response_mode: "streaming",
        user: "abc-123"
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response;
  } catch (error) {
    console.error('API调用出错:', error);
    throw error;
  }
};

// 添加新的 API 调用函数
const callShortsDescAPI = async (keyword: string, description: string) => {
  try {
    const requestBody = {
      inputs: { query: `关键词：${keyword}\n视频描述：${description}` },
      response_mode: "streaming",
      user: "abc-123"
    };

    console.log('发送请求到 shorts-desc API');
    console.log('请求体:', requestBody);

    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.COMPLETION}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_CONFIG.TOKENS.SHORTS_DESC}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      console.error('API响应错误:', {
        status: response.status,
        statusText: response.statusText
      });
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log('API响应成功');
    return response;
  } catch (error) {
    console.error('API调用出错:', error);
    throw error;
  }
};

// Define category interface
interface Category {
  id: string;
  name: string;
  modules: ToolModule[];
}

// Define tool module interface
interface ToolModule {
  id: string;
  name: string;
  inputFields: {
    type: 'textarea' | 'input' | 'checkbox' | 'switch';
    label: string;
    id: string;
  }[];
  processFunction: (inputs: Record<string, any>) => Promise<Response | string>;
}

// Define categories and their respective tool modules
const categories: Category[] = [
  {
    id: 'general',
    name: '一般文字处理',
    modules: [
      {
        id: 'correction',
        name: '文本纠错',
        inputFields: [
          { type: 'textarea', label: '需要纠错的文本', id: 'correctionInput' }
        ],
        processFunction: async (inputs): Promise<Response> => {
          return await callWorkflowAPI(inputs.correctionInput);
        }
      },
      {
        id: 'keyword-extract',
        name: '关键词提���',
        inputFields: [
          { type: 'textarea', label: '需要提取关键词的文本', id: 'keywordInput' },
          { type: 'input', label: '关键词数量', id: 'keywordCount' }
        ],
        processFunction: async (inputs) => {
          const words = inputs.keywordInput.split(' ');
          return words.slice(0, Number(inputs.keywordCount)).join(', ');
        }
      }
    ]
  },
  {
    id: 'social-science',
    name: '社科类图书',
    modules: [
      {
        id: 'video-to-article',
        name: '视频号文章转公众号',
        inputFields: [
          { type: 'switch', label: '是否卖书', id: 'sellBook' },
          { type: 'input', label: '内容类别', id: 'contentCategory' },
          { type: 'switch', label: '最低字数要求', id: 'wordLimit' },
          { type: 'textarea', label: '视频文案', id: 'videoInput' }
        ],
        processFunction: async (inputs): Promise<Response> => {
          return await callVideoToArticleAPI(
            inputs.videoInput,
            inputs.sellBook,
            inputs.contentCategory,
            inputs.wordLimit
          );
        }
      },
      {
        id: 'summarize',
        name: '标题和摘要',
        inputFields: [
          { type: 'switch', label: '是否卖书', id: 'sellBook' },
          { type: 'textarea', label: '需要摘要的文本', id: 'summarizeInput' }
        ],
        processFunction: async (inputs): Promise<Response> => {
          return await callSummarizeAPI(
            inputs.summarizeInput,
            inputs.sellBook
          );
        }
      }
    ]
  },
  {
    id: 'ai',
    name: 'AI人工智能',
    modules: [
      // Add AI-related modules here
    ]
  },
  {
    id: 'elderly-care',
    name: '养老',
    modules: [
      {
        id: 'elderly-article',
        name: '养生公众号伪原',
        inputFields: [
          { type: 'textarea', label: '需要改写的文本', id: 'originalText' }
        ],
        processFunction: async (inputs): Promise<Response> => {
          return await callElderlyArticleAPI(inputs.originalText);
        }
      }
    ]
  },
  {
    id: 'youtube-shorts',
    name: 'YouTube Shorts',
    modules: [
      {
        id: 'baby-show',
        name: 'baby show',
        inputFields: [],
        processFunction: async (inputs): Promise<Response> => {
          return await callBabyShowAPI(inputs.text || '');
        }
      },
      {
        id: 'shorts-desc',
        name: 'YouTube Shorts标题和介绍',
        inputFields: [
          { type: 'input', label: '关键词', id: 'keyword' },
          { type: 'textarea', label: '视频描述', id: 'description' }
        ],
        processFunction: async (inputs): Promise<Response> => {
          return await callShortsDescAPI(
            inputs.keyword || '',
            inputs.description || ''
          );
        }
      }
    ]
  }
];

// 定义历史记录项的接口
interface HistoryItem {
  input: string;
  output: string;
}

// 添加错误类型定义
interface ApiError extends Error {
  name: string;
  message: string;
  stack?: string;
}

export function TextProcessingToolComponent() {
  const [activeCategory, setActiveCategory] = useState(categories[0].id);
  const [activeModule, setActiveModule] = useState(categories[0].modules[0].id);
  const [inputs, setInputs] = useState<Record<string, any>>({});
  const [outputs, setOutputs] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [isApiFinished, setIsApiFinished] = useState(false);
  const [streamingOutput, setStreamingOutput] = useState<string>('');
  const [babyShowHistory, setBabyShowHistory] = useState<HistoryItem[]>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState<number>(-1);

  const HISTORY_KEY = 'baby-show-history';

  // 组件加载时从 localStorage 读取历史记录
  useEffect(() => {
    const loadHistory = () => {
      try {
        const savedHistory = localStorage.getItem(HISTORY_KEY);
        if (savedHistory) {
          const history = JSON.parse(savedHistory) as HistoryItem[];
          setBabyShowHistory(history);
        }
      } catch (error) {
        console.log('No history found, starting with empty history');
        setBabyShowHistory([]);
      }
    };

    loadHistory();
  }, []);

  // 保存历史记录到 localStorage
  const saveHistory = (newHistory: HistoryItem[]) => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
    } catch (error) {
      console.error('Failed to save history:', error);
    }
  };

  const handleInputChange = (moduleId: string, fieldId: string, value: any) => {
    setInputs(prev => ({
      ...prev,
      [moduleId]: {
        ...prev[moduleId],
        [fieldId]: value
      }
    }));
  };

  const handleProcess = async (categoryId: string, moduleId: string) => {
    // 在函数开始时立即打印
    console.log('=== 开始处理请求 ===');
    console.log('模块ID:', moduleId);
    console.log('类别ID:', categoryId);
    console.log('输入数据:', JSON.stringify(inputs[moduleId], null, 2));

    const category = categories.find(c => c.id === categoryId);
    const module = category?.modules.find(m => m.id === moduleId);
    
    if (!module) {
      const error = `未找到对应模块: ${categoryId}/${moduleId}`;
      console.error(error);
      toast.error(error);
      return;
    }

    try {
      setIsProcessing(true);
      setIsApiFinished(false);
      setOutputs(prev => ({
        ...prev,
        [moduleId]: ''
      }));

      console.log(`开始调用 ${module.name} 的处理函数`);
      const response = await module.processFunction(inputs[moduleId] || {});
      console.log('API响应:', response instanceof Response ? 'Stream' : typeof response);

      if (response instanceof Response) {
        console.log('开始处理流式响应');
        await handleStreamingResponse(response, moduleId);
        console.log('流式响应处理完成');
      } else {
        console.log('处理普通响应');
        setOutputs(prev => ({
          ...prev,
          [moduleId]: response
        }));
      }

      console.log('处理成功完成');
      setIsApiFinished(true);

    } catch (err) {
      const error = err as ApiError;
      console.error('处理失败:', {
        name: error.name || 'Unknown Error',
        message: error.message || 'No error message',
        stack: error.stack || 'No stack trace'
      });
      toast.error("处理失败，请重试");
    } finally {
      setIsProcessing(false);
      console.log('=== 处理结束 ===');
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      // 首先尝试使用现代的 Clipboard API
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        toast("已复制到剪贴板", {
          duration: 1500,
          style: {
            background: '#EF4444',
            color: 'white',
          }
        });
      } else {
        // 在非 HTTPS 环境下使用传统方法
        const textArea = document.createElement('textarea');
        textArea.value = text;
        
        // 将文本域移到屏幕外
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
          document.execCommand('copy');
          textArea.remove();
          toast("已复制到剪贴板", {
            duration: 1500,
            style: {
              background: '#EF4444',
              color: 'white',
            }
          });
        } catch (err) {
          console.error('复制失败:', err);
          textArea.remove();
          throw new Error('复���失败');
        }
      }
    } catch (err) {
      console.error('复制失败:', err);
      toast("复制失败，请重试", {
        duration: 1500,
        style: {
          background: '#EF4444',
          color: 'white',
        }
      });
    }
  };

  const handleStreamingResponse = async (
    response: Response, 
    moduleId: string
  ): Promise<string> => {
    console.log(`开始处理 ${moduleId} 的流式响应`);
    const reader = response.body!.getReader();
    let result = '';
    
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          console.log('流读取完成');
          break;
        }
        
        const chunk = new TextDecoder().decode(value);
        console.log('收到数据块:', chunk);
        
        if (chunk.trim() === '') continue;
        
        if (chunk.startsWith('data: ')) {
          try {
            const jsonStr = chunk.slice(6);
            console.log('收到数据:', jsonStr);  // 添加调试日志
            const data = JSON.parse(jsonStr);
            
            // 处理 baby show 和 shorts-desc 的响应
            if (moduleId === 'baby-show' || moduleId === 'shorts-desc') {  // 添��� shorts-desc
              if (data.event === 'message' && data.answer) {
                result += data.answer;
                setOutputs(prev => ({
                  ...prev,
                  [moduleId]: result
                }));
              }
            } else {
              // 处理其他模块的响应
              if (data.event === 'text_chunk' && data.data.text) {
                result += data.data.text;
                setOutputs(prev => ({
                  ...prev,
                  [moduleId]: result
                }));
              }
              else if (data.event === 'workflow_finished' && data.data.outputs?.text) {
                result = data.data.outputs.text;
                setOutputs(prev => ({
                  ...prev,
                  [moduleId]: result
                }));
              }
            }
          } catch (e) {
            console.error('JSON解析错误:', e);
            console.error('错误的JSON字符串:', chunk);  // 添加错误数据日志
          }
        }
      }
    } catch (err) {
      const error = err as ApiError;
      console.error('流处理错误:', {
        name: error.name || 'Unknown Error',
        message: error.message || 'No error message'
      });
      throw error;
    } finally {
      reader.releaseLock();
      console.log('流处理结束');
    }
    
    return result;
  };

  return (
    <>
      <Toaster />
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar for main categories */}
        <div className="w-64 bg-white shadow-md">
          <div className="p-4">
            <h1 className="text-xl font-bold text-gray-800 mb-4">媒体文本处理工具</h1>
          </div>
          <ScrollArea className="h-[calc(100vh-80px)]">
            <nav className="space-y-2 p-2">
              {categories.map(category => (
                <Button
                  key={category.id}
                  variant={activeCategory === category.id ? "secondary" : "ghost"}
                  className="w-full justify-start text-left font-normal"
                  onClick={() => {
                    setActiveCategory(category.id);
                    setActiveModule(category.modules[0]?.id);
                  }}
                >
                  {category.name}
                </Button>
              ))}
            </nav>
          </ScrollArea>
        </div>

        {/* Main content area */}
        <div className="flex-1 overflow-auto">
          <div className="container mx-auto p-4">
            {categories.map(category => (
              category.id === activeCategory && (
                <div key={category.id}>
                  <h2 className="text-2xl font-bold mb-4 text-gray-700">{category.name}</h2>
                  <Tabs value={activeModule} onValueChange={setActiveModule}>
                    <TabsList className="mb-4">
                      {category.modules.map(module => (
                        <TabsTrigger 
                          key={module.id} 
                          value={module.id}
                          className="data-[state=active]:bg-white data-[state=active]:text-teal-600"
                        >
                          {module.name}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    {category.modules.map(module => (
                      <TabsContent key={module.id} value={module.id}>
                        <Card className="bg-white shadow-sm border-slate-100">
                          <CardHeader>
                            <CardTitle>{module.name}</CardTitle>
                          </CardHeader>
                          <CardContent className="bg-slate-50">
                            {module.id === 'baby-show' ? (
                              <div className="grid gap-6">
                                <div>
                                  <Label htmlFor="baby-show-input">输入文本</Label>
                                  <Input
                                    id="baby-show-input"
                                    value={inputs[module.id]?.text || ''}
                                    onChange={(e) => handleInputChange(module.id, 'text', e.target.value)}
                                  />
                                </div>
                                <Button 
                                  className="bg-teal-500 hover:bg-teal-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                  onClick={() => handleProcess(category.id, module.id)}
                                  disabled={isProcessing || !inputs[module.id]?.text?.trim()}
                                >
                                  {isProcessing ? (
                                    <span className="flex items-center">
                                      正在处理中
                                      <span className="ml-1 animate-[ellipsis_1.5s_infinite]">...</span>
                                    </span>
                                  ) : '开始生成提示词'}
                                </Button>
                                <div>
                                  <Label htmlFor="baby-show-output">输出文</Label>
                                  <div 
                                    className="relative min-h-[200px] max-h-[400px] overflow-y-auto rounded-md border border-input bg-white px-3 py-2 text-sm"
                                  >
                                    <ReactMarkdown
                                      rehypePlugins={[rehypeHighlight]}
                                      className="prose prose-sm max-w-none"
                                    >
                                      {outputs[module.id] || ''}
                                    </ReactMarkdown>
                                  </div>
                                </div>
                                {babyShowHistory.length > 0 && (
                                  <div>
                                    <Label>历史记录</Label>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                      {babyShowHistory.map((_, index) => (
                                        <Button
                                          key={index}
                                          variant={currentHistoryIndex === index ? "secondary" : "outline"}
                                          className="w-10 h-10"
                                          onClick={() => {
                                            setCurrentHistoryIndex(index);
                                            // 同时更新入和输出
                                            const historyItem = babyShowHistory[index];
                                            handleInputChange(module.id, 'text', historyItem.input);
                                            setOutputs(prev => ({
                                              ...prev,
                                              [module.id]: historyItem.output
                                            }));
                                          }}
                                        >
                                          {index + 1}
                                        </Button>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="grid gap-6">
                                {module.inputFields.map(field => (
                                  <div key={field.id}>
                                    {field.type === 'switch' ? (
                                      <div className="flex items-center justify-between">
                                        <Label htmlFor={field.id} className="mr-2">{field.label}</Label>
                                        <Switch
                                          id={field.id}
                                          checked={inputs[module.id]?.[field.id] || false}
                                          onCheckedChange={(checked) => handleInputChange(module.id, field.id, checked)}
                                        />
                                      </div>
                                    ) : field.type === 'input' ? (
                                      <>
                                        <Label htmlFor={field.id}>{field.label}</Label>
                                        <Input
                                          id={field.id}
                                          value={inputs[module.id]?.[field.id] || ''}
                                          onChange={(e) => handleInputChange(module.id, field.id, e.target.value)}
                                        />
                                      </>
                                    ) : field.type === 'textarea' ? (
                                      <>
                                        <Label htmlFor={field.id}>{field.label}</Label>
                                        <Textarea
                                          id={field.id}
                                          value={inputs[module.id]?.[field.id] || ''}
                                          onChange={(e) => handleInputChange(module.id, field.id, e.target.value)}
                                          className="min-h-[150px]"
                                        />
                                        <p className="text-sm text-muted-foreground mt-2">
                                          输入字数：{inputs[module.id]?.[field.id]?.length || 0}
                                        </p>
                                      </>
                                    ) : null}
                                  </div>
                                ))}
                                <Button 
                                  className="bg-teal-500 hover:bg-teal-600 text-white disabled:opacity-50 disabled:cursor-not-allowed" 
                                  onClick={() => handleProcess(category.id, module.id)}
                                  disabled={
                                    isProcessing || 
                                    (module.id === 'correction' && !inputs[module.id]?.correctionInput?.trim()) ||
                                    (module.id === 'video-to-article' && (
                                      !inputs[module.id]?.videoInput?.trim()
                                    )) ||
                                    (module.id === 'summarize' && !inputs[module.id]?.summarizeInput?.trim()) ||
                                    (module.id === 'keyword-extract' && (
                                      !inputs[module.id]?.keywordInput?.trim() ||
                                      !inputs[module.id]?.keywordCount
                                    )) ||
                                    (module.id === 'elderly-article' && !inputs[module.id]?.originalText?.trim()) ||
                                    (module.id === 'baby-show' && !inputs[module.id]?.text?.trim()) ||
                                    (module.id === 'shorts-desc' && (
                                      !inputs[module.id]?.keyword?.trim() ||
                                      !inputs[module.id]?.description?.trim()
                                    ))
                                  }
                                >
                                  {isProcessing ? (
                                    <span className="flex items-center">
                                      正在处理中
                                      <span className="ml-1 animate-[ellipsis_1.5s_infinite]">...</span>
                                    </span>
                                  ) : module.id === 'baby-show' ? '开始生成提示词' : '开始处理'}
                                </Button>
                                <div>
                                  <Label htmlFor={`${module.id}-output`}>
                                    {module.id === 'baby-show' ? '生成的提示词' : '处理结果'}
                                  </Label>
                                  <Textarea
                                    id={`${module.id}-output`}
                                    value={outputs[module.id] || ''}
                                    readOnly
                                    className="min-h-[300px] overflow-y-auto"
                                  />
                                </div>
                              </div>
                            )}
                          </CardContent>
                          <CardFooter>
                            {module.id !== 'baby-show' && module.id !== 'shorts-desc' && (
                              <Button 
                                className="bg-teal-500 hover:bg-teal-600 text-white disabled:opacity-50 disabled:cursor-not-allowed" 
                                onClick={() => copyToClipboard(outputs[module.id] || '')}
                                disabled={!outputs[module.id]?.trim() || !isApiFinished}
                              >
                                复制全
                              </Button>
                            )}
                          </CardFooter>
                        </Card>
                      </TabsContent>
                    ))}
                  </Tabs>
                </div>
              )
            ))}
          </div>
        </div>
      </div>
    </>
  );
}