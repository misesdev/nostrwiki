'use client'

import React from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

type MarkdownProps = {
    content: string
}

const MarkdownContent = ({ content }: MarkdownProps) => {
    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
                a: ({ node, ...props }) => (
                    <a
                        {...props}
                        className="mx-2 text-blue-400 hover:underline break-all"
                        target="_blank"
                        rel="noopener noreferrer"
                    />
                ),
                blockquote: ({ node, ...props }) => (
                    <blockquote
                        {...props}
                        className="border-l-4 border-purple-400 pl-3 italic text-gray-400 my-2 break-words"
                    />
                ),
                ul: ({ node, ...props }) => (
                    <ul {...props} className="list-disc list-inside text-gray-300 my-2 break-words" />
                ),
                ol: ({ node, ...props }) => (
                    <ol {...props} className="list-decimal list-inside text-gray-300 my-2 break-words" />
                ),
                li: ({ node, ...props }) => (
                    <li {...props} className="ml-4 my-1 text-gray-300 break-words" />
                ),
                strong: ({ node, ...props }) => (
                    <strong className="font-semibold text-white break-words" {...props} />
                ),
                em: ({ node, ...props }) => (
                    <em className="italic text-gray-400 break-words" {...props} />
                ),
                code: ({ node, ...props }) => (
                    <code className="bg-gray-800 px-1 rounded text-purple-300 break-words" {...props} />
                ),
                p: ({ node, ...props }) => (
                    <p
                        {...props}
                        className="text-gray-200 dark:text-gray-300 text-sm break-words whitespace-pre-wrap"
                    />
                )
            }}
        >
            {content.replaceAll("nostr:", "")}
        </ReactMarkdown>
    )
}

export default MarkdownContent
