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

// 添加API调用函数在文件开头
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

// 修改API调用函数
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

// 添加新的API调用函数
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

// 定义工具模块的接口
interface ToolModule {
  id: string;
  name: string;
  inputFields: {
    type: 'textarea' | 'input' | 'checkbox' | 'switch';
    label: string;
    id: string;
  }[];
  processFunction: (inputs: Record<string, any>) => string;
}

// 定义工具模块
const toolModules: ToolModule[] = [
  {
    id: 'correction',
    name: '文本纠错',
    inputFields: [
      { type: 'textarea', label: '需要纠错的文本', id: 'correctionInput' }
    ],
    processFunction: (inputs) => {
      return inputs.correctionInput;
    }
  },
  {
    id: 'video-to-article',
    name: '视频号文章转公众号（社科类）',
    inputFields: [
      { type: 'switch', label: '是否卖书', id: 'sellBook' },
      { type: 'input', label: '内容类别', id: 'contentCategory' },
      { type: 'switch', label: '最低字数要求', id: 'wordLimit' },
      { type: 'textarea', label: '视频文案', id: 'videoInput' }
    ],
    processFunction: (inputs) => {
      return inputs.videoInput;
    }
  },
  {
    id: 'summarize',
    name: '标题和摘要（社科类）',
    inputFields: [
      { type: 'switch', label: '是否卖书', id: 'sellBook' },
      { type: 'textarea', label: '需要摘要的文本', id: 'summarizeInput' }
    ],
    processFunction: (inputs) => {
      return inputs.summarizeInput;
    }
  },
  {
    id: 'keyword-extract',
    name: '关键词提取',
    inputFields: [
      { type: 'textarea', label: '需要提取关键词的文本', id: 'keywordInput' },
      { type: 'input', label: '关键词数量', id: 'keywordCount' }
    ],
    processFunction: (inputs) => {
      // 这里应该是实际的关键词提取逻辑
      const words = inputs.keywordInput.split(' ');
      return words.slice(0, Number(inputs.keywordCount)).join(', ');
    }
  }
];

