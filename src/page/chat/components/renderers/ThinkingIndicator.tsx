import React from 'react'

import Lottie from 'lottie-react'

import aiAnimation from '@/assets/lottie/ai.json'

/**
 * AI思考中的状态组件
 */
const ThinkingIndicator: React.FC = () => {
  return (
    <div className="flex items-center gap-2 py-2">
      <div className="w-3 h-3">
        <Lottie animationData={aiAnimation} loop={true} />
      </div>
      <span className="text-sm font-medium text-muted-foreground">
        正在思考...
      </span>
    </div>
  )
}

export default ThinkingIndicator
