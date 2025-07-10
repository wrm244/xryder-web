import { toast } from 'sonner'

export interface Message {
  sender: string
  avatar: React.ReactNode
  text: string
  docs?: string[]
  images?: string[]
}

export interface MessageRenderProps {
  messages: Message[]
  botState: string
}

/**
 * 复制消息内容到剪贴板
 */
export const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    toast.success('复制成功', {
      description: '内容已复制到剪贴板',
      duration: 2000,
    })
  } catch (err) {
    console.error('Failed to copy: ', err)
    toast.error('复制失败', {
      description: '请重试或手动复制',
      duration: 2000,
    })
  }
}
