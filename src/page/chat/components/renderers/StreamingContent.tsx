import React from 'react'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import { markdownRenderers } from './MarkdownRenderers'

interface StreamingContentProps {
  text: string
  isLastMessage: boolean
  isBot: boolean
}

/**
 * 流式渲染组件 - 处理 AI 回复的实时渲染
 */
export const StreamingContent: React.FC<StreamingContentProps> = ({
  text,
  isBot,
}) => {
  if (!isBot) {
    return <span className="whitespace-pre-wrap break-words">{text}</span>
  }

  // 用于调试
  if (process.env.NODE_ENV === 'development') {
    console.log('原文JSON格式：', JSON.stringify(text))
    console.log('换行符数量：', (text.match(/\n/g) || []).length)
  }

  const processedText = processText(text)

  return (
    <div className="relative">
      <ReactMarkdown
        className="markdown-body prose prose-sm max-w-none dark:prose-invert"
        remarkPlugins={[remarkGfm]}
        components={markdownRenderers}
      >
        {processedText}
      </ReactMarkdown>
    </div>
  )
}

/**
 * 处理文本，优化 Markdown 格式
 */
const processText = (text: string) => {
  // 1. 先保护代码块，避免在代码块内进行文本合并
  const codeBlocks: string[] = []
  const CODE_BLOCK_PLACEHOLDER = '___CODE_BLOCK_PLACEHOLDER___'

  // 提取代码块（包括不完整的代码块）
  let textWithPlaceholders = text.replace(/```[\s\S]*?```/g, (match) => {
    codeBlocks.push(match)
    return `${CODE_BLOCK_PLACEHOLDER}${codeBlocks.length - 1}`
  })

  // 也处理单行代码块
  textWithPlaceholders = textWithPlaceholders.replace(/`[^`\n]*`/g, (match) => {
    codeBlocks.push(match)
    return `${CODE_BLOCK_PLACEHOLDER}${codeBlocks.length - 1}`
  })

  // 确保标题和列表项前有换行符，但要排除横线规则和星号
  textWithPlaceholders = textWithPlaceholders.replace(
    /(\S)(?<!-)(#+\s|[-+]\s|\d+\.\s|>\s)/g,
    '$1\n$2',
  )

  // 修复 Markdown 格式问题：为标题和列表项添加缺失的空格
  textWithPlaceholders = textWithPlaceholders
    // 处理标题, 例如 ###title -> ### title
    .replace(/^(#+)([^\s#])/gm, '$1 $2')
    // 处理列表项, 例如 -item -> - item
    .replace(/^(\s*[-*+])([^\s])/gm, '$1 $2')
    // 处理数字列表项, 例如 1.item -> 1. item
    .replace(/^(\s*\d+\.)([^\s])/gm, '$1 $2')
    // 处理引言, 例如 >quote -> > quote
    .replace(/^(\s*>)([^\s>])/gm, '$1 $2')

  // 2. 简化换行处理：保留必要的结构，避免破坏Markdown格式
  // 将连续的换行符规范化，但保持列表和段落结构
  let processedText = textWithPlaceholders
    // 将3个或更多换行符转为双换行（段落分隔）
    .replace(/\n{3,}/g, '\n\n')
    // 对于列表项，保持其结构不变
    .replace(/\n(?=\s*-\s)/g, '\n')
    // 对于其他单个换行
    .replace(/\n(?!\s*-\s)(?!\n)/g, '\n')

  console.log('处理后的文本：', processedText)
  // 3. 恢复代码块
  codeBlocks.forEach((codeBlock, index) => {
    const placeholder = `${CODE_BLOCK_PLACEHOLDER}${index}`
    processedText = processedText.replace(placeholder, codeBlock)
  })

  return processedText.trim()
}

export default StreamingContent