export function TextProcessingToolComponent() {
  const [activeTab, setActiveTab] = useState(toolModules[0].id)
  const [inputs, setInputs] = useState<Record<string, any>>({})
  const [outputs, setOutputs] = useState<Record<string, string>>({})
  const [isProcessing, setIsProcessing] = useState(false)
  const [isApiFinished, setIsApiFinished] = useState(false)

  const handleInputChange = (moduleId: string, fieldId: string, value: any) => {
    setInputs(prev => ({
      ...prev,
      [moduleId]: {
        ...prev[moduleId],
        [fieldId]: value
      }
    }))
  }

  // 修改handleProcess函数
  const handleProcess = async (moduleId: string) => {
    const module = toolModules.find(m => m.id === moduleId);
    if (!module) return;

    setIsProcessing(true);
    setIsApiFinished(false);
    // 清空之前的输出结果
    setOutputs(prev => ({
      ...prev,
      [moduleId]: ''
    }));

    try {
      let response;
      if (moduleId === 'correction') {
        // 原有的文本纠错逻辑...
        const inputText = inputs[moduleId]?.correctionInput || '';
        response = await callWorkflowAPI(inputText);
      } else if (moduleId === 'video-to-article') {
        // 新增的视频文案转换逻辑
        const videoInput = inputs[moduleId]?.videoInput || '';
        const sellBook = inputs[moduleId]?.sellBook || false;
        const contentCategory = inputs[moduleId]?.contentCategory || '';
        const wordLimit = inputs[moduleId]?.wordLimit || false;
        response = await callVideoToArticleAPI(videoInput, sellBook, contentCategory, wordLimit);
      } else if (moduleId === 'summarize') {
        // 新增的摘要处理逻辑
        const summarizeInput = inputs[moduleId]?.summarizeInput || '';
        const sellBook = inputs[moduleId]?.sellBook || false;
        response = await callSummarizeAPI(summarizeInput, sellBook);
      } else {
        // 其他模块的原有处理逻辑...
        const result = module.processFunction(inputs[moduleId] || {});
        setOutputs(prev => ({
          ...prev,
          [moduleId]: result
        }));
        setIsApiFinished(true);
        setIsProcessing(false);
        return;
      }

      // 处理streaming响应
      const reader = response.body!.getReader();
      let result = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          setIsApiFinished(true);
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
              
              // 检查是否是text_chunk事件，实时显示本块
              if (data.event === 'text_chunk' && data.data.text) {
                result += data.data.text;
                setOutputs(prev => ({
                  ...prev,
                  [moduleId]: result
                }));
              }
              // 如果是workflow_finished事件，确保显示最终结果
              else if (data.event === 'workflow_finished' && data.data.outputs?.text) {
                result = data.data.outputs.text;
                setOutputs(prev => ({
                  ...prev,
                  [moduleId]: result
                }));
              }
            } catch (e) {
              console.error('JSON解析错误:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('处理失败:', error);
      toast("处理失败，请重试", {
        duration: 2000,
        position: "top-center",
        style: {
          background: '#EF4444',
          color: 'white',
        }
      });
    } finally {
      setIsProcessing(false);
    }
  }

  // 修改copyToClipboard函数
  const copyToClipboard = async (text: string) => {
    try {
      // 首先尝试使用现代的 Clipboard API
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        toast("已复制到剪贴板", {
          duration: 1500,
        });
      } else {
        // 回退到传统方法
        const textArea = document.createElement('textarea');
        textArea.value = text;
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
          });
        } catch (err) {
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

  return (
    <>
      <Toaster />
      
      <div className="container mx-auto p-4 bg-slate-50">
        <h1 className="text-2xl font-bold mb-4 text-slate-700">自媒体文本处理工具</h1>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            {toolModules.map(module => (
              <TabsTrigger key={module.id} value={module.id} className="data-[state=active]:bg-white data-[state=active]:text-teal-600">{module.name}</TabsTrigger>
            ))}
          </TabsList>
          {toolModules.map(module => (
            <TabsContent key={module.id} value={module.id}>
              <Card className="bg-white shadow-sm border-slate-100">
                <CardHeader>
                  <CardTitle>{module.name}</CardTitle>
                </CardHeader>
                <CardContent className="bg-slate-50">
                  <div className="grid gap-6">
                    <div className="grid grid-cols-2 gap-4">
                      {module.inputFields.filter(field => field.type === 'switch').map(field => (
                        <div key={field.id} className="flex items-center justify-between">
                          <Label htmlFor={field.id} className="mr-2">{field.label}</Label>
                          <Switch
                            id={field.id}
                            checked={inputs[module.id]?.[field.id] || false}
                            onCheckedChange={(checked) => handleInputChange(module.id, field.id, checked)}
                          />
                        </div>
                      ))}
                    </div>
                    {module.inputFields.filter(field => field.type === 'input').map(field => (
                      <div key={field.id}>
                        <Label htmlFor={field.id}>{field.label}</Label>
                        <Input
                          id={field.id}
                          value={inputs[module.id]?.[field.id] || ''}
                          onChange={(e) => handleInputChange(module.id, field.id, e.target.value)}
                        />
                      </div>
                    ))}
                    {module.inputFields.filter(field => field.type === 'textarea').map(field => (
                      <div key={field.id}>
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
                      </div>
                    ))}
                    {module.inputFields.filter(field => field.type === 'checkbox').map(field => (
                      <div key={field.id}>
                        <Label htmlFor={field.id}>{field.label}</Label>
                        <Checkbox
                          id={field.id}
                          checked={inputs[module.id]?.[field.id] || false}
                          onCheckedChange={(checked) => handleInputChange(module.id, field.id, checked)}
                        />
                      </div>
                    ))}
                    <Button 
                      className="bg-teal-500 hover:bg-teal-600 text-white disabled:opacity-50 disabled:cursor-not-allowed" 
                      onClick={() => handleProcess(module.id)}
                      disabled={
                        isProcessing || 
                        (module.id === 'correction' && !inputs[module.id]?.correctionInput?.trim()) ||
                        (module.id === 'video-to-article' && !inputs[module.id]?.videoInput?.trim())
                      }
                    >
                      {isProcessing ? (
                        <span className="flex items-center">
                          正在处理中
                          <span className="ml-1 animate-[ellipsis_1.5s_infinite]">...</span>
                        </span>
                      ) : '开始处理'}
                    </Button>
                    <div>
                      <Label htmlFor={`${module.id}-output`}>处理结果</Label>
                      <Textarea
                        id={`${module.id}-output`}
                        value={outputs[module.id] || ''}
                        readOnly
                        className="min-h-[150px]"
                      />
                      <p className="text-sm text-muted-foreground mt-2">输出字数：{outputs[module.id]?.length || 0}</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="bg-teal-500 hover:bg-teal-600 text-white disabled:opacity-50 disabled:cursor-not-allowed" 
                    onClick={() => copyToClipboard(outputs[module.id] || '')}
                    disabled={!outputs[module.id]?.trim() || !isApiFinished}
                  >
                    复制全文
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </>
  )
}