"use client"

import { memo } from "react"
import ReactMarkdown from "react-markdown"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism"

const MemoizedMarkdown = memo(({ content, id }: { content: string; id: string }) => {
  return (
    <ReactMarkdown
      components={{
        // Only customize code blocks to add syntax highlighting
        code({ node, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || "")
          const language = match ? match[1] : ""

          // If it's a code block (not inline)
            return (
              <div className="not-prose my-2">
                <SyntaxHighlighter
                  language={language}
                  style={oneDark}
                  customStyle={{
                    borderRadius: "0.375rem",
                    margin: 0,
                    fontSize: "0.875rem",
                  }}
                >
                  {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
              </div>
            )
        },
      }}
    >
      {content}
    </ReactMarkdown>
  )
})

MemoizedMarkdown.displayName = "MemoizedMarkdown"

export { MemoizedMarkdown }