function child(p, c) {
  if (typeof c === 'string') {
    p.appendChild(document.createTextNode(c));
  } else if (c && !c.markElement) {
    for (k in c) {
      if (k !== 'markElement') {
        const v = c[k];
        p.setAttribute(k, v);
      }
    }
  } else {
    p.append(c);
  }
}

function h(name, ...children) {
  const element = document.createElement(name);
  element.markElement = true;
  children
    .flatten()
    .sift()
    .forEach(c => child(element, c));
  return element;
}

{
  const tags = [
    "a",
    "code",
    "div",
    "i",
    "p",
    "pre",
    "span",
    "table",
    "tbody",
    "td",
    "th",
    "thead",
    "tr"
  ];
  tags
    .map(tag => `h.${tag} = function (...children) { return h("${tag}", ...children); };`)
    .forEach(eval);
}
