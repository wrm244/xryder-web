import React from 'react'

interface MessageFooterProps {
  isUser: boolean
  isLastMessage: boolean
  isBot: boolean
  botState: string
}

const MessageFooter: React.FC<MessageFooterProps> = ({
  isUser,
  isLastMessage,
  isBot,
  botState,
}) => {
  return (
    <div
      className={`flex items-center gap-2 mt-2 px-2 ${
        isUser ? 'justify-end' : 'justify-start'
      }`}
    >
      <span className="text-xs text-muted-foreground/70">
        {new Date().toLocaleTimeString('zh-CN', {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </span>
      {isLastMessage && isBot && botState === 'typing' && (
        <div className="flex items-center gap-1">
          <div className="flex gap-0.5">
            <div
              className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"
              style={{ animationDelay: '0ms' }}
            ></div>
            <div
              className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"
              style={{ animationDelay: '150ms' }}
            ></div>
            <div
              className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"
              style={{ animationDelay: '300ms' }}
            ></div>
          </div>
          <span className="text-xs text-blue-500 font-medium">正在输入</span>
        </div>
      )}
    </div>
  )
}

export default MessageFooter
