import React from 'react'
import url from 'url'
import f from 'active-lodash'
const slugify = (str) => f.kebabCase(f.deburr(str))

import {Md} from './Markdown'
import Document from './Document'
import ExampleSection from './ExampleSection'

const RspecStory = ({chapters, config}) => {
  const {
    pageTitle, versionLinkPath, sourceCodeUrlPath, showUselessSteps,
    gitCommit, gitTree
  } = config
  const gitRef = gitCommit || 'master'
  const versionLink = gitTree && url.resolve(versionLinkPath, `./${gitTree}`)
  const sourceCodeLink = url.resolve(sourceCodeUrlPath + './blob/' + gitRef + '/', '.')

  // document-internal link from text, self-links when isHeading
  const NavLink = ({text, isHeading, children}) => {
    const slug = slugify(text || children)
    return <a href={'#' + slug} id={isHeading ? slug : null}>{children}</a>
  }

  const TableOfContents = (chapters) => (
    <ul>
      {f.map(chapters, ([title, sections]) => [

        <li><NavLink text={title}><Md>{title}</Md></NavLink></li>,
        <ul>

          {f.map(sections, ([title, examples]) => [
            <li><NavLink text={title}><Md>{title}</Md></NavLink></li>,
            <ul>

              {f.map(examples, (example, n) => (
                <li key={title + example.description + n}>
                  <NavLink text={`${title}-${example.description}`}>
                    <Md>{example.description}</Md>
                  </NavLink>
                </li>
              ))}

            </ul>
          ])
        }
        </ul>
      ])
    }
    </ul>
  )

  const Chapters = (chapters) => (
    <article>

      {f.map(chapters, ([title, sections]) =>
        <section key={title}>

          <h2 style={{display: 'none'}}><NavLink text={title}><Md>{title}</Md></NavLink></h2>

          {f.map(sections, ([title, examples], index) => [
            <h3><NavLink isHeading text={title}><Md>{title}</Md></NavLink></h3>,

            f.map(examples, (example) => [
              <h4>
                <NavLink isHeading text={`${title}-${example.description}`}>
                  <Md>{example.description}</Md>
                </NavLink>
              </h4>,

              ExampleSection(
                {title, example, config: {sourceCodeLink, showUselessSteps}}),

              ((index < sections.length) && <hr />)

            ])
          ])
        }
        </section>
      )
    }
    </article>
  )

  return (
    <Document>

      <header>
        <h1>
          {pageTitle + ' '}
          {versionLink &&
            <small style={{float: 'right'}}>
              <span style={{top: '0.25em', position: 'relative'}}>🌴 </span>
              <a href={versionLink}><code>{gitTree.slice(0, 8)}</code></a></small>
          }
        </h1>
        <p>generated from RSpec test output</p>
        <h2>Overview</h2>
      </header>

      <aside id='TableOfContents'>
        {TableOfContents(chapters)}
      </aside>

      <hr />

      {Chapters(chapters)}

    </Document>
  )
}

export default RspecStory
