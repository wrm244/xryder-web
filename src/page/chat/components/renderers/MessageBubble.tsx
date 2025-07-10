import React from 'react'

import { Copy } from 'lucide-react'

import { Button } from '@/components/ui/button'

import { type Message, copyToClipboard } from '../../utils/messageUtils'
import StreamingContent from './StreamingContent'
import ThinkingIndicator from './ThinkingIndicator'
import UserFileDisplay from './UserFileDisplay'

interface MessageBubbleProps {
  msg: Message
  isUser: boolean
  isBot: boolean
  isLastMessage: boolean
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  msg,
  isUser,
  isBot,
  isLastMessage,
}) => {
  return (
    <div
      className={`relative px-4 py-3 rounded-xl shadow-md backdrop-blur-md max-w-full transition-all duration-300 message-hover-glow ${
        isUser
          ? 'bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 text-white rounded-br-md shadow-blue-500/30 user-message-glow'
          : 'bg-white/95 dark:bg-gray-800/95 border border-gray-200/80 dark:border-gray-700/80 rounded-bl-md backdrop-blur-md'
      }`}
    >
      {/* User Message Files */}
      {isUser && <UserFileDisplay docs={msg.docs} images={msg.images} />}

      {/* Message Text */}
      {msg.text ? (
        <div
          className={`prose prose-sm max-w-none leading-relaxed ${
            isUser
              ? 'text-white prose-headings:text-white prose-strong:text-white prose-code:text-white prose-pre:text-white prose-p:text-white'
              : 'text-foreground dark:prose-invert prose-p:leading-relaxed prose-p:text-sm'
          }`}
        >
          <StreamingContent
            text={msg.text}
            isLastMessage={isLastMessage && isBot}
            isBot={isBot}
          />
        </div>
      ) : (
        // 当消息为空且是机器人消息时，显示思考动画
        isBot && <ThinkingIndicator />
      )}

      {/* Copy Button - only for bot messages */}
      {isBot && msg.text && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute -bottom-1 -right-1 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white/95 dark:bg-gray-800/95 border border-gray-200/90 dark:border-gray-700/90 shadow-md hover:shadow-lg scale-90 hover:scale-100 backdrop-blur-md copy-button-animated"
          onClick={() => copyToClipboard(msg.text || '')}
        >
          <Copy className="h-3 w-3" />
        </Button>
      )}
    </div>
  )
}

export default MessageBubble
