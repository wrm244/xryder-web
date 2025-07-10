import { fetchEventSource } from '@microsoft/fetch-event-source'
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
} from '@radix-ui/react-tooltip'

import React, { useEffect, useRef, useState } from 'react'

import { BookCheck, Code, CornerDownLeft, Mail, Paperclip } from 'lucide-react'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import { BiCircle } from 'react-icons/bi'
import { TiDelete } from 'react-icons/ti'
import { toast } from 'sonner'

import api, { CONFIG, getApiToken } from '@/axiosInstance'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { TooltipContent } from '@/components/ui/tooltip'
import TypingAnimation from '@/components/ui/typing-animation'
import { useAccountStore } from '@/store/accountStore'
import { agentImg, fileImg, generateRandomString, imageImg } from '@/utils'

// 添加CSS动画样式
const welcomeAnimationStyles = `
  @keyframes slideInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`

// 注入样式到页面
if (
  typeof document !== 'undefined' &&
  !document.getElementById('welcome-animations')
) {
  const style = document.createElement('style')
  style.id = 'welcome-animations'
  style.textContent = welcomeAnimationStyles
  document.head.appendChild(style)
}

/**
 * Created by: joetao
 * Created on: 2025/1/13
 * Project: my-app
 * Description: This is a rapid development template for middle and backend UI based on vite, react, tailwindcss and shadcn.
 */

interface Message {
  text: string
  sender: string
  docs: string[]
  images: string[]
  avatar: React.ReactElement
}

interface MessageSenderProps {
  messages: Message[]
  botState: string
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
  setBotState: (state: string) => void
}

interface SuggestionProps {
  message: string
  icon: React.ReactElement
}

interface MessageEvent {
  data: string
}

interface UploadProgressEvent {
  loaded: number
  total?: number
}

