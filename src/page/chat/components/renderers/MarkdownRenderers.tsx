import { Components } from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { darcula } from 'react-syntax-highlighter/dist/esm/styles/prism'

import CodeCopyButton from '@/components/common/CodeCopyButton'

// Markdown 渲染器配置
export const markdownRenderers: Components = {
  p: ({ children, ...props }) => (
    <p
      className="mb-1.5 last:mb-0 leading-relaxed text-sm text-foreground"
      {...props}
    >
      {children}
    </p>
  ),
  ul: ({ children, ...props }) => (
    <ul
      className="list-disc list-inside mb-4 space-y-1 ml-3 text-foreground"
      {...props}
    >
      {children}
    </ul>
  ),
  ol: ({ children, start, ...props }) => {
    const startNumber = start || 1
    return (
      <ol
        start={startNumber}
        className="list-decimal list-inside mb-4 space-y-1 ml-3 text-foreground"
        {...props}
      >
        {children}
      </ol>
    )
  },
  li: ({ children, ...props }) => (
    <li className="leading-relaxed mb-0.5 text-sm text-foreground" {...props}>
      {children}
    </li>
  ),
  h1: ({ children, ...props }) => (
    <h1
      className="text-lg font-bold mb-3 mt-4 first:mt-0 text-foreground"
      {...props}
    >
      {children}
    </h1>
  ),
  h2: ({ children, ...props }) => (
    <h2
      className="text-base font-semibold mb-2 mt-3 first:mt-0 text-foreground"
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3
      className="text-sm font-medium mb-2 mt-3 first:mt-0 text-foreground"
      {...props}
    >
      {children}
    </h3>
  ),
  blockquote: ({ children, ...props }) => (
    <blockquote
      className="border-l-4 border-blue-300 dark:border-blue-700 pl-4 py-2 my-4 bg-blue-50/70 dark:bg-blue-950/30 rounded-r-lg italic text-foreground"
      {...props}
    >
      {children}
    </blockquote>
  ),
  table: ({ children, ...props }) => (
    <div className="overflow-x-auto my-4 rounded-lg border border-border/30 shadow-sm">
      <table
        className="min-w-full border-collapse bg-card text-foreground"
        {...props}
      >
        {children}
      </table>
    </div>
  ),
  th: ({ children, ...props }) => (
    <th
      className="border-b border-border/40 bg-muted/60 px-3 py-2 text-left font-semibold text-xs text-foreground"
      {...props}
    >
      {children}
    </th>
  ),
  td: ({ children, ...props }) => (
    <td
      className="border-b border-border/20 px-3 py-2 text-xs text-foreground"
      {...props}
    >
      {children}
    </td>
  ),
  a: ({ href, children, ...props }) => {
    const isExternal = href?.startsWith('http')
    return (
      <a
        href={href}
        target={isExternal ? '_blank' : '_self'}
        rel={isExternal ? 'noopener noreferrer' : undefined}
        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline transition-colors"
        {...props}
      >
        {children}
        {isExternal && <span className="ml-1 text-xs">↗</span>}
      </a>
    )
  },
  code: (props) => {
    const { className, children } = props
    const match = /language-(\w+)/.exec(className || '')
    const isCodeBlock = match && String(children).includes('\n')

    return isCodeBlock ? (
      <div className="relative my-4 rounded-lg overflow-hidden border border-border/30 bg-card shadow-sm">
        <div className="flex items-center justify-between bg-muted/40 px-3 py-2 border-b border-border/20">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {match[1]}
          </span>
          <CodeCopyButton text={String(children).replace(/\n$/, '')} />
        </div>
        <SyntaxHighlighter
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          style={darcula as any}
          language={match[1]}
          PreTag="div"
          customStyle={{
            margin: 0,
            borderRadius: 0,
            background: 'transparent',
            padding: '0.75rem',
            fontSize: '0.8rem',
            lineHeight: '1.4',
          }}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      </div>
    ) : (
      <code className="bg-muted/60 px-1.5 py-0.5 rounded text-xs font-mono border border-border/30 text-foreground">
        {children}
      </code>
    )
  },
}
