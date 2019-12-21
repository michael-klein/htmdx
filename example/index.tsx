/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { injectGlobal } from 'emotion';
import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { htmdx } from '../dist';
import htm from 'htm';
import ErrorBoundary from 'react-error-boundary';

injectGlobal`
  @import url('https://fonts.googleapis.com/css?family=Inria+Serif|Roboto|Roboto+Mono&display=swap');
  * {
    box-sizing: border-box;
  }
  body, html {
    height: 100%;
    padding: 0;
    margin: 0;
  }
  #root {
    height: 100%;
  }
  body {
    font-family: 'Roboto', sans-serif;
  }
`;

const html = htm.bind(React.createElement);

function TestComponent(props) {
  return html`
    <div>hello ${props.children}</div>
  `;
}

const markDownWithJSX = ` 
# hello world

## this is an input that actually prints something to the console on change:

<input type="text" value=\${"lol"} onChange=\${e => console.log(e.target.value)}/>

## Here is a simple component:

<TestComponent>world</TestComponent>


## Some simple code highlighting:

\`\`\`
function hi() {
  console.log("hi")   
}
\`\`\`
`;
const padding = 8;

const ErrorComponent = ({ componentStack, error }) => (
  <div
    css={css`
      padding: ${padding}px;
      background: #d58686;
      color: white;
      overflow: auto;
      flex: auto;
    `}
  >
    <p>
      <strong>Oops! An error occured!</strong>
    </p>
    <p>Here’s what we know…</p>
    <p>
      <strong>Error:</strong>{' '}
      <pre
        css={css`
          white-space: pre-wrap;
        `}
      >
        {error.toString()}
      </pre>
    </p>
    <p>
      <strong>Stacktrace:</strong>{' '}
      <pre
        css={css`
          white-space: pre-wrap;
        `}
      >
        {componentStack}
      </pre>
    </p>
  </div>
);

function RenderOutput({ input }): JSX.Element {
  return (
    <div
      css={css`
        flex: auto;
        padding: ${padding}px;
        font-family: 'Inria Serif', serif;
        overflow: auto;
      `}
    >
      {htmdx(input, React.createElement, {
        components: { TestComponent },
      })}
    </div>
  );
}

function HTMDXEditor(): JSX.Element {
  const [input, setInput] = React.useState(markDownWithJSX);
  return (
    <div
      css={css`
        height: 100%;
        display: flex;
      `}
    >
      <div
        css={css`
          flex: 1;
          display: flex;
          flex-direction: column;
          max-width: 50%;
        `}
      >
        <div
          css={css`
            padding: ${padding}px;
            color: black;
            background: #d5d486;
          `}
        >
          htmdx input
        </div>
        <textarea
          autoCorrect="false"
          spellCheck="false"
          onChange={e => setInput(e.target.value || '')}
          css={css`
            width: 100%;
            flex: auto;
            resize: none;
            background: #391f1f;
            border: 0;
            color: #d8d8d8;
            padding: ${padding}px;
            font-family: 'Roboto Mono', monospace;
            &:focus {
              outline: 0;
            }
          `}
        >
          {input}
        </textarea>
      </div>
      <div
        css={css`
          flex: 1;
          display: flex;
          flex-direction: column;
          max-width: 50%;
        `}
      >
        <div
          css={css`
            padding: ${padding}px;
            color: white;
            text-align: right;
            background: #1f3639;
          `}
        >
          rendered output
        </div>
        <ErrorBoundary FallbackComponent={ErrorComponent}>
          <RenderOutput input={input}></RenderOutput>
        </ErrorBoundary>
      </div>
    </div>
  );
}

ReactDOM.render(<HTMDXEditor></HTMDXEditor>, document.getElementById('root'));
