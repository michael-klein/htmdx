import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { htmdx } from '../src/htmdx';

const simpleMarkdown = `
# Hello World

Markdown will be interpreted as tagged templates from htm.

Here's some code with code highlighting:
\`\`\`
function SomeComponent() {
  return "Some component ouput.";
}
\`\`\`
`;

const withBindings = `
# Hello World

Markdown will be interpreted as tagged templates from htm:
<input type="text" style=\${{width: '100%'}} value=\${this.state.inputValue || ''} onChange=\${e => {this.setState({inputValue:e.target.value});console.log(e.target.value)}}/>
We're also using the setState method and state property passed into using the thisValue options (see below)

With the transformJSXToHTM option enabled, you may also use normal brackets:
<input type="text" style={{width: '100%'}} value={this.state.inputValue || ''} onChange={e => this.setState({inputValue:e.target.value})}/>
`;

const withComponents = `
# Hello World

<SomeComponent value={1 + 2} />
`;

const withClassesToTransform = `
  # hello world
  <div class="test1">test</div>

  \`\`\`
  class="test2"
  \`\`\`
`;

describe('htmdx', () => {
  let root = document.createElement('app-root');
  beforeAll(() => {
    root = document.createElement('app-root');
    document.body.appendChild(root);
  });

  afterAll(() => {
    ReactDOM.unmountComponentAtNode(root);
    root.remove();
  });

  it('renders basic markdown', () => {
    ReactDOM.render(htmdx(simpleMarkdown, React.createElement), root);
    expect(root.innerHTML).toMatch(/<h1 id="hello-world">Hello World<\/h1>/);
    expect(root.innerHTML).toMatch(/<pre><code>function SomeComponent\(\) {/);
  });
  it('renders code blocks with backticks', () => {
    ReactDOM.render(
      htmdx(
        `
# Hello World
\`\`\`
Code with \`backticks\`
\`\`\`
    `,
        React.createElement
      ),
      root
    );
    expect(root.innerHTML).toMatch(/<h1 id="hello-world">Hello World<\/h1>/);
    expect(root.innerHTML).toMatch(/<pre><code>Code with \`backticks\`/);
  });

  describe('class transforms', () => {
    it('should transform class to className outside of code tags by default', () => {
      const result: string[] = [];
      htmdx(withClassesToTransform, (_, props) => {
        if (props) {
          Object.keys(props).forEach(key => {
            result.push(`${key}="${props[key]}"`);
          });
        }
      });
      const joined = result.join('\n');
      expect(joined).toMatch(/className="test1"/);
      expect(joined).not.toMatch(/className="test2"/);
    });
    it('should not transform class to className outside of code tags if disabled', () => {
      const result: string[] = [];
      htmdx(
        withClassesToTransform,
        (_, props) => {
          if (props) {
            Object.keys(props).forEach(key => {
              result.push(`${key}="${props[key]}"`);
            });
          }
        },
        { transformClassToClassname: false }
      );
      const joined = result.join('\n');
      expect(joined).not.toMatch(/className="test1"/);
      expect(joined).not.toMatch(/className="test2"/);
    });
  });

  describe('customs transforms', () => {
    it('should run custom MDX transforms if supplied', () => {
      ReactDOM.render(
        htmdx(simpleMarkdown, React.createElement, {
          mdxTransforms: [m => m.replace('# Hello World', '# foo')],
        }),
        root
      );
      expect(root.innerHTML).not.toMatch(
        /<h1 id="hello-world">Hello World<\/h1>/
      );
      expect(root.innerHTML).toMatch(/<h1 id="foo">foo<\/h1>/);
    });
    it('should run custom JSX transforms if supplied', () => {
      ReactDOM.render(
        htmdx(simpleMarkdown, React.createElement, {
          jsxTransforms: [
            (type, props, children) => {
              if (children && children[0] === 'Hello World') {
                return ['h2', { ...props, name: 'foo' }, ['Foo']];
              }
              return [type, props, children];
            },
          ],
        }),
        root
      );
      expect(root.innerHTML).not.toMatch(
        /<h1 id="hello-world">Hello World<\/h1>/
      );
      expect(root.innerHTML).toMatch(
        /<h2 id="hello-world" name="foo">Foo<\/h2>/
      );
    });
    it('should not transform class to className outside of code tags if disabled', () => {
      const result: string[] = [];
      htmdx(
        withClassesToTransform,
        (_, props) => {
          if (props) {
            Object.keys(props).forEach(key => {
              result.push(`${key}="${props[key]}"`);
            });
          }
        },
        { transformClassToClassname: false }
      );
      const joined = result.join('\n');
      expect(joined).not.toMatch(/className="test1"/);
      expect(joined).not.toMatch(/className="test2"/);
    });
  });

  describe('JSX expression bindings', () => {
    let inst: Demo;
    class Demo extends React.Component {
      state = {
        inputValue: 1,
      };
      render() {
        inst = this;
        return htmdx(withBindings, React.createElement, { thisValue: this });
      }
    }
    it('should render bindings using initial values', () => {
      ReactDOM.render(<Demo />, root);
      expect(root.innerHTML).toMatch(/ style="width: 100%;"/);
      expect(root.innerHTML).toMatch(/ value="1"/);
    });

    it('should handle events', done => {
      const input = root.querySelector('input');
      if (!input) throw Error('no input');
      // @see https://jsfiddle.net/5jgd6zn6/2/
      Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        'value'
      )?.set?.call(input, '42');
      input.dispatchEvent(new Event('input', { bubbles: true }));
      setTimeout(() => {
        expect(inst.state).toMatchObject({ inputValue: '42' });
        expect(root.innerHTML).toMatch(/ value="42"/);
        done();
      }, 1);
    });
  });

  it('renders JSX expression bindings', () => {
    class Demo extends React.Component {
      state = {
        inputValue: 1,
      };
      render() {
        return htmdx(withBindings, React.createElement, { thisValue: this });
      }
    }
    ReactDOM.render(<Demo />, root);
    expect(root.innerHTML).toMatch(/ style="width: 100%;"/);
    expect(root.innerHTML).toMatch(/ value="1"/);
  });

  it('renders markdown with embedded JSX components', () => {
    const SomeComponent = ({ value }: { value: number }) => (
      <span>SomeComponent value is {value}</span>
    );
    ReactDOM.render(
      htmdx(withComponents, React.createElement, {
        components: { SomeComponent },
      }),
      root
    );
  });
});
