import htm from 'htm';
import decode from 'html-entities-decode';
import marked from 'marked';

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

function isNativeReflectConstruct() {
  if (typeof Reflect === "undefined" || !Reflect.construct) return false;
  if (Reflect.construct.sham) return false;
  if (typeof Proxy === "function") return true;

  try {
    Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));
    return true;
  } catch (e) {
    return false;
  }
}

function _construct(Parent, args, Class) {
  if (isNativeReflectConstruct()) {
    _construct = Reflect.construct;
  } else {
    _construct = function _construct(Parent, args, Class) {
      var a = [null];
      a.push.apply(a, args);
      var Constructor = Function.bind.apply(Parent, a);
      var instance = new Constructor();
      if (Class) _setPrototypeOf(instance, Class.prototype);
      return instance;
    };
  }

  return _construct.apply(null, arguments);
}

function handleComponents(m) {
  var regexAllTags = /<([A-Z][a-zA-Z1-6]+)([^<]+)*(?:>(.*)<\/\1>|\s+\/>)/g;
  var htmlTags = m.match(regexAllTags);
  var regexSingleTag = /<([A-Z][a-zA-Z1-6]+)([^<]+)*(?:>(.*)<\/\1>|\s+\/>)/;
  if (htmlTags) for (var i = 0; i < htmlTags.length && i < 5; i++) {
    var match = regexSingleTag.exec(htmlTags[i]);

    if (match) {
      var newText = match[0].replace("<" + match[1], '<${' + match[1] + '}').replace("</" + match[1], '</${' + match[1] + '}');
      m = m.replace(match[0], newText);
    }
  }
  return m;
}

function markedToReact(m, components, html) {
  m = m.replace(/class=/g, 'className=');
  m = decode(m);
  m = handleComponents(m);
  console.log(m);
  return _construct(Function, ['html'].concat(Object.keys(components), ['return html`' + m + '`'])).apply(void 0, [html].concat(Object.values(components)));
}

function htmdx(m, h, options) {
  if (options === void 0) {
    options = {};
  }

  return markedToReact(marked(m), options.components || {}, htm.bind(h));
}

export { htmdx };
//# sourceMappingURL=htmdx.esm.js.map
