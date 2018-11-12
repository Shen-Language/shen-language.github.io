const spaces = n => n === 0 ? "" : " " + spaces(n - 1);

const indent = (n, text) =>
  text
    .split("\r\n")
    .map(line => spaces(n) + line)
    .join("\r\n");

const ann = (label, node) => ({ ...node, label });

const defmacro = (name, ...clauses) => ({
  syntaxType: "defmacro",
  name,
  clauses,
  toString: () => `(defmacro ${name})`
});

const define = (name, type, ...clauses) => ({
  syntaxType: "define",
  name,
  type,
  clauses,
  toString: () => `(define ${name})`
});

const defcc = (name, ...clauses) => ({
  syntaxType: "defcc",
  name,
  clauses,
  toString: () => `(defcc ${name})`
});

const functionClause = (patterns, body, where) => ({

});

const ccClause = (patterns, body, where) => ({

});

const prologClause = (patterns, body, where) => ({

});

const list = (heads, tail) => ({
  heads,
  tail,
  toString: () => `[${heads.map(h => h.toString()).join(" ")}${tail && (" | " + tail.toString() + " ")}]`
});

const listPattern = (heads, tail) => ({
  syntaxType: "pattern",
  patternType: "list",
  ...list(heads, tail)
});

const listValue = (heads, tail) => ({
  syntaxType: "value",
  valueType: "list",
  ...list(heads, tail)
});

const stringPattern = (...parts) => ({
  syntaxType: "pattern",
  patternType: "string",
  parts,
  toString: () => "(@s" + parts.map(p => " " + p.toString()).join("") + ")"
});

const vectorPattern = (...parts) => ({
  syntaxType: "pattern",
  patternType: "vector",
  parts,
  toString: () => "(@v" + parts.map(p => " " + p.toString()).join("") + ")"
});

const wildcardPattern = () => ({
  syntaxType: "pattern",
  patternType: "wildcard",
  toString: () => "_"
});

const variablePattern = name => ({
  syntaxType: "pattern",
  patternType: "variable",
  toString: () => name
});

const symbol = name => ({
  syntaxType: "literal",
  patternType: "symbol",
  toString: () => name
});

const application = (f, ...args) => ({
  syntaxType: "application",
  f,
  args,
  toString: () => `(${f.toString()}${args.map(a => " " + a.toString()).join("")})`
});

const lambda = (params, body) => ({
  syntaxType: "lambda",
  params,
  body,
  toString: () => `(/. ${params.map(p => p.toString()).join(" ")} ${body.toString()})`
});

// defmacro("infix-macro",
//   clause(
//     listPattern(variable("X"), symbol("+"), variable("Y")),
//     listExpression(symbol("+"), variable("X"), variable("Y"))),
//   clause(
//     listPattern(variable("X"), symbol("*"), variable("Y")),
//     listExpression(symbol("*"), variable("X"), variable("Y"))))

const example = (id, ast) =>
  h.pre({ id: id, class: "example" }, h.code(ast.toString()));

/*

(<span class="keyword" tooltip="The defmacro keyword makes this form a macro definition">defmacro</span> infix-macro
  
  )

(defmacro infix-macro
  [X + Y] -> [+ X Y]
  [X * Y] -> [* X Y])

[1 2 1 9 "keyword" "The defmacro keyword indicates the special form to define a macro"]
[1 1 3 22 "" "defmacro form registers a macro with the given identifer"]
[2 3 2 10 "pattern" "List destructuring matches lists with 3 items, the middle one being the '+ symbol"]
[2  2  "list" ""]
[3 3 3 10 "pattern" "List destructuring matches lists with 3 items, the middle one being the '* symbol"]

*/

// <pre class="example" id="pattern-matching"><code>(<span class="keyword" title="The 'define' keyword">define</span> filter
//   <span class="pattern" title="Ignore pattern">_</span> <span class="pattern" title="Literal value pattern (empty list)">[]</span>       <span class="operator">-></span> <span title="Literal value (empty list)">[]</span>
//   <span class="variable">F</span> <span class="pattern" title="List head/tail destructuring">[<span class="variable" title="Binds to head of list">X</span> | <span class="variable" title="Binds to tail of list">Xs</span>]</span> <span class="operator">-></span> [<span class="variable">X</span> | (<span title="Recursive call">filter</span> <span class="variable">F</span> <span class="variable">Xs</span>)] <span class="keyword">where</span> (<span class="variable">F</span> <span class="variable">X</span>)
//   <span class="variable">F</span> [<span class="pattern" title="Ignore pattern">_</span> | <span class="variable">Xs</span>] <span class="operator">-></span> (filter <span class="variable">F</span> <span class="variable">Xs</span>))</code></pre>