const MessageSender: React.FC<MessageSenderProps> = ({
  messages,
  botState,
  setMessages,
  setBotState,
}) => {
  const { account } = useAccountStore()
  const [conversationId, setConversationId] = useState<string>('')
  const [files, setFiles] = useState<string[]>([])
  const [images, setImages] = useState<string[]>([])
  const [uploadPercentage, setUploadPercentage] = useState<number>(0)
  const [uploading, setUploading] = useState<boolean>(false)
  const [input, setInput] = useState<string>('')

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const generatedString = generateRandomString(8)
    setConversationId(generatedString)
    setBotState('ready') // 初始化状态为准备就绪
  }, [setBotState])

  const handleSend = async (question?: string | undefined) => {
    if (botState != 'ready') {
      toast.warning('我还没准备好，请稍等！')
      return
    }
    question = question || input.trim()
    if (question) {
      const newMessages = [
        ...messages,
        {
          text: question,
          sender: 'user',
          docs: files,
          images: images,
          avatar: (
            <img
              src={'data:image/png;base64,' + account.avatar}
              alt="avatar"
              className="w-10 h-10 rounded-full ml-2"
            />
          ),
        },
      ]
      setMessages(newMessages)
      setInput('')
      setFiles([])
      setImages([])
      setBotState('thinking') // 机器人进入思考状态

      // 立即添加机器人消息，显示思考状态
      const botMessage = {
        text: '',
        sender: 'bot',
        avatar: (
          <img
            src={agentImg}
            alt="ChatGPT"
            className="w-10 h-10 rounded-full mt-2 mr-4 bg-card shadow-lg"
          />
        ),
        docs: [],
        images: [],
      }
      const botMessageIndex = newMessages.length
      setMessages([...newMessages, botMessage])

      // 使用ref来累积流式内容，避免状态更新导致的渲染问题
      let streamContent = ''

      await fetchFromOpenAI(question, (msg: MessageEvent) => {
        setBotState('typing') // 机器人进入输入状态

        // 处理流式数据，清理可能的前缀
        let content = msg.data

        // 处理常见的SSE数据前缀
        if (content.startsWith('data: ')) {
          content = content.substring(6)
        }

        // 跳过空数据或结束标记
        if (
          content === '[DONE]' ||
          content === '' ||
          content.trim() === '' ||
          content === 'data: [DONE]'
        ) {
          return
        }

        try {
          // 尝试解析JSON格式的流数据
          const parsed = JSON.parse(content)
          let deltaContent = ''

          // 支持多种流式数据格式
          if (parsed.content) {
            deltaContent = parsed.content
          } else if (parsed.choices && parsed.choices[0]?.delta?.content) {
            deltaContent = parsed.choices[0].delta.content
          } else if (parsed.delta && parsed.delta.content) {
            deltaContent = parsed.delta.content
          } else if (typeof parsed === 'string') {
            deltaContent = parsed
          }

          if (deltaContent) {
            streamContent += deltaContent

            // 批量更新消息内容，减少渲染次数
            setMessages((prevMessages) => {
              const updatedMessages = [...prevMessages]
              updatedMessages[botMessageIndex] = {
                ...updatedMessages[botMessageIndex],
                text: streamContent,
              }
              return updatedMessages
            })
          }
        } catch {
          // 如果不是JSON，可能是纯文本流
          if (content && content !== 'data:' && !content.startsWith('event:')) {
            streamContent += content

            setMessages((prevMessages) => {
              const updatedMessages = [...prevMessages]
              updatedMessages[botMessageIndex] = {
                ...updatedMessages[botMessageIndex],
                text: streamContent,
              }
              return updatedMessages
            })
          }
        }
      })
      setBotState('ready') // 机器人完成输出状态
    }
  }

  const createParams = (question: string) => {
    return new URLSearchParams({
      message: question,
      conversationId,
      files: files.length > 0 ? JSON.stringify(files) : '',
    })
  }
  let isRefreshing = false // 防止重复刷新

  const fetchFromOpenAI = async (
    userInput: string,
    onMessage: (msg: MessageEvent) => void
  ): Promise<void> => {
    const params = createParams(userInput)
    const url = `/api/v1/ai/stream?${params.toString()}`
    await fetchEventSource(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/stream+json',
        Authorization: 'Bearer ' + getApiToken(),
      },
      async onopen() {
        console.log('Connection open: ')
      },
      onmessage(msg: MessageEvent) {
        console.log('接收到的数据:', msg)
        if (msg.data.includes('405') && !isRefreshing) {
          // 设置标志防止重复处理
          isRefreshing = true

          // 显示刷新中的提示
          toast.loading('状态过期，正在重新登陆', {
            id: 'refreshing-token',
            duration: 1500,
          })
          // 等待3秒，跳转到登陆页 /login
          const currentPath =
            window.location.pathname +
            window.location.search +
            window.location.hash
          const loginUrl = `${CONFIG.LOGIN_PATH}?${CONFIG.REDIRECT_PARAM_KEY}=${encodeURIComponent(currentPath)}`
          setTimeout(() => {
            window.location.href = loginUrl
            isRefreshing = false // 重置标志
          }, 1500)
          msg.data = '状态过期，正在重新登陆'
          return // 不继续处理当前消息
        }
        onMessage(msg)
      },
      onerror(err: Error) {
        console.error('Connection error:', err)
        // 处理其他错误逻辑
      },
      openWhenHidden: true,
    })
  }

  const maxFileSize = 5 * 1024 * 1024 // 5MB 文件大小限制
  // 支持的图片类型
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg']
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    if (selectedFile.size > maxFileSize) {
      toast.warning('文件大小超过5MB限制！')
      return
    }
    setFiles([...files, selectedFile.name])
    setUploadPercentage(0)
    setUploading(true)
    uploadFile(selectedFile)
    if (allowedTypes.includes(selectedFile.type)) {
      const reader = new FileReader()
      // 当文件读取完成时触发
      reader.onloadend = () => {
        // 设置读取的图片为Base64格式，并存储在state中
        if (typeof reader.result === 'string') {
          setImages([...images, reader.result])
        }
      }
      // 读取文件为Data URL（Base64）
      reader.readAsDataURL(selectedFile)
    }
  }

  const uploadFile = async (file: File): Promise<void> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('conversationId', conversationId)
    try {
      await api.post('/v1/ai/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: 'Bearer ' + localStorage.getItem('token'),
        },
        onUploadProgress: (progressEvent: UploadProgressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          )
          setUploadPercentage(percentCompleted)
        },
      })
      setUploadPercentage(100)
      setUploading(false)
    } catch {
      setUploadPercentage(0)
      setUploading(false)
    }
  }

  const deleteFile = (f: string) => {
    setFiles((prevFiles) => prevFiles.filter((file) => file !== f))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      // 这里可以添加提交逻辑
      handleSend()
    } else if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault()
      setInput((prevText) => prevText + '\n')
    }
  }

  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${textarea.scrollHeight + 8}px`
      if (textarea.scrollHeight > textarea.clientHeight) {
        textarea.style.overflowY = 'auto'
      } else {
        textarea.style.overflowY = 'hidden'
      }
    }
  }, [input])

  const getSuggestions = (): SuggestionProps[] => {
    return [
      {
        message: '今天有什么新邮件？',
        icon: <Mail className="h-6 w-6 text-green-500" />,
      },
      {
        message: '告诉我一个React的小知识',
        icon: <BookCheck className="h-6 w-6 text-amber-500" />,
      },
      {
        message: '如何写出优秀的Java代码？',
        icon: <Code className="h-6 w-6 text-cyan-500" />,
      },
    ]
  }
  return (
    <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Welcome Screen */}
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <div className="max-w-2xl text-center space-y-8">
            {/* 简洁的AI头像 */}
            <div className="relative mb-6">
              <div className="w-16 h-16 mx-auto flex items-center justify-center text-6xl cursor-pointer group transition-transform duration-300 hover:scale-110">
                <span className="group-hover:scale-110 transition-transform duration-300">
                  🤖
                </span>
              </div>
            </div>

            {/* 欢迎文字 */}
            <div className="space-y-4">
              <TypingAnimation
                className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent"
                text="你好！我是你的智能助手"
                duration={80}
              />
              <p className="text-muted-foreground text-base max-w-lg mx-auto leading-relaxed">
                我可以帮助您解答问题、处理文档、分析数据等。选择下面的建议开始对话，或者直接输入您的问题。
              </p>
            </div>

            {/* 精致的建议卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10">
              {getSuggestions().map(
                (suggestion: SuggestionProps, index: number) => (
                  <div
                    key={index}
                    onClick={() => handleSend(suggestion.message)}
                    className="group relative p-4 rounded-xl border border-border/40 hover:border-blue-300/60 bg-card/40 hover:bg-card/70 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 backdrop-blur-sm"
                    style={{
                      animation: `slideInUp 0.4s ease-out ${index * 80}ms both`,
                    }}
                  >
                    <div className="flex flex-col items-center text-center gap-3">
                      <div className="flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
                        {suggestion.icon}
                      </div>
                      <span className="text-sm font-medium text-foreground/80 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 leading-relaxed">
                        {suggestion.message}
                      </span>
                    </div>

                    {/* 微妙的悬停效果 */}
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="max-w-4xl mx-auto p-4 space-y-4">
        {/* File Attachments */}
        {files.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {files.map((f: string, index) => (
              <div
                key={index}
                className="group relative flex-shrink-0 bg-card/80 backdrop-blur-md border border-border/30 rounded-lg p-2.5 min-w-[180px] shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-md bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 flex items-center justify-center shadow-sm">
                    {['png', 'jpeg', 'jpg'].includes(
                      f.split('.').pop() || ''
                    ) ? (
                      <img src={imageImg} alt="image" className="w-4 h-4" />
                    ) : (
                      <img src={fileImg} alt="file" className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{f}</p>
                    <p className="text-xs text-muted-foreground/70">
                      {f.split('.').pop()?.toUpperCase()} 文件
                    </p>
                  </div>

                  {/* Upload Progress */}
                  {uploading && files.length === index + 1 && (
                    <div className="w-5 h-5">
                      <CircularProgressbar
                        value={uploadPercentage}
                        strokeWidth={12}
                        styles={buildStyles({
                          pathColor: '#3b82f6',
                          trailColor: '#e5e7eb',
                        })}
                      />
                    </div>
                  )}

                  {/* Delete Button */}
                  <button
                    onClick={() => deleteFile(f)}
                    className="opacity-0 group-hover:opacity-100 transition-all duration-200 p-1 hover:bg-red-50 dark:hover:bg-red-950 rounded-md hover:scale-110"
                  >
                    <TiDelete className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Input Box */}
        <div className="relative rounded-2xl border-2 border-border/30 bg-card/80 backdrop-blur-md shadow-lg hover:shadow-xl focus-within:ring-2 focus-within:ring-blue-500/30 focus-within:border-blue-400 transition-all duration-300 group">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入您的问题，按 Enter 发送，Shift + Enter 换行..."
            className="min-h-[50px] max-h-[180px] resize-none border-0 bg-transparent p-3 text-sm placeholder:text-muted-foreground/60 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-2xl"
            disabled={botState !== 'ready'}
          />

          {/* Action Buttons */}
          <div className="flex items-center justify-between p-3 pt-0">
            <div className="flex items-center gap-2">
              {/* File Upload */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <label className="inline-flex items-center justify-center rounded-lg p-2 text-muted-foreground hover:text-foreground hover:bg-muted/60 cursor-pointer transition-all duration-200 hover:scale-105">
                      <Paperclip className="h-4 w-4" />
                      <input
                        type="file"
                        onChange={handleFileChange}
                        className="hidden"
                        accept=".doc, .docx, .csv, .txt, .pdf, .xls, .xlsx, .png, .jpg, .jpeg"
                      />
                    </label>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p className="text-xs">上传文件</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Send Button */}
            <div className="flex items-center gap-2">
              {botState === 'typing' ? (
                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-lg">
                  <BiCircle className="h-3 w-3 animate-spin text-blue-500" />
                  <span>AI 正在回复...</span>
                </div>
              ) : (
                <Button
                  onClick={() => handleSend()}
                  disabled={botState !== 'ready' || !input.trim()}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-lg text-sm shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
                >
                  <span className="mr-1.5 font-medium">发送</span>
                  <CornerDownLeft className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground/70 bg-muted/20 px-3 py-1.5 rounded-lg">
          AI 生成的内容可能不准确，请仔细核实相关信息
        </p>
      </div>
    </div>
  )
}

export default MessageSender
