import React from 'react'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { githubGistStyle } from 'react-syntax-highlighter/dist/styles'

const CodeBlock = ({l, children}) => (
  <SyntaxHighlighter language={l} style={githubGistStyle}
    customStyle={{background: null}} children={children || ''} />
)

export default CodeBlock
