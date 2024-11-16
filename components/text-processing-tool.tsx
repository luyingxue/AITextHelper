'use client'

import { useState } from 'react'
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

// API call functions (unchanged)
const callWorkflowAPI = async (text: string) => {
  try {
    const response = await fetch('http://192.168.0.100/v1/workflows/run', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer app-YlMtJSBsux9fVSO2CyRp4wL1',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: { text: text },
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

const callVideoToArticleAPI = async (originalText: string, saleBook: boolean, contentType: string, wordLimit: boolean) => {
  try {
    const response = await fetch('http://192.168.0.100/v1/workflows/run', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer app-h9eX3Fln4UeIWfBnvODLCrBj',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: { 
          originalText: originalText,
          saleBook: saleBook ? 'y' : 'n',
          contentType: contentType,
          wordLimit: wordLimit ? 'y' : 'n'
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

const callSummarizeAPI = async (originalText: string, saleBook: boolean) => {
  try {
    const response = await fetch('http://192.168.0.100/v1/workflows/run', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer app-Lvw1h8H3n5IC7CpZK6f8aidh',
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
    const response = await fetch('http://192.168.0.100/v1/workflows/run', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer app-JPdwxEjXZujdUysMi1DtCWGm',
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

    const response = await fetch('http://192.168.0.100/v1/completion-messages', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer app-AJpl5UT5pMI6wpunu9vHsfMo',
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
        name: '关键词提取',
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
      }
    ]
  }
];

export function TextProcessingToolComponent() {
  const [activeCategory, setActiveCategory] = useState(categories[0].id);
  const [activeModule, setActiveModule] = useState(categories[0].modules[0].id);
  const [inputs, setInputs] = useState<Record<string, any>>({});
  const [outputs, setOutputs] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [isApiFinished, setIsApiFinished] = useState(false);
  const [streamingOutput, setStreamingOutput] = useState<string>('');

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
    const category = categories.find(c => c.id === categoryId);
    const module = category?.modules.find(m => m.id === moduleId);
    if (!module) return;

    setIsProcessing(true);
    setIsApiFinished(false);
    setOutputs(prev => ({
      ...prev,
      [moduleId]: ''
    }));

    try {
      if (moduleId === 'correction' || 
          moduleId === 'video-to-article' || 
          moduleId === 'summarize' ||
          moduleId === 'elderly-article' ||
          moduleId === 'baby-show'
      ) {
        const response = await module.processFunction(inputs[moduleId] || {});
        if (response instanceof Response) {
          await handleStreamingResponse(response, moduleId);
        } else {
          setOutputs(prev => ({
            ...prev,
            [moduleId]: response
          }));
        }
      }
      setIsApiFinished(true);
    } catch (error) {
      console.error('处理失败:', error);
      toast.error("处理失败，请重试");
    } finally {
      setIsProcessing(false);
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
          throw new Error('复制失败');
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
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.trim() === '') continue;
          
          if (line.startsWith('data: ')) {
            try {
              const jsonStr = line.slice(6);
              const data = JSON.parse(jsonStr);
              
              // baby show 的响应格式
              if (moduleId === 'baby-show') {
                if (data.event === 'message' && data.answer) {
                  result += data.answer;
                  setOutputs(prev => ({
                    ...prev,
                    [moduleId]: result
                  }));
                }
              } 
              // 一般文字处理等其他模块的响应格式
              else {
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
            }
          }
        }
      }
    } catch (error) {
      console.error('处理响应时出错:', error);
    } finally {
      reader.releaseLock();
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
                                  onClick={() => {
                                    console.log('点击按钮，当前输入:', inputs[module.id]?.text);
                                    handleProcess(category.id, module.id);
                                  }}
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
                                  <Label htmlFor="baby-show-output">输出文本</Label>
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
                                      !inputs[module.id]?.videoInput?.trim() ||
                                      !inputs[module.id]?.contentCategory?.trim()
                                    )) ||
                                    (module.id === 'summarize' && !inputs[module.id]?.summarizeInput?.trim()) ||
                                    (module.id === 'keyword-extract' && (
                                      !inputs[module.id]?.keywordInput?.trim() ||
                                      !inputs[module.id]?.keywordCount
                                    )) ||
                                    (module.id === 'elderly-article' && !inputs[module.id]?.originalText?.trim())
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
                            {module.id !== 'baby-show' && module.id !== 'baby-show' && (
                              <Button 
                                className="bg-teal-500 hover:bg-teal-600 text-white disabled:opacity-50 disabled:cursor-not-allowed" 
                                onClick={() => copyToClipboard(outputs[module.id] || '')}
                                disabled={!outputs[module.id]?.trim() || !isApiFinished}
                              >
                                复制全文
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