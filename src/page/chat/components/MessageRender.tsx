/**
 * 消息渲染组件
 * Created by: joetao
 * Created on: 2025/1/13
 * Updated on: 2025/7/10
 * Project: my-app
 * Description: 这是一个聊天界面的消息渲染组件，支持 Markdown 格式、代码块和文件展示
 */
import { useEffect, useRef } from 'react'

import { injectStyles } from '../styles/messageAnimations'
import { type MessageRenderProps } from '../utils/messageUtils'
import MessageAvatar from './renderers/MessageAvatar'
import MessageBubble from './renderers/MessageBubble'
import MessageFooter from './renderers/MessageFooter'

// 注入样式到页面
injectStyles()

const MessageRender: React.FC<MessageRenderProps> = ({
  messages,
  botState,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
    scrollToBottom()
  }, [messages])

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-br from-background via-background to-muted/20 relative">
      {/* 添加背景装饰 */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 via-transparent to-indigo-50/20 dark:from-blue-950/10 dark:via-transparent dark:to-indigo-950/10 pointer-events-none" />
      <div className="relative max-w-4xl mx-auto px-4 py-6">
        {messages.map((msg, index) => {
          const isLastMessage = index === messages.length - 1
          const isBot = msg.sender === 'bot'
          const isUser = msg.sender === 'user'

          return (
            <div
              key={index}
              className={`group mb-4 transition-all duration-500 ease-out ${
                isUser ? 'flex justify-end' : 'flex justify-start'
              }`}
              style={{
                animation: isUser
                  ? `slideInRight 0.6s ease-out ${index * 0.1}s both`
                  : `slideInLeft 0.6s ease-out ${index * 0.1}s both`,
                transform: 'translateX(0)',
              }}
            >
              <div
                className={`flex max-w-[80%] ${
                  isUser ? 'flex-row-reverse' : 'flex-row'
                } gap-2.5`}
              >
                {/* Avatar */}
                <MessageAvatar isBot={isBot} />

                {/* Message Content */}
                <div
                  className={`flex-1 ${
                    isUser ? 'items-end' : 'items-start'
                  } flex flex-col`}
                >
                  {/* Message Bubble */}
                  <MessageBubble
                    msg={msg}
                    isUser={isUser}
                    isBot={isBot}
                    isLastMessage={isLastMessage}
                  />

                  {/* Timestamp and status */}
                  <MessageFooter
                    isUser={isUser}
                    isLastMessage={isLastMessage}
                    isBot={isBot}
                    botState={botState}
                  />
                </div>
              </div>
            </div>
          )
        })}

        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}

export default MessageRender
