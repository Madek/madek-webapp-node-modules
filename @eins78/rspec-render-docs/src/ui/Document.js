import React from 'react'

const Document = ({pageTitle, children}) => (
  <html>
    <head>
      <meta charSet='utf-8' />
      <title>{pageTitle}</title>
      {/* steal a stolen version of github's markdown doc style: */}
      <link rel='stylesheet' href='https://cdn.rawgit.com/sindresorhus/github-markdown-css/gh-pages/github-markdown.css' />
      <style>{'.markdown-body { box-sizing: border-box; min-width: 200px; max-width: 980px; margin: 0 auto; padding: 45px;}'}</style>
    </head>
    <body className='markdown-body'>{children}</body>
  </html>
)

export default Document
