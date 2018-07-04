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
    _.each(_.flatten(children), c => child(element, c));
    return element;
}
