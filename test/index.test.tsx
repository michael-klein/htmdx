import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { htmdx } from '../src';

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

describe('htmdx', () => {
  it('renders basic markdown', () => {
    const root = document.createElement('app-root');
    ReactDOM.render(htmdx(simpleMarkdown, React.createElement), root);
    expect(root.innerHTML).toMatch(/<h1 id="hello-world">Hello World<\/h1>/);
    expect(root.innerHTML).toMatch(/<pre><code>function SomeComponent\(\) {/);
    ReactDOM.unmountComponentAtNode(root);
    root.remove();
  });

  describe('JSX expression bindings', () => {
    let root = document.createElement('app-root');
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

    beforeAll(() => {
      document.body.appendChild(root);
    });

    afterAll(() => {
      ReactDOM.unmountComponentAtNode(root);
      root.remove();
    });

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
    const root = document.createElement('app-root');
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
    ReactDOM.unmountComponentAtNode(root);
    root.remove();
  });

  it('renders markdown with embedded JSX components', () => {
    const SomeComponent = ({ value }: { value: number }) => (
      <span>SomeComponent value is {value}</span>
    );
    const root = document.createElement('app-root');
    ReactDOM.render(
      htmdx(withComponents, React.createElement, {
        components: { SomeComponent },
      }),
      root
    );
    ReactDOM.unmountComponentAtNode(root);
    root.remove();
  });
});
