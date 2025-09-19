'use client'

import React from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import AppImage from "../commons/AppImage"

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
            className="mx-2 text-blue-400 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          />
        ),
        blockquote: ({ node, ...props }) => (
          <blockquote
            {...props}
            className="border-l-4 border-purple-400 pl-3 italic text-gray-400 my-2"
          />
        ),
        ul: ({ node, ...props }) => (
          <ul {...props} className="list-disc list-inside text-gray-300 my-2" />
        ),
        ol: ({ node, ...props }) => (
          <ol {...props} className="list-decimal list-inside text-gray-300 my-2" />
        ),
        li: ({ node, ...props }) => (
          <li {...props} className="ml-4 my-1 text-gray-300" />
        ),
        // img: ({ node, ...props }) => (
        //   <AppImage

        //     {...props}
        //     className="rounded-lg max-w-full my-2"
        //     alt={props.alt ?? ""}
        //   />
        // ),
        strong: ({ node, ...props }) => (
            <strong className="font-semibold text-white" {...props} />
        ),
        em: ({ node, ...props }) => (
            <em className="italic text-gray-400" {...props} />
        ),
        code: ({ node, ...props }) => (
            <code className="bg-gray-800 px-1 rounded text-purple-300" {...props} />
        ),
        // evita quebra de linha automática
        p: ({ node, ...props }) => <span className="text-gray-200 dark:text-gray-300 text-sm" {...props} /> 
      }}
    >
      {content.replaceAll("nostr:", "")}
    </ReactMarkdown>
  )
}

export default MarkdownContent
