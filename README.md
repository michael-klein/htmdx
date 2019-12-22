<p align="center">
  <img alt="HTMDX logo" src="./htmdx.svg" width="100" />
</p>

# HTMDX: Lightweight runtime for mdx-like markdown

This library is an attempt to provide a runtime to compile [mdx](https://github.com/mdx-js/mdx)-like markdown files (with the goal to support full JSX inside of markdown) using [htm](https://github.com/developit/htm) + [marked](https://github.com/markedjs/marked) that is much smalled in file-size as opposed to the official runtime (which we are not encouraged to use on actual websites).

[Here is a simple example application using HTMDX](https://michael-klein.github.io/htmdx/example/dist/index.html)

## Usage

```javascript
import * as React from "react";
import * as ReactDOM from "react-dom";
import { htmdx } from "htmdx";

const markDownWithJSX = `
  # Hello World
  
  <SomeComponent />
  
  Mardown will be interpreted as tagged templates from htm:

  <input type="text" style=\${{width: '100%'}} value=\${"Editing this will console.log the value"} onChange=\${e => console.log(e.target.value)}/>
`;

function SomeComponent() {
  return "Some component ouput.";
}

ReactDOM.render(
  htmdx(
    markDownWithJSX,
    React.createElement, // Provide a h function. You can also use HTMDX with preact or any other library that supports the format
    {
      components: { SomeComponent } // provide components that will be available in markdown files
    }
  ),
  document.getElementById("root")
);
```
