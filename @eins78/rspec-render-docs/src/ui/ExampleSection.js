import React from 'react'
import url from 'url'
import f from 'active-lodash'
import ReactMarkdown from 'react-markdown'

import CodeBlock from './CodeBlock'

const ExampleSection = ({title, example, config}) => {
  const {sourceCodeLink, showUselessSteps} = config
  const {description, file_path, source} = example
  const [lineNumber, sourceBlock] = [example.line_number, example.source_block]
  const fileName = f.present(file_path) &&
    file_path.replace(/^\.\//, '') +
    (lineNumber ? ':' + lineNumber : '')

  const githubLink = fileName && f.isNumber(lineNumber) &&
    url.resolve(sourceCodeLink, file_path) +
    (lineNumber ? '#L' + lineNumber : '')

  const lines = description.split('\n')
  const steps = lines.slice(1).join('\n')
  const showSteps = steps || showUselessSteps

  return (<div>

    {showSteps && <h6>Steps</h6>}
    {showSteps && <ReactMarkdown source={steps || description} />}

    <h6>
      {'Source '}
      {fileName && <a href={githubLink} style={{float: 'right'}}><kbd>{fileName}</kbd></a>}
    </h6>

    <CodeBlock l='ruby'>{sourceBlock}</CodeBlock>

    <div className='hook-debug' style={{display: 'none'}}>
      <CodeBlock l='ruby'>{source}</CodeBlock>
      <CodeBlock l='json'>{JSON.stringify(example, 0, 2)}</CodeBlock>
    </div>

  </div>)
}

export default ExampleSection
