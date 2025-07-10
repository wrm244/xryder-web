import React from 'react'

import AgentAvatar from '../../../../assets/agent.svg'

interface MessageAvatarProps {
  isBot: boolean
}

/**
 * 消息头像组件
 */
const MessageAvatar: React.FC<MessageAvatarProps> = ({ isBot }) => {
  return (
    <div className="flex-shrink-0 relative group">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-md ring-2 ring-white/90 dark:ring-gray-700/90 transition-all duration-300 group-hover:ring-4 avatar-bounce ${
          isBot
            ? 'group-hover:ring-blue-200 dark:group-hover:ring-blue-800/50'
            : 'group-hover:ring-green-200 dark:group-hover:ring-green-800/50'
        }`}
      >
        <span className="flex items-center justify-center w-full h-full">
          {isBot ? (
            <img src={AgentAvatar} alt="Bot Avatar" className="w-8 h-8" />
          ) : (
            '👤'
          )}
        </span>
      </div>
    </div>
  )
}

export default MessageAvatar
