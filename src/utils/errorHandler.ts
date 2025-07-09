/**
 * 通用错误处理工具
 */

/**
 * 提取错误信息
 * @param error 错误对象
 * @param defaultMessage 默认错误信息
 * @returns 错误信息字符串
 */
export const extractErrorMessage = (
  error: unknown,
  defaultMessage = '操作失败'
): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const response = error.response as { data?: { msg?: string } }
    return response?.data?.msg || defaultMessage
  }
  return defaultMessage
}

/**
 * 通用的异步操作包装器
 * @param operation 异步操作函数
 * @param loadingKey 加载状态的键名
 * @param set zustand 的 set 函数
 * @param errorMessage 自定义错误信息
 */
export const handleAsyncOperation = async <T>(
  operation: () => Promise<T>,
  loadingKey: string,
  set: (partial: Record<string, unknown>) => void,
  errorMessage?: string
): Promise<T | undefined> => {
  set({ [loadingKey]: true, error: null })

  try {
    const result = await operation()
    set({ [loadingKey]: false })
    return result
  } catch (error: unknown) {
    const msg = extractErrorMessage(error, errorMessage)
    set({ error: msg, [loadingKey]: false })
    return undefined
  }
}
