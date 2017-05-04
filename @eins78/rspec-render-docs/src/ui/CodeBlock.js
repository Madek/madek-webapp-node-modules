import React from 'react'

import SyntaxHighlighter from 'react-syntax-highlighter/dist/light'
import githubGistStyle from 'react-syntax-highlighter/dist/styles/github-gist'

import lowlight from 'lowlight/lib/core'
import jsonHighlight from 'highlight.js/lib/languages/json'
import rubyHighlight from 'highlight.js/lib/languages/ruby'

lowlight.registerLanguage('json', jsonHighlight)
lowlight.registerLanguage('ruby', rubyHighlight)

const CodeBlock = ({l, children}) => (
  <SyntaxHighlighter
    language={l}
    style={githubGistStyle}
    customStyle={{background: null}}
    children={children || ''}
  />
)

export default CodeBlock
