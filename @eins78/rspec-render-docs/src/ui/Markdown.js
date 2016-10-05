import React from 'react'
import ReactMarkdown from 'react-markdown'

// inline-only markdown
export const Md = ({children}) => (
  <ReactMarkdown source={children} escapeHtml
    unwrapDisallowed allowedTypes={['Text', 'Strong', 'Emph', 'Code']} />
)
