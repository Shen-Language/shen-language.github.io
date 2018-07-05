/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 5);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {

/* Type mapping:
 *
 * KL Type            JS Type
 * -------            -------
 * Empty              null
 * Number             number
 * String             string
 * Function           function
 * AbsVector          array
 * Error              Error
 * Symbol             Sym
 * Cons               Cons
 * Stream             Pipe
 */

class Trampoline {
    constructor(f, args) {
        this.f = f;
        this.args = args;
    }
}
class Sym {
    constructor(name) {
        this.name = name;
    }
    toString() {
        return this.name;
    }
}
class Cons {
    constructor(hd, tl) {
        this.hd = hd;
        this.tl = tl;
    }
}
class Pipe {
    constructor(name) {
        this.name = name;
    }
}
let err = x => { throw new Error(x); };
let consolePipe = new Pipe('console');
consolePipe.buffer = [];
consolePipe.close = () => err('console stream cannot be closed');
consolePipe.readByte = () => consolePipe.buffer.shift() || -1;
consolePipe.writeByte = b => {
    consolePipe.buffer.push(b);
    return b;
};
function mountFile(path, callback) {
    fetch(path).then(response => response.text().then(text => {
        kl.vfs[path] = text;
        if (callback) {
            callback();
        } else {
            console.log(`"${path} loaded"`);
        }
    }));
}
function openFileRead(path) {
    path = kl.value('*home-directory*') + path;
    let pos = 0;
    const text = kl.vfs[path];
    if (!text) err(`File "${path}" does not exist`);
    const pipe = new Pipe(path);
    pipe.open = true;
    pipe.close = () => {
        pipe.open = false;
        return null;
    };
    pipe.readByte = () => {
        if (pos >= text.length) return -1;
        return text.charCodeAt(pos++);
    };
    pipe.writeByte = b => err('write not supported');
    return pipe;
}
function openFile(path, isIn) {
    if (isIn) return openFileRead(path);
    err('writing files not implemented');
}
let klTrue  = new Sym('true');
let klFalse = new Sym('false');
let isTrampoline = x => x && x.constructor === Trampoline;
let isSymbol     = x => x && x.constructor === Sym;
let isCons       = x => x && x.constructor === Cons;
let isArray      = x => x && x.constructor === Array;
let isError      = x => x instanceof Error;
let isPipe       = x => x && x.constructor === Pipe;
let isNumber     = x => typeof x === 'number';
let isString     = x => typeof x === 'string';
let isFunction   = x => typeof x === 'function';
function eq(x, y) {
    if (x === y) return true;
    if (isSymbol(x) && isSymbol(y)) return x.name === y.name;
    if (isCons(x) && isCons(y)) return eq(x.hd, y.hd) && eq(x.tl, y.tl);
    if (isArray(x) && isArray(y)) {
        if (x.length !== y.length) return false;
        for (var i = 0; i < x.length; ++i) {
            if (!eq(x[i], y[i])) return false;
        }
        return true;
    }
    return false;
}
function toStr(x) {
    if (x === null) return '[]';
    if (isSymbol(x)) return x.name;
    if (isString(x)) return `"${x}"`;
    if (isCons(x)) return `[${consToArray(x).map(toStr).join(' ')}]`;
    if (isFunction(x)) return `<Function ${x.klName}>`;
    if (isArray(x)) return `<Vector ${x.length}>`;
    if (isError(x)) return `<Error "${x.message}">`;
    if (isPipe(x)) return `<Stream ${x.name}>`;
    return '' + x;
}
function asJsBool(x) {
    if (isSymbol(x)) {
        if (x.name === 'true') return true;
        if (x.name === 'false') return false;
    }
    err('not a boolean');
}
let asKlBool = x => x ? klTrue : klFalse;
let asKlNumber = x => isNumber(x) ? x : err('not a number');
let asKlString = x => isString(x) ? x : err('not a string');
let asKlSymbol = x => isSymbol(x) ? x : err('not a symbol');
let asKlVector = x => isArray(x) ? x : err('not an absvector');
let asKlCons = x => isCons(x) ? x : err('not a cons');
let asKlError = x => isError(x) ? x : err('not an error');
let asKlStream = x => isPipe(x) ? x : err('not a stream');
let asKlFunction = x => isFunction(x) ? x : err('not a function');
function asIndexOf(i, a) {
    if (!isNumber(i)) err('not a valid index: ' + i);
    if (i % 1 !== 0) err('not an integer: ' + i);
    if (i < 0 || i >= a.length) err('not in bounds: ' + i);
    return i;
}
function asKlValue(x) {
    if (x === true) return klTrue;
    if (x === false) return klFalse;
    if (isString(x) || isNumber(x) || isSymbol(x) || isCons(x) || isArray(x) || isPipe(x) || isFunction(x)) return x;
    return null; // TODO: No other values admissible to KL?
}
function arrayToCons(x) {
    let result = null;
    for (let i = x.length - 1; i >= 0; i--) result = new Cons(x[i], result);
    return result;
}
function consToArray(x) {
    const array = [];
    while (isCons(x)) {
        array.push(x.hd);
        x = x.tl;
    }
    if (x !== null) err('not a valid list');
    return array;
}
function consLength(x) {
    let length = 0;
    while (isCons(x)) {
        x = x.tl;
        length++;
    }
    if (x !== null) err('not a valid list');
    return length;
}
function concatAll(lists) {
    return lists.reduce((x, y) => x.concat(y), []);
}
function butLast(list) {
    return [list.slice(0, list.length - 1), list[list.length - 1]];
}
function elementCount(array, f) {
    let count = 0;
    for (let x of array) if (f(x)) count++;
    return count;
}

if (true) {
    module.exports = {
        Sym,
        Cons,
        Trampoline,
        Pipe,
        klTrue,
        klFalse,
        eq,
        toStr,
        arrayToCons,
        consLength,
        concatAll,
        butLast,
        elementCount,
        consToArray,
        consolePipe,
        mountFile,
        openFile,
        isArray,
        isNumber,
        isCons,
        isFunction,
        isSymbol,
        isString,
        isError,
        isPipe,
        isTrampoline,
        err,
        asKlBool,
        asKlNumber,
        asKlString,
        asKlSymbol,
        asKlVector,
        asKlCons,
        asKlError,
        asKlStream,
        asKlFunction,
        asIndexOf,
        asKlValue,
        asJsBool
    };
}

if (typeof window !== 'undefined') {
    window.klTrue = klTrue;
    window.klFalse = klFalse;
    window.mountFile = mountFile;
}

if (typeof global !== 'undefined') {
    global.klTrue = klTrue;
    global.klFalse = klFalse;
    global.mountFile = mountFile;
}

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(4)))

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {

function includesAny(y, xs) {
    return xs.some(x => y.includes(x));
}

function os() {
    if (typeof navigator !== 'undefined') {
        if (navigator.platform) {
            const lowerPlatform = navigator.platform.toLowerCase();
            if (includesAny(lowerPlatform, ['win32', 'win64'])) return 'Windows';
            if (includesAny(lowerPlatform, ['darwin'])) return 'macOS';
            if (includesAny(lowerPlatform, ['linux'])) return 'Linux';
        }
        if (navigator.userAgent) {
            const lowerUserAgent = navigator.userAgent.toLowerCase();
            if (includesAny(lowerUserAgent, ['win', 'wow'])) return 'Windows';
            if (includesAny(lowerUserAgent, ['mac'])) return 'macOS';
            if (includesAny(lowerUserAgent, ['iphone', 'ipad', 'ios'])) return 'iOS';
            if (includesAny(lowerUserAgent, ['linux'])) return 'Linux';
            if (includesAny(lowerUserAgent, ['android'])) return 'Android';
            if (includesAny(lowerUserAgent, ['x11'])) return 'Unix';
        }
    }
    else if (typeof process !== 'undefined') {
        if (process.platform) {
            const lowerPlatform = process.platform.toLowerCase();
            if (includesAny(lowerPlatform, ['win32', 'win64'])) return 'Windows';
            if (includesAny(lowerPlatform, ['darwin'])) return 'macOS';
            if (includesAny(lowerPlatform, ['linux'])) return 'Linux';
        }
    }
    return 'Unknown';
}

function name() {
    if (typeof window !== 'undefined') {
        const lowerUserAgent = navigator.userAgent.toLowerCase();
        if (includesAny(lowerUserAgent, ['edge'])) return 'Edge';
        if (includesAny(lowerUserAgent, ['opr'])) return 'Opera';
        if (includesAny(lowerUserAgent, ['vivaldi'])) return 'Vivaldi';
        if (includesAny(lowerUserAgent, ['firefox'])) return 'Firefox';
        if (includesAny(lowerUserAgent, ['chrome'])) return 'Chrome';
        if (includesAny(lowerUserAgent, ['android'])) return 'Android';
        if (includesAny(lowerUserAgent, ['safari'])) return 'Safari';
    }
    else if (typeof process !== 'undefined') {
        return 'Node.js';
    }
    return 'Unknown';
}

function digitsAfter(s, subs) {
    const i = s.indexOf(subs + '/');
    if (i < 0) return null;
    const matches = s.substring(i + subs.length + 1).match(/\S*/);
    return matches.length === 0 ? null : matches[0];
}

function version() {
    if (typeof window !== 'undefined') {
        const ua = navigator.userAgent.toLowerCase();
        const ver =
            digitsAfter(ua, 'edge') ||
            digitsAfter(ua, 'opr') ||
            digitsAfter(ua, 'vivaldi') ||
            digitsAfter(ua, 'firefox') ||
            digitsAfter(ua, 'chrome') ||
            digitsAfter(ua, 'android') ||
            digitsAfter(ua, 'safari');
        if (ver) return ver;
    }
    else if (typeof process !== 'undefined') {
        return process.version.slice(1);
    }
    return "Unknown";
}

if (true) {
    module.exports = {
        os,
        name,
        version
    };
}

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(6)))

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

if (true) {
    env = __webpack_require__(1);
    Transpiler = __webpack_require__(3);
    const types = __webpack_require__(0);
    Sym = types.Sym;
    Trampoline = types.Trampoline;
    arrayToCons = types.arrayToCons;
    consolePipe = types.consolePipe;
    openFile = types.openFile;
    isArray = types.isArray;
    isFunction = types.isFunction;
    isPipe = types.isPipe;
    isString = types.isString;
    isNumber = types.isNumber;
    isCons = types.isCons;
    isSymbol = types.isSymbol;
    isError = types.isError;
    isTrampoline = types.isTrampoline;
    consLength = types.consLength;
    concatAll = types.concatAll;
    butLast = types.butLast;
    consToArray = types.consToArray;
    err = types.err;
    toStr = types.toStr;
    asKlBool = types.asKlBool;
    asKlNumber = types.asKlNumber;
    asKlString = types.asKlString;
    asKlSymbol = types.asKlSymbol;
    asKlVector = types.asKlVector;
    asKlCons = types.asKlCons;
    asKlError = types.asKlError;
    asKlStream = types.asKlStream;
    asKlFunction = types.asKlFunction;
    asIndexOf = types.asIndexOf;
    asKlValue = types.asKlValue;
}

//
// Init KL environment
//

class Kl {
    constructor() {
        this.startTime = new Date().getTime();
        this.uniqueSuffix = 0;
        this.symbols = {};
        this.fns = {};
        this.vfs = {};
    }
    defun(name, arity, f) {
        f.klName = name;
        f.arity = arity;
        this.fns[Transpiler.rename(name)] = f;
        return new Sym(name);
    }
    primitve(name, f) {
        this.defun(name, f.length, f);
        f.primitive = true;
        return f;
    }
    isSymbolDefined(name) {
        return this.symbols.hasOwnProperty(Transpiler.rename(name));
    }
    set(name, value) {
        return this.symbols[Transpiler.rename(name)] = value;
    }
    value(name) {
        return this.isSymbolDefined(name) ? this.symbols[Transpiler.rename(name)] : err('symbol not defined');
    }
    static app(f, args) {
        if (args.length === f.arity) {
            return f(...args);
        } else if (args.length > f.arity) {
            return Kl.app(f(...args.slice(0, f.arity)), args.slice(f.arity));
        }
        const arity = f.arity - args.length;
        return Kl.setArity(`${f.klName}/${arity}`, arity, function (...args2) {
            return Kl.app(f, args.concat(args2));
        });
    }
    static headCall(f, args) {
        return Kl.runAll(Kl.app(f, args));
    }
    static tailCall(f, args) {
        return new Trampoline(f, args);
    }
    static setArity(name, arity, f) {
        f.klName = name;
        f.arity = arity;
        return f;
    }
    static runAll(t) {
        while (isTrampoline(t)) t = Kl.run(t);
        return t;
    }
    static run(t) {
        return Kl.app(t.f, t.args);
    }
}

let kl = new Kl();

//
// Set primitive functions and values
//

// TODO: as* calls should be injected selectively at
//       transpile-time using type analysis

kl.set('*language*', 'JavaScript');
kl.set('*implementation*', env.name());
kl.set('*release*', env.version());
kl.set('*os*', env.os());
kl.set('*port*', '0.1.0');
kl.set('*porters*', 'Robert Koeninger');
kl.set('*stinput*', consolePipe);
kl.set('*stoutput*', consolePipe);
kl.set('*sterror*', consolePipe);
kl.set('*home-directory*', ''); // TODO: does this need a value?
kl.primitve('if', (c, x, y) => asJsBool(c) ? x : y);
kl.primitve('and', (x, y) => asKlBool(asJsBool(x) && asJsBool(y)));
kl.primitve('or', (x, y) => asKlBool(asJsBool(x) || asJsBool(y)));
kl.primitve('+', (x, y) => asKlNumber(x) + asKlNumber(y));
kl.primitve('-', (x, y) => asKlNumber(x) - asKlNumber(y));
kl.primitve('*', (x, y) => asKlNumber(x) * asKlNumber(y));
kl.primitve('/', (x, y) => asKlNumber(x) / asKlNumber(y));
kl.primitve('<', (x, y) => asKlBool(x < y));
kl.primitve('>', (x, y) => asKlBool(x > y));
kl.primitve('<=', (x, y) => asKlBool(x <= y));
kl.primitve('>=', (x, y) => asKlBool(x >= y));
kl.primitve('=', (x, y) => asKlBool(eq(x, y)));
kl.primitve('number?', x => asKlBool(isNumber(x)));
kl.primitve('cons', (x, y) => new Cons(x, y));
kl.primitve('cons?', x => asKlBool(isCons(x)));
kl.primitve('hd', x => asKlCons(x).hd);
kl.primitve('tl', x => asKlCons(x).tl);
kl.primitve('set', (sym, x) => kl.set(asKlSymbol(sym).name, asKlValue(x)));
kl.primitve('value', sym => kl.value(asKlSymbol(sym).name));
kl.primitve('intern', x => new Sym(asKlString(x)));
kl.primitve('string?', x => asKlBool(isString(x)));
kl.primitve('str', x => toStr(asKlValue(x)));
kl.primitve('pos', (s, x) => asKlString(s)[asIndexOf(x, s)]);
kl.primitve('tlstr', s => {
    const ss = asKlString(s);
    return ss.length > 0 ? ss.slice(1) : err('tlstr requires non-empty string');
});
kl.primitve('cn', (x, y) => asKlString(x) + asKlString(y));
kl.primitve('string->n', x => asKlString(x).charCodeAt(0));
kl.primitve('n->string', x => String.fromCharCode(asKlNumber(x)));
kl.primitve('absvector', n => new Array(n).fill(null));
kl.primitve('<-address', (a, i) => asKlVector(a)[asIndexOf(i, a)]);
kl.primitve('address->', (a, i, x) => {
    asKlVector(a)[asIndexOf(i, a)] = asKlValue(x);
    return a;
});
kl.primitve('absvector?', a => asKlBool(isArray(a)));
kl.primitve('type', (x, _) => x);
kl.primitve('eval-kl', x => eval(Transpiler.translateHead(asKlValue(x))));
kl.primitve('simple-error', x => err(asKlString(x)));
kl.primitve('error-to-string', x => asKlError(x).message);
kl.primitve('get-time', mode => {
    asKlSymbol(mode);
    if (mode.name === 'unix') return new Date().getTime();
    if (mode.name === 'run') return new Date().getTime() - kl.startTime;
    err("get-time only accepts 'unix or 'run");
});
kl.primitve('open', (path, mode) => {
    asKlString(path);
    asKlSymbol(mode);
    if (mode.name === 'in') return openFile(path, true);
    if (mode.name === 'out') return openFile(path, false);
    err("open only accepts 'in and 'out as stream directions");
});
kl.primitve('close', s => asKlStream(s).close());
kl.primitve('read-byte', s => asKlStream(s).readByte());
kl.primitve('write-byte', (b, s) => asKlStream(s).writeByte(b));

if (typeof document !== 'undefined') {
    setTimeout(function () {
        for (let i = 0; i < document.scripts.length; ++i) {
            const script = document.scripts[i];
            if (script.executed) continue;
            if (script.type.toLowerCase() === 'text/klambda') {
                script.executed = true;
                if (script.text) {
                    Parser.parseAllString(script.text).map(Transpiler.translateHead).map(eval);
                    continue;
                }
                console.warn('text/klambda script tags must have embedded code');
                continue;
            }
            if (script.type.toLowerCase() === 'text/shen') {
                script.executed = true;
                if (script.text) {
                    const parsedShen = Kl.headCall(kl.fns[Transpiler.rename('read-from-string')], [script.text]);
                    const parsedKl = Kl.headCall(kl.fns[Transpiler.rename('shen.elim-def')], [parsedShen]);
                    consToArray(parsedKl).map(Transpiler.translateHead).map(eval);
                    continue;
                }
                console.warn('text/shen script tags must have embedded code');
                continue;
            }
        }
    }, 0);
}

if (true) {
    module.exports = { Kl, kl };
}

if (typeof window !== 'undefined') {
    window.Kl = Kl;
    window.kl = kl;
    window.consolePipe = consolePipe;
}


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

if (true) {
    const types = __webpack_require__(0);
    Sym = types.Sym;
    Cons = types.Cons;
    arrayToCons = types.arrayToCons;
    isArray = types.isArray;
    isFunction = types.isFunction;
    isPipe = types.isPipe;
    isString = types.isString;
    isNumber = types.isNumber;
    isCons = types.isCons;
    isSymbol = types.isSymbol;
    isError = types.isError;
    consLength = types.consLength;
    concatAll = types.concatAll;
    butLast = types.butLast;
    consToArray = types.consToArray;
    elementCount = types.elementCount;
    asJsBool = types.asJsBool;
    eq = types.eq;
}

class Scope {
    static fromHead() {
        return new Scope().inHead();
    }
    static fromTail() {
        const scope = new Scope();
        scope.position = 'tail';
        return scope;
    }
    constructor() {
        this.locals = [];
        this.scopeName = '$$';
        this.position = 'head';
    }
    clone() {
        const scope = new Scope();
        scope.locals = this.locals.slice(0);
        scope.scopeName = this.scopeName;
        scope.position = this.position;
        return scope;
    }
    isLocal(name) {
        if (isSymbol(name)) name = name.name;
        return this.locals.includes(name);
    }
    let(name) {
        if (isSymbol(name)) name = name.name;
        const scope = this.clone();
        scope.locals.push(name);
        return scope;
    }
    lambda(param) {
        if (isSymbol(param)) param = param.name;
        const scope = this.clone();
        scope.locals.push(param);
        scope.scopeName = `${scope.scopeName}_lambda`;
        scope.position = 'tail';
        return scope;
    }
    freeze() {
        const scope = this.clone();
        scope.scopeName = `${scope.scopeName}_freeze`;
        scope.position = 'tail';
        return scope;
    }
    defun(name, params) {
        if (isSymbol(name)) name = name.name;
        const scope = this.clone();
        scope.locals = params.slice(0);
        scope.scopeName = name;
        scope.position = 'tail';
        return scope;
    }
    inHead() {
        const scope = this.clone();
        scope.position = 'head';
        return scope;
    }
    invoke(f, args) {
        return `${this.position === 'head' ? 'Kl.headCall' : 'Kl.tailCall'}(${f}, [${args}])`;
    }
}

class Transpiler {
    static translateHead(expr) {
        return new Transpiler().translate(expr, Scope.fromHead());
    }
    static translateTail(expr) {
        return new Transpiler().translate(expr, Scope.fromTail());
    }
    contructor(scope) {
        this.scope = scope;
    }
    static rename(name) {
        if (isSymbol(name)) name = name.name;
        let result = '';
        for (let i = 0; i < name.length; ++i) {
            switch (name[i]) {
                case '-': { result += '_'; break; }
                case '_': { result += '$un'; break; }
                case '$': { result += '$dl'; break; }
                case '.': { result += '$do'; break; }
                case ',': { result += '$cm'; break; }
                case '`': { result += '$bt'; break; }
                case "'": { result += '$ap'; break; }
                case '+': { result += '$pl'; break; }
                case '*': { result += '$st'; break; }
                case '<': { result += '$lt'; break; }
                case '>': { result += '$gt'; break; }
                case '%': { result += '$pe'; break; }
                case '&': { result += '$am'; break; }
                case '^': { result += '$ca'; break; }
                case '=': { result += '$eq'; break; }
                case '!': { result += '$ex'; break; }
                case '?': { result += '$qu'; break; }
                case '@': { result += '$at'; break; }
                case '~': { result += '$ti'; break; }
                case '#': { result += '$ha'; break; }
                case '|': { result += '$pi'; break; }
                case ':': { result += '$co'; break; }
                case ';': { result += '$sc'; break; }
                case '/': { result += '$sl'; break; }
                case '{': { result += '$lc'; break; }
                case '}': { result += '$rc'; break; }
                case '[': { result += '$ls'; break; }
                case ']': { result += '$rs'; break; }
                case '\\': { result += '$bs'; break; }
                default:  { result += name[i]; break; }
            }
        }
        return result;
    }
    static escape(s) {
        if (isSymbol(s)) s = s.name;
        let result = '';
        for (let i = 0; i < s.length; ++i) {
            switch (s[i]) {
                case '\\': { result += '\\\\'; break; }
                case '\0': { result += '\\0'; break; }
                case '\b': { result += '\\b'; break; }
                case '\f': { result += '\\f'; break; }
                case '\n': { result += '\\n'; break; }
                case '\r': { result += '\\r'; break; }
                case '\t': { result += '\\t'; break; }
                case '\v': { result += '\\v'; break; }
                case '\"': { result += '\\"'; break; }
                case '\'': { result += "\\'"; break; }
                default: { result += s[i]; break; }
            }
        }
        return result;
    }
    static string(s) {
        return `"${Transpiler.escape(s)}"`;
    }
    static isForm(expr, keyword, length) {
        return isCons(expr) && (!length || consLength(expr) === length) && isSymbol(expr.hd) && expr.hd.name === keyword;
    }
    ifExpr(condition, x, y, scope) {
        if (isSymbol(condition) && condition.name === 'true') return x;
        if (isSymbol(condition) && condition.name === 'false') return y;
        const c = this.translate(condition, scope.inHead());
        return `asJsBool(${c})?(${x}):(${y})`;
    }
    renderLet(bindings, body) {
        if (isCons(bindings)) {
            const binding = bindings.hd;
            let renamed = Transpiler.rename(binding.sym);
            if (binding.redefCount > 0) renamed += `_${bindings.hd.redefCount}`
            body = `const ${renamed} = ${binding.value};
                    ${body}`;
            return this.renderLet(bindings.tl, body);
        }
        return `(function () {
                  ${body}
                })()`;
    }
    translateLet(bindings, expr, scope) {
        if (Transpiler.isForm(expr, 'let', 4)) {
            const [_let, local, value, body] = consToArray(expr);
            const binding = {
                sym: local,
                redefCount: elementCount(scope.locals, x => x === local.name),
                value: this.translate(value, scope.inHead())
            };
            return this.translateLet(new Cons(binding, bindings), body, scope.let(local));
        }
        return this.renderLet(bindings, `return ${this.translate(expr, scope)};`);
    }
    condRecur(code, scope) {
        if (code === null) {
            return `kl.fns.${Transpiler.rename('simple-error')}(${Transpiler.string('No clause was true')})`;
        } else {
            const [condition, consequent] = consToArray(code.hd);
            return this.ifExpr(
                condition,
                this.translate(consequent, scope),
                this.condRecur(code.tl, scope),
                scope);
        }
    }
    flattenNested(expr, keyword, length) {
        if (Transpiler.isForm(expr, keyword, length)) {
            return concatAll(consToArray(expr.tl).map(x => this.flattenNested(x, keyword, length)));
        }
        return [expr];
    }

    // TODO: track expression types to simplify code
    // function convertType(typedExpr, targetType) {
    //     if (typedExpr.type === 'js.bool' && targetType === 'kl.bool') return {expr: `asKlBool(${typedExpr})`, type: targetType};
    //     if (typedExpr.type === 'kl.bool' && targetType === 'js.bool') return {expr: `asJsBool(${typedExpr})`, type: targetType};
    //     return expr;
    // }

    // TODO: inline template can be set on function object

    // Value of Num | Str | Sym | Cons -> JsString
    translate(code, scope) {
        if (isArray(code) || isFunction(code) || isError(code) || isPipe(code)) {
            err('vectors, functions, errors and streams are not valid syntax');
        }

        if (!scope) scope = this.scope;

        // Literals
        if (code === null) return 'null';
        if (isNumber(code)) return `${code}`;
        if (isString(code)) return Transpiler.string(code);

        // Local variables and idle symbols
        if (isSymbol(code)) {
            if (code.name === 'true') return 'klTrue';
            if (code.name === 'false') return 'klFalse';
            if (scope.isLocal(code)) {
                const redefCount = elementCount(scope.locals, x => x === code.name) - 1;
                let renamed = Transpiler.rename(code);
                if (redefCount > 0) renamed += `_${redefCount}`;
                return renamed;
            }
            return `new Sym(${Transpiler.string(code)})`;
        }

        // Conjunction and disjunction
        if (Transpiler.isForm(code, 'and', 3)) {
            return `asKlBool(${this.flattenNested(code, 'and', 3).map(x => `asJsBool(${this.translate(x, scope.inHead())})`).join(' && ')})`;
        }
        if (Transpiler.isForm(code, 'or', 3)) {
            return `asKlBool(${this.flattenNested(code, 'or', 3).map(x => `asJsBool(${this.translate(x, scope.inHead())})`).join(' || ')})`;
        }

        // Conditional evaluation
        if (Transpiler.isForm(code, 'if', 4)) {
            const [_if, condition, consequent, alternative] = consToArray(code);
            return this.ifExpr(
                condition,
                this.translate(consequent, scope),
                this.translate(alternative, scope),
                scope);
        }
        if (Transpiler.isForm(code, 'cond')) {
            return this.condRecur(code.tl, scope);
        }

        // Local variable binding
        if (Transpiler.isForm(code, 'let', 4)) {
            return this.translateLet(null, code, scope);
        }

        // Global function definition
        if (Transpiler.isForm(code, 'defun', 4)) {
            const [_defun, name, params, body] = consToArray(code);
            const paramNames = consToArray(params).map(expr => expr.name);
            return `kl.defun(${Transpiler.string(name)}, ${paramNames.length}, function (${paramNames.map(Transpiler.rename).join(', ')}) {
                      return ${this.translate(body, scope.defun(name, paramNames))};
                    })`;
        }

        // 1-arg anonymous function
        if (Transpiler.isForm(code, 'lambda', 3)) {
            const [_lambda, param, body] = consToArray(code);
            const redefCount = elementCount(scope.locals, x => x === param.name);
            let renamed = Transpiler.rename(param);
            if (redefCount > 0) renamed += `_${redefCount}`;
            return `Kl.setArity(${Transpiler.string(scope.scopeName + '_lambda')}, 1, function (${renamed}) {
                      return ${this.translate(body, scope.lambda(param))};
                    })`;
        }

        // 0-arg anonymous function
        if (Transpiler.isForm(code, 'freeze', 2)) {
            const [_freeze, body] = consToArray(code);
            return `Kl.setArity(${Transpiler.string(scope.scopeName + '_freeze')}, 0, function () {
                      return ${this.translate(body, scope.freeze())};
                    })`;
        }

        // Error handling
        if (Transpiler.isForm(code, 'trap-error', 3)) {
            const [_trapError, body, handler] = consToArray(code);
            if (Transpiler.isForm(handler, 'lambda', 3)) {
                const [_lambda, handlerParam, handlerBody] = consToArray(handler);
                return `(function () {
                          try {
                            return ${this.translate(body, scope.inHead())};
                          } catch (${Transpiler.rename(handlerParam)}) {
                            return ${this.translate(handlerBody, scope.let(handlerParam))};
                          }
                        })()`;
            }
            return `(function () {
                      try {
                        return ${this.translate(body, scope.inHead())};
                      } catch ($err) {
                        return ${this.translate(handler, scope)}($err);
                      }
                    })()`;
        }

        // Flattened, sequential, side-effecting expressions
        if (Transpiler.isForm(code, 'do')) {
            const [voids, last] = butLast(this.flattenNested(code, 'do', 3));
            const translatedVoids = voids.map(expr => this.translate(expr, scope.inHead())).join(';\n');
            const translatedLast = this.translate(last, scope);
            return `(function () {
                      ${translatedVoids};
                      return ${translatedLast};
                    })()`;
        }

        // Inlined global symbol assign
        if (Transpiler.isForm(code, 'set', 3)) {
            const [_set, sym, value] = consToArray(code);
            if (isSymbol(sym) && !scope.isLocal(sym)) {
                return `kl.symbols.${Transpiler.rename(sym)} = ${this.translate(value, scope.inHead())}`;
            }
        }

        // Inlined global symbol retrieve
        if (Transpiler.isForm(code, 'value', 2)) {
            const [_value, sym] = consToArray(code);
            if (isSymbol(sym) && !scope.isLocal(sym) && kl.isSymbolDefined(sym)) {
                return `kl.symbols.${Transpiler.rename(sym)}`;
            }
        }

        const [fexpr, ...argExprs] = consToArray(code);
        const translatedArgs = argExprs.map(expr => this.translate(expr, scope.inHead())).join(', ');

        if (isSymbol(fexpr)) {

            // JS-injection form
            if (fexpr.name === 'js.') {
                if (consLength(code) === 1) return 'null';
                const [voids, last] = butLast(consToArray(code.tl));
                return `(function () {
                          ${voids.join(';\n')};
                          return asKlValue(${last});
                        })()`;
            }

            // JS-namespace function call
            if (fexpr.name.indexOf('js.') === 0) {
                return `${fexpr.name.slice(3)}(${translatedArgs})`;
            }

            // Application of local variable function
            const name = Transpiler.rename(fexpr);
            if (scope.isLocal(fexpr)) {
                return scope.invoke(name, translatedArgs);
            }

            // Application of primitive
            const klf = kl.fns[name];
            if (klf && klf.primitive) {

                // Full application
                if (klf.arity === argExprs.length) {
                    return `kl.fns.${name}(${translatedArgs})`;
                }

                // Partial application
                return `Kl.app(kl.fns.${name}, [${translatedArgs}])`;
            }

            // Application of any other named function
            return scope.invoke(`kl.fns.${name}`, translatedArgs);
        }

        // Application of function-typed expression
        return scope.invoke(`asKlFunction(${this.translate(fexpr, scope.inHead())})`, translatedArgs);
    }
}

if (true) {
    module.exports = Transpiler;
}

if (typeof window !== 'undefined') {
    window.Scope = Scope;
    window.Transpiler = Transpiler;
}


/***/ }),
/* 4 */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1,eval)("this");
} catch(e) {
	// This works if the window reference is available
	if(typeof window === "object")
		g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(1);
__webpack_require__(2);
__webpack_require__(7);
__webpack_require__(3);
__webpack_require__(0);
module.exports = __webpack_require__(8);


/***/ }),
/* 6 */
/***/ (function(module, exports) {

// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

if (true) {
    const types = __webpack_require__(0);
    Sym = types.Sym;
    arrayToCons = types.arrayToCons;
}

class Parser {
    static parseString(text) {
        return new Parser(text).parse();
    }
    static parseAllString(text) {
        return new Parser(text).parseAll();
    }
    constructor(text) {
        this.text = text;
        this.pos = 0;
    }
    get current() {
        return this.text[this.pos];
    }
    get next() {
        return this.text[this.pos + 1];
    }
    get done() {
        return this.pos >= this.text.length;
    }
    get more() {
        return !this.done;
    }
    skipWhitespace() {
        while (this.more && /\s/.test(this.current)) this.skipOne();
    }
    skipOne() {
        this.pos++;
    }
    static isDigit(ch) {
        return ch !== undefined && /\d/.test(ch);
    }
    static isSign(ch) {
        return ch !== undefined && /[\-\+]/.test(ch);
    }
    static isSymbolChar(ch) {
        return ch !== undefined && /[^\s\(\)]/.test(ch);
    }
    readString() {
        this.skipOne();
        const start = this.pos;
        while (this.current !== '"') {
            if (this.done) throw new Error('unexpected end of input');
            this.skipOne();
        }
        const end = this.pos;
        this.skipOne();
        return this.text.substring(start, end);
    }
    readNumber() {
        const start = this.pos;
        if (this.more && Parser.isSign(this.current)) this.skipOne();
        while (this.more && Parser.isDigit(this.current)) this.skipOne();
        if (this.more && this.current === '.') {
            this.skipOne();
            while (this.more && Parser.isDigit(this.current)) this.skipOne();
        }
        const end = this.pos;
        return parseFloat(this.text.substring(start, end));
    }
    readSymbol() {
        const start = this.pos;
        while (this.more && Parser.isSymbolChar(this.current)) this.skipOne();
        const end = this.pos;
        return new Sym(this.text.substring(start, end));
    }
    parse() {
        this.skipWhitespace();
        if (this.done) throw new Error('unexpected end of input');
        if (this.current === '(') {
            this.skipOne();
            const children = [];
            let child = this.parse();
            while (child !== undefined) {
                children.push(child);
                child = this.parse();
            }
            return arrayToCons(children);
        }
        if (this.current === ')') {
            this.skipOne();
            return undefined;
        }
        if (this.current === '"') return this.readString();
        if (Parser.isDigit(this.current) ||
            (Parser.isSign(this.current) && Parser.isDigit(this.next))) return this.readNumber();
        return this.readSymbol();
    }
    parseAll() {
        this.skipWhitespace();
        const results = [];
        while (this.more) {
            results.push(this.parse());
            this.skipWhitespace();
        }
        return results;
    }
}

if (true) {
    module.exports = Parser;
}

if (typeof window !== 'undefined') {
    window.Parser = Parser;
}


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {
const { Sym, asJsBool, asKlBool } = __webpack_require__(0);
const { Kl, kl } = __webpack_require__(2);

if (typeof window !== 'undefined') {
    window.kl = kl;
    window.Kl = Kl;
}

if (typeof global !== 'undefined') {
    global.kl = kl;
    global.Kl = Kl;
}

kl.defun("shen.shen", 0, function () {
                      return (function () {
                      Kl.headCall(kl.fns.shen$docredits, []);
                      return Kl.tailCall(kl.fns.shen$doloop, []);
                    })();
                    });

kl.defun("shen.loop", 0, function () {
                      return (function () {
                      Kl.headCall(kl.fns.shen$doinitialise$unenvironment, []);
Kl.headCall(kl.fns.shen$doprompt, []);
(function () {
                          try {
                            return Kl.headCall(kl.fns.shen$doread_evaluate_print, []);
                          } catch (E) {
                            return Kl.headCall(kl.fns.shen$dotoplevel_display_exception, [E]);
                          }
                        })();
                      return Kl.tailCall(kl.fns.shen$doloop, []);
                    })();
                    });

kl.defun("shen.toplevel-display-exception", 1, function (V3935) {
                      return Kl.tailCall(kl.fns.pr, [kl.fns.error_to_string(V3935), Kl.headCall(kl.fns.stoutput, [])]);
                    });

kl.defun("shen.credits", 0, function () {
                      return (function () {
                      Kl.headCall(kl.fns.shen$doprhush, ["\nShen, copyright (C) 2010-2015 Mark Tarver\n", Kl.headCall(kl.fns.stoutput, [])]);
Kl.headCall(kl.fns.shen$doprhush, [kl.fns.cn("www.shenlanguage.org, ", Kl.headCall(kl.fns.shen$doapp, [kl.fns.value(new Sym("*version*")), "\n", new Sym("shen.a")])), Kl.headCall(kl.fns.stoutput, [])]);
Kl.headCall(kl.fns.shen$doprhush, [kl.fns.cn("running under ", Kl.headCall(kl.fns.shen$doapp, [kl.symbols.$stlanguage$st, kl.fns.cn(", implementation: ", Kl.headCall(kl.fns.shen$doapp, [kl.symbols.$stimplementation$st, "", new Sym("shen.a")])), new Sym("shen.a")])), Kl.headCall(kl.fns.stoutput, [])]);
                      return Kl.tailCall(kl.fns.shen$doprhush, [kl.fns.cn("\nport ", Kl.headCall(kl.fns.shen$doapp, [kl.symbols.$stport$st, kl.fns.cn(" ported by ", Kl.headCall(kl.fns.shen$doapp, [kl.symbols.$stporters$st, "\n", new Sym("shen.a")])), new Sym("shen.a")])), Kl.headCall(kl.fns.stoutput, [])]);
                    })();
                    });

kl.defun("shen.initialise_environment", 0, function () {
                      return Kl.tailCall(kl.fns.shen$domultiple_set, [kl.fns.cons(new Sym("shen.*call*"), kl.fns.cons(0, kl.fns.cons(new Sym("shen.*infs*"), kl.fns.cons(0, kl.fns.cons(new Sym("shen.*process-counter*"), kl.fns.cons(0, kl.fns.cons(new Sym("shen.*catch*"), kl.fns.cons(0, null))))))))]);
                    });

kl.defun("shen.multiple-set", 1, function (V3937) {
                      return asJsBool(kl.fns.$eq(null, V3937))?(null):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V3937)) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V3937)))))?((function () {
                      kl.fns.set(kl.fns.hd(V3937), kl.fns.hd(kl.fns.tl(V3937)));
                      return Kl.tailCall(kl.fns.shen$domultiple_set, [kl.fns.tl(kl.fns.tl(V3937))]);
                    })()):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.multiple-set")])));
                    });

kl.defun("destroy", 1, function (V3939) {
                      return Kl.tailCall(kl.fns.declare, [V3939, new Sym("symbol")]);
                    });

kl.defun("shen.read-evaluate-print", 0, function () {
                      return (function () {
                  const Lineread = Kl.headCall(kl.fns.shen$dotoplineread, []);
                    const History = kl.fns.value(new Sym("shen.*history*"));
                    const NewLineread = Kl.headCall(kl.fns.shen$doretrieve_from_history_if_needed, [Lineread, History]);
                    const NewHistory = Kl.headCall(kl.fns.shen$doupdate$unhistory, [NewLineread, History]);
                    const Parsed = Kl.headCall(kl.fns.fst, [NewLineread]);
                    return Kl.tailCall(kl.fns.shen$dotoplevel, [Parsed]);
                })();
                    });

kl.defun("shen.retrieve-from-history-if-needed", 2, function (V3951, V3952) {
                      return asJsBool(asKlBool(asJsBool(Kl.headCall(kl.fns.tuple$qu, [V3951])) && asJsBool(kl.fns.cons$qu(Kl.headCall(kl.fns.snd, [V3951]))) && asJsBool(Kl.headCall(kl.fns.element$qu, [kl.fns.hd(Kl.headCall(kl.fns.snd, [V3951])), kl.fns.cons(Kl.headCall(kl.fns.shen$dospace, []), kl.fns.cons(Kl.headCall(kl.fns.shen$donewline, []), null))]))))?(Kl.tailCall(kl.fns.shen$doretrieve_from_history_if_needed, [Kl.headCall(kl.fns.$atp, [Kl.headCall(kl.fns.fst, [V3951]), kl.fns.tl(Kl.headCall(kl.fns.snd, [V3951]))]), V3952])):(asJsBool(asKlBool(asJsBool(Kl.headCall(kl.fns.tuple$qu, [V3951])) && asJsBool(kl.fns.cons$qu(Kl.headCall(kl.fns.snd, [V3951]))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(Kl.headCall(kl.fns.snd, [V3951])))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(Kl.headCall(kl.fns.snd, [V3951]))))) && asJsBool(kl.fns.cons$qu(V3952)) && asJsBool(kl.fns.$eq(kl.fns.hd(Kl.headCall(kl.fns.snd, [V3951])), Kl.headCall(kl.fns.shen$doexclamation, []))) && asJsBool(kl.fns.$eq(kl.fns.hd(kl.fns.tl(Kl.headCall(kl.fns.snd, [V3951]))), Kl.headCall(kl.fns.shen$doexclamation, [])))))?((function () {
                  const PastPrint = Kl.headCall(kl.fns.shen$doprbytes, [Kl.headCall(kl.fns.snd, [kl.fns.hd(V3952)])]);
                    return kl.fns.hd(V3952);
                })()):(asJsBool(asKlBool(asJsBool(Kl.headCall(kl.fns.tuple$qu, [V3951])) && asJsBool(kl.fns.cons$qu(Kl.headCall(kl.fns.snd, [V3951]))) && asJsBool(kl.fns.$eq(kl.fns.hd(Kl.headCall(kl.fns.snd, [V3951])), Kl.headCall(kl.fns.shen$doexclamation, [])))))?((function () {
                  const Key$qu = Kl.headCall(kl.fns.shen$domake_key, [kl.fns.tl(Kl.headCall(kl.fns.snd, [V3951])), V3952]);
                    const Find = Kl.headCall(kl.fns.head, [Kl.headCall(kl.fns.shen$dofind_past_inputs, [Key$qu, V3952])]);
                    const PastPrint = Kl.headCall(kl.fns.shen$doprbytes, [Kl.headCall(kl.fns.snd, [Find])]);
                    return Find;
                })()):(asJsBool(asKlBool(asJsBool(Kl.headCall(kl.fns.tuple$qu, [V3951])) && asJsBool(kl.fns.cons$qu(Kl.headCall(kl.fns.snd, [V3951]))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(Kl.headCall(kl.fns.snd, [V3951])))) && asJsBool(kl.fns.$eq(kl.fns.hd(Kl.headCall(kl.fns.snd, [V3951])), Kl.headCall(kl.fns.shen$dopercent, [])))))?((function () {
                      Kl.headCall(kl.fns.shen$doprint_past_inputs, [Kl.setArity("shen.retrieve-from-history-if-needed_lambda", 1, function (X) {
                      return klTrue;
                    }), Kl.headCall(kl.fns.reverse, [V3952]), 0]);
                      return Kl.tailCall(kl.fns.abort, []);
                    })()):(asJsBool(asKlBool(asJsBool(Kl.headCall(kl.fns.tuple$qu, [V3951])) && asJsBool(kl.fns.cons$qu(Kl.headCall(kl.fns.snd, [V3951]))) && asJsBool(kl.fns.$eq(kl.fns.hd(Kl.headCall(kl.fns.snd, [V3951])), Kl.headCall(kl.fns.shen$dopercent, [])))))?((function () {
                  const Key$qu = Kl.headCall(kl.fns.shen$domake_key, [kl.fns.tl(Kl.headCall(kl.fns.snd, [V3951])), V3952]);
                    const Pastprint = Kl.headCall(kl.fns.shen$doprint_past_inputs, [Key$qu, Kl.headCall(kl.fns.reverse, [V3952]), 0]);
                    return Kl.tailCall(kl.fns.abort, []);
                })()):(V3951)))));
                    });

kl.defun("shen.percent", 0, function () {
                      return 37;
                    });

kl.defun("shen.exclamation", 0, function () {
                      return 33;
                    });

kl.defun("shen.prbytes", 1, function (V3954) {
                      return (function () {
                      Kl.headCall(kl.fns.shen$dofor_each, [Kl.setArity("shen.prbytes_lambda", 1, function (Byte) {
                      return Kl.tailCall(kl.fns.pr, [kl.fns.n_$gtstring(Byte), Kl.headCall(kl.fns.stoutput, [])]);
                    }), V3954]);
                      return Kl.tailCall(kl.fns.nl, [1]);
                    })();
                    });

kl.defun("shen.update_history", 2, function (V3957, V3958) {
                      return kl.symbols.shen$do$sthistory$st = kl.fns.cons(V3957, V3958);
                    });

kl.defun("shen.toplineread", 0, function () {
                      return Kl.tailCall(kl.fns.shen$dotoplineread$unloop, [Kl.headCall(kl.fns.shen$doread_char_code, [Kl.headCall(kl.fns.stinput, [])]), null]);
                    });

kl.defun("shen.toplineread_loop", 2, function (V3962, V3963) {
                      return asJsBool(kl.fns.$eq(V3962, Kl.headCall(kl.fns.shen$dohat, [])))?(kl.fns.simple_error("line read aborted")):(asJsBool(Kl.headCall(kl.fns.element$qu, [V3962, kl.fns.cons(Kl.headCall(kl.fns.shen$donewline, []), kl.fns.cons(Kl.headCall(kl.fns.shen$docarriage_return, []), null))]))?((function () {
                  const Line = Kl.headCall(kl.fns.compile, [Kl.setArity("shen.toplineread_loop_lambda", 1, function (X) {
                      return Kl.tailCall(kl.fns.shen$do$ltst$uninput$gt, [X]);
                    }), V3963, Kl.setArity("shen.toplineread_loop_lambda", 1, function (E) {
                      return new Sym("shen.nextline");
                    })]);
                    const It = Kl.headCall(kl.fns.shen$dorecord_it, [V3963]);
                    return asJsBool(asKlBool(asJsBool(kl.fns.$eq(Line, new Sym("shen.nextline"))) || asJsBool(Kl.headCall(kl.fns.empty$qu, [Line]))))?(Kl.tailCall(kl.fns.shen$dotoplineread$unloop, [Kl.headCall(kl.fns.shen$doread_char_code, [Kl.headCall(kl.fns.stinput, [])]), Kl.headCall(kl.fns.append, [V3963, kl.fns.cons(V3962, null)])])):(Kl.tailCall(kl.fns.$atp, [Line, V3963]));
                })()):(Kl.tailCall(kl.fns.shen$dotoplineread$unloop, [Kl.headCall(kl.fns.shen$doread_char_code, [Kl.headCall(kl.fns.stinput, [])]), asJsBool(kl.fns.$eq(V3962, -1))?(V3963):(Kl.headCall(kl.fns.append, [V3963, kl.fns.cons(V3962, null)]))])));
                    });

kl.defun("shen.hat", 0, function () {
                      return 94;
                    });

kl.defun("shen.newline", 0, function () {
                      return 10;
                    });

kl.defun("shen.carriage-return", 0, function () {
                      return 13;
                    });

kl.defun("tc", 1, function (V3969) {
                      return asJsBool(kl.fns.$eq(new Sym("+"), V3969))?(kl.symbols.shen$do$sttc$st = klTrue):(asJsBool(kl.fns.$eq(new Sym("-"), V3969))?(kl.symbols.shen$do$sttc$st = klFalse):(kl.fns.simple_error("tc expects a + or -")));
                    });

kl.defun("shen.prompt", 0, function () {
                      return asJsBool(kl.fns.value(new Sym("shen.*tc*")))?(Kl.tailCall(kl.fns.shen$doprhush, [kl.fns.cn("\n\n(", Kl.headCall(kl.fns.shen$doapp, [Kl.headCall(kl.fns.length, [kl.fns.value(new Sym("shen.*history*"))]), "+) ", new Sym("shen.a")])), Kl.headCall(kl.fns.stoutput, [])])):(Kl.tailCall(kl.fns.shen$doprhush, [kl.fns.cn("\n\n(", Kl.headCall(kl.fns.shen$doapp, [Kl.headCall(kl.fns.length, [kl.fns.value(new Sym("shen.*history*"))]), "-) ", new Sym("shen.a")])), Kl.headCall(kl.fns.stoutput, [])]));
                    });

kl.defun("shen.toplevel", 1, function (V3971) {
                      return Kl.tailCall(kl.fns.shen$dotoplevel$unevaluate, [V3971, kl.fns.value(new Sym("shen.*tc*"))]);
                    });

kl.defun("shen.find-past-inputs", 2, function (V3974, V3975) {
                      return (function () {
                  const F = Kl.headCall(kl.fns.shen$dofind, [V3974, V3975]);
                    return asJsBool(Kl.headCall(kl.fns.empty$qu, [F]))?(kl.fns.simple_error("input not found\n")):(F);
                })();
                    });

kl.defun("shen.make-key", 2, function (V3978, V3979) {
                      return (function () {
                  const Atom = kl.fns.hd(Kl.headCall(kl.fns.compile, [Kl.setArity("shen.make-key_lambda", 1, function (X) {
                      return Kl.tailCall(kl.fns.shen$do$ltst$uninput$gt, [X]);
                    }), V3978, Kl.setArity("shen.make-key_lambda", 1, function (E) {
                      return asJsBool(kl.fns.cons$qu(E))?(kl.fns.simple_error(kl.fns.cn("parse error here: ", Kl.headCall(kl.fns.shen$doapp, [E, "\n", new Sym("shen.s")])))):(kl.fns.simple_error("parse error\n"));
                    })]));
                    return asJsBool(Kl.headCall(kl.fns.integer$qu, [Atom]))?(Kl.setArity("shen.make-key_lambda", 1, function (X) {
                      return kl.fns.$eq(X, Kl.headCall(kl.fns.nth, [kl.fns.$pl(Atom, 1), Kl.headCall(kl.fns.reverse, [V3979])]));
                    })):(Kl.setArity("shen.make-key_lambda", 1, function (X) {
                      return Kl.tailCall(kl.fns.shen$doprefix$qu, [V3978, Kl.headCall(kl.fns.shen$dotrim_gubbins, [Kl.headCall(kl.fns.snd, [X])])]);
                    }));
                })();
                    });

kl.defun("shen.trim-gubbins", 1, function (V3981) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V3981)) && asJsBool(kl.fns.$eq(kl.fns.hd(V3981), Kl.headCall(kl.fns.shen$dospace, [])))))?(Kl.tailCall(kl.fns.shen$dotrim_gubbins, [kl.fns.tl(V3981)])):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V3981)) && asJsBool(kl.fns.$eq(kl.fns.hd(V3981), Kl.headCall(kl.fns.shen$donewline, [])))))?(Kl.tailCall(kl.fns.shen$dotrim_gubbins, [kl.fns.tl(V3981)])):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V3981)) && asJsBool(kl.fns.$eq(kl.fns.hd(V3981), Kl.headCall(kl.fns.shen$docarriage_return, [])))))?(Kl.tailCall(kl.fns.shen$dotrim_gubbins, [kl.fns.tl(V3981)])):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V3981)) && asJsBool(kl.fns.$eq(kl.fns.hd(V3981), Kl.headCall(kl.fns.shen$dotab, [])))))?(Kl.tailCall(kl.fns.shen$dotrim_gubbins, [kl.fns.tl(V3981)])):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V3981)) && asJsBool(kl.fns.$eq(kl.fns.hd(V3981), Kl.headCall(kl.fns.shen$doleft_round, [])))))?(Kl.tailCall(kl.fns.shen$dotrim_gubbins, [kl.fns.tl(V3981)])):(V3981)))));
                    });

kl.defun("shen.space", 0, function () {
                      return 32;
                    });

kl.defun("shen.tab", 0, function () {
                      return 9;
                    });

kl.defun("shen.left-round", 0, function () {
                      return 40;
                    });

kl.defun("shen.find", 2, function (V3990, V3991) {
                      return asJsBool(kl.fns.$eq(null, V3991))?(null):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V3991)) && asJsBool(Kl.headCall(V3990, [kl.fns.hd(V3991)]))))?(kl.fns.cons(kl.fns.hd(V3991), Kl.headCall(kl.fns.shen$dofind, [V3990, kl.fns.tl(V3991)]))):(asJsBool(kl.fns.cons$qu(V3991))?(Kl.tailCall(kl.fns.shen$dofind, [V3990, kl.fns.tl(V3991)])):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.find")]))));
                    });

kl.defun("shen.prefix?", 2, function (V4005, V4006) {
                      return asJsBool(kl.fns.$eq(null, V4005))?(klTrue):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V4005)) && asJsBool(kl.fns.cons$qu(V4006)) && asJsBool(kl.fns.$eq(kl.fns.hd(V4006), kl.fns.hd(V4005)))))?(Kl.tailCall(kl.fns.shen$doprefix$qu, [kl.fns.tl(V4005), kl.fns.tl(V4006)])):(klFalse));
                    });

kl.defun("shen.print-past-inputs", 3, function (V4018, V4019, V4020) {
                      return asJsBool(kl.fns.$eq(null, V4019))?(new Sym("_")):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V4019)) && asJsBool(Kl.headCall(kl.fns.not, [Kl.headCall(V4018, [kl.fns.hd(V4019)])]))))?(Kl.tailCall(kl.fns.shen$doprint_past_inputs, [V4018, kl.fns.tl(V4019), kl.fns.$pl(V4020, 1)])):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V4019)) && asJsBool(Kl.headCall(kl.fns.tuple$qu, [kl.fns.hd(V4019)]))))?((function () {
                      Kl.headCall(kl.fns.shen$doprhush, [Kl.headCall(kl.fns.shen$doapp, [V4020, ". ", new Sym("shen.a")]), Kl.headCall(kl.fns.stoutput, [])]);
Kl.headCall(kl.fns.shen$doprbytes, [Kl.headCall(kl.fns.snd, [kl.fns.hd(V4019)])]);
                      return Kl.tailCall(kl.fns.shen$doprint_past_inputs, [V4018, kl.fns.tl(V4019), kl.fns.$pl(V4020, 1)]);
                    })()):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.print-past-inputs")]))));
                    });

kl.defun("shen.toplevel_evaluate", 2, function (V4023, V4024) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V4023)) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V4023))) && asJsBool(kl.fns.$eq(new Sym(":"), kl.fns.hd(kl.fns.tl(V4023)))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(V4023)))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.tl(V4023))))) && asJsBool(kl.fns.$eq(klTrue, V4024))))?(Kl.tailCall(kl.fns.shen$dotypecheck_and_evaluate, [kl.fns.hd(V4023), kl.fns.hd(kl.fns.tl(kl.fns.tl(V4023)))])):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V4023)) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V4023)))))?((function () {
                      Kl.headCall(kl.fns.shen$dotoplevel$unevaluate, [kl.fns.cons(kl.fns.hd(V4023), null), V4024]);
Kl.headCall(kl.fns.nl, [1]);
                      return Kl.tailCall(kl.fns.shen$dotoplevel$unevaluate, [kl.fns.tl(V4023), V4024]);
                    })()):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V4023)) && asJsBool(kl.fns.$eq(null, kl.fns.tl(V4023))) && asJsBool(kl.fns.$eq(klTrue, V4024))))?(Kl.tailCall(kl.fns.shen$dotypecheck_and_evaluate, [kl.fns.hd(V4023), Kl.headCall(kl.fns.gensym, [new Sym("A")])])):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V4023)) && asJsBool(kl.fns.$eq(null, kl.fns.tl(V4023))) && asJsBool(kl.fns.$eq(klFalse, V4024))))?((function () {
                  const Eval = Kl.headCall(kl.fns.shen$doeval_without_macros, [kl.fns.hd(V4023)]);
                    return Kl.tailCall(kl.fns.print, [Eval]);
                })()):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.toplevel_evaluate")])))));
                    });

kl.defun("shen.typecheck-and-evaluate", 2, function (V4027, V4028) {
                      return (function () {
                  const Typecheck = Kl.headCall(kl.fns.shen$dotypecheck, [V4027, V4028]);
                    return asJsBool(kl.fns.$eq(Typecheck, klFalse))?(kl.fns.simple_error("type error\n")):((function () {
                  const Eval = Kl.headCall(kl.fns.shen$doeval_without_macros, [V4027]);
                    const Type = Kl.headCall(kl.fns.shen$dopretty_type, [Typecheck]);
                    return Kl.tailCall(kl.fns.shen$doprhush, [Kl.headCall(kl.fns.shen$doapp, [Eval, kl.fns.cn(" : ", Kl.headCall(kl.fns.shen$doapp, [Type, "", new Sym("shen.r")])), new Sym("shen.s")]), Kl.headCall(kl.fns.stoutput, [])]);
                })());
                })();
                    });

kl.defun("shen.pretty-type", 1, function (V4030) {
                      return Kl.tailCall(kl.fns.shen$domult$unsubst, [kl.fns.value(new Sym("shen.*alphabet*")), Kl.headCall(kl.fns.shen$doextract_pvars, [V4030]), V4030]);
                    });

kl.defun("shen.extract-pvars", 1, function (V4036) {
                      return asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V4036]))?(kl.fns.cons(V4036, null)):(asJsBool(kl.fns.cons$qu(V4036))?(Kl.tailCall(kl.fns.union, [Kl.headCall(kl.fns.shen$doextract_pvars, [kl.fns.hd(V4036)]), Kl.headCall(kl.fns.shen$doextract_pvars, [kl.fns.tl(V4036)])])):(null));
                    });

kl.defun("shen.mult_subst", 3, function (V4044, V4045, V4046) {
                      return asJsBool(kl.fns.$eq(null, V4044))?(V4046):(asJsBool(kl.fns.$eq(null, V4045))?(V4046):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V4044)) && asJsBool(kl.fns.cons$qu(V4045))))?(Kl.tailCall(kl.fns.shen$domult$unsubst, [kl.fns.tl(V4044), kl.fns.tl(V4045), Kl.headCall(kl.fns.subst, [kl.fns.hd(V4044), kl.fns.hd(V4045), V4046])])):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.mult_subst")]))));
                    });

kl.defun("shen.shen->kl", 2, function (V1384, V1385) {
                      return Kl.tailCall(kl.fns.compile, [Kl.setArity("shen.shen->kl_lambda", 1, function (X) {
                      return Kl.tailCall(kl.fns.shen$do$ltdefine$gt, [X]);
                    }), kl.fns.cons(V1384, V1385), Kl.setArity("shen.shen->kl_lambda", 1, function (X) {
                      return Kl.tailCall(kl.fns.shen$doshen_syntax_error, [V1384, X]);
                    })]);
                    });

kl.defun("shen.shen-syntax-error", 2, function (V1392, V1393) {
                      return asJsBool(kl.fns.cons$qu(V1393))?(kl.fns.simple_error(kl.fns.cn("syntax error in ", Kl.headCall(kl.fns.shen$doapp, [V1392, kl.fns.cn(" here:\n\n ", Kl.headCall(kl.fns.shen$doapp, [Kl.headCall(kl.fns.shen$donext_50, [50, kl.fns.hd(V1393)]), "\n", new Sym("shen.a")])), new Sym("shen.a")])))):(kl.fns.simple_error(kl.fns.cn("syntax error in ", Kl.headCall(kl.fns.shen$doapp, [V1392, "\n", new Sym("shen.a")]))));
                    });

kl.defun("shen.<define>", 1, function (V1395) {
                      return (function () {
                  const YaccParse = (function () {
                  const Parse$unshen$do$ltname$gt = Kl.headCall(kl.fns.shen$do$ltname$gt, [V1395]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltname$gt)]))?((function () {
                  const Parse$unshen$do$ltsignature$gt = Kl.headCall(kl.fns.shen$do$ltsignature$gt, [Parse$unshen$do$ltname$gt]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltsignature$gt)]))?((function () {
                  const Parse$unshen$do$ltrules$gt = Kl.headCall(kl.fns.shen$do$ltrules$gt, [Parse$unshen$do$ltsignature$gt]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltrules$gt)]))?(Kl.headCall(kl.fns.shen$dopair, [kl.fns.hd(Parse$unshen$do$ltrules$gt), Kl.headCall(kl.fns.shen$docompile$unto$unmachine$uncode, [Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltname$gt]), Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltrules$gt])])])):(Kl.headCall(kl.fns.fail, []));
                })()):(Kl.headCall(kl.fns.fail, []));
                })()):(Kl.headCall(kl.fns.fail, []));
                })();
                    return asJsBool(kl.fns.$eq(YaccParse, Kl.headCall(kl.fns.fail, [])))?((function () {
                  const Parse$unshen$do$ltname$gt = Kl.headCall(kl.fns.shen$do$ltname$gt, [V1395]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltname$gt)]))?((function () {
                  const Parse$unshen$do$ltrules$gt = Kl.headCall(kl.fns.shen$do$ltrules$gt, [Parse$unshen$do$ltname$gt]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltrules$gt)]))?(Kl.tailCall(kl.fns.shen$dopair, [kl.fns.hd(Parse$unshen$do$ltrules$gt), Kl.headCall(kl.fns.shen$docompile$unto$unmachine$uncode, [Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltname$gt]), Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltrules$gt])])])):(Kl.tailCall(kl.fns.fail, []));
                })()):(Kl.tailCall(kl.fns.fail, []));
                })()):(YaccParse);
                })();
                    });

kl.defun("shen.<name>", 1, function (V1397) {
                      return asJsBool(kl.fns.cons$qu(kl.fns.hd(V1397)))?((function () {
                  const Parse$unX = kl.fns.hd(kl.fns.hd(V1397));
                    return Kl.tailCall(kl.fns.shen$dopair, [kl.fns.hd(Kl.headCall(kl.fns.shen$dopair, [kl.fns.tl(kl.fns.hd(V1397)), Kl.headCall(kl.fns.shen$dohdtl, [V1397])])), asJsBool(asKlBool(asJsBool(Kl.headCall(kl.fns.symbol$qu, [Parse$unX])) && asJsBool(Kl.headCall(kl.fns.not, [Kl.headCall(kl.fns.shen$dosysfunc$qu, [Parse$unX])]))))?(Parse$unX):(kl.fns.simple_error(Kl.headCall(kl.fns.shen$doapp, [Parse$unX, " is not a legitimate function name.\n", new Sym("shen.a")])))]);
                })()):(Kl.tailCall(kl.fns.fail, []));
                    });

kl.defun("shen.sysfunc?", 1, function (V1399) {
                      return Kl.tailCall(kl.fns.element$qu, [V1399, Kl.headCall(kl.fns.get, [kl.fns.intern("shen"), new Sym("shen.external-symbols"), kl.fns.value(new Sym("*property-vector*"))])]);
                    });

kl.defun("shen.<signature>", 1, function (V1401) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(kl.fns.hd(V1401))) && asJsBool(kl.fns.$eq(new Sym("{"), kl.fns.hd(kl.fns.hd(V1401))))))?((function () {
                  const Parse$unshen$do$ltsignature_help$gt = Kl.headCall(kl.fns.shen$do$ltsignature_help$gt, [Kl.headCall(kl.fns.shen$dopair, [kl.fns.tl(kl.fns.hd(V1401)), Kl.headCall(kl.fns.shen$dohdtl, [V1401])])]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltsignature_help$gt)]))?(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(kl.fns.hd(Parse$unshen$do$ltsignature_help$gt))) && asJsBool(kl.fns.$eq(new Sym("}"), kl.fns.hd(kl.fns.hd(Parse$unshen$do$ltsignature_help$gt))))))?(Kl.tailCall(kl.fns.shen$dopair, [kl.fns.hd(Kl.headCall(kl.fns.shen$dopair, [kl.fns.tl(kl.fns.hd(Parse$unshen$do$ltsignature_help$gt)), Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltsignature_help$gt])])), Kl.headCall(kl.fns.shen$dodemodulate, [Kl.headCall(kl.fns.shen$docurry_type, [Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltsignature_help$gt])])])])):(Kl.tailCall(kl.fns.fail, []))):(Kl.tailCall(kl.fns.fail, []));
                })()):(Kl.tailCall(kl.fns.fail, []));
                    });

kl.defun("shen.curry-type", 1, function (V1403) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1403)) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V1403))) && asJsBool(kl.fns.$eq(new Sym("-->"), kl.fns.hd(kl.fns.tl(V1403)))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(V1403)))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(kl.fns.tl(V1403))))) && asJsBool(kl.fns.$eq(new Sym("-->"), kl.fns.hd(kl.fns.tl(kl.fns.tl(kl.fns.tl(V1403))))))))?(Kl.tailCall(kl.fns.shen$docurry_type, [kl.fns.cons(kl.fns.hd(V1403), kl.fns.cons(new Sym("-->"), kl.fns.cons(kl.fns.tl(kl.fns.tl(V1403)), null)))])):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1403)) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V1403))) && asJsBool(kl.fns.$eq(new Sym("*"), kl.fns.hd(kl.fns.tl(V1403)))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(V1403)))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(kl.fns.tl(V1403))))) && asJsBool(kl.fns.$eq(new Sym("*"), kl.fns.hd(kl.fns.tl(kl.fns.tl(kl.fns.tl(V1403))))))))?(Kl.tailCall(kl.fns.shen$docurry_type, [kl.fns.cons(kl.fns.hd(V1403), kl.fns.cons(new Sym("*"), kl.fns.cons(kl.fns.tl(kl.fns.tl(V1403)), null)))])):(asJsBool(kl.fns.cons$qu(V1403))?(Kl.tailCall(kl.fns.map, [Kl.setArity("shen.curry-type_lambda", 1, function (Z) {
                      return Kl.tailCall(kl.fns.shen$docurry_type, [Z]);
                    }), V1403])):(V1403)));
                    });

kl.defun("shen.<signature-help>", 1, function (V1405) {
                      return (function () {
                  const YaccParse = asJsBool(kl.fns.cons$qu(kl.fns.hd(V1405)))?((function () {
                  const Parse$unX = kl.fns.hd(kl.fns.hd(V1405));
                    const Parse$unshen$do$ltsignature_help$gt = Kl.headCall(kl.fns.shen$do$ltsignature_help$gt, [Kl.headCall(kl.fns.shen$dopair, [kl.fns.tl(kl.fns.hd(V1405)), Kl.headCall(kl.fns.shen$dohdtl, [V1405])])]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltsignature_help$gt)]))?(asJsBool(Kl.headCall(kl.fns.not, [Kl.headCall(kl.fns.element$qu, [Parse$unX, kl.fns.cons(new Sym("{"), kl.fns.cons(new Sym("}"), null))])]))?(Kl.headCall(kl.fns.shen$dopair, [kl.fns.hd(Parse$unshen$do$ltsignature_help$gt), kl.fns.cons(Parse$unX, Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltsignature_help$gt]))])):(Kl.headCall(kl.fns.fail, []))):(Kl.headCall(kl.fns.fail, []));
                })()):(Kl.headCall(kl.fns.fail, []));
                    return asJsBool(kl.fns.$eq(YaccParse, Kl.headCall(kl.fns.fail, [])))?((function () {
                  const Parse$un$lte$gt = Kl.headCall(kl.fns.$lte$gt, [V1405]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$un$lte$gt)]))?(Kl.tailCall(kl.fns.shen$dopair, [kl.fns.hd(Parse$un$lte$gt), null])):(Kl.tailCall(kl.fns.fail, []));
                })()):(YaccParse);
                })();
                    });

kl.defun("shen.<rules>", 1, function (V1407) {
                      return (function () {
                  const YaccParse = (function () {
                  const Parse$unshen$do$ltrule$gt = Kl.headCall(kl.fns.shen$do$ltrule$gt, [V1407]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltrule$gt)]))?((function () {
                  const Parse$unshen$do$ltrules$gt = Kl.headCall(kl.fns.shen$do$ltrules$gt, [Parse$unshen$do$ltrule$gt]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltrules$gt)]))?(Kl.headCall(kl.fns.shen$dopair, [kl.fns.hd(Parse$unshen$do$ltrules$gt), kl.fns.cons(Kl.headCall(kl.fns.shen$dolinearise, [Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltrule$gt])]), Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltrules$gt]))])):(Kl.headCall(kl.fns.fail, []));
                })()):(Kl.headCall(kl.fns.fail, []));
                })();
                    return asJsBool(kl.fns.$eq(YaccParse, Kl.headCall(kl.fns.fail, [])))?((function () {
                  const Parse$unshen$do$ltrule$gt = Kl.headCall(kl.fns.shen$do$ltrule$gt, [V1407]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltrule$gt)]))?(Kl.tailCall(kl.fns.shen$dopair, [kl.fns.hd(Parse$unshen$do$ltrule$gt), kl.fns.cons(Kl.headCall(kl.fns.shen$dolinearise, [Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltrule$gt])]), null)])):(Kl.tailCall(kl.fns.fail, []));
                })()):(YaccParse);
                })();
                    });

kl.defun("shen.<rule>", 1, function (V1409) {
                      return (function () {
                  const YaccParse = (function () {
                  const Parse$unshen$do$ltpatterns$gt = Kl.headCall(kl.fns.shen$do$ltpatterns$gt, [V1409]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltpatterns$gt)]))?(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(kl.fns.hd(Parse$unshen$do$ltpatterns$gt))) && asJsBool(kl.fns.$eq(new Sym("->"), kl.fns.hd(kl.fns.hd(Parse$unshen$do$ltpatterns$gt))))))?((function () {
                  const Parse$unshen$do$ltaction$gt = Kl.headCall(kl.fns.shen$do$ltaction$gt, [Kl.headCall(kl.fns.shen$dopair, [kl.fns.tl(kl.fns.hd(Parse$unshen$do$ltpatterns$gt)), Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltpatterns$gt])])]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltaction$gt)]))?(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(kl.fns.hd(Parse$unshen$do$ltaction$gt))) && asJsBool(kl.fns.$eq(new Sym("where"), kl.fns.hd(kl.fns.hd(Parse$unshen$do$ltaction$gt))))))?((function () {
                  const Parse$unshen$do$ltguard$gt = Kl.headCall(kl.fns.shen$do$ltguard$gt, [Kl.headCall(kl.fns.shen$dopair, [kl.fns.tl(kl.fns.hd(Parse$unshen$do$ltaction$gt)), Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltaction$gt])])]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltguard$gt)]))?(Kl.headCall(kl.fns.shen$dopair, [kl.fns.hd(Parse$unshen$do$ltguard$gt), kl.fns.cons(Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltpatterns$gt]), kl.fns.cons(kl.fns.cons(new Sym("where"), kl.fns.cons(Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltguard$gt]), kl.fns.cons(Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltaction$gt]), null))), null))])):(Kl.headCall(kl.fns.fail, []));
                })()):(Kl.headCall(kl.fns.fail, []))):(Kl.headCall(kl.fns.fail, []));
                })()):(Kl.headCall(kl.fns.fail, []))):(Kl.headCall(kl.fns.fail, []));
                })();
                    return asJsBool(kl.fns.$eq(YaccParse, Kl.headCall(kl.fns.fail, [])))?((function () {
                  const YaccParse_1 = (function () {
                  const Parse$unshen$do$ltpatterns$gt = Kl.headCall(kl.fns.shen$do$ltpatterns$gt, [V1409]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltpatterns$gt)]))?(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(kl.fns.hd(Parse$unshen$do$ltpatterns$gt))) && asJsBool(kl.fns.$eq(new Sym("->"), kl.fns.hd(kl.fns.hd(Parse$unshen$do$ltpatterns$gt))))))?((function () {
                  const Parse$unshen$do$ltaction$gt = Kl.headCall(kl.fns.shen$do$ltaction$gt, [Kl.headCall(kl.fns.shen$dopair, [kl.fns.tl(kl.fns.hd(Parse$unshen$do$ltpatterns$gt)), Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltpatterns$gt])])]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltaction$gt)]))?(Kl.headCall(kl.fns.shen$dopair, [kl.fns.hd(Parse$unshen$do$ltaction$gt), kl.fns.cons(Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltpatterns$gt]), kl.fns.cons(Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltaction$gt]), null))])):(Kl.headCall(kl.fns.fail, []));
                })()):(Kl.headCall(kl.fns.fail, []))):(Kl.headCall(kl.fns.fail, []));
                })();
                    return asJsBool(kl.fns.$eq(YaccParse_1, Kl.headCall(kl.fns.fail, [])))?((function () {
                  const YaccParse_2 = (function () {
                  const Parse$unshen$do$ltpatterns$gt = Kl.headCall(kl.fns.shen$do$ltpatterns$gt, [V1409]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltpatterns$gt)]))?(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(kl.fns.hd(Parse$unshen$do$ltpatterns$gt))) && asJsBool(kl.fns.$eq(new Sym("<-"), kl.fns.hd(kl.fns.hd(Parse$unshen$do$ltpatterns$gt))))))?((function () {
                  const Parse$unshen$do$ltaction$gt = Kl.headCall(kl.fns.shen$do$ltaction$gt, [Kl.headCall(kl.fns.shen$dopair, [kl.fns.tl(kl.fns.hd(Parse$unshen$do$ltpatterns$gt)), Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltpatterns$gt])])]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltaction$gt)]))?(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(kl.fns.hd(Parse$unshen$do$ltaction$gt))) && asJsBool(kl.fns.$eq(new Sym("where"), kl.fns.hd(kl.fns.hd(Parse$unshen$do$ltaction$gt))))))?((function () {
                  const Parse$unshen$do$ltguard$gt = Kl.headCall(kl.fns.shen$do$ltguard$gt, [Kl.headCall(kl.fns.shen$dopair, [kl.fns.tl(kl.fns.hd(Parse$unshen$do$ltaction$gt)), Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltaction$gt])])]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltguard$gt)]))?(Kl.headCall(kl.fns.shen$dopair, [kl.fns.hd(Parse$unshen$do$ltguard$gt), kl.fns.cons(Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltpatterns$gt]), kl.fns.cons(kl.fns.cons(new Sym("where"), kl.fns.cons(Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltguard$gt]), kl.fns.cons(kl.fns.cons(new Sym("shen.choicepoint!"), kl.fns.cons(Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltaction$gt]), null)), null))), null))])):(Kl.headCall(kl.fns.fail, []));
                })()):(Kl.headCall(kl.fns.fail, []))):(Kl.headCall(kl.fns.fail, []));
                })()):(Kl.headCall(kl.fns.fail, []))):(Kl.headCall(kl.fns.fail, []));
                })();
                    return asJsBool(kl.fns.$eq(YaccParse_2, Kl.headCall(kl.fns.fail, [])))?((function () {
                  const Parse$unshen$do$ltpatterns$gt = Kl.headCall(kl.fns.shen$do$ltpatterns$gt, [V1409]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltpatterns$gt)]))?(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(kl.fns.hd(Parse$unshen$do$ltpatterns$gt))) && asJsBool(kl.fns.$eq(new Sym("<-"), kl.fns.hd(kl.fns.hd(Parse$unshen$do$ltpatterns$gt))))))?((function () {
                  const Parse$unshen$do$ltaction$gt = Kl.headCall(kl.fns.shen$do$ltaction$gt, [Kl.headCall(kl.fns.shen$dopair, [kl.fns.tl(kl.fns.hd(Parse$unshen$do$ltpatterns$gt)), Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltpatterns$gt])])]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltaction$gt)]))?(Kl.tailCall(kl.fns.shen$dopair, [kl.fns.hd(Parse$unshen$do$ltaction$gt), kl.fns.cons(Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltpatterns$gt]), kl.fns.cons(kl.fns.cons(new Sym("shen.choicepoint!"), kl.fns.cons(Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltaction$gt]), null)), null))])):(Kl.tailCall(kl.fns.fail, []));
                })()):(Kl.tailCall(kl.fns.fail, []))):(Kl.tailCall(kl.fns.fail, []));
                })()):(YaccParse_2);
                })()):(YaccParse_1);
                })()):(YaccParse);
                })();
                    });

kl.defun("shen.fail_if", 2, function (V1412, V1413) {
                      return asJsBool(Kl.headCall(V1412, [V1413]))?(Kl.tailCall(kl.fns.fail, [])):(V1413);
                    });

kl.defun("shen.succeeds?", 1, function (V1419) {
                      return asJsBool(kl.fns.$eq(V1419, Kl.headCall(kl.fns.fail, [])))?(klFalse):(klTrue);
                    });

kl.defun("shen.<patterns>", 1, function (V1421) {
                      return (function () {
                  const YaccParse = (function () {
                  const Parse$unshen$do$ltpattern$gt = Kl.headCall(kl.fns.shen$do$ltpattern$gt, [V1421]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltpattern$gt)]))?((function () {
                  const Parse$unshen$do$ltpatterns$gt = Kl.headCall(kl.fns.shen$do$ltpatterns$gt, [Parse$unshen$do$ltpattern$gt]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltpatterns$gt)]))?(Kl.headCall(kl.fns.shen$dopair, [kl.fns.hd(Parse$unshen$do$ltpatterns$gt), kl.fns.cons(Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltpattern$gt]), Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltpatterns$gt]))])):(Kl.headCall(kl.fns.fail, []));
                })()):(Kl.headCall(kl.fns.fail, []));
                })();
                    return asJsBool(kl.fns.$eq(YaccParse, Kl.headCall(kl.fns.fail, [])))?((function () {
                  const Parse$un$lte$gt = Kl.headCall(kl.fns.$lte$gt, [V1421]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$un$lte$gt)]))?(Kl.tailCall(kl.fns.shen$dopair, [kl.fns.hd(Parse$un$lte$gt), null])):(Kl.tailCall(kl.fns.fail, []));
                })()):(YaccParse);
                })();
                    });

kl.defun("shen.<pattern>", 1, function (V1428) {
                      return (function () {
                  const YaccParse = asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(kl.fns.hd(V1428))) && asJsBool(kl.fns.cons$qu(kl.fns.hd(kl.fns.hd(V1428))))))?(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(kl.fns.hd(Kl.headCall(kl.fns.shen$dopair, [kl.fns.hd(kl.fns.hd(V1428)), kl.fns.hd(kl.fns.tl(V1428))])))) && asJsBool(kl.fns.$eq(new Sym("@p"), kl.fns.hd(kl.fns.hd(Kl.headCall(kl.fns.shen$dopair, [kl.fns.hd(kl.fns.hd(V1428)), kl.fns.hd(kl.fns.tl(V1428))])))))))?((function () {
                  const Parse$unshen$do$ltpattern1$gt = Kl.headCall(kl.fns.shen$do$ltpattern1$gt, [Kl.headCall(kl.fns.shen$dopair, [kl.fns.tl(kl.fns.hd(Kl.headCall(kl.fns.shen$dopair, [kl.fns.hd(kl.fns.hd(V1428)), kl.fns.hd(kl.fns.tl(V1428))]))), Kl.headCall(kl.fns.shen$dohdtl, [Kl.headCall(kl.fns.shen$dopair, [kl.fns.hd(kl.fns.hd(V1428)), kl.fns.hd(kl.fns.tl(V1428))])])])]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltpattern1$gt)]))?((function () {
                  const Parse$unshen$do$ltpattern2$gt = Kl.headCall(kl.fns.shen$do$ltpattern2$gt, [Parse$unshen$do$ltpattern1$gt]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltpattern2$gt)]))?(Kl.headCall(kl.fns.shen$dopair, [kl.fns.hd(Kl.headCall(kl.fns.shen$dopair, [kl.fns.tl(kl.fns.hd(V1428)), kl.fns.hd(kl.fns.tl(V1428))])), kl.fns.cons(new Sym("@p"), kl.fns.cons(Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltpattern1$gt]), kl.fns.cons(Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltpattern2$gt]), null)))])):(Kl.headCall(kl.fns.fail, []));
                })()):(Kl.headCall(kl.fns.fail, []));
                })()):(Kl.headCall(kl.fns.fail, []))):(Kl.headCall(kl.fns.fail, []));
                    return asJsBool(kl.fns.$eq(YaccParse, Kl.headCall(kl.fns.fail, [])))?((function () {
                  const YaccParse_1 = asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(kl.fns.hd(V1428))) && asJsBool(kl.fns.cons$qu(kl.fns.hd(kl.fns.hd(V1428))))))?(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(kl.fns.hd(Kl.headCall(kl.fns.shen$dopair, [kl.fns.hd(kl.fns.hd(V1428)), kl.fns.hd(kl.fns.tl(V1428))])))) && asJsBool(kl.fns.$eq(new Sym("cons"), kl.fns.hd(kl.fns.hd(Kl.headCall(kl.fns.shen$dopair, [kl.fns.hd(kl.fns.hd(V1428)), kl.fns.hd(kl.fns.tl(V1428))])))))))?((function () {
                  const Parse$unshen$do$ltpattern1$gt = Kl.headCall(kl.fns.shen$do$ltpattern1$gt, [Kl.headCall(kl.fns.shen$dopair, [kl.fns.tl(kl.fns.hd(Kl.headCall(kl.fns.shen$dopair, [kl.fns.hd(kl.fns.hd(V1428)), kl.fns.hd(kl.fns.tl(V1428))]))), Kl.headCall(kl.fns.shen$dohdtl, [Kl.headCall(kl.fns.shen$dopair, [kl.fns.hd(kl.fns.hd(V1428)), kl.fns.hd(kl.fns.tl(V1428))])])])]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltpattern1$gt)]))?((function () {
                  const Parse$unshen$do$ltpattern2$gt = Kl.headCall(kl.fns.shen$do$ltpattern2$gt, [Parse$unshen$do$ltpattern1$gt]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltpattern2$gt)]))?(Kl.headCall(kl.fns.shen$dopair, [kl.fns.hd(Kl.headCall(kl.fns.shen$dopair, [kl.fns.tl(kl.fns.hd(V1428)), kl.fns.hd(kl.fns.tl(V1428))])), kl.fns.cons(new Sym("cons"), kl.fns.cons(Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltpattern1$gt]), kl.fns.cons(Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltpattern2$gt]), null)))])):(Kl.headCall(kl.fns.fail, []));
                })()):(Kl.headCall(kl.fns.fail, []));
                })()):(Kl.headCall(kl.fns.fail, []))):(Kl.headCall(kl.fns.fail, []));
                    return asJsBool(kl.fns.$eq(YaccParse_1, Kl.headCall(kl.fns.fail, [])))?((function () {
                  const YaccParse_2 = asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(kl.fns.hd(V1428))) && asJsBool(kl.fns.cons$qu(kl.fns.hd(kl.fns.hd(V1428))))))?(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(kl.fns.hd(Kl.headCall(kl.fns.shen$dopair, [kl.fns.hd(kl.fns.hd(V1428)), kl.fns.hd(kl.fns.tl(V1428))])))) && asJsBool(kl.fns.$eq(new Sym("@v"), kl.fns.hd(kl.fns.hd(Kl.headCall(kl.fns.shen$dopair, [kl.fns.hd(kl.fns.hd(V1428)), kl.fns.hd(kl.fns.tl(V1428))])))))))?((function () {
                  const Parse$unshen$do$ltpattern1$gt = Kl.headCall(kl.fns.shen$do$ltpattern1$gt, [Kl.headCall(kl.fns.shen$dopair, [kl.fns.tl(kl.fns.hd(Kl.headCall(kl.fns.shen$dopair, [kl.fns.hd(kl.fns.hd(V1428)), kl.fns.hd(kl.fns.tl(V1428))]))), Kl.headCall(kl.fns.shen$dohdtl, [Kl.headCall(kl.fns.shen$dopair, [kl.fns.hd(kl.fns.hd(V1428)), kl.fns.hd(kl.fns.tl(V1428))])])])]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltpattern1$gt)]))?((function () {
                  const Parse$unshen$do$ltpattern2$gt = Kl.headCall(kl.fns.shen$do$ltpattern2$gt, [Parse$unshen$do$ltpattern1$gt]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltpattern2$gt)]))?(Kl.headCall(kl.fns.shen$dopair, [kl.fns.hd(Kl.headCall(kl.fns.shen$dopair, [kl.fns.tl(kl.fns.hd(V1428)), kl.fns.hd(kl.fns.tl(V1428))])), kl.fns.cons(new Sym("@v"), kl.fns.cons(Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltpattern1$gt]), kl.fns.cons(Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltpattern2$gt]), null)))])):(Kl.headCall(kl.fns.fail, []));
                })()):(Kl.headCall(kl.fns.fail, []));
                })()):(Kl.headCall(kl.fns.fail, []))):(Kl.headCall(kl.fns.fail, []));
                    return asJsBool(kl.fns.$eq(YaccParse_2, Kl.headCall(kl.fns.fail, [])))?((function () {
                  const YaccParse_3 = asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(kl.fns.hd(V1428))) && asJsBool(kl.fns.cons$qu(kl.fns.hd(kl.fns.hd(V1428))))))?(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(kl.fns.hd(Kl.headCall(kl.fns.shen$dopair, [kl.fns.hd(kl.fns.hd(V1428)), kl.fns.hd(kl.fns.tl(V1428))])))) && asJsBool(kl.fns.$eq(new Sym("@s"), kl.fns.hd(kl.fns.hd(Kl.headCall(kl.fns.shen$dopair, [kl.fns.hd(kl.fns.hd(V1428)), kl.fns.hd(kl.fns.tl(V1428))])))))))?((function () {
                  const Parse$unshen$do$ltpattern1$gt = Kl.headCall(kl.fns.shen$do$ltpattern1$gt, [Kl.headCall(kl.fns.shen$dopair, [kl.fns.tl(kl.fns.hd(Kl.headCall(kl.fns.shen$dopair, [kl.fns.hd(kl.fns.hd(V1428)), kl.fns.hd(kl.fns.tl(V1428))]))), Kl.headCall(kl.fns.shen$dohdtl, [Kl.headCall(kl.fns.shen$dopair, [kl.fns.hd(kl.fns.hd(V1428)), kl.fns.hd(kl.fns.tl(V1428))])])])]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltpattern1$gt)]))?((function () {
                  const Parse$unshen$do$ltpattern2$gt = Kl.headCall(kl.fns.shen$do$ltpattern2$gt, [Parse$unshen$do$ltpattern1$gt]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltpattern2$gt)]))?(Kl.headCall(kl.fns.shen$dopair, [kl.fns.hd(Kl.headCall(kl.fns.shen$dopair, [kl.fns.tl(kl.fns.hd(V1428)), kl.fns.hd(kl.fns.tl(V1428))])), kl.fns.cons(new Sym("@s"), kl.fns.cons(Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltpattern1$gt]), kl.fns.cons(Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltpattern2$gt]), null)))])):(Kl.headCall(kl.fns.fail, []));
                })()):(Kl.headCall(kl.fns.fail, []));
                })()):(Kl.headCall(kl.fns.fail, []))):(Kl.headCall(kl.fns.fail, []));
                    return asJsBool(kl.fns.$eq(YaccParse_3, Kl.headCall(kl.fns.fail, [])))?((function () {
                  const YaccParse_4 = asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(kl.fns.hd(V1428))) && asJsBool(kl.fns.cons$qu(kl.fns.hd(kl.fns.hd(V1428))))))?(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(kl.fns.hd(Kl.headCall(kl.fns.shen$dopair, [kl.fns.hd(kl.fns.hd(V1428)), kl.fns.hd(kl.fns.tl(V1428))])))) && asJsBool(kl.fns.$eq(new Sym("vector"), kl.fns.hd(kl.fns.hd(Kl.headCall(kl.fns.shen$dopair, [kl.fns.hd(kl.fns.hd(V1428)), kl.fns.hd(kl.fns.tl(V1428))])))))))?(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(kl.fns.hd(Kl.headCall(kl.fns.shen$dopair, [kl.fns.tl(kl.fns.hd(Kl.headCall(kl.fns.shen$dopair, [kl.fns.hd(kl.fns.hd(V1428)), kl.fns.hd(kl.fns.tl(V1428))]))), Kl.headCall(kl.fns.shen$dohdtl, [Kl.headCall(kl.fns.shen$dopair, [kl.fns.hd(kl.fns.hd(V1428)), kl.fns.hd(kl.fns.tl(V1428))])])])))) && asJsBool(kl.fns.$eq(0, kl.fns.hd(kl.fns.hd(Kl.headCall(kl.fns.shen$dopair, [kl.fns.tl(kl.fns.hd(Kl.headCall(kl.fns.shen$dopair, [kl.fns.hd(kl.fns.hd(V1428)), kl.fns.hd(kl.fns.tl(V1428))]))), Kl.headCall(kl.fns.shen$dohdtl, [Kl.headCall(kl.fns.shen$dopair, [kl.fns.hd(kl.fns.hd(V1428)), kl.fns.hd(kl.fns.tl(V1428))])])])))))))?(Kl.headCall(kl.fns.shen$dopair, [kl.fns.hd(Kl.headCall(kl.fns.shen$dopair, [kl.fns.tl(kl.fns.hd(V1428)), kl.fns.hd(kl.fns.tl(V1428))])), kl.fns.cons(new Sym("vector"), kl.fns.cons(0, null))])):(Kl.headCall(kl.fns.fail, []))):(Kl.headCall(kl.fns.fail, []))):(Kl.headCall(kl.fns.fail, []));
                    return asJsBool(kl.fns.$eq(YaccParse_4, Kl.headCall(kl.fns.fail, [])))?((function () {
                  const YaccParse_5 = asJsBool(kl.fns.cons$qu(kl.fns.hd(V1428)))?((function () {
                  const Parse$unX = kl.fns.hd(kl.fns.hd(V1428));
                    return asJsBool(kl.fns.cons$qu(Parse$unX))?(Kl.headCall(kl.fns.shen$dopair, [kl.fns.hd(Kl.headCall(kl.fns.shen$dopair, [kl.fns.tl(kl.fns.hd(V1428)), Kl.headCall(kl.fns.shen$dohdtl, [V1428])])), Kl.headCall(kl.fns.shen$doconstructor_error, [Parse$unX])])):(Kl.headCall(kl.fns.fail, []));
                })()):(Kl.headCall(kl.fns.fail, []));
                    return asJsBool(kl.fns.$eq(YaccParse_5, Kl.headCall(kl.fns.fail, [])))?((function () {
                  const Parse$unshen$do$ltsimple$unpattern$gt = Kl.headCall(kl.fns.shen$do$ltsimple$unpattern$gt, [V1428]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltsimple$unpattern$gt)]))?(Kl.tailCall(kl.fns.shen$dopair, [kl.fns.hd(Parse$unshen$do$ltsimple$unpattern$gt), Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltsimple$unpattern$gt])])):(Kl.tailCall(kl.fns.fail, []));
                })()):(YaccParse_5);
                })()):(YaccParse_4);
                })()):(YaccParse_3);
                })()):(YaccParse_2);
                })()):(YaccParse_1);
                })()):(YaccParse);
                })();
                    });

kl.defun("shen.constructor-error", 1, function (V1430) {
                      return kl.fns.simple_error(Kl.headCall(kl.fns.shen$doapp, [V1430, " is not a legitimate constructor\n", new Sym("shen.a")]));
                    });

kl.defun("shen.<simple_pattern>", 1, function (V1432) {
                      return (function () {
                  const YaccParse = asJsBool(kl.fns.cons$qu(kl.fns.hd(V1432)))?((function () {
                  const Parse$unX = kl.fns.hd(kl.fns.hd(V1432));
                    return asJsBool(kl.fns.$eq(Parse$unX, new Sym("_")))?(Kl.headCall(kl.fns.shen$dopair, [kl.fns.hd(Kl.headCall(kl.fns.shen$dopair, [kl.fns.tl(kl.fns.hd(V1432)), Kl.headCall(kl.fns.shen$dohdtl, [V1432])])), Kl.headCall(kl.fns.gensym, [new Sym("Parse_Y")])])):(Kl.headCall(kl.fns.fail, []));
                })()):(Kl.headCall(kl.fns.fail, []));
                    return asJsBool(kl.fns.$eq(YaccParse, Kl.headCall(kl.fns.fail, [])))?(asJsBool(kl.fns.cons$qu(kl.fns.hd(V1432)))?((function () {
                  const Parse$unX = kl.fns.hd(kl.fns.hd(V1432));
                    return asJsBool(Kl.headCall(kl.fns.not, [Kl.headCall(kl.fns.element$qu, [Parse$unX, kl.fns.cons(new Sym("->"), kl.fns.cons(new Sym("<-"), null))])]))?(Kl.tailCall(kl.fns.shen$dopair, [kl.fns.hd(Kl.headCall(kl.fns.shen$dopair, [kl.fns.tl(kl.fns.hd(V1432)), Kl.headCall(kl.fns.shen$dohdtl, [V1432])])), Parse$unX])):(Kl.tailCall(kl.fns.fail, []));
                })()):(Kl.tailCall(kl.fns.fail, []))):(YaccParse);
                })();
                    });

kl.defun("shen.<pattern1>", 1, function (V1434) {
                      return (function () {
                  const Parse$unshen$do$ltpattern$gt = Kl.headCall(kl.fns.shen$do$ltpattern$gt, [V1434]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltpattern$gt)]))?(Kl.tailCall(kl.fns.shen$dopair, [kl.fns.hd(Parse$unshen$do$ltpattern$gt), Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltpattern$gt])])):(Kl.tailCall(kl.fns.fail, []));
                })();
                    });

kl.defun("shen.<pattern2>", 1, function (V1436) {
                      return (function () {
                  const Parse$unshen$do$ltpattern$gt = Kl.headCall(kl.fns.shen$do$ltpattern$gt, [V1436]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltpattern$gt)]))?(Kl.tailCall(kl.fns.shen$dopair, [kl.fns.hd(Parse$unshen$do$ltpattern$gt), Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltpattern$gt])])):(Kl.tailCall(kl.fns.fail, []));
                })();
                    });

kl.defun("shen.<action>", 1, function (V1438) {
                      return asJsBool(kl.fns.cons$qu(kl.fns.hd(V1438)))?((function () {
                  const Parse$unX = kl.fns.hd(kl.fns.hd(V1438));
                    return Kl.tailCall(kl.fns.shen$dopair, [kl.fns.hd(Kl.headCall(kl.fns.shen$dopair, [kl.fns.tl(kl.fns.hd(V1438)), Kl.headCall(kl.fns.shen$dohdtl, [V1438])])), Parse$unX]);
                })()):(Kl.tailCall(kl.fns.fail, []));
                    });

kl.defun("shen.<guard>", 1, function (V1440) {
                      return asJsBool(kl.fns.cons$qu(kl.fns.hd(V1440)))?((function () {
                  const Parse$unX = kl.fns.hd(kl.fns.hd(V1440));
                    return Kl.tailCall(kl.fns.shen$dopair, [kl.fns.hd(Kl.headCall(kl.fns.shen$dopair, [kl.fns.tl(kl.fns.hd(V1440)), Kl.headCall(kl.fns.shen$dohdtl, [V1440])])), Parse$unX]);
                })()):(Kl.tailCall(kl.fns.fail, []));
                    });

kl.defun("shen.compile_to_machine_code", 2, function (V1443, V1444) {
                      return (function () {
                  const Lambda$pl = Kl.headCall(kl.fns.shen$docompile$unto$unlambda$pl, [V1443, V1444]);
                    const KL = Kl.headCall(kl.fns.shen$docompile$unto$unkl, [V1443, Lambda$pl]);
                    const Record = Kl.headCall(kl.fns.shen$dorecord_source, [V1443, KL]);
                    return KL;
                })();
                    });

kl.defun("shen.record-source", 2, function (V1449, V1450) {
                      return asJsBool(kl.fns.value(new Sym("shen.*installing-kl*")))?(new Sym("shen.skip")):(Kl.tailCall(kl.fns.put, [V1449, new Sym("shen.source"), V1450, kl.fns.value(new Sym("*property-vector*"))]));
                    });

kl.defun("shen.compile_to_lambda+", 2, function (V1453, V1454) {
                      return (function () {
                  const Arity = Kl.headCall(kl.fns.shen$doaritycheck, [V1453, V1454]);
                    const UpDateSymbolTable = Kl.headCall(kl.fns.shen$doupdate_symbol_table, [V1453, Arity]);
                    const Free = Kl.headCall(kl.fns.shen$dofor_each, [Kl.setArity("shen.compile_to_lambda+_lambda", 1, function (Rule) {
                      return Kl.tailCall(kl.fns.shen$dofree$unvariable$uncheck, [V1453, Rule]);
                    }), V1454]);
                    const Variables = Kl.headCall(kl.fns.shen$doparameters, [Arity]);
                    const Strip = Kl.headCall(kl.fns.map, [Kl.setArity("shen.compile_to_lambda+_lambda", 1, function (X) {
                      return Kl.tailCall(kl.fns.shen$dostrip_protect, [X]);
                    }), V1454]);
                    const Abstractions = Kl.headCall(kl.fns.map, [Kl.setArity("shen.compile_to_lambda+_lambda", 1, function (X) {
                      return Kl.tailCall(kl.fns.shen$doabstract$unrule, [X]);
                    }), Strip]);
                    const Applications = Kl.headCall(kl.fns.map, [Kl.setArity("shen.compile_to_lambda+_lambda", 1, function (X) {
                      return Kl.tailCall(kl.fns.shen$doapplication$unbuild, [Variables, X]);
                    }), Abstractions]);
                    return kl.fns.cons(Variables, kl.fns.cons(Applications, null));
                })();
                    });

kl.defun("shen.update-symbol-table", 2, function (V1457, V1458) {
                      return asJsBool(kl.fns.$eq(0, V1458))?(new Sym("shen.skip")):(Kl.tailCall(kl.fns.put, [V1457, new Sym("shen.lambda-form"), kl.fns.eval_kl(Kl.headCall(kl.fns.shen$dolambda_form, [V1457, V1458])), kl.fns.value(new Sym("*property-vector*"))]));
                    });

kl.defun("shen.free_variable_check", 2, function (V1461, V1462) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1462)) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V1462))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(V1462))))))?((function () {
                  const Bound = Kl.headCall(kl.fns.shen$doextract$unvars, [kl.fns.hd(V1462)]);
                    const Free = Kl.headCall(kl.fns.shen$doextract$unfree$unvars, [Bound, kl.fns.hd(kl.fns.tl(V1462))]);
                    return Kl.tailCall(kl.fns.shen$dofree$unvariable$unwarnings, [V1461, Free]);
                })()):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.free_variable_check")]));
                    });

kl.defun("shen.extract_vars", 1, function (V1464) {
                      return asJsBool(Kl.headCall(kl.fns.variable$qu, [V1464]))?(kl.fns.cons(V1464, null)):(asJsBool(kl.fns.cons$qu(V1464))?(Kl.tailCall(kl.fns.union, [Kl.headCall(kl.fns.shen$doextract$unvars, [kl.fns.hd(V1464)]), Kl.headCall(kl.fns.shen$doextract$unvars, [kl.fns.tl(V1464)])])):(null));
                    });

kl.defun("shen.extract_free_vars", 2, function (V1476, V1477) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1477)) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V1477))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(V1477)))) && asJsBool(kl.fns.$eq(kl.fns.hd(V1477), new Sym("protect")))))?(null):(asJsBool(asKlBool(asJsBool(Kl.headCall(kl.fns.variable$qu, [V1477])) && asJsBool(Kl.headCall(kl.fns.not, [Kl.headCall(kl.fns.element$qu, [V1477, V1476])]))))?(kl.fns.cons(V1477, null)):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1477)) && asJsBool(kl.fns.$eq(new Sym("lambda"), kl.fns.hd(V1477))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V1477))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(V1477)))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.tl(V1477)))))))?(Kl.tailCall(kl.fns.shen$doextract$unfree$unvars, [kl.fns.cons(kl.fns.hd(kl.fns.tl(V1477)), V1476), kl.fns.hd(kl.fns.tl(kl.fns.tl(V1477)))])):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1477)) && asJsBool(kl.fns.$eq(new Sym("let"), kl.fns.hd(V1477))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V1477))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(V1477)))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(kl.fns.tl(V1477))))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.tl(V1477))))))))?(Kl.tailCall(kl.fns.union, [Kl.headCall(kl.fns.shen$doextract$unfree$unvars, [V1476, kl.fns.hd(kl.fns.tl(kl.fns.tl(V1477)))]), Kl.headCall(kl.fns.shen$doextract$unfree$unvars, [kl.fns.cons(kl.fns.hd(kl.fns.tl(V1477)), V1476), kl.fns.hd(kl.fns.tl(kl.fns.tl(kl.fns.tl(V1477))))])])):(asJsBool(kl.fns.cons$qu(V1477))?(Kl.tailCall(kl.fns.union, [Kl.headCall(kl.fns.shen$doextract$unfree$unvars, [V1476, kl.fns.hd(V1477)]), Kl.headCall(kl.fns.shen$doextract$unfree$unvars, [V1476, kl.fns.tl(V1477)])])):(null)))));
                    });

kl.defun("shen.free_variable_warnings", 2, function (V1482, V1483) {
                      return asJsBool(kl.fns.$eq(null, V1483))?(new Sym("_")):(kl.fns.simple_error(kl.fns.cn("error: the following variables are free in ", Kl.headCall(kl.fns.shen$doapp, [V1482, kl.fns.cn(": ", Kl.headCall(kl.fns.shen$doapp, [Kl.headCall(kl.fns.shen$dolist$unvariables, [V1483]), "", new Sym("shen.a")])), new Sym("shen.a")]))));
                    });

kl.defun("shen.list_variables", 1, function (V1485) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1485)) && asJsBool(kl.fns.$eq(null, kl.fns.tl(V1485)))))?(kl.fns.cn(kl.fns.str(kl.fns.hd(V1485)), ".")):(asJsBool(kl.fns.cons$qu(V1485))?(kl.fns.cn(kl.fns.str(kl.fns.hd(V1485)), kl.fns.cn(", ", Kl.headCall(kl.fns.shen$dolist$unvariables, [kl.fns.tl(V1485)])))):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.list_variables")])));
                    });

kl.defun("shen.strip-protect", 1, function (V1487) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1487)) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V1487))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(V1487)))) && asJsBool(kl.fns.$eq(kl.fns.hd(V1487), new Sym("protect")))))?(Kl.tailCall(kl.fns.shen$dostrip_protect, [kl.fns.hd(kl.fns.tl(V1487))])):(asJsBool(kl.fns.cons$qu(V1487))?(Kl.tailCall(kl.fns.map, [Kl.setArity("shen.strip-protect_lambda", 1, function (Z) {
                      return Kl.tailCall(kl.fns.shen$dostrip_protect, [Z]);
                    }), V1487])):(V1487));
                    });

kl.defun("shen.linearise", 1, function (V1489) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1489)) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V1489))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(V1489))))))?(Kl.tailCall(kl.fns.shen$dolinearise$unhelp, [Kl.headCall(kl.fns.shen$doflatten, [kl.fns.hd(V1489)]), kl.fns.hd(V1489), kl.fns.hd(kl.fns.tl(V1489))])):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.linearise")]));
                    });

kl.defun("shen.flatten", 1, function (V1491) {
                      return asJsBool(kl.fns.$eq(null, V1491))?(null):(asJsBool(kl.fns.cons$qu(V1491))?(Kl.tailCall(kl.fns.append, [Kl.headCall(kl.fns.shen$doflatten, [kl.fns.hd(V1491)]), Kl.headCall(kl.fns.shen$doflatten, [kl.fns.tl(V1491)])])):(kl.fns.cons(V1491, null)));
                    });

kl.defun("shen.linearise_help", 3, function (V1495, V1496, V1497) {
                      return asJsBool(kl.fns.$eq(null, V1495))?(kl.fns.cons(V1496, kl.fns.cons(V1497, null))):(asJsBool(kl.fns.cons$qu(V1495))?(asJsBool(asKlBool(asJsBool(Kl.headCall(kl.fns.variable$qu, [kl.fns.hd(V1495)])) && asJsBool(Kl.headCall(kl.fns.element$qu, [kl.fns.hd(V1495), kl.fns.tl(V1495)]))))?((function () {
                  const Var = Kl.headCall(kl.fns.gensym, [kl.fns.hd(V1495)]);
                    const NewAction = kl.fns.cons(new Sym("where"), kl.fns.cons(kl.fns.cons(new Sym("="), kl.fns.cons(kl.fns.hd(V1495), kl.fns.cons(Var, null))), kl.fns.cons(V1497, null)));
                    const NewPatts = Kl.headCall(kl.fns.shen$dolinearise$unX, [kl.fns.hd(V1495), Var, V1496]);
                    return Kl.tailCall(kl.fns.shen$dolinearise$unhelp, [kl.fns.tl(V1495), NewPatts, NewAction]);
                })()):(Kl.tailCall(kl.fns.shen$dolinearise$unhelp, [kl.fns.tl(V1495), V1496, V1497]))):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.linearise_help")])));
                    });

kl.defun("shen.linearise_X", 3, function (V1510, V1511, V1512) {
                      return asJsBool(kl.fns.$eq(V1512, V1510))?(V1511):(asJsBool(kl.fns.cons$qu(V1512))?((function () {
                  const L = Kl.headCall(kl.fns.shen$dolinearise$unX, [V1510, V1511, kl.fns.hd(V1512)]);
                    return asJsBool(kl.fns.$eq(L, kl.fns.hd(V1512)))?(kl.fns.cons(kl.fns.hd(V1512), Kl.headCall(kl.fns.shen$dolinearise$unX, [V1510, V1511, kl.fns.tl(V1512)]))):(kl.fns.cons(L, kl.fns.tl(V1512)));
                })()):(V1512));
                    });

kl.defun("shen.aritycheck", 2, function (V1515, V1516) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1516)) && asJsBool(kl.fns.cons$qu(kl.fns.hd(V1516))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.hd(V1516)))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.hd(V1516))))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(V1516)))))?((function () {
                      Kl.headCall(kl.fns.shen$doaritycheck_action, [kl.fns.hd(kl.fns.tl(kl.fns.hd(V1516)))]);
                      return Kl.tailCall(kl.fns.shen$doaritycheck_name, [V1515, Kl.headCall(kl.fns.arity, [V1515]), Kl.headCall(kl.fns.length, [kl.fns.hd(kl.fns.hd(V1516))])]);
                    })()):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1516)) && asJsBool(kl.fns.cons$qu(kl.fns.hd(V1516))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.hd(V1516)))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.hd(V1516))))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V1516))) && asJsBool(kl.fns.cons$qu(kl.fns.hd(kl.fns.tl(V1516)))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.hd(kl.fns.tl(V1516))))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.hd(kl.fns.tl(V1516))))))))?(asJsBool(kl.fns.$eq(Kl.headCall(kl.fns.length, [kl.fns.hd(kl.fns.hd(V1516))]), Kl.headCall(kl.fns.length, [kl.fns.hd(kl.fns.hd(kl.fns.tl(V1516)))])))?((function () {
                      Kl.headCall(kl.fns.shen$doaritycheck_action, [kl.fns.hd(kl.fns.tl(kl.fns.hd(V1516)))]);
                      return Kl.tailCall(kl.fns.shen$doaritycheck, [V1515, kl.fns.tl(V1516)]);
                    })()):(kl.fns.simple_error(kl.fns.cn("arity error in ", Kl.headCall(kl.fns.shen$doapp, [V1515, "\n", new Sym("shen.a")]))))):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.aritycheck")])));
                    });

kl.defun("shen.aritycheck-name", 3, function (V1529, V1530, V1531) {
                      return asJsBool(kl.fns.$eq(-1, V1530))?(V1531):(asJsBool(kl.fns.$eq(V1531, V1530))?(V1531):((function () {
                      Kl.headCall(kl.fns.shen$doprhush, [kl.fns.cn("\nwarning: changing the arity of ", Kl.headCall(kl.fns.shen$doapp, [V1529, " can cause errors.\n", new Sym("shen.a")])), Kl.headCall(kl.fns.stoutput, [])]);
                      return V1531;
                    })()));
                    });

kl.defun("shen.aritycheck-action", 1, function (V1537) {
                      return asJsBool(kl.fns.cons$qu(V1537))?((function () {
                      Kl.headCall(kl.fns.shen$doaah, [kl.fns.hd(V1537), kl.fns.tl(V1537)]);
                      return Kl.tailCall(kl.fns.shen$dofor_each, [Kl.setArity("shen.aritycheck-action_lambda", 1, function (Y) {
                      return Kl.tailCall(kl.fns.shen$doaritycheck_action, [Y]);
                    }), V1537]);
                    })()):(new Sym("shen.skip"));
                    });

kl.defun("shen.aah", 2, function (V1540, V1541) {
                      return (function () {
                  const Arity = Kl.headCall(kl.fns.arity, [V1540]);
                    const Len = Kl.headCall(kl.fns.length, [V1541]);
                    return asJsBool(asKlBool(asJsBool(kl.fns.$gt(Arity, -1)) && asJsBool(kl.fns.$gt(Len, Arity))))?(Kl.tailCall(kl.fns.shen$doprhush, [kl.fns.cn("warning: ", Kl.headCall(kl.fns.shen$doapp, [V1540, kl.fns.cn(" might not like ", Kl.headCall(kl.fns.shen$doapp, [Len, kl.fns.cn(" argument", Kl.headCall(kl.fns.shen$doapp, [asJsBool(kl.fns.$gt(Len, 1))?("s"):(""), ".\n", new Sym("shen.a")])), new Sym("shen.a")])), new Sym("shen.a")])), Kl.headCall(kl.fns.stoutput, [])])):(new Sym("shen.skip"));
                })();
                    });

kl.defun("shen.abstract_rule", 1, function (V1543) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1543)) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V1543))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(V1543))))))?(Kl.tailCall(kl.fns.shen$doabstraction$unbuild, [kl.fns.hd(V1543), kl.fns.hd(kl.fns.tl(V1543))])):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.abstract_rule")]));
                    });

kl.defun("shen.abstraction_build", 2, function (V1546, V1547) {
                      return asJsBool(kl.fns.$eq(null, V1546))?(V1547):(asJsBool(kl.fns.cons$qu(V1546))?(kl.fns.cons(new Sym("/."), kl.fns.cons(kl.fns.hd(V1546), kl.fns.cons(Kl.headCall(kl.fns.shen$doabstraction$unbuild, [kl.fns.tl(V1546), V1547]), null)))):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.abstraction_build")])));
                    });

kl.defun("shen.parameters", 1, function (V1549) {
                      return asJsBool(kl.fns.$eq(0, V1549))?(null):(kl.fns.cons(Kl.headCall(kl.fns.gensym, [new Sym("V")]), Kl.headCall(kl.fns.shen$doparameters, [kl.fns._(V1549, 1)])));
                    });

kl.defun("shen.application_build", 2, function (V1552, V1553) {
                      return asJsBool(kl.fns.$eq(null, V1552))?(V1553):(asJsBool(kl.fns.cons$qu(V1552))?(Kl.tailCall(kl.fns.shen$doapplication$unbuild, [kl.fns.tl(V1552), kl.fns.cons(V1553, kl.fns.cons(kl.fns.hd(V1552), null))])):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.application_build")])));
                    });

kl.defun("shen.compile_to_kl", 2, function (V1556, V1557) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1557)) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V1557))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(V1557))))))?((function () {
                  const Arity = Kl.headCall(kl.fns.shen$dostore_arity, [V1556, Kl.headCall(kl.fns.length, [kl.fns.hd(V1557)])]);
                    const Reduce = Kl.headCall(kl.fns.map, [Kl.setArity("shen.compile_to_kl_lambda", 1, function (X) {
                      return Kl.tailCall(kl.fns.shen$doreduce, [X]);
                    }), kl.fns.hd(kl.fns.tl(V1557))]);
                    const CondExpression = Kl.headCall(kl.fns.shen$docond_expression, [V1556, kl.fns.hd(V1557), Reduce]);
                    const TypeTable = asJsBool(kl.fns.value(new Sym("shen.*optimise*")))?(Kl.headCall(kl.fns.shen$dotypextable, [Kl.headCall(kl.fns.shen$doget_type, [V1556]), kl.fns.hd(V1557)])):(new Sym("shen.skip"));
                    const TypedCondExpression = asJsBool(kl.fns.value(new Sym("shen.*optimise*")))?(Kl.headCall(kl.fns.shen$doassign_types, [kl.fns.hd(V1557), TypeTable, CondExpression])):(CondExpression);
                    return kl.fns.cons(new Sym("defun"), kl.fns.cons(V1556, kl.fns.cons(kl.fns.hd(V1557), kl.fns.cons(TypedCondExpression, null))));
                })()):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.compile_to_kl")]));
                    });

kl.defun("shen.get-type", 1, function (V1563) {
                      return asJsBool(kl.fns.cons$qu(V1563))?(new Sym("shen.skip")):((function () {
                  const FType = Kl.headCall(kl.fns.assoc, [V1563, kl.fns.value(new Sym("shen.*signedfuncs*"))]);
                    return asJsBool(Kl.headCall(kl.fns.empty$qu, [FType]))?(new Sym("shen.skip")):(kl.fns.tl(FType));
                })());
                    });

kl.defun("shen.typextable", 2, function (V1574, V1575) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1574)) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V1574))) && asJsBool(kl.fns.$eq(new Sym("-->"), kl.fns.hd(kl.fns.tl(V1574)))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(V1574)))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.tl(V1574))))) && asJsBool(kl.fns.cons$qu(V1575))))?(asJsBool(Kl.headCall(kl.fns.variable$qu, [kl.fns.hd(V1574)]))?(Kl.tailCall(kl.fns.shen$dotypextable, [kl.fns.hd(kl.fns.tl(kl.fns.tl(V1574))), kl.fns.tl(V1575)])):(kl.fns.cons(kl.fns.cons(kl.fns.hd(V1575), kl.fns.hd(V1574)), Kl.headCall(kl.fns.shen$dotypextable, [kl.fns.hd(kl.fns.tl(kl.fns.tl(V1574))), kl.fns.tl(V1575)])))):(null);
                    });

kl.defun("shen.assign-types", 3, function (V1579, V1580, V1581) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1581)) && asJsBool(kl.fns.$eq(new Sym("let"), kl.fns.hd(V1581))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V1581))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(V1581)))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(kl.fns.tl(V1581))))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.tl(V1581))))))))?(kl.fns.cons(new Sym("let"), kl.fns.cons(kl.fns.hd(kl.fns.tl(V1581)), kl.fns.cons(Kl.headCall(kl.fns.shen$doassign_types, [V1579, V1580, kl.fns.hd(kl.fns.tl(kl.fns.tl(V1581)))]), kl.fns.cons(Kl.headCall(kl.fns.shen$doassign_types, [kl.fns.cons(kl.fns.hd(kl.fns.tl(V1581)), V1579), V1580, kl.fns.hd(kl.fns.tl(kl.fns.tl(kl.fns.tl(V1581))))]), null))))):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1581)) && asJsBool(kl.fns.$eq(new Sym("lambda"), kl.fns.hd(V1581))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V1581))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(V1581)))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.tl(V1581)))))))?(kl.fns.cons(new Sym("lambda"), kl.fns.cons(kl.fns.hd(kl.fns.tl(V1581)), kl.fns.cons(Kl.headCall(kl.fns.shen$doassign_types, [kl.fns.cons(kl.fns.hd(kl.fns.tl(V1581)), V1579), V1580, kl.fns.hd(kl.fns.tl(kl.fns.tl(V1581)))]), null)))):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1581)) && asJsBool(kl.fns.$eq(new Sym("cond"), kl.fns.hd(V1581)))))?(kl.fns.cons(new Sym("cond"), Kl.headCall(kl.fns.map, [Kl.setArity("shen.assign-types_lambda", 1, function (Y) {
                      return kl.fns.cons(Kl.headCall(kl.fns.shen$doassign_types, [V1579, V1580, kl.fns.hd(Y)]), kl.fns.cons(Kl.headCall(kl.fns.shen$doassign_types, [V1579, V1580, kl.fns.hd(kl.fns.tl(Y))]), null));
                    }), kl.fns.tl(V1581)]))):(asJsBool(kl.fns.cons$qu(V1581))?((function () {
                  const NewTable = Kl.headCall(kl.fns.shen$dotypextable, [Kl.headCall(kl.fns.shen$doget_type, [kl.fns.hd(V1581)]), kl.fns.tl(V1581)]);
                    return kl.fns.cons(kl.fns.hd(V1581), Kl.headCall(kl.fns.map, [Kl.setArity("shen.assign-types_lambda", 1, function (Y) {
                      return Kl.tailCall(kl.fns.shen$doassign_types, [V1579, Kl.headCall(kl.fns.append, [V1580, NewTable]), Y]);
                    }), kl.fns.tl(V1581)]));
                })()):((function () {
                  const AtomType = Kl.headCall(kl.fns.assoc, [V1581, V1580]);
                    return asJsBool(kl.fns.cons$qu(AtomType))?(kl.fns.cons(new Sym("type"), kl.fns.cons(V1581, kl.fns.cons(kl.fns.tl(AtomType), null)))):(asJsBool(Kl.headCall(kl.fns.element$qu, [V1581, V1579]))?(V1581):(Kl.tailCall(kl.fns.shen$doatom_type, [V1581])));
                })()))));
                    });

kl.defun("shen.atom-type", 1, function (V1583) {
                      return asJsBool(kl.fns.string$qu(V1583))?(kl.fns.cons(new Sym("type"), kl.fns.cons(V1583, kl.fns.cons(new Sym("string"), null)))):(asJsBool(kl.fns.number$qu(V1583))?(kl.fns.cons(new Sym("type"), kl.fns.cons(V1583, kl.fns.cons(new Sym("number"), null)))):(asJsBool(Kl.headCall(kl.fns.boolean$qu, [V1583]))?(kl.fns.cons(new Sym("type"), kl.fns.cons(V1583, kl.fns.cons(new Sym("boolean"), null)))):(asJsBool(Kl.headCall(kl.fns.symbol$qu, [V1583]))?(kl.fns.cons(new Sym("type"), kl.fns.cons(V1583, kl.fns.cons(new Sym("symbol"), null)))):(V1583))));
                    });

kl.defun("shen.store-arity", 2, function (V1588, V1589) {
                      return asJsBool(kl.fns.value(new Sym("shen.*installing-kl*")))?(new Sym("shen.skip")):(Kl.tailCall(kl.fns.put, [V1588, new Sym("arity"), V1589, kl.fns.value(new Sym("*property-vector*"))]));
                    });

kl.defun("shen.reduce", 1, function (V1591) {
                      return (function () {
                      kl.symbols.shen$do$stteststack$st = null;
                      return (function () {
                  const Result = Kl.headCall(kl.fns.shen$doreduce$unhelp, [V1591]);
                    return kl.fns.cons(kl.fns.cons(new Sym(":"), kl.fns.cons(new Sym("shen.tests"), Kl.headCall(kl.fns.reverse, [kl.fns.value(new Sym("shen.*teststack*"))]))), kl.fns.cons(Result, null));
                })();
                    })();
                    });

kl.defun("shen.reduce_help", 1, function (V1593) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1593)) && asJsBool(kl.fns.cons$qu(kl.fns.hd(V1593))) && asJsBool(kl.fns.$eq(new Sym("/."), kl.fns.hd(kl.fns.hd(V1593)))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.hd(V1593)))) && asJsBool(kl.fns.cons$qu(kl.fns.hd(kl.fns.tl(kl.fns.hd(V1593))))) && asJsBool(kl.fns.$eq(new Sym("cons"), kl.fns.hd(kl.fns.hd(kl.fns.tl(kl.fns.hd(V1593)))))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.hd(kl.fns.tl(kl.fns.hd(V1593)))))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(kl.fns.hd(kl.fns.tl(kl.fns.hd(V1593))))))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.hd(kl.fns.tl(kl.fns.hd(V1593)))))))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(kl.fns.hd(V1593))))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.hd(V1593)))))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V1593))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(V1593))))))?((function () {
                      Kl.headCall(kl.fns.shen$doadd$untest, [kl.fns.cons(new Sym("cons?"), kl.fns.tl(V1593))]);
                      return (function () {
                  const Abstraction = kl.fns.cons(new Sym("/."), kl.fns.cons(kl.fns.hd(kl.fns.tl(kl.fns.hd(kl.fns.tl(kl.fns.hd(V1593))))), kl.fns.cons(kl.fns.cons(new Sym("/."), kl.fns.cons(kl.fns.hd(kl.fns.tl(kl.fns.tl(kl.fns.hd(kl.fns.tl(kl.fns.hd(V1593)))))), kl.fns.cons(Kl.headCall(kl.fns.shen$doebr, [kl.fns.hd(kl.fns.tl(V1593)), kl.fns.hd(kl.fns.tl(kl.fns.hd(V1593))), kl.fns.hd(kl.fns.tl(kl.fns.tl(kl.fns.hd(V1593))))]), null))), null)));
                    const Application = kl.fns.cons(kl.fns.cons(Abstraction, kl.fns.cons(kl.fns.cons(new Sym("hd"), kl.fns.tl(V1593)), null)), kl.fns.cons(kl.fns.cons(new Sym("tl"), kl.fns.tl(V1593)), null));
                    return Kl.tailCall(kl.fns.shen$doreduce$unhelp, [Application]);
                })();
                    })()):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1593)) && asJsBool(kl.fns.cons$qu(kl.fns.hd(V1593))) && asJsBool(kl.fns.$eq(new Sym("/."), kl.fns.hd(kl.fns.hd(V1593)))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.hd(V1593)))) && asJsBool(kl.fns.cons$qu(kl.fns.hd(kl.fns.tl(kl.fns.hd(V1593))))) && asJsBool(kl.fns.$eq(new Sym("@p"), kl.fns.hd(kl.fns.hd(kl.fns.tl(kl.fns.hd(V1593)))))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.hd(kl.fns.tl(kl.fns.hd(V1593)))))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(kl.fns.hd(kl.fns.tl(kl.fns.hd(V1593))))))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.hd(kl.fns.tl(kl.fns.hd(V1593)))))))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(kl.fns.hd(V1593))))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.hd(V1593)))))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V1593))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(V1593))))))?((function () {
                      Kl.headCall(kl.fns.shen$doadd$untest, [kl.fns.cons(new Sym("tuple?"), kl.fns.tl(V1593))]);
                      return (function () {
                  const Abstraction = kl.fns.cons(new Sym("/."), kl.fns.cons(kl.fns.hd(kl.fns.tl(kl.fns.hd(kl.fns.tl(kl.fns.hd(V1593))))), kl.fns.cons(kl.fns.cons(new Sym("/."), kl.fns.cons(kl.fns.hd(kl.fns.tl(kl.fns.tl(kl.fns.hd(kl.fns.tl(kl.fns.hd(V1593)))))), kl.fns.cons(Kl.headCall(kl.fns.shen$doebr, [kl.fns.hd(kl.fns.tl(V1593)), kl.fns.hd(kl.fns.tl(kl.fns.hd(V1593))), kl.fns.hd(kl.fns.tl(kl.fns.tl(kl.fns.hd(V1593))))]), null))), null)));
                    const Application = kl.fns.cons(kl.fns.cons(Abstraction, kl.fns.cons(kl.fns.cons(new Sym("fst"), kl.fns.tl(V1593)), null)), kl.fns.cons(kl.fns.cons(new Sym("snd"), kl.fns.tl(V1593)), null));
                    return Kl.tailCall(kl.fns.shen$doreduce$unhelp, [Application]);
                })();
                    })()):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1593)) && asJsBool(kl.fns.cons$qu(kl.fns.hd(V1593))) && asJsBool(kl.fns.$eq(new Sym("/."), kl.fns.hd(kl.fns.hd(V1593)))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.hd(V1593)))) && asJsBool(kl.fns.cons$qu(kl.fns.hd(kl.fns.tl(kl.fns.hd(V1593))))) && asJsBool(kl.fns.$eq(new Sym("@v"), kl.fns.hd(kl.fns.hd(kl.fns.tl(kl.fns.hd(V1593)))))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.hd(kl.fns.tl(kl.fns.hd(V1593)))))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(kl.fns.hd(kl.fns.tl(kl.fns.hd(V1593))))))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.hd(kl.fns.tl(kl.fns.hd(V1593)))))))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(kl.fns.hd(V1593))))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.hd(V1593)))))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V1593))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(V1593))))))?((function () {
                      Kl.headCall(kl.fns.shen$doadd$untest, [kl.fns.cons(new Sym("shen.+vector?"), kl.fns.tl(V1593))]);
                      return (function () {
                  const Abstraction = kl.fns.cons(new Sym("/."), kl.fns.cons(kl.fns.hd(kl.fns.tl(kl.fns.hd(kl.fns.tl(kl.fns.hd(V1593))))), kl.fns.cons(kl.fns.cons(new Sym("/."), kl.fns.cons(kl.fns.hd(kl.fns.tl(kl.fns.tl(kl.fns.hd(kl.fns.tl(kl.fns.hd(V1593)))))), kl.fns.cons(Kl.headCall(kl.fns.shen$doebr, [kl.fns.hd(kl.fns.tl(V1593)), kl.fns.hd(kl.fns.tl(kl.fns.hd(V1593))), kl.fns.hd(kl.fns.tl(kl.fns.tl(kl.fns.hd(V1593))))]), null))), null)));
                    const Application = kl.fns.cons(kl.fns.cons(Abstraction, kl.fns.cons(kl.fns.cons(new Sym("hdv"), kl.fns.tl(V1593)), null)), kl.fns.cons(kl.fns.cons(new Sym("tlv"), kl.fns.tl(V1593)), null));
                    return Kl.tailCall(kl.fns.shen$doreduce$unhelp, [Application]);
                })();
                    })()):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1593)) && asJsBool(kl.fns.cons$qu(kl.fns.hd(V1593))) && asJsBool(kl.fns.$eq(new Sym("/."), kl.fns.hd(kl.fns.hd(V1593)))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.hd(V1593)))) && asJsBool(kl.fns.cons$qu(kl.fns.hd(kl.fns.tl(kl.fns.hd(V1593))))) && asJsBool(kl.fns.$eq(new Sym("@s"), kl.fns.hd(kl.fns.hd(kl.fns.tl(kl.fns.hd(V1593)))))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.hd(kl.fns.tl(kl.fns.hd(V1593)))))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(kl.fns.hd(kl.fns.tl(kl.fns.hd(V1593))))))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.hd(kl.fns.tl(kl.fns.hd(V1593)))))))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(kl.fns.hd(V1593))))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.hd(V1593)))))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V1593))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(V1593))))))?((function () {
                      Kl.headCall(kl.fns.shen$doadd$untest, [kl.fns.cons(new Sym("shen.+string?"), kl.fns.tl(V1593))]);
                      return (function () {
                  const Abstraction = kl.fns.cons(new Sym("/."), kl.fns.cons(kl.fns.hd(kl.fns.tl(kl.fns.hd(kl.fns.tl(kl.fns.hd(V1593))))), kl.fns.cons(kl.fns.cons(new Sym("/."), kl.fns.cons(kl.fns.hd(kl.fns.tl(kl.fns.tl(kl.fns.hd(kl.fns.tl(kl.fns.hd(V1593)))))), kl.fns.cons(Kl.headCall(kl.fns.shen$doebr, [kl.fns.hd(kl.fns.tl(V1593)), kl.fns.hd(kl.fns.tl(kl.fns.hd(V1593))), kl.fns.hd(kl.fns.tl(kl.fns.tl(kl.fns.hd(V1593))))]), null))), null)));
                    const Application = kl.fns.cons(kl.fns.cons(Abstraction, kl.fns.cons(kl.fns.cons(new Sym("pos"), kl.fns.cons(kl.fns.hd(kl.fns.tl(V1593)), kl.fns.cons(0, null))), null)), kl.fns.cons(kl.fns.cons(new Sym("tlstr"), kl.fns.tl(V1593)), null));
                    return Kl.tailCall(kl.fns.shen$doreduce$unhelp, [Application]);
                })();
                    })()):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1593)) && asJsBool(kl.fns.cons$qu(kl.fns.hd(V1593))) && asJsBool(kl.fns.$eq(new Sym("/."), kl.fns.hd(kl.fns.hd(V1593)))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.hd(V1593)))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(kl.fns.hd(V1593))))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.hd(V1593)))))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V1593))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(V1593)))) && asJsBool(Kl.headCall(kl.fns.not, [Kl.headCall(kl.fns.variable$qu, [kl.fns.hd(kl.fns.tl(kl.fns.hd(V1593)))])]))))?((function () {
                      Kl.headCall(kl.fns.shen$doadd$untest, [kl.fns.cons(new Sym("="), kl.fns.cons(kl.fns.hd(kl.fns.tl(kl.fns.hd(V1593))), kl.fns.tl(V1593)))]);
                      return Kl.tailCall(kl.fns.shen$doreduce$unhelp, [kl.fns.hd(kl.fns.tl(kl.fns.tl(kl.fns.hd(V1593))))]);
                    })()):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1593)) && asJsBool(kl.fns.cons$qu(kl.fns.hd(V1593))) && asJsBool(kl.fns.$eq(new Sym("/."), kl.fns.hd(kl.fns.hd(V1593)))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.hd(V1593)))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(kl.fns.hd(V1593))))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.hd(V1593)))))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V1593))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(V1593))))))?(Kl.tailCall(kl.fns.shen$doreduce$unhelp, [Kl.headCall(kl.fns.shen$doebr, [kl.fns.hd(kl.fns.tl(V1593)), kl.fns.hd(kl.fns.tl(kl.fns.hd(V1593))), kl.fns.hd(kl.fns.tl(kl.fns.tl(kl.fns.hd(V1593))))])])):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1593)) && asJsBool(kl.fns.$eq(new Sym("where"), kl.fns.hd(V1593))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V1593))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(V1593)))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.tl(V1593)))))))?((function () {
                      Kl.headCall(kl.fns.shen$doadd$untest, [kl.fns.hd(kl.fns.tl(V1593))]);
                      return Kl.tailCall(kl.fns.shen$doreduce$unhelp, [kl.fns.hd(kl.fns.tl(kl.fns.tl(V1593)))]);
                    })()):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1593)) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V1593))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(V1593))))))?((function () {
                  const Z = Kl.headCall(kl.fns.shen$doreduce$unhelp, [kl.fns.hd(V1593)]);
                    return asJsBool(kl.fns.$eq(kl.fns.hd(V1593), Z))?(V1593):(Kl.tailCall(kl.fns.shen$doreduce$unhelp, [kl.fns.cons(Z, kl.fns.tl(V1593))]));
                })()):(V1593))))))));
                    });

kl.defun("shen.+string?", 1, function (V1595) {
                      return asJsBool(kl.fns.$eq("", V1595))?(klFalse):(kl.fns.string$qu(V1595));
                    });

kl.defun("shen.+vector?", 1, function (V1597) {
                      return asKlBool(asJsBool(kl.fns.absvector$qu(V1597)) && asJsBool(kl.fns.$gt(kl.fns.$lt_address(V1597, 0), 0)));
                    });

kl.defun("shen.ebr", 3, function (V1611, V1612, V1613) {
                      return asJsBool(kl.fns.$eq(V1613, V1612))?(V1611):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1613)) && asJsBool(kl.fns.$eq(new Sym("/."), kl.fns.hd(V1613))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V1613))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(V1613)))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.tl(V1613))))) && asJsBool(kl.fns.$gt(Kl.headCall(kl.fns.occurrences, [V1612, kl.fns.hd(kl.fns.tl(V1613))]), 0))))?(V1613):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1613)) && asJsBool(kl.fns.$eq(new Sym("lambda"), kl.fns.hd(V1613))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V1613))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(V1613)))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.tl(V1613))))) && asJsBool(kl.fns.$gt(Kl.headCall(kl.fns.occurrences, [V1612, kl.fns.hd(kl.fns.tl(V1613))]), 0))))?(V1613):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1613)) && asJsBool(kl.fns.$eq(new Sym("let"), kl.fns.hd(V1613))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V1613))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(V1613)))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(kl.fns.tl(V1613))))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.tl(V1613)))))) && asJsBool(kl.fns.$eq(kl.fns.hd(kl.fns.tl(V1613)), V1612))))?(kl.fns.cons(new Sym("let"), kl.fns.cons(kl.fns.hd(kl.fns.tl(V1613)), kl.fns.cons(Kl.headCall(kl.fns.shen$doebr, [V1611, kl.fns.hd(kl.fns.tl(V1613)), kl.fns.hd(kl.fns.tl(kl.fns.tl(V1613)))]), kl.fns.tl(kl.fns.tl(kl.fns.tl(V1613))))))):(asJsBool(kl.fns.cons$qu(V1613))?(kl.fns.cons(Kl.headCall(kl.fns.shen$doebr, [V1611, V1612, kl.fns.hd(V1613)]), Kl.headCall(kl.fns.shen$doebr, [V1611, V1612, kl.fns.tl(V1613)]))):(V1613)))));
                    });

kl.defun("shen.add_test", 1, function (V1615) {
                      return kl.symbols.shen$do$stteststack$st = kl.fns.cons(V1615, kl.fns.value(new Sym("shen.*teststack*")));
                    });

kl.defun("shen.cond-expression", 3, function (V1619, V1620, V1621) {
                      return (function () {
                  const Err = Kl.headCall(kl.fns.shen$doerr_condition, [V1619]);
                    const Cases = Kl.headCall(kl.fns.shen$docase_form, [V1621, Err]);
                    const EncodeChoices = Kl.headCall(kl.fns.shen$doencode_choices, [Cases, V1619]);
                    return Kl.tailCall(kl.fns.shen$docond_form, [EncodeChoices]);
                })();
                    });

kl.defun("shen.cond-form", 1, function (V1625) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1625)) && asJsBool(kl.fns.cons$qu(kl.fns.hd(V1625))) && asJsBool(kl.fns.$eq(klTrue, kl.fns.hd(kl.fns.hd(V1625)))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.hd(V1625)))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.hd(V1625)))))))?(kl.fns.hd(kl.fns.tl(kl.fns.hd(V1625)))):(kl.fns.cons(new Sym("cond"), V1625));
                    });

kl.defun("shen.encode-choices", 2, function (V1630, V1631) {
                      return asJsBool(kl.fns.$eq(null, V1630))?(null):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1630)) && asJsBool(kl.fns.cons$qu(kl.fns.hd(V1630))) && asJsBool(kl.fns.$eq(klTrue, kl.fns.hd(kl.fns.hd(V1630)))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.hd(V1630)))) && asJsBool(kl.fns.cons$qu(kl.fns.hd(kl.fns.tl(kl.fns.hd(V1630))))) && asJsBool(kl.fns.$eq(new Sym("shen.choicepoint!"), kl.fns.hd(kl.fns.hd(kl.fns.tl(kl.fns.hd(V1630)))))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.hd(kl.fns.tl(kl.fns.hd(V1630)))))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.hd(kl.fns.tl(kl.fns.hd(V1630))))))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.hd(V1630))))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(V1630)))))?(kl.fns.cons(kl.fns.cons(klTrue, kl.fns.cons(kl.fns.cons(new Sym("let"), kl.fns.cons(new Sym("Result"), kl.fns.cons(kl.fns.hd(kl.fns.tl(kl.fns.hd(kl.fns.tl(kl.fns.hd(V1630))))), kl.fns.cons(kl.fns.cons(new Sym("if"), kl.fns.cons(kl.fns.cons(new Sym("="), kl.fns.cons(new Sym("Result"), kl.fns.cons(kl.fns.cons(new Sym("fail"), null), null))), kl.fns.cons(asJsBool(kl.fns.value(new Sym("shen.*installing-kl*")))?(kl.fns.cons(new Sym("shen.sys-error"), kl.fns.cons(V1631, null))):(kl.fns.cons(new Sym("shen.f_error"), kl.fns.cons(V1631, null))), kl.fns.cons(new Sym("Result"), null)))), null)))), null)), null)):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1630)) && asJsBool(kl.fns.cons$qu(kl.fns.hd(V1630))) && asJsBool(kl.fns.$eq(klTrue, kl.fns.hd(kl.fns.hd(V1630)))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.hd(V1630)))) && asJsBool(kl.fns.cons$qu(kl.fns.hd(kl.fns.tl(kl.fns.hd(V1630))))) && asJsBool(kl.fns.$eq(new Sym("shen.choicepoint!"), kl.fns.hd(kl.fns.hd(kl.fns.tl(kl.fns.hd(V1630)))))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.hd(kl.fns.tl(kl.fns.hd(V1630)))))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.hd(kl.fns.tl(kl.fns.hd(V1630))))))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.hd(V1630)))))))?(kl.fns.cons(kl.fns.cons(klTrue, kl.fns.cons(kl.fns.cons(new Sym("let"), kl.fns.cons(new Sym("Result"), kl.fns.cons(kl.fns.hd(kl.fns.tl(kl.fns.hd(kl.fns.tl(kl.fns.hd(V1630))))), kl.fns.cons(kl.fns.cons(new Sym("if"), kl.fns.cons(kl.fns.cons(new Sym("="), kl.fns.cons(new Sym("Result"), kl.fns.cons(kl.fns.cons(new Sym("fail"), null), null))), kl.fns.cons(Kl.headCall(kl.fns.shen$docond_form, [Kl.headCall(kl.fns.shen$doencode_choices, [kl.fns.tl(V1630), V1631])]), kl.fns.cons(new Sym("Result"), null)))), null)))), null)), null)):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1630)) && asJsBool(kl.fns.cons$qu(kl.fns.hd(V1630))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.hd(V1630)))) && asJsBool(kl.fns.cons$qu(kl.fns.hd(kl.fns.tl(kl.fns.hd(V1630))))) && asJsBool(kl.fns.$eq(new Sym("shen.choicepoint!"), kl.fns.hd(kl.fns.hd(kl.fns.tl(kl.fns.hd(V1630)))))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.hd(kl.fns.tl(kl.fns.hd(V1630)))))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.hd(kl.fns.tl(kl.fns.hd(V1630))))))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.hd(V1630)))))))?(kl.fns.cons(kl.fns.cons(klTrue, kl.fns.cons(kl.fns.cons(new Sym("let"), kl.fns.cons(new Sym("Freeze"), kl.fns.cons(kl.fns.cons(new Sym("freeze"), kl.fns.cons(Kl.headCall(kl.fns.shen$docond_form, [Kl.headCall(kl.fns.shen$doencode_choices, [kl.fns.tl(V1630), V1631])]), null)), kl.fns.cons(kl.fns.cons(new Sym("if"), kl.fns.cons(kl.fns.hd(kl.fns.hd(V1630)), kl.fns.cons(kl.fns.cons(new Sym("let"), kl.fns.cons(new Sym("Result"), kl.fns.cons(kl.fns.hd(kl.fns.tl(kl.fns.hd(kl.fns.tl(kl.fns.hd(V1630))))), kl.fns.cons(kl.fns.cons(new Sym("if"), kl.fns.cons(kl.fns.cons(new Sym("="), kl.fns.cons(new Sym("Result"), kl.fns.cons(kl.fns.cons(new Sym("fail"), null), null))), kl.fns.cons(kl.fns.cons(new Sym("thaw"), kl.fns.cons(new Sym("Freeze"), null)), kl.fns.cons(new Sym("Result"), null)))), null)))), kl.fns.cons(kl.fns.cons(new Sym("thaw"), kl.fns.cons(new Sym("Freeze"), null)), null)))), null)))), null)), null)):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1630)) && asJsBool(kl.fns.cons$qu(kl.fns.hd(V1630))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.hd(V1630)))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.hd(V1630)))))))?(kl.fns.cons(kl.fns.hd(V1630), Kl.headCall(kl.fns.shen$doencode_choices, [kl.fns.tl(V1630), V1631]))):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.encode-choices")]))))));
                    });

kl.defun("shen.case-form", 2, function (V1638, V1639) {
                      return asJsBool(kl.fns.$eq(null, V1638))?(kl.fns.cons(V1639, null)):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1638)) && asJsBool(kl.fns.cons$qu(kl.fns.hd(V1638))) && asJsBool(kl.fns.cons$qu(kl.fns.hd(kl.fns.hd(V1638)))) && asJsBool(kl.fns.$eq(new Sym(":"), kl.fns.hd(kl.fns.hd(kl.fns.hd(V1638))))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.hd(kl.fns.hd(V1638))))) && asJsBool(kl.fns.$eq(new Sym("shen.tests"), kl.fns.hd(kl.fns.tl(kl.fns.hd(kl.fns.hd(V1638)))))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.hd(kl.fns.hd(V1638)))))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.hd(V1638)))) && asJsBool(kl.fns.cons$qu(kl.fns.hd(kl.fns.tl(kl.fns.hd(V1638))))) && asJsBool(kl.fns.$eq(new Sym("shen.choicepoint!"), kl.fns.hd(kl.fns.hd(kl.fns.tl(kl.fns.hd(V1638)))))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.hd(kl.fns.tl(kl.fns.hd(V1638)))))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.hd(kl.fns.tl(kl.fns.hd(V1638))))))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.hd(V1638)))))))?(kl.fns.cons(kl.fns.cons(klTrue, kl.fns.tl(kl.fns.hd(V1638))), Kl.headCall(kl.fns.shen$docase_form, [kl.fns.tl(V1638), V1639]))):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1638)) && asJsBool(kl.fns.cons$qu(kl.fns.hd(V1638))) && asJsBool(kl.fns.cons$qu(kl.fns.hd(kl.fns.hd(V1638)))) && asJsBool(kl.fns.$eq(new Sym(":"), kl.fns.hd(kl.fns.hd(kl.fns.hd(V1638))))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.hd(kl.fns.hd(V1638))))) && asJsBool(kl.fns.$eq(new Sym("shen.tests"), kl.fns.hd(kl.fns.tl(kl.fns.hd(kl.fns.hd(V1638)))))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.hd(kl.fns.hd(V1638)))))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.hd(V1638)))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.hd(V1638)))))))?(kl.fns.cons(kl.fns.cons(klTrue, kl.fns.tl(kl.fns.hd(V1638))), null)):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1638)) && asJsBool(kl.fns.cons$qu(kl.fns.hd(V1638))) && asJsBool(kl.fns.cons$qu(kl.fns.hd(kl.fns.hd(V1638)))) && asJsBool(kl.fns.$eq(new Sym(":"), kl.fns.hd(kl.fns.hd(kl.fns.hd(V1638))))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.hd(kl.fns.hd(V1638))))) && asJsBool(kl.fns.$eq(new Sym("shen.tests"), kl.fns.hd(kl.fns.tl(kl.fns.hd(kl.fns.hd(V1638)))))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.hd(V1638)))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.hd(V1638)))))))?(kl.fns.cons(kl.fns.cons(Kl.headCall(kl.fns.shen$doembed_and, [kl.fns.tl(kl.fns.tl(kl.fns.hd(kl.fns.hd(V1638))))]), kl.fns.tl(kl.fns.hd(V1638))), Kl.headCall(kl.fns.shen$docase_form, [kl.fns.tl(V1638), V1639]))):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.case-form")])))));
                    });

kl.defun("shen.embed-and", 1, function (V1641) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1641)) && asJsBool(kl.fns.$eq(null, kl.fns.tl(V1641)))))?(kl.fns.hd(V1641)):(asJsBool(kl.fns.cons$qu(V1641))?(kl.fns.cons(new Sym("and"), kl.fns.cons(kl.fns.hd(V1641), kl.fns.cons(Kl.headCall(kl.fns.shen$doembed_and, [kl.fns.tl(V1641)]), null)))):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.embed-and")])));
                    });

kl.defun("shen.err-condition", 1, function (V1643) {
                      return kl.fns.cons(klTrue, kl.fns.cons(kl.fns.cons(new Sym("shen.f_error"), kl.fns.cons(V1643, null)), null));
                    });

kl.defun("shen.sys-error", 1, function (V1645) {
                      return kl.fns.simple_error(kl.fns.cn("system function ", Kl.headCall(kl.fns.shen$doapp, [V1645, ": unexpected argument\n", new Sym("shen.a")])));
                    });

kl.defun("thaw", 1, function (V2827) {
                      return Kl.tailCall(V2827, []);
                    });

kl.defun("eval", 1, function (V2829) {
                      return (function () {
                  const Macroexpand = Kl.headCall(kl.fns.shen$dowalk, [Kl.setArity("eval_lambda", 1, function (Y) {
                      return Kl.tailCall(kl.fns.macroexpand, [Y]);
                    }), V2829]);
                    return asJsBool(Kl.headCall(kl.fns.shen$dopackaged$qu, [Macroexpand]))?(Kl.tailCall(kl.fns.map, [Kl.setArity("eval_lambda", 1, function (Z) {
                      return Kl.tailCall(kl.fns.shen$doeval_without_macros, [Z]);
                    }), Kl.headCall(kl.fns.shen$dopackage_contents, [Macroexpand])])):(Kl.tailCall(kl.fns.shen$doeval_without_macros, [Macroexpand]));
                })();
                    });

kl.defun("shen.eval-without-macros", 1, function (V2831) {
                      return kl.fns.eval_kl(Kl.headCall(kl.fns.shen$doelim_def, [Kl.headCall(kl.fns.shen$doproc_input$pl, [V2831])]));
                    });

kl.defun("shen.proc-input+", 1, function (V2833) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V2833)) && asJsBool(kl.fns.$eq(new Sym("input+"), kl.fns.hd(V2833))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V2833))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(V2833)))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.tl(V2833)))))))?(kl.fns.cons(new Sym("input+"), kl.fns.cons(Kl.headCall(kl.fns.shen$dorcons$unform, [kl.fns.hd(kl.fns.tl(V2833))]), kl.fns.tl(kl.fns.tl(V2833))))):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V2833)) && asJsBool(kl.fns.$eq(new Sym("shen.read+"), kl.fns.hd(V2833))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V2833))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(V2833)))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.tl(V2833)))))))?(kl.fns.cons(new Sym("shen.read+"), kl.fns.cons(Kl.headCall(kl.fns.shen$dorcons$unform, [kl.fns.hd(kl.fns.tl(V2833))]), kl.fns.tl(kl.fns.tl(V2833))))):(asJsBool(kl.fns.cons$qu(V2833))?(Kl.tailCall(kl.fns.map, [Kl.setArity("shen.proc-input+_lambda", 1, function (Z) {
                      return Kl.tailCall(kl.fns.shen$doproc_input$pl, [Z]);
                    }), V2833])):(V2833)));
                    });

kl.defun("shen.elim-def", 1, function (V2835) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V2835)) && asJsBool(kl.fns.$eq(new Sym("define"), kl.fns.hd(V2835))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V2835)))))?(Kl.tailCall(kl.fns.shen$doshen_$gtkl, [kl.fns.hd(kl.fns.tl(V2835)), kl.fns.tl(kl.fns.tl(V2835))])):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V2835)) && asJsBool(kl.fns.$eq(new Sym("defmacro"), kl.fns.hd(V2835))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V2835)))))?((function () {
                  const Default = kl.fns.cons(new Sym("X"), kl.fns.cons(new Sym("->"), kl.fns.cons(new Sym("X"), null)));
                    const Def = Kl.headCall(kl.fns.shen$doelim_def, [kl.fns.cons(new Sym("define"), kl.fns.cons(kl.fns.hd(kl.fns.tl(V2835)), Kl.headCall(kl.fns.append, [kl.fns.tl(kl.fns.tl(V2835)), Default])))]);
                    const MacroAdd = Kl.headCall(kl.fns.shen$doadd_macro, [kl.fns.hd(kl.fns.tl(V2835))]);
                    return Def;
                })()):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V2835)) && asJsBool(kl.fns.$eq(new Sym("defcc"), kl.fns.hd(V2835))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V2835)))))?(Kl.tailCall(kl.fns.shen$doelim_def, [Kl.headCall(kl.fns.shen$doyacc, [V2835])])):(asJsBool(kl.fns.cons$qu(V2835))?(Kl.tailCall(kl.fns.map, [Kl.setArity("shen.elim-def_lambda", 1, function (Z) {
                      return Kl.tailCall(kl.fns.shen$doelim_def, [Z]);
                    }), V2835])):(V2835))));
                    });

kl.defun("shen.add-macro", 1, function (V2837) {
                      return (function () {
                  const MacroReg = kl.fns.value(new Sym("shen.*macroreg*"));
                    const NewMacroReg = kl.symbols.shen$do$stmacroreg$st = Kl.headCall(kl.fns.adjoin, [V2837, kl.fns.value(new Sym("shen.*macroreg*"))]);
                    return asJsBool(kl.fns.$eq(MacroReg, NewMacroReg))?(new Sym("shen.skip")):(kl.symbols.$stmacros$st = kl.fns.cons(Kl.headCall(kl.fns.function, [V2837]), kl.fns.value(new Sym("*macros*"))));
                })();
                    });

kl.defun("shen.packaged?", 1, function (V2845) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V2845)) && asJsBool(kl.fns.$eq(new Sym("package"), kl.fns.hd(V2845))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V2845))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(V2845))))))?(klTrue):(klFalse);
                    });

kl.defun("external", 1, function (V2847) {
                      return (function () {
                          try {
                            return Kl.headCall(kl.fns.get, [V2847, new Sym("shen.external-symbols"), kl.fns.value(new Sym("*property-vector*"))]);
                          } catch (E) {
                            return kl.fns.simple_error(kl.fns.cn("package ", Kl.headCall(kl.fns.shen$doapp, [V2847, " has not been used.\n", new Sym("shen.a")])));
                          }
                        })();
                    });

kl.defun("internal", 1, function (V2849) {
                      return (function () {
                          try {
                            return Kl.headCall(kl.fns.get, [V2849, new Sym("shen.internal-symbols"), kl.fns.value(new Sym("*property-vector*"))]);
                          } catch (E) {
                            return kl.fns.simple_error(kl.fns.cn("package ", Kl.headCall(kl.fns.shen$doapp, [V2849, " has not been used.\n", new Sym("shen.a")])));
                          }
                        })();
                    });

kl.defun("shen.package-contents", 1, function (V2853) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V2853)) && asJsBool(kl.fns.$eq(new Sym("package"), kl.fns.hd(V2853))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V2853))) && asJsBool(kl.fns.$eq(new Sym("null"), kl.fns.hd(kl.fns.tl(V2853)))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(V2853))))))?(kl.fns.tl(kl.fns.tl(kl.fns.tl(V2853)))):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V2853)) && asJsBool(kl.fns.$eq(new Sym("package"), kl.fns.hd(V2853))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V2853))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(V2853))))))?((function () {
                  const PackageNameDot = kl.fns.intern(kl.fns.cn(kl.fns.str(kl.fns.hd(kl.fns.tl(V2853))), "."));
                    const ExpPackageNameDot = Kl.headCall(kl.fns.explode, [PackageNameDot]);
                    return Kl.tailCall(kl.fns.shen$dopackageh, [kl.fns.hd(kl.fns.tl(V2853)), kl.fns.hd(kl.fns.tl(kl.fns.tl(V2853))), kl.fns.tl(kl.fns.tl(kl.fns.tl(V2853))), ExpPackageNameDot]);
                })()):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.package-contents")])));
                    });

kl.defun("shen.walk", 2, function (V2856, V2857) {
                      return asJsBool(kl.fns.cons$qu(V2857))?(Kl.tailCall(V2856, [Kl.headCall(kl.fns.map, [Kl.setArity("shen.walk_lambda", 1, function (Z) {
                      return Kl.tailCall(kl.fns.shen$dowalk, [V2856, Z]);
                    }), V2857])])):(Kl.tailCall(V2856, [V2857]));
                    });

kl.defun("compile", 3, function (V2861, V2862, V2863) {
                      return (function () {
                  const O = Kl.headCall(V2861, [kl.fns.cons(V2862, kl.fns.cons(null, null))]);
                    return asJsBool(asKlBool(asJsBool(kl.fns.$eq(Kl.headCall(kl.fns.fail, []), O)) || asJsBool(Kl.headCall(kl.fns.not, [Kl.headCall(kl.fns.empty$qu, [kl.fns.hd(O)])]))))?(Kl.tailCall(V2863, [O])):(Kl.tailCall(kl.fns.shen$dohdtl, [O]));
                })();
                    });

kl.defun("fail-if", 2, function (V2866, V2867) {
                      return asJsBool(Kl.headCall(V2866, [V2867]))?(Kl.tailCall(kl.fns.fail, [])):(V2867);
                    });

kl.defun("@s", 2, function (V2870, V2871) {
                      return kl.fns.cn(V2870, V2871);
                    });

kl.defun("tc?", 0, function () {
                      return kl.fns.value(new Sym("shen.*tc*"));
                    });

kl.defun("ps", 1, function (V2873) {
                      return (function () {
                          try {
                            return Kl.headCall(kl.fns.get, [V2873, new Sym("shen.source"), kl.fns.value(new Sym("*property-vector*"))]);
                          } catch (E) {
                            return kl.fns.simple_error(Kl.headCall(kl.fns.shen$doapp, [V2873, " not found.\n", new Sym("shen.a")]));
                          }
                        })();
                    });

kl.defun("stinput", 0, function () {
                      return kl.symbols.$ststinput$st;
                    });

kl.defun("vector", 1, function (V2875) {
                      return (function () {
                  const Vector = kl.fns.absvector(kl.fns.$pl(V2875, 1));
                    const ZeroStamp = kl.fns.address_$gt(Vector, 0, V2875);
                    const Standard = asJsBool(kl.fns.$eq(V2875, 0))?(ZeroStamp):(Kl.headCall(kl.fns.shen$dofillvector, [ZeroStamp, 1, V2875, Kl.headCall(kl.fns.fail, [])]));
                    return Standard;
                })();
                    });

kl.defun("shen.fillvector", 4, function (V2881, V2882, V2883, V2884) {
                      return asJsBool(kl.fns.$eq(V2883, V2882))?(kl.fns.address_$gt(V2881, V2883, V2884)):(Kl.tailCall(kl.fns.shen$dofillvector, [kl.fns.address_$gt(V2881, V2882, V2884), kl.fns.$pl(1, V2882), V2883, V2884]));
                    });

kl.defun("vector?", 1, function (V2886) {
                      return asKlBool(asJsBool(kl.fns.absvector$qu(V2886)) && asJsBool((function () {
                  const X = (function () {
                          try {
                            return kl.fns.$lt_address(V2886, 0);
                          } catch (E) {
                            return -1;
                          }
                        })();
                    return asKlBool(asJsBool(kl.fns.number$qu(X)) && asJsBool(kl.fns.$gt$eq(X, 0)));
                })()));
                    });

kl.defun("vector->", 3, function (V2890, V2891, V2892) {
                      return asJsBool(kl.fns.$eq(V2891, 0))?(kl.fns.simple_error("cannot access 0th element of a vector\n")):(kl.fns.address_$gt(V2890, V2891, V2892));
                    });

kl.defun("<-vector", 2, function (V2895, V2896) {
                      return asJsBool(kl.fns.$eq(V2896, 0))?(kl.fns.simple_error("cannot access 0th element of a vector\n")):((function () {
                  const VectorElement = kl.fns.$lt_address(V2895, V2896);
                    return asJsBool(kl.fns.$eq(VectorElement, Kl.headCall(kl.fns.fail, [])))?(kl.fns.simple_error("vector element not found\n")):(VectorElement);
                })());
                    });

kl.defun("shen.posint?", 1, function (V2898) {
                      return asKlBool(asJsBool(Kl.headCall(kl.fns.integer$qu, [V2898])) && asJsBool(kl.fns.$gt$eq(V2898, 0)));
                    });

kl.defun("limit", 1, function (V2900) {
                      return kl.fns.$lt_address(V2900, 0);
                    });

kl.defun("symbol?", 1, function (V2902) {
                      return asJsBool(asKlBool(asJsBool(Kl.headCall(kl.fns.boolean$qu, [V2902])) || asJsBool(kl.fns.number$qu(V2902)) || asJsBool(kl.fns.string$qu(V2902))))?(klFalse):((function () {
                          try {
                            return (function () {
                  const String = kl.fns.str(V2902);
                    return Kl.headCall(kl.fns.shen$doanalyse_symbol$qu, [String]);
                })();
                          } catch (E) {
                            return klFalse;
                          }
                        })());
                    });

kl.defun("shen.analyse-symbol?", 1, function (V2904) {
                      return asJsBool(kl.fns.$eq("", V2904))?(klFalse):(asJsBool(Kl.headCall(kl.fns.shen$do$plstring$qu, [V2904]))?(asKlBool(asJsBool(Kl.headCall(kl.fns.shen$doalpha$qu, [kl.fns.pos(V2904, 0)])) && asJsBool(Kl.headCall(kl.fns.shen$doalphanums$qu, [kl.fns.tlstr(V2904)])))):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.analyse-symbol?")])));
                    });

kl.defun("shen.alpha?", 1, function (V2906) {
                      return Kl.tailCall(kl.fns.element$qu, [V2906, kl.fns.cons("A", kl.fns.cons("B", kl.fns.cons("C", kl.fns.cons("D", kl.fns.cons("E", kl.fns.cons("F", kl.fns.cons("G", kl.fns.cons("H", kl.fns.cons("I", kl.fns.cons("J", kl.fns.cons("K", kl.fns.cons("L", kl.fns.cons("M", kl.fns.cons("N", kl.fns.cons("O", kl.fns.cons("P", kl.fns.cons("Q", kl.fns.cons("R", kl.fns.cons("S", kl.fns.cons("T", kl.fns.cons("U", kl.fns.cons("V", kl.fns.cons("W", kl.fns.cons("X", kl.fns.cons("Y", kl.fns.cons("Z", kl.fns.cons("a", kl.fns.cons("b", kl.fns.cons("c", kl.fns.cons("d", kl.fns.cons("e", kl.fns.cons("f", kl.fns.cons("g", kl.fns.cons("h", kl.fns.cons("i", kl.fns.cons("j", kl.fns.cons("k", kl.fns.cons("l", kl.fns.cons("m", kl.fns.cons("n", kl.fns.cons("o", kl.fns.cons("p", kl.fns.cons("q", kl.fns.cons("r", kl.fns.cons("s", kl.fns.cons("t", kl.fns.cons("u", kl.fns.cons("v", kl.fns.cons("w", kl.fns.cons("x", kl.fns.cons("y", kl.fns.cons("z", kl.fns.cons("=", kl.fns.cons("*", kl.fns.cons("/", kl.fns.cons("+", kl.fns.cons("-", kl.fns.cons("_", kl.fns.cons("?", kl.fns.cons("$", kl.fns.cons("!", kl.fns.cons("@", kl.fns.cons("~", kl.fns.cons(">", kl.fns.cons("<", kl.fns.cons("&", kl.fns.cons("%", kl.fns.cons("{", kl.fns.cons("}", kl.fns.cons(":", kl.fns.cons(";", kl.fns.cons("`", kl.fns.cons("#", kl.fns.cons("\'", kl.fns.cons(".", null)))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))]);
                    });

kl.defun("shen.alphanums?", 1, function (V2908) {
                      return asJsBool(kl.fns.$eq("", V2908))?(klTrue):(asJsBool(Kl.headCall(kl.fns.shen$do$plstring$qu, [V2908]))?(asKlBool(asJsBool(Kl.headCall(kl.fns.shen$doalphanum$qu, [kl.fns.pos(V2908, 0)])) && asJsBool(Kl.headCall(kl.fns.shen$doalphanums$qu, [kl.fns.tlstr(V2908)])))):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.alphanums?")])));
                    });

kl.defun("shen.alphanum?", 1, function (V2910) {
                      return asKlBool(asJsBool(Kl.headCall(kl.fns.shen$doalpha$qu, [V2910])) || asJsBool(Kl.headCall(kl.fns.shen$dodigit$qu, [V2910])));
                    });

kl.defun("shen.digit?", 1, function (V2912) {
                      return Kl.tailCall(kl.fns.element$qu, [V2912, kl.fns.cons("1", kl.fns.cons("2", kl.fns.cons("3", kl.fns.cons("4", kl.fns.cons("5", kl.fns.cons("6", kl.fns.cons("7", kl.fns.cons("8", kl.fns.cons("9", kl.fns.cons("0", null))))))))))]);
                    });

kl.defun("variable?", 1, function (V2914) {
                      return asJsBool(asKlBool(asJsBool(Kl.headCall(kl.fns.boolean$qu, [V2914])) || asJsBool(kl.fns.number$qu(V2914)) || asJsBool(kl.fns.string$qu(V2914))))?(klFalse):((function () {
                          try {
                            return (function () {
                  const String = kl.fns.str(V2914);
                    return Kl.headCall(kl.fns.shen$doanalyse_variable$qu, [String]);
                })();
                          } catch (E) {
                            return klFalse;
                          }
                        })());
                    });

kl.defun("shen.analyse-variable?", 1, function (V2916) {
                      return asJsBool(Kl.headCall(kl.fns.shen$do$plstring$qu, [V2916]))?(asKlBool(asJsBool(Kl.headCall(kl.fns.shen$douppercase$qu, [kl.fns.pos(V2916, 0)])) && asJsBool(Kl.headCall(kl.fns.shen$doalphanums$qu, [kl.fns.tlstr(V2916)])))):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.analyse-variable?")]));
                    });

kl.defun("shen.uppercase?", 1, function (V2918) {
                      return Kl.tailCall(kl.fns.element$qu, [V2918, kl.fns.cons("A", kl.fns.cons("B", kl.fns.cons("C", kl.fns.cons("D", kl.fns.cons("E", kl.fns.cons("F", kl.fns.cons("G", kl.fns.cons("H", kl.fns.cons("I", kl.fns.cons("J", kl.fns.cons("K", kl.fns.cons("L", kl.fns.cons("M", kl.fns.cons("N", kl.fns.cons("O", kl.fns.cons("P", kl.fns.cons("Q", kl.fns.cons("R", kl.fns.cons("S", kl.fns.cons("T", kl.fns.cons("U", kl.fns.cons("V", kl.fns.cons("W", kl.fns.cons("X", kl.fns.cons("Y", kl.fns.cons("Z", null))))))))))))))))))))))))))]);
                    });

kl.defun("gensym", 1, function (V2920) {
                      return Kl.tailCall(kl.fns.concat, [V2920, kl.symbols.shen$do$stgensym$st = kl.fns.$pl(1, kl.fns.value(new Sym("shen.*gensym*")))]);
                    });

kl.defun("concat", 2, function (V2923, V2924) {
                      return kl.fns.intern(kl.fns.cn(kl.fns.str(V2923), kl.fns.str(V2924)));
                    });

kl.defun("@p", 2, function (V2927, V2928) {
                      return (function () {
                  const Vector = kl.fns.absvector(3);
                    const Tag = kl.fns.address_$gt(Vector, 0, new Sym("shen.tuple"));
                    const Fst = kl.fns.address_$gt(Vector, 1, V2927);
                    const Snd = kl.fns.address_$gt(Vector, 2, V2928);
                    return Vector;
                })();
                    });

kl.defun("fst", 1, function (V2930) {
                      return kl.fns.$lt_address(V2930, 1);
                    });

kl.defun("snd", 1, function (V2932) {
                      return kl.fns.$lt_address(V2932, 2);
                    });

kl.defun("tuple?", 1, function (V2934) {
                      return asKlBool(asJsBool(kl.fns.absvector$qu(V2934)) && asJsBool(kl.fns.$eq(new Sym("shen.tuple"), (function () {
                          try {
                            return kl.fns.$lt_address(V2934, 0);
                          } catch (E) {
                            return new Sym("shen.not-tuple");
                          }
                        })())));
                    });

kl.defun("append", 2, function (V2937, V2938) {
                      return asJsBool(kl.fns.$eq(null, V2937))?(V2938):(asJsBool(kl.fns.cons$qu(V2937))?(kl.fns.cons(kl.fns.hd(V2937), Kl.headCall(kl.fns.append, [kl.fns.tl(V2937), V2938]))):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("append")])));
                    });

kl.defun("@v", 2, function (V2941, V2942) {
                      return (function () {
                  const Limit = Kl.headCall(kl.fns.limit, [V2942]);
                    const NewVector = Kl.headCall(kl.fns.vector, [kl.fns.$pl(Limit, 1)]);
                    const X$plNewVector = Kl.headCall(kl.fns.vector_$gt, [NewVector, 1, V2941]);
                    return asJsBool(kl.fns.$eq(Limit, 0))?(X$plNewVector):(Kl.tailCall(kl.fns.shen$do$atv_help, [V2942, 1, Limit, X$plNewVector]));
                })();
                    });

kl.defun("shen.@v-help", 4, function (V2948, V2949, V2950, V2951) {
                      return asJsBool(kl.fns.$eq(V2950, V2949))?(Kl.tailCall(kl.fns.shen$docopyfromvector, [V2948, V2951, V2950, kl.fns.$pl(V2950, 1)])):(Kl.tailCall(kl.fns.shen$do$atv_help, [V2948, kl.fns.$pl(V2949, 1), V2950, Kl.headCall(kl.fns.shen$docopyfromvector, [V2948, V2951, V2949, kl.fns.$pl(V2949, 1)])]));
                    });

kl.defun("shen.copyfromvector", 4, function (V2956, V2957, V2958, V2959) {
                      return (function () {
                          try {
                            return Kl.headCall(kl.fns.vector_$gt, [V2957, V2959, Kl.headCall(kl.fns.$lt_vector, [V2956, V2958])]);
                          } catch (E) {
                            return V2957;
                          }
                        })();
                    });

kl.defun("hdv", 1, function (V2961) {
                      return (function () {
                          try {
                            return Kl.headCall(kl.fns.$lt_vector, [V2961, 1]);
                          } catch (E) {
                            return kl.fns.simple_error(kl.fns.cn("hdv needs a non-empty vector as an argument; not ", Kl.headCall(kl.fns.shen$doapp, [V2961, "\n", new Sym("shen.s")])));
                          }
                        })();
                    });

kl.defun("tlv", 1, function (V2963) {
                      return (function () {
                  const Limit = Kl.headCall(kl.fns.limit, [V2963]);
                    return asJsBool(kl.fns.$eq(Limit, 0))?(kl.fns.simple_error("cannot take the tail of the empty vector\n")):(asJsBool(kl.fns.$eq(Limit, 1))?(Kl.tailCall(kl.fns.vector, [0])):((function () {
                  const NewVector = Kl.headCall(kl.fns.vector, [kl.fns._(Limit, 1)]);
                    return Kl.tailCall(kl.fns.shen$dotlv_help, [V2963, 2, Limit, Kl.headCall(kl.fns.vector, [kl.fns._(Limit, 1)])]);
                })()));
                })();
                    });

kl.defun("shen.tlv-help", 4, function (V2969, V2970, V2971, V2972) {
                      return asJsBool(kl.fns.$eq(V2971, V2970))?(Kl.tailCall(kl.fns.shen$docopyfromvector, [V2969, V2972, V2971, kl.fns._(V2971, 1)])):(Kl.tailCall(kl.fns.shen$dotlv_help, [V2969, kl.fns.$pl(V2970, 1), V2971, Kl.headCall(kl.fns.shen$docopyfromvector, [V2969, V2972, V2970, kl.fns._(V2970, 1)])]));
                    });

kl.defun("assoc", 2, function (V2984, V2985) {
                      return asJsBool(kl.fns.$eq(null, V2985))?(null):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V2985)) && asJsBool(kl.fns.cons$qu(kl.fns.hd(V2985))) && asJsBool(kl.fns.$eq(kl.fns.hd(kl.fns.hd(V2985)), V2984))))?(kl.fns.hd(V2985)):(asJsBool(kl.fns.cons$qu(V2985))?(Kl.tailCall(kl.fns.assoc, [V2984, kl.fns.tl(V2985)])):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("assoc")]))));
                    });

kl.defun("shen.assoc-set", 3, function (V2992, V2993, V2994) {
                      return asJsBool(kl.fns.$eq(null, V2994))?(kl.fns.cons(kl.fns.cons(V2992, V2993), null)):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V2994)) && asJsBool(kl.fns.cons$qu(kl.fns.hd(V2994))) && asJsBool(kl.fns.$eq(kl.fns.hd(kl.fns.hd(V2994)), V2992))))?(kl.fns.cons(kl.fns.cons(kl.fns.hd(kl.fns.hd(V2994)), V2993), kl.fns.tl(V2994))):(asJsBool(kl.fns.cons$qu(V2994))?(kl.fns.cons(kl.fns.hd(V2994), Kl.headCall(kl.fns.shen$doassoc_set, [V2992, V2993, kl.fns.tl(V2994)]))):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.assoc-set")]))));
                    });

kl.defun("shen.assoc-rm", 2, function (V3000, V3001) {
                      return asJsBool(kl.fns.$eq(null, V3001))?(null):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V3001)) && asJsBool(kl.fns.cons$qu(kl.fns.hd(V3001))) && asJsBool(kl.fns.$eq(kl.fns.hd(kl.fns.hd(V3001)), V3000))))?(kl.fns.tl(V3001)):(asJsBool(kl.fns.cons$qu(V3001))?(kl.fns.cons(kl.fns.hd(V3001), Kl.headCall(kl.fns.shen$doassoc_rm, [V3000, kl.fns.tl(V3001)]))):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.assoc-rm")]))));
                    });

kl.defun("boolean?", 1, function (V3007) {
                      return asJsBool(kl.fns.$eq(klTrue, V3007))?(klTrue):(asJsBool(kl.fns.$eq(klFalse, V3007))?(klTrue):(klFalse));
                    });

kl.defun("nl", 1, function (V3009) {
                      return asJsBool(kl.fns.$eq(0, V3009))?(0):((function () {
                      Kl.headCall(kl.fns.shen$doprhush, ["\n", Kl.headCall(kl.fns.stoutput, [])]);
                      return Kl.tailCall(kl.fns.nl, [kl.fns._(V3009, 1)]);
                    })());
                    });

kl.defun("difference", 2, function (V3014, V3015) {
                      return asJsBool(kl.fns.$eq(null, V3014))?(null):(asJsBool(kl.fns.cons$qu(V3014))?(asJsBool(Kl.headCall(kl.fns.element$qu, [kl.fns.hd(V3014), V3015]))?(Kl.tailCall(kl.fns.difference, [kl.fns.tl(V3014), V3015])):(kl.fns.cons(kl.fns.hd(V3014), Kl.headCall(kl.fns.difference, [kl.fns.tl(V3014), V3015])))):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("difference")])));
                    });

kl.defun("do", 2, function (V3018, V3019) {
                      return V3019;
                    });

kl.defun("element?", 2, function (V3031, V3032) {
                      return asJsBool(kl.fns.$eq(null, V3032))?(klFalse):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V3032)) && asJsBool(kl.fns.$eq(kl.fns.hd(V3032), V3031))))?(klTrue):(asJsBool(kl.fns.cons$qu(V3032))?(Kl.tailCall(kl.fns.element$qu, [V3031, kl.fns.tl(V3032)])):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("element?")]))));
                    });

kl.defun("empty?", 1, function (V3038) {
                      return asJsBool(kl.fns.$eq(null, V3038))?(klTrue):(klFalse);
                    });

kl.defun("fix", 2, function (V3041, V3042) {
                      return Kl.tailCall(kl.fns.shen$dofix_help, [V3041, V3042, Kl.headCall(V3041, [V3042])]);
                    });

kl.defun("shen.fix-help", 3, function (V3053, V3054, V3055) {
                      return asJsBool(kl.fns.$eq(V3055, V3054))?(V3055):(Kl.tailCall(kl.fns.shen$dofix_help, [V3053, V3055, Kl.headCall(V3053, [V3055])]));
                    });

kl.defun("put", 4, function (V3060, V3061, V3062, V3063) {
                      return (function () {
                  const Curr = (function () {
                          try {
                            return Kl.headCall(kl.fns.shen$do$lt_dict, [V3063, V3060]);
                          } catch (E) {
                            return null;
                          }
                        })();
                    const Added = Kl.headCall(kl.fns.shen$doassoc_set, [V3061, V3062, Curr]);
                    const Update = Kl.headCall(kl.fns.shen$dodict_$gt, [V3063, V3060, Added]);
                    return V3062;
                })();
                    });

kl.defun("unput", 3, function (V3067, V3068, V3069) {
                      return (function () {
                  const Curr = (function () {
                          try {
                            return Kl.headCall(kl.fns.shen$do$lt_dict, [V3069, V3067]);
                          } catch (E) {
                            return null;
                          }
                        })();
                    const Removed = Kl.headCall(kl.fns.shen$doassoc_rm, [V3068, Curr]);
                    const Update = Kl.headCall(kl.fns.shen$dodict_$gt, [V3069, V3067, Removed]);
                    return V3067;
                })();
                    });

kl.defun("get", 3, function (V3073, V3074, V3075) {
                      return (function () {
                  const Entry = (function () {
                          try {
                            return Kl.headCall(kl.fns.shen$do$lt_dict, [V3075, V3073]);
                          } catch (E) {
                            return null;
                          }
                        })();
                    const Result = Kl.headCall(kl.fns.assoc, [V3074, Entry]);
                    return asJsBool(Kl.headCall(kl.fns.empty$qu, [Result]))?(kl.fns.simple_error("value not found\n")):(kl.fns.tl(Result));
                })();
                    });

kl.defun("hash", 2, function (V3078, V3079) {
                      return Kl.tailCall(kl.fns.shen$domod, [Kl.headCall(kl.fns.sum, [Kl.headCall(kl.fns.map, [Kl.setArity("hash_lambda", 1, function (X) {
                      return kl.fns.string_$gtn(X);
                    }), Kl.headCall(kl.fns.explode, [V3078])])]), V3079]);
                    });

kl.defun("shen.mod", 2, function (V3082, V3083) {
                      return Kl.tailCall(kl.fns.shen$domodh, [V3082, Kl.headCall(kl.fns.shen$domultiples, [V3082, kl.fns.cons(V3083, null)])]);
                    });

kl.defun("shen.multiples", 2, function (V3086, V3087) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V3087)) && asJsBool(kl.fns.$gt(kl.fns.hd(V3087), V3086))))?(kl.fns.tl(V3087)):(asJsBool(kl.fns.cons$qu(V3087))?(Kl.tailCall(kl.fns.shen$domultiples, [V3086, kl.fns.cons(kl.fns.$st(2, kl.fns.hd(V3087)), V3087)])):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.multiples")])));
                    });

kl.defun("shen.modh", 2, function (V3092, V3093) {
                      return asJsBool(kl.fns.$eq(0, V3092))?(0):(asJsBool(kl.fns.$eq(null, V3093))?(V3092):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V3093)) && asJsBool(kl.fns.$gt(kl.fns.hd(V3093), V3092))))?(asJsBool(Kl.headCall(kl.fns.empty$qu, [kl.fns.tl(V3093)]))?(V3092):(Kl.tailCall(kl.fns.shen$domodh, [V3092, kl.fns.tl(V3093)]))):(asJsBool(kl.fns.cons$qu(V3093))?(Kl.tailCall(kl.fns.shen$domodh, [kl.fns._(V3092, kl.fns.hd(V3093)), V3093])):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.modh")])))));
                    });

kl.defun("sum", 1, function (V3095) {
                      return asJsBool(kl.fns.$eq(null, V3095))?(0):(asJsBool(kl.fns.cons$qu(V3095))?(kl.fns.$pl(kl.fns.hd(V3095), Kl.headCall(kl.fns.sum, [kl.fns.tl(V3095)]))):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("sum")])));
                    });

kl.defun("head", 1, function (V3103) {
                      return asJsBool(kl.fns.cons$qu(V3103))?(kl.fns.hd(V3103)):(kl.fns.simple_error("head expects a non-empty list"));
                    });

kl.defun("tail", 1, function (V3111) {
                      return asJsBool(kl.fns.cons$qu(V3111))?(kl.fns.tl(V3111)):(kl.fns.simple_error("tail expects a non-empty list"));
                    });

kl.defun("hdstr", 1, function (V3113) {
                      return kl.fns.pos(V3113, 0);
                    });

kl.defun("intersection", 2, function (V3118, V3119) {
                      return asJsBool(kl.fns.$eq(null, V3118))?(null):(asJsBool(kl.fns.cons$qu(V3118))?(asJsBool(Kl.headCall(kl.fns.element$qu, [kl.fns.hd(V3118), V3119]))?(kl.fns.cons(kl.fns.hd(V3118), Kl.headCall(kl.fns.intersection, [kl.fns.tl(V3118), V3119]))):(Kl.tailCall(kl.fns.intersection, [kl.fns.tl(V3118), V3119]))):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("intersection")])));
                    });

kl.defun("reverse", 1, function (V3121) {
                      return Kl.tailCall(kl.fns.shen$doreverse$unhelp, [V3121, null]);
                    });

kl.defun("shen.reverse_help", 2, function (V3124, V3125) {
                      return asJsBool(kl.fns.$eq(null, V3124))?(V3125):(asJsBool(kl.fns.cons$qu(V3124))?(Kl.tailCall(kl.fns.shen$doreverse$unhelp, [kl.fns.tl(V3124), kl.fns.cons(kl.fns.hd(V3124), V3125)])):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.reverse_help")])));
                    });

kl.defun("union", 2, function (V3128, V3129) {
                      return asJsBool(kl.fns.$eq(null, V3128))?(V3129):(asJsBool(kl.fns.cons$qu(V3128))?(asJsBool(Kl.headCall(kl.fns.element$qu, [kl.fns.hd(V3128), V3129]))?(Kl.tailCall(kl.fns.union, [kl.fns.tl(V3128), V3129])):(kl.fns.cons(kl.fns.hd(V3128), Kl.headCall(kl.fns.union, [kl.fns.tl(V3128), V3129])))):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("union")])));
                    });

kl.defun("y-or-n?", 1, function (V3131) {
                      return (function () {
                  const Message = Kl.headCall(kl.fns.shen$doprhush, [Kl.headCall(kl.fns.shen$doproc_nl, [V3131]), Kl.headCall(kl.fns.stoutput, [])]);
                    const Y_or_N = Kl.headCall(kl.fns.shen$doprhush, [" (y/n) ", Kl.headCall(kl.fns.stoutput, [])]);
                    const Input = Kl.headCall(kl.fns.shen$doapp, [Kl.headCall(kl.fns.read, [Kl.headCall(kl.fns.stinput, [])]), "", new Sym("shen.s")]);
                    return asJsBool(kl.fns.$eq("y", Input))?(klTrue):(asJsBool(kl.fns.$eq("n", Input))?(klFalse):((function () {
                      Kl.headCall(kl.fns.shen$doprhush, ["please answer y or n\n", Kl.headCall(kl.fns.stoutput, [])]);
                      return Kl.tailCall(kl.fns.y_or_n$qu, [V3131]);
                    })()));
                })();
                    });

kl.defun("not", 1, function (V3133) {
                      return asJsBool(V3133)?(klFalse):(klTrue);
                    });

kl.defun("subst", 3, function (V3146, V3147, V3148) {
                      return asJsBool(kl.fns.$eq(V3148, V3147))?(V3146):(asJsBool(kl.fns.cons$qu(V3148))?(Kl.tailCall(kl.fns.map, [Kl.setArity("subst_lambda", 1, function (W) {
                      return Kl.tailCall(kl.fns.subst, [V3146, V3147, W]);
                    }), V3148])):(V3148));
                    });

kl.defun("explode", 1, function (V3150) {
                      return Kl.tailCall(kl.fns.shen$doexplode_h, [Kl.headCall(kl.fns.shen$doapp, [V3150, "", new Sym("shen.a")])]);
                    });

kl.defun("shen.explode-h", 1, function (V3152) {
                      return asJsBool(kl.fns.$eq("", V3152))?(null):(asJsBool(Kl.headCall(kl.fns.shen$do$plstring$qu, [V3152]))?(kl.fns.cons(kl.fns.pos(V3152, 0), Kl.headCall(kl.fns.shen$doexplode_h, [kl.fns.tlstr(V3152)]))):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.explode-h")])));
                    });

kl.defun("cd", 1, function (V3154) {
                      return kl.symbols.$sthome_directory$st = asJsBool(kl.fns.$eq(V3154, ""))?(""):(Kl.headCall(kl.fns.shen$doapp, [V3154, "/", new Sym("shen.a")]));
                    });

kl.defun("shen.for-each", 2, function (V3157, V3158) {
                      return asJsBool(kl.fns.$eq(null, V3158))?(klTrue):(asJsBool(kl.fns.cons$qu(V3158))?((function () {
                  const $un = Kl.headCall(V3157, [kl.fns.hd(V3158)]);
                    return Kl.tailCall(kl.fns.shen$dofor_each, [V3157, kl.fns.tl(V3158)]);
                })()):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.for-each")])));
                    });

kl.defun("map", 2, function (V3161, V3162) {
                      return Kl.tailCall(kl.fns.shen$domap_h, [V3161, V3162, null]);
                    });

kl.defun("shen.map-h", 3, function (V3168, V3169, V3170) {
                      return asJsBool(kl.fns.$eq(null, V3169))?(Kl.tailCall(kl.fns.reverse, [V3170])):(asJsBool(kl.fns.cons$qu(V3169))?(Kl.tailCall(kl.fns.shen$domap_h, [V3168, kl.fns.tl(V3169), kl.fns.cons(Kl.headCall(V3168, [kl.fns.hd(V3169)]), V3170)])):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.map-h")])));
                    });

kl.defun("length", 1, function (V3172) {
                      return Kl.tailCall(kl.fns.shen$dolength_h, [V3172, 0]);
                    });

kl.defun("shen.length-h", 2, function (V3175, V3176) {
                      return asJsBool(kl.fns.$eq(null, V3175))?(V3176):(Kl.tailCall(kl.fns.shen$dolength_h, [kl.fns.tl(V3175), kl.fns.$pl(V3176, 1)]));
                    });

kl.defun("occurrences", 2, function (V3188, V3189) {
                      return asJsBool(kl.fns.$eq(V3189, V3188))?(1):(asJsBool(kl.fns.cons$qu(V3189))?(kl.fns.$pl(Kl.headCall(kl.fns.occurrences, [V3188, kl.fns.hd(V3189)]), Kl.headCall(kl.fns.occurrences, [V3188, kl.fns.tl(V3189)]))):(0));
                    });

kl.defun("nth", 2, function (V3196, V3197) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.$eq(1, V3196)) && asJsBool(kl.fns.cons$qu(V3197))))?(kl.fns.hd(V3197)):(asJsBool(kl.fns.cons$qu(V3197))?(Kl.tailCall(kl.fns.nth, [kl.fns._(V3196, 1), kl.fns.tl(V3197)])):(kl.fns.simple_error(kl.fns.cn("nth applied to ", Kl.headCall(kl.fns.shen$doapp, [V3196, kl.fns.cn(", ", Kl.headCall(kl.fns.shen$doapp, [V3197, "\n", new Sym("shen.a")])), new Sym("shen.a")])))));
                    });

kl.defun("integer?", 1, function (V3199) {
                      return asKlBool(asJsBool(kl.fns.number$qu(V3199)) && asJsBool((function () {
                  const Abs = Kl.headCall(kl.fns.shen$doabs, [V3199]);
                    return Kl.headCall(kl.fns.shen$dointeger_test$qu, [Abs, Kl.headCall(kl.fns.shen$domagless, [Abs, 1])]);
                })()));
                    });

kl.defun("shen.abs", 1, function (V3201) {
                      return asJsBool(kl.fns.$gt(V3201, 0))?(V3201):(kl.fns._(0, V3201));
                    });

kl.defun("shen.magless", 2, function (V3204, V3205) {
                      return (function () {
                  const Nx2 = kl.fns.$st(V3205, 2);
                    return asJsBool(kl.fns.$gt(Nx2, V3204))?(V3205):(Kl.tailCall(kl.fns.shen$domagless, [V3204, Nx2]));
                })();
                    });

kl.defun("shen.integer-test?", 2, function (V3211, V3212) {
                      return asJsBool(kl.fns.$eq(0, V3211))?(klTrue):(asJsBool(kl.fns.$gt(1, V3211))?(klFalse):((function () {
                  const Abs_N = kl.fns._(V3211, V3212);
                    return asJsBool(kl.fns.$gt(0, Abs_N))?(Kl.tailCall(kl.fns.integer$qu, [V3211])):(Kl.tailCall(kl.fns.shen$dointeger_test$qu, [Abs_N, V3212]));
                })()));
                    });

kl.defun("mapcan", 2, function (V3217, V3218) {
                      return asJsBool(kl.fns.$eq(null, V3218))?(null):(asJsBool(kl.fns.cons$qu(V3218))?(Kl.tailCall(kl.fns.append, [Kl.headCall(V3217, [kl.fns.hd(V3218)]), Kl.headCall(kl.fns.mapcan, [V3217, kl.fns.tl(V3218)])])):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("mapcan")])));
                    });

kl.defun("==", 2, function (V3230, V3231) {
                      return asJsBool(kl.fns.$eq(V3231, V3230))?(klTrue):(klFalse);
                    });

kl.defun("abort", 0, function () {
                      return kl.fns.simple_error("");
                    });

kl.defun("bound?", 1, function (V3233) {
                      return asKlBool(asJsBool(Kl.headCall(kl.fns.symbol$qu, [V3233])) && asJsBool((function () {
                  const Val = (function () {
                          try {
                            return kl.fns.value(V3233);
                          } catch (E) {
                            return new Sym("shen.this-symbol-is-unbound");
                          }
                        })();
                    return asJsBool(kl.fns.$eq(Val, new Sym("shen.this-symbol-is-unbound")))?(klFalse):(klTrue);
                })()));
                    });

kl.defun("shen.string->bytes", 1, function (V3235) {
                      return asJsBool(kl.fns.$eq("", V3235))?(null):(kl.fns.cons(kl.fns.string_$gtn(kl.fns.pos(V3235, 0)), Kl.headCall(kl.fns.shen$dostring_$gtbytes, [kl.fns.tlstr(V3235)])));
                    });

kl.defun("maxinferences", 1, function (V3237) {
                      return kl.symbols.shen$do$stmaxinferences$st = V3237;
                    });

kl.defun("inferences", 0, function () {
                      return kl.fns.value(new Sym("shen.*infs*"));
                    });

kl.defun("protect", 1, function (V3239) {
                      return V3239;
                    });

kl.defun("stoutput", 0, function () {
                      return kl.symbols.$ststoutput$st;
                    });

kl.defun("sterror", 0, function () {
                      return kl.symbols.$ststerror$st;
                    });

kl.defun("string->symbol", 1, function (V3241) {
                      return (function () {
                  const Symbol = kl.fns.intern(V3241);
                    return asJsBool(Kl.headCall(kl.fns.symbol$qu, [Symbol]))?(Symbol):(kl.fns.simple_error(kl.fns.cn("cannot intern ", Kl.headCall(kl.fns.shen$doapp, [V3241, " to a symbol", new Sym("shen.s")]))));
                })();
                    });

kl.defun("optimise", 1, function (V3247) {
                      return asJsBool(kl.fns.$eq(new Sym("+"), V3247))?(kl.symbols.shen$do$stoptimise$st = klTrue):(asJsBool(kl.fns.$eq(new Sym("-"), V3247))?(kl.symbols.shen$do$stoptimise$st = klFalse):(kl.fns.simple_error("optimise expects a + or a -.\n")));
                    });

kl.defun("os", 0, function () {
                      return kl.symbols.$stos$st;
                    });

kl.defun("language", 0, function () {
                      return kl.symbols.$stlanguage$st;
                    });

kl.defun("version", 0, function () {
                      return kl.fns.value(new Sym("*version*"));
                    });

kl.defun("port", 0, function () {
                      return kl.symbols.$stport$st;
                    });

kl.defun("porters", 0, function () {
                      return kl.symbols.$stporters$st;
                    });

kl.defun("implementation", 0, function () {
                      return kl.symbols.$stimplementation$st;
                    });

kl.defun("release", 0, function () {
                      return kl.symbols.$strelease$st;
                    });

kl.defun("package?", 1, function (V3249) {
                      return (function () {
                          try {
                            return (function () {
                      Kl.headCall(kl.fns.external, [V3249]);
                      return klTrue;
                    })();
                          } catch (E) {
                            return klFalse;
                          }
                        })();
                    });

kl.defun("function", 1, function (V3251) {
                      return Kl.tailCall(kl.fns.shen$dolookup_func, [V3251]);
                    });

kl.defun("shen.lookup-func", 1, function (V3253) {
                      return (function () {
                          try {
                            return Kl.headCall(kl.fns.get, [V3253, new Sym("shen.lambda-form"), kl.fns.value(new Sym("*property-vector*"))]);
                          } catch (E) {
                            return kl.fns.simple_error(Kl.headCall(kl.fns.shen$doapp, [V3253, " has no lambda expansion\n", new Sym("shen.a")]));
                          }
                        })();
                    });

kl.defun("shen.dict", 1, function (V3255) {
                      return asJsBool(kl.fns.$lt(V3255, 1))?(kl.fns.simple_error(kl.fns.cn("invalid initial dict size: ", Kl.headCall(kl.fns.shen$doapp, [V3255, "", new Sym("shen.s")])))):((function () {
                  const D = kl.fns.absvector(kl.fns.$pl(3, V3255));
                    const Tag = kl.fns.address_$gt(D, 0, new Sym("shen.dictionary"));
                    const Capacity = kl.fns.address_$gt(D, 1, V3255);
                    const Count = kl.fns.address_$gt(D, 2, 0);
                    const Fill = Kl.headCall(kl.fns.shen$dofillvector, [D, 3, kl.fns.$pl(2, V3255), null]);
                    return D;
                })());
                    });

kl.defun("shen.dict?", 1, function (V3257) {
                      return asKlBool(asJsBool(kl.fns.absvector$qu(V3257)) && asJsBool(kl.fns.$eq((function () {
                          try {
                            return kl.fns.$lt_address(V3257, 0);
                          } catch (E) {
                            return new Sym("shen.not-dictionary");
                          }
                        })(), new Sym("shen.dictionary"))));
                    });

kl.defun("shen.dict-capacity", 1, function (V3259) {
                      return kl.fns.$lt_address(V3259, 1);
                    });

kl.defun("shen.dict-count", 1, function (V3261) {
                      return kl.fns.$lt_address(V3261, 2);
                    });

kl.defun("shen.dict-count->", 2, function (V3264, V3265) {
                      return kl.fns.address_$gt(V3264, 2, V3265);
                    });

kl.defun("shen.<-dict-bucket", 2, function (V3268, V3269) {
                      return kl.fns.$lt_address(V3268, kl.fns.$pl(3, V3269));
                    });

kl.defun("shen.dict-bucket->", 3, function (V3273, V3274, V3275) {
                      return kl.fns.address_$gt(V3273, kl.fns.$pl(3, V3274), V3275);
                    });

kl.defun("shen.dict-update-count", 3, function (V3279, V3280, V3281) {
                      return (function () {
                  const Diff = kl.fns._(Kl.headCall(kl.fns.length, [V3281]), Kl.headCall(kl.fns.length, [V3280]));
                    return Kl.tailCall(kl.fns.shen$dodict_count_$gt, [V3279, kl.fns.$pl(Diff, Kl.headCall(kl.fns.shen$dodict_count, [V3279]))]);
                })();
                    });

kl.defun("shen.dict->", 3, function (V3285, V3286, V3287) {
                      return (function () {
                  const N = Kl.headCall(kl.fns.hash, [V3286, Kl.headCall(kl.fns.shen$dodict_capacity, [V3285])]);
                    const Bucket = Kl.headCall(kl.fns.shen$do$lt_dict_bucket, [V3285, N]);
                    const NewBucket = Kl.headCall(kl.fns.shen$doassoc_set, [V3286, V3287, Bucket]);
                    const Change = Kl.headCall(kl.fns.shen$dodict_bucket_$gt, [V3285, N, NewBucket]);
                    const Count = Kl.headCall(kl.fns.shen$dodict_update_count, [V3285, Bucket, NewBucket]);
                    return V3287;
                })();
                    });

kl.defun("shen.<-dict", 2, function (V3290, V3291) {
                      return (function () {
                  const N = Kl.headCall(kl.fns.hash, [V3291, Kl.headCall(kl.fns.shen$dodict_capacity, [V3290])]);
                    const Bucket = Kl.headCall(kl.fns.shen$do$lt_dict_bucket, [V3290, N]);
                    const Result = Kl.headCall(kl.fns.assoc, [V3291, Bucket]);
                    return asJsBool(Kl.headCall(kl.fns.empty$qu, [Result]))?(kl.fns.simple_error(kl.fns.cn("value ", Kl.headCall(kl.fns.shen$doapp, [V3291, " not found in dict\n", new Sym("shen.a")])))):(kl.fns.tl(Result));
                })();
                    });

kl.defun("shen.dict-rm", 2, function (V3294, V3295) {
                      return (function () {
                  const N = Kl.headCall(kl.fns.hash, [V3295, Kl.headCall(kl.fns.shen$dodict_capacity, [V3294])]);
                    const Bucket = Kl.headCall(kl.fns.shen$do$lt_dict_bucket, [V3294, N]);
                    const NewBucket = Kl.headCall(kl.fns.shen$doassoc_rm, [V3295, Bucket]);
                    const Change = Kl.headCall(kl.fns.shen$dodict_bucket_$gt, [V3294, N, NewBucket]);
                    const Count = Kl.headCall(kl.fns.shen$dodict_update_count, [V3294, Bucket, NewBucket]);
                    return V3295;
                })();
                    });

kl.defun("shen.dict-fold", 3, function (V3299, V3300, V3301) {
                      return (function () {
                  const Limit = Kl.headCall(kl.fns.shen$dodict_capacity, [V3300]);
                    return Kl.tailCall(kl.fns.shen$dodict_fold_h, [V3299, V3300, V3301, 0, Limit]);
                })();
                    });

kl.defun("shen.dict-fold-h", 5, function (V3308, V3309, V3310, V3311, V3312) {
                      return asJsBool(kl.fns.$eq(V3312, V3311))?(V3310):((function () {
                  const B = Kl.headCall(kl.fns.shen$do$lt_dict_bucket, [V3309, V3311]);
                    const Acc = Kl.headCall(kl.fns.shen$dobucket_fold, [V3308, B, V3310]);
                    return Kl.tailCall(kl.fns.shen$dodict_fold_h, [V3308, V3309, Acc, kl.fns.$pl(1, V3311), V3312]);
                })());
                    });

kl.defun("shen.bucket-fold", 3, function (V3316, V3317, V3318) {
                      return asJsBool(kl.fns.$eq(null, V3317))?(V3318):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V3317)) && asJsBool(kl.fns.cons$qu(kl.fns.hd(V3317)))))?(Kl.tailCall(V3316, [kl.fns.hd(kl.fns.hd(V3317)), kl.fns.tl(kl.fns.hd(V3317)), Kl.headCall(kl.fns.shen$dobucket_fold, [V3316, kl.fns.tl(V3317), V3318])])):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.bucket-fold")])));
                    });

kl.defun("shen.dict-keys", 1, function (V3320) {
                      return Kl.tailCall(kl.fns.shen$dodict_fold, [Kl.setArity("shen.dict-keys_lambda", 1, function (K) {
                      return Kl.setArity("shen.dict-keys_lambda_lambda", 1, function ($un) {
                      return Kl.setArity("shen.dict-keys_lambda_lambda_lambda", 1, function (Acc) {
                      return kl.fns.cons(K, Acc);
                    });
                    });
                    }), V3320, null]);
                    });

kl.defun("shen.dict-values", 1, function (V3322) {
                      return Kl.tailCall(kl.fns.shen$dodict_fold, [Kl.setArity("shen.dict-values_lambda", 1, function ($un) {
                      return Kl.setArity("shen.dict-values_lambda_lambda", 1, function (V) {
                      return Kl.setArity("shen.dict-values_lambda_lambda_lambda", 1, function (Acc) {
                      return kl.fns.cons(V, Acc);
                    });
                    });
                    }), V3322, null]);
                    });

kl.defun("shen.datatype-error", 1, function (V2635) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V2635)) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V2635))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(V2635))))))?(kl.fns.simple_error(kl.fns.cn("datatype syntax error here:\n\n ", Kl.headCall(kl.fns.shen$doapp, [Kl.headCall(kl.fns.shen$donext_50, [50, kl.fns.hd(V2635)]), "\n", new Sym("shen.a")])))):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.datatype-error")]));
                    });

kl.defun("shen.<datatype-rules>", 1, function (V2637) {
                      return (function () {
                  const YaccParse = (function () {
                  const Parse$unshen$do$ltdatatype_rule$gt = Kl.headCall(kl.fns.shen$do$ltdatatype_rule$gt, [V2637]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltdatatype_rule$gt)]))?((function () {
                  const Parse$unshen$do$ltdatatype_rules$gt = Kl.headCall(kl.fns.shen$do$ltdatatype_rules$gt, [Parse$unshen$do$ltdatatype_rule$gt]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltdatatype_rules$gt)]))?(Kl.headCall(kl.fns.shen$dopair, [kl.fns.hd(Parse$unshen$do$ltdatatype_rules$gt), kl.fns.cons(Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltdatatype_rule$gt]), Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltdatatype_rules$gt]))])):(Kl.headCall(kl.fns.fail, []));
                })()):(Kl.headCall(kl.fns.fail, []));
                })();
                    return asJsBool(kl.fns.$eq(YaccParse, Kl.headCall(kl.fns.fail, [])))?((function () {
                  const Parse$un$lte$gt = Kl.headCall(kl.fns.$lte$gt, [V2637]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$un$lte$gt)]))?(Kl.tailCall(kl.fns.shen$dopair, [kl.fns.hd(Parse$un$lte$gt), null])):(Kl.tailCall(kl.fns.fail, []));
                })()):(YaccParse);
                })();
                    });

kl.defun("shen.<datatype-rule>", 1, function (V2639) {
                      return (function () {
                  const YaccParse = (function () {
                  const Parse$unshen$do$ltside_conditions$gt = Kl.headCall(kl.fns.shen$do$ltside_conditions$gt, [V2639]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltside_conditions$gt)]))?((function () {
                  const Parse$unshen$do$ltpremises$gt = Kl.headCall(kl.fns.shen$do$ltpremises$gt, [Parse$unshen$do$ltside_conditions$gt]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltpremises$gt)]))?((function () {
                  const Parse$unshen$do$ltsingleunderline$gt = Kl.headCall(kl.fns.shen$do$ltsingleunderline$gt, [Parse$unshen$do$ltpremises$gt]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltsingleunderline$gt)]))?((function () {
                  const Parse$unshen$do$ltconclusion$gt = Kl.headCall(kl.fns.shen$do$ltconclusion$gt, [Parse$unshen$do$ltsingleunderline$gt]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltconclusion$gt)]))?(Kl.headCall(kl.fns.shen$dopair, [kl.fns.hd(Parse$unshen$do$ltconclusion$gt), Kl.headCall(kl.fns.shen$dosequent, [new Sym("shen.single"), kl.fns.cons(Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltside_conditions$gt]), kl.fns.cons(Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltpremises$gt]), kl.fns.cons(Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltconclusion$gt]), null)))])])):(Kl.headCall(kl.fns.fail, []));
                })()):(Kl.headCall(kl.fns.fail, []));
                })()):(Kl.headCall(kl.fns.fail, []));
                })()):(Kl.headCall(kl.fns.fail, []));
                })();
                    return asJsBool(kl.fns.$eq(YaccParse, Kl.headCall(kl.fns.fail, [])))?((function () {
                  const Parse$unshen$do$ltside_conditions$gt = Kl.headCall(kl.fns.shen$do$ltside_conditions$gt, [V2639]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltside_conditions$gt)]))?((function () {
                  const Parse$unshen$do$ltpremises$gt = Kl.headCall(kl.fns.shen$do$ltpremises$gt, [Parse$unshen$do$ltside_conditions$gt]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltpremises$gt)]))?((function () {
                  const Parse$unshen$do$ltdoubleunderline$gt = Kl.headCall(kl.fns.shen$do$ltdoubleunderline$gt, [Parse$unshen$do$ltpremises$gt]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltdoubleunderline$gt)]))?((function () {
                  const Parse$unshen$do$ltconclusion$gt = Kl.headCall(kl.fns.shen$do$ltconclusion$gt, [Parse$unshen$do$ltdoubleunderline$gt]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltconclusion$gt)]))?(Kl.tailCall(kl.fns.shen$dopair, [kl.fns.hd(Parse$unshen$do$ltconclusion$gt), Kl.headCall(kl.fns.shen$dosequent, [new Sym("shen.double"), kl.fns.cons(Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltside_conditions$gt]), kl.fns.cons(Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltpremises$gt]), kl.fns.cons(Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltconclusion$gt]), null)))])])):(Kl.tailCall(kl.fns.fail, []));
                })()):(Kl.tailCall(kl.fns.fail, []));
                })()):(Kl.tailCall(kl.fns.fail, []));
                })()):(Kl.tailCall(kl.fns.fail, []));
                })()):(YaccParse);
                })();
                    });

kl.defun("shen.<side-conditions>", 1, function (V2641) {
                      return (function () {
                  const YaccParse = (function () {
                  const Parse$unshen$do$ltside_condition$gt = Kl.headCall(kl.fns.shen$do$ltside_condition$gt, [V2641]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltside_condition$gt)]))?((function () {
                  const Parse$unshen$do$ltside_conditions$gt = Kl.headCall(kl.fns.shen$do$ltside_conditions$gt, [Parse$unshen$do$ltside_condition$gt]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltside_conditions$gt)]))?(Kl.headCall(kl.fns.shen$dopair, [kl.fns.hd(Parse$unshen$do$ltside_conditions$gt), kl.fns.cons(Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltside_condition$gt]), Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltside_conditions$gt]))])):(Kl.headCall(kl.fns.fail, []));
                })()):(Kl.headCall(kl.fns.fail, []));
                })();
                    return asJsBool(kl.fns.$eq(YaccParse, Kl.headCall(kl.fns.fail, [])))?((function () {
                  const Parse$un$lte$gt = Kl.headCall(kl.fns.$lte$gt, [V2641]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$un$lte$gt)]))?(Kl.tailCall(kl.fns.shen$dopair, [kl.fns.hd(Parse$un$lte$gt), null])):(Kl.tailCall(kl.fns.fail, []));
                })()):(YaccParse);
                })();
                    });

kl.defun("shen.<side-condition>", 1, function (V2643) {
                      return (function () {
                  const YaccParse = asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(kl.fns.hd(V2643))) && asJsBool(kl.fns.$eq(new Sym("if"), kl.fns.hd(kl.fns.hd(V2643))))))?((function () {
                  const Parse$unshen$do$ltexpr$gt = Kl.headCall(kl.fns.shen$do$ltexpr$gt, [Kl.headCall(kl.fns.shen$dopair, [kl.fns.tl(kl.fns.hd(V2643)), Kl.headCall(kl.fns.shen$dohdtl, [V2643])])]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltexpr$gt)]))?(Kl.headCall(kl.fns.shen$dopair, [kl.fns.hd(Parse$unshen$do$ltexpr$gt), kl.fns.cons(new Sym("if"), kl.fns.cons(Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltexpr$gt]), null))])):(Kl.headCall(kl.fns.fail, []));
                })()):(Kl.headCall(kl.fns.fail, []));
                    return asJsBool(kl.fns.$eq(YaccParse, Kl.headCall(kl.fns.fail, [])))?(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(kl.fns.hd(V2643))) && asJsBool(kl.fns.$eq(new Sym("let"), kl.fns.hd(kl.fns.hd(V2643))))))?((function () {
                  const Parse$unshen$do$ltvariable$qu$gt = Kl.headCall(kl.fns.shen$do$ltvariable$qu$gt, [Kl.headCall(kl.fns.shen$dopair, [kl.fns.tl(kl.fns.hd(V2643)), Kl.headCall(kl.fns.shen$dohdtl, [V2643])])]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltvariable$qu$gt)]))?((function () {
                  const Parse$unshen$do$ltexpr$gt = Kl.headCall(kl.fns.shen$do$ltexpr$gt, [Parse$unshen$do$ltvariable$qu$gt]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltexpr$gt)]))?(Kl.tailCall(kl.fns.shen$dopair, [kl.fns.hd(Parse$unshen$do$ltexpr$gt), kl.fns.cons(new Sym("let"), kl.fns.cons(Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltvariable$qu$gt]), kl.fns.cons(Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltexpr$gt]), null)))])):(Kl.tailCall(kl.fns.fail, []));
                })()):(Kl.tailCall(kl.fns.fail, []));
                })()):(Kl.tailCall(kl.fns.fail, []))):(YaccParse);
                })();
                    });

kl.defun("shen.<variable?>", 1, function (V2645) {
                      return asJsBool(kl.fns.cons$qu(kl.fns.hd(V2645)))?((function () {
                  const Parse$unX = kl.fns.hd(kl.fns.hd(V2645));
                    return asJsBool(Kl.headCall(kl.fns.variable$qu, [Parse$unX]))?(Kl.tailCall(kl.fns.shen$dopair, [kl.fns.hd(Kl.headCall(kl.fns.shen$dopair, [kl.fns.tl(kl.fns.hd(V2645)), Kl.headCall(kl.fns.shen$dohdtl, [V2645])])), Parse$unX])):(Kl.tailCall(kl.fns.fail, []));
                })()):(Kl.tailCall(kl.fns.fail, []));
                    });

kl.defun("shen.<expr>", 1, function (V2647) {
                      return asJsBool(kl.fns.cons$qu(kl.fns.hd(V2647)))?((function () {
                  const Parse$unX = kl.fns.hd(kl.fns.hd(V2647));
                    return asJsBool(Kl.headCall(kl.fns.not, [asKlBool(asJsBool(Kl.headCall(kl.fns.element$qu, [Parse$unX, kl.fns.cons(new Sym(">>"), kl.fns.cons(new Sym(";"), null))])) || asJsBool(Kl.headCall(kl.fns.shen$dosingleunderline$qu, [Parse$unX])) || asJsBool(Kl.headCall(kl.fns.shen$dodoubleunderline$qu, [Parse$unX])))]))?(Kl.tailCall(kl.fns.shen$dopair, [kl.fns.hd(Kl.headCall(kl.fns.shen$dopair, [kl.fns.tl(kl.fns.hd(V2647)), Kl.headCall(kl.fns.shen$dohdtl, [V2647])])), Kl.headCall(kl.fns.shen$doremove_bar, [Parse$unX])])):(Kl.tailCall(kl.fns.fail, []));
                })()):(Kl.tailCall(kl.fns.fail, []));
                    });

kl.defun("shen.remove-bar", 1, function (V2649) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V2649)) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V2649))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(V2649)))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.tl(V2649))))) && asJsBool(kl.fns.$eq(kl.fns.hd(kl.fns.tl(V2649)), new Sym("bar!")))))?(kl.fns.cons(kl.fns.hd(V2649), kl.fns.hd(kl.fns.tl(kl.fns.tl(V2649))))):(asJsBool(kl.fns.cons$qu(V2649))?(kl.fns.cons(Kl.headCall(kl.fns.shen$doremove_bar, [kl.fns.hd(V2649)]), Kl.headCall(kl.fns.shen$doremove_bar, [kl.fns.tl(V2649)]))):(V2649));
                    });

kl.defun("shen.<premises>", 1, function (V2651) {
                      return (function () {
                  const YaccParse = (function () {
                  const Parse$unshen$do$ltpremise$gt = Kl.headCall(kl.fns.shen$do$ltpremise$gt, [V2651]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltpremise$gt)]))?((function () {
                  const Parse$unshen$do$ltsemicolon_symbol$gt = Kl.headCall(kl.fns.shen$do$ltsemicolon_symbol$gt, [Parse$unshen$do$ltpremise$gt]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltsemicolon_symbol$gt)]))?((function () {
                  const Parse$unshen$do$ltpremises$gt = Kl.headCall(kl.fns.shen$do$ltpremises$gt, [Parse$unshen$do$ltsemicolon_symbol$gt]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltpremises$gt)]))?(Kl.headCall(kl.fns.shen$dopair, [kl.fns.hd(Parse$unshen$do$ltpremises$gt), kl.fns.cons(Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltpremise$gt]), Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltpremises$gt]))])):(Kl.headCall(kl.fns.fail, []));
                })()):(Kl.headCall(kl.fns.fail, []));
                })()):(Kl.headCall(kl.fns.fail, []));
                })();
                    return asJsBool(kl.fns.$eq(YaccParse, Kl.headCall(kl.fns.fail, [])))?((function () {
                  const Parse$un$lte$gt = Kl.headCall(kl.fns.$lte$gt, [V2651]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$un$lte$gt)]))?(Kl.tailCall(kl.fns.shen$dopair, [kl.fns.hd(Parse$un$lte$gt), null])):(Kl.tailCall(kl.fns.fail, []));
                })()):(YaccParse);
                })();
                    });

kl.defun("shen.<semicolon-symbol>", 1, function (V2653) {
                      return asJsBool(kl.fns.cons$qu(kl.fns.hd(V2653)))?((function () {
                  const Parse$unX = kl.fns.hd(kl.fns.hd(V2653));
                    return asJsBool(kl.fns.$eq(Parse$unX, new Sym(";")))?(Kl.tailCall(kl.fns.shen$dopair, [kl.fns.hd(Kl.headCall(kl.fns.shen$dopair, [kl.fns.tl(kl.fns.hd(V2653)), Kl.headCall(kl.fns.shen$dohdtl, [V2653])])), new Sym("shen.skip")])):(Kl.tailCall(kl.fns.fail, []));
                })()):(Kl.tailCall(kl.fns.fail, []));
                    });

kl.defun("shen.<premise>", 1, function (V2655) {
                      return (function () {
                  const YaccParse = asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(kl.fns.hd(V2655))) && asJsBool(kl.fns.$eq(new Sym("!"), kl.fns.hd(kl.fns.hd(V2655))))))?(Kl.headCall(kl.fns.shen$dopair, [kl.fns.hd(Kl.headCall(kl.fns.shen$dopair, [kl.fns.tl(kl.fns.hd(V2655)), Kl.headCall(kl.fns.shen$dohdtl, [V2655])])), new Sym("!")])):(Kl.headCall(kl.fns.fail, []));
                    return asJsBool(kl.fns.$eq(YaccParse, Kl.headCall(kl.fns.fail, [])))?((function () {
                  const YaccParse_1 = (function () {
                  const Parse$unshen$do$ltformulae$gt = Kl.headCall(kl.fns.shen$do$ltformulae$gt, [V2655]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltformulae$gt)]))?(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(kl.fns.hd(Parse$unshen$do$ltformulae$gt))) && asJsBool(kl.fns.$eq(new Sym(">>"), kl.fns.hd(kl.fns.hd(Parse$unshen$do$ltformulae$gt))))))?((function () {
                  const Parse$unshen$do$ltformula$gt = Kl.headCall(kl.fns.shen$do$ltformula$gt, [Kl.headCall(kl.fns.shen$dopair, [kl.fns.tl(kl.fns.hd(Parse$unshen$do$ltformulae$gt)), Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltformulae$gt])])]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltformula$gt)]))?(Kl.headCall(kl.fns.shen$dopair, [kl.fns.hd(Parse$unshen$do$ltformula$gt), Kl.headCall(kl.fns.shen$dosequent, [Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltformulae$gt]), Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltformula$gt])])])):(Kl.headCall(kl.fns.fail, []));
                })()):(Kl.headCall(kl.fns.fail, []))):(Kl.headCall(kl.fns.fail, []));
                })();
                    return asJsBool(kl.fns.$eq(YaccParse_1, Kl.headCall(kl.fns.fail, [])))?((function () {
                  const Parse$unshen$do$ltformula$gt = Kl.headCall(kl.fns.shen$do$ltformula$gt, [V2655]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltformula$gt)]))?(Kl.tailCall(kl.fns.shen$dopair, [kl.fns.hd(Parse$unshen$do$ltformula$gt), Kl.headCall(kl.fns.shen$dosequent, [null, Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltformula$gt])])])):(Kl.tailCall(kl.fns.fail, []));
                })()):(YaccParse_1);
                })()):(YaccParse);
                })();
                    });

kl.defun("shen.<conclusion>", 1, function (V2657) {
                      return (function () {
                  const YaccParse = (function () {
                  const Parse$unshen$do$ltformulae$gt = Kl.headCall(kl.fns.shen$do$ltformulae$gt, [V2657]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltformulae$gt)]))?(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(kl.fns.hd(Parse$unshen$do$ltformulae$gt))) && asJsBool(kl.fns.$eq(new Sym(">>"), kl.fns.hd(kl.fns.hd(Parse$unshen$do$ltformulae$gt))))))?((function () {
                  const Parse$unshen$do$ltformula$gt = Kl.headCall(kl.fns.shen$do$ltformula$gt, [Kl.headCall(kl.fns.shen$dopair, [kl.fns.tl(kl.fns.hd(Parse$unshen$do$ltformulae$gt)), Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltformulae$gt])])]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltformula$gt)]))?((function () {
                  const Parse$unshen$do$ltsemicolon_symbol$gt = Kl.headCall(kl.fns.shen$do$ltsemicolon_symbol$gt, [Parse$unshen$do$ltformula$gt]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltsemicolon_symbol$gt)]))?(Kl.headCall(kl.fns.shen$dopair, [kl.fns.hd(Parse$unshen$do$ltsemicolon_symbol$gt), Kl.headCall(kl.fns.shen$dosequent, [Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltformulae$gt]), Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltformula$gt])])])):(Kl.headCall(kl.fns.fail, []));
                })()):(Kl.headCall(kl.fns.fail, []));
                })()):(Kl.headCall(kl.fns.fail, []))):(Kl.headCall(kl.fns.fail, []));
                })();
                    return asJsBool(kl.fns.$eq(YaccParse, Kl.headCall(kl.fns.fail, [])))?((function () {
                  const Parse$unshen$do$ltformula$gt = Kl.headCall(kl.fns.shen$do$ltformula$gt, [V2657]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltformula$gt)]))?((function () {
                  const Parse$unshen$do$ltsemicolon_symbol$gt = Kl.headCall(kl.fns.shen$do$ltsemicolon_symbol$gt, [Parse$unshen$do$ltformula$gt]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltsemicolon_symbol$gt)]))?(Kl.tailCall(kl.fns.shen$dopair, [kl.fns.hd(Parse$unshen$do$ltsemicolon_symbol$gt), Kl.headCall(kl.fns.shen$dosequent, [null, Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltformula$gt])])])):(Kl.tailCall(kl.fns.fail, []));
                })()):(Kl.tailCall(kl.fns.fail, []));
                })()):(YaccParse);
                })();
                    });

kl.defun("shen.sequent", 2, function (V2660, V2661) {
                      return Kl.tailCall(kl.fns.$atp, [V2660, V2661]);
                    });

kl.defun("shen.<formulae>", 1, function (V2663) {
                      return (function () {
                  const YaccParse = (function () {
                  const Parse$unshen$do$ltformula$gt = Kl.headCall(kl.fns.shen$do$ltformula$gt, [V2663]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltformula$gt)]))?((function () {
                  const Parse$unshen$do$ltcomma_symbol$gt = Kl.headCall(kl.fns.shen$do$ltcomma_symbol$gt, [Parse$unshen$do$ltformula$gt]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltcomma_symbol$gt)]))?((function () {
                  const Parse$unshen$do$ltformulae$gt = Kl.headCall(kl.fns.shen$do$ltformulae$gt, [Parse$unshen$do$ltcomma_symbol$gt]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltformulae$gt)]))?(Kl.headCall(kl.fns.shen$dopair, [kl.fns.hd(Parse$unshen$do$ltformulae$gt), kl.fns.cons(Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltformula$gt]), Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltformulae$gt]))])):(Kl.headCall(kl.fns.fail, []));
                })()):(Kl.headCall(kl.fns.fail, []));
                })()):(Kl.headCall(kl.fns.fail, []));
                })();
                    return asJsBool(kl.fns.$eq(YaccParse, Kl.headCall(kl.fns.fail, [])))?((function () {
                  const YaccParse_1 = (function () {
                  const Parse$unshen$do$ltformula$gt = Kl.headCall(kl.fns.shen$do$ltformula$gt, [V2663]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltformula$gt)]))?(Kl.headCall(kl.fns.shen$dopair, [kl.fns.hd(Parse$unshen$do$ltformula$gt), kl.fns.cons(Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltformula$gt]), null)])):(Kl.headCall(kl.fns.fail, []));
                })();
                    return asJsBool(kl.fns.$eq(YaccParse_1, Kl.headCall(kl.fns.fail, [])))?((function () {
                  const Parse$un$lte$gt = Kl.headCall(kl.fns.$lte$gt, [V2663]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$un$lte$gt)]))?(Kl.tailCall(kl.fns.shen$dopair, [kl.fns.hd(Parse$un$lte$gt), null])):(Kl.tailCall(kl.fns.fail, []));
                })()):(YaccParse_1);
                })()):(YaccParse);
                })();
                    });

kl.defun("shen.<comma-symbol>", 1, function (V2665) {
                      return asJsBool(kl.fns.cons$qu(kl.fns.hd(V2665)))?((function () {
                  const Parse$unX = kl.fns.hd(kl.fns.hd(V2665));
                    return asJsBool(kl.fns.$eq(Parse$unX, kl.fns.intern(",")))?(Kl.tailCall(kl.fns.shen$dopair, [kl.fns.hd(Kl.headCall(kl.fns.shen$dopair, [kl.fns.tl(kl.fns.hd(V2665)), Kl.headCall(kl.fns.shen$dohdtl, [V2665])])), new Sym("shen.skip")])):(Kl.tailCall(kl.fns.fail, []));
                })()):(Kl.tailCall(kl.fns.fail, []));
                    });

kl.defun("shen.<formula>", 1, function (V2667) {
                      return (function () {
                  const YaccParse = (function () {
                  const Parse$unshen$do$ltexpr$gt = Kl.headCall(kl.fns.shen$do$ltexpr$gt, [V2667]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltexpr$gt)]))?(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(kl.fns.hd(Parse$unshen$do$ltexpr$gt))) && asJsBool(kl.fns.$eq(new Sym(":"), kl.fns.hd(kl.fns.hd(Parse$unshen$do$ltexpr$gt))))))?((function () {
                  const Parse$unshen$do$lttype$gt = Kl.headCall(kl.fns.shen$do$lttype$gt, [Kl.headCall(kl.fns.shen$dopair, [kl.fns.tl(kl.fns.hd(Parse$unshen$do$ltexpr$gt)), Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltexpr$gt])])]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$lttype$gt)]))?(Kl.headCall(kl.fns.shen$dopair, [kl.fns.hd(Parse$unshen$do$lttype$gt), kl.fns.cons(Kl.headCall(kl.fns.shen$docurry, [Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltexpr$gt])]), kl.fns.cons(new Sym(":"), kl.fns.cons(Kl.headCall(kl.fns.shen$dodemodulate, [Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$lttype$gt])]), null)))])):(Kl.headCall(kl.fns.fail, []));
                })()):(Kl.headCall(kl.fns.fail, []))):(Kl.headCall(kl.fns.fail, []));
                })();
                    return asJsBool(kl.fns.$eq(YaccParse, Kl.headCall(kl.fns.fail, [])))?((function () {
                  const Parse$unshen$do$ltexpr$gt = Kl.headCall(kl.fns.shen$do$ltexpr$gt, [V2667]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltexpr$gt)]))?(Kl.tailCall(kl.fns.shen$dopair, [kl.fns.hd(Parse$unshen$do$ltexpr$gt), Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltexpr$gt])])):(Kl.tailCall(kl.fns.fail, []));
                })()):(YaccParse);
                })();
                    });

kl.defun("shen.<type>", 1, function (V2669) {
                      return (function () {
                  const Parse$unshen$do$ltexpr$gt = Kl.headCall(kl.fns.shen$do$ltexpr$gt, [V2669]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltexpr$gt)]))?(Kl.tailCall(kl.fns.shen$dopair, [kl.fns.hd(Parse$unshen$do$ltexpr$gt), Kl.headCall(kl.fns.shen$docurry_type, [Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltexpr$gt])])])):(Kl.tailCall(kl.fns.fail, []));
                })();
                    });

kl.defun("shen.<doubleunderline>", 1, function (V2671) {
                      return asJsBool(kl.fns.cons$qu(kl.fns.hd(V2671)))?((function () {
                  const Parse$unX = kl.fns.hd(kl.fns.hd(V2671));
                    return asJsBool(Kl.headCall(kl.fns.shen$dodoubleunderline$qu, [Parse$unX]))?(Kl.tailCall(kl.fns.shen$dopair, [kl.fns.hd(Kl.headCall(kl.fns.shen$dopair, [kl.fns.tl(kl.fns.hd(V2671)), Kl.headCall(kl.fns.shen$dohdtl, [V2671])])), Parse$unX])):(Kl.tailCall(kl.fns.fail, []));
                })()):(Kl.tailCall(kl.fns.fail, []));
                    });

kl.defun("shen.<singleunderline>", 1, function (V2673) {
                      return asJsBool(kl.fns.cons$qu(kl.fns.hd(V2673)))?((function () {
                  const Parse$unX = kl.fns.hd(kl.fns.hd(V2673));
                    return asJsBool(Kl.headCall(kl.fns.shen$dosingleunderline$qu, [Parse$unX]))?(Kl.tailCall(kl.fns.shen$dopair, [kl.fns.hd(Kl.headCall(kl.fns.shen$dopair, [kl.fns.tl(kl.fns.hd(V2673)), Kl.headCall(kl.fns.shen$dohdtl, [V2673])])), Parse$unX])):(Kl.tailCall(kl.fns.fail, []));
                })()):(Kl.tailCall(kl.fns.fail, []));
                    });

kl.defun("shen.singleunderline?", 1, function (V2675) {
                      return asKlBool(asJsBool(Kl.headCall(kl.fns.symbol$qu, [V2675])) && asJsBool(Kl.headCall(kl.fns.shen$dosh$qu, [kl.fns.str(V2675)])));
                    });

kl.defun("shen.sh?", 1, function (V2677) {
                      return asJsBool(kl.fns.$eq("_", V2677))?(klTrue):(asKlBool(asJsBool(kl.fns.$eq(kl.fns.pos(V2677, 0), "_")) && asJsBool(Kl.headCall(kl.fns.shen$dosh$qu, [kl.fns.tlstr(V2677)]))));
                    });

kl.defun("shen.doubleunderline?", 1, function (V2679) {
                      return asKlBool(asJsBool(Kl.headCall(kl.fns.symbol$qu, [V2679])) && asJsBool(Kl.headCall(kl.fns.shen$dodh$qu, [kl.fns.str(V2679)])));
                    });

kl.defun("shen.dh?", 1, function (V2681) {
                      return asJsBool(kl.fns.$eq("=", V2681))?(klTrue):(asKlBool(asJsBool(kl.fns.$eq(kl.fns.pos(V2681, 0), "=")) && asJsBool(Kl.headCall(kl.fns.shen$dodh$qu, [kl.fns.tlstr(V2681)]))));
                    });

kl.defun("shen.process-datatype", 2, function (V2684, V2685) {
                      return Kl.tailCall(kl.fns.shen$doremember_datatype, [Kl.headCall(kl.fns.shen$dos_prolog, [Kl.headCall(kl.fns.shen$dorules_$gthorn_clauses, [V2684, V2685])])]);
                    });

kl.defun("shen.remember-datatype", 1, function (V2691) {
                      return asJsBool(kl.fns.cons$qu(V2691))?((function () {
                      kl.symbols.shen$do$stdatatypes$st = Kl.headCall(kl.fns.adjoin, [kl.fns.hd(V2691), kl.fns.value(new Sym("shen.*datatypes*"))]);
kl.symbols.shen$do$stalldatatypes$st = Kl.headCall(kl.fns.adjoin, [kl.fns.hd(V2691), kl.fns.value(new Sym("shen.*alldatatypes*"))]);
                      return kl.fns.hd(V2691);
                    })()):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.remember-datatype")]));
                    });

kl.defun("shen.rules->horn-clauses", 2, function (V2696, V2697) {
                      return asJsBool(kl.fns.$eq(null, V2697))?(null):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V2697)) && asJsBool(Kl.headCall(kl.fns.tuple$qu, [kl.fns.hd(V2697)])) && asJsBool(kl.fns.$eq(new Sym("shen.single"), Kl.headCall(kl.fns.fst, [kl.fns.hd(V2697)])))))?(kl.fns.cons(Kl.headCall(kl.fns.shen$dorule_$gthorn_clause, [V2696, Kl.headCall(kl.fns.snd, [kl.fns.hd(V2697)])]), Kl.headCall(kl.fns.shen$dorules_$gthorn_clauses, [V2696, kl.fns.tl(V2697)]))):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V2697)) && asJsBool(Kl.headCall(kl.fns.tuple$qu, [kl.fns.hd(V2697)])) && asJsBool(kl.fns.$eq(new Sym("shen.double"), Kl.headCall(kl.fns.fst, [kl.fns.hd(V2697)])))))?(Kl.tailCall(kl.fns.shen$dorules_$gthorn_clauses, [V2696, Kl.headCall(kl.fns.append, [Kl.headCall(kl.fns.shen$dodouble_$gtsingles, [Kl.headCall(kl.fns.snd, [kl.fns.hd(V2697)])]), kl.fns.tl(V2697)])])):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.rules->horn-clauses")]))));
                    });

kl.defun("shen.double->singles", 1, function (V2699) {
                      return kl.fns.cons(Kl.headCall(kl.fns.shen$doright_rule, [V2699]), kl.fns.cons(Kl.headCall(kl.fns.shen$doleft_rule, [V2699]), null));
                    });

kl.defun("shen.right-rule", 1, function (V2701) {
                      return Kl.tailCall(kl.fns.$atp, [new Sym("shen.single"), V2701]);
                    });

kl.defun("shen.left-rule", 1, function (V2703) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V2703)) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V2703))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(V2703)))) && asJsBool(Kl.headCall(kl.fns.tuple$qu, [kl.fns.hd(kl.fns.tl(kl.fns.tl(V2703)))])) && asJsBool(kl.fns.$eq(null, Kl.headCall(kl.fns.fst, [kl.fns.hd(kl.fns.tl(kl.fns.tl(V2703)))]))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.tl(V2703)))))))?((function () {
                  const Q = Kl.headCall(kl.fns.gensym, [new Sym("Qv")]);
                    const NewConclusion = Kl.headCall(kl.fns.$atp, [kl.fns.cons(Kl.headCall(kl.fns.snd, [kl.fns.hd(kl.fns.tl(kl.fns.tl(V2703)))]), null), Q]);
                    const NewPremises = kl.fns.cons(Kl.headCall(kl.fns.$atp, [Kl.headCall(kl.fns.map, [Kl.setArity("shen.left-rule_lambda", 1, function (X) {
                      return Kl.tailCall(kl.fns.shen$doright_$gtleft, [X]);
                    }), kl.fns.hd(kl.fns.tl(V2703))]), Q]), null);
                    return Kl.tailCall(kl.fns.$atp, [new Sym("shen.single"), kl.fns.cons(kl.fns.hd(V2703), kl.fns.cons(NewPremises, kl.fns.cons(NewConclusion, null)))]);
                })()):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.left-rule")]));
                    });

kl.defun("shen.right->left", 1, function (V2709) {
                      return asJsBool(asKlBool(asJsBool(Kl.headCall(kl.fns.tuple$qu, [V2709])) && asJsBool(kl.fns.$eq(null, Kl.headCall(kl.fns.fst, [V2709])))))?(Kl.tailCall(kl.fns.snd, [V2709])):(kl.fns.simple_error("syntax error with ==========\n"));
                    });

kl.defun("shen.rule->horn-clause", 2, function (V2712, V2713) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V2713)) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V2713))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(V2713)))) && asJsBool(Kl.headCall(kl.fns.tuple$qu, [kl.fns.hd(kl.fns.tl(kl.fns.tl(V2713)))])) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.tl(V2713)))))))?(kl.fns.cons(Kl.headCall(kl.fns.shen$dorule_$gthorn_clause_head, [V2712, Kl.headCall(kl.fns.snd, [kl.fns.hd(kl.fns.tl(kl.fns.tl(V2713)))])]), kl.fns.cons(new Sym(":-"), kl.fns.cons(Kl.headCall(kl.fns.shen$dorule_$gthorn_clause_body, [kl.fns.hd(V2713), kl.fns.hd(kl.fns.tl(V2713)), Kl.headCall(kl.fns.fst, [kl.fns.hd(kl.fns.tl(kl.fns.tl(V2713)))])]), null)))):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.rule->horn-clause")]));
                    });

kl.defun("shen.rule->horn-clause-head", 2, function (V2716, V2717) {
                      return kl.fns.cons(V2716, kl.fns.cons(Kl.headCall(kl.fns.shen$domode_ify, [V2717]), kl.fns.cons(new Sym("Context_1957"), null)));
                    });

kl.defun("shen.mode-ify", 1, function (V2719) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V2719)) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V2719))) && asJsBool(kl.fns.$eq(new Sym(":"), kl.fns.hd(kl.fns.tl(V2719)))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(V2719)))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.tl(V2719)))))))?(kl.fns.cons(new Sym("mode"), kl.fns.cons(kl.fns.cons(kl.fns.hd(V2719), kl.fns.cons(new Sym(":"), kl.fns.cons(kl.fns.cons(new Sym("mode"), kl.fns.cons(kl.fns.hd(kl.fns.tl(kl.fns.tl(V2719))), kl.fns.cons(new Sym("+"), null))), null))), kl.fns.cons(new Sym("-"), null)))):(V2719);
                    });

kl.defun("shen.rule->horn-clause-body", 3, function (V2723, V2724, V2725) {
                      return (function () {
                  const Variables = Kl.headCall(kl.fns.map, [Kl.setArity("shen.rule->horn-clause-body_lambda", 1, function (X) {
                      return Kl.tailCall(kl.fns.shen$doextract$unvars, [X]);
                    }), V2725]);
                    const Predicates = Kl.headCall(kl.fns.map, [Kl.setArity("shen.rule->horn-clause-body_lambda", 1, function (X) {
                      return Kl.tailCall(kl.fns.gensym, [new Sym("shen.cl")]);
                    }), V2725]);
                    const SearchLiterals = Kl.headCall(kl.fns.shen$doconstruct_search_literals, [Predicates, Variables, new Sym("Context_1957"), new Sym("Context1_1957")]);
                    const SearchClauses = Kl.headCall(kl.fns.shen$doconstruct_search_clauses, [Predicates, V2725, Variables]);
                    const SideLiterals = Kl.headCall(kl.fns.shen$doconstruct_side_literals, [V2723]);
                    const PremissLiterals = Kl.headCall(kl.fns.map, [Kl.setArity("shen.rule->horn-clause-body_lambda", 1, function (X) {
                      return Kl.tailCall(kl.fns.shen$doconstruct_premiss_literal, [X, Kl.headCall(kl.fns.empty$qu, [V2725])]);
                    }), V2724]);
                    return Kl.tailCall(kl.fns.append, [SearchLiterals, Kl.headCall(kl.fns.append, [SideLiterals, PremissLiterals])]);
                })();
                    });

kl.defun("shen.construct-search-literals", 4, function (V2734, V2735, V2736, V2737) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.$eq(null, V2734)) && asJsBool(kl.fns.$eq(null, V2735))))?(null):(Kl.tailCall(kl.fns.shen$docsl_help, [V2734, V2735, V2736, V2737]));
                    });

kl.defun("shen.csl-help", 4, function (V2744, V2745, V2746, V2747) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.$eq(null, V2744)) && asJsBool(kl.fns.$eq(null, V2745))))?(kl.fns.cons(kl.fns.cons(new Sym("bind"), kl.fns.cons(new Sym("ContextOut_1957"), kl.fns.cons(V2746, null))), null)):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V2744)) && asJsBool(kl.fns.cons$qu(V2745))))?(kl.fns.cons(kl.fns.cons(kl.fns.hd(V2744), kl.fns.cons(V2746, kl.fns.cons(V2747, kl.fns.hd(V2745)))), Kl.headCall(kl.fns.shen$docsl_help, [kl.fns.tl(V2744), kl.fns.tl(V2745), V2747, Kl.headCall(kl.fns.gensym, [new Sym("Context")])]))):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.csl-help")])));
                    });

kl.defun("shen.construct-search-clauses", 3, function (V2751, V2752, V2753) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.$eq(null, V2751)) && asJsBool(kl.fns.$eq(null, V2752)) && asJsBool(kl.fns.$eq(null, V2753))))?(new Sym("shen.skip")):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V2751)) && asJsBool(kl.fns.cons$qu(V2752)) && asJsBool(kl.fns.cons$qu(V2753))))?((function () {
                      Kl.headCall(kl.fns.shen$doconstruct_search_clause, [kl.fns.hd(V2751), kl.fns.hd(V2752), kl.fns.hd(V2753)]);
                      return Kl.tailCall(kl.fns.shen$doconstruct_search_clauses, [kl.fns.tl(V2751), kl.fns.tl(V2752), kl.fns.tl(V2753)]);
                    })()):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.construct-search-clauses")])));
                    });

kl.defun("shen.construct-search-clause", 3, function (V2757, V2758, V2759) {
                      return Kl.tailCall(kl.fns.shen$dos_prolog, [kl.fns.cons(Kl.headCall(kl.fns.shen$doconstruct_base_search_clause, [V2757, V2758, V2759]), kl.fns.cons(Kl.headCall(kl.fns.shen$doconstruct_recursive_search_clause, [V2757, V2758, V2759]), null))]);
                    });

kl.defun("shen.construct-base-search-clause", 3, function (V2763, V2764, V2765) {
                      return kl.fns.cons(kl.fns.cons(V2763, kl.fns.cons(kl.fns.cons(Kl.headCall(kl.fns.shen$domode_ify, [V2764]), new Sym("In_1957")), kl.fns.cons(new Sym("In_1957"), V2765))), kl.fns.cons(new Sym(":-"), kl.fns.cons(null, null)));
                    });

kl.defun("shen.construct-recursive-search-clause", 3, function (V2769, V2770, V2771) {
                      return kl.fns.cons(kl.fns.cons(V2769, kl.fns.cons(kl.fns.cons(new Sym("Assumption_1957"), new Sym("Assumptions_1957")), kl.fns.cons(kl.fns.cons(new Sym("Assumption_1957"), new Sym("Out_1957")), V2771))), kl.fns.cons(new Sym(":-"), kl.fns.cons(kl.fns.cons(kl.fns.cons(V2769, kl.fns.cons(new Sym("Assumptions_1957"), kl.fns.cons(new Sym("Out_1957"), V2771))), null), null)));
                    });

kl.defun("shen.construct-side-literals", 1, function (V2777) {
                      return asJsBool(kl.fns.$eq(null, V2777))?(null):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V2777)) && asJsBool(kl.fns.cons$qu(kl.fns.hd(V2777))) && asJsBool(kl.fns.$eq(new Sym("if"), kl.fns.hd(kl.fns.hd(V2777)))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.hd(V2777)))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.hd(V2777)))))))?(kl.fns.cons(kl.fns.cons(new Sym("when"), kl.fns.tl(kl.fns.hd(V2777))), Kl.headCall(kl.fns.shen$doconstruct_side_literals, [kl.fns.tl(V2777)]))):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V2777)) && asJsBool(kl.fns.cons$qu(kl.fns.hd(V2777))) && asJsBool(kl.fns.$eq(new Sym("let"), kl.fns.hd(kl.fns.hd(V2777)))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.hd(V2777)))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(kl.fns.hd(V2777))))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.hd(V2777))))))))?(kl.fns.cons(kl.fns.cons(new Sym("is"), kl.fns.tl(kl.fns.hd(V2777))), Kl.headCall(kl.fns.shen$doconstruct_side_literals, [kl.fns.tl(V2777)]))):(asJsBool(kl.fns.cons$qu(V2777))?(Kl.tailCall(kl.fns.shen$doconstruct_side_literals, [kl.fns.tl(V2777)])):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.construct-side-literals")])))));
                    });

kl.defun("shen.construct-premiss-literal", 2, function (V2784, V2785) {
                      return asJsBool(Kl.headCall(kl.fns.tuple$qu, [V2784]))?(kl.fns.cons(new Sym("shen.t*"), kl.fns.cons(Kl.headCall(kl.fns.shen$dorecursive$uncons$unform, [Kl.headCall(kl.fns.snd, [V2784])]), kl.fns.cons(Kl.headCall(kl.fns.shen$doconstruct_context, [V2785, Kl.headCall(kl.fns.fst, [V2784])]), null)))):(asJsBool(kl.fns.$eq(new Sym("!"), V2784))?(kl.fns.cons(new Sym("cut"), kl.fns.cons(new Sym("Throwcontrol"), null))):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.construct-premiss-literal")])));
                    });

kl.defun("shen.construct-context", 2, function (V2788, V2789) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.$eq(klTrue, V2788)) && asJsBool(kl.fns.$eq(null, V2789))))?(new Sym("Context_1957")):(asJsBool(asKlBool(asJsBool(kl.fns.$eq(klFalse, V2788)) && asJsBool(kl.fns.$eq(null, V2789))))?(new Sym("ContextOut_1957")):(asJsBool(kl.fns.cons$qu(V2789))?(kl.fns.cons(new Sym("cons"), kl.fns.cons(Kl.headCall(kl.fns.shen$dorecursive$uncons$unform, [kl.fns.hd(V2789)]), kl.fns.cons(Kl.headCall(kl.fns.shen$doconstruct_context, [V2788, kl.fns.tl(V2789)]), null)))):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.construct-context")]))));
                    });

kl.defun("shen.recursive_cons_form", 1, function (V2791) {
                      return asJsBool(kl.fns.cons$qu(V2791))?(kl.fns.cons(new Sym("cons"), kl.fns.cons(Kl.headCall(kl.fns.shen$dorecursive$uncons$unform, [kl.fns.hd(V2791)]), kl.fns.cons(Kl.headCall(kl.fns.shen$dorecursive$uncons$unform, [kl.fns.tl(V2791)]), null)))):(V2791);
                    });

kl.defun("preclude", 1, function (V2793) {
                      return Kl.tailCall(kl.fns.shen$dopreclude_h, [Kl.headCall(kl.fns.map, [Kl.setArity("preclude_lambda", 1, function (X) {
                      return Kl.tailCall(kl.fns.shen$dointern_type, [X]);
                    }), V2793])]);
                    });

kl.defun("shen.preclude-h", 1, function (V2795) {
                      return (function () {
                  const FilterDatatypes = kl.symbols.shen$do$stdatatypes$st = Kl.headCall(kl.fns.difference, [kl.fns.value(new Sym("shen.*datatypes*")), V2795]);
                    return kl.fns.value(new Sym("shen.*datatypes*"));
                })();
                    });

kl.defun("include", 1, function (V2797) {
                      return Kl.tailCall(kl.fns.shen$doinclude_h, [Kl.headCall(kl.fns.map, [Kl.setArity("include_lambda", 1, function (X) {
                      return Kl.tailCall(kl.fns.shen$dointern_type, [X]);
                    }), V2797])]);
                    });

kl.defun("shen.include-h", 1, function (V2799) {
                      return (function () {
                  const ValidTypes = Kl.headCall(kl.fns.intersection, [V2799, kl.fns.value(new Sym("shen.*alldatatypes*"))]);
                    const NewDatatypes = kl.symbols.shen$do$stdatatypes$st = Kl.headCall(kl.fns.union, [ValidTypes, kl.fns.value(new Sym("shen.*datatypes*"))]);
                    return kl.fns.value(new Sym("shen.*datatypes*"));
                })();
                    });

kl.defun("preclude-all-but", 1, function (V2801) {
                      return Kl.tailCall(kl.fns.shen$dopreclude_h, [Kl.headCall(kl.fns.difference, [kl.fns.value(new Sym("shen.*alldatatypes*")), Kl.headCall(kl.fns.map, [Kl.setArity("preclude-all-but_lambda", 1, function (X) {
                      return Kl.tailCall(kl.fns.shen$dointern_type, [X]);
                    }), V2801])])]);
                    });

kl.defun("include-all-but", 1, function (V2803) {
                      return Kl.tailCall(kl.fns.shen$doinclude_h, [Kl.headCall(kl.fns.difference, [kl.fns.value(new Sym("shen.*alldatatypes*")), Kl.headCall(kl.fns.map, [Kl.setArity("include-all-but_lambda", 1, function (X) {
                      return Kl.tailCall(kl.fns.shen$dointern_type, [X]);
                    }), V2803])])]);
                    });

kl.defun("shen.synonyms-help", 1, function (V2809) {
                      return asJsBool(kl.fns.$eq(null, V2809))?(Kl.tailCall(kl.fns.shen$doupdate_demodulation_function, [kl.fns.value(new Sym("shen.*tc*")), Kl.headCall(kl.fns.mapcan, [Kl.setArity("shen.synonyms-help_lambda", 1, function (X) {
                      return Kl.tailCall(kl.fns.shen$dodemod_rule, [X]);
                    }), kl.fns.value(new Sym("shen.*synonyms*"))])])):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V2809)) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V2809)))))?((function () {
                  const Vs = Kl.headCall(kl.fns.difference, [Kl.headCall(kl.fns.shen$doextract$unvars, [kl.fns.hd(kl.fns.tl(V2809))]), Kl.headCall(kl.fns.shen$doextract$unvars, [kl.fns.hd(V2809)])]);
                    return asJsBool(Kl.headCall(kl.fns.empty$qu, [Vs]))?((function () {
                      Kl.headCall(kl.fns.shen$dopushnew, [kl.fns.cons(kl.fns.hd(V2809), kl.fns.cons(kl.fns.hd(kl.fns.tl(V2809)), null)), new Sym("shen.*synonyms*")]);
                      return Kl.tailCall(kl.fns.shen$dosynonyms_help, [kl.fns.tl(kl.fns.tl(V2809))]);
                    })()):(Kl.tailCall(kl.fns.shen$dofree$unvariable$unwarnings, [kl.fns.hd(kl.fns.tl(V2809)), Vs]));
                })()):(kl.fns.simple_error("odd number of synonyms\n")));
                    });

kl.defun("shen.pushnew", 2, function (V2812, V2813) {
                      return asJsBool(Kl.headCall(kl.fns.element$qu, [V2812, kl.fns.value(V2813)]))?(kl.fns.value(V2813)):(kl.fns.set(V2813, kl.fns.cons(V2812, kl.fns.value(V2813))));
                    });

kl.defun("shen.demod-rule", 1, function (V2815) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V2815)) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V2815))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(V2815))))))?(kl.fns.cons(Kl.headCall(kl.fns.shen$dorcons$unform, [kl.fns.hd(V2815)]), kl.fns.cons(new Sym("->"), kl.fns.cons(Kl.headCall(kl.fns.shen$dorcons$unform, [kl.fns.hd(kl.fns.tl(V2815))]), null)))):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.demod-rule")]));
                    });

kl.defun("shen.lambda-of-defun", 1, function (V2821) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V2821)) && asJsBool(kl.fns.$eq(new Sym("defun"), kl.fns.hd(V2821))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V2821))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(V2821)))) && asJsBool(kl.fns.cons$qu(kl.fns.hd(kl.fns.tl(kl.fns.tl(V2821))))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.hd(kl.fns.tl(kl.fns.tl(V2821)))))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(kl.fns.tl(V2821))))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.tl(V2821))))))))?(Kl.tailCall(kl.fns.eval, [kl.fns.cons(new Sym("/."), kl.fns.cons(kl.fns.hd(kl.fns.hd(kl.fns.tl(kl.fns.tl(V2821)))), kl.fns.tl(kl.fns.tl(kl.fns.tl(V2821)))))])):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.lambda-of-defun")]));
                    });

kl.defun("shen.update-demodulation-function", 2, function (V2824, V2825) {
                      return (function () {
                      Kl.headCall(kl.fns.tc, [new Sym("-")]);
kl.symbols.shen$do$stdemodulation_function$st = Kl.headCall(kl.fns.shen$dolambda_of_defun, [Kl.headCall(kl.fns.shen$doelim_def, [kl.fns.cons(new Sym("define"), kl.fns.cons(new Sym("shen.demod"), Kl.headCall(kl.fns.append, [V2825, Kl.headCall(kl.fns.shen$dodefault_rule, [])])))])]);
asJsBool(V2824)?(Kl.headCall(kl.fns.tc, [new Sym("+")])):(new Sym("shen.skip"));
                      return new Sym("synonyms");
                    })();
                    });

kl.defun("shen.default-rule", 0, function () {
                      return kl.fns.cons(new Sym("X"), kl.fns.cons(new Sym("->"), kl.fns.cons(new Sym("X"), null)));
                    });

kl.defun("shen.yacc", 1, function (V4275) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V4275)) && asJsBool(kl.fns.$eq(new Sym("defcc"), kl.fns.hd(V4275))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V4275)))))?(Kl.tailCall(kl.fns.shen$doyacc_$gtshen, [kl.fns.hd(kl.fns.tl(V4275)), kl.fns.tl(kl.fns.tl(V4275))])):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.yacc")]));
                    });

kl.defun("shen.yacc->shen", 2, function (V4278, V4279) {
                      return (function () {
                  const CCRules = Kl.headCall(kl.fns.shen$dosplit$uncc$unrules, [klTrue, V4279, null]);
                    const CCBody = Kl.headCall(kl.fns.map, [Kl.setArity("shen.yacc->shen_lambda", 1, function (X) {
                      return Kl.tailCall(kl.fns.shen$docc$unbody, [X]);
                    }), CCRules]);
                    const YaccCases = Kl.headCall(kl.fns.shen$doyacc$uncases, [CCBody]);
                    return kl.fns.cons(new Sym("define"), kl.fns.cons(V4278, kl.fns.cons(new Sym("Stream"), kl.fns.cons(new Sym("->"), kl.fns.cons(Kl.headCall(kl.fns.shen$dokill_code, [YaccCases]), null)))));
                })();
                    });

kl.defun("shen.kill-code", 1, function (V4281) {
                      return asJsBool(kl.fns.$gt(Kl.headCall(kl.fns.occurrences, [new Sym("kill"), V4281]), 0))?(kl.fns.cons(new Sym("trap-error"), kl.fns.cons(V4281, kl.fns.cons(kl.fns.cons(new Sym("lambda"), kl.fns.cons(new Sym("E"), kl.fns.cons(kl.fns.cons(new Sym("shen.analyse-kill"), kl.fns.cons(new Sym("E"), null)), null))), null)))):(V4281);
                    });

kl.defun("kill", 0, function () {
                      return kl.fns.simple_error("yacc kill");
                    });

kl.defun("shen.analyse-kill", 1, function (V4283) {
                      return (function () {
                  const String = kl.fns.error_to_string(V4283);
                    return asJsBool(kl.fns.$eq(String, "yacc kill"))?(Kl.tailCall(kl.fns.fail, [])):(V4283);
                })();
                    });

kl.defun("shen.split_cc_rules", 3, function (V4289, V4290, V4291) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.$eq(null, V4290)) && asJsBool(kl.fns.$eq(null, V4291))))?(null):(asJsBool(kl.fns.$eq(null, V4290))?(kl.fns.cons(Kl.headCall(kl.fns.shen$dosplit$uncc$unrule, [V4289, Kl.headCall(kl.fns.reverse, [V4291]), null]), null)):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V4290)) && asJsBool(kl.fns.$eq(new Sym(";"), kl.fns.hd(V4290)))))?(kl.fns.cons(Kl.headCall(kl.fns.shen$dosplit$uncc$unrule, [V4289, Kl.headCall(kl.fns.reverse, [V4291]), null]), Kl.headCall(kl.fns.shen$dosplit$uncc$unrules, [V4289, kl.fns.tl(V4290), null]))):(asJsBool(kl.fns.cons$qu(V4290))?(Kl.tailCall(kl.fns.shen$dosplit$uncc$unrules, [V4289, kl.fns.tl(V4290), kl.fns.cons(kl.fns.hd(V4290), V4291)])):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.split_cc_rules")])))));
                    });

kl.defun("shen.split_cc_rule", 3, function (V4299, V4300, V4301) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V4300)) && asJsBool(kl.fns.$eq(new Sym(":="), kl.fns.hd(V4300))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V4300))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(V4300))))))?(kl.fns.cons(Kl.headCall(kl.fns.reverse, [V4301]), kl.fns.tl(V4300))):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V4300)) && asJsBool(kl.fns.$eq(new Sym(":="), kl.fns.hd(V4300))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V4300))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(V4300)))) && asJsBool(kl.fns.$eq(new Sym("where"), kl.fns.hd(kl.fns.tl(kl.fns.tl(V4300))))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(kl.fns.tl(V4300))))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.tl(V4300))))))))?(kl.fns.cons(Kl.headCall(kl.fns.reverse, [V4301]), kl.fns.cons(kl.fns.cons(new Sym("where"), kl.fns.cons(kl.fns.hd(kl.fns.tl(kl.fns.tl(kl.fns.tl(V4300)))), kl.fns.cons(kl.fns.hd(kl.fns.tl(V4300)), null))), null))):(asJsBool(kl.fns.$eq(null, V4300))?((function () {
                      Kl.headCall(kl.fns.shen$dosemantic_completion_warning, [V4299, V4301]);
                      return Kl.tailCall(kl.fns.shen$dosplit$uncc$unrule, [V4299, kl.fns.cons(new Sym(":="), kl.fns.cons(Kl.headCall(kl.fns.shen$dodefault$unsemantics, [Kl.headCall(kl.fns.reverse, [V4301])]), null)), V4301]);
                    })()):(asJsBool(kl.fns.cons$qu(V4300))?(Kl.tailCall(kl.fns.shen$dosplit$uncc$unrule, [V4299, kl.fns.tl(V4300), kl.fns.cons(kl.fns.hd(V4300), V4301)])):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.split_cc_rule")])))));
                    });

kl.defun("shen.semantic-completion-warning", 2, function (V4312, V4313) {
                      return asJsBool(kl.fns.$eq(klTrue, V4312))?((function () {
                      Kl.headCall(kl.fns.shen$doprhush, ["warning: ", Kl.headCall(kl.fns.stoutput, [])]);
Kl.headCall(kl.fns.shen$dofor_each, [Kl.setArity("shen.semantic-completion-warning_lambda", 1, function (X) {
                      return Kl.tailCall(kl.fns.shen$doprhush, [Kl.headCall(kl.fns.shen$doapp, [X, " ", new Sym("shen.a")]), Kl.headCall(kl.fns.stoutput, [])]);
                    }), Kl.headCall(kl.fns.reverse, [V4313])]);
                      return Kl.tailCall(kl.fns.shen$doprhush, ["has no semantics.\n", Kl.headCall(kl.fns.stoutput, [])]);
                    })()):(new Sym("shen.skip"));
                    });

kl.defun("shen.default_semantics", 1, function (V4315) {
                      return asJsBool(kl.fns.$eq(null, V4315))?(null):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V4315)) && asJsBool(kl.fns.$eq(null, kl.fns.tl(V4315))) && asJsBool(Kl.headCall(kl.fns.shen$dogrammar$unsymbol$qu, [kl.fns.hd(V4315)]))))?(kl.fns.hd(V4315)):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V4315)) && asJsBool(Kl.headCall(kl.fns.shen$dogrammar$unsymbol$qu, [kl.fns.hd(V4315)]))))?(kl.fns.cons(new Sym("append"), kl.fns.cons(kl.fns.hd(V4315), kl.fns.cons(Kl.headCall(kl.fns.shen$dodefault$unsemantics, [kl.fns.tl(V4315)]), null)))):(asJsBool(kl.fns.cons$qu(V4315))?(kl.fns.cons(new Sym("cons"), kl.fns.cons(kl.fns.hd(V4315), kl.fns.cons(Kl.headCall(kl.fns.shen$dodefault$unsemantics, [kl.fns.tl(V4315)]), null)))):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.default_semantics")])))));
                    });

kl.defun("shen.grammar_symbol?", 1, function (V4317) {
                      return asKlBool(asJsBool(Kl.headCall(kl.fns.symbol$qu, [V4317])) && asJsBool((function () {
                  const Cs = Kl.headCall(kl.fns.shen$dostrip_pathname, [Kl.headCall(kl.fns.explode, [V4317])]);
                    return asKlBool(asJsBool(kl.fns.$eq(kl.fns.hd(Cs), "<")) && asJsBool(kl.fns.$eq(kl.fns.hd(Kl.headCall(kl.fns.reverse, [Cs])), ">")));
                })()));
                    });

kl.defun("shen.yacc_cases", 1, function (V4319) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V4319)) && asJsBool(kl.fns.$eq(null, kl.fns.tl(V4319)))))?(kl.fns.hd(V4319)):(asJsBool(kl.fns.cons$qu(V4319))?((function () {
                  const P = new Sym("YaccParse");
                    return kl.fns.cons(new Sym("let"), kl.fns.cons(P, kl.fns.cons(kl.fns.hd(V4319), kl.fns.cons(kl.fns.cons(new Sym("if"), kl.fns.cons(kl.fns.cons(new Sym("="), kl.fns.cons(P, kl.fns.cons(kl.fns.cons(new Sym("fail"), null), null))), kl.fns.cons(Kl.headCall(kl.fns.shen$doyacc$uncases, [kl.fns.tl(V4319)]), kl.fns.cons(P, null)))), null))));
                })()):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.yacc_cases")])));
                    });

kl.defun("shen.cc_body", 1, function (V4321) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V4321)) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V4321))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(V4321))))))?(Kl.tailCall(kl.fns.shen$dosyntax, [kl.fns.hd(V4321), new Sym("Stream"), kl.fns.hd(kl.fns.tl(V4321))])):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.cc_body")]));
                    });

kl.defun("shen.syntax", 3, function (V4325, V4326, V4327) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.$eq(null, V4325)) && asJsBool(kl.fns.cons$qu(V4327)) && asJsBool(kl.fns.$eq(new Sym("where"), kl.fns.hd(V4327))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V4327))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(V4327)))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.tl(V4327)))))))?(kl.fns.cons(new Sym("if"), kl.fns.cons(Kl.headCall(kl.fns.shen$dosemantics, [kl.fns.hd(kl.fns.tl(V4327))]), kl.fns.cons(kl.fns.cons(new Sym("shen.pair"), kl.fns.cons(kl.fns.cons(new Sym("hd"), kl.fns.cons(V4326, null)), kl.fns.cons(Kl.headCall(kl.fns.shen$dosemantics, [kl.fns.hd(kl.fns.tl(kl.fns.tl(V4327)))]), null))), kl.fns.cons(kl.fns.cons(new Sym("fail"), null), null))))):(asJsBool(kl.fns.$eq(null, V4325))?(kl.fns.cons(new Sym("shen.pair"), kl.fns.cons(kl.fns.cons(new Sym("hd"), kl.fns.cons(V4326, null)), kl.fns.cons(Kl.headCall(kl.fns.shen$dosemantics, [V4327]), null)))):(asJsBool(kl.fns.cons$qu(V4325))?(asJsBool(Kl.headCall(kl.fns.shen$dogrammar$unsymbol$qu, [kl.fns.hd(V4325)]))?(Kl.tailCall(kl.fns.shen$dorecursive$undescent, [V4325, V4326, V4327])):(asJsBool(Kl.headCall(kl.fns.variable$qu, [kl.fns.hd(V4325)]))?(Kl.tailCall(kl.fns.shen$dovariable_match, [V4325, V4326, V4327])):(asJsBool(Kl.headCall(kl.fns.shen$dojump$unstream$qu, [kl.fns.hd(V4325)]))?(Kl.tailCall(kl.fns.shen$dojump$unstream, [V4325, V4326, V4327])):(asJsBool(Kl.headCall(kl.fns.shen$doterminal$qu, [kl.fns.hd(V4325)]))?(Kl.tailCall(kl.fns.shen$docheck$unstream, [V4325, V4326, V4327])):(asJsBool(kl.fns.cons$qu(kl.fns.hd(V4325)))?(Kl.tailCall(kl.fns.shen$dolist_stream, [Kl.headCall(kl.fns.shen$dodecons, [kl.fns.hd(V4325)]), kl.fns.tl(V4325), V4326, V4327])):(kl.fns.simple_error(Kl.headCall(kl.fns.shen$doapp, [kl.fns.hd(V4325), " is not legal syntax\n", new Sym("shen.a")])))))))):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.syntax")]))));
                    });

kl.defun("shen.list-stream", 4, function (V4332, V4333, V4334, V4335) {
                      return (function () {
                  const Test = kl.fns.cons(new Sym("and"), kl.fns.cons(kl.fns.cons(new Sym("cons?"), kl.fns.cons(kl.fns.cons(new Sym("hd"), kl.fns.cons(V4334, null)), null)), kl.fns.cons(kl.fns.cons(new Sym("cons?"), kl.fns.cons(kl.fns.cons(new Sym("shen.hdhd"), kl.fns.cons(V4334, null)), null)), null)));
                    const Placeholder = Kl.headCall(kl.fns.gensym, [new Sym("shen.place")]);
                    const RunOn = Kl.headCall(kl.fns.shen$dosyntax, [V4333, kl.fns.cons(new Sym("shen.pair"), kl.fns.cons(kl.fns.cons(new Sym("shen.tlhd"), kl.fns.cons(V4334, null)), kl.fns.cons(kl.fns.cons(new Sym("shen.hdtl"), kl.fns.cons(V4334, null)), null))), V4335]);
                    const Action = Kl.headCall(kl.fns.shen$doinsert_runon, [RunOn, Placeholder, Kl.headCall(kl.fns.shen$dosyntax, [V4332, kl.fns.cons(new Sym("shen.pair"), kl.fns.cons(kl.fns.cons(new Sym("shen.hdhd"), kl.fns.cons(V4334, null)), kl.fns.cons(kl.fns.cons(new Sym("shen.hdtl"), kl.fns.cons(V4334, null)), null))), Placeholder])]);
                    return kl.fns.cons(new Sym("if"), kl.fns.cons(Test, kl.fns.cons(Action, kl.fns.cons(kl.fns.cons(new Sym("fail"), null), null))));
                })();
                    });

kl.defun("shen.decons", 1, function (V4337) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V4337)) && asJsBool(kl.fns.$eq(new Sym("cons"), kl.fns.hd(V4337))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V4337))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(V4337)))) && asJsBool(kl.fns.$eq(null, kl.fns.hd(kl.fns.tl(kl.fns.tl(V4337))))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.tl(V4337)))))))?(kl.fns.cons(kl.fns.hd(kl.fns.tl(V4337)), null)):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V4337)) && asJsBool(kl.fns.$eq(new Sym("cons"), kl.fns.hd(V4337))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V4337))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(V4337)))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.tl(V4337)))))))?(kl.fns.cons(kl.fns.hd(kl.fns.tl(V4337)), Kl.headCall(kl.fns.shen$dodecons, [kl.fns.hd(kl.fns.tl(kl.fns.tl(V4337)))]))):(V4337));
                    });

kl.defun("shen.insert-runon", 3, function (V4352, V4353, V4354) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V4354)) && asJsBool(kl.fns.$eq(new Sym("shen.pair"), kl.fns.hd(V4354))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V4354))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(V4354)))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.tl(V4354))))) && asJsBool(kl.fns.$eq(kl.fns.hd(kl.fns.tl(kl.fns.tl(V4354))), V4353))))?(V4352):(asJsBool(kl.fns.cons$qu(V4354))?(Kl.tailCall(kl.fns.map, [Kl.setArity("shen.insert-runon_lambda", 1, function (Z) {
                      return Kl.tailCall(kl.fns.shen$doinsert_runon, [V4352, V4353, Z]);
                    }), V4354])):(V4354));
                    });

kl.defun("shen.strip-pathname", 1, function (V4360) {
                      return asJsBool(Kl.headCall(kl.fns.not, [Kl.headCall(kl.fns.element$qu, [".", V4360])]))?(V4360):(asJsBool(kl.fns.cons$qu(V4360))?(Kl.tailCall(kl.fns.shen$dostrip_pathname, [kl.fns.tl(V4360)])):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.strip-pathname")])));
                    });

kl.defun("shen.recursive_descent", 3, function (V4364, V4365, V4366) {
                      return asJsBool(kl.fns.cons$qu(V4364))?((function () {
                  const Test = kl.fns.cons(kl.fns.hd(V4364), kl.fns.cons(V4365, null));
                    const Action = Kl.headCall(kl.fns.shen$dosyntax, [kl.fns.tl(V4364), Kl.headCall(kl.fns.concat, [new Sym("Parse_"), kl.fns.hd(V4364)]), V4366]);
                    const Else = kl.fns.cons(new Sym("fail"), null);
                    return kl.fns.cons(new Sym("let"), kl.fns.cons(Kl.headCall(kl.fns.concat, [new Sym("Parse_"), kl.fns.hd(V4364)]), kl.fns.cons(Test, kl.fns.cons(kl.fns.cons(new Sym("if"), kl.fns.cons(kl.fns.cons(new Sym("not"), kl.fns.cons(kl.fns.cons(new Sym("="), kl.fns.cons(kl.fns.cons(new Sym("fail"), null), kl.fns.cons(Kl.headCall(kl.fns.concat, [new Sym("Parse_"), kl.fns.hd(V4364)]), null))), null)), kl.fns.cons(Action, kl.fns.cons(Else, null)))), null))));
                })()):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.recursive_descent")]));
                    });

kl.defun("shen.variable-match", 3, function (V4370, V4371, V4372) {
                      return asJsBool(kl.fns.cons$qu(V4370))?((function () {
                  const Test = kl.fns.cons(new Sym("cons?"), kl.fns.cons(kl.fns.cons(new Sym("hd"), kl.fns.cons(V4371, null)), null));
                    const Action = kl.fns.cons(new Sym("let"), kl.fns.cons(Kl.headCall(kl.fns.concat, [new Sym("Parse_"), kl.fns.hd(V4370)]), kl.fns.cons(kl.fns.cons(new Sym("shen.hdhd"), kl.fns.cons(V4371, null)), kl.fns.cons(Kl.headCall(kl.fns.shen$dosyntax, [kl.fns.tl(V4370), kl.fns.cons(new Sym("shen.pair"), kl.fns.cons(kl.fns.cons(new Sym("shen.tlhd"), kl.fns.cons(V4371, null)), kl.fns.cons(kl.fns.cons(new Sym("shen.hdtl"), kl.fns.cons(V4371, null)), null))), V4372]), null))));
                    const Else = kl.fns.cons(new Sym("fail"), null);
                    return kl.fns.cons(new Sym("if"), kl.fns.cons(Test, kl.fns.cons(Action, kl.fns.cons(Else, null))));
                })()):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.variable-match")]));
                    });

kl.defun("shen.terminal?", 1, function (V4382) {
                      return asJsBool(kl.fns.cons$qu(V4382))?(klFalse):(asJsBool(Kl.headCall(kl.fns.variable$qu, [V4382]))?(klFalse):(klTrue));
                    });

kl.defun("shen.jump_stream?", 1, function (V4388) {
                      return asJsBool(kl.fns.$eq(V4388, new Sym("_")))?(klTrue):(klFalse);
                    });

kl.defun("shen.check_stream", 3, function (V4392, V4393, V4394) {
                      return asJsBool(kl.fns.cons$qu(V4392))?((function () {
                  const Test = kl.fns.cons(new Sym("and"), kl.fns.cons(kl.fns.cons(new Sym("cons?"), kl.fns.cons(kl.fns.cons(new Sym("hd"), kl.fns.cons(V4393, null)), null)), kl.fns.cons(kl.fns.cons(new Sym("="), kl.fns.cons(kl.fns.hd(V4392), kl.fns.cons(kl.fns.cons(new Sym("shen.hdhd"), kl.fns.cons(V4393, null)), null))), null)));
                    const NewStr = Kl.headCall(kl.fns.gensym, [new Sym("NewStream")]);
                    const Action = kl.fns.cons(new Sym("let"), kl.fns.cons(NewStr, kl.fns.cons(kl.fns.cons(new Sym("shen.pair"), kl.fns.cons(kl.fns.cons(new Sym("shen.tlhd"), kl.fns.cons(V4393, null)), kl.fns.cons(kl.fns.cons(new Sym("shen.hdtl"), kl.fns.cons(V4393, null)), null))), kl.fns.cons(Kl.headCall(kl.fns.shen$dosyntax, [kl.fns.tl(V4392), NewStr, V4394]), null))));
                    const Else = kl.fns.cons(new Sym("fail"), null);
                    return kl.fns.cons(new Sym("if"), kl.fns.cons(Test, kl.fns.cons(Action, kl.fns.cons(Else, null))));
                })()):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.check_stream")]));
                    });

kl.defun("shen.jump_stream", 3, function (V4398, V4399, V4400) {
                      return asJsBool(kl.fns.cons$qu(V4398))?((function () {
                  const Test = kl.fns.cons(new Sym("cons?"), kl.fns.cons(kl.fns.cons(new Sym("hd"), kl.fns.cons(V4399, null)), null));
                    const Action = Kl.headCall(kl.fns.shen$dosyntax, [kl.fns.tl(V4398), kl.fns.cons(new Sym("shen.pair"), kl.fns.cons(kl.fns.cons(new Sym("shen.tlhd"), kl.fns.cons(V4399, null)), kl.fns.cons(kl.fns.cons(new Sym("shen.hdtl"), kl.fns.cons(V4399, null)), null))), V4400]);
                    const Else = kl.fns.cons(new Sym("fail"), null);
                    return kl.fns.cons(new Sym("if"), kl.fns.cons(Test, kl.fns.cons(Action, kl.fns.cons(Else, null))));
                })()):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.jump_stream")]));
                    });

kl.defun("shen.semantics", 1, function (V4402) {
                      return asJsBool(kl.fns.$eq(null, V4402))?(null):(asJsBool(Kl.headCall(kl.fns.shen$dogrammar$unsymbol$qu, [V4402]))?(kl.fns.cons(new Sym("shen.hdtl"), kl.fns.cons(Kl.headCall(kl.fns.concat, [new Sym("Parse_"), V4402]), null))):(asJsBool(Kl.headCall(kl.fns.variable$qu, [V4402]))?(Kl.tailCall(kl.fns.concat, [new Sym("Parse_"), V4402])):(asJsBool(kl.fns.cons$qu(V4402))?(Kl.tailCall(kl.fns.map, [Kl.setArity("shen.semantics_lambda", 1, function (Z) {
                      return Kl.tailCall(kl.fns.shen$dosemantics, [Z]);
                    }), V4402])):(V4402))));
                    });

kl.defun("shen.pair", 2, function (V4405, V4406) {
                      return kl.fns.cons(V4405, kl.fns.cons(V4406, null));
                    });

kl.defun("shen.hdtl", 1, function (V4408) {
                      return kl.fns.hd(kl.fns.tl(V4408));
                    });

kl.defun("shen.hdhd", 1, function (V4410) {
                      return kl.fns.hd(kl.fns.hd(V4410));
                    });

kl.defun("shen.tlhd", 1, function (V4412) {
                      return kl.fns.tl(kl.fns.hd(V4412));
                    });

kl.defun("shen.snd-or-fail", 1, function (V4420) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V4420)) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V4420))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(V4420))))))?(kl.fns.hd(kl.fns.tl(V4420))):(Kl.tailCall(kl.fns.fail, []));
                    });

kl.defun("fail", 0, function () {
                      return new Sym("shen.fail!");
                    });

kl.defun("<!>", 1, function (V4428) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V4428)) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V4428))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(V4428))))))?(kl.fns.cons(null, kl.fns.cons(kl.fns.hd(V4428), null))):(Kl.tailCall(kl.fns.fail, []));
                    });

kl.defun("<e>", 1, function (V4434) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V4434)) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V4434))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(V4434))))))?(kl.fns.cons(kl.fns.hd(V4434), kl.fns.cons(null, null))):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("<e>")]));
                    });

kl.defun("shen.read-char-code", 1, function (V2358) {
                      return kl.fns.read_byte(V2358);
                    });

kl.defun("read-file-as-bytelist", 1, function (V2360) {
                      return Kl.tailCall(kl.fns.shen$doread_file_as_Xlist, [V2360, Kl.setArity("read-file-as-bytelist_lambda", 1, function (S) {
                      return kl.fns.read_byte(S);
                    })]);
                    });

kl.defun("shen.read-file-as-charlist", 1, function (V2362) {
                      return Kl.tailCall(kl.fns.shen$doread_file_as_Xlist, [V2362, Kl.setArity("shen.read-file-as-charlist_lambda", 1, function (S) {
                      return Kl.tailCall(kl.fns.shen$doread_char_code, [S]);
                    })]);
                    });

kl.defun("shen.read-file-as-Xlist", 2, function (V2365, V2366) {
                      return (function () {
                  const Stream = kl.fns.open(V2365, new Sym("in"));
                    const X = Kl.headCall(V2366, [Stream]);
                    const Xs = Kl.headCall(kl.fns.shen$doread_file_as_Xlist_help, [Stream, V2366, X, null]);
                    const Close = kl.fns.close(Stream);
                    return Kl.tailCall(kl.fns.reverse, [Xs]);
                })();
                    });

kl.defun("shen.read-file-as-Xlist-help", 4, function (V2371, V2372, V2373, V2374) {
                      return asJsBool(kl.fns.$eq(-1, V2373))?(V2374):(Kl.tailCall(kl.fns.shen$doread_file_as_Xlist_help, [V2371, V2372, Kl.headCall(V2372, [V2371]), kl.fns.cons(V2373, V2374)]));
                    });

kl.defun("read-file-as-string", 1, function (V2376) {
                      return (function () {
                  const Stream = kl.fns.open(V2376, new Sym("in"));
                    return Kl.tailCall(kl.fns.shen$dorfas_h, [Stream, Kl.headCall(kl.fns.shen$doread_char_code, [Stream]), ""]);
                })();
                    });

kl.defun("shen.rfas-h", 3, function (V2380, V2381, V2382) {
                      return asJsBool(kl.fns.$eq(-1, V2381))?((function () {
                      kl.fns.close(V2380);
                      return V2382;
                    })()):(Kl.tailCall(kl.fns.shen$dorfas_h, [V2380, Kl.headCall(kl.fns.shen$doread_char_code, [V2380]), kl.fns.cn(V2382, kl.fns.n_$gtstring(V2381))]));
                    });

kl.defun("input", 1, function (V2384) {
                      return kl.fns.eval_kl(Kl.headCall(kl.fns.read, [V2384]));
                    });

kl.defun("input+", 2, function (V2387, V2388) {
                      return (function () {
                  const Mono$qu = Kl.headCall(kl.fns.shen$domonotype, [V2387]);
                    const Input = Kl.headCall(kl.fns.read, [V2388]);
                    return asJsBool(kl.fns.$eq(klFalse, Kl.headCall(kl.fns.shen$dotypecheck, [Input, Kl.headCall(kl.fns.shen$dodemodulate, [V2387])])))?(kl.fns.simple_error(kl.fns.cn("type error: ", Kl.headCall(kl.fns.shen$doapp, [Input, kl.fns.cn(" is not of type ", Kl.headCall(kl.fns.shen$doapp, [V2387, "\n", new Sym("shen.r")])), new Sym("shen.r")])))):(kl.fns.eval_kl(Input));
                })();
                    });

kl.defun("shen.monotype", 1, function (V2390) {
                      return asJsBool(kl.fns.cons$qu(V2390))?(Kl.tailCall(kl.fns.map, [Kl.setArity("shen.monotype_lambda", 1, function (Z) {
                      return Kl.tailCall(kl.fns.shen$domonotype, [Z]);
                    }), V2390])):(asJsBool(Kl.headCall(kl.fns.variable$qu, [V2390]))?(kl.fns.simple_error(kl.fns.cn("input+ expects a monotype: not ", Kl.headCall(kl.fns.shen$doapp, [V2390, "\n", new Sym("shen.a")])))):(V2390));
                    });

kl.defun("read", 1, function (V2392) {
                      return kl.fns.hd(Kl.headCall(kl.fns.shen$doread_loop, [V2392, Kl.headCall(kl.fns.shen$doread_char_code, [V2392]), null]));
                    });

kl.defun("it", 0, function () {
                      return kl.fns.value(new Sym("shen.*it*"));
                    });

kl.defun("shen.read-loop", 3, function (V2400, V2401, V2402) {
                      return asJsBool(kl.fns.$eq(94, V2401))?(kl.fns.simple_error("read aborted")):(asJsBool(kl.fns.$eq(-1, V2401))?(asJsBool(Kl.headCall(kl.fns.empty$qu, [V2402]))?(kl.fns.simple_error("error: empty stream")):(Kl.tailCall(kl.fns.compile, [Kl.setArity("shen.read-loop_lambda", 1, function (X) {
                      return Kl.tailCall(kl.fns.shen$do$ltst$uninput$gt, [X]);
                    }), V2402, Kl.setArity("shen.read-loop_lambda", 1, function (E) {
                      return E;
                    })]))):(asJsBool(Kl.headCall(kl.fns.shen$doterminator$qu, [V2401]))?((function () {
                  const AllChars = Kl.headCall(kl.fns.append, [V2402, kl.fns.cons(V2401, null)]);
                    const It = Kl.headCall(kl.fns.shen$dorecord_it, [AllChars]);
                    const Read = Kl.headCall(kl.fns.compile, [Kl.setArity("shen.read-loop_lambda", 1, function (X) {
                      return Kl.tailCall(kl.fns.shen$do$ltst$uninput$gt, [X]);
                    }), AllChars, Kl.setArity("shen.read-loop_lambda", 1, function (E) {
                      return new Sym("shen.nextbyte");
                    })]);
                    return asJsBool(asKlBool(asJsBool(kl.fns.$eq(Read, new Sym("shen.nextbyte"))) || asJsBool(Kl.headCall(kl.fns.empty$qu, [Read]))))?(Kl.tailCall(kl.fns.shen$doread_loop, [V2400, Kl.headCall(kl.fns.shen$doread_char_code, [V2400]), AllChars])):(Read);
                })()):(Kl.tailCall(kl.fns.shen$doread_loop, [V2400, Kl.headCall(kl.fns.shen$doread_char_code, [V2400]), Kl.headCall(kl.fns.append, [V2402, kl.fns.cons(V2401, null)])]))));
                    });

kl.defun("shen.terminator?", 1, function (V2404) {
                      return Kl.tailCall(kl.fns.element$qu, [V2404, kl.fns.cons(9, kl.fns.cons(10, kl.fns.cons(13, kl.fns.cons(32, kl.fns.cons(34, kl.fns.cons(41, kl.fns.cons(93, null)))))))]);
                    });

kl.defun("lineread", 1, function (V2406) {
                      return Kl.tailCall(kl.fns.shen$dolineread_loop, [Kl.headCall(kl.fns.shen$doread_char_code, [V2406]), null, V2406]);
                    });

kl.defun("shen.lineread-loop", 3, function (V2411, V2412, V2413) {
                      return asJsBool(kl.fns.$eq(-1, V2411))?(asJsBool(Kl.headCall(kl.fns.empty$qu, [V2412]))?(kl.fns.simple_error("empty stream")):(Kl.tailCall(kl.fns.compile, [Kl.setArity("shen.lineread-loop_lambda", 1, function (X) {
                      return Kl.tailCall(kl.fns.shen$do$ltst$uninput$gt, [X]);
                    }), V2412, Kl.setArity("shen.lineread-loop_lambda", 1, function (E) {
                      return E;
                    })]))):(asJsBool(kl.fns.$eq(V2411, Kl.headCall(kl.fns.shen$dohat, [])))?(kl.fns.simple_error("line read aborted")):(asJsBool(Kl.headCall(kl.fns.element$qu, [V2411, kl.fns.cons(Kl.headCall(kl.fns.shen$donewline, []), kl.fns.cons(Kl.headCall(kl.fns.shen$docarriage_return, []), null))]))?((function () {
                  const Line = Kl.headCall(kl.fns.compile, [Kl.setArity("shen.lineread-loop_lambda", 1, function (X) {
                      return Kl.tailCall(kl.fns.shen$do$ltst$uninput$gt, [X]);
                    }), V2412, Kl.setArity("shen.lineread-loop_lambda", 1, function (E) {
                      return new Sym("shen.nextline");
                    })]);
                    const It = Kl.headCall(kl.fns.shen$dorecord_it, [V2412]);
                    return asJsBool(asKlBool(asJsBool(kl.fns.$eq(Line, new Sym("shen.nextline"))) || asJsBool(Kl.headCall(kl.fns.empty$qu, [Line]))))?(Kl.tailCall(kl.fns.shen$dolineread_loop, [Kl.headCall(kl.fns.shen$doread_char_code, [V2413]), Kl.headCall(kl.fns.append, [V2412, kl.fns.cons(V2411, null)]), V2413])):(Line);
                })()):(Kl.tailCall(kl.fns.shen$dolineread_loop, [Kl.headCall(kl.fns.shen$doread_char_code, [V2413]), Kl.headCall(kl.fns.append, [V2412, kl.fns.cons(V2411, null)]), V2413]))));
                    });

kl.defun("shen.record-it", 1, function (V2415) {
                      return (function () {
                  const TrimLeft = Kl.headCall(kl.fns.shen$dotrim_whitespace, [V2415]);
                    const TrimRight = Kl.headCall(kl.fns.shen$dotrim_whitespace, [Kl.headCall(kl.fns.reverse, [TrimLeft])]);
                    const Trimmed = Kl.headCall(kl.fns.reverse, [TrimRight]);
                    return Kl.tailCall(kl.fns.shen$dorecord_it_h, [Trimmed]);
                })();
                    });

kl.defun("shen.trim-whitespace", 1, function (V2417) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V2417)) && asJsBool(Kl.headCall(kl.fns.element$qu, [kl.fns.hd(V2417), kl.fns.cons(9, kl.fns.cons(10, kl.fns.cons(13, kl.fns.cons(32, null))))]))))?(Kl.tailCall(kl.fns.shen$dotrim_whitespace, [kl.fns.tl(V2417)])):(V2417);
                    });

kl.defun("shen.record-it-h", 1, function (V2419) {
                      return (function () {
                      kl.symbols.shen$do$stit$st = Kl.headCall(kl.fns.shen$docn_all, [Kl.headCall(kl.fns.map, [Kl.setArity("shen.record-it-h_lambda", 1, function (X) {
                      return kl.fns.n_$gtstring(X);
                    }), V2419])]);
                      return V2419;
                    })();
                    });

kl.defun("shen.cn-all", 1, function (V2421) {
                      return asJsBool(kl.fns.$eq(null, V2421))?(""):(asJsBool(kl.fns.cons$qu(V2421))?(kl.fns.cn(kl.fns.hd(V2421), Kl.headCall(kl.fns.shen$docn_all, [kl.fns.tl(V2421)]))):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.cn-all")])));
                    });

kl.defun("read-file", 1, function (V2423) {
                      return (function () {
                  const Charlist = Kl.headCall(kl.fns.shen$doread_file_as_charlist, [V2423]);
                    return Kl.tailCall(kl.fns.compile, [Kl.setArity("read-file_lambda", 1, function (X) {
                      return Kl.tailCall(kl.fns.shen$do$ltst$uninput$gt, [X]);
                    }), Charlist, Kl.setArity("read-file_lambda", 1, function (X) {
                      return Kl.tailCall(kl.fns.shen$doread_error, [X]);
                    })]);
                })();
                    });

kl.defun("read-from-string", 1, function (V2425) {
                      return (function () {
                  const Ns = Kl.headCall(kl.fns.map, [Kl.setArity("read-from-string_lambda", 1, function (X) {
                      return kl.fns.string_$gtn(X);
                    }), Kl.headCall(kl.fns.explode, [V2425])]);
                    return Kl.tailCall(kl.fns.compile, [Kl.setArity("read-from-string_lambda", 1, function (X) {
                      return Kl.tailCall(kl.fns.shen$do$ltst$uninput$gt, [X]);
                    }), Ns, Kl.setArity("read-from-string_lambda", 1, function (X) {
                      return Kl.tailCall(kl.fns.shen$doread_error, [X]);
                    })]);
                })();
                    });

kl.defun("shen.read-error", 1, function (V2433) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V2433)) && asJsBool(kl.fns.cons$qu(kl.fns.hd(V2433))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V2433))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(V2433))))))?(kl.fns.simple_error(kl.fns.cn("read error here:\n\n ", Kl.headCall(kl.fns.shen$doapp, [Kl.headCall(kl.fns.shen$docompress_50, [50, kl.fns.hd(V2433)]), "\n", new Sym("shen.a")])))):(kl.fns.simple_error("read error\n"));
                    });

kl.defun("shen.compress-50", 2, function (V2440, V2441) {
                      return asJsBool(kl.fns.$eq(null, V2441))?(""):(asJsBool(kl.fns.$eq(0, V2440))?(""):(asJsBool(kl.fns.cons$qu(V2441))?(kl.fns.cn(kl.fns.n_$gtstring(kl.fns.hd(V2441)), Kl.headCall(kl.fns.shen$docompress_50, [kl.fns._(V2440, 1), kl.fns.tl(V2441)]))):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.compress-50")]))));
                    });

kl.defun("shen.<st_input>", 1, function (V2443) {
                      return (function () {
                  const YaccParse = (function () {
                  const Parse$unshen$do$ltlsb$gt = Kl.headCall(kl.fns.shen$do$ltlsb$gt, [V2443]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltlsb$gt)]))?((function () {
                  const Parse$unshen$do$ltst$uninput1$gt = Kl.headCall(kl.fns.shen$do$ltst$uninput1$gt, [Parse$unshen$do$ltlsb$gt]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltst$uninput1$gt)]))?((function () {
                  const Parse$unshen$do$ltrsb$gt = Kl.headCall(kl.fns.shen$do$ltrsb$gt, [Parse$unshen$do$ltst$uninput1$gt]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltrsb$gt)]))?((function () {
                  const Parse$unshen$do$ltst$uninput2$gt = Kl.headCall(kl.fns.shen$do$ltst$uninput2$gt, [Parse$unshen$do$ltrsb$gt]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltst$uninput2$gt)]))?(Kl.headCall(kl.fns.shen$dopair, [kl.fns.hd(Parse$unshen$do$ltst$uninput2$gt), kl.fns.cons(Kl.headCall(kl.fns.macroexpand, [Kl.headCall(kl.fns.shen$docons$unform, [Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltst$uninput1$gt])])]), Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltst$uninput2$gt]))])):(Kl.headCall(kl.fns.fail, []));
                })()):(Kl.headCall(kl.fns.fail, []));
                })()):(Kl.headCall(kl.fns.fail, []));
                })()):(Kl.headCall(kl.fns.fail, []));
                })();
                    return asJsBool(kl.fns.$eq(YaccParse, Kl.headCall(kl.fns.fail, [])))?((function () {
                  const YaccParse_1 = (function () {
                  const Parse$unshen$do$ltlrb$gt = Kl.headCall(kl.fns.shen$do$ltlrb$gt, [V2443]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltlrb$gt)]))?((function () {
                  const Parse$unshen$do$ltst$uninput1$gt = Kl.headCall(kl.fns.shen$do$ltst$uninput1$gt, [Parse$unshen$do$ltlrb$gt]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltst$uninput1$gt)]))?((function () {
                  const Parse$unshen$do$ltrrb$gt = Kl.headCall(kl.fns.shen$do$ltrrb$gt, [Parse$unshen$do$ltst$uninput1$gt]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltrrb$gt)]))?((function () {
                  const Parse$unshen$do$ltst$uninput2$gt = Kl.headCall(kl.fns.shen$do$ltst$uninput2$gt, [Parse$unshen$do$ltrrb$gt]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltst$uninput2$gt)]))?(Kl.headCall(kl.fns.shen$dopair, [kl.fns.hd(Parse$unshen$do$ltst$uninput2$gt), Kl.headCall(kl.fns.shen$dopackage_macro, [Kl.headCall(kl.fns.macroexpand, [Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltst$uninput1$gt])]), Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltst$uninput2$gt])])])):(Kl.headCall(kl.fns.fail, []));
                })()):(Kl.headCall(kl.fns.fail, []));
                })()):(Kl.headCall(kl.fns.fail, []));
                })()):(Kl.headCall(kl.fns.fail, []));
                })();
                    return asJsBool(kl.fns.$eq(YaccParse_1, Kl.headCall(kl.fns.fail, [])))?((function () {
                  const YaccParse_2 = (function () {
                  const Parse$unshen$do$ltlcurly$gt = Kl.headCall(kl.fns.shen$do$ltlcurly$gt, [V2443]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltlcurly$gt)]))?((function () {
                  const Parse$unshen$do$ltst$uninput$gt = Kl.headCall(kl.fns.shen$do$ltst$uninput$gt, [Parse$unshen$do$ltlcurly$gt]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltst$uninput$gt)]))?(Kl.headCall(kl.fns.shen$dopair, [kl.fns.hd(Parse$unshen$do$ltst$uninput$gt), kl.fns.cons(new Sym("{"), Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltst$uninput$gt]))])):(Kl.headCall(kl.fns.fail, []));
                })()):(Kl.headCall(kl.fns.fail, []));
                })();
                    return asJsBool(kl.fns.$eq(YaccParse_2, Kl.headCall(kl.fns.fail, [])))?((function () {
                  const YaccParse_3 = (function () {
                  const Parse$unshen$do$ltrcurly$gt = Kl.headCall(kl.fns.shen$do$ltrcurly$gt, [V2443]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltrcurly$gt)]))?((function () {
                  const Parse$unshen$do$ltst$uninput$gt = Kl.headCall(kl.fns.shen$do$ltst$uninput$gt, [Parse$unshen$do$ltrcurly$gt]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltst$uninput$gt)]))?(Kl.headCall(kl.fns.shen$dopair, [kl.fns.hd(Parse$unshen$do$ltst$uninput$gt), kl.fns.cons(new Sym("}"), Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltst$uninput$gt]))])):(Kl.headCall(kl.fns.fail, []));
                })()):(Kl.headCall(kl.fns.fail, []));
                })();
                    return asJsBool(kl.fns.$eq(YaccParse_3, Kl.headCall(kl.fns.fail, [])))?((function () {
                  const YaccParse_4 = (function () {
                  const Parse$unshen$do$ltbar$gt = Kl.headCall(kl.fns.shen$do$ltbar$gt, [V2443]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltbar$gt)]))?((function () {
                  const Parse$unshen$do$ltst$uninput$gt = Kl.headCall(kl.fns.shen$do$ltst$uninput$gt, [Parse$unshen$do$ltbar$gt]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltst$uninput$gt)]))?(Kl.headCall(kl.fns.shen$dopair, [kl.fns.hd(Parse$unshen$do$ltst$uninput$gt), kl.fns.cons(new Sym("bar!"), Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltst$uninput$gt]))])):(Kl.headCall(kl.fns.fail, []));
                })()):(Kl.headCall(kl.fns.fail, []));
                })();
                    return asJsBool(kl.fns.$eq(YaccParse_4, Kl.headCall(kl.fns.fail, [])))?((function () {
                  const YaccParse_5 = (function () {
                  const Parse$unshen$do$ltsemicolon$gt = Kl.headCall(kl.fns.shen$do$ltsemicolon$gt, [V2443]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltsemicolon$gt)]))?((function () {
                  const Parse$unshen$do$ltst$uninput$gt = Kl.headCall(kl.fns.shen$do$ltst$uninput$gt, [Parse$unshen$do$ltsemicolon$gt]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltst$uninput$gt)]))?(Kl.headCall(kl.fns.shen$dopair, [kl.fns.hd(Parse$unshen$do$ltst$uninput$gt), kl.fns.cons(new Sym(";"), Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltst$uninput$gt]))])):(Kl.headCall(kl.fns.fail, []));
                })()):(Kl.headCall(kl.fns.fail, []));
                })();
                    return asJsBool(kl.fns.$eq(YaccParse_5, Kl.headCall(kl.fns.fail, [])))?((function () {
                  const YaccParse_6 = (function () {
                  const Parse$unshen$do$ltcolon$gt = Kl.headCall(kl.fns.shen$do$ltcolon$gt, [V2443]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltcolon$gt)]))?((function () {
                  const Parse$unshen$do$ltequal$gt = Kl.headCall(kl.fns.shen$do$ltequal$gt, [Parse$unshen$do$ltcolon$gt]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltequal$gt)]))?((function () {
                  const Parse$unshen$do$ltst$uninput$gt = Kl.headCall(kl.fns.shen$do$ltst$uninput$gt, [Parse$unshen$do$ltequal$gt]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltst$uninput$gt)]))?(Kl.headCall(kl.fns.shen$dopair, [kl.fns.hd(Parse$unshen$do$ltst$uninput$gt), kl.fns.cons(new Sym(":="), Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltst$uninput$gt]))])):(Kl.headCall(kl.fns.fail, []));
                })()):(Kl.headCall(kl.fns.fail, []));
                })()):(Kl.headCall(kl.fns.fail, []));
                })();
                    return asJsBool(kl.fns.$eq(YaccParse_6, Kl.headCall(kl.fns.fail, [])))?((function () {
                  const YaccParse_7 = (function () {
                  const Parse$unshen$do$ltcolon$gt = Kl.headCall(kl.fns.shen$do$ltcolon$gt, [V2443]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltcolon$gt)]))?((function () {
                  const Parse$unshen$do$ltminus$gt = Kl.headCall(kl.fns.shen$do$ltminus$gt, [Parse$unshen$do$ltcolon$gt]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltminus$gt)]))?((function () {
                  const Parse$unshen$do$ltst$uninput$gt = Kl.headCall(kl.fns.shen$do$ltst$uninput$gt, [Parse$unshen$do$ltminus$gt]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltst$uninput$gt)]))?(Kl.headCall(kl.fns.shen$dopair, [kl.fns.hd(Parse$unshen$do$ltst$uninput$gt), kl.fns.cons(new Sym(":-"), Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltst$uninput$gt]))])):(Kl.headCall(kl.fns.fail, []));
                })()):(Kl.headCall(kl.fns.fail, []));
                })()):(Kl.headCall(kl.fns.fail, []));
                })();
                    return asJsBool(kl.fns.$eq(YaccParse_7, Kl.headCall(kl.fns.fail, [])))?((function () {
                  const YaccParse_8 = (function () {
                  const Parse$unshen$do$ltcolon$gt = Kl.headCall(kl.fns.shen$do$ltcolon$gt, [V2443]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltcolon$gt)]))?((function () {
                  const Parse$unshen$do$ltst$uninput$gt = Kl.headCall(kl.fns.shen$do$ltst$uninput$gt, [Parse$unshen$do$ltcolon$gt]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltst$uninput$gt)]))?(Kl.headCall(kl.fns.shen$dopair, [kl.fns.hd(Parse$unshen$do$ltst$uninput$gt), kl.fns.cons(new Sym(":"), Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltst$uninput$gt]))])):(Kl.headCall(kl.fns.fail, []));
                })()):(Kl.headCall(kl.fns.fail, []));
                })();
                    return asJsBool(kl.fns.$eq(YaccParse_8, Kl.headCall(kl.fns.fail, [])))?((function () {
                  const YaccParse_9 = (function () {
                  const Parse$unshen$do$ltcomma$gt = Kl.headCall(kl.fns.shen$do$ltcomma$gt, [V2443]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltcomma$gt)]))?((function () {
                  const Parse$unshen$do$ltst$uninput$gt = Kl.headCall(kl.fns.shen$do$ltst$uninput$gt, [Parse$unshen$do$ltcomma$gt]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltst$uninput$gt)]))?(Kl.headCall(kl.fns.shen$dopair, [kl.fns.hd(Parse$unshen$do$ltst$uninput$gt), kl.fns.cons(kl.fns.intern(","), Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltst$uninput$gt]))])):(Kl.headCall(kl.fns.fail, []));
                })()):(Kl.headCall(kl.fns.fail, []));
                })();
                    return asJsBool(kl.fns.$eq(YaccParse_9, Kl.headCall(kl.fns.fail, [])))?((function () {
                  const YaccParse_10 = (function () {
                  const Parse$unshen$do$ltcomment$gt = Kl.headCall(kl.fns.shen$do$ltcomment$gt, [V2443]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltcomment$gt)]))?((function () {
                  const Parse$unshen$do$ltst$uninput$gt = Kl.headCall(kl.fns.shen$do$ltst$uninput$gt, [Parse$unshen$do$ltcomment$gt]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltst$uninput$gt)]))?(Kl.headCall(kl.fns.shen$dopair, [kl.fns.hd(Parse$unshen$do$ltst$uninput$gt), Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltst$uninput$gt])])):(Kl.headCall(kl.fns.fail, []));
                })()):(Kl.headCall(kl.fns.fail, []));
                })();
                    return asJsBool(kl.fns.$eq(YaccParse_10, Kl.headCall(kl.fns.fail, [])))?((function () {
                  const YaccParse_11 = (function () {
                  const Parse$unshen$do$ltatom$gt = Kl.headCall(kl.fns.shen$do$ltatom$gt, [V2443]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltatom$gt)]))?((function () {
                  const Parse$unshen$do$ltst$uninput$gt = Kl.headCall(kl.fns.shen$do$ltst$uninput$gt, [Parse$unshen$do$ltatom$gt]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltst$uninput$gt)]))?(Kl.headCall(kl.fns.shen$dopair, [kl.fns.hd(Parse$unshen$do$ltst$uninput$gt), kl.fns.cons(Kl.headCall(kl.fns.macroexpand, [Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltatom$gt])]), Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltst$uninput$gt]))])):(Kl.headCall(kl.fns.fail, []));
                })()):(Kl.headCall(kl.fns.fail, []));
                })();
                    return asJsBool(kl.fns.$eq(YaccParse_11, Kl.headCall(kl.fns.fail, [])))?((function () {
                  const YaccParse_12 = (function () {
                  const Parse$unshen$do$ltwhitespaces$gt = Kl.headCall(kl.fns.shen$do$ltwhitespaces$gt, [V2443]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltwhitespaces$gt)]))?((function () {
                  const Parse$unshen$do$ltst$uninput$gt = Kl.headCall(kl.fns.shen$do$ltst$uninput$gt, [Parse$unshen$do$ltwhitespaces$gt]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltst$uninput$gt)]))?(Kl.headCall(kl.fns.shen$dopair, [kl.fns.hd(Parse$unshen$do$ltst$uninput$gt), Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltst$uninput$gt])])):(Kl.headCall(kl.fns.fail, []));
                })()):(Kl.headCall(kl.fns.fail, []));
                })();
                    return asJsBool(kl.fns.$eq(YaccParse_12, Kl.headCall(kl.fns.fail, [])))?((function () {
                  const Parse$un$lte$gt = Kl.headCall(kl.fns.$lte$gt, [V2443]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$un$lte$gt)]))?(Kl.tailCall(kl.fns.shen$dopair, [kl.fns.hd(Parse$un$lte$gt), null])):(Kl.tailCall(kl.fns.fail, []));
                })()):(YaccParse_12);
                })()):(YaccParse_11);
                })()):(YaccParse_10);
                })()):(YaccParse_9);
                })()):(YaccParse_8);
                })()):(YaccParse_7);
                })()):(YaccParse_6);
                })()):(YaccParse_5);
                })()):(YaccParse_4);
                })()):(YaccParse_3);
                })()):(YaccParse_2);
                })()):(YaccParse_1);
                })()):(YaccParse);
                })();
                    });

kl.defun("shen.<lsb>", 1, function (V2445) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(kl.fns.hd(V2445))) && asJsBool(kl.fns.$eq(91, kl.fns.hd(kl.fns.hd(V2445))))))?(Kl.tailCall(kl.fns.shen$dopair, [kl.fns.hd(Kl.headCall(kl.fns.shen$dopair, [kl.fns.tl(kl.fns.hd(V2445)), Kl.headCall(kl.fns.shen$dohdtl, [V2445])])), new Sym("shen.skip")])):(Kl.tailCall(kl.fns.fail, []));
                    });

kl.defun("shen.<rsb>", 1, function (V2447) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(kl.fns.hd(V2447))) && asJsBool(kl.fns.$eq(93, kl.fns.hd(kl.fns.hd(V2447))))))?(Kl.tailCall(kl.fns.shen$dopair, [kl.fns.hd(Kl.headCall(kl.fns.shen$dopair, [kl.fns.tl(kl.fns.hd(V2447)), Kl.headCall(kl.fns.shen$dohdtl, [V2447])])), new Sym("shen.skip")])):(Kl.tailCall(kl.fns.fail, []));
                    });

kl.defun("shen.<lcurly>", 1, function (V2449) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(kl.fns.hd(V2449))) && asJsBool(kl.fns.$eq(123, kl.fns.hd(kl.fns.hd(V2449))))))?(Kl.tailCall(kl.fns.shen$dopair, [kl.fns.hd(Kl.headCall(kl.fns.shen$dopair, [kl.fns.tl(kl.fns.hd(V2449)), Kl.headCall(kl.fns.shen$dohdtl, [V2449])])), new Sym("shen.skip")])):(Kl.tailCall(kl.fns.fail, []));
                    });

kl.defun("shen.<rcurly>", 1, function (V2451) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(kl.fns.hd(V2451))) && asJsBool(kl.fns.$eq(125, kl.fns.hd(kl.fns.hd(V2451))))))?(Kl.tailCall(kl.fns.shen$dopair, [kl.fns.hd(Kl.headCall(kl.fns.shen$dopair, [kl.fns.tl(kl.fns.hd(V2451)), Kl.headCall(kl.fns.shen$dohdtl, [V2451])])), new Sym("shen.skip")])):(Kl.tailCall(kl.fns.fail, []));
                    });

kl.defun("shen.<bar>", 1, function (V2453) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(kl.fns.hd(V2453))) && asJsBool(kl.fns.$eq(124, kl.fns.hd(kl.fns.hd(V2453))))))?(Kl.tailCall(kl.fns.shen$dopair, [kl.fns.hd(Kl.headCall(kl.fns.shen$dopair, [kl.fns.tl(kl.fns.hd(V2453)), Kl.headCall(kl.fns.shen$dohdtl, [V2453])])), new Sym("shen.skip")])):(Kl.tailCall(kl.fns.fail, []));
                    });

kl.defun("shen.<semicolon>", 1, function (V2455) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(kl.fns.hd(V2455))) && asJsBool(kl.fns.$eq(59, kl.fns.hd(kl.fns.hd(V2455))))))?(Kl.tailCall(kl.fns.shen$dopair, [kl.fns.hd(Kl.headCall(kl.fns.shen$dopair, [kl.fns.tl(kl.fns.hd(V2455)), Kl.headCall(kl.fns.shen$dohdtl, [V2455])])), new Sym("shen.skip")])):(Kl.tailCall(kl.fns.fail, []));
                    });

kl.defun("shen.<colon>", 1, function (V2457) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(kl.fns.hd(V2457))) && asJsBool(kl.fns.$eq(58, kl.fns.hd(kl.fns.hd(V2457))))))?(Kl.tailCall(kl.fns.shen$dopair, [kl.fns.hd(Kl.headCall(kl.fns.shen$dopair, [kl.fns.tl(kl.fns.hd(V2457)), Kl.headCall(kl.fns.shen$dohdtl, [V2457])])), new Sym("shen.skip")])):(Kl.tailCall(kl.fns.fail, []));
                    });

kl.defun("shen.<comma>", 1, function (V2459) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(kl.fns.hd(V2459))) && asJsBool(kl.fns.$eq(44, kl.fns.hd(kl.fns.hd(V2459))))))?(Kl.tailCall(kl.fns.shen$dopair, [kl.fns.hd(Kl.headCall(kl.fns.shen$dopair, [kl.fns.tl(kl.fns.hd(V2459)), Kl.headCall(kl.fns.shen$dohdtl, [V2459])])), new Sym("shen.skip")])):(Kl.tailCall(kl.fns.fail, []));
                    });

kl.defun("shen.<equal>", 1, function (V2461) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(kl.fns.hd(V2461))) && asJsBool(kl.fns.$eq(61, kl.fns.hd(kl.fns.hd(V2461))))))?(Kl.tailCall(kl.fns.shen$dopair, [kl.fns.hd(Kl.headCall(kl.fns.shen$dopair, [kl.fns.tl(kl.fns.hd(V2461)), Kl.headCall(kl.fns.shen$dohdtl, [V2461])])), new Sym("shen.skip")])):(Kl.tailCall(kl.fns.fail, []));
                    });

kl.defun("shen.<minus>", 1, function (V2463) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(kl.fns.hd(V2463))) && asJsBool(kl.fns.$eq(45, kl.fns.hd(kl.fns.hd(V2463))))))?(Kl.tailCall(kl.fns.shen$dopair, [kl.fns.hd(Kl.headCall(kl.fns.shen$dopair, [kl.fns.tl(kl.fns.hd(V2463)), Kl.headCall(kl.fns.shen$dohdtl, [V2463])])), new Sym("shen.skip")])):(Kl.tailCall(kl.fns.fail, []));
                    });

kl.defun("shen.<lrb>", 1, function (V2465) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(kl.fns.hd(V2465))) && asJsBool(kl.fns.$eq(40, kl.fns.hd(kl.fns.hd(V2465))))))?(Kl.tailCall(kl.fns.shen$dopair, [kl.fns.hd(Kl.headCall(kl.fns.shen$dopair, [kl.fns.tl(kl.fns.hd(V2465)), Kl.headCall(kl.fns.shen$dohdtl, [V2465])])), new Sym("shen.skip")])):(Kl.tailCall(kl.fns.fail, []));
                    });

kl.defun("shen.<rrb>", 1, function (V2467) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(kl.fns.hd(V2467))) && asJsBool(kl.fns.$eq(41, kl.fns.hd(kl.fns.hd(V2467))))))?(Kl.tailCall(kl.fns.shen$dopair, [kl.fns.hd(Kl.headCall(kl.fns.shen$dopair, [kl.fns.tl(kl.fns.hd(V2467)), Kl.headCall(kl.fns.shen$dohdtl, [V2467])])), new Sym("shen.skip")])):(Kl.tailCall(kl.fns.fail, []));
                    });

kl.defun("shen.<atom>", 1, function (V2469) {
                      return (function () {
                  const YaccParse = (function () {
                  const Parse$unshen$do$ltstr$gt = Kl.headCall(kl.fns.shen$do$ltstr$gt, [V2469]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltstr$gt)]))?(Kl.headCall(kl.fns.shen$dopair, [kl.fns.hd(Parse$unshen$do$ltstr$gt), Kl.headCall(kl.fns.shen$docontrol_chars, [Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltstr$gt])])])):(Kl.headCall(kl.fns.fail, []));
                })();
                    return asJsBool(kl.fns.$eq(YaccParse, Kl.headCall(kl.fns.fail, [])))?((function () {
                  const YaccParse_1 = (function () {
                  const Parse$unshen$do$ltnumber$gt = Kl.headCall(kl.fns.shen$do$ltnumber$gt, [V2469]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltnumber$gt)]))?(Kl.headCall(kl.fns.shen$dopair, [kl.fns.hd(Parse$unshen$do$ltnumber$gt), Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltnumber$gt])])):(Kl.headCall(kl.fns.fail, []));
                })();
                    return asJsBool(kl.fns.$eq(YaccParse_1, Kl.headCall(kl.fns.fail, [])))?((function () {
                  const Parse$unshen$do$ltsym$gt = Kl.headCall(kl.fns.shen$do$ltsym$gt, [V2469]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltsym$gt)]))?(Kl.tailCall(kl.fns.shen$dopair, [kl.fns.hd(Parse$unshen$do$ltsym$gt), asJsBool(kl.fns.$eq(Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltsym$gt]), "<>"))?(kl.fns.cons(new Sym("vector"), kl.fns.cons(0, null))):(kl.fns.intern(Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltsym$gt])))])):(Kl.tailCall(kl.fns.fail, []));
                })()):(YaccParse_1);
                })()):(YaccParse);
                })();
                    });

kl.defun("shen.control-chars", 1, function (V2471) {
                      return asJsBool(kl.fns.$eq(null, V2471))?(""):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V2471)) && asJsBool(kl.fns.$eq("c", kl.fns.hd(V2471))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V2471))) && asJsBool(kl.fns.$eq("#", kl.fns.hd(kl.fns.tl(V2471))))))?((function () {
                  const CodePoint = Kl.headCall(kl.fns.shen$docode_point, [kl.fns.tl(kl.fns.tl(V2471))]);
                    const AfterCodePoint = Kl.headCall(kl.fns.shen$doafter_codepoint, [kl.fns.tl(kl.fns.tl(V2471))]);
                    return Kl.tailCall(kl.fns.$ats, [kl.fns.n_$gtstring(Kl.headCall(kl.fns.shen$dodecimalise, [CodePoint])), Kl.headCall(kl.fns.shen$docontrol_chars, [AfterCodePoint])]);
                })()):(asJsBool(kl.fns.cons$qu(V2471))?(Kl.tailCall(kl.fns.$ats, [kl.fns.hd(V2471), Kl.headCall(kl.fns.shen$docontrol_chars, [kl.fns.tl(V2471)])])):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.control-chars")]))));
                    });

kl.defun("shen.code-point", 1, function (V2475) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V2475)) && asJsBool(kl.fns.$eq(";", kl.fns.hd(V2475)))))?(""):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V2475)) && asJsBool(Kl.headCall(kl.fns.element$qu, [kl.fns.hd(V2475), kl.fns.cons("0", kl.fns.cons("1", kl.fns.cons("2", kl.fns.cons("3", kl.fns.cons("4", kl.fns.cons("5", kl.fns.cons("6", kl.fns.cons("7", kl.fns.cons("8", kl.fns.cons("9", kl.fns.cons("0", null)))))))))))]))))?(kl.fns.cons(kl.fns.hd(V2475), Kl.headCall(kl.fns.shen$docode_point, [kl.fns.tl(V2475)]))):(kl.fns.simple_error(kl.fns.cn("code point parse error ", Kl.headCall(kl.fns.shen$doapp, [V2475, "\n", new Sym("shen.a")])))));
                    });

kl.defun("shen.after-codepoint", 1, function (V2481) {
                      return asJsBool(kl.fns.$eq(null, V2481))?(null):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V2481)) && asJsBool(kl.fns.$eq(";", kl.fns.hd(V2481)))))?(kl.fns.tl(V2481)):(asJsBool(kl.fns.cons$qu(V2481))?(Kl.tailCall(kl.fns.shen$doafter_codepoint, [kl.fns.tl(V2481)])):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.after-codepoint")]))));
                    });

kl.defun("shen.decimalise", 1, function (V2483) {
                      return Kl.tailCall(kl.fns.shen$dopre, [Kl.headCall(kl.fns.reverse, [Kl.headCall(kl.fns.shen$dodigits_$gtintegers, [V2483])]), 0]);
                    });

kl.defun("shen.digits->integers", 1, function (V2489) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V2489)) && asJsBool(kl.fns.$eq("0", kl.fns.hd(V2489)))))?(kl.fns.cons(0, Kl.headCall(kl.fns.shen$dodigits_$gtintegers, [kl.fns.tl(V2489)]))):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V2489)) && asJsBool(kl.fns.$eq("1", kl.fns.hd(V2489)))))?(kl.fns.cons(1, Kl.headCall(kl.fns.shen$dodigits_$gtintegers, [kl.fns.tl(V2489)]))):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V2489)) && asJsBool(kl.fns.$eq("2", kl.fns.hd(V2489)))))?(kl.fns.cons(2, Kl.headCall(kl.fns.shen$dodigits_$gtintegers, [kl.fns.tl(V2489)]))):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V2489)) && asJsBool(kl.fns.$eq("3", kl.fns.hd(V2489)))))?(kl.fns.cons(3, Kl.headCall(kl.fns.shen$dodigits_$gtintegers, [kl.fns.tl(V2489)]))):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V2489)) && asJsBool(kl.fns.$eq("4", kl.fns.hd(V2489)))))?(kl.fns.cons(4, Kl.headCall(kl.fns.shen$dodigits_$gtintegers, [kl.fns.tl(V2489)]))):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V2489)) && asJsBool(kl.fns.$eq("5", kl.fns.hd(V2489)))))?(kl.fns.cons(5, Kl.headCall(kl.fns.shen$dodigits_$gtintegers, [kl.fns.tl(V2489)]))):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V2489)) && asJsBool(kl.fns.$eq("6", kl.fns.hd(V2489)))))?(kl.fns.cons(6, Kl.headCall(kl.fns.shen$dodigits_$gtintegers, [kl.fns.tl(V2489)]))):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V2489)) && asJsBool(kl.fns.$eq("7", kl.fns.hd(V2489)))))?(kl.fns.cons(7, Kl.headCall(kl.fns.shen$dodigits_$gtintegers, [kl.fns.tl(V2489)]))):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V2489)) && asJsBool(kl.fns.$eq("8", kl.fns.hd(V2489)))))?(kl.fns.cons(8, Kl.headCall(kl.fns.shen$dodigits_$gtintegers, [kl.fns.tl(V2489)]))):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V2489)) && asJsBool(kl.fns.$eq("9", kl.fns.hd(V2489)))))?(kl.fns.cons(9, Kl.headCall(kl.fns.shen$dodigits_$gtintegers, [kl.fns.tl(V2489)]))):(null))))))))));
                    });

kl.defun("shen.<sym>", 1, function (V2491) {
                      return (function () {
                  const Parse$unshen$do$ltalpha$gt = Kl.headCall(kl.fns.shen$do$ltalpha$gt, [V2491]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltalpha$gt)]))?((function () {
                  const Parse$unshen$do$ltalphanums$gt = Kl.headCall(kl.fns.shen$do$ltalphanums$gt, [Parse$unshen$do$ltalpha$gt]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltalphanums$gt)]))?(Kl.tailCall(kl.fns.shen$dopair, [kl.fns.hd(Parse$unshen$do$ltalphanums$gt), Kl.headCall(kl.fns.$ats, [Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltalpha$gt]), Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltalphanums$gt])])])):(Kl.tailCall(kl.fns.fail, []));
                })()):(Kl.tailCall(kl.fns.fail, []));
                })();
                    });

kl.defun("shen.<alphanums>", 1, function (V2493) {
                      return (function () {
                  const YaccParse = (function () {
                  const Parse$unshen$do$ltalphanum$gt = Kl.headCall(kl.fns.shen$do$ltalphanum$gt, [V2493]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltalphanum$gt)]))?((function () {
                  const Parse$unshen$do$ltalphanums$gt = Kl.headCall(kl.fns.shen$do$ltalphanums$gt, [Parse$unshen$do$ltalphanum$gt]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltalphanums$gt)]))?(Kl.headCall(kl.fns.shen$dopair, [kl.fns.hd(Parse$unshen$do$ltalphanums$gt), Kl.headCall(kl.fns.$ats, [Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltalphanum$gt]), Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltalphanums$gt])])])):(Kl.headCall(kl.fns.fail, []));
                })()):(Kl.headCall(kl.fns.fail, []));
                })();
                    return asJsBool(kl.fns.$eq(YaccParse, Kl.headCall(kl.fns.fail, [])))?((function () {
                  const Parse$un$lte$gt = Kl.headCall(kl.fns.$lte$gt, [V2493]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$un$lte$gt)]))?(Kl.tailCall(kl.fns.shen$dopair, [kl.fns.hd(Parse$un$lte$gt), ""])):(Kl.tailCall(kl.fns.fail, []));
                })()):(YaccParse);
                })();
                    });

kl.defun("shen.<alphanum>", 1, function (V2495) {
                      return (function () {
                  const YaccParse = (function () {
                  const Parse$unshen$do$ltalpha$gt = Kl.headCall(kl.fns.shen$do$ltalpha$gt, [V2495]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltalpha$gt)]))?(Kl.headCall(kl.fns.shen$dopair, [kl.fns.hd(Parse$unshen$do$ltalpha$gt), Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltalpha$gt])])):(Kl.headCall(kl.fns.fail, []));
                })();
                    return asJsBool(kl.fns.$eq(YaccParse, Kl.headCall(kl.fns.fail, [])))?((function () {
                  const Parse$unshen$do$ltnum$gt = Kl.headCall(kl.fns.shen$do$ltnum$gt, [V2495]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltnum$gt)]))?(Kl.tailCall(kl.fns.shen$dopair, [kl.fns.hd(Parse$unshen$do$ltnum$gt), Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltnum$gt])])):(Kl.tailCall(kl.fns.fail, []));
                })()):(YaccParse);
                })();
                    });

kl.defun("shen.<num>", 1, function (V2497) {
                      return asJsBool(kl.fns.cons$qu(kl.fns.hd(V2497)))?((function () {
                  const Parse$unChar = kl.fns.hd(kl.fns.hd(V2497));
                    return asJsBool(Kl.headCall(kl.fns.shen$donumbyte$qu, [Parse$unChar]))?(Kl.tailCall(kl.fns.shen$dopair, [kl.fns.hd(Kl.headCall(kl.fns.shen$dopair, [kl.fns.tl(kl.fns.hd(V2497)), Kl.headCall(kl.fns.shen$dohdtl, [V2497])])), kl.fns.n_$gtstring(Parse$unChar)])):(Kl.tailCall(kl.fns.fail, []));
                })()):(Kl.tailCall(kl.fns.fail, []));
                    });

kl.defun("shen.numbyte?", 1, function (V2503) {
                      return asJsBool(kl.fns.$eq(48, V2503))?(klTrue):(asJsBool(kl.fns.$eq(49, V2503))?(klTrue):(asJsBool(kl.fns.$eq(50, V2503))?(klTrue):(asJsBool(kl.fns.$eq(51, V2503))?(klTrue):(asJsBool(kl.fns.$eq(52, V2503))?(klTrue):(asJsBool(kl.fns.$eq(53, V2503))?(klTrue):(asJsBool(kl.fns.$eq(54, V2503))?(klTrue):(asJsBool(kl.fns.$eq(55, V2503))?(klTrue):(asJsBool(kl.fns.$eq(56, V2503))?(klTrue):(asJsBool(kl.fns.$eq(57, V2503))?(klTrue):(klFalse))))))))));
                    });

kl.defun("shen.<alpha>", 1, function (V2505) {
                      return asJsBool(kl.fns.cons$qu(kl.fns.hd(V2505)))?((function () {
                  const Parse$unChar = kl.fns.hd(kl.fns.hd(V2505));
                    return asJsBool(Kl.headCall(kl.fns.shen$dosymbol_code$qu, [Parse$unChar]))?(Kl.tailCall(kl.fns.shen$dopair, [kl.fns.hd(Kl.headCall(kl.fns.shen$dopair, [kl.fns.tl(kl.fns.hd(V2505)), Kl.headCall(kl.fns.shen$dohdtl, [V2505])])), kl.fns.n_$gtstring(Parse$unChar)])):(Kl.tailCall(kl.fns.fail, []));
                })()):(Kl.tailCall(kl.fns.fail, []));
                    });

kl.defun("shen.symbol-code?", 1, function (V2507) {
                      return asKlBool(asJsBool(kl.fns.$eq(V2507, 126)) || asJsBool(asKlBool(asJsBool(kl.fns.$gt(V2507, 94)) && asJsBool(kl.fns.$lt(V2507, 123)))) || asJsBool(asKlBool(asJsBool(kl.fns.$gt(V2507, 59)) && asJsBool(kl.fns.$lt(V2507, 91)))) || asJsBool(asKlBool(asJsBool(kl.fns.$gt(V2507, 41)) && asJsBool(kl.fns.$lt(V2507, 58)) && asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(V2507, 44)])))) || asJsBool(asKlBool(asJsBool(kl.fns.$gt(V2507, 34)) && asJsBool(kl.fns.$lt(V2507, 40)))) || asJsBool(kl.fns.$eq(V2507, 33)));
                    });

kl.defun("shen.<str>", 1, function (V2509) {
                      return (function () {
                  const Parse$unshen$do$ltdbq$gt = Kl.headCall(kl.fns.shen$do$ltdbq$gt, [V2509]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltdbq$gt)]))?((function () {
                  const Parse$unshen$do$ltstrcontents$gt = Kl.headCall(kl.fns.shen$do$ltstrcontents$gt, [Parse$unshen$do$ltdbq$gt]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltstrcontents$gt)]))?((function () {
                  const Parse$unshen$do$ltdbq$gt_1 = Kl.headCall(kl.fns.shen$do$ltdbq$gt, [Parse$unshen$do$ltstrcontents$gt]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltdbq$gt_1)]))?(Kl.tailCall(kl.fns.shen$dopair, [kl.fns.hd(Parse$unshen$do$ltdbq$gt_1), Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltstrcontents$gt])])):(Kl.tailCall(kl.fns.fail, []));
                })()):(Kl.tailCall(kl.fns.fail, []));
                })()):(Kl.tailCall(kl.fns.fail, []));
                })();
                    });

kl.defun("shen.<dbq>", 1, function (V2511) {
                      return asJsBool(kl.fns.cons$qu(kl.fns.hd(V2511)))?((function () {
                  const Parse$unChar = kl.fns.hd(kl.fns.hd(V2511));
                    return asJsBool(kl.fns.$eq(Parse$unChar, 34))?(Kl.tailCall(kl.fns.shen$dopair, [kl.fns.hd(Kl.headCall(kl.fns.shen$dopair, [kl.fns.tl(kl.fns.hd(V2511)), Kl.headCall(kl.fns.shen$dohdtl, [V2511])])), Parse$unChar])):(Kl.tailCall(kl.fns.fail, []));
                })()):(Kl.tailCall(kl.fns.fail, []));
                    });

kl.defun("shen.<strcontents>", 1, function (V2513) {
                      return (function () {
                  const YaccParse = (function () {
                  const Parse$unshen$do$ltstrc$gt = Kl.headCall(kl.fns.shen$do$ltstrc$gt, [V2513]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltstrc$gt)]))?((function () {
                  const Parse$unshen$do$ltstrcontents$gt = Kl.headCall(kl.fns.shen$do$ltstrcontents$gt, [Parse$unshen$do$ltstrc$gt]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltstrcontents$gt)]))?(Kl.headCall(kl.fns.shen$dopair, [kl.fns.hd(Parse$unshen$do$ltstrcontents$gt), kl.fns.cons(Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltstrc$gt]), Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltstrcontents$gt]))])):(Kl.headCall(kl.fns.fail, []));
                })()):(Kl.headCall(kl.fns.fail, []));
                })();
                    return asJsBool(kl.fns.$eq(YaccParse, Kl.headCall(kl.fns.fail, [])))?((function () {
                  const Parse$un$lte$gt = Kl.headCall(kl.fns.$lte$gt, [V2513]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$un$lte$gt)]))?(Kl.tailCall(kl.fns.shen$dopair, [kl.fns.hd(Parse$un$lte$gt), null])):(Kl.tailCall(kl.fns.fail, []));
                })()):(YaccParse);
                })();
                    });

kl.defun("shen.<byte>", 1, function (V2515) {
                      return asJsBool(kl.fns.cons$qu(kl.fns.hd(V2515)))?((function () {
                  const Parse$unChar = kl.fns.hd(kl.fns.hd(V2515));
                    return Kl.tailCall(kl.fns.shen$dopair, [kl.fns.hd(Kl.headCall(kl.fns.shen$dopair, [kl.fns.tl(kl.fns.hd(V2515)), Kl.headCall(kl.fns.shen$dohdtl, [V2515])])), kl.fns.n_$gtstring(Parse$unChar)]);
                })()):(Kl.tailCall(kl.fns.fail, []));
                    });

kl.defun("shen.<strc>", 1, function (V2517) {
                      return asJsBool(kl.fns.cons$qu(kl.fns.hd(V2517)))?((function () {
                  const Parse$unChar = kl.fns.hd(kl.fns.hd(V2517));
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Parse$unChar, 34)]))?(Kl.tailCall(kl.fns.shen$dopair, [kl.fns.hd(Kl.headCall(kl.fns.shen$dopair, [kl.fns.tl(kl.fns.hd(V2517)), Kl.headCall(kl.fns.shen$dohdtl, [V2517])])), kl.fns.n_$gtstring(Parse$unChar)])):(Kl.tailCall(kl.fns.fail, []));
                })()):(Kl.tailCall(kl.fns.fail, []));
                    });

kl.defun("shen.<number>", 1, function (V2519) {
                      return (function () {
                  const YaccParse = (function () {
                  const Parse$unshen$do$ltminus$gt = Kl.headCall(kl.fns.shen$do$ltminus$gt, [V2519]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltminus$gt)]))?((function () {
                  const Parse$unshen$do$ltnumber$gt = Kl.headCall(kl.fns.shen$do$ltnumber$gt, [Parse$unshen$do$ltminus$gt]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltnumber$gt)]))?(Kl.headCall(kl.fns.shen$dopair, [kl.fns.hd(Parse$unshen$do$ltnumber$gt), kl.fns._(0, Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltnumber$gt]))])):(Kl.headCall(kl.fns.fail, []));
                })()):(Kl.headCall(kl.fns.fail, []));
                })();
                    return asJsBool(kl.fns.$eq(YaccParse, Kl.headCall(kl.fns.fail, [])))?((function () {
                  const YaccParse_1 = (function () {
                  const Parse$unshen$do$ltplus$gt = Kl.headCall(kl.fns.shen$do$ltplus$gt, [V2519]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltplus$gt)]))?((function () {
                  const Parse$unshen$do$ltnumber$gt = Kl.headCall(kl.fns.shen$do$ltnumber$gt, [Parse$unshen$do$ltplus$gt]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltnumber$gt)]))?(Kl.headCall(kl.fns.shen$dopair, [kl.fns.hd(Parse$unshen$do$ltnumber$gt), Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltnumber$gt])])):(Kl.headCall(kl.fns.fail, []));
                })()):(Kl.headCall(kl.fns.fail, []));
                })();
                    return asJsBool(kl.fns.$eq(YaccParse_1, Kl.headCall(kl.fns.fail, [])))?((function () {
                  const YaccParse_2 = (function () {
                  const Parse$unshen$do$ltpredigits$gt = Kl.headCall(kl.fns.shen$do$ltpredigits$gt, [V2519]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltpredigits$gt)]))?((function () {
                  const Parse$unshen$do$ltstop$gt = Kl.headCall(kl.fns.shen$do$ltstop$gt, [Parse$unshen$do$ltpredigits$gt]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltstop$gt)]))?((function () {
                  const Parse$unshen$do$ltpostdigits$gt = Kl.headCall(kl.fns.shen$do$ltpostdigits$gt, [Parse$unshen$do$ltstop$gt]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltpostdigits$gt)]))?((function () {
                  const Parse$unshen$do$ltE$gt = Kl.headCall(kl.fns.shen$do$ltE$gt, [Parse$unshen$do$ltpostdigits$gt]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltE$gt)]))?((function () {
                  const Parse$unshen$do$ltlog10$gt = Kl.headCall(kl.fns.shen$do$ltlog10$gt, [Parse$unshen$do$ltE$gt]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltlog10$gt)]))?(Kl.headCall(kl.fns.shen$dopair, [kl.fns.hd(Parse$unshen$do$ltlog10$gt), kl.fns.$st(Kl.headCall(kl.fns.shen$doexpt, [10, Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltlog10$gt])]), kl.fns.$pl(Kl.headCall(kl.fns.shen$dopre, [Kl.headCall(kl.fns.reverse, [Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltpredigits$gt])]), 0]), Kl.headCall(kl.fns.shen$dopost, [Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltpostdigits$gt]), 1])))])):(Kl.headCall(kl.fns.fail, []));
                })()):(Kl.headCall(kl.fns.fail, []));
                })()):(Kl.headCall(kl.fns.fail, []));
                })()):(Kl.headCall(kl.fns.fail, []));
                })()):(Kl.headCall(kl.fns.fail, []));
                })();
                    return asJsBool(kl.fns.$eq(YaccParse_2, Kl.headCall(kl.fns.fail, [])))?((function () {
                  const YaccParse_3 = (function () {
                  const Parse$unshen$do$ltdigits$gt = Kl.headCall(kl.fns.shen$do$ltdigits$gt, [V2519]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltdigits$gt)]))?((function () {
                  const Parse$unshen$do$ltE$gt = Kl.headCall(kl.fns.shen$do$ltE$gt, [Parse$unshen$do$ltdigits$gt]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltE$gt)]))?((function () {
                  const Parse$unshen$do$ltlog10$gt = Kl.headCall(kl.fns.shen$do$ltlog10$gt, [Parse$unshen$do$ltE$gt]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltlog10$gt)]))?(Kl.headCall(kl.fns.shen$dopair, [kl.fns.hd(Parse$unshen$do$ltlog10$gt), kl.fns.$st(Kl.headCall(kl.fns.shen$doexpt, [10, Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltlog10$gt])]), Kl.headCall(kl.fns.shen$dopre, [Kl.headCall(kl.fns.reverse, [Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltdigits$gt])]), 0]))])):(Kl.headCall(kl.fns.fail, []));
                })()):(Kl.headCall(kl.fns.fail, []));
                })()):(Kl.headCall(kl.fns.fail, []));
                })();
                    return asJsBool(kl.fns.$eq(YaccParse_3, Kl.headCall(kl.fns.fail, [])))?((function () {
                  const YaccParse_4 = (function () {
                  const Parse$unshen$do$ltpredigits$gt = Kl.headCall(kl.fns.shen$do$ltpredigits$gt, [V2519]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltpredigits$gt)]))?((function () {
                  const Parse$unshen$do$ltstop$gt = Kl.headCall(kl.fns.shen$do$ltstop$gt, [Parse$unshen$do$ltpredigits$gt]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltstop$gt)]))?((function () {
                  const Parse$unshen$do$ltpostdigits$gt = Kl.headCall(kl.fns.shen$do$ltpostdigits$gt, [Parse$unshen$do$ltstop$gt]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltpostdigits$gt)]))?(Kl.headCall(kl.fns.shen$dopair, [kl.fns.hd(Parse$unshen$do$ltpostdigits$gt), kl.fns.$pl(Kl.headCall(kl.fns.shen$dopre, [Kl.headCall(kl.fns.reverse, [Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltpredigits$gt])]), 0]), Kl.headCall(kl.fns.shen$dopost, [Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltpostdigits$gt]), 1]))])):(Kl.headCall(kl.fns.fail, []));
                })()):(Kl.headCall(kl.fns.fail, []));
                })()):(Kl.headCall(kl.fns.fail, []));
                })();
                    return asJsBool(kl.fns.$eq(YaccParse_4, Kl.headCall(kl.fns.fail, [])))?((function () {
                  const Parse$unshen$do$ltdigits$gt = Kl.headCall(kl.fns.shen$do$ltdigits$gt, [V2519]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltdigits$gt)]))?(Kl.tailCall(kl.fns.shen$dopair, [kl.fns.hd(Parse$unshen$do$ltdigits$gt), Kl.headCall(kl.fns.shen$dopre, [Kl.headCall(kl.fns.reverse, [Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltdigits$gt])]), 0])])):(Kl.tailCall(kl.fns.fail, []));
                })()):(YaccParse_4);
                })()):(YaccParse_3);
                })()):(YaccParse_2);
                })()):(YaccParse_1);
                })()):(YaccParse);
                })();
                    });

kl.defun("shen.<E>", 1, function (V2521) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(kl.fns.hd(V2521))) && asJsBool(kl.fns.$eq(101, kl.fns.hd(kl.fns.hd(V2521))))))?(Kl.tailCall(kl.fns.shen$dopair, [kl.fns.hd(Kl.headCall(kl.fns.shen$dopair, [kl.fns.tl(kl.fns.hd(V2521)), Kl.headCall(kl.fns.shen$dohdtl, [V2521])])), new Sym("shen.skip")])):(Kl.tailCall(kl.fns.fail, []));
                    });

kl.defun("shen.<log10>", 1, function (V2523) {
                      return (function () {
                  const YaccParse = (function () {
                  const Parse$unshen$do$ltminus$gt = Kl.headCall(kl.fns.shen$do$ltminus$gt, [V2523]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltminus$gt)]))?((function () {
                  const Parse$unshen$do$ltdigits$gt = Kl.headCall(kl.fns.shen$do$ltdigits$gt, [Parse$unshen$do$ltminus$gt]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltdigits$gt)]))?(Kl.headCall(kl.fns.shen$dopair, [kl.fns.hd(Parse$unshen$do$ltdigits$gt), kl.fns._(0, Kl.headCall(kl.fns.shen$dopre, [Kl.headCall(kl.fns.reverse, [Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltdigits$gt])]), 0]))])):(Kl.headCall(kl.fns.fail, []));
                })()):(Kl.headCall(kl.fns.fail, []));
                })();
                    return asJsBool(kl.fns.$eq(YaccParse, Kl.headCall(kl.fns.fail, [])))?((function () {
                  const Parse$unshen$do$ltdigits$gt = Kl.headCall(kl.fns.shen$do$ltdigits$gt, [V2523]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltdigits$gt)]))?(Kl.tailCall(kl.fns.shen$dopair, [kl.fns.hd(Parse$unshen$do$ltdigits$gt), Kl.headCall(kl.fns.shen$dopre, [Kl.headCall(kl.fns.reverse, [Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltdigits$gt])]), 0])])):(Kl.tailCall(kl.fns.fail, []));
                })()):(YaccParse);
                })();
                    });

kl.defun("shen.<plus>", 1, function (V2525) {
                      return asJsBool(kl.fns.cons$qu(kl.fns.hd(V2525)))?((function () {
                  const Parse$unChar = kl.fns.hd(kl.fns.hd(V2525));
                    return asJsBool(kl.fns.$eq(Parse$unChar, 43))?(Kl.tailCall(kl.fns.shen$dopair, [kl.fns.hd(Kl.headCall(kl.fns.shen$dopair, [kl.fns.tl(kl.fns.hd(V2525)), Kl.headCall(kl.fns.shen$dohdtl, [V2525])])), Parse$unChar])):(Kl.tailCall(kl.fns.fail, []));
                })()):(Kl.tailCall(kl.fns.fail, []));
                    });

kl.defun("shen.<stop>", 1, function (V2527) {
                      return asJsBool(kl.fns.cons$qu(kl.fns.hd(V2527)))?((function () {
                  const Parse$unChar = kl.fns.hd(kl.fns.hd(V2527));
                    return asJsBool(kl.fns.$eq(Parse$unChar, 46))?(Kl.tailCall(kl.fns.shen$dopair, [kl.fns.hd(Kl.headCall(kl.fns.shen$dopair, [kl.fns.tl(kl.fns.hd(V2527)), Kl.headCall(kl.fns.shen$dohdtl, [V2527])])), Parse$unChar])):(Kl.tailCall(kl.fns.fail, []));
                })()):(Kl.tailCall(kl.fns.fail, []));
                    });

kl.defun("shen.<predigits>", 1, function (V2529) {
                      return (function () {
                  const YaccParse = (function () {
                  const Parse$unshen$do$ltdigits$gt = Kl.headCall(kl.fns.shen$do$ltdigits$gt, [V2529]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltdigits$gt)]))?(Kl.headCall(kl.fns.shen$dopair, [kl.fns.hd(Parse$unshen$do$ltdigits$gt), Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltdigits$gt])])):(Kl.headCall(kl.fns.fail, []));
                })();
                    return asJsBool(kl.fns.$eq(YaccParse, Kl.headCall(kl.fns.fail, [])))?((function () {
                  const Parse$un$lte$gt = Kl.headCall(kl.fns.$lte$gt, [V2529]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$un$lte$gt)]))?(Kl.tailCall(kl.fns.shen$dopair, [kl.fns.hd(Parse$un$lte$gt), null])):(Kl.tailCall(kl.fns.fail, []));
                })()):(YaccParse);
                })();
                    });

kl.defun("shen.<postdigits>", 1, function (V2531) {
                      return (function () {
                  const Parse$unshen$do$ltdigits$gt = Kl.headCall(kl.fns.shen$do$ltdigits$gt, [V2531]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltdigits$gt)]))?(Kl.tailCall(kl.fns.shen$dopair, [kl.fns.hd(Parse$unshen$do$ltdigits$gt), Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltdigits$gt])])):(Kl.tailCall(kl.fns.fail, []));
                })();
                    });

kl.defun("shen.<digits>", 1, function (V2533) {
                      return (function () {
                  const YaccParse = (function () {
                  const Parse$unshen$do$ltdigit$gt = Kl.headCall(kl.fns.shen$do$ltdigit$gt, [V2533]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltdigit$gt)]))?((function () {
                  const Parse$unshen$do$ltdigits$gt = Kl.headCall(kl.fns.shen$do$ltdigits$gt, [Parse$unshen$do$ltdigit$gt]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltdigits$gt)]))?(Kl.headCall(kl.fns.shen$dopair, [kl.fns.hd(Parse$unshen$do$ltdigits$gt), kl.fns.cons(Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltdigit$gt]), Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltdigits$gt]))])):(Kl.headCall(kl.fns.fail, []));
                })()):(Kl.headCall(kl.fns.fail, []));
                })();
                    return asJsBool(kl.fns.$eq(YaccParse, Kl.headCall(kl.fns.fail, [])))?((function () {
                  const Parse$unshen$do$ltdigit$gt = Kl.headCall(kl.fns.shen$do$ltdigit$gt, [V2533]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltdigit$gt)]))?(Kl.tailCall(kl.fns.shen$dopair, [kl.fns.hd(Parse$unshen$do$ltdigit$gt), kl.fns.cons(Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltdigit$gt]), null)])):(Kl.tailCall(kl.fns.fail, []));
                })()):(YaccParse);
                })();
                    });

kl.defun("shen.<digit>", 1, function (V2535) {
                      return asJsBool(kl.fns.cons$qu(kl.fns.hd(V2535)))?((function () {
                  const Parse$unX = kl.fns.hd(kl.fns.hd(V2535));
                    return asJsBool(Kl.headCall(kl.fns.shen$donumbyte$qu, [Parse$unX]))?(Kl.tailCall(kl.fns.shen$dopair, [kl.fns.hd(Kl.headCall(kl.fns.shen$dopair, [kl.fns.tl(kl.fns.hd(V2535)), Kl.headCall(kl.fns.shen$dohdtl, [V2535])])), Kl.headCall(kl.fns.shen$dobyte_$gtdigit, [Parse$unX])])):(Kl.tailCall(kl.fns.fail, []));
                })()):(Kl.tailCall(kl.fns.fail, []));
                    });

kl.defun("shen.byte->digit", 1, function (V2537) {
                      return asJsBool(kl.fns.$eq(48, V2537))?(0):(asJsBool(kl.fns.$eq(49, V2537))?(1):(asJsBool(kl.fns.$eq(50, V2537))?(2):(asJsBool(kl.fns.$eq(51, V2537))?(3):(asJsBool(kl.fns.$eq(52, V2537))?(4):(asJsBool(kl.fns.$eq(53, V2537))?(5):(asJsBool(kl.fns.$eq(54, V2537))?(6):(asJsBool(kl.fns.$eq(55, V2537))?(7):(asJsBool(kl.fns.$eq(56, V2537))?(8):(asJsBool(kl.fns.$eq(57, V2537))?(9):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.byte->digit")])))))))))));
                    });

kl.defun("shen.pre", 2, function (V2542, V2543) {
                      return asJsBool(kl.fns.$eq(null, V2542))?(0):(asJsBool(kl.fns.cons$qu(V2542))?(kl.fns.$pl(kl.fns.$st(Kl.headCall(kl.fns.shen$doexpt, [10, V2543]), kl.fns.hd(V2542)), Kl.headCall(kl.fns.shen$dopre, [kl.fns.tl(V2542), kl.fns.$pl(V2543, 1)]))):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.pre")])));
                    });

kl.defun("shen.post", 2, function (V2548, V2549) {
                      return asJsBool(kl.fns.$eq(null, V2548))?(0):(asJsBool(kl.fns.cons$qu(V2548))?(kl.fns.$pl(kl.fns.$st(Kl.headCall(kl.fns.shen$doexpt, [10, kl.fns._(0, V2549)]), kl.fns.hd(V2548)), Kl.headCall(kl.fns.shen$dopost, [kl.fns.tl(V2548), kl.fns.$pl(V2549, 1)]))):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.post")])));
                    });

kl.defun("shen.expt", 2, function (V2554, V2555) {
                      return asJsBool(kl.fns.$eq(0, V2555))?(1):(asJsBool(kl.fns.$gt(V2555, 0))?(kl.fns.$st(V2554, Kl.headCall(kl.fns.shen$doexpt, [V2554, kl.fns._(V2555, 1)]))):(kl.fns.$st(1, kl.fns.$sl(Kl.headCall(kl.fns.shen$doexpt, [V2554, kl.fns.$pl(V2555, 1)]), V2554))));
                    });

kl.defun("shen.<st_input1>", 1, function (V2557) {
                      return (function () {
                  const Parse$unshen$do$ltst$uninput$gt = Kl.headCall(kl.fns.shen$do$ltst$uninput$gt, [V2557]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltst$uninput$gt)]))?(Kl.tailCall(kl.fns.shen$dopair, [kl.fns.hd(Parse$unshen$do$ltst$uninput$gt), Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltst$uninput$gt])])):(Kl.tailCall(kl.fns.fail, []));
                })();
                    });

kl.defun("shen.<st_input2>", 1, function (V2559) {
                      return (function () {
                  const Parse$unshen$do$ltst$uninput$gt = Kl.headCall(kl.fns.shen$do$ltst$uninput$gt, [V2559]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltst$uninput$gt)]))?(Kl.tailCall(kl.fns.shen$dopair, [kl.fns.hd(Parse$unshen$do$ltst$uninput$gt), Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltst$uninput$gt])])):(Kl.tailCall(kl.fns.fail, []));
                })();
                    });

kl.defun("shen.<comment>", 1, function (V2561) {
                      return (function () {
                  const YaccParse = (function () {
                  const Parse$unshen$do$ltsingleline$gt = Kl.headCall(kl.fns.shen$do$ltsingleline$gt, [V2561]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltsingleline$gt)]))?(Kl.headCall(kl.fns.shen$dopair, [kl.fns.hd(Parse$unshen$do$ltsingleline$gt), new Sym("shen.skip")])):(Kl.headCall(kl.fns.fail, []));
                })();
                    return asJsBool(kl.fns.$eq(YaccParse, Kl.headCall(kl.fns.fail, [])))?((function () {
                  const Parse$unshen$do$ltmultiline$gt = Kl.headCall(kl.fns.shen$do$ltmultiline$gt, [V2561]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltmultiline$gt)]))?(Kl.tailCall(kl.fns.shen$dopair, [kl.fns.hd(Parse$unshen$do$ltmultiline$gt), new Sym("shen.skip")])):(Kl.tailCall(kl.fns.fail, []));
                })()):(YaccParse);
                })();
                    });

kl.defun("shen.<singleline>", 1, function (V2563) {
                      return (function () {
                  const Parse$unshen$do$ltbackslash$gt = Kl.headCall(kl.fns.shen$do$ltbackslash$gt, [V2563]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltbackslash$gt)]))?((function () {
                  const Parse$unshen$do$ltbackslash$gt_1 = Kl.headCall(kl.fns.shen$do$ltbackslash$gt, [Parse$unshen$do$ltbackslash$gt]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltbackslash$gt_1)]))?((function () {
                  const Parse$unshen$do$ltanysingle$gt = Kl.headCall(kl.fns.shen$do$ltanysingle$gt, [Parse$unshen$do$ltbackslash$gt_1]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltanysingle$gt)]))?((function () {
                  const Parse$unshen$do$ltreturn$gt = Kl.headCall(kl.fns.shen$do$ltreturn$gt, [Parse$unshen$do$ltanysingle$gt]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltreturn$gt)]))?(Kl.tailCall(kl.fns.shen$dopair, [kl.fns.hd(Parse$unshen$do$ltreturn$gt), new Sym("shen.skip")])):(Kl.tailCall(kl.fns.fail, []));
                })()):(Kl.tailCall(kl.fns.fail, []));
                })()):(Kl.tailCall(kl.fns.fail, []));
                })()):(Kl.tailCall(kl.fns.fail, []));
                })();
                    });

kl.defun("shen.<backslash>", 1, function (V2565) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(kl.fns.hd(V2565))) && asJsBool(kl.fns.$eq(92, kl.fns.hd(kl.fns.hd(V2565))))))?(Kl.tailCall(kl.fns.shen$dopair, [kl.fns.hd(Kl.headCall(kl.fns.shen$dopair, [kl.fns.tl(kl.fns.hd(V2565)), Kl.headCall(kl.fns.shen$dohdtl, [V2565])])), new Sym("shen.skip")])):(Kl.tailCall(kl.fns.fail, []));
                    });

kl.defun("shen.<anysingle>", 1, function (V2567) {
                      return (function () {
                  const YaccParse = (function () {
                  const Parse$unshen$do$ltnon_return$gt = Kl.headCall(kl.fns.shen$do$ltnon_return$gt, [V2567]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltnon_return$gt)]))?((function () {
                  const Parse$unshen$do$ltanysingle$gt = Kl.headCall(kl.fns.shen$do$ltanysingle$gt, [Parse$unshen$do$ltnon_return$gt]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltanysingle$gt)]))?(Kl.headCall(kl.fns.shen$dopair, [kl.fns.hd(Parse$unshen$do$ltanysingle$gt), new Sym("shen.skip")])):(Kl.headCall(kl.fns.fail, []));
                })()):(Kl.headCall(kl.fns.fail, []));
                })();
                    return asJsBool(kl.fns.$eq(YaccParse, Kl.headCall(kl.fns.fail, [])))?((function () {
                  const Parse$un$lte$gt = Kl.headCall(kl.fns.$lte$gt, [V2567]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$un$lte$gt)]))?(Kl.tailCall(kl.fns.shen$dopair, [kl.fns.hd(Parse$un$lte$gt), new Sym("shen.skip")])):(Kl.tailCall(kl.fns.fail, []));
                })()):(YaccParse);
                })();
                    });

kl.defun("shen.<non-return>", 1, function (V2569) {
                      return asJsBool(kl.fns.cons$qu(kl.fns.hd(V2569)))?((function () {
                  const Parse$unX = kl.fns.hd(kl.fns.hd(V2569));
                    return asJsBool(Kl.headCall(kl.fns.not, [Kl.headCall(kl.fns.element$qu, [Parse$unX, kl.fns.cons(10, kl.fns.cons(13, null))])]))?(Kl.tailCall(kl.fns.shen$dopair, [kl.fns.hd(Kl.headCall(kl.fns.shen$dopair, [kl.fns.tl(kl.fns.hd(V2569)), Kl.headCall(kl.fns.shen$dohdtl, [V2569])])), new Sym("shen.skip")])):(Kl.tailCall(kl.fns.fail, []));
                })()):(Kl.tailCall(kl.fns.fail, []));
                    });

kl.defun("shen.<return>", 1, function (V2571) {
                      return asJsBool(kl.fns.cons$qu(kl.fns.hd(V2571)))?((function () {
                  const Parse$unX = kl.fns.hd(kl.fns.hd(V2571));
                    return asJsBool(Kl.headCall(kl.fns.element$qu, [Parse$unX, kl.fns.cons(10, kl.fns.cons(13, null))]))?(Kl.tailCall(kl.fns.shen$dopair, [kl.fns.hd(Kl.headCall(kl.fns.shen$dopair, [kl.fns.tl(kl.fns.hd(V2571)), Kl.headCall(kl.fns.shen$dohdtl, [V2571])])), new Sym("shen.skip")])):(Kl.tailCall(kl.fns.fail, []));
                })()):(Kl.tailCall(kl.fns.fail, []));
                    });

kl.defun("shen.<multiline>", 1, function (V2573) {
                      return (function () {
                  const Parse$unshen$do$ltbackslash$gt = Kl.headCall(kl.fns.shen$do$ltbackslash$gt, [V2573]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltbackslash$gt)]))?((function () {
                  const Parse$unshen$do$lttimes$gt = Kl.headCall(kl.fns.shen$do$lttimes$gt, [Parse$unshen$do$ltbackslash$gt]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$lttimes$gt)]))?((function () {
                  const Parse$unshen$do$ltanymulti$gt = Kl.headCall(kl.fns.shen$do$ltanymulti$gt, [Parse$unshen$do$lttimes$gt]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltanymulti$gt)]))?(Kl.tailCall(kl.fns.shen$dopair, [kl.fns.hd(Parse$unshen$do$ltanymulti$gt), new Sym("shen.skip")])):(Kl.tailCall(kl.fns.fail, []));
                })()):(Kl.tailCall(kl.fns.fail, []));
                })()):(Kl.tailCall(kl.fns.fail, []));
                })();
                    });

kl.defun("shen.<times>", 1, function (V2575) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(kl.fns.hd(V2575))) && asJsBool(kl.fns.$eq(42, kl.fns.hd(kl.fns.hd(V2575))))))?(Kl.tailCall(kl.fns.shen$dopair, [kl.fns.hd(Kl.headCall(kl.fns.shen$dopair, [kl.fns.tl(kl.fns.hd(V2575)), Kl.headCall(kl.fns.shen$dohdtl, [V2575])])), new Sym("shen.skip")])):(Kl.tailCall(kl.fns.fail, []));
                    });

kl.defun("shen.<anymulti>", 1, function (V2577) {
                      return (function () {
                  const YaccParse = (function () {
                  const Parse$unshen$do$ltcomment$gt = Kl.headCall(kl.fns.shen$do$ltcomment$gt, [V2577]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltcomment$gt)]))?((function () {
                  const Parse$unshen$do$ltanymulti$gt = Kl.headCall(kl.fns.shen$do$ltanymulti$gt, [Parse$unshen$do$ltcomment$gt]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltanymulti$gt)]))?(Kl.headCall(kl.fns.shen$dopair, [kl.fns.hd(Parse$unshen$do$ltanymulti$gt), new Sym("shen.skip")])):(Kl.headCall(kl.fns.fail, []));
                })()):(Kl.headCall(kl.fns.fail, []));
                })();
                    return asJsBool(kl.fns.$eq(YaccParse, Kl.headCall(kl.fns.fail, [])))?((function () {
                  const YaccParse_1 = (function () {
                  const Parse$unshen$do$lttimes$gt = Kl.headCall(kl.fns.shen$do$lttimes$gt, [V2577]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$lttimes$gt)]))?((function () {
                  const Parse$unshen$do$ltbackslash$gt = Kl.headCall(kl.fns.shen$do$ltbackslash$gt, [Parse$unshen$do$lttimes$gt]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltbackslash$gt)]))?(Kl.headCall(kl.fns.shen$dopair, [kl.fns.hd(Parse$unshen$do$ltbackslash$gt), new Sym("shen.skip")])):(Kl.headCall(kl.fns.fail, []));
                })()):(Kl.headCall(kl.fns.fail, []));
                })();
                    return asJsBool(kl.fns.$eq(YaccParse_1, Kl.headCall(kl.fns.fail, [])))?(asJsBool(kl.fns.cons$qu(kl.fns.hd(V2577)))?((function () {
                  const Parse$unX = kl.fns.hd(kl.fns.hd(V2577));
                    const Parse$unshen$do$ltanymulti$gt = Kl.headCall(kl.fns.shen$do$ltanymulti$gt, [Kl.headCall(kl.fns.shen$dopair, [kl.fns.tl(kl.fns.hd(V2577)), Kl.headCall(kl.fns.shen$dohdtl, [V2577])])]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltanymulti$gt)]))?(Kl.tailCall(kl.fns.shen$dopair, [kl.fns.hd(Parse$unshen$do$ltanymulti$gt), new Sym("shen.skip")])):(Kl.tailCall(kl.fns.fail, []));
                })()):(Kl.tailCall(kl.fns.fail, []))):(YaccParse_1);
                })()):(YaccParse);
                })();
                    });

kl.defun("shen.<whitespaces>", 1, function (V2579) {
                      return (function () {
                  const YaccParse = (function () {
                  const Parse$unshen$do$ltwhitespace$gt = Kl.headCall(kl.fns.shen$do$ltwhitespace$gt, [V2579]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltwhitespace$gt)]))?((function () {
                  const Parse$unshen$do$ltwhitespaces$gt = Kl.headCall(kl.fns.shen$do$ltwhitespaces$gt, [Parse$unshen$do$ltwhitespace$gt]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltwhitespaces$gt)]))?(Kl.headCall(kl.fns.shen$dopair, [kl.fns.hd(Parse$unshen$do$ltwhitespaces$gt), new Sym("shen.skip")])):(Kl.headCall(kl.fns.fail, []));
                })()):(Kl.headCall(kl.fns.fail, []));
                })();
                    return asJsBool(kl.fns.$eq(YaccParse, Kl.headCall(kl.fns.fail, [])))?((function () {
                  const Parse$unshen$do$ltwhitespace$gt = Kl.headCall(kl.fns.shen$do$ltwhitespace$gt, [V2579]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltwhitespace$gt)]))?(Kl.tailCall(kl.fns.shen$dopair, [kl.fns.hd(Parse$unshen$do$ltwhitespace$gt), new Sym("shen.skip")])):(Kl.tailCall(kl.fns.fail, []));
                })()):(YaccParse);
                })();
                    });

kl.defun("shen.<whitespace>", 1, function (V2581) {
                      return asJsBool(kl.fns.cons$qu(kl.fns.hd(V2581)))?((function () {
                  const Parse$unX = kl.fns.hd(kl.fns.hd(V2581));
                    return asJsBool((function () {
                  const Parse$unCase = Parse$unX;
                    return asKlBool(asJsBool(kl.fns.$eq(Parse$unCase, 32)) || asJsBool(kl.fns.$eq(Parse$unCase, 13)) || asJsBool(kl.fns.$eq(Parse$unCase, 10)) || asJsBool(kl.fns.$eq(Parse$unCase, 9)));
                })())?(Kl.tailCall(kl.fns.shen$dopair, [kl.fns.hd(Kl.headCall(kl.fns.shen$dopair, [kl.fns.tl(kl.fns.hd(V2581)), Kl.headCall(kl.fns.shen$dohdtl, [V2581])])), new Sym("shen.skip")])):(Kl.tailCall(kl.fns.fail, []));
                })()):(Kl.tailCall(kl.fns.fail, []));
                    });

kl.defun("shen.cons_form", 1, function (V2583) {
                      return asJsBool(kl.fns.$eq(null, V2583))?(null):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V2583)) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V2583))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(V2583)))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.tl(V2583))))) && asJsBool(kl.fns.$eq(kl.fns.hd(kl.fns.tl(V2583)), new Sym("bar!")))))?(kl.fns.cons(new Sym("cons"), kl.fns.cons(kl.fns.hd(V2583), kl.fns.tl(kl.fns.tl(V2583))))):(asJsBool(kl.fns.cons$qu(V2583))?(kl.fns.cons(new Sym("cons"), kl.fns.cons(kl.fns.hd(V2583), kl.fns.cons(Kl.headCall(kl.fns.shen$docons$unform, [kl.fns.tl(V2583)]), null)))):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.cons_form")]))));
                    });

kl.defun("shen.package-macro", 2, function (V2588, V2589) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V2588)) && asJsBool(kl.fns.$eq(new Sym("$"), kl.fns.hd(V2588))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V2588))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(V2588))))))?(Kl.tailCall(kl.fns.append, [Kl.headCall(kl.fns.explode, [kl.fns.hd(kl.fns.tl(V2588))]), V2589])):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V2588)) && asJsBool(kl.fns.$eq(new Sym("package"), kl.fns.hd(V2588))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V2588))) && asJsBool(kl.fns.$eq(new Sym("null"), kl.fns.hd(kl.fns.tl(V2588)))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(V2588))))))?(Kl.tailCall(kl.fns.append, [kl.fns.tl(kl.fns.tl(kl.fns.tl(V2588))), V2589])):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V2588)) && asJsBool(kl.fns.$eq(new Sym("package"), kl.fns.hd(V2588))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V2588))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(V2588))))))?((function () {
                  const ListofExceptions = Kl.headCall(kl.fns.shen$doeval_without_macros, [kl.fns.hd(kl.fns.tl(kl.fns.tl(V2588)))]);
                    const External = Kl.headCall(kl.fns.shen$dorecord_exceptions, [ListofExceptions, kl.fns.hd(kl.fns.tl(V2588))]);
                    const PackageNameDot = kl.fns.intern(kl.fns.cn(kl.fns.str(kl.fns.hd(kl.fns.tl(V2588))), "."));
                    const ExpPackageNameDot = Kl.headCall(kl.fns.explode, [PackageNameDot]);
                    const Packaged = Kl.headCall(kl.fns.shen$dopackageh, [PackageNameDot, ListofExceptions, kl.fns.tl(kl.fns.tl(kl.fns.tl(V2588))), ExpPackageNameDot]);
                    const Internal = Kl.headCall(kl.fns.shen$dorecord_internal, [kl.fns.hd(kl.fns.tl(V2588)), Kl.headCall(kl.fns.shen$dointernal_symbols, [ExpPackageNameDot, Packaged])]);
                    return Kl.tailCall(kl.fns.append, [Packaged, V2589]);
                })()):(kl.fns.cons(V2588, V2589))));
                    });

kl.defun("shen.record-exceptions", 2, function (V2592, V2593) {
                      return (function () {
                  const CurrExceptions = (function () {
                          try {
                            return Kl.headCall(kl.fns.get, [V2593, new Sym("shen.external-symbols"), kl.fns.value(new Sym("*property-vector*"))]);
                          } catch (E) {
                            return null;
                          }
                        })();
                    const AllExceptions = Kl.headCall(kl.fns.union, [V2592, CurrExceptions]);
                    return Kl.tailCall(kl.fns.put, [V2593, new Sym("shen.external-symbols"), AllExceptions, kl.fns.value(new Sym("*property-vector*"))]);
                })();
                    });

kl.defun("shen.record-internal", 2, function (V2596, V2597) {
                      return Kl.tailCall(kl.fns.put, [V2596, new Sym("shen.internal-symbols"), Kl.headCall(kl.fns.union, [V2597, (function () {
                          try {
                            return Kl.headCall(kl.fns.get, [V2596, new Sym("shen.internal-symbols"), kl.fns.value(new Sym("*property-vector*"))]);
                          } catch (E) {
                            return null;
                          }
                        })()]), kl.fns.value(new Sym("*property-vector*"))]);
                    });

kl.defun("shen.internal-symbols", 2, function (V2608, V2609) {
                      return asJsBool(asKlBool(asJsBool(Kl.headCall(kl.fns.symbol$qu, [V2609])) && asJsBool(Kl.headCall(kl.fns.shen$doprefix$qu, [V2608, Kl.headCall(kl.fns.explode, [V2609])]))))?(kl.fns.cons(V2609, null)):(asJsBool(kl.fns.cons$qu(V2609))?(Kl.tailCall(kl.fns.union, [Kl.headCall(kl.fns.shen$dointernal_symbols, [V2608, kl.fns.hd(V2609)]), Kl.headCall(kl.fns.shen$dointernal_symbols, [V2608, kl.fns.tl(V2609)])])):(null));
                    });

kl.defun("shen.packageh", 4, function (V2626, V2627, V2628, V2629) {
                      return asJsBool(kl.fns.cons$qu(V2628))?(kl.fns.cons(Kl.headCall(kl.fns.shen$dopackageh, [V2626, V2627, kl.fns.hd(V2628), V2629]), Kl.headCall(kl.fns.shen$dopackageh, [V2626, V2627, kl.fns.tl(V2628), V2629]))):(asJsBool(asKlBool(asJsBool(Kl.headCall(kl.fns.shen$dosysfunc$qu, [V2628])) || asJsBool(Kl.headCall(kl.fns.variable$qu, [V2628])) || asJsBool(Kl.headCall(kl.fns.element$qu, [V2628, V2627])) || asJsBool(Kl.headCall(kl.fns.shen$dodoubleunderline$qu, [V2628])) || asJsBool(Kl.headCall(kl.fns.shen$dosingleunderline$qu, [V2628]))))?(V2628):(asJsBool(asKlBool(asJsBool(Kl.headCall(kl.fns.symbol$qu, [V2628])) && asJsBool((function () {
                  const ExplodeX = Kl.headCall(kl.fns.explode, [V2628]);
                    return asKlBool(asJsBool(Kl.headCall(kl.fns.not, [Kl.headCall(kl.fns.shen$doprefix$qu, [kl.fns.cons("s", kl.fns.cons("h", kl.fns.cons("e", kl.fns.cons("n", kl.fns.cons(".", null))))), ExplodeX])])) && asJsBool(Kl.headCall(kl.fns.not, [Kl.headCall(kl.fns.shen$doprefix$qu, [V2629, ExplodeX])])));
                })())))?(Kl.tailCall(kl.fns.concat, [V2626, V2628])):(V2628)));
                    });

kl.defun("shen.<defprolog>", 1, function (V1809) {
                      return (function () {
                  const Parse$unshen$do$ltpredicate$st$gt = Kl.headCall(kl.fns.shen$do$ltpredicate$st$gt, [V1809]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltpredicate$st$gt)]))?((function () {
                  const Parse$unshen$do$ltclauses$st$gt = Kl.headCall(kl.fns.shen$do$ltclauses$st$gt, [Parse$unshen$do$ltpredicate$st$gt]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltclauses$st$gt)]))?(Kl.tailCall(kl.fns.shen$dopair, [kl.fns.hd(Parse$unshen$do$ltclauses$st$gt), kl.fns.hd(Kl.headCall(kl.fns.shen$doprolog_$gtshen, [Kl.headCall(kl.fns.map, [Kl.setArity("shen.<defprolog>_lambda", 1, function (Parse$unX) {
                      return Kl.tailCall(kl.fns.shen$doinsert_predicate, [Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltpredicate$st$gt]), Parse$unX]);
                    }), Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltclauses$st$gt])])]))])):(Kl.tailCall(kl.fns.fail, []));
                })()):(Kl.tailCall(kl.fns.fail, []));
                })();
                    });

kl.defun("shen.prolog-error", 2, function (V1818, V1819) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1819)) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V1819))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(V1819))))))?(kl.fns.simple_error(kl.fns.cn("prolog syntax error in ", Kl.headCall(kl.fns.shen$doapp, [V1818, kl.fns.cn(" here:\n\n ", Kl.headCall(kl.fns.shen$doapp, [Kl.headCall(kl.fns.shen$donext_50, [50, kl.fns.hd(V1819)]), "\n", new Sym("shen.a")])), new Sym("shen.a")])))):(kl.fns.simple_error(kl.fns.cn("prolog syntax error in ", Kl.headCall(kl.fns.shen$doapp, [V1818, "\n", new Sym("shen.a")]))));
                    });

kl.defun("shen.next-50", 2, function (V1826, V1827) {
                      return asJsBool(kl.fns.$eq(null, V1827))?(""):(asJsBool(kl.fns.$eq(0, V1826))?(""):(asJsBool(kl.fns.cons$qu(V1827))?(kl.fns.cn(Kl.headCall(kl.fns.shen$dodecons_string, [kl.fns.hd(V1827)]), Kl.headCall(kl.fns.shen$donext_50, [kl.fns._(V1826, 1), kl.fns.tl(V1827)]))):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.next-50")]))));
                    });

kl.defun("shen.decons-string", 1, function (V1829) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1829)) && asJsBool(kl.fns.$eq(new Sym("cons"), kl.fns.hd(V1829))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V1829))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(V1829)))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.tl(V1829)))))))?(Kl.tailCall(kl.fns.shen$doapp, [Kl.headCall(kl.fns.shen$doeval_cons, [V1829]), " ", new Sym("shen.s")])):(Kl.tailCall(kl.fns.shen$doapp, [V1829, " ", new Sym("shen.r")]));
                    });

kl.defun("shen.insert-predicate", 2, function (V1832, V1833) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1833)) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V1833))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(V1833))))))?(kl.fns.cons(kl.fns.cons(V1832, kl.fns.hd(V1833)), kl.fns.cons(new Sym(":-"), kl.fns.tl(V1833)))):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.insert-predicate")]));
                    });

kl.defun("shen.<predicate*>", 1, function (V1835) {
                      return asJsBool(kl.fns.cons$qu(kl.fns.hd(V1835)))?((function () {
                  const Parse$unX = kl.fns.hd(kl.fns.hd(V1835));
                    return Kl.tailCall(kl.fns.shen$dopair, [kl.fns.hd(Kl.headCall(kl.fns.shen$dopair, [kl.fns.tl(kl.fns.hd(V1835)), Kl.headCall(kl.fns.shen$dohdtl, [V1835])])), Parse$unX]);
                })()):(Kl.tailCall(kl.fns.fail, []));
                    });

kl.defun("shen.<clauses*>", 1, function (V1837) {
                      return (function () {
                  const YaccParse = (function () {
                  const Parse$unshen$do$ltclause$st$gt = Kl.headCall(kl.fns.shen$do$ltclause$st$gt, [V1837]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltclause$st$gt)]))?((function () {
                  const Parse$unshen$do$ltclauses$st$gt = Kl.headCall(kl.fns.shen$do$ltclauses$st$gt, [Parse$unshen$do$ltclause$st$gt]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltclauses$st$gt)]))?(Kl.headCall(kl.fns.shen$dopair, [kl.fns.hd(Parse$unshen$do$ltclauses$st$gt), kl.fns.cons(Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltclause$st$gt]), Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltclauses$st$gt]))])):(Kl.headCall(kl.fns.fail, []));
                })()):(Kl.headCall(kl.fns.fail, []));
                })();
                    return asJsBool(kl.fns.$eq(YaccParse, Kl.headCall(kl.fns.fail, [])))?((function () {
                  const Parse$un$lte$gt = Kl.headCall(kl.fns.$lte$gt, [V1837]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$un$lte$gt)]))?(Kl.tailCall(kl.fns.shen$dopair, [kl.fns.hd(Parse$un$lte$gt), null])):(Kl.tailCall(kl.fns.fail, []));
                })()):(YaccParse);
                })();
                    });

kl.defun("shen.<clause*>", 1, function (V1839) {
                      return (function () {
                  const Parse$unshen$do$lthead$st$gt = Kl.headCall(kl.fns.shen$do$lthead$st$gt, [V1839]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$lthead$st$gt)]))?(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(kl.fns.hd(Parse$unshen$do$lthead$st$gt))) && asJsBool(kl.fns.$eq(new Sym("<--"), kl.fns.hd(kl.fns.hd(Parse$unshen$do$lthead$st$gt))))))?((function () {
                  const Parse$unshen$do$ltbody$st$gt = Kl.headCall(kl.fns.shen$do$ltbody$st$gt, [Kl.headCall(kl.fns.shen$dopair, [kl.fns.tl(kl.fns.hd(Parse$unshen$do$lthead$st$gt)), Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$lthead$st$gt])])]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltbody$st$gt)]))?((function () {
                  const Parse$unshen$do$ltend$st$gt = Kl.headCall(kl.fns.shen$do$ltend$st$gt, [Parse$unshen$do$ltbody$st$gt]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltend$st$gt)]))?(Kl.tailCall(kl.fns.shen$dopair, [kl.fns.hd(Parse$unshen$do$ltend$st$gt), kl.fns.cons(Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$lthead$st$gt]), kl.fns.cons(Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltbody$st$gt]), null))])):(Kl.tailCall(kl.fns.fail, []));
                })()):(Kl.tailCall(kl.fns.fail, []));
                })()):(Kl.tailCall(kl.fns.fail, []))):(Kl.tailCall(kl.fns.fail, []));
                })();
                    });

kl.defun("shen.<head*>", 1, function (V1841) {
                      return (function () {
                  const YaccParse = (function () {
                  const Parse$unshen$do$ltterm$st$gt = Kl.headCall(kl.fns.shen$do$ltterm$st$gt, [V1841]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltterm$st$gt)]))?((function () {
                  const Parse$unshen$do$lthead$st$gt = Kl.headCall(kl.fns.shen$do$lthead$st$gt, [Parse$unshen$do$ltterm$st$gt]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$lthead$st$gt)]))?(Kl.headCall(kl.fns.shen$dopair, [kl.fns.hd(Parse$unshen$do$lthead$st$gt), kl.fns.cons(Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltterm$st$gt]), Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$lthead$st$gt]))])):(Kl.headCall(kl.fns.fail, []));
                })()):(Kl.headCall(kl.fns.fail, []));
                })();
                    return asJsBool(kl.fns.$eq(YaccParse, Kl.headCall(kl.fns.fail, [])))?((function () {
                  const Parse$un$lte$gt = Kl.headCall(kl.fns.$lte$gt, [V1841]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$un$lte$gt)]))?(Kl.tailCall(kl.fns.shen$dopair, [kl.fns.hd(Parse$un$lte$gt), null])):(Kl.tailCall(kl.fns.fail, []));
                })()):(YaccParse);
                })();
                    });

kl.defun("shen.<term*>", 1, function (V1843) {
                      return asJsBool(kl.fns.cons$qu(kl.fns.hd(V1843)))?((function () {
                  const Parse$unX = kl.fns.hd(kl.fns.hd(V1843));
                    return asJsBool(asKlBool(asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(new Sym("<--"), Parse$unX)])) && asJsBool(Kl.headCall(kl.fns.shen$dolegitimate_term$qu, [Parse$unX]))))?(Kl.tailCall(kl.fns.shen$dopair, [kl.fns.hd(Kl.headCall(kl.fns.shen$dopair, [kl.fns.tl(kl.fns.hd(V1843)), Kl.headCall(kl.fns.shen$dohdtl, [V1843])])), Kl.headCall(kl.fns.shen$doeval_cons, [Parse$unX])])):(Kl.tailCall(kl.fns.fail, []));
                })()):(Kl.tailCall(kl.fns.fail, []));
                    });

kl.defun("shen.legitimate-term?", 1, function (V1849) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1849)) && asJsBool(kl.fns.$eq(new Sym("cons"), kl.fns.hd(V1849))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V1849))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(V1849)))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.tl(V1849)))))))?(asKlBool(asJsBool(Kl.headCall(kl.fns.shen$dolegitimate_term$qu, [kl.fns.hd(kl.fns.tl(V1849))])) && asJsBool(Kl.headCall(kl.fns.shen$dolegitimate_term$qu, [kl.fns.hd(kl.fns.tl(kl.fns.tl(V1849)))])))):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1849)) && asJsBool(kl.fns.$eq(new Sym("mode"), kl.fns.hd(V1849))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V1849))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(V1849)))) && asJsBool(kl.fns.$eq(new Sym("+"), kl.fns.hd(kl.fns.tl(kl.fns.tl(V1849))))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.tl(V1849)))))))?(Kl.tailCall(kl.fns.shen$dolegitimate_term$qu, [kl.fns.hd(kl.fns.tl(V1849))])):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1849)) && asJsBool(kl.fns.$eq(new Sym("mode"), kl.fns.hd(V1849))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V1849))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(V1849)))) && asJsBool(kl.fns.$eq(new Sym("-"), kl.fns.hd(kl.fns.tl(kl.fns.tl(V1849))))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.tl(V1849)))))))?(Kl.tailCall(kl.fns.shen$dolegitimate_term$qu, [kl.fns.hd(kl.fns.tl(V1849))])):(asJsBool(kl.fns.cons$qu(V1849))?(klFalse):(klTrue))));
                    });

kl.defun("shen.eval-cons", 1, function (V1851) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1851)) && asJsBool(kl.fns.$eq(new Sym("cons"), kl.fns.hd(V1851))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V1851))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(V1851)))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.tl(V1851)))))))?(kl.fns.cons(Kl.headCall(kl.fns.shen$doeval_cons, [kl.fns.hd(kl.fns.tl(V1851))]), Kl.headCall(kl.fns.shen$doeval_cons, [kl.fns.hd(kl.fns.tl(kl.fns.tl(V1851)))]))):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1851)) && asJsBool(kl.fns.$eq(new Sym("mode"), kl.fns.hd(V1851))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V1851))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(V1851)))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.tl(V1851)))))))?(kl.fns.cons(new Sym("mode"), kl.fns.cons(Kl.headCall(kl.fns.shen$doeval_cons, [kl.fns.hd(kl.fns.tl(V1851))]), kl.fns.tl(kl.fns.tl(V1851))))):(V1851));
                    });

kl.defun("shen.<body*>", 1, function (V1853) {
                      return (function () {
                  const YaccParse = (function () {
                  const Parse$unshen$do$ltliteral$st$gt = Kl.headCall(kl.fns.shen$do$ltliteral$st$gt, [V1853]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltliteral$st$gt)]))?((function () {
                  const Parse$unshen$do$ltbody$st$gt = Kl.headCall(kl.fns.shen$do$ltbody$st$gt, [Parse$unshen$do$ltliteral$st$gt]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltbody$st$gt)]))?(Kl.headCall(kl.fns.shen$dopair, [kl.fns.hd(Parse$unshen$do$ltbody$st$gt), kl.fns.cons(Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltliteral$st$gt]), Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltbody$st$gt]))])):(Kl.headCall(kl.fns.fail, []));
                })()):(Kl.headCall(kl.fns.fail, []));
                })();
                    return asJsBool(kl.fns.$eq(YaccParse, Kl.headCall(kl.fns.fail, [])))?((function () {
                  const Parse$un$lte$gt = Kl.headCall(kl.fns.$lte$gt, [V1853]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$un$lte$gt)]))?(Kl.tailCall(kl.fns.shen$dopair, [kl.fns.hd(Parse$un$lte$gt), null])):(Kl.tailCall(kl.fns.fail, []));
                })()):(YaccParse);
                })();
                    });

kl.defun("shen.<literal*>", 1, function (V1855) {
                      return (function () {
                  const YaccParse = asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(kl.fns.hd(V1855))) && asJsBool(kl.fns.$eq(new Sym("!"), kl.fns.hd(kl.fns.hd(V1855))))))?(Kl.headCall(kl.fns.shen$dopair, [kl.fns.hd(Kl.headCall(kl.fns.shen$dopair, [kl.fns.tl(kl.fns.hd(V1855)), Kl.headCall(kl.fns.shen$dohdtl, [V1855])])), kl.fns.cons(new Sym("cut"), kl.fns.cons(kl.fns.intern("Throwcontrol"), null))])):(Kl.headCall(kl.fns.fail, []));
                    return asJsBool(kl.fns.$eq(YaccParse, Kl.headCall(kl.fns.fail, [])))?(asJsBool(kl.fns.cons$qu(kl.fns.hd(V1855)))?((function () {
                  const Parse$unX = kl.fns.hd(kl.fns.hd(V1855));
                    return asJsBool(kl.fns.cons$qu(Parse$unX))?(Kl.tailCall(kl.fns.shen$dopair, [kl.fns.hd(Kl.headCall(kl.fns.shen$dopair, [kl.fns.tl(kl.fns.hd(V1855)), Kl.headCall(kl.fns.shen$dohdtl, [V1855])])), Parse$unX])):(Kl.tailCall(kl.fns.fail, []));
                })()):(Kl.tailCall(kl.fns.fail, []))):(YaccParse);
                })();
                    });

kl.defun("shen.<end*>", 1, function (V1857) {
                      return asJsBool(kl.fns.cons$qu(kl.fns.hd(V1857)))?((function () {
                  const Parse$unX = kl.fns.hd(kl.fns.hd(V1857));
                    return asJsBool(kl.fns.$eq(Parse$unX, new Sym(";")))?(Kl.tailCall(kl.fns.shen$dopair, [kl.fns.hd(Kl.headCall(kl.fns.shen$dopair, [kl.fns.tl(kl.fns.hd(V1857)), Kl.headCall(kl.fns.shen$dohdtl, [V1857])])), Parse$unX])):(Kl.tailCall(kl.fns.fail, []));
                })()):(Kl.tailCall(kl.fns.fail, []));
                    });

kl.defun("cut", 3, function (V1861, V1862, V1863) {
                      return (function () {
                  const Result = Kl.headCall(kl.fns.thaw, [V1863]);
                    return asJsBool(kl.fns.$eq(Result, klFalse))?(V1861):(Result);
                })();
                    });

kl.defun("shen.insert_modes", 1, function (V1865) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1865)) && asJsBool(kl.fns.$eq(new Sym("mode"), kl.fns.hd(V1865))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V1865))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(V1865)))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.tl(V1865)))))))?(V1865):(asJsBool(kl.fns.$eq(null, V1865))?(null):(asJsBool(kl.fns.cons$qu(V1865))?(kl.fns.cons(kl.fns.cons(new Sym("mode"), kl.fns.cons(kl.fns.hd(V1865), kl.fns.cons(new Sym("+"), null))), kl.fns.cons(new Sym("mode"), kl.fns.cons(Kl.headCall(kl.fns.shen$doinsert$unmodes, [kl.fns.tl(V1865)]), kl.fns.cons(new Sym("-"), null))))):(V1865)));
                    });

kl.defun("shen.s-prolog", 1, function (V1867) {
                      return Kl.tailCall(kl.fns.map, [Kl.setArity("shen.s-prolog_lambda", 1, function (X) {
                      return Kl.tailCall(kl.fns.eval, [X]);
                    }), Kl.headCall(kl.fns.shen$doprolog_$gtshen, [V1867])]);
                    });

kl.defun("shen.prolog->shen", 1, function (V1869) {
                      return Kl.tailCall(kl.fns.map, [Kl.setArity("shen.prolog->shen_lambda", 1, function (X) {
                      return Kl.tailCall(kl.fns.shen$docompile$unprolog$unprocedure, [X]);
                    }), Kl.headCall(kl.fns.shen$dogroup$unclauses, [Kl.headCall(kl.fns.map, [Kl.setArity("shen.prolog->shen_lambda", 1, function (X) {
                      return Kl.tailCall(kl.fns.shen$dos_prolog$unclause, [X]);
                    }), Kl.headCall(kl.fns.mapcan, [Kl.setArity("shen.prolog->shen_lambda", 1, function (X) {
                      return Kl.tailCall(kl.fns.shen$dohead$unabstraction, [X]);
                    }), V1869])])])]);
                    });

kl.defun("shen.s-prolog_clause", 1, function (V1871) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1871)) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V1871))) && asJsBool(kl.fns.$eq(new Sym(":-"), kl.fns.hd(kl.fns.tl(V1871)))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(V1871)))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.tl(V1871)))))))?(kl.fns.cons(kl.fns.hd(V1871), kl.fns.cons(new Sym(":-"), kl.fns.cons(Kl.headCall(kl.fns.map, [Kl.setArity("shen.s-prolog_clause_lambda", 1, function (X) {
                      return Kl.tailCall(kl.fns.shen$dos_prolog$unliteral, [X]);
                    }), kl.fns.hd(kl.fns.tl(kl.fns.tl(V1871)))]), null)))):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.s-prolog_clause")]));
                    });

kl.defun("shen.head_abstraction", 1, function (V1873) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1873)) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V1873))) && asJsBool(kl.fns.$eq(new Sym(":-"), kl.fns.hd(kl.fns.tl(V1873)))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(V1873)))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.tl(V1873))))) && asJsBool((function () {
                          try {
                            return kl.fns.$lt(Kl.headCall(kl.fns.shen$docomplexity$unhead, [kl.fns.hd(V1873)]), kl.fns.value(new Sym("shen.*maxcomplexity*")));
                          } catch ($un) {
                            return klFalse;
                          }
                        })())))?(kl.fns.cons(V1873, null)):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1873)) && asJsBool(kl.fns.cons$qu(kl.fns.hd(V1873))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V1873))) && asJsBool(kl.fns.$eq(new Sym(":-"), kl.fns.hd(kl.fns.tl(V1873)))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(V1873)))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.tl(V1873)))))))?((function () {
                  const Terms = Kl.headCall(kl.fns.map, [Kl.setArity("shen.head_abstraction_lambda", 1, function (Y) {
                      return Kl.tailCall(kl.fns.gensym, [new Sym("V")]);
                    }), kl.fns.tl(kl.fns.hd(V1873))]);
                    const XTerms = Kl.headCall(kl.fns.shen$dorcons$unform, [Kl.headCall(kl.fns.shen$doremove$unmodes, [kl.fns.tl(kl.fns.hd(V1873))])]);
                    const Literal = kl.fns.cons(new Sym("unify"), kl.fns.cons(Kl.headCall(kl.fns.shen$docons$unform, [Terms]), kl.fns.cons(XTerms, null)));
                    const Clause = kl.fns.cons(kl.fns.cons(kl.fns.hd(kl.fns.hd(V1873)), Terms), kl.fns.cons(new Sym(":-"), kl.fns.cons(kl.fns.cons(Literal, kl.fns.hd(kl.fns.tl(kl.fns.tl(V1873)))), null)));
                    return kl.fns.cons(Clause, null);
                })()):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.head_abstraction")])));
                    });

kl.defun("shen.complexity_head", 1, function (V1879) {
                      return asJsBool(kl.fns.cons$qu(V1879))?(Kl.tailCall(kl.fns.shen$dosafe_product, [Kl.headCall(kl.fns.map, [Kl.setArity("shen.complexity_head_lambda", 1, function (X) {
                      return Kl.tailCall(kl.fns.shen$docomplexity, [X]);
                    }), kl.fns.tl(V1879)])])):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.complexity_head")]));
                    });

kl.defun("shen.safe-multiply", 2, function (V1882, V1883) {
                      return kl.fns.$st(V1882, V1883);
                    });

kl.defun("shen.complexity", 1, function (V1892) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1892)) && asJsBool(kl.fns.$eq(new Sym("mode"), kl.fns.hd(V1892))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V1892))) && asJsBool(kl.fns.cons$qu(kl.fns.hd(kl.fns.tl(V1892)))) && asJsBool(kl.fns.$eq(new Sym("mode"), kl.fns.hd(kl.fns.hd(kl.fns.tl(V1892))))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.hd(kl.fns.tl(V1892))))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(kl.fns.hd(kl.fns.tl(V1892)))))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.hd(kl.fns.tl(V1892))))))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(V1892)))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.tl(V1892)))))))?(Kl.tailCall(kl.fns.shen$docomplexity, [kl.fns.hd(kl.fns.tl(V1892))])):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1892)) && asJsBool(kl.fns.$eq(new Sym("mode"), kl.fns.hd(V1892))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V1892))) && asJsBool(kl.fns.cons$qu(kl.fns.hd(kl.fns.tl(V1892)))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(V1892)))) && asJsBool(kl.fns.$eq(new Sym("+"), kl.fns.hd(kl.fns.tl(kl.fns.tl(V1892))))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.tl(V1892)))))))?(Kl.tailCall(kl.fns.shen$dosafe_multiply, [2, Kl.headCall(kl.fns.shen$dosafe_multiply, [Kl.headCall(kl.fns.shen$docomplexity, [kl.fns.cons(new Sym("mode"), kl.fns.cons(kl.fns.hd(kl.fns.hd(kl.fns.tl(V1892))), kl.fns.tl(kl.fns.tl(V1892))))]), Kl.headCall(kl.fns.shen$docomplexity, [kl.fns.cons(new Sym("mode"), kl.fns.cons(kl.fns.tl(kl.fns.hd(kl.fns.tl(V1892))), kl.fns.tl(kl.fns.tl(V1892))))])])])):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1892)) && asJsBool(kl.fns.$eq(new Sym("mode"), kl.fns.hd(V1892))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V1892))) && asJsBool(kl.fns.cons$qu(kl.fns.hd(kl.fns.tl(V1892)))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(V1892)))) && asJsBool(kl.fns.$eq(new Sym("-"), kl.fns.hd(kl.fns.tl(kl.fns.tl(V1892))))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.tl(V1892)))))))?(Kl.tailCall(kl.fns.shen$dosafe_multiply, [Kl.headCall(kl.fns.shen$docomplexity, [kl.fns.cons(new Sym("mode"), kl.fns.cons(kl.fns.hd(kl.fns.hd(kl.fns.tl(V1892))), kl.fns.tl(kl.fns.tl(V1892))))]), Kl.headCall(kl.fns.shen$docomplexity, [kl.fns.cons(new Sym("mode"), kl.fns.cons(kl.fns.tl(kl.fns.hd(kl.fns.tl(V1892))), kl.fns.tl(kl.fns.tl(V1892))))])])):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1892)) && asJsBool(kl.fns.$eq(new Sym("mode"), kl.fns.hd(V1892))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V1892))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(V1892)))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.tl(V1892))))) && asJsBool(Kl.headCall(kl.fns.variable$qu, [kl.fns.hd(kl.fns.tl(V1892))]))))?(1):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1892)) && asJsBool(kl.fns.$eq(new Sym("mode"), kl.fns.hd(V1892))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V1892))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(V1892)))) && asJsBool(kl.fns.$eq(new Sym("+"), kl.fns.hd(kl.fns.tl(kl.fns.tl(V1892))))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.tl(V1892)))))))?(2):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1892)) && asJsBool(kl.fns.$eq(new Sym("mode"), kl.fns.hd(V1892))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V1892))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(V1892)))) && asJsBool(kl.fns.$eq(new Sym("-"), kl.fns.hd(kl.fns.tl(kl.fns.tl(V1892))))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.tl(V1892)))))))?(1):(Kl.tailCall(kl.fns.shen$docomplexity, [kl.fns.cons(new Sym("mode"), kl.fns.cons(V1892, kl.fns.cons(new Sym("+"), null)))])))))));
                    });

kl.defun("shen.safe-product", 1, function (V1894) {
                      return asJsBool(kl.fns.$eq(null, V1894))?(1):(asJsBool(kl.fns.cons$qu(V1894))?(Kl.tailCall(kl.fns.shen$dosafe_multiply, [kl.fns.hd(V1894), Kl.headCall(kl.fns.shen$dosafe_product, [kl.fns.tl(V1894)])])):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.safe-product")])));
                    });

kl.defun("shen.s-prolog_literal", 1, function (V1896) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1896)) && asJsBool(kl.fns.$eq(new Sym("is"), kl.fns.hd(V1896))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V1896))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(V1896)))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.tl(V1896)))))))?(kl.fns.cons(new Sym("bind"), kl.fns.cons(kl.fns.hd(kl.fns.tl(V1896)), kl.fns.cons(Kl.headCall(kl.fns.shen$doinsert$underef, [kl.fns.hd(kl.fns.tl(kl.fns.tl(V1896)))]), null)))):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1896)) && asJsBool(kl.fns.$eq(new Sym("when"), kl.fns.hd(V1896))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V1896))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(V1896))))))?(kl.fns.cons(new Sym("fwhen"), kl.fns.cons(Kl.headCall(kl.fns.shen$doinsert$underef, [kl.fns.hd(kl.fns.tl(V1896))]), null))):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1896)) && asJsBool(kl.fns.$eq(new Sym("bind"), kl.fns.hd(V1896))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V1896))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(V1896)))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.tl(V1896)))))))?(kl.fns.cons(new Sym("bind"), kl.fns.cons(kl.fns.hd(kl.fns.tl(V1896)), kl.fns.cons(Kl.headCall(kl.fns.shen$doinsert$unlazyderef, [kl.fns.hd(kl.fns.tl(kl.fns.tl(V1896)))]), null)))):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1896)) && asJsBool(kl.fns.$eq(new Sym("fwhen"), kl.fns.hd(V1896))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V1896))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(V1896))))))?(kl.fns.cons(new Sym("fwhen"), kl.fns.cons(Kl.headCall(kl.fns.shen$doinsert$unlazyderef, [kl.fns.hd(kl.fns.tl(V1896))]), null))):(asJsBool(kl.fns.cons$qu(V1896))?(V1896):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.s-prolog_literal")]))))));
                    });

kl.defun("shen.insert_deref", 1, function (V1898) {
                      return asJsBool(Kl.headCall(kl.fns.variable$qu, [V1898]))?(kl.fns.cons(new Sym("shen.deref"), kl.fns.cons(V1898, kl.fns.cons(new Sym("ProcessN"), null)))):(asJsBool(kl.fns.cons$qu(V1898))?(kl.fns.cons(Kl.headCall(kl.fns.shen$doinsert$underef, [kl.fns.hd(V1898)]), Kl.headCall(kl.fns.shen$doinsert$underef, [kl.fns.tl(V1898)]))):(V1898));
                    });

kl.defun("shen.insert_lazyderef", 1, function (V1900) {
                      return asJsBool(Kl.headCall(kl.fns.variable$qu, [V1900]))?(kl.fns.cons(new Sym("shen.lazyderef"), kl.fns.cons(V1900, kl.fns.cons(new Sym("ProcessN"), null)))):(asJsBool(kl.fns.cons$qu(V1900))?(kl.fns.cons(Kl.headCall(kl.fns.shen$doinsert$unlazyderef, [kl.fns.hd(V1900)]), Kl.headCall(kl.fns.shen$doinsert$unlazyderef, [kl.fns.tl(V1900)]))):(V1900));
                    });

kl.defun("shen.group_clauses", 1, function (V1902) {
                      return asJsBool(kl.fns.$eq(null, V1902))?(null):(asJsBool(kl.fns.cons$qu(V1902))?((function () {
                  const Group = Kl.headCall(kl.fns.shen$docollect, [Kl.setArity("shen.group_clauses_lambda", 1, function (X) {
                      return Kl.tailCall(kl.fns.shen$dosame$unpredicate$qu, [kl.fns.hd(V1902), X]);
                    }), V1902]);
                    const Rest = Kl.headCall(kl.fns.difference, [V1902, Group]);
                    return kl.fns.cons(Group, Kl.headCall(kl.fns.shen$dogroup$unclauses, [Rest]));
                })()):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.group_clauses")])));
                    });

kl.defun("shen.collect", 2, function (V1907, V1908) {
                      return asJsBool(kl.fns.$eq(null, V1908))?(null):(asJsBool(kl.fns.cons$qu(V1908))?(asJsBool(Kl.headCall(V1907, [kl.fns.hd(V1908)]))?(kl.fns.cons(kl.fns.hd(V1908), Kl.headCall(kl.fns.shen$docollect, [V1907, kl.fns.tl(V1908)]))):(Kl.tailCall(kl.fns.shen$docollect, [V1907, kl.fns.tl(V1908)]))):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.collect")])));
                    });

kl.defun("shen.same_predicate?", 2, function (V1927, V1928) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1927)) && asJsBool(kl.fns.cons$qu(kl.fns.hd(V1927))) && asJsBool(kl.fns.cons$qu(V1928)) && asJsBool(kl.fns.cons$qu(kl.fns.hd(V1928)))))?(kl.fns.$eq(kl.fns.hd(kl.fns.hd(V1927)), kl.fns.hd(kl.fns.hd(V1928)))):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.same_predicate?")]));
                    });

kl.defun("shen.compile_prolog_procedure", 1, function (V1930) {
                      return (function () {
                  const F = Kl.headCall(kl.fns.shen$doprocedure$unname, [V1930]);
                    const Shen = Kl.headCall(kl.fns.shen$doclauses_to_shen, [F, V1930]);
                    return Shen;
                })();
                    });

kl.defun("shen.procedure_name", 1, function (V1944) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1944)) && asJsBool(kl.fns.cons$qu(kl.fns.hd(V1944))) && asJsBool(kl.fns.cons$qu(kl.fns.hd(kl.fns.hd(V1944))))))?(kl.fns.hd(kl.fns.hd(kl.fns.hd(V1944)))):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.procedure_name")]));
                    });

kl.defun("shen.clauses-to-shen", 2, function (V1947, V1948) {
                      return (function () {
                  const Linear = Kl.headCall(kl.fns.map, [Kl.setArity("shen.clauses-to-shen_lambda", 1, function (X) {
                      return Kl.tailCall(kl.fns.shen$dolinearise_clause, [X]);
                    }), V1948]);
                    const Arity = Kl.headCall(kl.fns.shen$doprolog_aritycheck, [V1947, Kl.headCall(kl.fns.map, [Kl.setArity("shen.clauses-to-shen_lambda", 1, function (X) {
                      return Kl.tailCall(kl.fns.head, [X]);
                    }), V1948])]);
                    const Parameters = Kl.headCall(kl.fns.shen$doparameters, [Arity]);
                    const AUM$uninstructions = Kl.headCall(kl.fns.map, [Kl.setArity("shen.clauses-to-shen_lambda", 1, function (X) {
                      return Kl.tailCall(kl.fns.shen$doaum, [X, Parameters]);
                    }), Linear]);
                    const Code = Kl.headCall(kl.fns.shen$docatch_cut, [Kl.headCall(kl.fns.shen$donest_disjunct, [Kl.headCall(kl.fns.map, [Kl.setArity("shen.clauses-to-shen_lambda", 1, function (X) {
                      return Kl.tailCall(kl.fns.shen$doaum$unto$unshen, [X]);
                    }), AUM$uninstructions])])]);
                    const ShenDef = kl.fns.cons(new Sym("define"), kl.fns.cons(V1947, Kl.headCall(kl.fns.append, [Parameters, Kl.headCall(kl.fns.append, [kl.fns.cons(new Sym("ProcessN"), kl.fns.cons(new Sym("Continuation"), null)), kl.fns.cons(new Sym("->"), kl.fns.cons(Code, null))])])));
                    return ShenDef;
                })();
                    });

kl.defun("shen.catch-cut", 1, function (V1950) {
                      return asJsBool(Kl.headCall(kl.fns.not, [Kl.headCall(kl.fns.shen$dooccurs$qu, [new Sym("cut"), V1950])]))?(V1950):(kl.fns.cons(new Sym("let"), kl.fns.cons(new Sym("Throwcontrol"), kl.fns.cons(kl.fns.cons(new Sym("shen.catchpoint"), null), kl.fns.cons(kl.fns.cons(new Sym("shen.cutpoint"), kl.fns.cons(new Sym("Throwcontrol"), kl.fns.cons(V1950, null))), null)))));
                    });

kl.defun("shen.catchpoint", 0, function () {
                      return kl.symbols.shen$do$stcatch$st = kl.fns.$pl(1, kl.fns.value(new Sym("shen.*catch*")));
                    });

kl.defun("shen.cutpoint", 2, function (V1958, V1959) {
                      return asJsBool(kl.fns.$eq(V1959, V1958))?(klFalse):(V1959);
                    });

kl.defun("shen.nest-disjunct", 1, function (V1961) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1961)) && asJsBool(kl.fns.$eq(null, kl.fns.tl(V1961)))))?(kl.fns.hd(V1961)):(asJsBool(kl.fns.cons$qu(V1961))?(Kl.tailCall(kl.fns.shen$dolisp_or, [kl.fns.hd(V1961), Kl.headCall(kl.fns.shen$donest_disjunct, [kl.fns.tl(V1961)])])):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.nest-disjunct")])));
                    });

kl.defun("shen.lisp-or", 2, function (V1964, V1965) {
                      return kl.fns.cons(new Sym("let"), kl.fns.cons(new Sym("Case"), kl.fns.cons(V1964, kl.fns.cons(kl.fns.cons(new Sym("if"), kl.fns.cons(kl.fns.cons(new Sym("="), kl.fns.cons(new Sym("Case"), kl.fns.cons(klFalse, null))), kl.fns.cons(V1965, kl.fns.cons(new Sym("Case"), null)))), null))));
                    });

kl.defun("shen.prolog-aritycheck", 2, function (V1970, V1971) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1971)) && asJsBool(kl.fns.$eq(null, kl.fns.tl(V1971)))))?(kl.fns._(Kl.headCall(kl.fns.length, [kl.fns.hd(V1971)]), 1)):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1971)) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V1971)))))?(asJsBool(kl.fns.$eq(Kl.headCall(kl.fns.length, [kl.fns.hd(V1971)]), Kl.headCall(kl.fns.length, [kl.fns.hd(kl.fns.tl(V1971))])))?(Kl.tailCall(kl.fns.shen$doprolog_aritycheck, [V1970, kl.fns.tl(V1971)])):(kl.fns.simple_error(kl.fns.cn("arity error in prolog procedure ", Kl.headCall(kl.fns.shen$doapp, [kl.fns.cons(V1970, null), "\n", new Sym("shen.a")]))))):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.prolog-aritycheck")])));
                    });

kl.defun("shen.linearise-clause", 1, function (V1973) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1973)) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V1973))) && asJsBool(kl.fns.$eq(new Sym(":-"), kl.fns.hd(kl.fns.tl(V1973)))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(V1973)))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.tl(V1973)))))))?((function () {
                  const Linear = Kl.headCall(kl.fns.shen$dolinearise, [kl.fns.cons(kl.fns.hd(V1973), kl.fns.tl(kl.fns.tl(V1973)))]);
                    return Kl.tailCall(kl.fns.shen$doclause$unform, [Linear]);
                })()):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.linearise-clause")]));
                    });

kl.defun("shen.clause_form", 1, function (V1975) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1975)) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V1975))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(V1975))))))?(kl.fns.cons(Kl.headCall(kl.fns.shen$doexplicit$unmodes, [kl.fns.hd(V1975)]), kl.fns.cons(new Sym(":-"), kl.fns.cons(Kl.headCall(kl.fns.shen$docf$unhelp, [kl.fns.hd(kl.fns.tl(V1975))]), null)))):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.clause_form")]));
                    });

kl.defun("shen.explicit_modes", 1, function (V1977) {
                      return asJsBool(kl.fns.cons$qu(V1977))?(kl.fns.cons(kl.fns.hd(V1977), Kl.headCall(kl.fns.map, [Kl.setArity("shen.explicit_modes_lambda", 1, function (X) {
                      return Kl.tailCall(kl.fns.shen$doem$unhelp, [X]);
                    }), kl.fns.tl(V1977)]))):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.explicit_modes")]));
                    });

kl.defun("shen.em_help", 1, function (V1979) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1979)) && asJsBool(kl.fns.$eq(new Sym("mode"), kl.fns.hd(V1979))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V1979))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(V1979)))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.tl(V1979)))))))?(V1979):(kl.fns.cons(new Sym("mode"), kl.fns.cons(V1979, kl.fns.cons(new Sym("+"), null))));
                    });

kl.defun("shen.cf_help", 1, function (V1981) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1981)) && asJsBool(kl.fns.$eq(new Sym("where"), kl.fns.hd(V1981))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V1981))) && asJsBool(kl.fns.cons$qu(kl.fns.hd(kl.fns.tl(V1981)))) && asJsBool(kl.fns.$eq(new Sym("="), kl.fns.hd(kl.fns.hd(kl.fns.tl(V1981))))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.hd(kl.fns.tl(V1981))))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(kl.fns.hd(kl.fns.tl(V1981)))))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.hd(kl.fns.tl(V1981))))))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(V1981)))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.tl(V1981)))))))?(kl.fns.cons(kl.fns.cons(asJsBool(kl.fns.value(new Sym("shen.*occurs*")))?(new Sym("unify!")):(new Sym("unify")), kl.fns.tl(kl.fns.hd(kl.fns.tl(V1981)))), Kl.headCall(kl.fns.shen$docf$unhelp, [kl.fns.hd(kl.fns.tl(kl.fns.tl(V1981)))]))):(V1981);
                    });

kl.defun("occurs-check", 1, function (V1987) {
                      return asJsBool(kl.fns.$eq(new Sym("+"), V1987))?(kl.symbols.shen$do$stoccurs$st = klTrue):(asJsBool(kl.fns.$eq(new Sym("-"), V1987))?(kl.symbols.shen$do$stoccurs$st = klFalse):(kl.fns.simple_error("occurs-check expects + or -\n")));
                    });

kl.defun("shen.aum", 2, function (V1990, V1991) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1990)) && asJsBool(kl.fns.cons$qu(kl.fns.hd(V1990))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V1990))) && asJsBool(kl.fns.$eq(new Sym(":-"), kl.fns.hd(kl.fns.tl(V1990)))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(V1990)))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.tl(V1990)))))))?((function () {
                  const MuApplication = Kl.headCall(kl.fns.shen$domake$unmu$unapplication, [kl.fns.cons(new Sym("shen.mu"), kl.fns.cons(kl.fns.tl(kl.fns.hd(V1990)), kl.fns.cons(Kl.headCall(kl.fns.shen$docontinuation$uncall, [kl.fns.tl(kl.fns.hd(V1990)), kl.fns.hd(kl.fns.tl(kl.fns.tl(V1990)))]), null))), V1991]);
                    return Kl.tailCall(kl.fns.shen$domu$unreduction, [MuApplication, new Sym("+")]);
                })()):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.aum")]));
                    });

kl.defun("shen.continuation_call", 2, function (V1994, V1995) {
                      return (function () {
                  const VTerms = kl.fns.cons(new Sym("ProcessN"), Kl.headCall(kl.fns.shen$doextract$unvars, [V1994]));
                    const VBody = Kl.headCall(kl.fns.shen$doextract$unvars, [V1995]);
                    const Free = Kl.headCall(kl.fns.remove, [new Sym("Throwcontrol"), Kl.headCall(kl.fns.difference, [VBody, VTerms])]);
                    return Kl.tailCall(kl.fns.shen$docc$unhelp, [Free, V1995]);
                })();
                    });

kl.defun("remove", 2, function (V1998, V1999) {
                      return Kl.tailCall(kl.fns.shen$doremove_h, [V1998, V1999, null]);
                    });

kl.defun("shen.remove-h", 3, function (V2006, V2007, V2008) {
                      return asJsBool(kl.fns.$eq(null, V2007))?(Kl.tailCall(kl.fns.reverse, [V2008])):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V2007)) && asJsBool(kl.fns.$eq(kl.fns.hd(V2007), V2006))))?(Kl.tailCall(kl.fns.shen$doremove_h, [kl.fns.hd(V2007), kl.fns.tl(V2007), V2008])):(asJsBool(kl.fns.cons$qu(V2007))?(Kl.tailCall(kl.fns.shen$doremove_h, [V2006, kl.fns.tl(V2007), kl.fns.cons(kl.fns.hd(V2007), V2008)])):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.remove-h")]))));
                    });

kl.defun("shen.cc_help", 2, function (V2011, V2012) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.$eq(null, V2011)) && asJsBool(kl.fns.$eq(null, V2012))))?(kl.fns.cons(new Sym("shen.pop"), kl.fns.cons(new Sym("shen.the"), kl.fns.cons(new Sym("shen.stack"), null)))):(asJsBool(kl.fns.$eq(null, V2012))?(kl.fns.cons(new Sym("shen.rename"), kl.fns.cons(new Sym("shen.the"), kl.fns.cons(new Sym("shen.variables"), kl.fns.cons(new Sym("in"), kl.fns.cons(V2011, kl.fns.cons(new Sym("and"), kl.fns.cons(new Sym("shen.then"), kl.fns.cons(kl.fns.cons(new Sym("shen.pop"), kl.fns.cons(new Sym("shen.the"), kl.fns.cons(new Sym("shen.stack"), null))), null))))))))):(asJsBool(kl.fns.$eq(null, V2011))?(kl.fns.cons(new Sym("call"), kl.fns.cons(new Sym("shen.the"), kl.fns.cons(new Sym("shen.continuation"), kl.fns.cons(V2012, null))))):(kl.fns.cons(new Sym("shen.rename"), kl.fns.cons(new Sym("shen.the"), kl.fns.cons(new Sym("shen.variables"), kl.fns.cons(new Sym("in"), kl.fns.cons(V2011, kl.fns.cons(new Sym("and"), kl.fns.cons(new Sym("shen.then"), kl.fns.cons(kl.fns.cons(new Sym("call"), kl.fns.cons(new Sym("shen.the"), kl.fns.cons(new Sym("shen.continuation"), kl.fns.cons(V2012, null)))), null)))))))))));
                    });

kl.defun("shen.make_mu_application", 2, function (V2015, V2016) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V2015)) && asJsBool(kl.fns.$eq(new Sym("shen.mu"), kl.fns.hd(V2015))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V2015))) && asJsBool(kl.fns.$eq(null, kl.fns.hd(kl.fns.tl(V2015)))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(V2015)))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.tl(V2015))))) && asJsBool(kl.fns.$eq(null, V2016))))?(kl.fns.hd(kl.fns.tl(kl.fns.tl(V2015)))):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V2015)) && asJsBool(kl.fns.$eq(new Sym("shen.mu"), kl.fns.hd(V2015))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V2015))) && asJsBool(kl.fns.cons$qu(kl.fns.hd(kl.fns.tl(V2015)))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(V2015)))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.tl(V2015))))) && asJsBool(kl.fns.cons$qu(V2016))))?(kl.fns.cons(kl.fns.cons(new Sym("shen.mu"), kl.fns.cons(kl.fns.hd(kl.fns.hd(kl.fns.tl(V2015))), kl.fns.cons(Kl.headCall(kl.fns.shen$domake$unmu$unapplication, [kl.fns.cons(new Sym("shen.mu"), kl.fns.cons(kl.fns.tl(kl.fns.hd(kl.fns.tl(V2015))), kl.fns.tl(kl.fns.tl(V2015)))), kl.fns.tl(V2016)]), null))), kl.fns.cons(kl.fns.hd(V2016), null))):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.make_mu_application")])));
                    });

kl.defun("shen.mu_reduction", 2, function (V2025, V2026) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V2025)) && asJsBool(kl.fns.cons$qu(kl.fns.hd(V2025))) && asJsBool(kl.fns.$eq(new Sym("shen.mu"), kl.fns.hd(kl.fns.hd(V2025)))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.hd(V2025)))) && asJsBool(kl.fns.cons$qu(kl.fns.hd(kl.fns.tl(kl.fns.hd(V2025))))) && asJsBool(kl.fns.$eq(new Sym("mode"), kl.fns.hd(kl.fns.hd(kl.fns.tl(kl.fns.hd(V2025)))))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.hd(kl.fns.tl(kl.fns.hd(V2025)))))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(kl.fns.hd(kl.fns.tl(kl.fns.hd(V2025))))))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.hd(kl.fns.tl(kl.fns.hd(V2025)))))))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(kl.fns.hd(V2025))))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.hd(V2025)))))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V2025))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(V2025))))))?(Kl.tailCall(kl.fns.shen$domu$unreduction, [kl.fns.cons(kl.fns.cons(new Sym("shen.mu"), kl.fns.cons(kl.fns.hd(kl.fns.tl(kl.fns.hd(kl.fns.tl(kl.fns.hd(V2025))))), kl.fns.tl(kl.fns.tl(kl.fns.hd(V2025))))), kl.fns.tl(V2025)), kl.fns.hd(kl.fns.tl(kl.fns.tl(kl.fns.hd(kl.fns.tl(kl.fns.hd(V2025))))))])):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V2025)) && asJsBool(kl.fns.cons$qu(kl.fns.hd(V2025))) && asJsBool(kl.fns.$eq(new Sym("shen.mu"), kl.fns.hd(kl.fns.hd(V2025)))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.hd(V2025)))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(kl.fns.hd(V2025))))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.hd(V2025)))))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V2025))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(V2025)))) && asJsBool(kl.fns.$eq(new Sym("_"), kl.fns.hd(kl.fns.tl(kl.fns.hd(V2025)))))))?(Kl.tailCall(kl.fns.shen$domu$unreduction, [kl.fns.hd(kl.fns.tl(kl.fns.tl(kl.fns.hd(V2025)))), V2026])):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V2025)) && asJsBool(kl.fns.cons$qu(kl.fns.hd(V2025))) && asJsBool(kl.fns.$eq(new Sym("shen.mu"), kl.fns.hd(kl.fns.hd(V2025)))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.hd(V2025)))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(kl.fns.hd(V2025))))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.hd(V2025)))))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V2025))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(V2025)))) && asJsBool(Kl.headCall(kl.fns.shen$doephemeral$unvariable$qu, [kl.fns.hd(kl.fns.tl(kl.fns.hd(V2025))), kl.fns.hd(kl.fns.tl(V2025))]))))?(Kl.tailCall(kl.fns.subst, [kl.fns.hd(kl.fns.tl(V2025)), kl.fns.hd(kl.fns.tl(kl.fns.hd(V2025))), Kl.headCall(kl.fns.shen$domu$unreduction, [kl.fns.hd(kl.fns.tl(kl.fns.tl(kl.fns.hd(V2025)))), V2026])])):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V2025)) && asJsBool(kl.fns.cons$qu(kl.fns.hd(V2025))) && asJsBool(kl.fns.$eq(new Sym("shen.mu"), kl.fns.hd(kl.fns.hd(V2025)))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.hd(V2025)))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(kl.fns.hd(V2025))))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.hd(V2025)))))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V2025))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(V2025)))) && asJsBool(Kl.headCall(kl.fns.variable$qu, [kl.fns.hd(kl.fns.tl(kl.fns.hd(V2025)))]))))?(kl.fns.cons(new Sym("let"), kl.fns.cons(kl.fns.hd(kl.fns.tl(kl.fns.hd(V2025))), kl.fns.cons(new Sym("shen.be"), kl.fns.cons(kl.fns.hd(kl.fns.tl(V2025)), kl.fns.cons(new Sym("in"), kl.fns.cons(Kl.headCall(kl.fns.shen$domu$unreduction, [kl.fns.hd(kl.fns.tl(kl.fns.tl(kl.fns.hd(V2025)))), V2026]), null))))))):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V2025)) && asJsBool(kl.fns.cons$qu(kl.fns.hd(V2025))) && asJsBool(kl.fns.$eq(new Sym("shen.mu"), kl.fns.hd(kl.fns.hd(V2025)))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.hd(V2025)))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(kl.fns.hd(V2025))))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.hd(V2025)))))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V2025))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(V2025)))) && asJsBool(kl.fns.$eq(new Sym("-"), V2026)) && asJsBool(Kl.headCall(kl.fns.shen$doprolog$unconstant$qu, [kl.fns.hd(kl.fns.tl(kl.fns.hd(V2025)))]))))?((function () {
                  const Z = Kl.headCall(kl.fns.gensym, [new Sym("V")]);
                    return kl.fns.cons(new Sym("let"), kl.fns.cons(Z, kl.fns.cons(new Sym("shen.be"), kl.fns.cons(kl.fns.cons(new Sym("shen.the"), kl.fns.cons(new Sym("shen.result"), kl.fns.cons(new Sym("shen.of"), kl.fns.cons(new Sym("shen.dereferencing"), kl.fns.tl(V2025))))), kl.fns.cons(new Sym("in"), kl.fns.cons(kl.fns.cons(new Sym("if"), kl.fns.cons(kl.fns.cons(Z, kl.fns.cons(new Sym("is"), kl.fns.cons(new Sym("identical"), kl.fns.cons(new Sym("shen.to"), kl.fns.cons(kl.fns.hd(kl.fns.tl(kl.fns.hd(V2025))), null))))), kl.fns.cons(new Sym("shen.then"), kl.fns.cons(Kl.headCall(kl.fns.shen$domu$unreduction, [kl.fns.hd(kl.fns.tl(kl.fns.tl(kl.fns.hd(V2025)))), new Sym("-")]), kl.fns.cons(new Sym("shen.else"), kl.fns.cons(new Sym("shen.failed!"), null)))))), null))))));
                })()):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V2025)) && asJsBool(kl.fns.cons$qu(kl.fns.hd(V2025))) && asJsBool(kl.fns.$eq(new Sym("shen.mu"), kl.fns.hd(kl.fns.hd(V2025)))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.hd(V2025)))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(kl.fns.hd(V2025))))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.hd(V2025)))))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V2025))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(V2025)))) && asJsBool(kl.fns.$eq(new Sym("+"), V2026)) && asJsBool(Kl.headCall(kl.fns.shen$doprolog$unconstant$qu, [kl.fns.hd(kl.fns.tl(kl.fns.hd(V2025)))]))))?((function () {
                  const Z = Kl.headCall(kl.fns.gensym, [new Sym("V")]);
                    return kl.fns.cons(new Sym("let"), kl.fns.cons(Z, kl.fns.cons(new Sym("shen.be"), kl.fns.cons(kl.fns.cons(new Sym("shen.the"), kl.fns.cons(new Sym("shen.result"), kl.fns.cons(new Sym("shen.of"), kl.fns.cons(new Sym("shen.dereferencing"), kl.fns.tl(V2025))))), kl.fns.cons(new Sym("in"), kl.fns.cons(kl.fns.cons(new Sym("if"), kl.fns.cons(kl.fns.cons(Z, kl.fns.cons(new Sym("is"), kl.fns.cons(new Sym("identical"), kl.fns.cons(new Sym("shen.to"), kl.fns.cons(kl.fns.hd(kl.fns.tl(kl.fns.hd(V2025))), null))))), kl.fns.cons(new Sym("shen.then"), kl.fns.cons(Kl.headCall(kl.fns.shen$domu$unreduction, [kl.fns.hd(kl.fns.tl(kl.fns.tl(kl.fns.hd(V2025)))), new Sym("+")]), kl.fns.cons(new Sym("shen.else"), kl.fns.cons(kl.fns.cons(new Sym("if"), kl.fns.cons(kl.fns.cons(Z, kl.fns.cons(new Sym("is"), kl.fns.cons(new Sym("shen.a"), kl.fns.cons(new Sym("shen.variable"), null)))), kl.fns.cons(new Sym("shen.then"), kl.fns.cons(kl.fns.cons(new Sym("bind"), kl.fns.cons(Z, kl.fns.cons(new Sym("shen.to"), kl.fns.cons(kl.fns.hd(kl.fns.tl(kl.fns.hd(V2025))), kl.fns.cons(new Sym("in"), kl.fns.cons(Kl.headCall(kl.fns.shen$domu$unreduction, [kl.fns.hd(kl.fns.tl(kl.fns.tl(kl.fns.hd(V2025)))), new Sym("+")]), null)))))), kl.fns.cons(new Sym("shen.else"), kl.fns.cons(new Sym("shen.failed!"), null)))))), null)))))), null))))));
                })()):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V2025)) && asJsBool(kl.fns.cons$qu(kl.fns.hd(V2025))) && asJsBool(kl.fns.$eq(new Sym("shen.mu"), kl.fns.hd(kl.fns.hd(V2025)))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.hd(V2025)))) && asJsBool(kl.fns.cons$qu(kl.fns.hd(kl.fns.tl(kl.fns.hd(V2025))))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(kl.fns.hd(V2025))))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.hd(V2025)))))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V2025))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(V2025)))) && asJsBool(kl.fns.$eq(new Sym("-"), V2026))))?((function () {
                  const Z = Kl.headCall(kl.fns.gensym, [new Sym("V")]);
                    return kl.fns.cons(new Sym("let"), kl.fns.cons(Z, kl.fns.cons(new Sym("shen.be"), kl.fns.cons(kl.fns.cons(new Sym("shen.the"), kl.fns.cons(new Sym("shen.result"), kl.fns.cons(new Sym("shen.of"), kl.fns.cons(new Sym("shen.dereferencing"), kl.fns.tl(V2025))))), kl.fns.cons(new Sym("in"), kl.fns.cons(kl.fns.cons(new Sym("if"), kl.fns.cons(kl.fns.cons(Z, kl.fns.cons(new Sym("is"), kl.fns.cons(new Sym("shen.a"), kl.fns.cons(new Sym("shen.non-empty"), kl.fns.cons(new Sym("list"), null))))), kl.fns.cons(new Sym("shen.then"), kl.fns.cons(Kl.headCall(kl.fns.shen$domu$unreduction, [kl.fns.cons(kl.fns.cons(new Sym("shen.mu"), kl.fns.cons(kl.fns.hd(kl.fns.hd(kl.fns.tl(kl.fns.hd(V2025)))), kl.fns.cons(kl.fns.cons(kl.fns.cons(new Sym("shen.mu"), kl.fns.cons(kl.fns.tl(kl.fns.hd(kl.fns.tl(kl.fns.hd(V2025)))), kl.fns.tl(kl.fns.tl(kl.fns.hd(V2025))))), kl.fns.cons(kl.fns.cons(new Sym("shen.the"), kl.fns.cons(new Sym("tail"), kl.fns.cons(new Sym("shen.of"), kl.fns.cons(Z, null)))), null)), null))), kl.fns.cons(kl.fns.cons(new Sym("shen.the"), kl.fns.cons(new Sym("head"), kl.fns.cons(new Sym("shen.of"), kl.fns.cons(Z, null)))), null)), new Sym("-")]), kl.fns.cons(new Sym("shen.else"), kl.fns.cons(new Sym("shen.failed!"), null)))))), null))))));
                })()):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V2025)) && asJsBool(kl.fns.cons$qu(kl.fns.hd(V2025))) && asJsBool(kl.fns.$eq(new Sym("shen.mu"), kl.fns.hd(kl.fns.hd(V2025)))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.hd(V2025)))) && asJsBool(kl.fns.cons$qu(kl.fns.hd(kl.fns.tl(kl.fns.hd(V2025))))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(kl.fns.hd(V2025))))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.hd(V2025)))))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V2025))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(V2025)))) && asJsBool(kl.fns.$eq(new Sym("+"), V2026))))?((function () {
                  const Z = Kl.headCall(kl.fns.gensym, [new Sym("V")]);
                    return kl.fns.cons(new Sym("let"), kl.fns.cons(Z, kl.fns.cons(new Sym("shen.be"), kl.fns.cons(kl.fns.cons(new Sym("shen.the"), kl.fns.cons(new Sym("shen.result"), kl.fns.cons(new Sym("shen.of"), kl.fns.cons(new Sym("shen.dereferencing"), kl.fns.tl(V2025))))), kl.fns.cons(new Sym("in"), kl.fns.cons(kl.fns.cons(new Sym("if"), kl.fns.cons(kl.fns.cons(Z, kl.fns.cons(new Sym("is"), kl.fns.cons(new Sym("shen.a"), kl.fns.cons(new Sym("shen.non-empty"), kl.fns.cons(new Sym("list"), null))))), kl.fns.cons(new Sym("shen.then"), kl.fns.cons(Kl.headCall(kl.fns.shen$domu$unreduction, [kl.fns.cons(kl.fns.cons(new Sym("shen.mu"), kl.fns.cons(kl.fns.hd(kl.fns.hd(kl.fns.tl(kl.fns.hd(V2025)))), kl.fns.cons(kl.fns.cons(kl.fns.cons(new Sym("shen.mu"), kl.fns.cons(kl.fns.tl(kl.fns.hd(kl.fns.tl(kl.fns.hd(V2025)))), kl.fns.tl(kl.fns.tl(kl.fns.hd(V2025))))), kl.fns.cons(kl.fns.cons(new Sym("shen.the"), kl.fns.cons(new Sym("tail"), kl.fns.cons(new Sym("shen.of"), kl.fns.cons(Z, null)))), null)), null))), kl.fns.cons(kl.fns.cons(new Sym("shen.the"), kl.fns.cons(new Sym("head"), kl.fns.cons(new Sym("shen.of"), kl.fns.cons(Z, null)))), null)), new Sym("+")]), kl.fns.cons(new Sym("shen.else"), kl.fns.cons(kl.fns.cons(new Sym("if"), kl.fns.cons(kl.fns.cons(Z, kl.fns.cons(new Sym("is"), kl.fns.cons(new Sym("shen.a"), kl.fns.cons(new Sym("shen.variable"), null)))), kl.fns.cons(new Sym("shen.then"), kl.fns.cons(kl.fns.cons(new Sym("shen.rename"), kl.fns.cons(new Sym("shen.the"), kl.fns.cons(new Sym("shen.variables"), kl.fns.cons(new Sym("in"), kl.fns.cons(Kl.headCall(kl.fns.shen$doextract$unvars, [kl.fns.hd(kl.fns.tl(kl.fns.hd(V2025)))]), kl.fns.cons(new Sym("and"), kl.fns.cons(new Sym("shen.then"), kl.fns.cons(kl.fns.cons(new Sym("bind"), kl.fns.cons(Z, kl.fns.cons(new Sym("shen.to"), kl.fns.cons(Kl.headCall(kl.fns.shen$dorcons$unform, [Kl.headCall(kl.fns.shen$doremove$unmodes, [kl.fns.hd(kl.fns.tl(kl.fns.hd(V2025)))])]), kl.fns.cons(new Sym("in"), kl.fns.cons(Kl.headCall(kl.fns.shen$domu$unreduction, [kl.fns.hd(kl.fns.tl(kl.fns.tl(kl.fns.hd(V2025)))), new Sym("+")]), null)))))), null)))))))), kl.fns.cons(new Sym("shen.else"), kl.fns.cons(new Sym("shen.failed!"), null)))))), null)))))), null))))));
                })()):(V2025))))))));
                    });

kl.defun("shen.rcons_form", 1, function (V2028) {
                      return asJsBool(kl.fns.cons$qu(V2028))?(kl.fns.cons(new Sym("cons"), kl.fns.cons(Kl.headCall(kl.fns.shen$dorcons$unform, [kl.fns.hd(V2028)]), kl.fns.cons(Kl.headCall(kl.fns.shen$dorcons$unform, [kl.fns.tl(V2028)]), null)))):(V2028);
                    });

kl.defun("shen.remove_modes", 1, function (V2030) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V2030)) && asJsBool(kl.fns.$eq(new Sym("mode"), kl.fns.hd(V2030))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V2030))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(V2030)))) && asJsBool(kl.fns.$eq(new Sym("+"), kl.fns.hd(kl.fns.tl(kl.fns.tl(V2030))))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.tl(V2030)))))))?(Kl.tailCall(kl.fns.shen$doremove$unmodes, [kl.fns.hd(kl.fns.tl(V2030))])):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V2030)) && asJsBool(kl.fns.$eq(new Sym("mode"), kl.fns.hd(V2030))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V2030))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(V2030)))) && asJsBool(kl.fns.$eq(new Sym("-"), kl.fns.hd(kl.fns.tl(kl.fns.tl(V2030))))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.tl(V2030)))))))?(Kl.tailCall(kl.fns.shen$doremove$unmodes, [kl.fns.hd(kl.fns.tl(V2030))])):(asJsBool(kl.fns.cons$qu(V2030))?(kl.fns.cons(Kl.headCall(kl.fns.shen$doremove$unmodes, [kl.fns.hd(V2030)]), Kl.headCall(kl.fns.shen$doremove$unmodes, [kl.fns.tl(V2030)]))):(V2030)));
                    });

kl.defun("shen.ephemeral_variable?", 2, function (V2033, V2034) {
                      return asKlBool(asJsBool(Kl.headCall(kl.fns.variable$qu, [V2033])) && asJsBool(Kl.headCall(kl.fns.variable$qu, [V2034])));
                    });

kl.defun("shen.prolog_constant?", 1, function (V2044) {
                      return asJsBool(kl.fns.cons$qu(V2044))?(klFalse):(klTrue);
                    });

kl.defun("shen.aum_to_shen", 1, function (V2046) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V2046)) && asJsBool(kl.fns.$eq(new Sym("let"), kl.fns.hd(V2046))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V2046))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(V2046)))) && asJsBool(kl.fns.$eq(new Sym("shen.be"), kl.fns.hd(kl.fns.tl(kl.fns.tl(V2046))))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(kl.fns.tl(V2046))))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.tl(V2046)))))) && asJsBool(kl.fns.$eq(new Sym("in"), kl.fns.hd(kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.tl(V2046))))))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.tl(V2046))))))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.tl(V2046))))))))))?(kl.fns.cons(new Sym("let"), kl.fns.cons(kl.fns.hd(kl.fns.tl(V2046)), kl.fns.cons(Kl.headCall(kl.fns.shen$doaum$unto$unshen, [kl.fns.hd(kl.fns.tl(kl.fns.tl(kl.fns.tl(V2046))))]), kl.fns.cons(Kl.headCall(kl.fns.shen$doaum$unto$unshen, [kl.fns.hd(kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.tl(V2046))))))]), null))))):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V2046)) && asJsBool(kl.fns.$eq(new Sym("shen.the"), kl.fns.hd(V2046))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V2046))) && asJsBool(kl.fns.$eq(new Sym("shen.result"), kl.fns.hd(kl.fns.tl(V2046)))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(V2046)))) && asJsBool(kl.fns.$eq(new Sym("shen.of"), kl.fns.hd(kl.fns.tl(kl.fns.tl(V2046))))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(kl.fns.tl(V2046))))) && asJsBool(kl.fns.$eq(new Sym("shen.dereferencing"), kl.fns.hd(kl.fns.tl(kl.fns.tl(kl.fns.tl(V2046)))))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.tl(V2046)))))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.tl(V2046)))))))))?(kl.fns.cons(new Sym("shen.lazyderef"), kl.fns.cons(Kl.headCall(kl.fns.shen$doaum$unto$unshen, [kl.fns.hd(kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.tl(V2046)))))]), kl.fns.cons(new Sym("ProcessN"), null)))):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V2046)) && asJsBool(kl.fns.$eq(new Sym("if"), kl.fns.hd(V2046))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V2046))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(V2046)))) && asJsBool(kl.fns.$eq(new Sym("shen.then"), kl.fns.hd(kl.fns.tl(kl.fns.tl(V2046))))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(kl.fns.tl(V2046))))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.tl(V2046)))))) && asJsBool(kl.fns.$eq(new Sym("shen.else"), kl.fns.hd(kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.tl(V2046))))))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.tl(V2046))))))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.tl(V2046))))))))))?(kl.fns.cons(new Sym("if"), kl.fns.cons(Kl.headCall(kl.fns.shen$doaum$unto$unshen, [kl.fns.hd(kl.fns.tl(V2046))]), kl.fns.cons(Kl.headCall(kl.fns.shen$doaum$unto$unshen, [kl.fns.hd(kl.fns.tl(kl.fns.tl(kl.fns.tl(V2046))))]), kl.fns.cons(Kl.headCall(kl.fns.shen$doaum$unto$unshen, [kl.fns.hd(kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.tl(V2046))))))]), null))))):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V2046)) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V2046))) && asJsBool(kl.fns.$eq(new Sym("is"), kl.fns.hd(kl.fns.tl(V2046)))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(V2046)))) && asJsBool(kl.fns.$eq(new Sym("shen.a"), kl.fns.hd(kl.fns.tl(kl.fns.tl(V2046))))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(kl.fns.tl(V2046))))) && asJsBool(kl.fns.$eq(new Sym("shen.variable"), kl.fns.hd(kl.fns.tl(kl.fns.tl(kl.fns.tl(V2046)))))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.tl(V2046))))))))?(kl.fns.cons(new Sym("shen.pvar?"), kl.fns.cons(kl.fns.hd(V2046), null))):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V2046)) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V2046))) && asJsBool(kl.fns.$eq(new Sym("is"), kl.fns.hd(kl.fns.tl(V2046)))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(V2046)))) && asJsBool(kl.fns.$eq(new Sym("shen.a"), kl.fns.hd(kl.fns.tl(kl.fns.tl(V2046))))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(kl.fns.tl(V2046))))) && asJsBool(kl.fns.$eq(new Sym("shen.non-empty"), kl.fns.hd(kl.fns.tl(kl.fns.tl(kl.fns.tl(V2046)))))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.tl(V2046)))))) && asJsBool(kl.fns.$eq(new Sym("list"), kl.fns.hd(kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.tl(V2046))))))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.tl(V2046)))))))))?(kl.fns.cons(new Sym("cons?"), kl.fns.cons(kl.fns.hd(V2046), null))):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V2046)) && asJsBool(kl.fns.$eq(new Sym("shen.rename"), kl.fns.hd(V2046))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V2046))) && asJsBool(kl.fns.$eq(new Sym("shen.the"), kl.fns.hd(kl.fns.tl(V2046)))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(V2046)))) && asJsBool(kl.fns.$eq(new Sym("shen.variables"), kl.fns.hd(kl.fns.tl(kl.fns.tl(V2046))))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(kl.fns.tl(V2046))))) && asJsBool(kl.fns.$eq(new Sym("in"), kl.fns.hd(kl.fns.tl(kl.fns.tl(kl.fns.tl(V2046)))))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.tl(V2046)))))) && asJsBool(kl.fns.$eq(null, kl.fns.hd(kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.tl(V2046))))))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.tl(V2046))))))) && asJsBool(kl.fns.$eq(new Sym("and"), kl.fns.hd(kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.tl(V2046)))))))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.tl(V2046)))))))) && asJsBool(kl.fns.$eq(new Sym("shen.then"), kl.fns.hd(kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.tl(V2046))))))))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.tl(V2046))))))))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.tl(V2046))))))))))))?(Kl.tailCall(kl.fns.shen$doaum$unto$unshen, [kl.fns.hd(kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.tl(V2046))))))))])):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V2046)) && asJsBool(kl.fns.$eq(new Sym("shen.rename"), kl.fns.hd(V2046))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V2046))) && asJsBool(kl.fns.$eq(new Sym("shen.the"), kl.fns.hd(kl.fns.tl(V2046)))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(V2046)))) && asJsBool(kl.fns.$eq(new Sym("shen.variables"), kl.fns.hd(kl.fns.tl(kl.fns.tl(V2046))))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(kl.fns.tl(V2046))))) && asJsBool(kl.fns.$eq(new Sym("in"), kl.fns.hd(kl.fns.tl(kl.fns.tl(kl.fns.tl(V2046)))))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.tl(V2046)))))) && asJsBool(kl.fns.cons$qu(kl.fns.hd(kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.tl(V2046))))))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.tl(V2046))))))) && asJsBool(kl.fns.$eq(new Sym("and"), kl.fns.hd(kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.tl(V2046)))))))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.tl(V2046)))))))) && asJsBool(kl.fns.$eq(new Sym("shen.then"), kl.fns.hd(kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.tl(V2046))))))))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.tl(V2046))))))))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.tl(V2046))))))))))))?(kl.fns.cons(new Sym("let"), kl.fns.cons(kl.fns.hd(kl.fns.hd(kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.tl(V2046)))))), kl.fns.cons(kl.fns.cons(new Sym("shen.newpv"), kl.fns.cons(new Sym("ProcessN"), null)), kl.fns.cons(Kl.headCall(kl.fns.shen$doaum$unto$unshen, [kl.fns.cons(new Sym("shen.rename"), kl.fns.cons(new Sym("shen.the"), kl.fns.cons(new Sym("shen.variables"), kl.fns.cons(new Sym("in"), kl.fns.cons(kl.fns.tl(kl.fns.hd(kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.tl(V2046)))))), kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.tl(V2046))))))))))]), null))))):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V2046)) && asJsBool(kl.fns.$eq(new Sym("bind"), kl.fns.hd(V2046))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V2046))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(V2046)))) && asJsBool(kl.fns.$eq(new Sym("shen.to"), kl.fns.hd(kl.fns.tl(kl.fns.tl(V2046))))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(kl.fns.tl(V2046))))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.tl(V2046)))))) && asJsBool(kl.fns.$eq(new Sym("in"), kl.fns.hd(kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.tl(V2046))))))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.tl(V2046))))))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.tl(V2046))))))))))?(kl.fns.cons(new Sym("do"), kl.fns.cons(kl.fns.cons(new Sym("shen.bindv"), kl.fns.cons(kl.fns.hd(kl.fns.tl(V2046)), kl.fns.cons(Kl.headCall(kl.fns.shen$dochwild, [kl.fns.hd(kl.fns.tl(kl.fns.tl(kl.fns.tl(V2046))))]), kl.fns.cons(new Sym("ProcessN"), null)))), kl.fns.cons(kl.fns.cons(new Sym("let"), kl.fns.cons(new Sym("Result"), kl.fns.cons(Kl.headCall(kl.fns.shen$doaum$unto$unshen, [kl.fns.hd(kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.tl(V2046))))))]), kl.fns.cons(kl.fns.cons(new Sym("do"), kl.fns.cons(kl.fns.cons(new Sym("shen.unbindv"), kl.fns.cons(kl.fns.hd(kl.fns.tl(V2046)), kl.fns.cons(new Sym("ProcessN"), null))), kl.fns.cons(new Sym("Result"), null))), null)))), null)))):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V2046)) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V2046))) && asJsBool(kl.fns.$eq(new Sym("is"), kl.fns.hd(kl.fns.tl(V2046)))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(V2046)))) && asJsBool(kl.fns.$eq(new Sym("identical"), kl.fns.hd(kl.fns.tl(kl.fns.tl(V2046))))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(kl.fns.tl(V2046))))) && asJsBool(kl.fns.$eq(new Sym("shen.to"), kl.fns.hd(kl.fns.tl(kl.fns.tl(kl.fns.tl(V2046)))))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.tl(V2046)))))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.tl(V2046)))))))))?(kl.fns.cons(new Sym("="), kl.fns.cons(kl.fns.hd(kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.tl(V2046))))), kl.fns.cons(kl.fns.hd(V2046), null)))):(asJsBool(kl.fns.$eq(new Sym("shen.failed!"), V2046))?(klFalse):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V2046)) && asJsBool(kl.fns.$eq(new Sym("shen.the"), kl.fns.hd(V2046))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V2046))) && asJsBool(kl.fns.$eq(new Sym("head"), kl.fns.hd(kl.fns.tl(V2046)))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(V2046)))) && asJsBool(kl.fns.$eq(new Sym("shen.of"), kl.fns.hd(kl.fns.tl(kl.fns.tl(V2046))))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(kl.fns.tl(V2046))))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.tl(V2046))))))))?(kl.fns.cons(new Sym("hd"), kl.fns.tl(kl.fns.tl(kl.fns.tl(V2046))))):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V2046)) && asJsBool(kl.fns.$eq(new Sym("shen.the"), kl.fns.hd(V2046))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V2046))) && asJsBool(kl.fns.$eq(new Sym("tail"), kl.fns.hd(kl.fns.tl(V2046)))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(V2046)))) && asJsBool(kl.fns.$eq(new Sym("shen.of"), kl.fns.hd(kl.fns.tl(kl.fns.tl(V2046))))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(kl.fns.tl(V2046))))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.tl(V2046))))))))?(kl.fns.cons(new Sym("tl"), kl.fns.tl(kl.fns.tl(kl.fns.tl(V2046))))):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V2046)) && asJsBool(kl.fns.$eq(new Sym("shen.pop"), kl.fns.hd(V2046))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V2046))) && asJsBool(kl.fns.$eq(new Sym("shen.the"), kl.fns.hd(kl.fns.tl(V2046)))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(V2046)))) && asJsBool(kl.fns.$eq(new Sym("shen.stack"), kl.fns.hd(kl.fns.tl(kl.fns.tl(V2046))))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.tl(V2046)))))))?(kl.fns.cons(new Sym("do"), kl.fns.cons(kl.fns.cons(new Sym("shen.incinfs"), null), kl.fns.cons(kl.fns.cons(new Sym("thaw"), kl.fns.cons(new Sym("Continuation"), null)), null)))):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V2046)) && asJsBool(kl.fns.$eq(new Sym("call"), kl.fns.hd(V2046))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V2046))) && asJsBool(kl.fns.$eq(new Sym("shen.the"), kl.fns.hd(kl.fns.tl(V2046)))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(V2046)))) && asJsBool(kl.fns.$eq(new Sym("shen.continuation"), kl.fns.hd(kl.fns.tl(kl.fns.tl(V2046))))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(kl.fns.tl(V2046))))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.tl(V2046))))))))?(kl.fns.cons(new Sym("do"), kl.fns.cons(kl.fns.cons(new Sym("shen.incinfs"), null), kl.fns.cons(Kl.headCall(kl.fns.shen$docall$unthe$uncontinuation, [Kl.headCall(kl.fns.shen$dochwild, [kl.fns.hd(kl.fns.tl(kl.fns.tl(kl.fns.tl(V2046))))]), new Sym("ProcessN"), new Sym("Continuation")]), null)))):(V2046))))))))))))));
                    });

kl.defun("shen.chwild", 1, function (V2048) {
                      return asJsBool(kl.fns.$eq(V2048, new Sym("_")))?(kl.fns.cons(new Sym("shen.newpv"), kl.fns.cons(new Sym("ProcessN"), null))):(asJsBool(kl.fns.cons$qu(V2048))?(Kl.tailCall(kl.fns.map, [Kl.setArity("shen.chwild_lambda", 1, function (Z) {
                      return Kl.tailCall(kl.fns.shen$dochwild, [Z]);
                    }), V2048])):(V2048));
                    });

kl.defun("shen.newpv", 1, function (V2050) {
                      return (function () {
                  const Count$pl1 = kl.fns.$pl(kl.fns.$lt_address(kl.fns.value(new Sym("shen.*varcounter*")), V2050), 1);
                    const IncVar = kl.fns.address_$gt(kl.fns.value(new Sym("shen.*varcounter*")), V2050, Count$pl1);
                    const Vector = kl.fns.$lt_address(kl.fns.value(new Sym("shen.*prologvectors*")), V2050);
                    const ResizeVectorIfNeeded = asJsBool(kl.fns.$eq(Count$pl1, Kl.headCall(kl.fns.limit, [Vector])))?(Kl.headCall(kl.fns.shen$doresizeprocessvector, [V2050, Count$pl1])):(new Sym("shen.skip"));
                    return Kl.tailCall(kl.fns.shen$domk_pvar, [Count$pl1]);
                })();
                    });

kl.defun("shen.resizeprocessvector", 2, function (V2053, V2054) {
                      return (function () {
                  const Vector = kl.fns.$lt_address(kl.fns.value(new Sym("shen.*prologvectors*")), V2053);
                    const BigVector = Kl.headCall(kl.fns.shen$doresize_vector, [Vector, kl.fns.$pl(V2054, V2054), new Sym("shen.-null-")]);
                    return kl.fns.address_$gt(kl.fns.value(new Sym("shen.*prologvectors*")), V2053, BigVector);
                })();
                    });

kl.defun("shen.resize-vector", 3, function (V2058, V2059, V2060) {
                      return (function () {
                  const BigVector = kl.fns.address_$gt(kl.fns.absvector(kl.fns.$pl(1, V2059)), 0, V2059);
                    return Kl.tailCall(kl.fns.shen$docopy_vector, [V2058, BigVector, Kl.headCall(kl.fns.limit, [V2058]), V2059, V2060]);
                })();
                    });

kl.defun("shen.copy-vector", 5, function (V2066, V2067, V2068, V2069, V2070) {
                      return Kl.tailCall(kl.fns.shen$docopy_vector_stage_2, [kl.fns.$pl(1, V2068), kl.fns.$pl(V2069, 1), V2070, Kl.headCall(kl.fns.shen$docopy_vector_stage_1, [1, V2066, V2067, kl.fns.$pl(1, V2068)])]);
                    });

kl.defun("shen.copy-vector-stage-1", 4, function (V2078, V2079, V2080, V2081) {
                      return asJsBool(kl.fns.$eq(V2081, V2078))?(V2080):(Kl.tailCall(kl.fns.shen$docopy_vector_stage_1, [kl.fns.$pl(1, V2078), V2079, kl.fns.address_$gt(V2080, V2078, kl.fns.$lt_address(V2079, V2078)), V2081]));
                    });

kl.defun("shen.copy-vector-stage-2", 4, function (V2089, V2090, V2091, V2092) {
                      return asJsBool(kl.fns.$eq(V2090, V2089))?(V2092):(Kl.tailCall(kl.fns.shen$docopy_vector_stage_2, [kl.fns.$pl(V2089, 1), V2090, V2091, kl.fns.address_$gt(V2092, V2089, V2091)]));
                    });

kl.defun("shen.mk-pvar", 1, function (V2094) {
                      return kl.fns.address_$gt(kl.fns.address_$gt(kl.fns.absvector(2), 0, new Sym("shen.pvar")), 1, V2094);
                    });

kl.defun("shen.pvar?", 1, function (V2096) {
                      return asKlBool(asJsBool(kl.fns.absvector$qu(V2096)) && asJsBool(kl.fns.$eq((function () {
                          try {
                            return kl.fns.$lt_address(V2096, 0);
                          } catch (E) {
                            return new Sym("shen.not-pvar");
                          }
                        })(), new Sym("shen.pvar"))));
                    });

kl.defun("shen.bindv", 3, function (V2100, V2101, V2102) {
                      return (function () {
                  const Vector = kl.fns.$lt_address(kl.fns.value(new Sym("shen.*prologvectors*")), V2102);
                    return kl.fns.address_$gt(Vector, kl.fns.$lt_address(V2100, 1), V2101);
                })();
                    });

kl.defun("shen.unbindv", 2, function (V2105, V2106) {
                      return (function () {
                  const Vector = kl.fns.$lt_address(kl.fns.value(new Sym("shen.*prologvectors*")), V2106);
                    return kl.fns.address_$gt(Vector, kl.fns.$lt_address(V2105, 1), new Sym("shen.-null-"));
                })();
                    });

kl.defun("shen.incinfs", 0, function () {
                      return kl.symbols.shen$do$stinfs$st = kl.fns.$pl(1, kl.fns.value(new Sym("shen.*infs*")));
                    });

kl.defun("shen.call_the_continuation", 3, function (V2110, V2111, V2112) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V2110)) && asJsBool(kl.fns.cons$qu(kl.fns.hd(V2110))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(V2110)))))?(kl.fns.cons(kl.fns.hd(kl.fns.hd(V2110)), Kl.headCall(kl.fns.append, [kl.fns.tl(kl.fns.hd(V2110)), kl.fns.cons(V2111, kl.fns.cons(V2112, null))]))):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V2110)) && asJsBool(kl.fns.cons$qu(kl.fns.hd(V2110)))))?((function () {
                  const NewContinuation = Kl.headCall(kl.fns.shen$donewcontinuation, [kl.fns.tl(V2110), V2111, V2112]);
                    return kl.fns.cons(kl.fns.hd(kl.fns.hd(V2110)), Kl.headCall(kl.fns.append, [kl.fns.tl(kl.fns.hd(V2110)), kl.fns.cons(V2111, kl.fns.cons(NewContinuation, null))]));
                })()):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.call_the_continuation")])));
                    });

kl.defun("shen.newcontinuation", 3, function (V2116, V2117, V2118) {
                      return asJsBool(kl.fns.$eq(null, V2116))?(V2118):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V2116)) && asJsBool(kl.fns.cons$qu(kl.fns.hd(V2116)))))?(kl.fns.cons(new Sym("freeze"), kl.fns.cons(kl.fns.cons(kl.fns.hd(kl.fns.hd(V2116)), Kl.headCall(kl.fns.append, [kl.fns.tl(kl.fns.hd(V2116)), kl.fns.cons(V2117, kl.fns.cons(Kl.headCall(kl.fns.shen$donewcontinuation, [kl.fns.tl(V2116), V2117, V2118]), null))])), null))):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.newcontinuation")])));
                    });

kl.defun("return", 3, function (V2126, V2127, V2128) {
                      return Kl.tailCall(kl.fns.shen$doderef, [V2126, V2127]);
                    });

kl.defun("shen.measure&return", 3, function (V2136, V2137, V2138) {
                      return (function () {
                      Kl.headCall(kl.fns.shen$doprhush, [Kl.headCall(kl.fns.shen$doapp, [kl.fns.value(new Sym("shen.*infs*")), " inferences\n", new Sym("shen.a")]), Kl.headCall(kl.fns.stoutput, [])]);
                      return Kl.tailCall(kl.fns.shen$doderef, [V2136, V2137]);
                    })();
                    });

kl.defun("unify", 4, function (V2143, V2144, V2145, V2146) {
                      return Kl.tailCall(kl.fns.shen$dolzy$eq, [Kl.headCall(kl.fns.shen$dolazyderef, [V2143, V2145]), Kl.headCall(kl.fns.shen$dolazyderef, [V2144, V2145]), V2145, V2146]);
                    });

kl.defun("shen.lzy=", 4, function (V2168, V2169, V2170, V2171) {
                      return asJsBool(kl.fns.$eq(V2169, V2168))?(Kl.tailCall(kl.fns.thaw, [V2171])):(asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V2168]))?(Kl.tailCall(kl.fns.bind, [V2168, V2169, V2170, V2171])):(asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V2169]))?(Kl.tailCall(kl.fns.bind, [V2169, V2168, V2170, V2171])):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V2168)) && asJsBool(kl.fns.cons$qu(V2169))))?(Kl.tailCall(kl.fns.shen$dolzy$eq, [Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.hd(V2168), V2170]), Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.hd(V2169), V2170]), V2170, Kl.setArity("shen.lzy=_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.shen$dolzy$eq, [Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V2168), V2170]), Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V2169), V2170]), V2170, V2171]);
                    })])):(klFalse))));
                    });

kl.defun("shen.deref", 2, function (V2174, V2175) {
                      return asJsBool(kl.fns.cons$qu(V2174))?(kl.fns.cons(Kl.headCall(kl.fns.shen$doderef, [kl.fns.hd(V2174), V2175]), Kl.headCall(kl.fns.shen$doderef, [kl.fns.tl(V2174), V2175]))):(asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V2174]))?((function () {
                  const Value = Kl.headCall(kl.fns.shen$dovalvector, [V2174, V2175]);
                    return asJsBool(kl.fns.$eq(Value, new Sym("shen.-null-")))?(V2174):(Kl.tailCall(kl.fns.shen$doderef, [Value, V2175]));
                })()):(V2174));
                    });

kl.defun("shen.lazyderef", 2, function (V2178, V2179) {
                      return asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V2178]))?((function () {
                  const Value = Kl.headCall(kl.fns.shen$dovalvector, [V2178, V2179]);
                    return asJsBool(kl.fns.$eq(Value, new Sym("shen.-null-")))?(V2178):(Kl.tailCall(kl.fns.shen$dolazyderef, [Value, V2179]));
                })()):(V2178);
                    });

kl.defun("shen.valvector", 2, function (V2182, V2183) {
                      return kl.fns.$lt_address(kl.fns.$lt_address(kl.fns.value(new Sym("shen.*prologvectors*")), V2183), kl.fns.$lt_address(V2182, 1));
                    });

kl.defun("unify!", 4, function (V2188, V2189, V2190, V2191) {
                      return Kl.tailCall(kl.fns.shen$dolzy$eq$ex, [Kl.headCall(kl.fns.shen$dolazyderef, [V2188, V2190]), Kl.headCall(kl.fns.shen$dolazyderef, [V2189, V2190]), V2190, V2191]);
                    });

kl.defun("shen.lzy=!", 4, function (V2213, V2214, V2215, V2216) {
                      return asJsBool(kl.fns.$eq(V2214, V2213))?(Kl.tailCall(kl.fns.thaw, [V2216])):(asJsBool(asKlBool(asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V2213])) && asJsBool(Kl.headCall(kl.fns.not, [Kl.headCall(kl.fns.shen$dooccurs$qu, [V2213, Kl.headCall(kl.fns.shen$doderef, [V2214, V2215])])]))))?(Kl.tailCall(kl.fns.bind, [V2213, V2214, V2215, V2216])):(asJsBool(asKlBool(asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V2214])) && asJsBool(Kl.headCall(kl.fns.not, [Kl.headCall(kl.fns.shen$dooccurs$qu, [V2214, Kl.headCall(kl.fns.shen$doderef, [V2213, V2215])])]))))?(Kl.tailCall(kl.fns.bind, [V2214, V2213, V2215, V2216])):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V2213)) && asJsBool(kl.fns.cons$qu(V2214))))?(Kl.tailCall(kl.fns.shen$dolzy$eq$ex, [Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.hd(V2213), V2215]), Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.hd(V2214), V2215]), V2215, Kl.setArity("shen.lzy=!_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.shen$dolzy$eq$ex, [Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V2213), V2215]), Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V2214), V2215]), V2215, V2216]);
                    })])):(klFalse))));
                    });

kl.defun("shen.occurs?", 2, function (V2228, V2229) {
                      return asJsBool(kl.fns.$eq(V2229, V2228))?(klTrue):(asJsBool(kl.fns.cons$qu(V2229))?(asKlBool(asJsBool(Kl.headCall(kl.fns.shen$dooccurs$qu, [V2228, kl.fns.hd(V2229)])) || asJsBool(Kl.headCall(kl.fns.shen$dooccurs$qu, [V2228, kl.fns.tl(V2229)])))):(klFalse));
                    });

kl.defun("identical", 4, function (V2234, V2235, V2236, V2237) {
                      return Kl.tailCall(kl.fns.shen$dolzy$eq$eq, [Kl.headCall(kl.fns.shen$dolazyderef, [V2234, V2236]), Kl.headCall(kl.fns.shen$dolazyderef, [V2235, V2236]), V2236, V2237]);
                    });

kl.defun("shen.lzy==", 4, function (V2259, V2260, V2261, V2262) {
                      return asJsBool(kl.fns.$eq(V2260, V2259))?(Kl.tailCall(kl.fns.thaw, [V2262])):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V2259)) && asJsBool(kl.fns.cons$qu(V2260))))?(Kl.tailCall(kl.fns.shen$dolzy$eq$eq, [Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.hd(V2259), V2261]), Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.hd(V2260), V2261]), V2261, Kl.setArity("shen.lzy==_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.shen$dolzy$eq$eq, [kl.fns.tl(V2259), kl.fns.tl(V2260), V2261, V2262]);
                    })])):(klFalse));
                    });

kl.defun("shen.pvar", 1, function (V2264) {
                      return kl.fns.cn("Var", Kl.headCall(kl.fns.shen$doapp, [kl.fns.$lt_address(V2264, 1), "", new Sym("shen.a")]));
                    });

kl.defun("bind", 4, function (V2269, V2270, V2271, V2272) {
                      return (function () {
                      Kl.headCall(kl.fns.shen$dobindv, [V2269, V2270, V2271]);
                      return (function () {
                  const Result = Kl.headCall(kl.fns.thaw, [V2272]);
                    return (function () {
                      Kl.headCall(kl.fns.shen$dounbindv, [V2269, V2271]);
                      return Result;
                    })();
                })();
                    })();
                    });

kl.defun("fwhen", 3, function (V2290, V2291, V2292) {
                      return asJsBool(kl.fns.$eq(klTrue, V2290))?(Kl.tailCall(kl.fns.thaw, [V2292])):(asJsBool(kl.fns.$eq(klFalse, V2290))?(klFalse):(kl.fns.simple_error(kl.fns.cn("fwhen expects a boolean: not ", Kl.headCall(kl.fns.shen$doapp, [V2290, "%", new Sym("shen.s")])))));
                    });

kl.defun("call", 3, function (V2308, V2309, V2310) {
                      return asJsBool(kl.fns.cons$qu(V2308))?(Kl.tailCall(kl.fns.shen$docall_help, [Kl.headCall(kl.fns.function, [Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.hd(V2308), V2309])]), kl.fns.tl(V2308), V2309, V2310])):(klFalse);
                    });

kl.defun("shen.call-help", 4, function (V2315, V2316, V2317, V2318) {
                      return asJsBool(kl.fns.$eq(null, V2316))?(Kl.tailCall(V2315, [V2317, V2318])):(asJsBool(kl.fns.cons$qu(V2316))?(Kl.tailCall(kl.fns.shen$docall_help, [Kl.headCall(V2315, [kl.fns.hd(V2316)]), kl.fns.tl(V2316), V2317, V2318])):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.call-help")])));
                    });

kl.defun("shen.intprolog", 1, function (V2320) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V2320)) && asJsBool(kl.fns.cons$qu(kl.fns.hd(V2320)))))?((function () {
                  const ProcessN = Kl.headCall(kl.fns.shen$dostart_new_prolog_process, []);
                    return Kl.tailCall(kl.fns.shen$dointprolog_help, [kl.fns.hd(kl.fns.hd(V2320)), Kl.headCall(kl.fns.shen$doinsert_prolog_variables, [kl.fns.cons(kl.fns.tl(kl.fns.hd(V2320)), kl.fns.cons(kl.fns.tl(V2320), null)), ProcessN]), ProcessN]);
                })()):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.intprolog")]));
                    });

kl.defun("shen.intprolog-help", 3, function (V2324, V2325, V2326) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V2325)) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V2325))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(V2325))))))?(Kl.tailCall(kl.fns.shen$dointprolog_help_help, [V2324, kl.fns.hd(V2325), kl.fns.hd(kl.fns.tl(V2325)), V2326])):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.intprolog-help")]));
                    });

kl.defun("shen.intprolog-help-help", 4, function (V2331, V2332, V2333, V2334) {
                      return asJsBool(kl.fns.$eq(null, V2332))?(Kl.tailCall(V2331, [V2334, Kl.setArity("shen.intprolog-help-help_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.shen$docall_rest, [V2333, V2334]);
                    })])):(asJsBool(kl.fns.cons$qu(V2332))?(Kl.tailCall(kl.fns.shen$dointprolog_help_help, [Kl.headCall(V2331, [kl.fns.hd(V2332)]), kl.fns.tl(V2332), V2333, V2334])):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.intprolog-help-help")])));
                    });

kl.defun("shen.call-rest", 2, function (V2339, V2340) {
                      return asJsBool(kl.fns.$eq(null, V2339))?(klTrue):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V2339)) && asJsBool(kl.fns.cons$qu(kl.fns.hd(V2339))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.hd(V2339))))))?(Kl.tailCall(kl.fns.shen$docall_rest, [kl.fns.cons(kl.fns.cons(Kl.headCall(asKlFunction(kl.fns.hd(kl.fns.hd(V2339))), [kl.fns.hd(kl.fns.tl(kl.fns.hd(V2339)))]), kl.fns.tl(kl.fns.tl(kl.fns.hd(V2339)))), kl.fns.tl(V2339)), V2340])):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V2339)) && asJsBool(kl.fns.cons$qu(kl.fns.hd(V2339))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.hd(V2339))))))?(Kl.tailCall(asKlFunction(kl.fns.hd(kl.fns.hd(V2339))), [V2340, Kl.setArity("shen.call-rest_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.shen$docall_rest, [kl.fns.tl(V2339), V2340]);
                    })])):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.call-rest")]))));
                    });

kl.defun("shen.start-new-prolog-process", 0, function () {
                      return (function () {
                  const IncrementProcessCounter = kl.symbols.shen$do$stprocess_counter$st = kl.fns.$pl(1, kl.fns.value(new Sym("shen.*process-counter*")));
                    return Kl.tailCall(kl.fns.shen$doinitialise_prolog, [IncrementProcessCounter]);
                })();
                    });

kl.defun("shen.insert-prolog-variables", 2, function (V2343, V2344) {
                      return Kl.tailCall(kl.fns.shen$doinsert_prolog_variables_help, [V2343, Kl.headCall(kl.fns.shen$doflatten, [V2343]), V2344]);
                    });

kl.defun("shen.insert-prolog-variables-help", 3, function (V2352, V2353, V2354) {
                      return asJsBool(kl.fns.$eq(null, V2353))?(V2352):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V2353)) && asJsBool(Kl.headCall(kl.fns.variable$qu, [kl.fns.hd(V2353)]))))?((function () {
                  const V = Kl.headCall(kl.fns.shen$donewpv, [V2354]);
                    const XV$slY = Kl.headCall(kl.fns.subst, [V, kl.fns.hd(V2353), V2352]);
                    const Z_Y = Kl.headCall(kl.fns.remove, [kl.fns.hd(V2353), kl.fns.tl(V2353)]);
                    return Kl.tailCall(kl.fns.shen$doinsert_prolog_variables_help, [XV$slY, Z_Y, V2354]);
                })()):(asJsBool(kl.fns.cons$qu(V2353))?(Kl.tailCall(kl.fns.shen$doinsert_prolog_variables_help, [V2352, kl.fns.tl(V2353), V2354])):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.insert-prolog-variables-help")]))));
                    });

kl.defun("shen.initialise-prolog", 1, function (V2356) {
                      return (function () {
                  const Vector = kl.fns.address_$gt(kl.fns.value(new Sym("shen.*prologvectors*")), V2356, Kl.headCall(kl.fns.shen$dofillvector, [Kl.headCall(kl.fns.vector, [10]), 1, 10, new Sym("shen.-null-")]));
                    const Counter = kl.fns.address_$gt(kl.fns.value(new Sym("shen.*varcounter*")), V2356, 1);
                    return V2356;
                })();
                    });

kl.defun("shen.f_error", 1, function (V4048) {
                      return (function () {
                      Kl.headCall(kl.fns.shen$doprhush, [kl.fns.cn("partial function ", Kl.headCall(kl.fns.shen$doapp, [V4048, ";\n", new Sym("shen.a")])), Kl.headCall(kl.fns.stoutput, [])]);
asJsBool(asKlBool(asJsBool(Kl.headCall(kl.fns.not, [Kl.headCall(kl.fns.shen$dotracked$qu, [V4048])])) && asJsBool(Kl.headCall(kl.fns.y_or_n$qu, [kl.fns.cn("track ", Kl.headCall(kl.fns.shen$doapp, [V4048, "? ", new Sym("shen.a")]))]))))?(Kl.headCall(kl.fns.shen$dotrack_function, [Kl.headCall(kl.fns.ps, [V4048])])):(new Sym("shen.ok"));
                      return kl.fns.simple_error("aborted");
                    })();
                    });

kl.defun("shen.tracked?", 1, function (V4050) {
                      return Kl.tailCall(kl.fns.element$qu, [V4050, kl.fns.value(new Sym("shen.*tracking*"))]);
                    });

kl.defun("track", 1, function (V4052) {
                      return (function () {
                  const Source = Kl.headCall(kl.fns.ps, [V4052]);
                    return Kl.tailCall(kl.fns.shen$dotrack_function, [Source]);
                })();
                    });

kl.defun("shen.track-function", 1, function (V4054) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V4054)) && asJsBool(kl.fns.$eq(new Sym("defun"), kl.fns.hd(V4054))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V4054))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(V4054)))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(kl.fns.tl(V4054))))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.tl(V4054))))))))?((function () {
                  const KL = kl.fns.cons(new Sym("defun"), kl.fns.cons(kl.fns.hd(kl.fns.tl(V4054)), kl.fns.cons(kl.fns.hd(kl.fns.tl(kl.fns.tl(V4054))), kl.fns.cons(Kl.headCall(kl.fns.shen$doinsert_tracking_code, [kl.fns.hd(kl.fns.tl(V4054)), kl.fns.hd(kl.fns.tl(kl.fns.tl(V4054))), kl.fns.hd(kl.fns.tl(kl.fns.tl(kl.fns.tl(V4054))))]), null))));
                    const Ob = kl.fns.eval_kl(KL);
                    const Tr = kl.symbols.shen$do$sttracking$st = kl.fns.cons(Ob, kl.fns.value(new Sym("shen.*tracking*")));
                    return Ob;
                })()):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.track-function")]));
                    });

kl.defun("shen.insert-tracking-code", 3, function (V4058, V4059, V4060) {
                      return kl.fns.cons(new Sym("do"), kl.fns.cons(kl.fns.cons(new Sym("set"), kl.fns.cons(new Sym("shen.*call*"), kl.fns.cons(kl.fns.cons(new Sym("+"), kl.fns.cons(kl.fns.cons(new Sym("value"), kl.fns.cons(new Sym("shen.*call*"), null)), kl.fns.cons(1, null))), null))), kl.fns.cons(kl.fns.cons(new Sym("do"), kl.fns.cons(kl.fns.cons(new Sym("shen.input-track"), kl.fns.cons(kl.fns.cons(new Sym("value"), kl.fns.cons(new Sym("shen.*call*"), null)), kl.fns.cons(V4058, kl.fns.cons(Kl.headCall(kl.fns.shen$docons$unform, [V4059]), null)))), kl.fns.cons(kl.fns.cons(new Sym("do"), kl.fns.cons(kl.fns.cons(new Sym("shen.terpri-or-read-char"), null), kl.fns.cons(kl.fns.cons(new Sym("let"), kl.fns.cons(new Sym("Result"), kl.fns.cons(V4060, kl.fns.cons(kl.fns.cons(new Sym("do"), kl.fns.cons(kl.fns.cons(new Sym("shen.output-track"), kl.fns.cons(kl.fns.cons(new Sym("value"), kl.fns.cons(new Sym("shen.*call*"), null)), kl.fns.cons(V4058, kl.fns.cons(new Sym("Result"), null)))), kl.fns.cons(kl.fns.cons(new Sym("do"), kl.fns.cons(kl.fns.cons(new Sym("set"), kl.fns.cons(new Sym("shen.*call*"), kl.fns.cons(kl.fns.cons(new Sym("-"), kl.fns.cons(kl.fns.cons(new Sym("value"), kl.fns.cons(new Sym("shen.*call*"), null)), kl.fns.cons(1, null))), null))), kl.fns.cons(kl.fns.cons(new Sym("do"), kl.fns.cons(kl.fns.cons(new Sym("shen.terpri-or-read-char"), null), kl.fns.cons(new Sym("Result"), null))), null))), null))), null)))), null))), null))), null)));
                    });

kl.defun("step", 1, function (V4066) {
                      return asJsBool(kl.fns.$eq(new Sym("+"), V4066))?(kl.symbols.shen$do$ststep$st = klTrue):(asJsBool(kl.fns.$eq(new Sym("-"), V4066))?(kl.symbols.shen$do$ststep$st = klFalse):(kl.fns.simple_error("step expects a + or a -.\n")));
                    });

kl.defun("spy", 1, function (V4072) {
                      return asJsBool(kl.fns.$eq(new Sym("+"), V4072))?(kl.symbols.shen$do$stspy$st = klTrue):(asJsBool(kl.fns.$eq(new Sym("-"), V4072))?(kl.symbols.shen$do$stspy$st = klFalse):(kl.fns.simple_error("spy expects a + or a -.\n")));
                    });

kl.defun("shen.terpri-or-read-char", 0, function () {
                      return asJsBool(kl.fns.value(new Sym("shen.*step*")))?(Kl.tailCall(kl.fns.shen$docheck_byte, [kl.fns.read_byte(kl.symbols.$ststinput$st)])):(Kl.tailCall(kl.fns.nl, [1]));
                    });

kl.defun("shen.check-byte", 1, function (V4078) {
                      return asJsBool(kl.fns.$eq(V4078, Kl.headCall(kl.fns.shen$dohat, [])))?(kl.fns.simple_error("aborted")):(klTrue);
                    });

kl.defun("shen.input-track", 3, function (V4082, V4083, V4084) {
                      return (function () {
                      Kl.headCall(kl.fns.shen$doprhush, [kl.fns.cn("\n", Kl.headCall(kl.fns.shen$doapp, [Kl.headCall(kl.fns.shen$dospaces, [V4082]), kl.fns.cn("<", Kl.headCall(kl.fns.shen$doapp, [V4082, kl.fns.cn("> Inputs to ", Kl.headCall(kl.fns.shen$doapp, [V4083, kl.fns.cn(" \n", Kl.headCall(kl.fns.shen$doapp, [Kl.headCall(kl.fns.shen$dospaces, [V4082]), "", new Sym("shen.a")])), new Sym("shen.a")])), new Sym("shen.a")])), new Sym("shen.a")])), Kl.headCall(kl.fns.stoutput, [])]);
                      return Kl.tailCall(kl.fns.shen$dorecursively_print, [V4084]);
                    })();
                    });

kl.defun("shen.recursively-print", 1, function (V4086) {
                      return asJsBool(kl.fns.$eq(null, V4086))?(Kl.tailCall(kl.fns.shen$doprhush, [" ==>", Kl.headCall(kl.fns.stoutput, [])])):(asJsBool(kl.fns.cons$qu(V4086))?((function () {
                      Kl.headCall(kl.fns.print, [kl.fns.hd(V4086)]);
Kl.headCall(kl.fns.shen$doprhush, [", ", Kl.headCall(kl.fns.stoutput, [])]);
                      return Kl.tailCall(kl.fns.shen$dorecursively_print, [kl.fns.tl(V4086)]);
                    })()):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.recursively-print")])));
                    });

kl.defun("shen.spaces", 1, function (V4088) {
                      return asJsBool(kl.fns.$eq(0, V4088))?(""):(kl.fns.cn(" ", Kl.headCall(kl.fns.shen$dospaces, [kl.fns._(V4088, 1)])));
                    });

kl.defun("shen.output-track", 3, function (V4092, V4093, V4094) {
                      return Kl.tailCall(kl.fns.shen$doprhush, [kl.fns.cn("\n", Kl.headCall(kl.fns.shen$doapp, [Kl.headCall(kl.fns.shen$dospaces, [V4092]), kl.fns.cn("<", Kl.headCall(kl.fns.shen$doapp, [V4092, kl.fns.cn("> Output from ", Kl.headCall(kl.fns.shen$doapp, [V4093, kl.fns.cn(" \n", Kl.headCall(kl.fns.shen$doapp, [Kl.headCall(kl.fns.shen$dospaces, [V4092]), kl.fns.cn("==> ", Kl.headCall(kl.fns.shen$doapp, [V4094, "", new Sym("shen.s")])), new Sym("shen.a")])), new Sym("shen.a")])), new Sym("shen.a")])), new Sym("shen.a")])), Kl.headCall(kl.fns.stoutput, [])]);
                    });

kl.defun("untrack", 1, function (V4096) {
                      return (function () {
                  const Tracking = kl.fns.value(new Sym("shen.*tracking*"));
                    const Tracking_1 = kl.symbols.shen$do$sttracking$st = Kl.headCall(kl.fns.remove, [V4096, Tracking]);
                    return Kl.tailCall(kl.fns.eval, [Kl.headCall(kl.fns.ps, [V4096])]);
                })();
                    });

kl.defun("profile", 1, function (V4098) {
                      return Kl.tailCall(kl.fns.shen$doprofile_help, [Kl.headCall(kl.fns.ps, [V4098])]);
                    });

kl.defun("shen.profile-help", 1, function (V4104) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V4104)) && asJsBool(kl.fns.$eq(new Sym("defun"), kl.fns.hd(V4104))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V4104))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(V4104)))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(kl.fns.tl(V4104))))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.tl(V4104))))))))?((function () {
                  const G = Kl.headCall(kl.fns.gensym, [new Sym("shen.f")]);
                    const Profile = kl.fns.cons(new Sym("defun"), kl.fns.cons(kl.fns.hd(kl.fns.tl(V4104)), kl.fns.cons(kl.fns.hd(kl.fns.tl(kl.fns.tl(V4104))), kl.fns.cons(Kl.headCall(kl.fns.shen$doprofile_func, [kl.fns.hd(kl.fns.tl(V4104)), kl.fns.hd(kl.fns.tl(kl.fns.tl(V4104))), kl.fns.cons(G, kl.fns.hd(kl.fns.tl(kl.fns.tl(V4104))))]), null))));
                    const Def = kl.fns.cons(new Sym("defun"), kl.fns.cons(G, kl.fns.cons(kl.fns.hd(kl.fns.tl(kl.fns.tl(V4104))), kl.fns.cons(Kl.headCall(kl.fns.subst, [G, kl.fns.hd(kl.fns.tl(V4104)), kl.fns.hd(kl.fns.tl(kl.fns.tl(kl.fns.tl(V4104))))]), null))));
                    const CompileProfile = Kl.headCall(kl.fns.shen$doeval_without_macros, [Profile]);
                    const CompileG = Kl.headCall(kl.fns.shen$doeval_without_macros, [Def]);
                    return kl.fns.hd(kl.fns.tl(V4104));
                })()):(kl.fns.simple_error("Cannot profile.\n"));
                    });

kl.defun("unprofile", 1, function (V4106) {
                      return Kl.tailCall(kl.fns.untrack, [V4106]);
                    });

kl.defun("shen.profile-func", 3, function (V4110, V4111, V4112) {
                      return kl.fns.cons(new Sym("let"), kl.fns.cons(new Sym("Start"), kl.fns.cons(kl.fns.cons(new Sym("get-time"), kl.fns.cons(new Sym("run"), null)), kl.fns.cons(kl.fns.cons(new Sym("let"), kl.fns.cons(new Sym("Result"), kl.fns.cons(V4112, kl.fns.cons(kl.fns.cons(new Sym("let"), kl.fns.cons(new Sym("Finish"), kl.fns.cons(kl.fns.cons(new Sym("-"), kl.fns.cons(kl.fns.cons(new Sym("get-time"), kl.fns.cons(new Sym("run"), null)), kl.fns.cons(new Sym("Start"), null))), kl.fns.cons(kl.fns.cons(new Sym("let"), kl.fns.cons(new Sym("Record"), kl.fns.cons(kl.fns.cons(new Sym("shen.put-profile"), kl.fns.cons(V4110, kl.fns.cons(kl.fns.cons(new Sym("+"), kl.fns.cons(kl.fns.cons(new Sym("shen.get-profile"), kl.fns.cons(V4110, null)), kl.fns.cons(new Sym("Finish"), null))), null))), kl.fns.cons(new Sym("Result"), null)))), null)))), null)))), null))));
                    });

kl.defun("profile-results", 1, function (V4114) {
                      return (function () {
                  const Results = Kl.headCall(kl.fns.shen$doget_profile, [V4114]);
                    const Initialise = Kl.headCall(kl.fns.shen$doput_profile, [V4114, 0]);
                    return Kl.tailCall(kl.fns.$atp, [V4114, Results]);
                })();
                    });

kl.defun("shen.get-profile", 1, function (V4116) {
                      return (function () {
                          try {
                            return Kl.headCall(kl.fns.get, [V4116, new Sym("profile"), kl.fns.value(new Sym("*property-vector*"))]);
                          } catch (E) {
                            return 0;
                          }
                        })();
                    });

kl.defun("shen.put-profile", 2, function (V4119, V4120) {
                      return Kl.tailCall(kl.fns.put, [V4119, new Sym("profile"), V4120, kl.fns.value(new Sym("*property-vector*"))]);
                    });

kl.defun("load", 1, function (V1673) {
                      return (function () {
                  const Load = (function () {
                  const Start = kl.fns.get_time(new Sym("run"));
                    const Result = Kl.headCall(kl.fns.shen$doload_help, [kl.fns.value(new Sym("shen.*tc*")), Kl.headCall(kl.fns.read_file, [V1673])]);
                    const Finish = kl.fns.get_time(new Sym("run"));
                    const Time = kl.fns._(Finish, Start);
                    const Message = Kl.headCall(kl.fns.shen$doprhush, [kl.fns.cn("\nrun time: ", kl.fns.cn(kl.fns.str(Time), " secs\n")), Kl.headCall(kl.fns.stoutput, [])]);
                    return Result;
                })();
                    const Infs = asJsBool(kl.fns.value(new Sym("shen.*tc*")))?(Kl.headCall(kl.fns.shen$doprhush, [kl.fns.cn("\ntypechecked in ", Kl.headCall(kl.fns.shen$doapp, [Kl.headCall(kl.fns.inferences, []), " inferences\n", new Sym("shen.a")])), Kl.headCall(kl.fns.stoutput, [])])):(new Sym("shen.skip"));
                    return new Sym("loaded");
                })();
                    });

kl.defun("shen.load-help", 2, function (V1680, V1681) {
                      return asJsBool(kl.fns.$eq(klFalse, V1680))?(Kl.tailCall(kl.fns.shen$dofor_each, [Kl.setArity("shen.load-help_lambda", 1, function (X) {
                      return Kl.tailCall(kl.fns.shen$doprhush, [Kl.headCall(kl.fns.shen$doapp, [Kl.headCall(kl.fns.shen$doeval_without_macros, [X]), "\n", new Sym("shen.s")]), Kl.headCall(kl.fns.stoutput, [])]);
                    }), V1681])):((function () {
                  const RemoveSynonyms = Kl.headCall(kl.fns.mapcan, [Kl.setArity("shen.load-help_lambda", 1, function (X) {
                      return Kl.tailCall(kl.fns.shen$doremove_synonyms, [X]);
                    }), V1681]);
                    const Table = Kl.headCall(kl.fns.mapcan, [Kl.setArity("shen.load-help_lambda", 1, function (X) {
                      return Kl.tailCall(kl.fns.shen$dotypetable, [X]);
                    }), RemoveSynonyms]);
                    const Assume = Kl.headCall(kl.fns.shen$dofor_each, [Kl.setArity("shen.load-help_lambda", 1, function (X) {
                      return Kl.tailCall(kl.fns.shen$doassumetype, [X]);
                    }), Table]);
                    return (function () {
                          try {
                            return Kl.headCall(kl.fns.shen$dofor_each, [Kl.setArity("shen.load-help_lambda", 1, function (X) {
                      return Kl.tailCall(kl.fns.shen$dotypecheck_and_load, [X]);
                    }), RemoveSynonyms]);
                          } catch (E) {
                            return Kl.tailCall(kl.fns.shen$dounwind_types, [E, Table]);
                          }
                        })();
                })());
                    });

kl.defun("shen.remove-synonyms", 1, function (V1683) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1683)) && asJsBool(kl.fns.$eq(new Sym("shen.synonyms-help"), kl.fns.hd(V1683)))))?((function () {
                      Kl.headCall(kl.fns.eval, [V1683]);
                      return null;
                    })()):(kl.fns.cons(V1683, null));
                    });

kl.defun("shen.typecheck-and-load", 1, function (V1685) {
                      return (function () {
                      Kl.headCall(kl.fns.nl, [1]);
                      return Kl.tailCall(kl.fns.shen$dotypecheck_and_evaluate, [V1685, Kl.headCall(kl.fns.gensym, [new Sym("A")])]);
                    })();
                    });

kl.defun("shen.typetable", 1, function (V1691) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1691)) && asJsBool(kl.fns.$eq(new Sym("define"), kl.fns.hd(V1691))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V1691)))))?((function () {
                  const Sig = Kl.headCall(kl.fns.compile, [Kl.setArity("shen.typetable_lambda", 1, function (Y) {
                      return Kl.tailCall(kl.fns.shen$do$ltsig$plrest$gt, [Y]);
                    }), kl.fns.tl(kl.fns.tl(V1691)), Kl.setArity("shen.typetable_lambda", 1, function (E) {
                      return kl.fns.simple_error(Kl.headCall(kl.fns.shen$doapp, [kl.fns.hd(kl.fns.tl(V1691)), " lacks a proper signature.\n", new Sym("shen.a")]));
                    })]);
                    return kl.fns.cons(kl.fns.cons(kl.fns.hd(kl.fns.tl(V1691)), Sig), null);
                })()):(null);
                    });

kl.defun("shen.assumetype", 1, function (V1693) {
                      return asJsBool(kl.fns.cons$qu(V1693))?(Kl.tailCall(kl.fns.declare, [kl.fns.hd(V1693), kl.fns.tl(V1693)])):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.assumetype")]));
                    });

kl.defun("shen.unwind-types", 2, function (V1700, V1701) {
                      return asJsBool(kl.fns.$eq(null, V1701))?(kl.fns.simple_error(kl.fns.error_to_string(V1700))):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1701)) && asJsBool(kl.fns.cons$qu(kl.fns.hd(V1701)))))?((function () {
                      Kl.headCall(kl.fns.shen$doremtype, [kl.fns.hd(kl.fns.hd(V1701))]);
                      return Kl.tailCall(kl.fns.shen$dounwind_types, [V1700, kl.fns.tl(V1701)]);
                    })()):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.unwind-types")])));
                    });

kl.defun("shen.remtype", 1, function (V1703) {
                      return kl.symbols.shen$do$stsignedfuncs$st = Kl.headCall(kl.fns.shen$doremovetype, [V1703, kl.fns.value(new Sym("shen.*signedfuncs*"))]);
                    });

kl.defun("shen.removetype", 2, function (V1711, V1712) {
                      return asJsBool(kl.fns.$eq(null, V1712))?(null):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1712)) && asJsBool(kl.fns.cons$qu(kl.fns.hd(V1712))) && asJsBool(kl.fns.$eq(kl.fns.hd(kl.fns.hd(V1712)), V1711))))?(Kl.tailCall(kl.fns.shen$doremovetype, [kl.fns.hd(kl.fns.hd(V1712)), kl.fns.tl(V1712)])):(asJsBool(kl.fns.cons$qu(V1712))?(kl.fns.cons(kl.fns.hd(V1712), Kl.headCall(kl.fns.shen$doremovetype, [V1711, kl.fns.tl(V1712)]))):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.removetype")]))));
                    });

kl.defun("shen.<sig+rest>", 1, function (V1714) {
                      return (function () {
                  const Parse$unshen$do$ltsignature$gt = Kl.headCall(kl.fns.shen$do$ltsignature$gt, [V1714]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltsignature$gt)]))?((function () {
                  const Parse$un$lt$ex$gt = Kl.headCall(kl.fns.$lt$ex$gt, [Parse$unshen$do$ltsignature$gt]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$un$lt$ex$gt)]))?(Kl.tailCall(kl.fns.shen$dopair, [kl.fns.hd(Parse$un$lt$ex$gt), Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltsignature$gt])])):(Kl.tailCall(kl.fns.fail, []));
                })()):(Kl.tailCall(kl.fns.fail, []));
                })();
                    });

kl.defun("write-to-file", 2, function (V1717, V1718) {
                      return (function () {
                  const Stream = kl.fns.open(V1717, new Sym("out"));
                    const String = asJsBool(kl.fns.string$qu(V1718))?(Kl.headCall(kl.fns.shen$doapp, [V1718, "\n\n", new Sym("shen.a")])):(Kl.headCall(kl.fns.shen$doapp, [V1718, "\n\n", new Sym("shen.s")]));
                    const Write = Kl.headCall(kl.fns.pr, [String, Stream]);
                    const Close = kl.fns.close(Stream);
                    return V1718;
                })();
                    });

kl.defun("pr", 2, function (V4147, V4148) {
                      return (function () {
                          try {
                            return Kl.headCall(kl.fns.shen$doprh, [V4147, V4148, 0]);
                          } catch (E) {
                            return V4147;
                          }
                        })();
                    });

kl.defun("shen.prh", 3, function (V4152, V4153, V4154) {
                      return Kl.tailCall(kl.fns.shen$doprh, [V4152, V4153, Kl.headCall(kl.fns.shen$dowrite_char_and_inc, [V4152, V4153, V4154])]);
                    });

kl.defun("shen.write-char-and-inc", 3, function (V4158, V4159, V4160) {
                      return (function () {
                      kl.fns.write_byte(kl.fns.string_$gtn(kl.fns.pos(V4158, V4160)), V4159);
                      return kl.fns.$pl(V4160, 1);
                    })();
                    });

kl.defun("print", 1, function (V4162) {
                      return (function () {
                  const String = Kl.headCall(kl.fns.shen$doinsert, [V4162, "~S"]);
                    const Print = Kl.headCall(kl.fns.shen$doprhush, [String, Kl.headCall(kl.fns.stoutput, [])]);
                    return V4162;
                })();
                    });

kl.defun("shen.prhush", 2, function (V4165, V4166) {
                      return asJsBool(kl.fns.value(new Sym("*hush*")))?(V4165):(Kl.tailCall(kl.fns.pr, [V4165, V4166]));
                    });

kl.defun("shen.mkstr", 2, function (V4169, V4170) {
                      return asJsBool(kl.fns.string$qu(V4169))?(Kl.tailCall(kl.fns.shen$domkstr_l, [Kl.headCall(kl.fns.shen$doproc_nl, [V4169]), V4170])):(Kl.tailCall(kl.fns.shen$domkstr_r, [kl.fns.cons(new Sym("shen.proc-nl"), kl.fns.cons(V4169, null)), V4170]));
                    });

kl.defun("shen.mkstr-l", 2, function (V4173, V4174) {
                      return asJsBool(kl.fns.$eq(null, V4174))?(V4173):(asJsBool(kl.fns.cons$qu(V4174))?(Kl.tailCall(kl.fns.shen$domkstr_l, [Kl.headCall(kl.fns.shen$doinsert_l, [kl.fns.hd(V4174), V4173]), kl.fns.tl(V4174)])):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.mkstr-l")])));
                    });

kl.defun("shen.insert-l", 2, function (V4179, V4180) {
                      return asJsBool(kl.fns.$eq("", V4180))?(""):(asJsBool(asKlBool(asJsBool(Kl.headCall(kl.fns.shen$do$plstring$qu, [V4180])) && asJsBool(kl.fns.$eq("~", kl.fns.pos(V4180, 0))) && asJsBool(Kl.headCall(kl.fns.shen$do$plstring$qu, [kl.fns.tlstr(V4180)])) && asJsBool(kl.fns.$eq("A", kl.fns.pos(kl.fns.tlstr(V4180), 0)))))?(kl.fns.cons(new Sym("shen.app"), kl.fns.cons(V4179, kl.fns.cons(kl.fns.tlstr(kl.fns.tlstr(V4180)), kl.fns.cons(new Sym("shen.a"), null))))):(asJsBool(asKlBool(asJsBool(Kl.headCall(kl.fns.shen$do$plstring$qu, [V4180])) && asJsBool(kl.fns.$eq("~", kl.fns.pos(V4180, 0))) && asJsBool(Kl.headCall(kl.fns.shen$do$plstring$qu, [kl.fns.tlstr(V4180)])) && asJsBool(kl.fns.$eq("R", kl.fns.pos(kl.fns.tlstr(V4180), 0)))))?(kl.fns.cons(new Sym("shen.app"), kl.fns.cons(V4179, kl.fns.cons(kl.fns.tlstr(kl.fns.tlstr(V4180)), kl.fns.cons(new Sym("shen.r"), null))))):(asJsBool(asKlBool(asJsBool(Kl.headCall(kl.fns.shen$do$plstring$qu, [V4180])) && asJsBool(kl.fns.$eq("~", kl.fns.pos(V4180, 0))) && asJsBool(Kl.headCall(kl.fns.shen$do$plstring$qu, [kl.fns.tlstr(V4180)])) && asJsBool(kl.fns.$eq("S", kl.fns.pos(kl.fns.tlstr(V4180), 0)))))?(kl.fns.cons(new Sym("shen.app"), kl.fns.cons(V4179, kl.fns.cons(kl.fns.tlstr(kl.fns.tlstr(V4180)), kl.fns.cons(new Sym("shen.s"), null))))):(asJsBool(Kl.headCall(kl.fns.shen$do$plstring$qu, [V4180]))?(Kl.tailCall(kl.fns.shen$dofactor_cn, [kl.fns.cons(new Sym("cn"), kl.fns.cons(kl.fns.pos(V4180, 0), kl.fns.cons(Kl.headCall(kl.fns.shen$doinsert_l, [V4179, kl.fns.tlstr(V4180)]), null)))])):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V4180)) && asJsBool(kl.fns.$eq(new Sym("cn"), kl.fns.hd(V4180))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V4180))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(V4180)))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.tl(V4180)))))))?(kl.fns.cons(new Sym("cn"), kl.fns.cons(kl.fns.hd(kl.fns.tl(V4180)), kl.fns.cons(Kl.headCall(kl.fns.shen$doinsert_l, [V4179, kl.fns.hd(kl.fns.tl(kl.fns.tl(V4180)))]), null)))):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V4180)) && asJsBool(kl.fns.$eq(new Sym("shen.app"), kl.fns.hd(V4180))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V4180))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(V4180)))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(kl.fns.tl(V4180))))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.tl(V4180))))))))?(kl.fns.cons(new Sym("shen.app"), kl.fns.cons(kl.fns.hd(kl.fns.tl(V4180)), kl.fns.cons(Kl.headCall(kl.fns.shen$doinsert_l, [V4179, kl.fns.hd(kl.fns.tl(kl.fns.tl(V4180)))]), kl.fns.tl(kl.fns.tl(kl.fns.tl(V4180))))))):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.insert-l")]))))))));
                    });

kl.defun("shen.factor-cn", 1, function (V4182) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V4182)) && asJsBool(kl.fns.$eq(new Sym("cn"), kl.fns.hd(V4182))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V4182))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(V4182)))) && asJsBool(kl.fns.cons$qu(kl.fns.hd(kl.fns.tl(kl.fns.tl(V4182))))) && asJsBool(kl.fns.$eq(new Sym("cn"), kl.fns.hd(kl.fns.hd(kl.fns.tl(kl.fns.tl(V4182)))))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.hd(kl.fns.tl(kl.fns.tl(V4182)))))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(kl.fns.hd(kl.fns.tl(kl.fns.tl(V4182))))))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.hd(kl.fns.tl(kl.fns.tl(V4182)))))))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.tl(V4182))))) && asJsBool(kl.fns.string$qu(kl.fns.hd(kl.fns.tl(V4182)))) && asJsBool(kl.fns.string$qu(kl.fns.hd(kl.fns.tl(kl.fns.hd(kl.fns.tl(kl.fns.tl(V4182)))))))))?(kl.fns.cons(new Sym("cn"), kl.fns.cons(kl.fns.cn(kl.fns.hd(kl.fns.tl(V4182)), kl.fns.hd(kl.fns.tl(kl.fns.hd(kl.fns.tl(kl.fns.tl(V4182)))))), kl.fns.tl(kl.fns.tl(kl.fns.hd(kl.fns.tl(kl.fns.tl(V4182)))))))):(V4182);
                    });

kl.defun("shen.proc-nl", 1, function (V4184) {
                      return asJsBool(kl.fns.$eq("", V4184))?(""):(asJsBool(asKlBool(asJsBool(Kl.headCall(kl.fns.shen$do$plstring$qu, [V4184])) && asJsBool(kl.fns.$eq("~", kl.fns.pos(V4184, 0))) && asJsBool(Kl.headCall(kl.fns.shen$do$plstring$qu, [kl.fns.tlstr(V4184)])) && asJsBool(kl.fns.$eq("%", kl.fns.pos(kl.fns.tlstr(V4184), 0)))))?(kl.fns.cn(kl.fns.n_$gtstring(10), Kl.headCall(kl.fns.shen$doproc_nl, [kl.fns.tlstr(kl.fns.tlstr(V4184))]))):(asJsBool(Kl.headCall(kl.fns.shen$do$plstring$qu, [V4184]))?(kl.fns.cn(kl.fns.pos(V4184, 0), Kl.headCall(kl.fns.shen$doproc_nl, [kl.fns.tlstr(V4184)]))):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.proc-nl")]))));
                    });

kl.defun("shen.mkstr-r", 2, function (V4187, V4188) {
                      return asJsBool(kl.fns.$eq(null, V4188))?(V4187):(asJsBool(kl.fns.cons$qu(V4188))?(Kl.tailCall(kl.fns.shen$domkstr_r, [kl.fns.cons(new Sym("shen.insert"), kl.fns.cons(kl.fns.hd(V4188), kl.fns.cons(V4187, null))), kl.fns.tl(V4188)])):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.mkstr-r")])));
                    });

kl.defun("shen.insert", 2, function (V4191, V4192) {
                      return Kl.tailCall(kl.fns.shen$doinsert_h, [V4191, V4192, ""]);
                    });

kl.defun("shen.insert-h", 3, function (V4198, V4199, V4200) {
                      return asJsBool(kl.fns.$eq("", V4199))?(V4200):(asJsBool(asKlBool(asJsBool(Kl.headCall(kl.fns.shen$do$plstring$qu, [V4199])) && asJsBool(kl.fns.$eq("~", kl.fns.pos(V4199, 0))) && asJsBool(Kl.headCall(kl.fns.shen$do$plstring$qu, [kl.fns.tlstr(V4199)])) && asJsBool(kl.fns.$eq("A", kl.fns.pos(kl.fns.tlstr(V4199), 0)))))?(kl.fns.cn(V4200, Kl.headCall(kl.fns.shen$doapp, [V4198, kl.fns.tlstr(kl.fns.tlstr(V4199)), new Sym("shen.a")]))):(asJsBool(asKlBool(asJsBool(Kl.headCall(kl.fns.shen$do$plstring$qu, [V4199])) && asJsBool(kl.fns.$eq("~", kl.fns.pos(V4199, 0))) && asJsBool(Kl.headCall(kl.fns.shen$do$plstring$qu, [kl.fns.tlstr(V4199)])) && asJsBool(kl.fns.$eq("R", kl.fns.pos(kl.fns.tlstr(V4199), 0)))))?(kl.fns.cn(V4200, Kl.headCall(kl.fns.shen$doapp, [V4198, kl.fns.tlstr(kl.fns.tlstr(V4199)), new Sym("shen.r")]))):(asJsBool(asKlBool(asJsBool(Kl.headCall(kl.fns.shen$do$plstring$qu, [V4199])) && asJsBool(kl.fns.$eq("~", kl.fns.pos(V4199, 0))) && asJsBool(Kl.headCall(kl.fns.shen$do$plstring$qu, [kl.fns.tlstr(V4199)])) && asJsBool(kl.fns.$eq("S", kl.fns.pos(kl.fns.tlstr(V4199), 0)))))?(kl.fns.cn(V4200, Kl.headCall(kl.fns.shen$doapp, [V4198, kl.fns.tlstr(kl.fns.tlstr(V4199)), new Sym("shen.s")]))):(asJsBool(Kl.headCall(kl.fns.shen$do$plstring$qu, [V4199]))?(Kl.tailCall(kl.fns.shen$doinsert_h, [V4198, kl.fns.tlstr(V4199), kl.fns.cn(V4200, kl.fns.pos(V4199, 0))])):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.insert-h")]))))));
                    });

kl.defun("shen.app", 3, function (V4204, V4205, V4206) {
                      return kl.fns.cn(Kl.headCall(kl.fns.shen$doarg_$gtstr, [V4204, V4206]), V4205);
                    });

kl.defun("shen.arg->str", 2, function (V4214, V4215) {
                      return asJsBool(kl.fns.$eq(V4214, Kl.headCall(kl.fns.fail, [])))?("..."):(asJsBool(Kl.headCall(kl.fns.shen$dolist$qu, [V4214]))?(Kl.tailCall(kl.fns.shen$dolist_$gtstr, [V4214, V4215])):(asJsBool(kl.fns.string$qu(V4214))?(Kl.tailCall(kl.fns.shen$dostr_$gtstr, [V4214, V4215])):(asJsBool(kl.fns.absvector$qu(V4214))?(Kl.tailCall(kl.fns.shen$dovector_$gtstr, [V4214, V4215])):(Kl.tailCall(kl.fns.shen$doatom_$gtstr, [V4214])))));
                    });

kl.defun("shen.list->str", 2, function (V4218, V4219) {
                      return asJsBool(kl.fns.$eq(new Sym("shen.r"), V4219))?(Kl.tailCall(kl.fns.$ats, ["(", Kl.headCall(kl.fns.$ats, [Kl.headCall(kl.fns.shen$doiter_list, [V4218, new Sym("shen.r"), Kl.headCall(kl.fns.shen$domaxseq, [])]), ")"])])):(Kl.tailCall(kl.fns.$ats, ["[", Kl.headCall(kl.fns.$ats, [Kl.headCall(kl.fns.shen$doiter_list, [V4218, V4219, Kl.headCall(kl.fns.shen$domaxseq, [])]), "]"])]));
                    });

kl.defun("shen.maxseq", 0, function () {
                      return kl.fns.value(new Sym("*maximum-print-sequence-size*"));
                    });

kl.defun("shen.iter-list", 3, function (V4233, V4234, V4235) {
                      return asJsBool(kl.fns.$eq(null, V4233))?(""):(asJsBool(kl.fns.$eq(0, V4235))?("... etc"):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V4233)) && asJsBool(kl.fns.$eq(null, kl.fns.tl(V4233)))))?(Kl.tailCall(kl.fns.shen$doarg_$gtstr, [kl.fns.hd(V4233), V4234])):(asJsBool(kl.fns.cons$qu(V4233))?(Kl.tailCall(kl.fns.$ats, [Kl.headCall(kl.fns.shen$doarg_$gtstr, [kl.fns.hd(V4233), V4234]), Kl.headCall(kl.fns.$ats, [" ", Kl.headCall(kl.fns.shen$doiter_list, [kl.fns.tl(V4233), V4234, kl.fns._(V4235, 1)])])])):(Kl.tailCall(kl.fns.$ats, ["|", Kl.headCall(kl.fns.$ats, [" ", Kl.headCall(kl.fns.shen$doarg_$gtstr, [V4233, V4234])])])))));
                    });

kl.defun("shen.str->str", 2, function (V4242, V4243) {
                      return asJsBool(kl.fns.$eq(new Sym("shen.a"), V4243))?(V4242):(Kl.tailCall(kl.fns.$ats, [kl.fns.n_$gtstring(34), Kl.headCall(kl.fns.$ats, [V4242, kl.fns.n_$gtstring(34)])]));
                    });

kl.defun("shen.vector->str", 2, function (V4246, V4247) {
                      return asJsBool(Kl.headCall(kl.fns.shen$doprint_vector$qu, [V4246]))?(Kl.tailCall(asKlFunction(Kl.headCall(kl.fns.function, [kl.fns.$lt_address(V4246, 0)])), [V4246])):(asJsBool(Kl.headCall(kl.fns.vector$qu, [V4246]))?(Kl.tailCall(kl.fns.$ats, ["<", Kl.headCall(kl.fns.$ats, [Kl.headCall(kl.fns.shen$doiter_vector, [V4246, 1, V4247, Kl.headCall(kl.fns.shen$domaxseq, [])]), ">"])])):(Kl.tailCall(kl.fns.$ats, ["<", Kl.headCall(kl.fns.$ats, ["<", Kl.headCall(kl.fns.$ats, [Kl.headCall(kl.fns.shen$doiter_vector, [V4246, 0, V4247, Kl.headCall(kl.fns.shen$domaxseq, [])]), ">>"])])])));
                    });

kl.defun("shen.print-vector?", 1, function (V4249) {
                      return (function () {
                  const Zero = kl.fns.$lt_address(V4249, 0);
                    return asJsBool(kl.fns.$eq(Zero, new Sym("shen.tuple")))?(klTrue):(asJsBool(kl.fns.$eq(Zero, new Sym("shen.pvar")))?(klTrue):(asJsBool(kl.fns.$eq(Zero, new Sym("shen.dictionary")))?(klTrue):(asJsBool(Kl.headCall(kl.fns.not, [kl.fns.number$qu(Zero)]))?(Kl.tailCall(kl.fns.shen$dofbound$qu, [Zero])):(klFalse))));
                })();
                    });

kl.defun("shen.fbound?", 1, function (V4251) {
                      return (function () {
                          try {
                            return (function () {
                      Kl.headCall(kl.fns.shen$dolookup_func, [V4251]);
                      return klTrue;
                    })();
                          } catch (E) {
                            return klFalse;
                          }
                        })();
                    });

kl.defun("shen.tuple", 1, function (V4253) {
                      return kl.fns.cn("(@p ", Kl.headCall(kl.fns.shen$doapp, [kl.fns.$lt_address(V4253, 1), kl.fns.cn(" ", Kl.headCall(kl.fns.shen$doapp, [kl.fns.$lt_address(V4253, 2), ")", new Sym("shen.s")])), new Sym("shen.s")]));
                    });

kl.defun("shen.dictionary", 1, function (V4255) {
                      return "(dict ...)";
                    });

kl.defun("shen.iter-vector", 4, function (V4266, V4267, V4268, V4269) {
                      return asJsBool(kl.fns.$eq(0, V4269))?("... etc"):((function () {
                  const Item = (function () {
                          try {
                            return kl.fns.$lt_address(V4266, V4267);
                          } catch (E) {
                            return new Sym("shen.out-of-bounds");
                          }
                        })();
                    const Next = (function () {
                          try {
                            return kl.fns.$lt_address(V4266, kl.fns.$pl(V4267, 1));
                          } catch (E) {
                            return new Sym("shen.out-of-bounds");
                          }
                        })();
                    return asJsBool(kl.fns.$eq(Item, new Sym("shen.out-of-bounds")))?(""):(asJsBool(kl.fns.$eq(Next, new Sym("shen.out-of-bounds")))?(Kl.tailCall(kl.fns.shen$doarg_$gtstr, [Item, V4268])):(Kl.tailCall(kl.fns.$ats, [Kl.headCall(kl.fns.shen$doarg_$gtstr, [Item, V4268]), Kl.headCall(kl.fns.$ats, [" ", Kl.headCall(kl.fns.shen$doiter_vector, [V4266, kl.fns.$pl(V4267, 1), V4268, kl.fns._(V4269, 1)])])])));
                })());
                    });

kl.defun("shen.atom->str", 1, function (V4271) {
                      return (function () {
                          try {
                            return kl.fns.str(V4271);
                          } catch (E) {
                            return Kl.tailCall(kl.fns.shen$dofunexstring, []);
                          }
                        })();
                    });

kl.defun("shen.funexstring", 0, function () {
                      return Kl.tailCall(kl.fns.$ats, ["", Kl.headCall(kl.fns.$ats, ["f", Kl.headCall(kl.fns.$ats, ["u", Kl.headCall(kl.fns.$ats, ["n", Kl.headCall(kl.fns.$ats, ["e", Kl.headCall(kl.fns.$ats, [Kl.headCall(kl.fns.shen$doarg_$gtstr, [Kl.headCall(kl.fns.gensym, [kl.fns.intern("x")]), new Sym("shen.a")]), ""])])])])])]);
                    });

kl.defun("shen.list?", 1, function (V4273) {
                      return asKlBool(asJsBool(Kl.headCall(kl.fns.empty$qu, [V4273])) || asJsBool(kl.fns.cons$qu(V4273)));
                    });

kl.defun("macroexpand", 1, function (V1720) {
                      return (function () {
                  const Y = Kl.headCall(kl.fns.shen$docompose, [kl.fns.value(new Sym("*macros*")), V1720]);
                    return asJsBool(kl.fns.$eq(V1720, Y))?(V1720):(Kl.tailCall(kl.fns.shen$dowalk, [Kl.setArity("macroexpand_lambda", 1, function (Z) {
                      return Kl.tailCall(kl.fns.macroexpand, [Z]);
                    }), Y]));
                })();
                    });

kl.defun("shen.error-macro", 1, function (V1722) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1722)) && asJsBool(kl.fns.$eq(new Sym("error"), kl.fns.hd(V1722))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V1722)))))?(kl.fns.cons(new Sym("simple-error"), kl.fns.cons(Kl.headCall(kl.fns.shen$domkstr, [kl.fns.hd(kl.fns.tl(V1722)), kl.fns.tl(kl.fns.tl(V1722))]), null))):(V1722);
                    });

kl.defun("shen.output-macro", 1, function (V1724) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1724)) && asJsBool(kl.fns.$eq(new Sym("output"), kl.fns.hd(V1724))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V1724)))))?(kl.fns.cons(new Sym("shen.prhush"), kl.fns.cons(Kl.headCall(kl.fns.shen$domkstr, [kl.fns.hd(kl.fns.tl(V1724)), kl.fns.tl(kl.fns.tl(V1724))]), kl.fns.cons(kl.fns.cons(new Sym("stoutput"), null), null)))):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1724)) && asJsBool(kl.fns.$eq(new Sym("pr"), kl.fns.hd(V1724))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V1724))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(V1724))))))?(kl.fns.cons(new Sym("pr"), kl.fns.cons(kl.fns.hd(kl.fns.tl(V1724)), kl.fns.cons(kl.fns.cons(new Sym("stoutput"), null), null)))):(V1724));
                    });

kl.defun("shen.make-string-macro", 1, function (V1726) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1726)) && asJsBool(kl.fns.$eq(new Sym("make-string"), kl.fns.hd(V1726))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V1726)))))?(Kl.tailCall(kl.fns.shen$domkstr, [kl.fns.hd(kl.fns.tl(V1726)), kl.fns.tl(kl.fns.tl(V1726))])):(V1726);
                    });

kl.defun("shen.input-macro", 1, function (V1728) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1728)) && asJsBool(kl.fns.$eq(new Sym("lineread"), kl.fns.hd(V1728))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(V1728)))))?(kl.fns.cons(new Sym("lineread"), kl.fns.cons(kl.fns.cons(new Sym("stinput"), null), null))):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1728)) && asJsBool(kl.fns.$eq(new Sym("input"), kl.fns.hd(V1728))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(V1728)))))?(kl.fns.cons(new Sym("input"), kl.fns.cons(kl.fns.cons(new Sym("stinput"), null), null))):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1728)) && asJsBool(kl.fns.$eq(new Sym("read"), kl.fns.hd(V1728))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(V1728)))))?(kl.fns.cons(new Sym("read"), kl.fns.cons(kl.fns.cons(new Sym("stinput"), null), null))):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1728)) && asJsBool(kl.fns.$eq(new Sym("input+"), kl.fns.hd(V1728))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V1728))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(V1728))))))?(kl.fns.cons(new Sym("input+"), kl.fns.cons(kl.fns.hd(kl.fns.tl(V1728)), kl.fns.cons(kl.fns.cons(new Sym("stinput"), null), null)))):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1728)) && asJsBool(kl.fns.$eq(new Sym("read-byte"), kl.fns.hd(V1728))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(V1728)))))?(kl.fns.cons(new Sym("read-byte"), kl.fns.cons(kl.fns.cons(new Sym("stinput"), null), null))):(V1728)))));
                    });

kl.defun("shen.compose", 2, function (V1731, V1732) {
                      return asJsBool(kl.fns.$eq(null, V1731))?(V1732):(asJsBool(kl.fns.cons$qu(V1731))?(Kl.tailCall(kl.fns.shen$docompose, [kl.fns.tl(V1731), Kl.headCall(asKlFunction(kl.fns.hd(V1731)), [V1732])])):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.compose")])));
                    });

kl.defun("shen.compile-macro", 1, function (V1734) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1734)) && asJsBool(kl.fns.$eq(new Sym("compile"), kl.fns.hd(V1734))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V1734))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(V1734)))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.tl(V1734)))))))?(kl.fns.cons(new Sym("compile"), kl.fns.cons(kl.fns.hd(kl.fns.tl(V1734)), kl.fns.cons(kl.fns.hd(kl.fns.tl(kl.fns.tl(V1734))), kl.fns.cons(kl.fns.cons(new Sym("lambda"), kl.fns.cons(new Sym("E"), kl.fns.cons(kl.fns.cons(new Sym("if"), kl.fns.cons(kl.fns.cons(new Sym("cons?"), kl.fns.cons(new Sym("E"), null)), kl.fns.cons(kl.fns.cons(new Sym("error"), kl.fns.cons("parse error here: ~S~%", kl.fns.cons(new Sym("E"), null))), kl.fns.cons(kl.fns.cons(new Sym("error"), kl.fns.cons("parse error~%", null)), null)))), null))), null))))):(V1734);
                    });

kl.defun("shen.prolog-macro", 1, function (V1736) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1736)) && asJsBool(kl.fns.$eq(new Sym("prolog?"), kl.fns.hd(V1736)))))?((function () {
                  const F = Kl.headCall(kl.fns.gensym, [new Sym("shen.f")]);
                    const Receive = Kl.headCall(kl.fns.shen$doreceive_terms, [kl.fns.tl(V1736)]);
                    const PrologDef = Kl.headCall(kl.fns.eval, [Kl.headCall(kl.fns.append, [kl.fns.cons(new Sym("defprolog"), kl.fns.cons(F, null)), Kl.headCall(kl.fns.append, [Receive, Kl.headCall(kl.fns.append, [kl.fns.cons(new Sym("<--"), null), Kl.headCall(kl.fns.append, [Kl.headCall(kl.fns.shen$dopass_literals, [kl.fns.tl(V1736)]), kl.fns.cons(new Sym(";"), null)])])])])]);
                    const Query = kl.fns.cons(F, Kl.headCall(kl.fns.append, [Receive, kl.fns.cons(kl.fns.cons(new Sym("shen.start-new-prolog-process"), null), kl.fns.cons(kl.fns.cons(new Sym("freeze"), kl.fns.cons(klTrue, null)), null))]));
                    return Query;
                })()):(V1736);
                    });

kl.defun("shen.receive-terms", 1, function (V1742) {
                      return asJsBool(kl.fns.$eq(null, V1742))?(null):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1742)) && asJsBool(kl.fns.cons$qu(kl.fns.hd(V1742))) && asJsBool(kl.fns.$eq(new Sym("receive"), kl.fns.hd(kl.fns.hd(V1742)))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.hd(V1742)))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.hd(V1742)))))))?(kl.fns.cons(kl.fns.hd(kl.fns.tl(kl.fns.hd(V1742))), Kl.headCall(kl.fns.shen$doreceive_terms, [kl.fns.tl(V1742)]))):(asJsBool(kl.fns.cons$qu(V1742))?(Kl.tailCall(kl.fns.shen$doreceive_terms, [kl.fns.tl(V1742)])):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.receive-terms")]))));
                    });

kl.defun("shen.pass-literals", 1, function (V1746) {
                      return asJsBool(kl.fns.$eq(null, V1746))?(null):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1746)) && asJsBool(kl.fns.cons$qu(kl.fns.hd(V1746))) && asJsBool(kl.fns.$eq(new Sym("receive"), kl.fns.hd(kl.fns.hd(V1746)))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.hd(V1746)))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.hd(V1746)))))))?(Kl.tailCall(kl.fns.shen$dopass_literals, [kl.fns.tl(V1746)])):(asJsBool(kl.fns.cons$qu(V1746))?(kl.fns.cons(kl.fns.hd(V1746), Kl.headCall(kl.fns.shen$dopass_literals, [kl.fns.tl(V1746)]))):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.pass-literals")]))));
                    });

kl.defun("shen.defprolog-macro", 1, function (V1748) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1748)) && asJsBool(kl.fns.$eq(new Sym("defprolog"), kl.fns.hd(V1748))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V1748)))))?(Kl.tailCall(kl.fns.compile, [Kl.setArity("shen.defprolog-macro_lambda", 1, function (Y) {
                      return Kl.tailCall(kl.fns.shen$do$ltdefprolog$gt, [Y]);
                    }), kl.fns.tl(V1748), Kl.setArity("shen.defprolog-macro_lambda", 1, function (Y) {
                      return Kl.tailCall(kl.fns.shen$doprolog_error, [kl.fns.hd(kl.fns.tl(V1748)), Y]);
                    })])):(V1748);
                    });

kl.defun("shen.datatype-macro", 1, function (V1750) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1750)) && asJsBool(kl.fns.$eq(new Sym("datatype"), kl.fns.hd(V1750))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V1750)))))?(kl.fns.cons(new Sym("shen.process-datatype"), kl.fns.cons(Kl.headCall(kl.fns.shen$dointern_type, [kl.fns.hd(kl.fns.tl(V1750))]), kl.fns.cons(kl.fns.cons(new Sym("compile"), kl.fns.cons(kl.fns.cons(new Sym("lambda"), kl.fns.cons(new Sym("X"), kl.fns.cons(kl.fns.cons(new Sym("shen.<datatype-rules>"), kl.fns.cons(new Sym("X"), null)), null))), kl.fns.cons(Kl.headCall(kl.fns.shen$dorcons$unform, [kl.fns.tl(kl.fns.tl(V1750))]), kl.fns.cons(kl.fns.cons(new Sym("function"), kl.fns.cons(new Sym("shen.datatype-error"), null)), null)))), null)))):(V1750);
                    });

kl.defun("shen.intern-type", 1, function (V1752) {
                      return kl.fns.intern(kl.fns.cn("type#", kl.fns.str(V1752)));
                    });

kl.defun("shen.@s-macro", 1, function (V1754) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1754)) && asJsBool(kl.fns.$eq(new Sym("@s"), kl.fns.hd(V1754))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V1754))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(V1754)))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(kl.fns.tl(V1754)))))))?(kl.fns.cons(new Sym("@s"), kl.fns.cons(kl.fns.hd(kl.fns.tl(V1754)), kl.fns.cons(Kl.headCall(kl.fns.shen$do$ats_macro, [kl.fns.cons(new Sym("@s"), kl.fns.tl(kl.fns.tl(V1754)))]), null)))):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1754)) && asJsBool(kl.fns.$eq(new Sym("@s"), kl.fns.hd(V1754))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V1754))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(V1754)))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.tl(V1754))))) && asJsBool(kl.fns.string$qu(kl.fns.hd(kl.fns.tl(V1754))))))?((function () {
                  const E = Kl.headCall(kl.fns.explode, [kl.fns.hd(kl.fns.tl(V1754))]);
                    return asJsBool(kl.fns.$gt(Kl.headCall(kl.fns.length, [E]), 1))?(Kl.tailCall(kl.fns.shen$do$ats_macro, [kl.fns.cons(new Sym("@s"), Kl.headCall(kl.fns.append, [E, kl.fns.tl(kl.fns.tl(V1754))]))])):(V1754);
                })()):(V1754));
                    });

kl.defun("shen.synonyms-macro", 1, function (V1756) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1756)) && asJsBool(kl.fns.$eq(new Sym("synonyms"), kl.fns.hd(V1756)))))?(kl.fns.cons(new Sym("shen.synonyms-help"), kl.fns.cons(Kl.headCall(kl.fns.shen$dorcons$unform, [Kl.headCall(kl.fns.shen$docurry_synonyms, [kl.fns.tl(V1756)])]), null))):(V1756);
                    });

kl.defun("shen.curry-synonyms", 1, function (V1758) {
                      return Kl.tailCall(kl.fns.map, [Kl.setArity("shen.curry-synonyms_lambda", 1, function (X) {
                      return Kl.tailCall(kl.fns.shen$docurry_type, [X]);
                    }), V1758]);
                    });

kl.defun("shen.nl-macro", 1, function (V1760) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1760)) && asJsBool(kl.fns.$eq(new Sym("nl"), kl.fns.hd(V1760))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(V1760)))))?(kl.fns.cons(new Sym("nl"), kl.fns.cons(1, null))):(V1760);
                    });

kl.defun("shen.assoc-macro", 1, function (V1762) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1762)) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V1762))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(V1762)))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(kl.fns.tl(V1762))))) && asJsBool(Kl.headCall(kl.fns.element$qu, [kl.fns.hd(V1762), kl.fns.cons(new Sym("@p"), kl.fns.cons(new Sym("@v"), kl.fns.cons(new Sym("append"), kl.fns.cons(new Sym("and"), kl.fns.cons(new Sym("or"), kl.fns.cons(new Sym("+"), kl.fns.cons(new Sym("*"), kl.fns.cons(new Sym("do"), null))))))))]))))?(kl.fns.cons(kl.fns.hd(V1762), kl.fns.cons(kl.fns.hd(kl.fns.tl(V1762)), kl.fns.cons(Kl.headCall(kl.fns.shen$doassoc_macro, [kl.fns.cons(kl.fns.hd(V1762), kl.fns.tl(kl.fns.tl(V1762)))]), null)))):(V1762);
                    });

kl.defun("shen.let-macro", 1, function (V1764) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1764)) && asJsBool(kl.fns.$eq(new Sym("let"), kl.fns.hd(V1764))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V1764))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(V1764)))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(kl.fns.tl(V1764))))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.tl(V1764))))))))?(kl.fns.cons(new Sym("let"), kl.fns.cons(kl.fns.hd(kl.fns.tl(V1764)), kl.fns.cons(kl.fns.hd(kl.fns.tl(kl.fns.tl(V1764))), kl.fns.cons(Kl.headCall(kl.fns.shen$dolet_macro, [kl.fns.cons(new Sym("let"), kl.fns.tl(kl.fns.tl(kl.fns.tl(V1764))))]), null))))):(V1764);
                    });

kl.defun("shen.abs-macro", 1, function (V1766) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1766)) && asJsBool(kl.fns.$eq(new Sym("/."), kl.fns.hd(V1766))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V1766))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(V1766)))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(kl.fns.tl(V1766)))))))?(kl.fns.cons(new Sym("lambda"), kl.fns.cons(kl.fns.hd(kl.fns.tl(V1766)), kl.fns.cons(Kl.headCall(kl.fns.shen$doabs_macro, [kl.fns.cons(new Sym("/."), kl.fns.tl(kl.fns.tl(V1766)))]), null)))):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1766)) && asJsBool(kl.fns.$eq(new Sym("/."), kl.fns.hd(V1766))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V1766))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(V1766)))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.tl(V1766)))))))?(kl.fns.cons(new Sym("lambda"), kl.fns.tl(V1766))):(V1766));
                    });

kl.defun("shen.cases-macro", 1, function (V1770) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1770)) && asJsBool(kl.fns.$eq(new Sym("cases"), kl.fns.hd(V1770))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V1770))) && asJsBool(kl.fns.$eq(klTrue, kl.fns.hd(kl.fns.tl(V1770)))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(V1770))))))?(kl.fns.hd(kl.fns.tl(kl.fns.tl(V1770)))):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1770)) && asJsBool(kl.fns.$eq(new Sym("cases"), kl.fns.hd(V1770))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V1770))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(V1770)))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.tl(V1770)))))))?(kl.fns.cons(new Sym("if"), kl.fns.cons(kl.fns.hd(kl.fns.tl(V1770)), kl.fns.cons(kl.fns.hd(kl.fns.tl(kl.fns.tl(V1770))), kl.fns.cons(kl.fns.cons(new Sym("simple-error"), kl.fns.cons("error: cases exhausted", null)), null))))):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1770)) && asJsBool(kl.fns.$eq(new Sym("cases"), kl.fns.hd(V1770))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V1770))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(V1770))))))?(kl.fns.cons(new Sym("if"), kl.fns.cons(kl.fns.hd(kl.fns.tl(V1770)), kl.fns.cons(kl.fns.hd(kl.fns.tl(kl.fns.tl(V1770))), kl.fns.cons(Kl.headCall(kl.fns.shen$docases_macro, [kl.fns.cons(new Sym("cases"), kl.fns.tl(kl.fns.tl(kl.fns.tl(V1770))))]), null))))):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1770)) && asJsBool(kl.fns.$eq(new Sym("cases"), kl.fns.hd(V1770))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V1770))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(V1770))))))?(kl.fns.simple_error("error: odd number of case elements\n")):(V1770))));
                    });

kl.defun("shen.timer-macro", 1, function (V1772) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1772)) && asJsBool(kl.fns.$eq(new Sym("time"), kl.fns.hd(V1772))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V1772))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(V1772))))))?(Kl.tailCall(kl.fns.shen$dolet_macro, [kl.fns.cons(new Sym("let"), kl.fns.cons(new Sym("Start"), kl.fns.cons(kl.fns.cons(new Sym("get-time"), kl.fns.cons(new Sym("run"), null)), kl.fns.cons(new Sym("Result"), kl.fns.cons(kl.fns.hd(kl.fns.tl(V1772)), kl.fns.cons(new Sym("Finish"), kl.fns.cons(kl.fns.cons(new Sym("get-time"), kl.fns.cons(new Sym("run"), null)), kl.fns.cons(new Sym("Time"), kl.fns.cons(kl.fns.cons(new Sym("-"), kl.fns.cons(new Sym("Finish"), kl.fns.cons(new Sym("Start"), null))), kl.fns.cons(new Sym("Message"), kl.fns.cons(kl.fns.cons(new Sym("shen.prhush"), kl.fns.cons(kl.fns.cons(new Sym("cn"), kl.fns.cons("\nrun time: ", kl.fns.cons(kl.fns.cons(new Sym("cn"), kl.fns.cons(kl.fns.cons(new Sym("str"), kl.fns.cons(new Sym("Time"), null)), kl.fns.cons(" secs\n", null))), null))), kl.fns.cons(kl.fns.cons(new Sym("stoutput"), null), null))), kl.fns.cons(new Sym("Result"), null))))))))))))])):(V1772);
                    });

kl.defun("shen.tuple-up", 1, function (V1774) {
                      return asJsBool(kl.fns.cons$qu(V1774))?(kl.fns.cons(new Sym("@p"), kl.fns.cons(kl.fns.hd(V1774), kl.fns.cons(Kl.headCall(kl.fns.shen$dotuple_up, [kl.fns.tl(V1774)]), null)))):(V1774);
                    });

kl.defun("shen.put/get-macro", 1, function (V1776) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1776)) && asJsBool(kl.fns.$eq(new Sym("put"), kl.fns.hd(V1776))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V1776))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(V1776)))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(kl.fns.tl(V1776))))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.tl(kl.fns.tl(V1776))))))))?(kl.fns.cons(new Sym("put"), kl.fns.cons(kl.fns.hd(kl.fns.tl(V1776)), kl.fns.cons(kl.fns.hd(kl.fns.tl(kl.fns.tl(V1776))), kl.fns.cons(kl.fns.hd(kl.fns.tl(kl.fns.tl(kl.fns.tl(V1776)))), kl.fns.cons(kl.fns.cons(new Sym("value"), kl.fns.cons(new Sym("*property-vector*"), null)), null)))))):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1776)) && asJsBool(kl.fns.$eq(new Sym("get"), kl.fns.hd(V1776))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V1776))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(V1776)))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.tl(V1776)))))))?(kl.fns.cons(new Sym("get"), kl.fns.cons(kl.fns.hd(kl.fns.tl(V1776)), kl.fns.cons(kl.fns.hd(kl.fns.tl(kl.fns.tl(V1776))), kl.fns.cons(kl.fns.cons(new Sym("value"), kl.fns.cons(new Sym("*property-vector*"), null)), null))))):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1776)) && asJsBool(kl.fns.$eq(new Sym("unput"), kl.fns.hd(V1776))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V1776))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(V1776)))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.tl(V1776)))))))?(kl.fns.cons(new Sym("unput"), kl.fns.cons(kl.fns.hd(kl.fns.tl(V1776)), kl.fns.cons(kl.fns.hd(kl.fns.tl(kl.fns.tl(V1776))), kl.fns.cons(kl.fns.cons(new Sym("value"), kl.fns.cons(new Sym("*property-vector*"), null)), null))))):(V1776)));
                    });

kl.defun("shen.function-macro", 1, function (V1778) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1778)) && asJsBool(kl.fns.$eq(new Sym("function"), kl.fns.hd(V1778))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V1778))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(V1778))))))?(Kl.tailCall(kl.fns.shen$dofunction_abstraction, [kl.fns.hd(kl.fns.tl(V1778)), Kl.headCall(kl.fns.arity, [kl.fns.hd(kl.fns.tl(V1778))])])):(V1778);
                    });

kl.defun("shen.function-abstraction", 2, function (V1781, V1782) {
                      return asJsBool(kl.fns.$eq(0, V1782))?(kl.fns.simple_error(Kl.headCall(kl.fns.shen$doapp, [V1781, " has no lambda form\n", new Sym("shen.a")]))):(asJsBool(kl.fns.$eq(-1, V1782))?(kl.fns.cons(new Sym("function"), kl.fns.cons(V1781, null))):(Kl.tailCall(kl.fns.shen$dofunction_abstraction_help, [V1781, V1782, null])));
                    });

kl.defun("shen.function-abstraction-help", 3, function (V1786, V1787, V1788) {
                      return asJsBool(kl.fns.$eq(0, V1787))?(kl.fns.cons(V1786, V1788)):((function () {
                  const X = Kl.headCall(kl.fns.gensym, [new Sym("V")]);
                    return kl.fns.cons(new Sym("/."), kl.fns.cons(X, kl.fns.cons(Kl.headCall(kl.fns.shen$dofunction_abstraction_help, [V1786, kl.fns._(V1787, 1), Kl.headCall(kl.fns.append, [V1788, kl.fns.cons(X, null)])]), null)));
                })());
                    });

kl.defun("undefmacro", 1, function (V1790) {
                      return (function () {
                  const MacroReg = kl.fns.value(new Sym("shen.*macroreg*"));
                    const Pos = Kl.headCall(kl.fns.shen$dofindpos, [V1790, MacroReg]);
                    const Remove1 = kl.symbols.shen$do$stmacroreg$st = Kl.headCall(kl.fns.remove, [V1790, MacroReg]);
                    const Remove2 = kl.symbols.$stmacros$st = Kl.headCall(kl.fns.shen$doremove_nth, [Pos, kl.fns.value(new Sym("*macros*"))]);
                    return V1790;
                })();
                    });

kl.defun("shen.findpos", 2, function (V1800, V1801) {
                      return asJsBool(kl.fns.$eq(null, V1801))?(kl.fns.simple_error(Kl.headCall(kl.fns.shen$doapp, [V1800, " is not a macro\n", new Sym("shen.a")]))):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1801)) && asJsBool(kl.fns.$eq(kl.fns.hd(V1801), V1800))))?(1):(asJsBool(kl.fns.cons$qu(V1801))?(kl.fns.$pl(1, Kl.headCall(kl.fns.shen$dofindpos, [V1800, kl.fns.tl(V1801)]))):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.findpos")]))));
                    });

kl.defun("shen.remove-nth", 2, function (V1806, V1807) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.$eq(1, V1806)) && asJsBool(kl.fns.cons$qu(V1807))))?(kl.fns.tl(V1807)):(asJsBool(kl.fns.cons$qu(V1807))?(kl.fns.cons(kl.fns.hd(V1807), Kl.headCall(kl.fns.shen$doremove_nth, [kl.fns._(V1806, 1), kl.fns.tl(V1807)]))):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.remove-nth")])));
                    });

kl.defun("shen.initialise_arity_table", 1, function (V1647) {
                      return asJsBool(kl.fns.$eq(null, V1647))?(null):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V1647)) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V1647)))))?((function () {
                  const DecArity = Kl.headCall(kl.fns.put, [kl.fns.hd(V1647), new Sym("arity"), kl.fns.hd(kl.fns.tl(V1647)), kl.fns.value(new Sym("*property-vector*"))]);
                    return Kl.tailCall(kl.fns.shen$doinitialise$unarity$untable, [kl.fns.tl(kl.fns.tl(V1647))]);
                })()):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.initialise_arity_table")])));
                    });

kl.defun("arity", 1, function (V1649) {
                      return (function () {
                          try {
                            return Kl.headCall(kl.fns.get, [V1649, new Sym("arity"), kl.fns.value(new Sym("*property-vector*"))]);
                          } catch (E) {
                            return -1;
                          }
                        })();
                    });

kl.defun("systemf", 1, function (V1651) {
                      return (function () {
                  const Shen = kl.fns.intern("shen");
                    const External = Kl.headCall(kl.fns.get, [Shen, new Sym("shen.external-symbols"), kl.fns.value(new Sym("*property-vector*"))]);
                    const Place = Kl.headCall(kl.fns.put, [Shen, new Sym("shen.external-symbols"), Kl.headCall(kl.fns.adjoin, [V1651, External]), kl.fns.value(new Sym("*property-vector*"))]);
                    return V1651;
                })();
                    });

kl.defun("adjoin", 2, function (V1654, V1655) {
                      return asJsBool(Kl.headCall(kl.fns.element$qu, [V1654, V1655]))?(V1655):(kl.fns.cons(V1654, V1655));
                    });

kl.defun("shen.lambda-form-entry", 1, function (V1657) {
                      return asJsBool(kl.fns.$eq(new Sym("package"), V1657))?(null):(asJsBool(kl.fns.$eq(new Sym("receive"), V1657))?(null):((function () {
                  const ArityF = Kl.headCall(kl.fns.arity, [V1657]);
                    return asJsBool(kl.fns.$eq(ArityF, -1))?(null):(asJsBool(kl.fns.$eq(ArityF, 0))?(null):(kl.fns.cons(kl.fns.cons(V1657, kl.fns.eval_kl(Kl.headCall(kl.fns.shen$dolambda_form, [V1657, ArityF]))), null)));
                })()));
                    });

kl.defun("shen.lambda-form", 2, function (V1660, V1661) {
                      return asJsBool(kl.fns.$eq(0, V1661))?(V1660):((function () {
                  const X = Kl.headCall(kl.fns.gensym, [new Sym("V")]);
                    return kl.fns.cons(new Sym("lambda"), kl.fns.cons(X, kl.fns.cons(Kl.headCall(kl.fns.shen$dolambda_form, [Kl.headCall(kl.fns.shen$doadd_end, [V1660, X]), kl.fns._(V1661, 1)]), null)));
                })());
                    });

kl.defun("shen.add-end", 2, function (V1664, V1665) {
                      return asJsBool(kl.fns.cons$qu(V1664))?(Kl.tailCall(kl.fns.append, [V1664, kl.fns.cons(V1665, null)])):(kl.fns.cons(V1664, kl.fns.cons(V1665, null)));
                    });

kl.defun("shen.set-lambda-form-entry", 1, function (V1667) {
                      return asJsBool(kl.fns.cons$qu(V1667))?(Kl.tailCall(kl.fns.put, [kl.fns.hd(V1667), new Sym("shen.lambda-form"), kl.fns.tl(V1667), kl.fns.value(new Sym("*property-vector*"))])):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.set-lambda-form-entry")]));
                    });

kl.defun("specialise", 1, function (V1669) {
                      return (function () {
                      kl.symbols.shen$do$stspecial$st = kl.fns.cons(V1669, kl.fns.value(new Sym("shen.*special*")));
                      return V1669;
                    })();
                    });

kl.defun("unspecialise", 1, function (V1671) {
                      return (function () {
                      kl.symbols.shen$do$stspecial$st = Kl.headCall(kl.fns.remove, [V1671, kl.fns.value(new Sym("shen.*special*"))]);
                      return V1671;
                    })();
                    });

kl.defun("declare", 2, function (V4123, V4124) {
                      return (function () {
                  const Record = kl.symbols.shen$do$stsignedfuncs$st = kl.fns.cons(kl.fns.cons(V4123, V4124), kl.fns.value(new Sym("shen.*signedfuncs*")));
                    const Variancy = (function () {
                          try {
                            return Kl.headCall(kl.fns.shen$dovariancy_test, [V4123, V4124]);
                          } catch (E) {
                            return new Sym("shen.skip");
                          }
                        })();
                    const Type = Kl.headCall(kl.fns.shen$dorcons$unform, [Kl.headCall(kl.fns.shen$dodemodulate, [V4124])]);
                    const F$st = Kl.headCall(kl.fns.concat, [new Sym("shen.type-signature-of-"), V4123]);
                    const Parameters = Kl.headCall(kl.fns.shen$doparameters, [1]);
                    const Clause = kl.fns.cons(kl.fns.cons(F$st, kl.fns.cons(new Sym("X"), null)), kl.fns.cons(new Sym(":-"), kl.fns.cons(kl.fns.cons(kl.fns.cons(new Sym("unify!"), kl.fns.cons(new Sym("X"), kl.fns.cons(Type, null))), null), null)));
                    const AUM$uninstruction = Kl.headCall(kl.fns.shen$doaum, [Clause, Parameters]);
                    const Code = Kl.headCall(kl.fns.shen$doaum$unto$unshen, [AUM$uninstruction]);
                    const ShenDef = kl.fns.cons(new Sym("define"), kl.fns.cons(F$st, Kl.headCall(kl.fns.append, [Parameters, Kl.headCall(kl.fns.append, [kl.fns.cons(new Sym("ProcessN"), kl.fns.cons(new Sym("Continuation"), null)), kl.fns.cons(new Sym("->"), kl.fns.cons(Code, null))])])));
                    const Eval = Kl.headCall(kl.fns.shen$doeval_without_macros, [ShenDef]);
                    return V4123;
                })();
                    });

kl.defun("shen.demodulate", 1, function (V4126) {
                      return (function () {
                  const Demod = Kl.headCall(kl.fns.shen$dowalk, [kl.fns.value(new Sym("shen.*demodulation-function*")), V4126]);
                    return asJsBool(kl.fns.$eq(Demod, V4126))?(V4126):(Kl.tailCall(kl.fns.shen$dodemodulate, [Demod]));
                })();
                    });

kl.defun("shen.variancy-test", 2, function (V4129, V4130) {
                      return (function () {
                  const TypeF = Kl.headCall(kl.fns.shen$dotypecheck, [V4129, new Sym("B")]);
                    const Check = asJsBool(kl.fns.$eq(new Sym("symbol"), TypeF))?(new Sym("shen.skip")):(asJsBool(Kl.headCall(kl.fns.shen$dovariant$qu, [TypeF, V4130]))?(new Sym("shen.skip")):(Kl.headCall(kl.fns.shen$doprhush, [kl.fns.cn("warning: changing the type of ", Kl.headCall(kl.fns.shen$doapp, [V4129, " may create errors\n", new Sym("shen.a")])), Kl.headCall(kl.fns.stoutput, [])])));
                    return new Sym("shen.skip");
                })();
                    });

kl.defun("shen.variant?", 2, function (V4143, V4144) {
                      return asJsBool(kl.fns.$eq(V4144, V4143))?(klTrue):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V4143)) && asJsBool(kl.fns.cons$qu(V4144)) && asJsBool(kl.fns.$eq(kl.fns.hd(V4144), kl.fns.hd(V4143)))))?(Kl.tailCall(kl.fns.shen$dovariant$qu, [kl.fns.tl(V4143), kl.fns.tl(V4144)])):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V4143)) && asJsBool(kl.fns.cons$qu(V4144)) && asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [kl.fns.hd(V4143)])) && asJsBool(Kl.headCall(kl.fns.variable$qu, [kl.fns.hd(V4144)]))))?(Kl.tailCall(kl.fns.shen$dovariant$qu, [Kl.headCall(kl.fns.subst, [new Sym("shen.a"), kl.fns.hd(V4143), kl.fns.tl(V4143)]), Kl.headCall(kl.fns.subst, [new Sym("shen.a"), kl.fns.hd(V4144), kl.fns.tl(V4144)])])):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V4143)) && asJsBool(kl.fns.cons$qu(kl.fns.hd(V4143))) && asJsBool(kl.fns.cons$qu(V4144)) && asJsBool(kl.fns.cons$qu(kl.fns.hd(V4144)))))?(Kl.tailCall(kl.fns.shen$dovariant$qu, [Kl.headCall(kl.fns.append, [kl.fns.hd(V4143), kl.fns.tl(V4143)]), Kl.headCall(kl.fns.append, [kl.fns.hd(V4144), kl.fns.tl(V4144)])])):(klFalse))));
                    });

kl.defun("shen.typecheck", 2, function (V3644, V3645) {
                      return (function () {
                  const Curry = Kl.headCall(kl.fns.shen$docurry, [V3644]);
                    const ProcessN = Kl.headCall(kl.fns.shen$dostart_new_prolog_process, []);
                    const Type = Kl.headCall(kl.fns.shen$doinsert_prolog_variables, [Kl.headCall(kl.fns.shen$dodemodulate, [Kl.headCall(kl.fns.shen$docurry_type, [V3645])]), ProcessN]);
                    const Continuation = Kl.setArity("shen.typecheck_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.return, [Type, ProcessN, new Sym("shen.void")]);
                    });
                    return Kl.tailCall(kl.fns.shen$dot$st, [kl.fns.cons(Curry, kl.fns.cons(new Sym(":"), kl.fns.cons(Type, null))), null, ProcessN, Continuation]);
                })();
                    });

kl.defun("shen.curry", 1, function (V3647) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V3647)) && asJsBool(Kl.headCall(kl.fns.shen$dospecial$qu, [kl.fns.hd(V3647)]))))?(kl.fns.cons(kl.fns.hd(V3647), Kl.headCall(kl.fns.map, [Kl.setArity("shen.curry_lambda", 1, function (Y) {
                      return Kl.tailCall(kl.fns.shen$docurry, [Y]);
                    }), kl.fns.tl(V3647)]))):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V3647)) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V3647))) && asJsBool(Kl.headCall(kl.fns.shen$doextraspecial$qu, [kl.fns.hd(V3647)]))))?(V3647):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V3647)) && asJsBool(kl.fns.$eq(new Sym("type"), kl.fns.hd(V3647))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V3647))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(V3647)))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.tl(V3647)))))))?(kl.fns.cons(new Sym("type"), kl.fns.cons(Kl.headCall(kl.fns.shen$docurry, [kl.fns.hd(kl.fns.tl(V3647))]), kl.fns.tl(kl.fns.tl(V3647))))):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V3647)) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V3647))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(V3647))))))?(Kl.tailCall(kl.fns.shen$docurry, [kl.fns.cons(kl.fns.cons(kl.fns.hd(V3647), kl.fns.cons(kl.fns.hd(kl.fns.tl(V3647)), null)), kl.fns.tl(kl.fns.tl(V3647)))])):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V3647)) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V3647))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(V3647))))))?(kl.fns.cons(Kl.headCall(kl.fns.shen$docurry, [kl.fns.hd(V3647)]), kl.fns.cons(Kl.headCall(kl.fns.shen$docurry, [kl.fns.hd(kl.fns.tl(V3647))]), null))):(V3647)))));
                    });

kl.defun("shen.special?", 1, function (V3649) {
                      return Kl.tailCall(kl.fns.element$qu, [V3649, kl.fns.value(new Sym("shen.*special*"))]);
                    });

kl.defun("shen.extraspecial?", 1, function (V3651) {
                      return Kl.tailCall(kl.fns.element$qu, [V3651, kl.fns.value(new Sym("shen.*extraspecial*"))]);
                    });

kl.defun("shen.t*", 4, function (V3656, V3657, V3658, V3659) {
                      return (function () {
                  const Throwcontrol = Kl.headCall(kl.fns.shen$docatchpoint, []);
                    return Kl.tailCall(kl.fns.shen$docutpoint, [Throwcontrol, (function () {
                  const Case = (function () {
                  const Error = Kl.headCall(kl.fns.shen$donewpv, [V3658]);
                    return (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.fwhen, [Kl.headCall(kl.fns.shen$domaxinfexceeded$qu, []), V3658, Kl.setArity("shen.t*_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.bind, [Error, Kl.headCall(kl.fns.shen$doerrormaxinfs, []), V3658, V3659]);
                    })]);
                    })();
                })();
                    return asJsBool(kl.fns.$eq(Case, klFalse))?((function () {
                  const Case_1 = (function () {
                  const V3636 = Kl.headCall(kl.fns.shen$dolazyderef, [V3656, V3658]);
                    return asJsBool(kl.fns.$eq(new Sym("fail"), V3636))?((function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.cut, [Throwcontrol, V3658, Kl.setArity("shen.t*_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.shen$doprolog_failure, [V3658, V3659]);
                    })]);
                    })()):(klFalse);
                })();
                    return asJsBool(kl.fns.$eq(Case_1, klFalse))?((function () {
                  const Case_2 = (function () {
                  const V3637 = Kl.headCall(kl.fns.shen$dolazyderef, [V3656, V3658]);
                    return asJsBool(kl.fns.cons$qu(V3637))?((function () {
                  const X = kl.fns.hd(V3637);
                    const V3638 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3637), V3658]);
                    return asJsBool(kl.fns.cons$qu(V3638))?((function () {
                  const V3639 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.hd(V3638), V3658]);
                    return asJsBool(kl.fns.$eq(new Sym(":"), V3639))?((function () {
                  const V3640 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3638), V3658]);
                    return asJsBool(kl.fns.cons$qu(V3640))?((function () {
                  const A = kl.fns.hd(V3640);
                    const V3641 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3640), V3658]);
                    return asJsBool(kl.fns.$eq(null, V3641))?((function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.fwhen, [Kl.headCall(kl.fns.shen$dotype_theory_enabled$qu, []), V3658, Kl.setArity("shen.t*_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.cut, [Throwcontrol, V3658, Kl.setArity("shen.t*_freeze_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.shen$doth$st, [X, A, V3657, V3658, V3659]);
                    })]);
                    })]);
                    })()):(klFalse);
                })()):(klFalse);
                })()):(klFalse);
                })()):(klFalse);
                })()):(klFalse);
                })();
                    return asJsBool(kl.fns.$eq(Case_2, klFalse))?((function () {
                  const Datatypes = Kl.headCall(kl.fns.shen$donewpv, [V3658]);
                    return (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.shen$doshow, [V3656, V3657, V3658, Kl.setArity("shen.t*_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.bind, [Datatypes, kl.fns.value(new Sym("shen.*datatypes*")), V3658, Kl.setArity("shen.t*_freeze_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.shen$doudefs$st, [V3656, V3657, Datatypes, V3658, V3659]);
                    })]);
                    })]);
                    })();
                })()):(Case_2);
                })()):(Case_1);
                })()):(Case);
                })()]);
                })();
                    });

kl.defun("shen.type-theory-enabled?", 0, function () {
                      return kl.fns.value(new Sym("shen.*shen-type-theory-enabled?*"));
                    });

kl.defun("enable-type-theory", 1, function (V3665) {
                      return asJsBool(kl.fns.$eq(new Sym("+"), V3665))?(kl.symbols.shen$do$stshen_type_theory_enabled$qu$st = klTrue):(asJsBool(kl.fns.$eq(new Sym("-"), V3665))?(kl.symbols.shen$do$stshen_type_theory_enabled$qu$st = klFalse):(kl.fns.simple_error("enable-type-theory expects a + or a -\n")));
                    });

kl.defun("shen.prolog-failure", 2, function (V3676, V3677) {
                      return klFalse;
                    });

kl.defun("shen.maxinfexceeded?", 0, function () {
                      return kl.fns.$gt(Kl.headCall(kl.fns.inferences, []), kl.fns.value(new Sym("shen.*maxinferences*")));
                    });

kl.defun("shen.errormaxinfs", 0, function () {
                      return kl.fns.simple_error("maximum inferences exceeded~%");
                    });

kl.defun("shen.udefs*", 5, function (V3683, V3684, V3685, V3686, V3687) {
                      return (function () {
                  const Case = (function () {
                  const V3632 = Kl.headCall(kl.fns.shen$dolazyderef, [V3685, V3686]);
                    return asJsBool(kl.fns.cons$qu(V3632))?((function () {
                  const D = kl.fns.hd(V3632);
                    return (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.call, [kl.fns.cons(D, kl.fns.cons(V3683, kl.fns.cons(V3684, null))), V3686, V3687]);
                    })();
                })()):(klFalse);
                })();
                    return asJsBool(kl.fns.$eq(Case, klFalse))?((function () {
                  const V3633 = Kl.headCall(kl.fns.shen$dolazyderef, [V3685, V3686]);
                    return asJsBool(kl.fns.cons$qu(V3633))?((function () {
                  const Ds = kl.fns.tl(V3633);
                    return (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.tailCall(kl.fns.shen$doudefs$st, [V3683, V3684, Ds, V3686, V3687]);
                    })();
                })()):(klFalse);
                })()):(Case);
                })();
                    });

kl.defun("shen.th*", 5, function (V3693, V3694, V3695, V3696, V3697) {
                      return (function () {
                  const Throwcontrol = Kl.headCall(kl.fns.shen$docatchpoint, []);
                    return Kl.tailCall(kl.fns.shen$docutpoint, [Throwcontrol, (function () {
                  const Case = (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.shen$doshow, [kl.fns.cons(V3693, kl.fns.cons(new Sym(":"), kl.fns.cons(V3694, null))), V3695, V3696, Kl.setArity("shen.th*_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.fwhen, [klFalse, V3696, V3697]);
                    })]);
                    })();
                    return asJsBool(kl.fns.$eq(Case, klFalse))?((function () {
                  const Case_1 = (function () {
                  const F = Kl.headCall(kl.fns.shen$donewpv, [V3696]);
                    return (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.fwhen, [Kl.headCall(kl.fns.shen$dotypedf$qu, [Kl.headCall(kl.fns.shen$dolazyderef, [V3693, V3696])]), V3696, Kl.setArity("shen.th*_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.bind, [F, Kl.headCall(kl.fns.shen$dosigf, [Kl.headCall(kl.fns.shen$dolazyderef, [V3693, V3696])]), V3696, Kl.setArity("shen.th*_freeze_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.call, [kl.fns.cons(F, kl.fns.cons(V3694, null)), V3696, V3697]);
                    })]);
                    })]);
                    })();
                })();
                    return asJsBool(kl.fns.$eq(Case_1, klFalse))?((function () {
                  const Case_2 = (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.shen$dobase, [V3693, V3694, V3696, V3697]);
                    })();
                    return asJsBool(kl.fns.$eq(Case_2, klFalse))?((function () {
                  const Case_3 = (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.shen$doby$unhypothesis, [V3693, V3694, V3695, V3696, V3697]);
                    })();
                    return asJsBool(kl.fns.$eq(Case_3, klFalse))?((function () {
                  const Case_4 = (function () {
                  const V3528 = Kl.headCall(kl.fns.shen$dolazyderef, [V3693, V3696]);
                    return asJsBool(kl.fns.cons$qu(V3528))?((function () {
                  const F = kl.fns.hd(V3528);
                    const V3529 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3528), V3696]);
                    return asJsBool(kl.fns.$eq(null, V3529))?((function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.shen$doth$st, [F, kl.fns.cons(new Sym("-->"), kl.fns.cons(V3694, null)), V3695, V3696, V3697]);
                    })()):(klFalse);
                })()):(klFalse);
                })();
                    return asJsBool(kl.fns.$eq(Case_4, klFalse))?((function () {
                  const Case_5 = (function () {
                  const V3530 = Kl.headCall(kl.fns.shen$dolazyderef, [V3693, V3696]);
                    return asJsBool(kl.fns.cons$qu(V3530))?((function () {
                  const F = kl.fns.hd(V3530);
                    const V3531 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3530), V3696]);
                    return asJsBool(kl.fns.cons$qu(V3531))?((function () {
                  const X = kl.fns.hd(V3531);
                    const V3532 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3531), V3696]);
                    return asJsBool(kl.fns.$eq(null, V3532))?((function () {
                  const B = Kl.headCall(kl.fns.shen$donewpv, [V3696]);
                    return (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.shen$doth$st, [F, kl.fns.cons(B, kl.fns.cons(new Sym("-->"), kl.fns.cons(V3694, null))), V3695, V3696, Kl.setArity("shen.th*_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.shen$doth$st, [X, B, V3695, V3696, V3697]);
                    })]);
                    })();
                })()):(klFalse);
                })()):(klFalse);
                })()):(klFalse);
                })();
                    return asJsBool(kl.fns.$eq(Case_5, klFalse))?((function () {
                  const Case_6 = (function () {
                  const V3533 = Kl.headCall(kl.fns.shen$dolazyderef, [V3693, V3696]);
                    return asJsBool(kl.fns.cons$qu(V3533))?((function () {
                  const V3534 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.hd(V3533), V3696]);
                    return asJsBool(kl.fns.$eq(new Sym("cons"), V3534))?((function () {
                  const V3535 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3533), V3696]);
                    return asJsBool(kl.fns.cons$qu(V3535))?((function () {
                  const X = kl.fns.hd(V3535);
                    const V3536 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3535), V3696]);
                    return asJsBool(kl.fns.cons$qu(V3536))?((function () {
                  const Y = kl.fns.hd(V3536);
                    const V3537 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3536), V3696]);
                    return asJsBool(kl.fns.$eq(null, V3537))?((function () {
                  const V3538 = Kl.headCall(kl.fns.shen$dolazyderef, [V3694, V3696]);
                    return asJsBool(kl.fns.cons$qu(V3538))?((function () {
                  const V3539 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.hd(V3538), V3696]);
                    return asJsBool(kl.fns.$eq(new Sym("list"), V3539))?((function () {
                  const V3540 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3538), V3696]);
                    return asJsBool(kl.fns.cons$qu(V3540))?((function () {
                  const A = kl.fns.hd(V3540);
                    const V3541 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3540), V3696]);
                    return asJsBool(kl.fns.$eq(null, V3541))?((function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.shen$doth$st, [X, A, V3695, V3696, Kl.setArity("shen.th*_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.shen$doth$st, [Y, kl.fns.cons(new Sym("list"), kl.fns.cons(A, null)), V3695, V3696, V3697]);
                    })]);
                    })()):(asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V3541]))?((function () {
                      Kl.headCall(kl.fns.shen$dobindv, [V3541, null, V3696]);
                      return (function () {
                  const Result = (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.shen$doth$st, [X, A, V3695, V3696, Kl.setArity("shen.th*_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.shen$doth$st, [Y, kl.fns.cons(new Sym("list"), kl.fns.cons(A, null)), V3695, V3696, V3697]);
                    })]);
                    })();
                    return (function () {
                      Kl.headCall(kl.fns.shen$dounbindv, [V3541, V3696]);
                      return Result;
                    })();
                })();
                    })()):(klFalse));
                })()):(asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V3540]))?((function () {
                  const A = Kl.headCall(kl.fns.shen$donewpv, [V3696]);
                    return (function () {
                      Kl.headCall(kl.fns.shen$dobindv, [V3540, kl.fns.cons(A, null), V3696]);
                      return (function () {
                  const Result = (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.shen$doth$st, [X, A, V3695, V3696, Kl.setArity("shen.th*_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.shen$doth$st, [Y, kl.fns.cons(new Sym("list"), kl.fns.cons(A, null)), V3695, V3696, V3697]);
                    })]);
                    })();
                    return (function () {
                      Kl.headCall(kl.fns.shen$dounbindv, [V3540, V3696]);
                      return Result;
                    })();
                })();
                    })();
                })()):(klFalse));
                })()):(asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V3539]))?((function () {
                      Kl.headCall(kl.fns.shen$dobindv, [V3539, new Sym("list"), V3696]);
                      return (function () {
                  const Result = (function () {
                  const V3542 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3538), V3696]);
                    return asJsBool(kl.fns.cons$qu(V3542))?((function () {
                  const A = kl.fns.hd(V3542);
                    const V3543 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3542), V3696]);
                    return asJsBool(kl.fns.$eq(null, V3543))?((function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.shen$doth$st, [X, A, V3695, V3696, Kl.setArity("shen.th*_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.shen$doth$st, [Y, kl.fns.cons(new Sym("list"), kl.fns.cons(A, null)), V3695, V3696, V3697]);
                    })]);
                    })()):(asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V3543]))?((function () {
                      Kl.headCall(kl.fns.shen$dobindv, [V3543, null, V3696]);
                      return (function () {
                  const Result = (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.shen$doth$st, [X, A, V3695, V3696, Kl.setArity("shen.th*_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.shen$doth$st, [Y, kl.fns.cons(new Sym("list"), kl.fns.cons(A, null)), V3695, V3696, V3697]);
                    })]);
                    })();
                    return (function () {
                      Kl.headCall(kl.fns.shen$dounbindv, [V3543, V3696]);
                      return Result;
                    })();
                })();
                    })()):(klFalse));
                })()):(asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V3542]))?((function () {
                  const A = Kl.headCall(kl.fns.shen$donewpv, [V3696]);
                    return (function () {
                      Kl.headCall(kl.fns.shen$dobindv, [V3542, kl.fns.cons(A, null), V3696]);
                      return (function () {
                  const Result = (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.shen$doth$st, [X, A, V3695, V3696, Kl.setArity("shen.th*_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.shen$doth$st, [Y, kl.fns.cons(new Sym("list"), kl.fns.cons(A, null)), V3695, V3696, V3697]);
                    })]);
                    })();
                    return (function () {
                      Kl.headCall(kl.fns.shen$dounbindv, [V3542, V3696]);
                      return Result;
                    })();
                })();
                    })();
                })()):(klFalse));
                })();
                    return (function () {
                      Kl.headCall(kl.fns.shen$dounbindv, [V3539, V3696]);
                      return Result;
                    })();
                })();
                    })()):(klFalse));
                })()):(asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V3538]))?((function () {
                  const A = Kl.headCall(kl.fns.shen$donewpv, [V3696]);
                    return (function () {
                      Kl.headCall(kl.fns.shen$dobindv, [V3538, kl.fns.cons(new Sym("list"), kl.fns.cons(A, null)), V3696]);
                      return (function () {
                  const Result = (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.shen$doth$st, [X, A, V3695, V3696, Kl.setArity("shen.th*_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.shen$doth$st, [Y, kl.fns.cons(new Sym("list"), kl.fns.cons(A, null)), V3695, V3696, V3697]);
                    })]);
                    })();
                    return (function () {
                      Kl.headCall(kl.fns.shen$dounbindv, [V3538, V3696]);
                      return Result;
                    })();
                })();
                    })();
                })()):(klFalse));
                })()):(klFalse);
                })()):(klFalse);
                })()):(klFalse);
                })()):(klFalse);
                })()):(klFalse);
                })();
                    return asJsBool(kl.fns.$eq(Case_6, klFalse))?((function () {
                  const Case_7 = (function () {
                  const V3544 = Kl.headCall(kl.fns.shen$dolazyderef, [V3693, V3696]);
                    return asJsBool(kl.fns.cons$qu(V3544))?((function () {
                  const V3545 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.hd(V3544), V3696]);
                    return asJsBool(kl.fns.$eq(new Sym("@p"), V3545))?((function () {
                  const V3546 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3544), V3696]);
                    return asJsBool(kl.fns.cons$qu(V3546))?((function () {
                  const X = kl.fns.hd(V3546);
                    const V3547 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3546), V3696]);
                    return asJsBool(kl.fns.cons$qu(V3547))?((function () {
                  const Y = kl.fns.hd(V3547);
                    const V3548 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3547), V3696]);
                    return asJsBool(kl.fns.$eq(null, V3548))?((function () {
                  const V3549 = Kl.headCall(kl.fns.shen$dolazyderef, [V3694, V3696]);
                    return asJsBool(kl.fns.cons$qu(V3549))?((function () {
                  const A = kl.fns.hd(V3549);
                    const V3550 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3549), V3696]);
                    return asJsBool(kl.fns.cons$qu(V3550))?((function () {
                  const V3551 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.hd(V3550), V3696]);
                    return asJsBool(kl.fns.$eq(new Sym("*"), V3551))?((function () {
                  const V3552 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3550), V3696]);
                    return asJsBool(kl.fns.cons$qu(V3552))?((function () {
                  const B = kl.fns.hd(V3552);
                    const V3553 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3552), V3696]);
                    return asJsBool(kl.fns.$eq(null, V3553))?((function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.shen$doth$st, [X, A, V3695, V3696, Kl.setArity("shen.th*_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.shen$doth$st, [Y, B, V3695, V3696, V3697]);
                    })]);
                    })()):(asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V3553]))?((function () {
                      Kl.headCall(kl.fns.shen$dobindv, [V3553, null, V3696]);
                      return (function () {
                  const Result = (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.shen$doth$st, [X, A, V3695, V3696, Kl.setArity("shen.th*_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.shen$doth$st, [Y, B, V3695, V3696, V3697]);
                    })]);
                    })();
                    return (function () {
                      Kl.headCall(kl.fns.shen$dounbindv, [V3553, V3696]);
                      return Result;
                    })();
                })();
                    })()):(klFalse));
                })()):(asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V3552]))?((function () {
                  const B = Kl.headCall(kl.fns.shen$donewpv, [V3696]);
                    return (function () {
                      Kl.headCall(kl.fns.shen$dobindv, [V3552, kl.fns.cons(B, null), V3696]);
                      return (function () {
                  const Result = (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.shen$doth$st, [X, A, V3695, V3696, Kl.setArity("shen.th*_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.shen$doth$st, [Y, B, V3695, V3696, V3697]);
                    })]);
                    })();
                    return (function () {
                      Kl.headCall(kl.fns.shen$dounbindv, [V3552, V3696]);
                      return Result;
                    })();
                })();
                    })();
                })()):(klFalse));
                })()):(asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V3551]))?((function () {
                      Kl.headCall(kl.fns.shen$dobindv, [V3551, new Sym("*"), V3696]);
                      return (function () {
                  const Result = (function () {
                  const V3554 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3550), V3696]);
                    return asJsBool(kl.fns.cons$qu(V3554))?((function () {
                  const B = kl.fns.hd(V3554);
                    const V3555 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3554), V3696]);
                    return asJsBool(kl.fns.$eq(null, V3555))?((function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.shen$doth$st, [X, A, V3695, V3696, Kl.setArity("shen.th*_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.shen$doth$st, [Y, B, V3695, V3696, V3697]);
                    })]);
                    })()):(asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V3555]))?((function () {
                      Kl.headCall(kl.fns.shen$dobindv, [V3555, null, V3696]);
                      return (function () {
                  const Result = (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.shen$doth$st, [X, A, V3695, V3696, Kl.setArity("shen.th*_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.shen$doth$st, [Y, B, V3695, V3696, V3697]);
                    })]);
                    })();
                    return (function () {
                      Kl.headCall(kl.fns.shen$dounbindv, [V3555, V3696]);
                      return Result;
                    })();
                })();
                    })()):(klFalse));
                })()):(asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V3554]))?((function () {
                  const B = Kl.headCall(kl.fns.shen$donewpv, [V3696]);
                    return (function () {
                      Kl.headCall(kl.fns.shen$dobindv, [V3554, kl.fns.cons(B, null), V3696]);
                      return (function () {
                  const Result = (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.shen$doth$st, [X, A, V3695, V3696, Kl.setArity("shen.th*_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.shen$doth$st, [Y, B, V3695, V3696, V3697]);
                    })]);
                    })();
                    return (function () {
                      Kl.headCall(kl.fns.shen$dounbindv, [V3554, V3696]);
                      return Result;
                    })();
                })();
                    })();
                })()):(klFalse));
                })();
                    return (function () {
                      Kl.headCall(kl.fns.shen$dounbindv, [V3551, V3696]);
                      return Result;
                    })();
                })();
                    })()):(klFalse));
                })()):(asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V3550]))?((function () {
                  const B = Kl.headCall(kl.fns.shen$donewpv, [V3696]);
                    return (function () {
                      Kl.headCall(kl.fns.shen$dobindv, [V3550, kl.fns.cons(new Sym("*"), kl.fns.cons(B, null)), V3696]);
                      return (function () {
                  const Result = (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.shen$doth$st, [X, A, V3695, V3696, Kl.setArity("shen.th*_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.shen$doth$st, [Y, B, V3695, V3696, V3697]);
                    })]);
                    })();
                    return (function () {
                      Kl.headCall(kl.fns.shen$dounbindv, [V3550, V3696]);
                      return Result;
                    })();
                })();
                    })();
                })()):(klFalse));
                })()):(asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V3549]))?((function () {
                  const A = Kl.headCall(kl.fns.shen$donewpv, [V3696]);
                    const B = Kl.headCall(kl.fns.shen$donewpv, [V3696]);
                    return (function () {
                      Kl.headCall(kl.fns.shen$dobindv, [V3549, kl.fns.cons(A, kl.fns.cons(new Sym("*"), kl.fns.cons(B, null))), V3696]);
                      return (function () {
                  const Result = (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.shen$doth$st, [X, A, V3695, V3696, Kl.setArity("shen.th*_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.shen$doth$st, [Y, B, V3695, V3696, V3697]);
                    })]);
                    })();
                    return (function () {
                      Kl.headCall(kl.fns.shen$dounbindv, [V3549, V3696]);
                      return Result;
                    })();
                })();
                    })();
                })()):(klFalse));
                })()):(klFalse);
                })()):(klFalse);
                })()):(klFalse);
                })()):(klFalse);
                })()):(klFalse);
                })();
                    return asJsBool(kl.fns.$eq(Case_7, klFalse))?((function () {
                  const Case_8 = (function () {
                  const V3556 = Kl.headCall(kl.fns.shen$dolazyderef, [V3693, V3696]);
                    return asJsBool(kl.fns.cons$qu(V3556))?((function () {
                  const V3557 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.hd(V3556), V3696]);
                    return asJsBool(kl.fns.$eq(new Sym("@v"), V3557))?((function () {
                  const V3558 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3556), V3696]);
                    return asJsBool(kl.fns.cons$qu(V3558))?((function () {
                  const X = kl.fns.hd(V3558);
                    const V3559 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3558), V3696]);
                    return asJsBool(kl.fns.cons$qu(V3559))?((function () {
                  const Y = kl.fns.hd(V3559);
                    const V3560 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3559), V3696]);
                    return asJsBool(kl.fns.$eq(null, V3560))?((function () {
                  const V3561 = Kl.headCall(kl.fns.shen$dolazyderef, [V3694, V3696]);
                    return asJsBool(kl.fns.cons$qu(V3561))?((function () {
                  const V3562 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.hd(V3561), V3696]);
                    return asJsBool(kl.fns.$eq(new Sym("vector"), V3562))?((function () {
                  const V3563 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3561), V3696]);
                    return asJsBool(kl.fns.cons$qu(V3563))?((function () {
                  const A = kl.fns.hd(V3563);
                    const V3564 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3563), V3696]);
                    return asJsBool(kl.fns.$eq(null, V3564))?((function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.shen$doth$st, [X, A, V3695, V3696, Kl.setArity("shen.th*_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.shen$doth$st, [Y, kl.fns.cons(new Sym("vector"), kl.fns.cons(A, null)), V3695, V3696, V3697]);
                    })]);
                    })()):(asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V3564]))?((function () {
                      Kl.headCall(kl.fns.shen$dobindv, [V3564, null, V3696]);
                      return (function () {
                  const Result = (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.shen$doth$st, [X, A, V3695, V3696, Kl.setArity("shen.th*_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.shen$doth$st, [Y, kl.fns.cons(new Sym("vector"), kl.fns.cons(A, null)), V3695, V3696, V3697]);
                    })]);
                    })();
                    return (function () {
                      Kl.headCall(kl.fns.shen$dounbindv, [V3564, V3696]);
                      return Result;
                    })();
                })();
                    })()):(klFalse));
                })()):(asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V3563]))?((function () {
                  const A = Kl.headCall(kl.fns.shen$donewpv, [V3696]);
                    return (function () {
                      Kl.headCall(kl.fns.shen$dobindv, [V3563, kl.fns.cons(A, null), V3696]);
                      return (function () {
                  const Result = (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.shen$doth$st, [X, A, V3695, V3696, Kl.setArity("shen.th*_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.shen$doth$st, [Y, kl.fns.cons(new Sym("vector"), kl.fns.cons(A, null)), V3695, V3696, V3697]);
                    })]);
                    })();
                    return (function () {
                      Kl.headCall(kl.fns.shen$dounbindv, [V3563, V3696]);
                      return Result;
                    })();
                })();
                    })();
                })()):(klFalse));
                })()):(asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V3562]))?((function () {
                      Kl.headCall(kl.fns.shen$dobindv, [V3562, new Sym("vector"), V3696]);
                      return (function () {
                  const Result = (function () {
                  const V3565 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3561), V3696]);
                    return asJsBool(kl.fns.cons$qu(V3565))?((function () {
                  const A = kl.fns.hd(V3565);
                    const V3566 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3565), V3696]);
                    return asJsBool(kl.fns.$eq(null, V3566))?((function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.shen$doth$st, [X, A, V3695, V3696, Kl.setArity("shen.th*_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.shen$doth$st, [Y, kl.fns.cons(new Sym("vector"), kl.fns.cons(A, null)), V3695, V3696, V3697]);
                    })]);
                    })()):(asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V3566]))?((function () {
                      Kl.headCall(kl.fns.shen$dobindv, [V3566, null, V3696]);
                      return (function () {
                  const Result = (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.shen$doth$st, [X, A, V3695, V3696, Kl.setArity("shen.th*_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.shen$doth$st, [Y, kl.fns.cons(new Sym("vector"), kl.fns.cons(A, null)), V3695, V3696, V3697]);
                    })]);
                    })();
                    return (function () {
                      Kl.headCall(kl.fns.shen$dounbindv, [V3566, V3696]);
                      return Result;
                    })();
                })();
                    })()):(klFalse));
                })()):(asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V3565]))?((function () {
                  const A = Kl.headCall(kl.fns.shen$donewpv, [V3696]);
                    return (function () {
                      Kl.headCall(kl.fns.shen$dobindv, [V3565, kl.fns.cons(A, null), V3696]);
                      return (function () {
                  const Result = (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.shen$doth$st, [X, A, V3695, V3696, Kl.setArity("shen.th*_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.shen$doth$st, [Y, kl.fns.cons(new Sym("vector"), kl.fns.cons(A, null)), V3695, V3696, V3697]);
                    })]);
                    })();
                    return (function () {
                      Kl.headCall(kl.fns.shen$dounbindv, [V3565, V3696]);
                      return Result;
                    })();
                })();
                    })();
                })()):(klFalse));
                })();
                    return (function () {
                      Kl.headCall(kl.fns.shen$dounbindv, [V3562, V3696]);
                      return Result;
                    })();
                })();
                    })()):(klFalse));
                })()):(asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V3561]))?((function () {
                  const A = Kl.headCall(kl.fns.shen$donewpv, [V3696]);
                    return (function () {
                      Kl.headCall(kl.fns.shen$dobindv, [V3561, kl.fns.cons(new Sym("vector"), kl.fns.cons(A, null)), V3696]);
                      return (function () {
                  const Result = (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.shen$doth$st, [X, A, V3695, V3696, Kl.setArity("shen.th*_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.shen$doth$st, [Y, kl.fns.cons(new Sym("vector"), kl.fns.cons(A, null)), V3695, V3696, V3697]);
                    })]);
                    })();
                    return (function () {
                      Kl.headCall(kl.fns.shen$dounbindv, [V3561, V3696]);
                      return Result;
                    })();
                })();
                    })();
                })()):(klFalse));
                })()):(klFalse);
                })()):(klFalse);
                })()):(klFalse);
                })()):(klFalse);
                })()):(klFalse);
                })();
                    return asJsBool(kl.fns.$eq(Case_8, klFalse))?((function () {
                  const Case_9 = (function () {
                  const V3567 = Kl.headCall(kl.fns.shen$dolazyderef, [V3693, V3696]);
                    return asJsBool(kl.fns.cons$qu(V3567))?((function () {
                  const V3568 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.hd(V3567), V3696]);
                    return asJsBool(kl.fns.$eq(new Sym("@s"), V3568))?((function () {
                  const V3569 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3567), V3696]);
                    return asJsBool(kl.fns.cons$qu(V3569))?((function () {
                  const X = kl.fns.hd(V3569);
                    const V3570 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3569), V3696]);
                    return asJsBool(kl.fns.cons$qu(V3570))?((function () {
                  const Y = kl.fns.hd(V3570);
                    const V3571 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3570), V3696]);
                    return asJsBool(kl.fns.$eq(null, V3571))?((function () {
                  const V3572 = Kl.headCall(kl.fns.shen$dolazyderef, [V3694, V3696]);
                    return asJsBool(kl.fns.$eq(new Sym("string"), V3572))?((function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.shen$doth$st, [X, new Sym("string"), V3695, V3696, Kl.setArity("shen.th*_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.shen$doth$st, [Y, new Sym("string"), V3695, V3696, V3697]);
                    })]);
                    })()):(asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V3572]))?((function () {
                      Kl.headCall(kl.fns.shen$dobindv, [V3572, new Sym("string"), V3696]);
                      return (function () {
                  const Result = (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.shen$doth$st, [X, new Sym("string"), V3695, V3696, Kl.setArity("shen.th*_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.shen$doth$st, [Y, new Sym("string"), V3695, V3696, V3697]);
                    })]);
                    })();
                    return (function () {
                      Kl.headCall(kl.fns.shen$dounbindv, [V3572, V3696]);
                      return Result;
                    })();
                })();
                    })()):(klFalse));
                })()):(klFalse);
                })()):(klFalse);
                })()):(klFalse);
                })()):(klFalse);
                })()):(klFalse);
                })();
                    return asJsBool(kl.fns.$eq(Case_9, klFalse))?((function () {
                  const Case_10 = (function () {
                  const V3573 = Kl.headCall(kl.fns.shen$dolazyderef, [V3693, V3696]);
                    return asJsBool(kl.fns.cons$qu(V3573))?((function () {
                  const V3574 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.hd(V3573), V3696]);
                    return asJsBool(kl.fns.$eq(new Sym("lambda"), V3574))?((function () {
                  const V3575 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3573), V3696]);
                    return asJsBool(kl.fns.cons$qu(V3575))?((function () {
                  const X = kl.fns.hd(V3575);
                    const V3576 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3575), V3696]);
                    return asJsBool(kl.fns.cons$qu(V3576))?((function () {
                  const Y = kl.fns.hd(V3576);
                    const V3577 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3576), V3696]);
                    return asJsBool(kl.fns.$eq(null, V3577))?((function () {
                  const V3578 = Kl.headCall(kl.fns.shen$dolazyderef, [V3694, V3696]);
                    return asJsBool(kl.fns.cons$qu(V3578))?((function () {
                  const A = kl.fns.hd(V3578);
                    const V3579 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3578), V3696]);
                    return asJsBool(kl.fns.cons$qu(V3579))?((function () {
                  const V3580 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.hd(V3579), V3696]);
                    return asJsBool(kl.fns.$eq(new Sym("-->"), V3580))?((function () {
                  const V3581 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3579), V3696]);
                    return asJsBool(kl.fns.cons$qu(V3581))?((function () {
                  const B = kl.fns.hd(V3581);
                    const V3582 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3581), V3696]);
                    return asJsBool(kl.fns.$eq(null, V3582))?((function () {
                  const Z = Kl.headCall(kl.fns.shen$donewpv, [V3696]);
                    const X$am$am = Kl.headCall(kl.fns.shen$donewpv, [V3696]);
                    return (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.cut, [Throwcontrol, V3696, Kl.setArity("shen.th*_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.bind, [X$am$am, Kl.headCall(kl.fns.shen$doplaceholder, []), V3696, Kl.setArity("shen.th*_freeze_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.bind, [Z, Kl.headCall(kl.fns.shen$doebr, [Kl.headCall(kl.fns.shen$dolazyderef, [X$am$am, V3696]), Kl.headCall(kl.fns.shen$dolazyderef, [X, V3696]), Kl.headCall(kl.fns.shen$dolazyderef, [Y, V3696])]), V3696, Kl.setArity("shen.th*_freeze_freeze_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.shen$doth$st, [Z, B, kl.fns.cons(kl.fns.cons(X$am$am, kl.fns.cons(new Sym(":"), kl.fns.cons(A, null))), V3695), V3696, V3697]);
                    })]);
                    })]);
                    })]);
                    })();
                })()):(asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V3582]))?((function () {
                      Kl.headCall(kl.fns.shen$dobindv, [V3582, null, V3696]);
                      return (function () {
                  const Result = (function () {
                  const Z = Kl.headCall(kl.fns.shen$donewpv, [V3696]);
                    const X$am$am = Kl.headCall(kl.fns.shen$donewpv, [V3696]);
                    return (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.cut, [Throwcontrol, V3696, Kl.setArity("shen.th*_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.bind, [X$am$am, Kl.headCall(kl.fns.shen$doplaceholder, []), V3696, Kl.setArity("shen.th*_freeze_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.bind, [Z, Kl.headCall(kl.fns.shen$doebr, [Kl.headCall(kl.fns.shen$dolazyderef, [X$am$am, V3696]), Kl.headCall(kl.fns.shen$dolazyderef, [X, V3696]), Kl.headCall(kl.fns.shen$dolazyderef, [Y, V3696])]), V3696, Kl.setArity("shen.th*_freeze_freeze_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.shen$doth$st, [Z, B, kl.fns.cons(kl.fns.cons(X$am$am, kl.fns.cons(new Sym(":"), kl.fns.cons(A, null))), V3695), V3696, V3697]);
                    })]);
                    })]);
                    })]);
                    })();
                })();
                    return (function () {
                      Kl.headCall(kl.fns.shen$dounbindv, [V3582, V3696]);
                      return Result;
                    })();
                })();
                    })()):(klFalse));
                })()):(asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V3581]))?((function () {
                  const B = Kl.headCall(kl.fns.shen$donewpv, [V3696]);
                    return (function () {
                      Kl.headCall(kl.fns.shen$dobindv, [V3581, kl.fns.cons(B, null), V3696]);
                      return (function () {
                  const Result = (function () {
                  const Z = Kl.headCall(kl.fns.shen$donewpv, [V3696]);
                    const X$am$am = Kl.headCall(kl.fns.shen$donewpv, [V3696]);
                    return (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.cut, [Throwcontrol, V3696, Kl.setArity("shen.th*_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.bind, [X$am$am, Kl.headCall(kl.fns.shen$doplaceholder, []), V3696, Kl.setArity("shen.th*_freeze_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.bind, [Z, Kl.headCall(kl.fns.shen$doebr, [Kl.headCall(kl.fns.shen$dolazyderef, [X$am$am, V3696]), Kl.headCall(kl.fns.shen$dolazyderef, [X, V3696]), Kl.headCall(kl.fns.shen$dolazyderef, [Y, V3696])]), V3696, Kl.setArity("shen.th*_freeze_freeze_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.shen$doth$st, [Z, B, kl.fns.cons(kl.fns.cons(X$am$am, kl.fns.cons(new Sym(":"), kl.fns.cons(A, null))), V3695), V3696, V3697]);
                    })]);
                    })]);
                    })]);
                    })();
                })();
                    return (function () {
                      Kl.headCall(kl.fns.shen$dounbindv, [V3581, V3696]);
                      return Result;
                    })();
                })();
                    })();
                })()):(klFalse));
                })()):(asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V3580]))?((function () {
                      Kl.headCall(kl.fns.shen$dobindv, [V3580, new Sym("-->"), V3696]);
                      return (function () {
                  const Result = (function () {
                  const V3583 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3579), V3696]);
                    return asJsBool(kl.fns.cons$qu(V3583))?((function () {
                  const B = kl.fns.hd(V3583);
                    const V3584 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3583), V3696]);
                    return asJsBool(kl.fns.$eq(null, V3584))?((function () {
                  const Z = Kl.headCall(kl.fns.shen$donewpv, [V3696]);
                    const X$am$am = Kl.headCall(kl.fns.shen$donewpv, [V3696]);
                    return (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.cut, [Throwcontrol, V3696, Kl.setArity("shen.th*_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.bind, [X$am$am, Kl.headCall(kl.fns.shen$doplaceholder, []), V3696, Kl.setArity("shen.th*_freeze_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.bind, [Z, Kl.headCall(kl.fns.shen$doebr, [Kl.headCall(kl.fns.shen$dolazyderef, [X$am$am, V3696]), Kl.headCall(kl.fns.shen$dolazyderef, [X, V3696]), Kl.headCall(kl.fns.shen$dolazyderef, [Y, V3696])]), V3696, Kl.setArity("shen.th*_freeze_freeze_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.shen$doth$st, [Z, B, kl.fns.cons(kl.fns.cons(X$am$am, kl.fns.cons(new Sym(":"), kl.fns.cons(A, null))), V3695), V3696, V3697]);
                    })]);
                    })]);
                    })]);
                    })();
                })()):(asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V3584]))?((function () {
                      Kl.headCall(kl.fns.shen$dobindv, [V3584, null, V3696]);
                      return (function () {
                  const Result = (function () {
                  const Z = Kl.headCall(kl.fns.shen$donewpv, [V3696]);
                    const X$am$am = Kl.headCall(kl.fns.shen$donewpv, [V3696]);
                    return (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.cut, [Throwcontrol, V3696, Kl.setArity("shen.th*_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.bind, [X$am$am, Kl.headCall(kl.fns.shen$doplaceholder, []), V3696, Kl.setArity("shen.th*_freeze_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.bind, [Z, Kl.headCall(kl.fns.shen$doebr, [Kl.headCall(kl.fns.shen$dolazyderef, [X$am$am, V3696]), Kl.headCall(kl.fns.shen$dolazyderef, [X, V3696]), Kl.headCall(kl.fns.shen$dolazyderef, [Y, V3696])]), V3696, Kl.setArity("shen.th*_freeze_freeze_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.shen$doth$st, [Z, B, kl.fns.cons(kl.fns.cons(X$am$am, kl.fns.cons(new Sym(":"), kl.fns.cons(A, null))), V3695), V3696, V3697]);
                    })]);
                    })]);
                    })]);
                    })();
                })();
                    return (function () {
                      Kl.headCall(kl.fns.shen$dounbindv, [V3584, V3696]);
                      return Result;
                    })();
                })();
                    })()):(klFalse));
                })()):(asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V3583]))?((function () {
                  const B = Kl.headCall(kl.fns.shen$donewpv, [V3696]);
                    return (function () {
                      Kl.headCall(kl.fns.shen$dobindv, [V3583, kl.fns.cons(B, null), V3696]);
                      return (function () {
                  const Result = (function () {
                  const Z = Kl.headCall(kl.fns.shen$donewpv, [V3696]);
                    const X$am$am = Kl.headCall(kl.fns.shen$donewpv, [V3696]);
                    return (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.cut, [Throwcontrol, V3696, Kl.setArity("shen.th*_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.bind, [X$am$am, Kl.headCall(kl.fns.shen$doplaceholder, []), V3696, Kl.setArity("shen.th*_freeze_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.bind, [Z, Kl.headCall(kl.fns.shen$doebr, [Kl.headCall(kl.fns.shen$dolazyderef, [X$am$am, V3696]), Kl.headCall(kl.fns.shen$dolazyderef, [X, V3696]), Kl.headCall(kl.fns.shen$dolazyderef, [Y, V3696])]), V3696, Kl.setArity("shen.th*_freeze_freeze_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.shen$doth$st, [Z, B, kl.fns.cons(kl.fns.cons(X$am$am, kl.fns.cons(new Sym(":"), kl.fns.cons(A, null))), V3695), V3696, V3697]);
                    })]);
                    })]);
                    })]);
                    })();
                })();
                    return (function () {
                      Kl.headCall(kl.fns.shen$dounbindv, [V3583, V3696]);
                      return Result;
                    })();
                })();
                    })();
                })()):(klFalse));
                })();
                    return (function () {
                      Kl.headCall(kl.fns.shen$dounbindv, [V3580, V3696]);
                      return Result;
                    })();
                })();
                    })()):(klFalse));
                })()):(asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V3579]))?((function () {
                  const B = Kl.headCall(kl.fns.shen$donewpv, [V3696]);
                    return (function () {
                      Kl.headCall(kl.fns.shen$dobindv, [V3579, kl.fns.cons(new Sym("-->"), kl.fns.cons(B, null)), V3696]);
                      return (function () {
                  const Result = (function () {
                  const Z = Kl.headCall(kl.fns.shen$donewpv, [V3696]);
                    const X$am$am = Kl.headCall(kl.fns.shen$donewpv, [V3696]);
                    return (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.cut, [Throwcontrol, V3696, Kl.setArity("shen.th*_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.bind, [X$am$am, Kl.headCall(kl.fns.shen$doplaceholder, []), V3696, Kl.setArity("shen.th*_freeze_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.bind, [Z, Kl.headCall(kl.fns.shen$doebr, [Kl.headCall(kl.fns.shen$dolazyderef, [X$am$am, V3696]), Kl.headCall(kl.fns.shen$dolazyderef, [X, V3696]), Kl.headCall(kl.fns.shen$dolazyderef, [Y, V3696])]), V3696, Kl.setArity("shen.th*_freeze_freeze_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.shen$doth$st, [Z, B, kl.fns.cons(kl.fns.cons(X$am$am, kl.fns.cons(new Sym(":"), kl.fns.cons(A, null))), V3695), V3696, V3697]);
                    })]);
                    })]);
                    })]);
                    })();
                })();
                    return (function () {
                      Kl.headCall(kl.fns.shen$dounbindv, [V3579, V3696]);
                      return Result;
                    })();
                })();
                    })();
                })()):(klFalse));
                })()):(asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V3578]))?((function () {
                  const A = Kl.headCall(kl.fns.shen$donewpv, [V3696]);
                    const B = Kl.headCall(kl.fns.shen$donewpv, [V3696]);
                    return (function () {
                      Kl.headCall(kl.fns.shen$dobindv, [V3578, kl.fns.cons(A, kl.fns.cons(new Sym("-->"), kl.fns.cons(B, null))), V3696]);
                      return (function () {
                  const Result = (function () {
                  const Z = Kl.headCall(kl.fns.shen$donewpv, [V3696]);
                    const X$am$am = Kl.headCall(kl.fns.shen$donewpv, [V3696]);
                    return (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.cut, [Throwcontrol, V3696, Kl.setArity("shen.th*_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.bind, [X$am$am, Kl.headCall(kl.fns.shen$doplaceholder, []), V3696, Kl.setArity("shen.th*_freeze_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.bind, [Z, Kl.headCall(kl.fns.shen$doebr, [Kl.headCall(kl.fns.shen$dolazyderef, [X$am$am, V3696]), Kl.headCall(kl.fns.shen$dolazyderef, [X, V3696]), Kl.headCall(kl.fns.shen$dolazyderef, [Y, V3696])]), V3696, Kl.setArity("shen.th*_freeze_freeze_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.shen$doth$st, [Z, B, kl.fns.cons(kl.fns.cons(X$am$am, kl.fns.cons(new Sym(":"), kl.fns.cons(A, null))), V3695), V3696, V3697]);
                    })]);
                    })]);
                    })]);
                    })();
                })();
                    return (function () {
                      Kl.headCall(kl.fns.shen$dounbindv, [V3578, V3696]);
                      return Result;
                    })();
                })();
                    })();
                })()):(klFalse));
                })()):(klFalse);
                })()):(klFalse);
                })()):(klFalse);
                })()):(klFalse);
                })()):(klFalse);
                })();
                    return asJsBool(kl.fns.$eq(Case_10, klFalse))?((function () {
                  const Case_11 = (function () {
                  const V3585 = Kl.headCall(kl.fns.shen$dolazyderef, [V3693, V3696]);
                    return asJsBool(kl.fns.cons$qu(V3585))?((function () {
                  const V3586 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.hd(V3585), V3696]);
                    return asJsBool(kl.fns.$eq(new Sym("let"), V3586))?((function () {
                  const V3587 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3585), V3696]);
                    return asJsBool(kl.fns.cons$qu(V3587))?((function () {
                  const X = kl.fns.hd(V3587);
                    const V3588 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3587), V3696]);
                    return asJsBool(kl.fns.cons$qu(V3588))?((function () {
                  const Y = kl.fns.hd(V3588);
                    const V3589 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3588), V3696]);
                    return asJsBool(kl.fns.cons$qu(V3589))?((function () {
                  const Z = kl.fns.hd(V3589);
                    const V3590 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3589), V3696]);
                    return asJsBool(kl.fns.$eq(null, V3590))?((function () {
                  const W = Kl.headCall(kl.fns.shen$donewpv, [V3696]);
                    const X$am$am = Kl.headCall(kl.fns.shen$donewpv, [V3696]);
                    const B = Kl.headCall(kl.fns.shen$donewpv, [V3696]);
                    return (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.shen$doth$st, [Y, B, V3695, V3696, Kl.setArity("shen.th*_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.bind, [X$am$am, Kl.headCall(kl.fns.shen$doplaceholder, []), V3696, Kl.setArity("shen.th*_freeze_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.bind, [W, Kl.headCall(kl.fns.shen$doebr, [Kl.headCall(kl.fns.shen$dolazyderef, [X$am$am, V3696]), Kl.headCall(kl.fns.shen$dolazyderef, [X, V3696]), Kl.headCall(kl.fns.shen$dolazyderef, [Z, V3696])]), V3696, Kl.setArity("shen.th*_freeze_freeze_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.shen$doth$st, [W, V3694, kl.fns.cons(kl.fns.cons(X$am$am, kl.fns.cons(new Sym(":"), kl.fns.cons(B, null))), V3695), V3696, V3697]);
                    })]);
                    })]);
                    })]);
                    })();
                })()):(klFalse);
                })()):(klFalse);
                })()):(klFalse);
                })()):(klFalse);
                })()):(klFalse);
                })()):(klFalse);
                })();
                    return asJsBool(kl.fns.$eq(Case_11, klFalse))?((function () {
                  const Case_12 = (function () {
                  const V3591 = Kl.headCall(kl.fns.shen$dolazyderef, [V3693, V3696]);
                    return asJsBool(kl.fns.cons$qu(V3591))?((function () {
                  const V3592 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.hd(V3591), V3696]);
                    return asJsBool(kl.fns.$eq(new Sym("open"), V3592))?((function () {
                  const V3593 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3591), V3696]);
                    return asJsBool(kl.fns.cons$qu(V3593))?((function () {
                  const FileName = kl.fns.hd(V3593);
                    const V3594 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3593), V3696]);
                    return asJsBool(kl.fns.cons$qu(V3594))?((function () {
                  const Direction3524 = kl.fns.hd(V3594);
                    const V3595 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3594), V3696]);
                    return asJsBool(kl.fns.$eq(null, V3595))?((function () {
                  const V3596 = Kl.headCall(kl.fns.shen$dolazyderef, [V3694, V3696]);
                    return asJsBool(kl.fns.cons$qu(V3596))?((function () {
                  const V3597 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.hd(V3596), V3696]);
                    return asJsBool(kl.fns.$eq(new Sym("stream"), V3597))?((function () {
                  const V3598 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3596), V3696]);
                    return asJsBool(kl.fns.cons$qu(V3598))?((function () {
                  const Direction = kl.fns.hd(V3598);
                    const V3599 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3598), V3696]);
                    return asJsBool(kl.fns.$eq(null, V3599))?((function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.unify$ex, [Direction, Direction3524, V3696, Kl.setArity("shen.th*_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.cut, [Throwcontrol, V3696, Kl.setArity("shen.th*_freeze_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.fwhen, [Kl.headCall(kl.fns.element$qu, [Kl.headCall(kl.fns.shen$dolazyderef, [Direction, V3696]), kl.fns.cons(new Sym("in"), kl.fns.cons(new Sym("out"), null))]), V3696, Kl.setArity("shen.th*_freeze_freeze_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.shen$doth$st, [FileName, new Sym("string"), V3695, V3696, V3697]);
                    })]);
                    })]);
                    })]);
                    })()):(asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V3599]))?((function () {
                      Kl.headCall(kl.fns.shen$dobindv, [V3599, null, V3696]);
                      return (function () {
                  const Result = (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.unify$ex, [Direction, Direction3524, V3696, Kl.setArity("shen.th*_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.cut, [Throwcontrol, V3696, Kl.setArity("shen.th*_freeze_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.fwhen, [Kl.headCall(kl.fns.element$qu, [Kl.headCall(kl.fns.shen$dolazyderef, [Direction, V3696]), kl.fns.cons(new Sym("in"), kl.fns.cons(new Sym("out"), null))]), V3696, Kl.setArity("shen.th*_freeze_freeze_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.shen$doth$st, [FileName, new Sym("string"), V3695, V3696, V3697]);
                    })]);
                    })]);
                    })]);
                    })();
                    return (function () {
                      Kl.headCall(kl.fns.shen$dounbindv, [V3599, V3696]);
                      return Result;
                    })();
                })();
                    })()):(klFalse));
                })()):(asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V3598]))?((function () {
                  const Direction = Kl.headCall(kl.fns.shen$donewpv, [V3696]);
                    return (function () {
                      Kl.headCall(kl.fns.shen$dobindv, [V3598, kl.fns.cons(Direction, null), V3696]);
                      return (function () {
                  const Result = (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.unify$ex, [Direction, Direction3524, V3696, Kl.setArity("shen.th*_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.cut, [Throwcontrol, V3696, Kl.setArity("shen.th*_freeze_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.fwhen, [Kl.headCall(kl.fns.element$qu, [Kl.headCall(kl.fns.shen$dolazyderef, [Direction, V3696]), kl.fns.cons(new Sym("in"), kl.fns.cons(new Sym("out"), null))]), V3696, Kl.setArity("shen.th*_freeze_freeze_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.shen$doth$st, [FileName, new Sym("string"), V3695, V3696, V3697]);
                    })]);
                    })]);
                    })]);
                    })();
                    return (function () {
                      Kl.headCall(kl.fns.shen$dounbindv, [V3598, V3696]);
                      return Result;
                    })();
                })();
                    })();
                })()):(klFalse));
                })()):(asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V3597]))?((function () {
                      Kl.headCall(kl.fns.shen$dobindv, [V3597, new Sym("stream"), V3696]);
                      return (function () {
                  const Result = (function () {
                  const V3600 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3596), V3696]);
                    return asJsBool(kl.fns.cons$qu(V3600))?((function () {
                  const Direction = kl.fns.hd(V3600);
                    const V3601 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3600), V3696]);
                    return asJsBool(kl.fns.$eq(null, V3601))?((function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.unify$ex, [Direction, Direction3524, V3696, Kl.setArity("shen.th*_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.cut, [Throwcontrol, V3696, Kl.setArity("shen.th*_freeze_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.fwhen, [Kl.headCall(kl.fns.element$qu, [Kl.headCall(kl.fns.shen$dolazyderef, [Direction, V3696]), kl.fns.cons(new Sym("in"), kl.fns.cons(new Sym("out"), null))]), V3696, Kl.setArity("shen.th*_freeze_freeze_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.shen$doth$st, [FileName, new Sym("string"), V3695, V3696, V3697]);
                    })]);
                    })]);
                    })]);
                    })()):(asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V3601]))?((function () {
                      Kl.headCall(kl.fns.shen$dobindv, [V3601, null, V3696]);
                      return (function () {
                  const Result = (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.unify$ex, [Direction, Direction3524, V3696, Kl.setArity("shen.th*_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.cut, [Throwcontrol, V3696, Kl.setArity("shen.th*_freeze_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.fwhen, [Kl.headCall(kl.fns.element$qu, [Kl.headCall(kl.fns.shen$dolazyderef, [Direction, V3696]), kl.fns.cons(new Sym("in"), kl.fns.cons(new Sym("out"), null))]), V3696, Kl.setArity("shen.th*_freeze_freeze_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.shen$doth$st, [FileName, new Sym("string"), V3695, V3696, V3697]);
                    })]);
                    })]);
                    })]);
                    })();
                    return (function () {
                      Kl.headCall(kl.fns.shen$dounbindv, [V3601, V3696]);
                      return Result;
                    })();
                })();
                    })()):(klFalse));
                })()):(asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V3600]))?((function () {
                  const Direction = Kl.headCall(kl.fns.shen$donewpv, [V3696]);
                    return (function () {
                      Kl.headCall(kl.fns.shen$dobindv, [V3600, kl.fns.cons(Direction, null), V3696]);
                      return (function () {
                  const Result = (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.unify$ex, [Direction, Direction3524, V3696, Kl.setArity("shen.th*_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.cut, [Throwcontrol, V3696, Kl.setArity("shen.th*_freeze_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.fwhen, [Kl.headCall(kl.fns.element$qu, [Kl.headCall(kl.fns.shen$dolazyderef, [Direction, V3696]), kl.fns.cons(new Sym("in"), kl.fns.cons(new Sym("out"), null))]), V3696, Kl.setArity("shen.th*_freeze_freeze_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.shen$doth$st, [FileName, new Sym("string"), V3695, V3696, V3697]);
                    })]);
                    })]);
                    })]);
                    })();
                    return (function () {
                      Kl.headCall(kl.fns.shen$dounbindv, [V3600, V3696]);
                      return Result;
                    })();
                })();
                    })();
                })()):(klFalse));
                })();
                    return (function () {
                      Kl.headCall(kl.fns.shen$dounbindv, [V3597, V3696]);
                      return Result;
                    })();
                })();
                    })()):(klFalse));
                })()):(asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V3596]))?((function () {
                  const Direction = Kl.headCall(kl.fns.shen$donewpv, [V3696]);
                    return (function () {
                      Kl.headCall(kl.fns.shen$dobindv, [V3596, kl.fns.cons(new Sym("stream"), kl.fns.cons(Direction, null)), V3696]);
                      return (function () {
                  const Result = (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.unify$ex, [Direction, Direction3524, V3696, Kl.setArity("shen.th*_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.cut, [Throwcontrol, V3696, Kl.setArity("shen.th*_freeze_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.fwhen, [Kl.headCall(kl.fns.element$qu, [Kl.headCall(kl.fns.shen$dolazyderef, [Direction, V3696]), kl.fns.cons(new Sym("in"), kl.fns.cons(new Sym("out"), null))]), V3696, Kl.setArity("shen.th*_freeze_freeze_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.shen$doth$st, [FileName, new Sym("string"), V3695, V3696, V3697]);
                    })]);
                    })]);
                    })]);
                    })();
                    return (function () {
                      Kl.headCall(kl.fns.shen$dounbindv, [V3596, V3696]);
                      return Result;
                    })();
                })();
                    })();
                })()):(klFalse));
                })()):(klFalse);
                })()):(klFalse);
                })()):(klFalse);
                })()):(klFalse);
                })()):(klFalse);
                })();
                    return asJsBool(kl.fns.$eq(Case_12, klFalse))?((function () {
                  const Case_13 = (function () {
                  const V3602 = Kl.headCall(kl.fns.shen$dolazyderef, [V3693, V3696]);
                    return asJsBool(kl.fns.cons$qu(V3602))?((function () {
                  const V3603 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.hd(V3602), V3696]);
                    return asJsBool(kl.fns.$eq(new Sym("type"), V3603))?((function () {
                  const V3604 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3602), V3696]);
                    return asJsBool(kl.fns.cons$qu(V3604))?((function () {
                  const X = kl.fns.hd(V3604);
                    const V3605 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3604), V3696]);
                    return asJsBool(kl.fns.cons$qu(V3605))?((function () {
                  const A = kl.fns.hd(V3605);
                    const V3606 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3605), V3696]);
                    return asJsBool(kl.fns.$eq(null, V3606))?((function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.cut, [Throwcontrol, V3696, Kl.setArity("shen.th*_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.unify, [A, V3694, V3696, Kl.setArity("shen.th*_freeze_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.shen$doth$st, [X, A, V3695, V3696, V3697]);
                    })]);
                    })]);
                    })()):(klFalse);
                })()):(klFalse);
                })()):(klFalse);
                })()):(klFalse);
                })()):(klFalse);
                })();
                    return asJsBool(kl.fns.$eq(Case_13, klFalse))?((function () {
                  const Case_14 = (function () {
                  const V3607 = Kl.headCall(kl.fns.shen$dolazyderef, [V3693, V3696]);
                    return asJsBool(kl.fns.cons$qu(V3607))?((function () {
                  const V3608 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.hd(V3607), V3696]);
                    return asJsBool(kl.fns.$eq(new Sym("input+"), V3608))?((function () {
                  const V3609 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3607), V3696]);
                    return asJsBool(kl.fns.cons$qu(V3609))?((function () {
                  const A = kl.fns.hd(V3609);
                    const V3610 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3609), V3696]);
                    return asJsBool(kl.fns.cons$qu(V3610))?((function () {
                  const Stream = kl.fns.hd(V3610);
                    const V3611 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3610), V3696]);
                    return asJsBool(kl.fns.$eq(null, V3611))?((function () {
                  const C = Kl.headCall(kl.fns.shen$donewpv, [V3696]);
                    return (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.bind, [C, Kl.headCall(kl.fns.shen$dodemodulate, [Kl.headCall(kl.fns.shen$dolazyderef, [A, V3696])]), V3696, Kl.setArity("shen.th*_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.unify, [V3694, C, V3696, Kl.setArity("shen.th*_freeze_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.shen$doth$st, [Stream, kl.fns.cons(new Sym("stream"), kl.fns.cons(new Sym("in"), null)), V3695, V3696, V3697]);
                    })]);
                    })]);
                    })();
                })()):(klFalse);
                })()):(klFalse);
                })()):(klFalse);
                })()):(klFalse);
                })()):(klFalse);
                })();
                    return asJsBool(kl.fns.$eq(Case_14, klFalse))?((function () {
                  const Case_15 = (function () {
                  const V3612 = Kl.headCall(kl.fns.shen$dolazyderef, [V3693, V3696]);
                    return asJsBool(kl.fns.cons$qu(V3612))?((function () {
                  const V3613 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.hd(V3612), V3696]);
                    return asJsBool(kl.fns.$eq(new Sym("set"), V3613))?((function () {
                  const V3614 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3612), V3696]);
                    return asJsBool(kl.fns.cons$qu(V3614))?((function () {
                  const Var = kl.fns.hd(V3614);
                    const V3615 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3614), V3696]);
                    return asJsBool(kl.fns.cons$qu(V3615))?((function () {
                  const Val = kl.fns.hd(V3615);
                    const V3616 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3615), V3696]);
                    return asJsBool(kl.fns.$eq(null, V3616))?((function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.cut, [Throwcontrol, V3696, Kl.setArity("shen.th*_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.shen$doth$st, [Var, new Sym("symbol"), V3695, V3696, Kl.setArity("shen.th*_freeze_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.cut, [Throwcontrol, V3696, Kl.setArity("shen.th*_freeze_freeze_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.shen$doth$st, [kl.fns.cons(new Sym("value"), kl.fns.cons(Var, null)), V3694, V3695, V3696, Kl.setArity("shen.th*_freeze_freeze_freeze_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.shen$doth$st, [Val, V3694, V3695, V3696, V3697]);
                    })]);
                    })]);
                    })]);
                    })]);
                    })()):(klFalse);
                })()):(klFalse);
                })()):(klFalse);
                })()):(klFalse);
                })()):(klFalse);
                })();
                    return asJsBool(kl.fns.$eq(Case_15, klFalse))?((function () {
                  const Case_16 = (function () {
                  const NewHyp = Kl.headCall(kl.fns.shen$donewpv, [V3696]);
                    return (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.shen$dot$st_hyps, [V3695, NewHyp, V3696, Kl.setArity("shen.th*_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.shen$doth$st, [V3693, V3694, NewHyp, V3696, V3697]);
                    })]);
                    })();
                })();
                    return asJsBool(kl.fns.$eq(Case_16, klFalse))?((function () {
                  const Case_17 = (function () {
                  const V3617 = Kl.headCall(kl.fns.shen$dolazyderef, [V3693, V3696]);
                    return asJsBool(kl.fns.cons$qu(V3617))?((function () {
                  const V3618 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.hd(V3617), V3696]);
                    return asJsBool(kl.fns.$eq(new Sym("define"), V3618))?((function () {
                  const V3619 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3617), V3696]);
                    return asJsBool(kl.fns.cons$qu(V3619))?((function () {
                  const F = kl.fns.hd(V3619);
                    const X = kl.fns.tl(V3619);
                    return (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.cut, [Throwcontrol, V3696, Kl.setArity("shen.th*_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.shen$dot$st_def, [kl.fns.cons(new Sym("define"), kl.fns.cons(F, X)), V3694, V3695, V3696, V3697]);
                    })]);
                    })();
                })()):(klFalse);
                })()):(klFalse);
                })()):(klFalse);
                })();
                    return asJsBool(kl.fns.$eq(Case_17, klFalse))?((function () {
                  const Case_18 = (function () {
                  const V3620 = Kl.headCall(kl.fns.shen$dolazyderef, [V3693, V3696]);
                    return asJsBool(kl.fns.cons$qu(V3620))?((function () {
                  const V3621 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.hd(V3620), V3696]);
                    return asJsBool(kl.fns.$eq(new Sym("defmacro"), V3621))?((function () {
                  const V3622 = Kl.headCall(kl.fns.shen$dolazyderef, [V3694, V3696]);
                    return asJsBool(kl.fns.$eq(new Sym("unit"), V3622))?((function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.cut, [Throwcontrol, V3696, V3697]);
                    })()):(asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V3622]))?((function () {
                      Kl.headCall(kl.fns.shen$dobindv, [V3622, new Sym("unit"), V3696]);
                      return (function () {
                  const Result = (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.cut, [Throwcontrol, V3696, V3697]);
                    })();
                    return (function () {
                      Kl.headCall(kl.fns.shen$dounbindv, [V3622, V3696]);
                      return Result;
                    })();
                })();
                    })()):(klFalse));
                })()):(klFalse);
                })()):(klFalse);
                })();
                    return asJsBool(kl.fns.$eq(Case_18, klFalse))?((function () {
                  const Case_19 = (function () {
                  const V3623 = Kl.headCall(kl.fns.shen$dolazyderef, [V3693, V3696]);
                    return asJsBool(kl.fns.cons$qu(V3623))?((function () {
                  const V3624 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.hd(V3623), V3696]);
                    return asJsBool(kl.fns.$eq(new Sym("shen.process-datatype"), V3624))?((function () {
                  const V3625 = Kl.headCall(kl.fns.shen$dolazyderef, [V3694, V3696]);
                    return asJsBool(kl.fns.$eq(new Sym("symbol"), V3625))?((function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.thaw, [V3697]);
                    })()):(asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V3625]))?((function () {
                      Kl.headCall(kl.fns.shen$dobindv, [V3625, new Sym("symbol"), V3696]);
                      return (function () {
                  const Result = (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.thaw, [V3697]);
                    })();
                    return (function () {
                      Kl.headCall(kl.fns.shen$dounbindv, [V3625, V3696]);
                      return Result;
                    })();
                })();
                    })()):(klFalse));
                })()):(klFalse);
                })()):(klFalse);
                })();
                    return asJsBool(kl.fns.$eq(Case_19, klFalse))?((function () {
                  const Case_20 = (function () {
                  const V3626 = Kl.headCall(kl.fns.shen$dolazyderef, [V3693, V3696]);
                    return asJsBool(kl.fns.cons$qu(V3626))?((function () {
                  const V3627 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.hd(V3626), V3696]);
                    return asJsBool(kl.fns.$eq(new Sym("shen.synonyms-help"), V3627))?((function () {
                  const V3628 = Kl.headCall(kl.fns.shen$dolazyderef, [V3694, V3696]);
                    return asJsBool(kl.fns.$eq(new Sym("symbol"), V3628))?((function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.thaw, [V3697]);
                    })()):(asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V3628]))?((function () {
                      Kl.headCall(kl.fns.shen$dobindv, [V3628, new Sym("symbol"), V3696]);
                      return (function () {
                  const Result = (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.thaw, [V3697]);
                    })();
                    return (function () {
                      Kl.headCall(kl.fns.shen$dounbindv, [V3628, V3696]);
                      return Result;
                    })();
                })();
                    })()):(klFalse));
                })()):(klFalse);
                })()):(klFalse);
                })();
                    return asJsBool(kl.fns.$eq(Case_20, klFalse))?((function () {
                  const Datatypes = Kl.headCall(kl.fns.shen$donewpv, [V3696]);
                    return (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.bind, [Datatypes, kl.fns.value(new Sym("shen.*datatypes*")), V3696, Kl.setArity("shen.th*_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.shen$doudefs$st, [kl.fns.cons(V3693, kl.fns.cons(new Sym(":"), kl.fns.cons(V3694, null))), V3695, Datatypes, V3696, V3697]);
                    })]);
                    })();
                })()):(Case_20);
                })()):(Case_19);
                })()):(Case_18);
                })()):(Case_17);
                })()):(Case_16);
                })()):(Case_15);
                })()):(Case_14);
                })()):(Case_13);
                })()):(Case_12);
                })()):(Case_11);
                })()):(Case_10);
                })()):(Case_9);
                })()):(Case_8);
                })()):(Case_7);
                })()):(Case_6);
                })()):(Case_5);
                })()):(Case_4);
                })()):(Case_3);
                })()):(Case_2);
                })()):(Case_1);
                })()):(Case);
                })()]);
                })();
                    });

kl.defun("shen.t*-hyps", 4, function (V3702, V3703, V3704, V3705) {
                      return (function () {
                  const Case = (function () {
                  const V3439 = Kl.headCall(kl.fns.shen$dolazyderef, [V3702, V3704]);
                    return asJsBool(kl.fns.cons$qu(V3439))?((function () {
                  const V3440 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.hd(V3439), V3704]);
                    return asJsBool(kl.fns.cons$qu(V3440))?((function () {
                  const V3441 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.hd(V3440), V3704]);
                    return asJsBool(kl.fns.cons$qu(V3441))?((function () {
                  const V3442 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.hd(V3441), V3704]);
                    return asJsBool(kl.fns.$eq(new Sym("cons"), V3442))?((function () {
                  const V3443 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3441), V3704]);
                    return asJsBool(kl.fns.cons$qu(V3443))?((function () {
                  const X = kl.fns.hd(V3443);
                    const V3444 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3443), V3704]);
                    return asJsBool(kl.fns.cons$qu(V3444))?((function () {
                  const Y = kl.fns.hd(V3444);
                    const V3445 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3444), V3704]);
                    return asJsBool(kl.fns.$eq(null, V3445))?((function () {
                  const V3446 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3440), V3704]);
                    return asJsBool(kl.fns.cons$qu(V3446))?((function () {
                  const V3447 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.hd(V3446), V3704]);
                    return asJsBool(kl.fns.$eq(new Sym(":"), V3447))?((function () {
                  const V3448 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3446), V3704]);
                    return asJsBool(kl.fns.cons$qu(V3448))?((function () {
                  const V3449 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.hd(V3448), V3704]);
                    return asJsBool(kl.fns.cons$qu(V3449))?((function () {
                  const V3450 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.hd(V3449), V3704]);
                    return asJsBool(kl.fns.$eq(new Sym("list"), V3450))?((function () {
                  const V3451 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3449), V3704]);
                    return asJsBool(kl.fns.cons$qu(V3451))?((function () {
                  const A = kl.fns.hd(V3451);
                    const V3452 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3451), V3704]);
                    return asJsBool(kl.fns.$eq(null, V3452))?((function () {
                  const V3453 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3448), V3704]);
                    return asJsBool(kl.fns.$eq(null, V3453))?((function () {
                  const Hyp = kl.fns.tl(V3439);
                    return (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.bind, [V3703, kl.fns.cons(kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [X, V3704]), kl.fns.cons(new Sym(":"), kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [A, V3704]), null))), kl.fns.cons(kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [Y, V3704]), kl.fns.cons(new Sym(":"), kl.fns.cons(kl.fns.cons(new Sym("list"), kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [A, V3704]), null)), null))), Kl.headCall(kl.fns.shen$dolazyderef, [Hyp, V3704]))), V3704, V3705]);
                    })();
                })()):(asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V3453]))?((function () {
                      Kl.headCall(kl.fns.shen$dobindv, [V3453, null, V3704]);
                      return (function () {
                  const Result = (function () {
                  const Hyp = kl.fns.tl(V3439);
                    return (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.bind, [V3703, kl.fns.cons(kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [X, V3704]), kl.fns.cons(new Sym(":"), kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [A, V3704]), null))), kl.fns.cons(kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [Y, V3704]), kl.fns.cons(new Sym(":"), kl.fns.cons(kl.fns.cons(new Sym("list"), kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [A, V3704]), null)), null))), Kl.headCall(kl.fns.shen$dolazyderef, [Hyp, V3704]))), V3704, V3705]);
                    })();
                })();
                    return (function () {
                      Kl.headCall(kl.fns.shen$dounbindv, [V3453, V3704]);
                      return Result;
                    })();
                })();
                    })()):(klFalse));
                })()):(asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V3452]))?((function () {
                      Kl.headCall(kl.fns.shen$dobindv, [V3452, null, V3704]);
                      return (function () {
                  const Result = (function () {
                  const V3454 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3448), V3704]);
                    return asJsBool(kl.fns.$eq(null, V3454))?((function () {
                  const Hyp = kl.fns.tl(V3439);
                    return (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.bind, [V3703, kl.fns.cons(kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [X, V3704]), kl.fns.cons(new Sym(":"), kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [A, V3704]), null))), kl.fns.cons(kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [Y, V3704]), kl.fns.cons(new Sym(":"), kl.fns.cons(kl.fns.cons(new Sym("list"), kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [A, V3704]), null)), null))), Kl.headCall(kl.fns.shen$dolazyderef, [Hyp, V3704]))), V3704, V3705]);
                    })();
                })()):(asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V3454]))?((function () {
                      Kl.headCall(kl.fns.shen$dobindv, [V3454, null, V3704]);
                      return (function () {
                  const Result = (function () {
                  const Hyp = kl.fns.tl(V3439);
                    return (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.bind, [V3703, kl.fns.cons(kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [X, V3704]), kl.fns.cons(new Sym(":"), kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [A, V3704]), null))), kl.fns.cons(kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [Y, V3704]), kl.fns.cons(new Sym(":"), kl.fns.cons(kl.fns.cons(new Sym("list"), kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [A, V3704]), null)), null))), Kl.headCall(kl.fns.shen$dolazyderef, [Hyp, V3704]))), V3704, V3705]);
                    })();
                })();
                    return (function () {
                      Kl.headCall(kl.fns.shen$dounbindv, [V3454, V3704]);
                      return Result;
                    })();
                })();
                    })()):(klFalse));
                })();
                    return (function () {
                      Kl.headCall(kl.fns.shen$dounbindv, [V3452, V3704]);
                      return Result;
                    })();
                })();
                    })()):(klFalse));
                })()):(asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V3451]))?((function () {
                  const A = Kl.headCall(kl.fns.shen$donewpv, [V3704]);
                    return (function () {
                      Kl.headCall(kl.fns.shen$dobindv, [V3451, kl.fns.cons(A, null), V3704]);
                      return (function () {
                  const Result = (function () {
                  const V3455 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3448), V3704]);
                    return asJsBool(kl.fns.$eq(null, V3455))?((function () {
                  const Hyp = kl.fns.tl(V3439);
                    return (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.bind, [V3703, kl.fns.cons(kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [X, V3704]), kl.fns.cons(new Sym(":"), kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [A, V3704]), null))), kl.fns.cons(kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [Y, V3704]), kl.fns.cons(new Sym(":"), kl.fns.cons(kl.fns.cons(new Sym("list"), kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [A, V3704]), null)), null))), Kl.headCall(kl.fns.shen$dolazyderef, [Hyp, V3704]))), V3704, V3705]);
                    })();
                })()):(asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V3455]))?((function () {
                      Kl.headCall(kl.fns.shen$dobindv, [V3455, null, V3704]);
                      return (function () {
                  const Result = (function () {
                  const Hyp = kl.fns.tl(V3439);
                    return (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.bind, [V3703, kl.fns.cons(kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [X, V3704]), kl.fns.cons(new Sym(":"), kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [A, V3704]), null))), kl.fns.cons(kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [Y, V3704]), kl.fns.cons(new Sym(":"), kl.fns.cons(kl.fns.cons(new Sym("list"), kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [A, V3704]), null)), null))), Kl.headCall(kl.fns.shen$dolazyderef, [Hyp, V3704]))), V3704, V3705]);
                    })();
                })();
                    return (function () {
                      Kl.headCall(kl.fns.shen$dounbindv, [V3455, V3704]);
                      return Result;
                    })();
                })();
                    })()):(klFalse));
                })();
                    return (function () {
                      Kl.headCall(kl.fns.shen$dounbindv, [V3451, V3704]);
                      return Result;
                    })();
                })();
                    })();
                })()):(klFalse));
                })()):(asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V3450]))?((function () {
                      Kl.headCall(kl.fns.shen$dobindv, [V3450, new Sym("list"), V3704]);
                      return (function () {
                  const Result = (function () {
                  const V3456 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3449), V3704]);
                    return asJsBool(kl.fns.cons$qu(V3456))?((function () {
                  const A = kl.fns.hd(V3456);
                    const V3457 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3456), V3704]);
                    return asJsBool(kl.fns.$eq(null, V3457))?((function () {
                  const V3458 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3448), V3704]);
                    return asJsBool(kl.fns.$eq(null, V3458))?((function () {
                  const Hyp = kl.fns.tl(V3439);
                    return (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.bind, [V3703, kl.fns.cons(kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [X, V3704]), kl.fns.cons(new Sym(":"), kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [A, V3704]), null))), kl.fns.cons(kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [Y, V3704]), kl.fns.cons(new Sym(":"), kl.fns.cons(kl.fns.cons(new Sym("list"), kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [A, V3704]), null)), null))), Kl.headCall(kl.fns.shen$dolazyderef, [Hyp, V3704]))), V3704, V3705]);
                    })();
                })()):(asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V3458]))?((function () {
                      Kl.headCall(kl.fns.shen$dobindv, [V3458, null, V3704]);
                      return (function () {
                  const Result = (function () {
                  const Hyp = kl.fns.tl(V3439);
                    return (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.bind, [V3703, kl.fns.cons(kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [X, V3704]), kl.fns.cons(new Sym(":"), kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [A, V3704]), null))), kl.fns.cons(kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [Y, V3704]), kl.fns.cons(new Sym(":"), kl.fns.cons(kl.fns.cons(new Sym("list"), kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [A, V3704]), null)), null))), Kl.headCall(kl.fns.shen$dolazyderef, [Hyp, V3704]))), V3704, V3705]);
                    })();
                })();
                    return (function () {
                      Kl.headCall(kl.fns.shen$dounbindv, [V3458, V3704]);
                      return Result;
                    })();
                })();
                    })()):(klFalse));
                })()):(asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V3457]))?((function () {
                      Kl.headCall(kl.fns.shen$dobindv, [V3457, null, V3704]);
                      return (function () {
                  const Result = (function () {
                  const V3459 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3448), V3704]);
                    return asJsBool(kl.fns.$eq(null, V3459))?((function () {
                  const Hyp = kl.fns.tl(V3439);
                    return (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.bind, [V3703, kl.fns.cons(kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [X, V3704]), kl.fns.cons(new Sym(":"), kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [A, V3704]), null))), kl.fns.cons(kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [Y, V3704]), kl.fns.cons(new Sym(":"), kl.fns.cons(kl.fns.cons(new Sym("list"), kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [A, V3704]), null)), null))), Kl.headCall(kl.fns.shen$dolazyderef, [Hyp, V3704]))), V3704, V3705]);
                    })();
                })()):(asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V3459]))?((function () {
                      Kl.headCall(kl.fns.shen$dobindv, [V3459, null, V3704]);
                      return (function () {
                  const Result = (function () {
                  const Hyp = kl.fns.tl(V3439);
                    return (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.bind, [V3703, kl.fns.cons(kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [X, V3704]), kl.fns.cons(new Sym(":"), kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [A, V3704]), null))), kl.fns.cons(kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [Y, V3704]), kl.fns.cons(new Sym(":"), kl.fns.cons(kl.fns.cons(new Sym("list"), kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [A, V3704]), null)), null))), Kl.headCall(kl.fns.shen$dolazyderef, [Hyp, V3704]))), V3704, V3705]);
                    })();
                })();
                    return (function () {
                      Kl.headCall(kl.fns.shen$dounbindv, [V3459, V3704]);
                      return Result;
                    })();
                })();
                    })()):(klFalse));
                })();
                    return (function () {
                      Kl.headCall(kl.fns.shen$dounbindv, [V3457, V3704]);
                      return Result;
                    })();
                })();
                    })()):(klFalse));
                })()):(asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V3456]))?((function () {
                  const A = Kl.headCall(kl.fns.shen$donewpv, [V3704]);
                    return (function () {
                      Kl.headCall(kl.fns.shen$dobindv, [V3456, kl.fns.cons(A, null), V3704]);
                      return (function () {
                  const Result = (function () {
                  const V3460 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3448), V3704]);
                    return asJsBool(kl.fns.$eq(null, V3460))?((function () {
                  const Hyp = kl.fns.tl(V3439);
                    return (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.bind, [V3703, kl.fns.cons(kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [X, V3704]), kl.fns.cons(new Sym(":"), kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [A, V3704]), null))), kl.fns.cons(kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [Y, V3704]), kl.fns.cons(new Sym(":"), kl.fns.cons(kl.fns.cons(new Sym("list"), kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [A, V3704]), null)), null))), Kl.headCall(kl.fns.shen$dolazyderef, [Hyp, V3704]))), V3704, V3705]);
                    })();
                })()):(asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V3460]))?((function () {
                      Kl.headCall(kl.fns.shen$dobindv, [V3460, null, V3704]);
                      return (function () {
                  const Result = (function () {
                  const Hyp = kl.fns.tl(V3439);
                    return (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.bind, [V3703, kl.fns.cons(kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [X, V3704]), kl.fns.cons(new Sym(":"), kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [A, V3704]), null))), kl.fns.cons(kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [Y, V3704]), kl.fns.cons(new Sym(":"), kl.fns.cons(kl.fns.cons(new Sym("list"), kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [A, V3704]), null)), null))), Kl.headCall(kl.fns.shen$dolazyderef, [Hyp, V3704]))), V3704, V3705]);
                    })();
                })();
                    return (function () {
                      Kl.headCall(kl.fns.shen$dounbindv, [V3460, V3704]);
                      return Result;
                    })();
                })();
                    })()):(klFalse));
                })();
                    return (function () {
                      Kl.headCall(kl.fns.shen$dounbindv, [V3456, V3704]);
                      return Result;
                    })();
                })();
                    })();
                })()):(klFalse));
                })();
                    return (function () {
                      Kl.headCall(kl.fns.shen$dounbindv, [V3450, V3704]);
                      return Result;
                    })();
                })();
                    })()):(klFalse));
                })()):(asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V3449]))?((function () {
                  const A = Kl.headCall(kl.fns.shen$donewpv, [V3704]);
                    return (function () {
                      Kl.headCall(kl.fns.shen$dobindv, [V3449, kl.fns.cons(new Sym("list"), kl.fns.cons(A, null)), V3704]);
                      return (function () {
                  const Result = (function () {
                  const V3461 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3448), V3704]);
                    return asJsBool(kl.fns.$eq(null, V3461))?((function () {
                  const Hyp = kl.fns.tl(V3439);
                    return (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.bind, [V3703, kl.fns.cons(kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [X, V3704]), kl.fns.cons(new Sym(":"), kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [A, V3704]), null))), kl.fns.cons(kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [Y, V3704]), kl.fns.cons(new Sym(":"), kl.fns.cons(kl.fns.cons(new Sym("list"), kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [A, V3704]), null)), null))), Kl.headCall(kl.fns.shen$dolazyderef, [Hyp, V3704]))), V3704, V3705]);
                    })();
                })()):(asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V3461]))?((function () {
                      Kl.headCall(kl.fns.shen$dobindv, [V3461, null, V3704]);
                      return (function () {
                  const Result = (function () {
                  const Hyp = kl.fns.tl(V3439);
                    return (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.bind, [V3703, kl.fns.cons(kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [X, V3704]), kl.fns.cons(new Sym(":"), kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [A, V3704]), null))), kl.fns.cons(kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [Y, V3704]), kl.fns.cons(new Sym(":"), kl.fns.cons(kl.fns.cons(new Sym("list"), kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [A, V3704]), null)), null))), Kl.headCall(kl.fns.shen$dolazyderef, [Hyp, V3704]))), V3704, V3705]);
                    })();
                })();
                    return (function () {
                      Kl.headCall(kl.fns.shen$dounbindv, [V3461, V3704]);
                      return Result;
                    })();
                })();
                    })()):(klFalse));
                })();
                    return (function () {
                      Kl.headCall(kl.fns.shen$dounbindv, [V3449, V3704]);
                      return Result;
                    })();
                })();
                    })();
                })()):(klFalse));
                })()):(klFalse);
                })()):(klFalse);
                })()):(klFalse);
                })()):(klFalse);
                })()):(klFalse);
                })()):(klFalse);
                })()):(klFalse);
                })()):(klFalse);
                })()):(klFalse);
                })()):(klFalse);
                })();
                    return asJsBool(kl.fns.$eq(Case, klFalse))?((function () {
                  const Case_1 = (function () {
                  const V3462 = Kl.headCall(kl.fns.shen$dolazyderef, [V3702, V3704]);
                    return asJsBool(kl.fns.cons$qu(V3462))?((function () {
                  const V3463 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.hd(V3462), V3704]);
                    return asJsBool(kl.fns.cons$qu(V3463))?((function () {
                  const V3464 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.hd(V3463), V3704]);
                    return asJsBool(kl.fns.cons$qu(V3464))?((function () {
                  const V3465 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.hd(V3464), V3704]);
                    return asJsBool(kl.fns.$eq(new Sym("@p"), V3465))?((function () {
                  const V3466 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3464), V3704]);
                    return asJsBool(kl.fns.cons$qu(V3466))?((function () {
                  const X = kl.fns.hd(V3466);
                    const V3467 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3466), V3704]);
                    return asJsBool(kl.fns.cons$qu(V3467))?((function () {
                  const Y = kl.fns.hd(V3467);
                    const V3468 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3467), V3704]);
                    return asJsBool(kl.fns.$eq(null, V3468))?((function () {
                  const V3469 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3463), V3704]);
                    return asJsBool(kl.fns.cons$qu(V3469))?((function () {
                  const V3470 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.hd(V3469), V3704]);
                    return asJsBool(kl.fns.$eq(new Sym(":"), V3470))?((function () {
                  const V3471 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3469), V3704]);
                    return asJsBool(kl.fns.cons$qu(V3471))?((function () {
                  const V3472 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.hd(V3471), V3704]);
                    return asJsBool(kl.fns.cons$qu(V3472))?((function () {
                  const A = kl.fns.hd(V3472);
                    const V3473 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3472), V3704]);
                    return asJsBool(kl.fns.cons$qu(V3473))?((function () {
                  const V3474 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.hd(V3473), V3704]);
                    return asJsBool(kl.fns.$eq(new Sym("*"), V3474))?((function () {
                  const V3475 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3473), V3704]);
                    return asJsBool(kl.fns.cons$qu(V3475))?((function () {
                  const B = kl.fns.hd(V3475);
                    const V3476 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3475), V3704]);
                    return asJsBool(kl.fns.$eq(null, V3476))?((function () {
                  const V3477 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3471), V3704]);
                    return asJsBool(kl.fns.$eq(null, V3477))?((function () {
                  const Hyp = kl.fns.tl(V3462);
                    return (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.bind, [V3703, kl.fns.cons(kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [X, V3704]), kl.fns.cons(new Sym(":"), kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [A, V3704]), null))), kl.fns.cons(kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [Y, V3704]), kl.fns.cons(new Sym(":"), kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [B, V3704]), null))), Kl.headCall(kl.fns.shen$dolazyderef, [Hyp, V3704]))), V3704, V3705]);
                    })();
                })()):(asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V3477]))?((function () {
                      Kl.headCall(kl.fns.shen$dobindv, [V3477, null, V3704]);
                      return (function () {
                  const Result = (function () {
                  const Hyp = kl.fns.tl(V3462);
                    return (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.bind, [V3703, kl.fns.cons(kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [X, V3704]), kl.fns.cons(new Sym(":"), kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [A, V3704]), null))), kl.fns.cons(kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [Y, V3704]), kl.fns.cons(new Sym(":"), kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [B, V3704]), null))), Kl.headCall(kl.fns.shen$dolazyderef, [Hyp, V3704]))), V3704, V3705]);
                    })();
                })();
                    return (function () {
                      Kl.headCall(kl.fns.shen$dounbindv, [V3477, V3704]);
                      return Result;
                    })();
                })();
                    })()):(klFalse));
                })()):(asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V3476]))?((function () {
                      Kl.headCall(kl.fns.shen$dobindv, [V3476, null, V3704]);
                      return (function () {
                  const Result = (function () {
                  const V3478 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3471), V3704]);
                    return asJsBool(kl.fns.$eq(null, V3478))?((function () {
                  const Hyp = kl.fns.tl(V3462);
                    return (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.bind, [V3703, kl.fns.cons(kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [X, V3704]), kl.fns.cons(new Sym(":"), kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [A, V3704]), null))), kl.fns.cons(kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [Y, V3704]), kl.fns.cons(new Sym(":"), kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [B, V3704]), null))), Kl.headCall(kl.fns.shen$dolazyderef, [Hyp, V3704]))), V3704, V3705]);
                    })();
                })()):(asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V3478]))?((function () {
                      Kl.headCall(kl.fns.shen$dobindv, [V3478, null, V3704]);
                      return (function () {
                  const Result = (function () {
                  const Hyp = kl.fns.tl(V3462);
                    return (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.bind, [V3703, kl.fns.cons(kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [X, V3704]), kl.fns.cons(new Sym(":"), kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [A, V3704]), null))), kl.fns.cons(kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [Y, V3704]), kl.fns.cons(new Sym(":"), kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [B, V3704]), null))), Kl.headCall(kl.fns.shen$dolazyderef, [Hyp, V3704]))), V3704, V3705]);
                    })();
                })();
                    return (function () {
                      Kl.headCall(kl.fns.shen$dounbindv, [V3478, V3704]);
                      return Result;
                    })();
                })();
                    })()):(klFalse));
                })();
                    return (function () {
                      Kl.headCall(kl.fns.shen$dounbindv, [V3476, V3704]);
                      return Result;
                    })();
                })();
                    })()):(klFalse));
                })()):(asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V3475]))?((function () {
                  const B = Kl.headCall(kl.fns.shen$donewpv, [V3704]);
                    return (function () {
                      Kl.headCall(kl.fns.shen$dobindv, [V3475, kl.fns.cons(B, null), V3704]);
                      return (function () {
                  const Result = (function () {
                  const V3479 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3471), V3704]);
                    return asJsBool(kl.fns.$eq(null, V3479))?((function () {
                  const Hyp = kl.fns.tl(V3462);
                    return (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.bind, [V3703, kl.fns.cons(kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [X, V3704]), kl.fns.cons(new Sym(":"), kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [A, V3704]), null))), kl.fns.cons(kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [Y, V3704]), kl.fns.cons(new Sym(":"), kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [B, V3704]), null))), Kl.headCall(kl.fns.shen$dolazyderef, [Hyp, V3704]))), V3704, V3705]);
                    })();
                })()):(asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V3479]))?((function () {
                      Kl.headCall(kl.fns.shen$dobindv, [V3479, null, V3704]);
                      return (function () {
                  const Result = (function () {
                  const Hyp = kl.fns.tl(V3462);
                    return (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.bind, [V3703, kl.fns.cons(kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [X, V3704]), kl.fns.cons(new Sym(":"), kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [A, V3704]), null))), kl.fns.cons(kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [Y, V3704]), kl.fns.cons(new Sym(":"), kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [B, V3704]), null))), Kl.headCall(kl.fns.shen$dolazyderef, [Hyp, V3704]))), V3704, V3705]);
                    })();
                })();
                    return (function () {
                      Kl.headCall(kl.fns.shen$dounbindv, [V3479, V3704]);
                      return Result;
                    })();
                })();
                    })()):(klFalse));
                })();
                    return (function () {
                      Kl.headCall(kl.fns.shen$dounbindv, [V3475, V3704]);
                      return Result;
                    })();
                })();
                    })();
                })()):(klFalse));
                })()):(asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V3474]))?((function () {
                      Kl.headCall(kl.fns.shen$dobindv, [V3474, new Sym("*"), V3704]);
                      return (function () {
                  const Result = (function () {
                  const V3480 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3473), V3704]);
                    return asJsBool(kl.fns.cons$qu(V3480))?((function () {
                  const B = kl.fns.hd(V3480);
                    const V3481 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3480), V3704]);
                    return asJsBool(kl.fns.$eq(null, V3481))?((function () {
                  const V3482 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3471), V3704]);
                    return asJsBool(kl.fns.$eq(null, V3482))?((function () {
                  const Hyp = kl.fns.tl(V3462);
                    return (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.bind, [V3703, kl.fns.cons(kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [X, V3704]), kl.fns.cons(new Sym(":"), kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [A, V3704]), null))), kl.fns.cons(kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [Y, V3704]), kl.fns.cons(new Sym(":"), kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [B, V3704]), null))), Kl.headCall(kl.fns.shen$dolazyderef, [Hyp, V3704]))), V3704, V3705]);
                    })();
                })()):(asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V3482]))?((function () {
                      Kl.headCall(kl.fns.shen$dobindv, [V3482, null, V3704]);
                      return (function () {
                  const Result = (function () {
                  const Hyp = kl.fns.tl(V3462);
                    return (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.bind, [V3703, kl.fns.cons(kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [X, V3704]), kl.fns.cons(new Sym(":"), kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [A, V3704]), null))), kl.fns.cons(kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [Y, V3704]), kl.fns.cons(new Sym(":"), kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [B, V3704]), null))), Kl.headCall(kl.fns.shen$dolazyderef, [Hyp, V3704]))), V3704, V3705]);
                    })();
                })();
                    return (function () {
                      Kl.headCall(kl.fns.shen$dounbindv, [V3482, V3704]);
                      return Result;
                    })();
                })();
                    })()):(klFalse));
                })()):(asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V3481]))?((function () {
                      Kl.headCall(kl.fns.shen$dobindv, [V3481, null, V3704]);
                      return (function () {
                  const Result = (function () {
                  const V3483 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3471), V3704]);
                    return asJsBool(kl.fns.$eq(null, V3483))?((function () {
                  const Hyp = kl.fns.tl(V3462);
                    return (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.bind, [V3703, kl.fns.cons(kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [X, V3704]), kl.fns.cons(new Sym(":"), kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [A, V3704]), null))), kl.fns.cons(kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [Y, V3704]), kl.fns.cons(new Sym(":"), kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [B, V3704]), null))), Kl.headCall(kl.fns.shen$dolazyderef, [Hyp, V3704]))), V3704, V3705]);
                    })();
                })()):(asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V3483]))?((function () {
                      Kl.headCall(kl.fns.shen$dobindv, [V3483, null, V3704]);
                      return (function () {
                  const Result = (function () {
                  const Hyp = kl.fns.tl(V3462);
                    return (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.bind, [V3703, kl.fns.cons(kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [X, V3704]), kl.fns.cons(new Sym(":"), kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [A, V3704]), null))), kl.fns.cons(kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [Y, V3704]), kl.fns.cons(new Sym(":"), kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [B, V3704]), null))), Kl.headCall(kl.fns.shen$dolazyderef, [Hyp, V3704]))), V3704, V3705]);
                    })();
                })();
                    return (function () {
                      Kl.headCall(kl.fns.shen$dounbindv, [V3483, V3704]);
                      return Result;
                    })();
                })();
                    })()):(klFalse));
                })();
                    return (function () {
                      Kl.headCall(kl.fns.shen$dounbindv, [V3481, V3704]);
                      return Result;
                    })();
                })();
                    })()):(klFalse));
                })()):(asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V3480]))?((function () {
                  const B = Kl.headCall(kl.fns.shen$donewpv, [V3704]);
                    return (function () {
                      Kl.headCall(kl.fns.shen$dobindv, [V3480, kl.fns.cons(B, null), V3704]);
                      return (function () {
                  const Result = (function () {
                  const V3484 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3471), V3704]);
                    return asJsBool(kl.fns.$eq(null, V3484))?((function () {
                  const Hyp = kl.fns.tl(V3462);
                    return (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.bind, [V3703, kl.fns.cons(kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [X, V3704]), kl.fns.cons(new Sym(":"), kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [A, V3704]), null))), kl.fns.cons(kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [Y, V3704]), kl.fns.cons(new Sym(":"), kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [B, V3704]), null))), Kl.headCall(kl.fns.shen$dolazyderef, [Hyp, V3704]))), V3704, V3705]);
                    })();
                })()):(asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V3484]))?((function () {
                      Kl.headCall(kl.fns.shen$dobindv, [V3484, null, V3704]);
                      return (function () {
                  const Result = (function () {
                  const Hyp = kl.fns.tl(V3462);
                    return (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.bind, [V3703, kl.fns.cons(kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [X, V3704]), kl.fns.cons(new Sym(":"), kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [A, V3704]), null))), kl.fns.cons(kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [Y, V3704]), kl.fns.cons(new Sym(":"), kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [B, V3704]), null))), Kl.headCall(kl.fns.shen$dolazyderef, [Hyp, V3704]))), V3704, V3705]);
                    })();
                })();
                    return (function () {
                      Kl.headCall(kl.fns.shen$dounbindv, [V3484, V3704]);
                      return Result;
                    })();
                })();
                    })()):(klFalse));
                })();
                    return (function () {
                      Kl.headCall(kl.fns.shen$dounbindv, [V3480, V3704]);
                      return Result;
                    })();
                })();
                    })();
                })()):(klFalse));
                })();
                    return (function () {
                      Kl.headCall(kl.fns.shen$dounbindv, [V3474, V3704]);
                      return Result;
                    })();
                })();
                    })()):(klFalse));
                })()):(asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V3473]))?((function () {
                  const B = Kl.headCall(kl.fns.shen$donewpv, [V3704]);
                    return (function () {
                      Kl.headCall(kl.fns.shen$dobindv, [V3473, kl.fns.cons(new Sym("*"), kl.fns.cons(B, null)), V3704]);
                      return (function () {
                  const Result = (function () {
                  const V3485 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3471), V3704]);
                    return asJsBool(kl.fns.$eq(null, V3485))?((function () {
                  const Hyp = kl.fns.tl(V3462);
                    return (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.bind, [V3703, kl.fns.cons(kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [X, V3704]), kl.fns.cons(new Sym(":"), kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [A, V3704]), null))), kl.fns.cons(kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [Y, V3704]), kl.fns.cons(new Sym(":"), kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [B, V3704]), null))), Kl.headCall(kl.fns.shen$dolazyderef, [Hyp, V3704]))), V3704, V3705]);
                    })();
                })()):(asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V3485]))?((function () {
                      Kl.headCall(kl.fns.shen$dobindv, [V3485, null, V3704]);
                      return (function () {
                  const Result = (function () {
                  const Hyp = kl.fns.tl(V3462);
                    return (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.bind, [V3703, kl.fns.cons(kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [X, V3704]), kl.fns.cons(new Sym(":"), kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [A, V3704]), null))), kl.fns.cons(kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [Y, V3704]), kl.fns.cons(new Sym(":"), kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [B, V3704]), null))), Kl.headCall(kl.fns.shen$dolazyderef, [Hyp, V3704]))), V3704, V3705]);
                    })();
                })();
                    return (function () {
                      Kl.headCall(kl.fns.shen$dounbindv, [V3485, V3704]);
                      return Result;
                    })();
                })();
                    })()):(klFalse));
                })();
                    return (function () {
                      Kl.headCall(kl.fns.shen$dounbindv, [V3473, V3704]);
                      return Result;
                    })();
                })();
                    })();
                })()):(klFalse));
                })()):(asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V3472]))?((function () {
                  const A = Kl.headCall(kl.fns.shen$donewpv, [V3704]);
                    const B = Kl.headCall(kl.fns.shen$donewpv, [V3704]);
                    return (function () {
                      Kl.headCall(kl.fns.shen$dobindv, [V3472, kl.fns.cons(A, kl.fns.cons(new Sym("*"), kl.fns.cons(B, null))), V3704]);
                      return (function () {
                  const Result = (function () {
                  const V3486 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3471), V3704]);
                    return asJsBool(kl.fns.$eq(null, V3486))?((function () {
                  const Hyp = kl.fns.tl(V3462);
                    return (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.bind, [V3703, kl.fns.cons(kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [X, V3704]), kl.fns.cons(new Sym(":"), kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [A, V3704]), null))), kl.fns.cons(kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [Y, V3704]), kl.fns.cons(new Sym(":"), kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [B, V3704]), null))), Kl.headCall(kl.fns.shen$dolazyderef, [Hyp, V3704]))), V3704, V3705]);
                    })();
                })()):(asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V3486]))?((function () {
                      Kl.headCall(kl.fns.shen$dobindv, [V3486, null, V3704]);
                      return (function () {
                  const Result = (function () {
                  const Hyp = kl.fns.tl(V3462);
                    return (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.bind, [V3703, kl.fns.cons(kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [X, V3704]), kl.fns.cons(new Sym(":"), kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [A, V3704]), null))), kl.fns.cons(kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [Y, V3704]), kl.fns.cons(new Sym(":"), kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [B, V3704]), null))), Kl.headCall(kl.fns.shen$dolazyderef, [Hyp, V3704]))), V3704, V3705]);
                    })();
                })();
                    return (function () {
                      Kl.headCall(kl.fns.shen$dounbindv, [V3486, V3704]);
                      return Result;
                    })();
                })();
                    })()):(klFalse));
                })();
                    return (function () {
                      Kl.headCall(kl.fns.shen$dounbindv, [V3472, V3704]);
                      return Result;
                    })();
                })();
                    })();
                })()):(klFalse));
                })()):(klFalse);
                })()):(klFalse);
                })()):(klFalse);
                })()):(klFalse);
                })()):(klFalse);
                })()):(klFalse);
                })()):(klFalse);
                })()):(klFalse);
                })()):(klFalse);
                })()):(klFalse);
                })();
                    return asJsBool(kl.fns.$eq(Case_1, klFalse))?((function () {
                  const Case_2 = (function () {
                  const V3487 = Kl.headCall(kl.fns.shen$dolazyderef, [V3702, V3704]);
                    return asJsBool(kl.fns.cons$qu(V3487))?((function () {
                  const V3488 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.hd(V3487), V3704]);
                    return asJsBool(kl.fns.cons$qu(V3488))?((function () {
                  const V3489 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.hd(V3488), V3704]);
                    return asJsBool(kl.fns.cons$qu(V3489))?((function () {
                  const V3490 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.hd(V3489), V3704]);
                    return asJsBool(kl.fns.$eq(new Sym("@v"), V3490))?((function () {
                  const V3491 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3489), V3704]);
                    return asJsBool(kl.fns.cons$qu(V3491))?((function () {
                  const X = kl.fns.hd(V3491);
                    const V3492 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3491), V3704]);
                    return asJsBool(kl.fns.cons$qu(V3492))?((function () {
                  const Y = kl.fns.hd(V3492);
                    const V3493 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3492), V3704]);
                    return asJsBool(kl.fns.$eq(null, V3493))?((function () {
                  const V3494 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3488), V3704]);
                    return asJsBool(kl.fns.cons$qu(V3494))?((function () {
                  const V3495 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.hd(V3494), V3704]);
                    return asJsBool(kl.fns.$eq(new Sym(":"), V3495))?((function () {
                  const V3496 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3494), V3704]);
                    return asJsBool(kl.fns.cons$qu(V3496))?((function () {
                  const V3497 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.hd(V3496), V3704]);
                    return asJsBool(kl.fns.cons$qu(V3497))?((function () {
                  const V3498 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.hd(V3497), V3704]);
                    return asJsBool(kl.fns.$eq(new Sym("vector"), V3498))?((function () {
                  const V3499 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3497), V3704]);
                    return asJsBool(kl.fns.cons$qu(V3499))?((function () {
                  const A = kl.fns.hd(V3499);
                    const V3500 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3499), V3704]);
                    return asJsBool(kl.fns.$eq(null, V3500))?((function () {
                  const V3501 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3496), V3704]);
                    return asJsBool(kl.fns.$eq(null, V3501))?((function () {
                  const Hyp = kl.fns.tl(V3487);
                    return (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.bind, [V3703, kl.fns.cons(kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [X, V3704]), kl.fns.cons(new Sym(":"), kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [A, V3704]), null))), kl.fns.cons(kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [Y, V3704]), kl.fns.cons(new Sym(":"), kl.fns.cons(kl.fns.cons(new Sym("vector"), kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [A, V3704]), null)), null))), Kl.headCall(kl.fns.shen$dolazyderef, [Hyp, V3704]))), V3704, V3705]);
                    })();
                })()):(asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V3501]))?((function () {
                      Kl.headCall(kl.fns.shen$dobindv, [V3501, null, V3704]);
                      return (function () {
                  const Result = (function () {
                  const Hyp = kl.fns.tl(V3487);
                    return (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.bind, [V3703, kl.fns.cons(kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [X, V3704]), kl.fns.cons(new Sym(":"), kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [A, V3704]), null))), kl.fns.cons(kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [Y, V3704]), kl.fns.cons(new Sym(":"), kl.fns.cons(kl.fns.cons(new Sym("vector"), kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [A, V3704]), null)), null))), Kl.headCall(kl.fns.shen$dolazyderef, [Hyp, V3704]))), V3704, V3705]);
                    })();
                })();
                    return (function () {
                      Kl.headCall(kl.fns.shen$dounbindv, [V3501, V3704]);
                      return Result;
                    })();
                })();
                    })()):(klFalse));
                })()):(asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V3500]))?((function () {
                      Kl.headCall(kl.fns.shen$dobindv, [V3500, null, V3704]);
                      return (function () {
                  const Result = (function () {
                  const V3502 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3496), V3704]);
                    return asJsBool(kl.fns.$eq(null, V3502))?((function () {
                  const Hyp = kl.fns.tl(V3487);
                    return (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.bind, [V3703, kl.fns.cons(kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [X, V3704]), kl.fns.cons(new Sym(":"), kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [A, V3704]), null))), kl.fns.cons(kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [Y, V3704]), kl.fns.cons(new Sym(":"), kl.fns.cons(kl.fns.cons(new Sym("vector"), kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [A, V3704]), null)), null))), Kl.headCall(kl.fns.shen$dolazyderef, [Hyp, V3704]))), V3704, V3705]);
                    })();
                })()):(asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V3502]))?((function () {
                      Kl.headCall(kl.fns.shen$dobindv, [V3502, null, V3704]);
                      return (function () {
                  const Result = (function () {
                  const Hyp = kl.fns.tl(V3487);
                    return (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.bind, [V3703, kl.fns.cons(kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [X, V3704]), kl.fns.cons(new Sym(":"), kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [A, V3704]), null))), kl.fns.cons(kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [Y, V3704]), kl.fns.cons(new Sym(":"), kl.fns.cons(kl.fns.cons(new Sym("vector"), kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [A, V3704]), null)), null))), Kl.headCall(kl.fns.shen$dolazyderef, [Hyp, V3704]))), V3704, V3705]);
                    })();
                })();
                    return (function () {
                      Kl.headCall(kl.fns.shen$dounbindv, [V3502, V3704]);
                      return Result;
                    })();
                })();
                    })()):(klFalse));
                })();
                    return (function () {
                      Kl.headCall(kl.fns.shen$dounbindv, [V3500, V3704]);
                      return Result;
                    })();
                })();
                    })()):(klFalse));
                })()):(asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V3499]))?((function () {
                  const A = Kl.headCall(kl.fns.shen$donewpv, [V3704]);
                    return (function () {
                      Kl.headCall(kl.fns.shen$dobindv, [V3499, kl.fns.cons(A, null), V3704]);
                      return (function () {
                  const Result = (function () {
                  const V3503 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3496), V3704]);
                    return asJsBool(kl.fns.$eq(null, V3503))?((function () {
                  const Hyp = kl.fns.tl(V3487);
                    return (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.bind, [V3703, kl.fns.cons(kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [X, V3704]), kl.fns.cons(new Sym(":"), kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [A, V3704]), null))), kl.fns.cons(kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [Y, V3704]), kl.fns.cons(new Sym(":"), kl.fns.cons(kl.fns.cons(new Sym("vector"), kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [A, V3704]), null)), null))), Kl.headCall(kl.fns.shen$dolazyderef, [Hyp, V3704]))), V3704, V3705]);
                    })();
                })()):(asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V3503]))?((function () {
                      Kl.headCall(kl.fns.shen$dobindv, [V3503, null, V3704]);
                      return (function () {
                  const Result = (function () {
                  const Hyp = kl.fns.tl(V3487);
                    return (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.bind, [V3703, kl.fns.cons(kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [X, V3704]), kl.fns.cons(new Sym(":"), kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [A, V3704]), null))), kl.fns.cons(kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [Y, V3704]), kl.fns.cons(new Sym(":"), kl.fns.cons(kl.fns.cons(new Sym("vector"), kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [A, V3704]), null)), null))), Kl.headCall(kl.fns.shen$dolazyderef, [Hyp, V3704]))), V3704, V3705]);
                    })();
                })();
                    return (function () {
                      Kl.headCall(kl.fns.shen$dounbindv, [V3503, V3704]);
                      return Result;
                    })();
                })();
                    })()):(klFalse));
                })();
                    return (function () {
                      Kl.headCall(kl.fns.shen$dounbindv, [V3499, V3704]);
                      return Result;
                    })();
                })();
                    })();
                })()):(klFalse));
                })()):(asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V3498]))?((function () {
                      Kl.headCall(kl.fns.shen$dobindv, [V3498, new Sym("vector"), V3704]);
                      return (function () {
                  const Result = (function () {
                  const V3504 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3497), V3704]);
                    return asJsBool(kl.fns.cons$qu(V3504))?((function () {
                  const A = kl.fns.hd(V3504);
                    const V3505 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3504), V3704]);
                    return asJsBool(kl.fns.$eq(null, V3505))?((function () {
                  const V3506 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3496), V3704]);
                    return asJsBool(kl.fns.$eq(null, V3506))?((function () {
                  const Hyp = kl.fns.tl(V3487);
                    return (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.bind, [V3703, kl.fns.cons(kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [X, V3704]), kl.fns.cons(new Sym(":"), kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [A, V3704]), null))), kl.fns.cons(kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [Y, V3704]), kl.fns.cons(new Sym(":"), kl.fns.cons(kl.fns.cons(new Sym("vector"), kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [A, V3704]), null)), null))), Kl.headCall(kl.fns.shen$dolazyderef, [Hyp, V3704]))), V3704, V3705]);
                    })();
                })()):(asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V3506]))?((function () {
                      Kl.headCall(kl.fns.shen$dobindv, [V3506, null, V3704]);
                      return (function () {
                  const Result = (function () {
                  const Hyp = kl.fns.tl(V3487);
                    return (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.bind, [V3703, kl.fns.cons(kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [X, V3704]), kl.fns.cons(new Sym(":"), kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [A, V3704]), null))), kl.fns.cons(kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [Y, V3704]), kl.fns.cons(new Sym(":"), kl.fns.cons(kl.fns.cons(new Sym("vector"), kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [A, V3704]), null)), null))), Kl.headCall(kl.fns.shen$dolazyderef, [Hyp, V3704]))), V3704, V3705]);
                    })();
                })();
                    return (function () {
                      Kl.headCall(kl.fns.shen$dounbindv, [V3506, V3704]);
                      return Result;
                    })();
                })();
                    })()):(klFalse));
                })()):(asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V3505]))?((function () {
                      Kl.headCall(kl.fns.shen$dobindv, [V3505, null, V3704]);
                      return (function () {
                  const Result = (function () {
                  const V3507 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3496), V3704]);
                    return asJsBool(kl.fns.$eq(null, V3507))?((function () {
                  const Hyp = kl.fns.tl(V3487);
                    return (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.bind, [V3703, kl.fns.cons(kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [X, V3704]), kl.fns.cons(new Sym(":"), kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [A, V3704]), null))), kl.fns.cons(kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [Y, V3704]), kl.fns.cons(new Sym(":"), kl.fns.cons(kl.fns.cons(new Sym("vector"), kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [A, V3704]), null)), null))), Kl.headCall(kl.fns.shen$dolazyderef, [Hyp, V3704]))), V3704, V3705]);
                    })();
                })()):(asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V3507]))?((function () {
                      Kl.headCall(kl.fns.shen$dobindv, [V3507, null, V3704]);
                      return (function () {
                  const Result = (function () {
                  const Hyp = kl.fns.tl(V3487);
                    return (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.bind, [V3703, kl.fns.cons(kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [X, V3704]), kl.fns.cons(new Sym(":"), kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [A, V3704]), null))), kl.fns.cons(kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [Y, V3704]), kl.fns.cons(new Sym(":"), kl.fns.cons(kl.fns.cons(new Sym("vector"), kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [A, V3704]), null)), null))), Kl.headCall(kl.fns.shen$dolazyderef, [Hyp, V3704]))), V3704, V3705]);
                    })();
                })();
                    return (function () {
                      Kl.headCall(kl.fns.shen$dounbindv, [V3507, V3704]);
                      return Result;
                    })();
                })();
                    })()):(klFalse));
                })();
                    return (function () {
                      Kl.headCall(kl.fns.shen$dounbindv, [V3505, V3704]);
                      return Result;
                    })();
                })();
                    })()):(klFalse));
                })()):(asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V3504]))?((function () {
                  const A = Kl.headCall(kl.fns.shen$donewpv, [V3704]);
                    return (function () {
                      Kl.headCall(kl.fns.shen$dobindv, [V3504, kl.fns.cons(A, null), V3704]);
                      return (function () {
                  const Result = (function () {
                  const V3508 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3496), V3704]);
                    return asJsBool(kl.fns.$eq(null, V3508))?((function () {
                  const Hyp = kl.fns.tl(V3487);
                    return (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.bind, [V3703, kl.fns.cons(kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [X, V3704]), kl.fns.cons(new Sym(":"), kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [A, V3704]), null))), kl.fns.cons(kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [Y, V3704]), kl.fns.cons(new Sym(":"), kl.fns.cons(kl.fns.cons(new Sym("vector"), kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [A, V3704]), null)), null))), Kl.headCall(kl.fns.shen$dolazyderef, [Hyp, V3704]))), V3704, V3705]);
                    })();
                })()):(asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V3508]))?((function () {
                      Kl.headCall(kl.fns.shen$dobindv, [V3508, null, V3704]);
                      return (function () {
                  const Result = (function () {
                  const Hyp = kl.fns.tl(V3487);
                    return (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.bind, [V3703, kl.fns.cons(kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [X, V3704]), kl.fns.cons(new Sym(":"), kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [A, V3704]), null))), kl.fns.cons(kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [Y, V3704]), kl.fns.cons(new Sym(":"), kl.fns.cons(kl.fns.cons(new Sym("vector"), kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [A, V3704]), null)), null))), Kl.headCall(kl.fns.shen$dolazyderef, [Hyp, V3704]))), V3704, V3705]);
                    })();
                })();
                    return (function () {
                      Kl.headCall(kl.fns.shen$dounbindv, [V3508, V3704]);
                      return Result;
                    })();
                })();
                    })()):(klFalse));
                })();
                    return (function () {
                      Kl.headCall(kl.fns.shen$dounbindv, [V3504, V3704]);
                      return Result;
                    })();
                })();
                    })();
                })()):(klFalse));
                })();
                    return (function () {
                      Kl.headCall(kl.fns.shen$dounbindv, [V3498, V3704]);
                      return Result;
                    })();
                })();
                    })()):(klFalse));
                })()):(asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V3497]))?((function () {
                  const A = Kl.headCall(kl.fns.shen$donewpv, [V3704]);
                    return (function () {
                      Kl.headCall(kl.fns.shen$dobindv, [V3497, kl.fns.cons(new Sym("vector"), kl.fns.cons(A, null)), V3704]);
                      return (function () {
                  const Result = (function () {
                  const V3509 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3496), V3704]);
                    return asJsBool(kl.fns.$eq(null, V3509))?((function () {
                  const Hyp = kl.fns.tl(V3487);
                    return (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.bind, [V3703, kl.fns.cons(kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [X, V3704]), kl.fns.cons(new Sym(":"), kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [A, V3704]), null))), kl.fns.cons(kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [Y, V3704]), kl.fns.cons(new Sym(":"), kl.fns.cons(kl.fns.cons(new Sym("vector"), kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [A, V3704]), null)), null))), Kl.headCall(kl.fns.shen$dolazyderef, [Hyp, V3704]))), V3704, V3705]);
                    })();
                })()):(asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V3509]))?((function () {
                      Kl.headCall(kl.fns.shen$dobindv, [V3509, null, V3704]);
                      return (function () {
                  const Result = (function () {
                  const Hyp = kl.fns.tl(V3487);
                    return (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.bind, [V3703, kl.fns.cons(kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [X, V3704]), kl.fns.cons(new Sym(":"), kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [A, V3704]), null))), kl.fns.cons(kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [Y, V3704]), kl.fns.cons(new Sym(":"), kl.fns.cons(kl.fns.cons(new Sym("vector"), kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [A, V3704]), null)), null))), Kl.headCall(kl.fns.shen$dolazyderef, [Hyp, V3704]))), V3704, V3705]);
                    })();
                })();
                    return (function () {
                      Kl.headCall(kl.fns.shen$dounbindv, [V3509, V3704]);
                      return Result;
                    })();
                })();
                    })()):(klFalse));
                })();
                    return (function () {
                      Kl.headCall(kl.fns.shen$dounbindv, [V3497, V3704]);
                      return Result;
                    })();
                })();
                    })();
                })()):(klFalse));
                })()):(klFalse);
                })()):(klFalse);
                })()):(klFalse);
                })()):(klFalse);
                })()):(klFalse);
                })()):(klFalse);
                })()):(klFalse);
                })()):(klFalse);
                })()):(klFalse);
                })()):(klFalse);
                })();
                    return asJsBool(kl.fns.$eq(Case_2, klFalse))?((function () {
                  const Case_3 = (function () {
                  const V3510 = Kl.headCall(kl.fns.shen$dolazyderef, [V3702, V3704]);
                    return asJsBool(kl.fns.cons$qu(V3510))?((function () {
                  const V3511 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.hd(V3510), V3704]);
                    return asJsBool(kl.fns.cons$qu(V3511))?((function () {
                  const V3512 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.hd(V3511), V3704]);
                    return asJsBool(kl.fns.cons$qu(V3512))?((function () {
                  const V3513 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.hd(V3512), V3704]);
                    return asJsBool(kl.fns.$eq(new Sym("@s"), V3513))?((function () {
                  const V3514 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3512), V3704]);
                    return asJsBool(kl.fns.cons$qu(V3514))?((function () {
                  const X = kl.fns.hd(V3514);
                    const V3515 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3514), V3704]);
                    return asJsBool(kl.fns.cons$qu(V3515))?((function () {
                  const Y = kl.fns.hd(V3515);
                    const V3516 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3515), V3704]);
                    return asJsBool(kl.fns.$eq(null, V3516))?((function () {
                  const V3517 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3511), V3704]);
                    return asJsBool(kl.fns.cons$qu(V3517))?((function () {
                  const V3518 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.hd(V3517), V3704]);
                    return asJsBool(kl.fns.$eq(new Sym(":"), V3518))?((function () {
                  const V3519 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3517), V3704]);
                    return asJsBool(kl.fns.cons$qu(V3519))?((function () {
                  const V3520 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.hd(V3519), V3704]);
                    return asJsBool(kl.fns.$eq(new Sym("string"), V3520))?((function () {
                  const V3521 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3519), V3704]);
                    return asJsBool(kl.fns.$eq(null, V3521))?((function () {
                  const Hyp = kl.fns.tl(V3510);
                    return (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.bind, [V3703, kl.fns.cons(kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [X, V3704]), kl.fns.cons(new Sym(":"), kl.fns.cons(new Sym("string"), null))), kl.fns.cons(kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [Y, V3704]), kl.fns.cons(new Sym(":"), kl.fns.cons(new Sym("string"), null))), Kl.headCall(kl.fns.shen$dolazyderef, [Hyp, V3704]))), V3704, V3705]);
                    })();
                })()):(asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V3521]))?((function () {
                      Kl.headCall(kl.fns.shen$dobindv, [V3521, null, V3704]);
                      return (function () {
                  const Result = (function () {
                  const Hyp = kl.fns.tl(V3510);
                    return (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.bind, [V3703, kl.fns.cons(kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [X, V3704]), kl.fns.cons(new Sym(":"), kl.fns.cons(new Sym("string"), null))), kl.fns.cons(kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [Y, V3704]), kl.fns.cons(new Sym(":"), kl.fns.cons(new Sym("string"), null))), Kl.headCall(kl.fns.shen$dolazyderef, [Hyp, V3704]))), V3704, V3705]);
                    })();
                })();
                    return (function () {
                      Kl.headCall(kl.fns.shen$dounbindv, [V3521, V3704]);
                      return Result;
                    })();
                })();
                    })()):(klFalse));
                })()):(asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V3520]))?((function () {
                      Kl.headCall(kl.fns.shen$dobindv, [V3520, new Sym("string"), V3704]);
                      return (function () {
                  const Result = (function () {
                  const V3522 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3519), V3704]);
                    return asJsBool(kl.fns.$eq(null, V3522))?((function () {
                  const Hyp = kl.fns.tl(V3510);
                    return (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.bind, [V3703, kl.fns.cons(kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [X, V3704]), kl.fns.cons(new Sym(":"), kl.fns.cons(new Sym("string"), null))), kl.fns.cons(kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [Y, V3704]), kl.fns.cons(new Sym(":"), kl.fns.cons(new Sym("string"), null))), Kl.headCall(kl.fns.shen$dolazyderef, [Hyp, V3704]))), V3704, V3705]);
                    })();
                })()):(asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V3522]))?((function () {
                      Kl.headCall(kl.fns.shen$dobindv, [V3522, null, V3704]);
                      return (function () {
                  const Result = (function () {
                  const Hyp = kl.fns.tl(V3510);
                    return (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.bind, [V3703, kl.fns.cons(kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [X, V3704]), kl.fns.cons(new Sym(":"), kl.fns.cons(new Sym("string"), null))), kl.fns.cons(kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [Y, V3704]), kl.fns.cons(new Sym(":"), kl.fns.cons(new Sym("string"), null))), Kl.headCall(kl.fns.shen$dolazyderef, [Hyp, V3704]))), V3704, V3705]);
                    })();
                })();
                    return (function () {
                      Kl.headCall(kl.fns.shen$dounbindv, [V3522, V3704]);
                      return Result;
                    })();
                })();
                    })()):(klFalse));
                })();
                    return (function () {
                      Kl.headCall(kl.fns.shen$dounbindv, [V3520, V3704]);
                      return Result;
                    })();
                })();
                    })()):(klFalse));
                })()):(klFalse);
                })()):(klFalse);
                })()):(klFalse);
                })()):(klFalse);
                })()):(klFalse);
                })()):(klFalse);
                })()):(klFalse);
                })()):(klFalse);
                })()):(klFalse);
                })()):(klFalse);
                })();
                    return asJsBool(kl.fns.$eq(Case_3, klFalse))?((function () {
                  const V3523 = Kl.headCall(kl.fns.shen$dolazyderef, [V3702, V3704]);
                    return asJsBool(kl.fns.cons$qu(V3523))?((function () {
                  const X = kl.fns.hd(V3523);
                    const Hyp = kl.fns.tl(V3523);
                    const NewHyps = Kl.headCall(kl.fns.shen$donewpv, [V3704]);
                    return (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.tailCall(kl.fns.bind, [V3703, kl.fns.cons(Kl.headCall(kl.fns.shen$dolazyderef, [X, V3704]), Kl.headCall(kl.fns.shen$dolazyderef, [NewHyps, V3704])), V3704, Kl.setArity("shen.t*-hyps_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.shen$dot$st_hyps, [Hyp, NewHyps, V3704, V3705]);
                    })]);
                    })();
                })()):(klFalse);
                })()):(Case_3);
                })()):(Case_2);
                })()):(Case_1);
                })()):(Case);
                })();
                    });

kl.defun("shen.show", 4, function (V3722, V3723, V3724, V3725) {
                      return asJsBool(kl.fns.value(new Sym("shen.*spy*")))?((function () {
                      Kl.headCall(kl.fns.shen$doline, []);
Kl.headCall(kl.fns.shen$doshow_p, [Kl.headCall(kl.fns.shen$doderef, [V3722, V3724])]);
Kl.headCall(kl.fns.nl, [1]);
Kl.headCall(kl.fns.nl, [1]);
Kl.headCall(kl.fns.shen$doshow_assumptions, [Kl.headCall(kl.fns.shen$doderef, [V3723, V3724]), 1]);
Kl.headCall(kl.fns.shen$doprhush, ["\n> ", Kl.headCall(kl.fns.stoutput, [])]);
Kl.headCall(kl.fns.shen$dopause_for_user, []);
                      return Kl.tailCall(kl.fns.thaw, [V3725]);
                    })()):(Kl.tailCall(kl.fns.thaw, [V3725]));
                    });

kl.defun("shen.line", 0, function () {
                      return (function () {
                  const Infs = Kl.headCall(kl.fns.inferences, []);
                    return Kl.tailCall(kl.fns.shen$doprhush, [kl.fns.cn("____________________________________________________________ ", Kl.headCall(kl.fns.shen$doapp, [Infs, kl.fns.cn(" inference", Kl.headCall(kl.fns.shen$doapp, [asJsBool(kl.fns.$eq(1, Infs))?(""):("s"), " \n?- ", new Sym("shen.a")])), new Sym("shen.a")])), Kl.headCall(kl.fns.stoutput, [])]);
                })();
                    });

kl.defun("shen.show-p", 1, function (V3727) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V3727)) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V3727))) && asJsBool(kl.fns.$eq(new Sym(":"), kl.fns.hd(kl.fns.tl(V3727)))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(V3727)))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.tl(V3727)))))))?(Kl.tailCall(kl.fns.shen$doprhush, [Kl.headCall(kl.fns.shen$doapp, [kl.fns.hd(V3727), kl.fns.cn(" : ", Kl.headCall(kl.fns.shen$doapp, [kl.fns.hd(kl.fns.tl(kl.fns.tl(V3727))), "", new Sym("shen.r")])), new Sym("shen.r")]), Kl.headCall(kl.fns.stoutput, [])])):(Kl.tailCall(kl.fns.shen$doprhush, [Kl.headCall(kl.fns.shen$doapp, [V3727, "", new Sym("shen.r")]), Kl.headCall(kl.fns.stoutput, [])]));
                    });

kl.defun("shen.show-assumptions", 2, function (V3732, V3733) {
                      return asJsBool(kl.fns.$eq(null, V3732))?(new Sym("shen.skip")):(asJsBool(kl.fns.cons$qu(V3732))?((function () {
                      Kl.headCall(kl.fns.shen$doprhush, [Kl.headCall(kl.fns.shen$doapp, [V3733, ". ", new Sym("shen.a")]), Kl.headCall(kl.fns.stoutput, [])]);
Kl.headCall(kl.fns.shen$doshow_p, [kl.fns.hd(V3732)]);
Kl.headCall(kl.fns.nl, [1]);
                      return Kl.tailCall(kl.fns.shen$doshow_assumptions, [kl.fns.tl(V3732), kl.fns.$pl(V3733, 1)]);
                    })()):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.show-assumptions")])));
                    });

kl.defun("shen.pause-for-user", 0, function () {
                      return (function () {
                  const Byte = kl.fns.read_byte(Kl.headCall(kl.fns.stinput, []));
                    return asJsBool(kl.fns.$eq(Byte, 94))?(kl.fns.simple_error("input aborted\n")):(Kl.tailCall(kl.fns.nl, [1]));
                })();
                    });

kl.defun("shen.typedf?", 1, function (V3735) {
                      return kl.fns.cons$qu(Kl.headCall(kl.fns.assoc, [V3735, kl.fns.value(new Sym("shen.*signedfuncs*"))]));
                    });

kl.defun("shen.sigf", 1, function (V3737) {
                      return Kl.tailCall(kl.fns.concat, [new Sym("shen.type-signature-of-"), V3737]);
                    });

kl.defun("shen.placeholder", 0, function () {
                      return Kl.tailCall(kl.fns.gensym, [new Sym("&&")]);
                    });

kl.defun("shen.base", 4, function (V3742, V3743, V3744, V3745) {
                      return (function () {
                  const Case = (function () {
                  const V3426 = Kl.headCall(kl.fns.shen$dolazyderef, [V3743, V3744]);
                    return asJsBool(kl.fns.$eq(new Sym("number"), V3426))?((function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.fwhen, [kl.fns.number$qu(Kl.headCall(kl.fns.shen$dolazyderef, [V3742, V3744])), V3744, V3745]);
                    })()):(asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V3426]))?((function () {
                      Kl.headCall(kl.fns.shen$dobindv, [V3426, new Sym("number"), V3744]);
                      return (function () {
                  const Result = (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.fwhen, [kl.fns.number$qu(Kl.headCall(kl.fns.shen$dolazyderef, [V3742, V3744])), V3744, V3745]);
                    })();
                    return (function () {
                      Kl.headCall(kl.fns.shen$dounbindv, [V3426, V3744]);
                      return Result;
                    })();
                })();
                    })()):(klFalse));
                })();
                    return asJsBool(kl.fns.$eq(Case, klFalse))?((function () {
                  const Case_1 = (function () {
                  const V3427 = Kl.headCall(kl.fns.shen$dolazyderef, [V3743, V3744]);
                    return asJsBool(kl.fns.$eq(new Sym("boolean"), V3427))?((function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.fwhen, [Kl.headCall(kl.fns.boolean$qu, [Kl.headCall(kl.fns.shen$dolazyderef, [V3742, V3744])]), V3744, V3745]);
                    })()):(asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V3427]))?((function () {
                      Kl.headCall(kl.fns.shen$dobindv, [V3427, new Sym("boolean"), V3744]);
                      return (function () {
                  const Result = (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.fwhen, [Kl.headCall(kl.fns.boolean$qu, [Kl.headCall(kl.fns.shen$dolazyderef, [V3742, V3744])]), V3744, V3745]);
                    })();
                    return (function () {
                      Kl.headCall(kl.fns.shen$dounbindv, [V3427, V3744]);
                      return Result;
                    })();
                })();
                    })()):(klFalse));
                })();
                    return asJsBool(kl.fns.$eq(Case_1, klFalse))?((function () {
                  const Case_2 = (function () {
                  const V3428 = Kl.headCall(kl.fns.shen$dolazyderef, [V3743, V3744]);
                    return asJsBool(kl.fns.$eq(new Sym("string"), V3428))?((function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.fwhen, [kl.fns.string$qu(Kl.headCall(kl.fns.shen$dolazyderef, [V3742, V3744])), V3744, V3745]);
                    })()):(asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V3428]))?((function () {
                      Kl.headCall(kl.fns.shen$dobindv, [V3428, new Sym("string"), V3744]);
                      return (function () {
                  const Result = (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.fwhen, [kl.fns.string$qu(Kl.headCall(kl.fns.shen$dolazyderef, [V3742, V3744])), V3744, V3745]);
                    })();
                    return (function () {
                      Kl.headCall(kl.fns.shen$dounbindv, [V3428, V3744]);
                      return Result;
                    })();
                })();
                    })()):(klFalse));
                })();
                    return asJsBool(kl.fns.$eq(Case_2, klFalse))?((function () {
                  const Case_3 = (function () {
                  const V3429 = Kl.headCall(kl.fns.shen$dolazyderef, [V3743, V3744]);
                    return asJsBool(kl.fns.$eq(new Sym("symbol"), V3429))?((function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.fwhen, [Kl.headCall(kl.fns.symbol$qu, [Kl.headCall(kl.fns.shen$dolazyderef, [V3742, V3744])]), V3744, Kl.setArity("shen.base_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.fwhen, [Kl.headCall(kl.fns.not, [Kl.headCall(kl.fns.shen$doue$qu, [Kl.headCall(kl.fns.shen$dolazyderef, [V3742, V3744])])]), V3744, V3745]);
                    })]);
                    })()):(asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V3429]))?((function () {
                      Kl.headCall(kl.fns.shen$dobindv, [V3429, new Sym("symbol"), V3744]);
                      return (function () {
                  const Result = (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.fwhen, [Kl.headCall(kl.fns.symbol$qu, [Kl.headCall(kl.fns.shen$dolazyderef, [V3742, V3744])]), V3744, Kl.setArity("shen.base_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.fwhen, [Kl.headCall(kl.fns.not, [Kl.headCall(kl.fns.shen$doue$qu, [Kl.headCall(kl.fns.shen$dolazyderef, [V3742, V3744])])]), V3744, V3745]);
                    })]);
                    })();
                    return (function () {
                      Kl.headCall(kl.fns.shen$dounbindv, [V3429, V3744]);
                      return Result;
                    })();
                })();
                    })()):(klFalse));
                })();
                    return asJsBool(kl.fns.$eq(Case_3, klFalse))?((function () {
                  const V3430 = Kl.headCall(kl.fns.shen$dolazyderef, [V3742, V3744]);
                    return asJsBool(kl.fns.$eq(null, V3430))?((function () {
                  const V3431 = Kl.headCall(kl.fns.shen$dolazyderef, [V3743, V3744]);
                    return asJsBool(kl.fns.cons$qu(V3431))?((function () {
                  const V3432 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.hd(V3431), V3744]);
                    return asJsBool(kl.fns.$eq(new Sym("list"), V3432))?((function () {
                  const V3433 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3431), V3744]);
                    return asJsBool(kl.fns.cons$qu(V3433))?((function () {
                  const A = kl.fns.hd(V3433);
                    const V3434 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3433), V3744]);
                    return asJsBool(kl.fns.$eq(null, V3434))?((function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.tailCall(kl.fns.thaw, [V3745]);
                    })()):(asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V3434]))?((function () {
                      Kl.headCall(kl.fns.shen$dobindv, [V3434, null, V3744]);
                      return (function () {
                  const Result = (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.thaw, [V3745]);
                    })();
                    return (function () {
                      Kl.headCall(kl.fns.shen$dounbindv, [V3434, V3744]);
                      return Result;
                    })();
                })();
                    })()):(klFalse));
                })()):(asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V3433]))?((function () {
                  const A = Kl.headCall(kl.fns.shen$donewpv, [V3744]);
                    return (function () {
                      Kl.headCall(kl.fns.shen$dobindv, [V3433, kl.fns.cons(A, null), V3744]);
                      return (function () {
                  const Result = (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.thaw, [V3745]);
                    })();
                    return (function () {
                      Kl.headCall(kl.fns.shen$dounbindv, [V3433, V3744]);
                      return Result;
                    })();
                })();
                    })();
                })()):(klFalse));
                })()):(asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V3432]))?((function () {
                      Kl.headCall(kl.fns.shen$dobindv, [V3432, new Sym("list"), V3744]);
                      return (function () {
                  const Result = (function () {
                  const V3435 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3431), V3744]);
                    return asJsBool(kl.fns.cons$qu(V3435))?((function () {
                  const A = kl.fns.hd(V3435);
                    const V3436 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3435), V3744]);
                    return asJsBool(kl.fns.$eq(null, V3436))?((function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.thaw, [V3745]);
                    })()):(asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V3436]))?((function () {
                      Kl.headCall(kl.fns.shen$dobindv, [V3436, null, V3744]);
                      return (function () {
                  const Result = (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.thaw, [V3745]);
                    })();
                    return (function () {
                      Kl.headCall(kl.fns.shen$dounbindv, [V3436, V3744]);
                      return Result;
                    })();
                })();
                    })()):(klFalse));
                })()):(asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V3435]))?((function () {
                  const A = Kl.headCall(kl.fns.shen$donewpv, [V3744]);
                    return (function () {
                      Kl.headCall(kl.fns.shen$dobindv, [V3435, kl.fns.cons(A, null), V3744]);
                      return (function () {
                  const Result = (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.thaw, [V3745]);
                    })();
                    return (function () {
                      Kl.headCall(kl.fns.shen$dounbindv, [V3435, V3744]);
                      return Result;
                    })();
                })();
                    })();
                })()):(klFalse));
                })();
                    return (function () {
                      Kl.headCall(kl.fns.shen$dounbindv, [V3432, V3744]);
                      return Result;
                    })();
                })();
                    })()):(klFalse));
                })()):(asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V3431]))?((function () {
                  const A = Kl.headCall(kl.fns.shen$donewpv, [V3744]);
                    return (function () {
                      Kl.headCall(kl.fns.shen$dobindv, [V3431, kl.fns.cons(new Sym("list"), kl.fns.cons(A, null)), V3744]);
                      return (function () {
                  const Result = (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.thaw, [V3745]);
                    })();
                    return (function () {
                      Kl.headCall(kl.fns.shen$dounbindv, [V3431, V3744]);
                      return Result;
                    })();
                })();
                    })();
                })()):(klFalse));
                })()):(klFalse);
                })()):(Case_3);
                })()):(Case_2);
                })()):(Case_1);
                })()):(Case);
                })();
                    });

kl.defun("shen.by_hypothesis", 5, function (V3751, V3752, V3753, V3754, V3755) {
                      return (function () {
                  const Case = (function () {
                  const V3417 = Kl.headCall(kl.fns.shen$dolazyderef, [V3753, V3754]);
                    return asJsBool(kl.fns.cons$qu(V3417))?((function () {
                  const V3418 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.hd(V3417), V3754]);
                    return asJsBool(kl.fns.cons$qu(V3418))?((function () {
                  const Y = kl.fns.hd(V3418);
                    const V3419 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3418), V3754]);
                    return asJsBool(kl.fns.cons$qu(V3419))?((function () {
                  const V3420 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.hd(V3419), V3754]);
                    return asJsBool(kl.fns.$eq(new Sym(":"), V3420))?((function () {
                  const V3421 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3419), V3754]);
                    return asJsBool(kl.fns.cons$qu(V3421))?((function () {
                  const B = kl.fns.hd(V3421);
                    const V3422 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3421), V3754]);
                    return asJsBool(kl.fns.$eq(null, V3422))?((function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.identical, [V3751, Y, V3754, Kl.setArity("shen.by_hypothesis_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.unify$ex, [V3752, B, V3754, V3755]);
                    })]);
                    })()):(klFalse);
                })()):(klFalse);
                })()):(klFalse);
                })()):(klFalse);
                })()):(klFalse);
                })()):(klFalse);
                })();
                    return asJsBool(kl.fns.$eq(Case, klFalse))?((function () {
                  const V3423 = Kl.headCall(kl.fns.shen$dolazyderef, [V3753, V3754]);
                    return asJsBool(kl.fns.cons$qu(V3423))?((function () {
                  const Hyp = kl.fns.tl(V3423);
                    return (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.tailCall(kl.fns.shen$doby$unhypothesis, [V3751, V3752, Hyp, V3754, V3755]);
                    })();
                })()):(klFalse);
                })()):(Case);
                })();
                    });

kl.defun("shen.t*-def", 5, function (V3761, V3762, V3763, V3764, V3765) {
                      return (function () {
                  const V3411 = Kl.headCall(kl.fns.shen$dolazyderef, [V3761, V3764]);
                    return asJsBool(kl.fns.cons$qu(V3411))?((function () {
                  const V3412 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.hd(V3411), V3764]);
                    return asJsBool(kl.fns.$eq(new Sym("define"), V3412))?((function () {
                  const V3413 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3411), V3764]);
                    return asJsBool(kl.fns.cons$qu(V3413))?((function () {
                  const F = kl.fns.hd(V3413);
                    const X = kl.fns.tl(V3413);
                    const Y = Kl.headCall(kl.fns.shen$donewpv, [V3764]);
                    const E = Kl.headCall(kl.fns.shen$donewpv, [V3764]);
                    return (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.tailCall(kl.fns.shen$dot$st_defh, [Kl.headCall(kl.fns.compile, [Kl.setArity("shen.t*-def_lambda", 1, function (Y_1) {
                      return Kl.tailCall(kl.fns.shen$do$ltsig$plrules$gt, [Y_1]);
                    }), X, Kl.setArity("shen.t*-def_lambda", 1, function (E_1) {
                      return asJsBool(kl.fns.cons$qu(E_1))?(kl.fns.simple_error(kl.fns.cn("parse error here: ", Kl.headCall(kl.fns.shen$doapp, [E_1, "\n", new Sym("shen.s")])))):(kl.fns.simple_error("parse error\n"));
                    })]), F, V3762, V3763, V3764, V3765]);
                    })();
                })()):(klFalse);
                })()):(klFalse);
                })()):(klFalse);
                })();
                    });

kl.defun("shen.t*-defh", 6, function (V3772, V3773, V3774, V3775, V3776, V3777) {
                      return (function () {
                  const V3407 = Kl.headCall(kl.fns.shen$dolazyderef, [V3772, V3776]);
                    return asJsBool(kl.fns.cons$qu(V3407))?((function () {
                  const Sig = kl.fns.hd(V3407);
                    const Rules = kl.fns.tl(V3407);
                    return (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.tailCall(kl.fns.shen$dot$st_defhh, [Sig, Kl.headCall(kl.fns.shen$doue_sig, [Sig]), V3773, V3774, V3775, Rules, V3776, V3777]);
                    })();
                })()):(klFalse);
                })();
                    });

kl.defun("shen.t*-defhh", 8, function (V3786, V3787, V3788, V3789, V3790, V3791, V3792, V3793) {
                      return (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.tailCall(kl.fns.shen$dot$st_rules, [V3791, V3787, 1, V3788, kl.fns.cons(kl.fns.cons(V3788, kl.fns.cons(new Sym(":"), kl.fns.cons(V3787, null))), V3790), V3792, Kl.setArity("shen.t*-defhh_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.shen$domemo, [V3788, V3786, V3789, V3792, V3793]);
                    })]);
                    })();
                    });

kl.defun("shen.memo", 5, function (V3799, V3800, V3801, V3802, V3803) {
                      return (function () {
                  const Jnk = Kl.headCall(kl.fns.shen$donewpv, [V3802]);
                    return (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.tailCall(kl.fns.unify$ex, [V3801, V3800, V3802, Kl.setArity("shen.memo_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.bind, [Jnk, Kl.headCall(kl.fns.declare, [Kl.headCall(kl.fns.shen$dolazyderef, [V3799, V3802]), Kl.headCall(kl.fns.shen$dolazyderef, [V3801, V3802])]), V3802, V3803]);
                    })]);
                    })();
                })();
                    });

kl.defun("shen.<sig+rules>", 1, function (V3805) {
                      return (function () {
                  const Parse$unshen$do$ltsignature$gt = Kl.headCall(kl.fns.shen$do$ltsignature$gt, [V3805]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltsignature$gt)]))?((function () {
                  const Parse$unshen$do$ltnon_ll_rules$gt = Kl.headCall(kl.fns.shen$do$ltnon_ll_rules$gt, [Parse$unshen$do$ltsignature$gt]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltnon_ll_rules$gt)]))?(Kl.tailCall(kl.fns.shen$dopair, [kl.fns.hd(Parse$unshen$do$ltnon_ll_rules$gt), kl.fns.cons(Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltsignature$gt]), Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltnon_ll_rules$gt]))])):(Kl.tailCall(kl.fns.fail, []));
                })()):(Kl.tailCall(kl.fns.fail, []));
                })();
                    });

kl.defun("shen.<non-ll-rules>", 1, function (V3807) {
                      return (function () {
                  const YaccParse = (function () {
                  const Parse$unshen$do$ltrule$gt = Kl.headCall(kl.fns.shen$do$ltrule$gt, [V3807]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltrule$gt)]))?((function () {
                  const Parse$unshen$do$ltnon_ll_rules$gt = Kl.headCall(kl.fns.shen$do$ltnon_ll_rules$gt, [Parse$unshen$do$ltrule$gt]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltnon_ll_rules$gt)]))?(Kl.headCall(kl.fns.shen$dopair, [kl.fns.hd(Parse$unshen$do$ltnon_ll_rules$gt), kl.fns.cons(Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltrule$gt]), Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltnon_ll_rules$gt]))])):(Kl.headCall(kl.fns.fail, []));
                })()):(Kl.headCall(kl.fns.fail, []));
                })();
                    return asJsBool(kl.fns.$eq(YaccParse, Kl.headCall(kl.fns.fail, [])))?((function () {
                  const Parse$unshen$do$ltrule$gt = Kl.headCall(kl.fns.shen$do$ltrule$gt, [V3807]);
                    return asJsBool(Kl.headCall(kl.fns.not, [kl.fns.$eq(Kl.headCall(kl.fns.fail, []), Parse$unshen$do$ltrule$gt)]))?(Kl.tailCall(kl.fns.shen$dopair, [kl.fns.hd(Parse$unshen$do$ltrule$gt), kl.fns.cons(Kl.headCall(kl.fns.shen$dohdtl, [Parse$unshen$do$ltrule$gt]), null)])):(Kl.tailCall(kl.fns.fail, []));
                })()):(YaccParse);
                })();
                    });

kl.defun("shen.ue", 1, function (V3809) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V3809)) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V3809))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(V3809)))) && asJsBool(kl.fns.$eq(kl.fns.hd(V3809), new Sym("protect")))))?(V3809):(asJsBool(kl.fns.cons$qu(V3809))?(Kl.tailCall(kl.fns.map, [Kl.setArity("shen.ue_lambda", 1, function (Z) {
                      return Kl.tailCall(kl.fns.shen$doue, [Z]);
                    }), V3809])):(asJsBool(Kl.headCall(kl.fns.variable$qu, [V3809]))?(Kl.tailCall(kl.fns.concat, [new Sym("&&"), V3809])):(V3809)));
                    });

kl.defun("shen.ue-sig", 1, function (V3811) {
                      return asJsBool(kl.fns.cons$qu(V3811))?(Kl.tailCall(kl.fns.map, [Kl.setArity("shen.ue-sig_lambda", 1, function (Z) {
                      return Kl.tailCall(kl.fns.shen$doue_sig, [Z]);
                    }), V3811])):(asJsBool(Kl.headCall(kl.fns.variable$qu, [V3811]))?(Kl.tailCall(kl.fns.concat, [new Sym("&&&"), V3811])):(V3811));
                    });

kl.defun("shen.ues", 1, function (V3817) {
                      return asJsBool(Kl.headCall(kl.fns.shen$doue$qu, [V3817]))?(kl.fns.cons(V3817, null)):(asJsBool(kl.fns.cons$qu(V3817))?(Kl.tailCall(kl.fns.union, [Kl.headCall(kl.fns.shen$doues, [kl.fns.hd(V3817)]), Kl.headCall(kl.fns.shen$doues, [kl.fns.tl(V3817)])])):(null));
                    });

kl.defun("shen.ue?", 1, function (V3819) {
                      return asKlBool(asJsBool(Kl.headCall(kl.fns.symbol$qu, [V3819])) && asJsBool(Kl.headCall(kl.fns.shen$doue_h$qu, [kl.fns.str(V3819)])));
                    });

kl.defun("shen.ue-h?", 1, function (V3827) {
                      return asJsBool(asKlBool(asJsBool(Kl.headCall(kl.fns.shen$do$plstring$qu, [V3827])) && asJsBool(kl.fns.$eq("&", kl.fns.pos(V3827, 0))) && asJsBool(Kl.headCall(kl.fns.shen$do$plstring$qu, [kl.fns.tlstr(V3827)])) && asJsBool(kl.fns.$eq("&", kl.fns.pos(kl.fns.tlstr(V3827), 0)))))?(klTrue):(klFalse);
                    });

kl.defun("shen.t*-rules", 7, function (V3835, V3836, V3837, V3838, V3839, V3840, V3841) {
                      return (function () {
                  const Throwcontrol = Kl.headCall(kl.fns.shen$docatchpoint, []);
                    return Kl.tailCall(kl.fns.shen$docutpoint, [Throwcontrol, (function () {
                  const Case = (function () {
                  const V3391 = Kl.headCall(kl.fns.shen$dolazyderef, [V3835, V3840]);
                    return asJsBool(kl.fns.$eq(null, V3391))?((function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.thaw, [V3841]);
                    })()):(klFalse);
                })();
                    return asJsBool(kl.fns.$eq(Case, klFalse))?((function () {
                  const Case_1 = (function () {
                  const V3392 = Kl.headCall(kl.fns.shen$dolazyderef, [V3835, V3840]);
                    return asJsBool(kl.fns.cons$qu(V3392))?((function () {
                  const Rule = kl.fns.hd(V3392);
                    const Rules = kl.fns.tl(V3392);
                    return (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.shen$dot$st_rule, [Kl.headCall(kl.fns.shen$doue, [Rule]), V3836, V3839, V3840, Kl.setArity("shen.t*-rules_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.cut, [Throwcontrol, V3840, Kl.setArity("shen.t*-rules_freeze_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.shen$dot$st_rules, [Rules, V3836, kl.fns.$pl(V3837, 1), V3838, V3839, V3840, V3841]);
                    })]);
                    })]);
                    })();
                })()):(klFalse);
                })();
                    return asJsBool(kl.fns.$eq(Case_1, klFalse))?((function () {
                  const Err = Kl.headCall(kl.fns.shen$donewpv, [V3840]);
                    return (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.bind, [Err, kl.fns.simple_error(kl.fns.cn("type error in rule ", Kl.headCall(kl.fns.shen$doapp, [Kl.headCall(kl.fns.shen$dolazyderef, [V3837, V3840]), kl.fns.cn(" of ", Kl.headCall(kl.fns.shen$doapp, [Kl.headCall(kl.fns.shen$dolazyderef, [V3838, V3840]), "", new Sym("shen.a")])), new Sym("shen.a")]))), V3840, V3841]);
                    })();
                })()):(Case_1);
                })()):(Case);
                })()]);
                })();
                    });

kl.defun("shen.t*-rule", 5, function (V3847, V3848, V3849, V3850, V3851) {
                      return (function () {
                  const Throwcontrol = Kl.headCall(kl.fns.shen$docatchpoint, []);
                    return Kl.tailCall(kl.fns.shen$docutpoint, [Throwcontrol, (function () {
                  const V3383 = Kl.headCall(kl.fns.shen$dolazyderef, [V3847, V3850]);
                    return asJsBool(kl.fns.cons$qu(V3383))?((function () {
                  const Patterns = kl.fns.hd(V3383);
                    const V3384 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3383), V3850]);
                    return asJsBool(kl.fns.cons$qu(V3384))?((function () {
                  const Action = kl.fns.hd(V3384);
                    const V3385 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3384), V3850]);
                    return asJsBool(kl.fns.$eq(null, V3385))?((function () {
                  const NewHyps = Kl.headCall(kl.fns.shen$donewpv, [V3850]);
                    return (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.shen$donewhyps, [Kl.headCall(kl.fns.shen$doplaceholders, [Patterns]), V3849, NewHyps, V3850, Kl.setArity("shen.t*-rule_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.shen$dot$st_patterns, [Patterns, V3848, NewHyps, V3850, Kl.setArity("shen.t*-rule_freeze_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.cut, [Throwcontrol, V3850, Kl.setArity("shen.t*-rule_freeze_freeze_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.shen$dot$st_action, [Kl.headCall(kl.fns.shen$docurry, [Kl.headCall(kl.fns.shen$doue, [Action])]), Kl.headCall(kl.fns.shen$doresult_type, [Patterns, V3848]), Kl.headCall(kl.fns.shen$dopatthyps, [Patterns, V3848, V3849]), V3850, V3851]);
                    })]);
                    })]);
                    })]);
                    })();
                })()):(klFalse);
                })()):(klFalse);
                })()):(klFalse);
                })()]);
                })();
                    });

kl.defun("shen.placeholders", 1, function (V3857) {
                      return asJsBool(Kl.headCall(kl.fns.shen$doue$qu, [V3857]))?(kl.fns.cons(V3857, null)):(asJsBool(kl.fns.cons$qu(V3857))?(Kl.tailCall(kl.fns.union, [Kl.headCall(kl.fns.shen$doplaceholders, [kl.fns.hd(V3857)]), Kl.headCall(kl.fns.shen$doplaceholders, [kl.fns.tl(V3857)])])):(null));
                    });

kl.defun("shen.newhyps", 5, function (V3863, V3864, V3865, V3866, V3867) {
                      return (function () {
                  const Case = (function () {
                  const V3370 = Kl.headCall(kl.fns.shen$dolazyderef, [V3863, V3866]);
                    return asJsBool(kl.fns.$eq(null, V3370))?((function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.unify$ex, [V3865, V3864, V3866, V3867]);
                    })()):(klFalse);
                })();
                    return asJsBool(kl.fns.$eq(Case, klFalse))?((function () {
                  const V3371 = Kl.headCall(kl.fns.shen$dolazyderef, [V3863, V3866]);
                    return asJsBool(kl.fns.cons$qu(V3371))?((function () {
                  const V3366 = kl.fns.hd(V3371);
                    const Vs = kl.fns.tl(V3371);
                    const V3372 = Kl.headCall(kl.fns.shen$dolazyderef, [V3865, V3866]);
                    return asJsBool(kl.fns.cons$qu(V3372))?((function () {
                  const V3373 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.hd(V3372), V3866]);
                    return asJsBool(kl.fns.cons$qu(V3373))?((function () {
                  const V = kl.fns.hd(V3373);
                    const V3374 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3373), V3866]);
                    return asJsBool(kl.fns.cons$qu(V3374))?((function () {
                  const V3375 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.hd(V3374), V3866]);
                    return asJsBool(kl.fns.$eq(new Sym(":"), V3375))?((function () {
                  const V3376 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3374), V3866]);
                    return asJsBool(kl.fns.cons$qu(V3376))?((function () {
                  const A = kl.fns.hd(V3376);
                    const V3377 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3376), V3866]);
                    return asJsBool(kl.fns.$eq(null, V3377))?((function () {
                  const NewHyp = kl.fns.tl(V3372);
                    return (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.tailCall(kl.fns.unify$ex, [V, V3366, V3866, Kl.setArity("shen.newhyps_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.shen$donewhyps, [Vs, V3864, NewHyp, V3866, V3867]);
                    })]);
                    })();
                })()):(asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V3377]))?((function () {
                      Kl.headCall(kl.fns.shen$dobindv, [V3377, null, V3866]);
                      return (function () {
                  const Result = (function () {
                  const NewHyp = kl.fns.tl(V3372);
                    return (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.unify$ex, [V, V3366, V3866, Kl.setArity("shen.newhyps_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.shen$donewhyps, [Vs, V3864, NewHyp, V3866, V3867]);
                    })]);
                    })();
                })();
                    return (function () {
                      Kl.headCall(kl.fns.shen$dounbindv, [V3377, V3866]);
                      return Result;
                    })();
                })();
                    })()):(klFalse));
                })()):(asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V3376]))?((function () {
                  const A = Kl.headCall(kl.fns.shen$donewpv, [V3866]);
                    return (function () {
                      Kl.headCall(kl.fns.shen$dobindv, [V3376, kl.fns.cons(A, null), V3866]);
                      return (function () {
                  const Result = (function () {
                  const NewHyp = kl.fns.tl(V3372);
                    return (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.unify$ex, [V, V3366, V3866, Kl.setArity("shen.newhyps_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.shen$donewhyps, [Vs, V3864, NewHyp, V3866, V3867]);
                    })]);
                    })();
                })();
                    return (function () {
                      Kl.headCall(kl.fns.shen$dounbindv, [V3376, V3866]);
                      return Result;
                    })();
                })();
                    })();
                })()):(klFalse));
                })()):(asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V3375]))?((function () {
                      Kl.headCall(kl.fns.shen$dobindv, [V3375, new Sym(":"), V3866]);
                      return (function () {
                  const Result = (function () {
                  const V3378 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3374), V3866]);
                    return asJsBool(kl.fns.cons$qu(V3378))?((function () {
                  const A = kl.fns.hd(V3378);
                    const V3379 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3378), V3866]);
                    return asJsBool(kl.fns.$eq(null, V3379))?((function () {
                  const NewHyp = kl.fns.tl(V3372);
                    return (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.unify$ex, [V, V3366, V3866, Kl.setArity("shen.newhyps_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.shen$donewhyps, [Vs, V3864, NewHyp, V3866, V3867]);
                    })]);
                    })();
                })()):(asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V3379]))?((function () {
                      Kl.headCall(kl.fns.shen$dobindv, [V3379, null, V3866]);
                      return (function () {
                  const Result = (function () {
                  const NewHyp = kl.fns.tl(V3372);
                    return (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.unify$ex, [V, V3366, V3866, Kl.setArity("shen.newhyps_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.shen$donewhyps, [Vs, V3864, NewHyp, V3866, V3867]);
                    })]);
                    })();
                })();
                    return (function () {
                      Kl.headCall(kl.fns.shen$dounbindv, [V3379, V3866]);
                      return Result;
                    })();
                })();
                    })()):(klFalse));
                })()):(asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V3378]))?((function () {
                  const A = Kl.headCall(kl.fns.shen$donewpv, [V3866]);
                    return (function () {
                      Kl.headCall(kl.fns.shen$dobindv, [V3378, kl.fns.cons(A, null), V3866]);
                      return (function () {
                  const Result = (function () {
                  const NewHyp = kl.fns.tl(V3372);
                    return (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.unify$ex, [V, V3366, V3866, Kl.setArity("shen.newhyps_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.shen$donewhyps, [Vs, V3864, NewHyp, V3866, V3867]);
                    })]);
                    })();
                })();
                    return (function () {
                      Kl.headCall(kl.fns.shen$dounbindv, [V3378, V3866]);
                      return Result;
                    })();
                })();
                    })();
                })()):(klFalse));
                })();
                    return (function () {
                      Kl.headCall(kl.fns.shen$dounbindv, [V3375, V3866]);
                      return Result;
                    })();
                })();
                    })()):(klFalse));
                })()):(asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V3374]))?((function () {
                  const A = Kl.headCall(kl.fns.shen$donewpv, [V3866]);
                    return (function () {
                      Kl.headCall(kl.fns.shen$dobindv, [V3374, kl.fns.cons(new Sym(":"), kl.fns.cons(A, null)), V3866]);
                      return (function () {
                  const Result = (function () {
                  const NewHyp = kl.fns.tl(V3372);
                    return (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.unify$ex, [V, V3366, V3866, Kl.setArity("shen.newhyps_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.shen$donewhyps, [Vs, V3864, NewHyp, V3866, V3867]);
                    })]);
                    })();
                })();
                    return (function () {
                      Kl.headCall(kl.fns.shen$dounbindv, [V3374, V3866]);
                      return Result;
                    })();
                })();
                    })();
                })()):(klFalse));
                })()):(asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V3373]))?((function () {
                  const V = Kl.headCall(kl.fns.shen$donewpv, [V3866]);
                    const A = Kl.headCall(kl.fns.shen$donewpv, [V3866]);
                    return (function () {
                      Kl.headCall(kl.fns.shen$dobindv, [V3373, kl.fns.cons(V, kl.fns.cons(new Sym(":"), kl.fns.cons(A, null))), V3866]);
                      return (function () {
                  const Result = (function () {
                  const NewHyp = kl.fns.tl(V3372);
                    return (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.unify$ex, [V, V3366, V3866, Kl.setArity("shen.newhyps_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.shen$donewhyps, [Vs, V3864, NewHyp, V3866, V3867]);
                    })]);
                    })();
                })();
                    return (function () {
                      Kl.headCall(kl.fns.shen$dounbindv, [V3373, V3866]);
                      return Result;
                    })();
                })();
                    })();
                })()):(klFalse));
                })()):(asJsBool(Kl.headCall(kl.fns.shen$dopvar$qu, [V3372]))?((function () {
                  const V = Kl.headCall(kl.fns.shen$donewpv, [V3866]);
                    const A = Kl.headCall(kl.fns.shen$donewpv, [V3866]);
                    const NewHyp = Kl.headCall(kl.fns.shen$donewpv, [V3866]);
                    return (function () {
                      Kl.headCall(kl.fns.shen$dobindv, [V3372, kl.fns.cons(kl.fns.cons(V, kl.fns.cons(new Sym(":"), kl.fns.cons(A, null))), NewHyp), V3866]);
                      return (function () {
                  const Result = (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.unify$ex, [V, V3366, V3866, Kl.setArity("shen.newhyps_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.shen$donewhyps, [Vs, V3864, NewHyp, V3866, V3867]);
                    })]);
                    })();
                    return (function () {
                      Kl.headCall(kl.fns.shen$dounbindv, [V3372, V3866]);
                      return Result;
                    })();
                })();
                    })();
                })()):(klFalse));
                })()):(klFalse);
                })()):(Case);
                })();
                    });

kl.defun("shen.patthyps", 3, function (V3873, V3874, V3875) {
                      return asJsBool(kl.fns.$eq(null, V3873))?(V3875):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V3873)) && asJsBool(kl.fns.cons$qu(V3874)) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V3874))) && asJsBool(kl.fns.$eq(new Sym("-->"), kl.fns.hd(kl.fns.tl(V3874)))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(V3874)))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.tl(V3874)))))))?(Kl.tailCall(kl.fns.adjoin, [kl.fns.cons(kl.fns.hd(V3873), kl.fns.cons(new Sym(":"), kl.fns.cons(kl.fns.hd(V3874), null))), Kl.headCall(kl.fns.shen$dopatthyps, [kl.fns.tl(V3873), kl.fns.hd(kl.fns.tl(kl.fns.tl(V3874))), V3875])])):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.patthyps")])));
                    });

kl.defun("shen.result-type", 2, function (V3882, V3883) {
                      return asJsBool(asKlBool(asJsBool(kl.fns.$eq(null, V3882)) && asJsBool(kl.fns.cons$qu(V3883)) && asJsBool(kl.fns.$eq(new Sym("-->"), kl.fns.hd(V3883))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V3883))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(V3883))))))?(kl.fns.hd(kl.fns.tl(V3883))):(asJsBool(kl.fns.$eq(null, V3882))?(V3883):(asJsBool(asKlBool(asJsBool(kl.fns.cons$qu(V3882)) && asJsBool(kl.fns.cons$qu(V3883)) && asJsBool(kl.fns.cons$qu(kl.fns.tl(V3883))) && asJsBool(kl.fns.$eq(new Sym("-->"), kl.fns.hd(kl.fns.tl(V3883)))) && asJsBool(kl.fns.cons$qu(kl.fns.tl(kl.fns.tl(V3883)))) && asJsBool(kl.fns.$eq(null, kl.fns.tl(kl.fns.tl(kl.fns.tl(V3883)))))))?(Kl.tailCall(kl.fns.shen$doresult_type, [kl.fns.tl(V3882), kl.fns.hd(kl.fns.tl(kl.fns.tl(V3883)))])):(Kl.tailCall(kl.fns.shen$dof$unerror, [new Sym("shen.result-type")]))));
                    });

kl.defun("shen.t*-patterns", 5, function (V3889, V3890, V3891, V3892, V3893) {
                      return (function () {
                  const Case = (function () {
                  const V3358 = Kl.headCall(kl.fns.shen$dolazyderef, [V3889, V3892]);
                    return asJsBool(kl.fns.$eq(null, V3358))?((function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.thaw, [V3893]);
                    })()):(klFalse);
                })();
                    return asJsBool(kl.fns.$eq(Case, klFalse))?((function () {
                  const V3359 = Kl.headCall(kl.fns.shen$dolazyderef, [V3889, V3892]);
                    return asJsBool(kl.fns.cons$qu(V3359))?((function () {
                  const Pattern = kl.fns.hd(V3359);
                    const Patterns = kl.fns.tl(V3359);
                    const V3360 = Kl.headCall(kl.fns.shen$dolazyderef, [V3890, V3892]);
                    return asJsBool(kl.fns.cons$qu(V3360))?((function () {
                  const A = kl.fns.hd(V3360);
                    const V3361 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3360), V3892]);
                    return asJsBool(kl.fns.cons$qu(V3361))?((function () {
                  const V3362 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.hd(V3361), V3892]);
                    return asJsBool(kl.fns.$eq(new Sym("-->"), V3362))?((function () {
                  const V3363 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3361), V3892]);
                    return asJsBool(kl.fns.cons$qu(V3363))?((function () {
                  const B = kl.fns.hd(V3363);
                    const V3364 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3363), V3892]);
                    return asJsBool(kl.fns.$eq(null, V3364))?((function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.tailCall(kl.fns.shen$dot$st, [kl.fns.cons(Pattern, kl.fns.cons(new Sym(":"), kl.fns.cons(A, null))), V3891, V3892, Kl.setArity("shen.t*-patterns_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.shen$dot$st_patterns, [Patterns, B, V3891, V3892, V3893]);
                    })]);
                    })()):(klFalse);
                })()):(klFalse);
                })()):(klFalse);
                })()):(klFalse);
                })()):(klFalse);
                })()):(klFalse);
                })()):(Case);
                })();
                    });

kl.defun("shen.t*-action", 5, function (V3899, V3900, V3901, V3902, V3903) {
                      return (function () {
                  const Throwcontrol = Kl.headCall(kl.fns.shen$docatchpoint, []);
                    return Kl.tailCall(kl.fns.shen$docutpoint, [Throwcontrol, (function () {
                  const Case = (function () {
                  const V3335 = Kl.headCall(kl.fns.shen$dolazyderef, [V3899, V3902]);
                    return asJsBool(kl.fns.cons$qu(V3335))?((function () {
                  const V3336 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.hd(V3335), V3902]);
                    return asJsBool(kl.fns.$eq(new Sym("where"), V3336))?((function () {
                  const V3337 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3335), V3902]);
                    return asJsBool(kl.fns.cons$qu(V3337))?((function () {
                  const P = kl.fns.hd(V3337);
                    const V3338 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3337), V3902]);
                    return asJsBool(kl.fns.cons$qu(V3338))?((function () {
                  const Action = kl.fns.hd(V3338);
                    const V3339 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3338), V3902]);
                    return asJsBool(kl.fns.$eq(null, V3339))?((function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.cut, [Throwcontrol, V3902, Kl.setArity("shen.t*-action_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.shen$dot$st, [kl.fns.cons(P, kl.fns.cons(new Sym(":"), kl.fns.cons(new Sym("boolean"), null))), V3901, V3902, Kl.setArity("shen.t*-action_freeze_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.cut, [Throwcontrol, V3902, Kl.setArity("shen.t*-action_freeze_freeze_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.shen$dot$st_action, [Action, V3900, kl.fns.cons(kl.fns.cons(P, kl.fns.cons(new Sym(":"), kl.fns.cons(new Sym("verified"), null))), V3901), V3902, V3903]);
                    })]);
                    })]);
                    })]);
                    })()):(klFalse);
                })()):(klFalse);
                })()):(klFalse);
                })()):(klFalse);
                })()):(klFalse);
                })();
                    return asJsBool(kl.fns.$eq(Case, klFalse))?((function () {
                  const Case_1 = (function () {
                  const V3340 = Kl.headCall(kl.fns.shen$dolazyderef, [V3899, V3902]);
                    return asJsBool(kl.fns.cons$qu(V3340))?((function () {
                  const V3341 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.hd(V3340), V3902]);
                    return asJsBool(kl.fns.$eq(new Sym("shen.choicepoint!"), V3341))?((function () {
                  const V3342 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3340), V3902]);
                    return asJsBool(kl.fns.cons$qu(V3342))?((function () {
                  const V3343 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.hd(V3342), V3902]);
                    return asJsBool(kl.fns.cons$qu(V3343))?((function () {
                  const V3344 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.hd(V3343), V3902]);
                    return asJsBool(kl.fns.cons$qu(V3344))?((function () {
                  const V3345 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.hd(V3344), V3902]);
                    return asJsBool(kl.fns.$eq(new Sym("fail-if"), V3345))?((function () {
                  const V3346 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3344), V3902]);
                    return asJsBool(kl.fns.cons$qu(V3346))?((function () {
                  const F = kl.fns.hd(V3346);
                    const V3347 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3346), V3902]);
                    return asJsBool(kl.fns.$eq(null, V3347))?((function () {
                  const V3348 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3343), V3902]);
                    return asJsBool(kl.fns.cons$qu(V3348))?((function () {
                  const Action = kl.fns.hd(V3348);
                    const V3349 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3348), V3902]);
                    return asJsBool(kl.fns.$eq(null, V3349))?((function () {
                  const V3350 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3342), V3902]);
                    return asJsBool(kl.fns.$eq(null, V3350))?((function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.cut, [Throwcontrol, V3902, Kl.setArity("shen.t*-action_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.shen$dot$st_action, [kl.fns.cons(new Sym("where"), kl.fns.cons(kl.fns.cons(new Sym("not"), kl.fns.cons(kl.fns.cons(F, kl.fns.cons(Action, null)), null)), kl.fns.cons(Action, null))), V3900, V3901, V3902, V3903]);
                    })]);
                    })()):(klFalse);
                })()):(klFalse);
                })()):(klFalse);
                })()):(klFalse);
                })()):(klFalse);
                })()):(klFalse);
                })()):(klFalse);
                })()):(klFalse);
                })()):(klFalse);
                })()):(klFalse);
                })()):(klFalse);
                })();
                    return asJsBool(kl.fns.$eq(Case_1, klFalse))?((function () {
                  const Case_2 = (function () {
                  const V3351 = Kl.headCall(kl.fns.shen$dolazyderef, [V3899, V3902]);
                    return asJsBool(kl.fns.cons$qu(V3351))?((function () {
                  const V3352 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.hd(V3351), V3902]);
                    return asJsBool(kl.fns.$eq(new Sym("shen.choicepoint!"), V3352))?((function () {
                  const V3353 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3351), V3902]);
                    return asJsBool(kl.fns.cons$qu(V3353))?((function () {
                  const Action = kl.fns.hd(V3353);
                    const V3354 = Kl.headCall(kl.fns.shen$dolazyderef, [kl.fns.tl(V3353), V3902]);
                    return asJsBool(kl.fns.$eq(null, V3354))?((function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.cut, [Throwcontrol, V3902, Kl.setArity("shen.t*-action_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.shen$dot$st_action, [kl.fns.cons(new Sym("where"), kl.fns.cons(kl.fns.cons(new Sym("not"), kl.fns.cons(kl.fns.cons(kl.fns.cons(new Sym("="), kl.fns.cons(Action, null)), kl.fns.cons(kl.fns.cons(new Sym("fail"), null), null)), null)), kl.fns.cons(Action, null))), V3900, V3901, V3902, V3903]);
                    })]);
                    })()):(klFalse);
                })()):(klFalse);
                })()):(klFalse);
                })()):(klFalse);
                })();
                    return asJsBool(kl.fns.$eq(Case_2, klFalse))?((function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.shen$dot$st, [kl.fns.cons(V3899, kl.fns.cons(new Sym(":"), kl.fns.cons(V3900, null))), V3901, V3902, V3903]);
                    })()):(Case_2);
                })()):(Case_1);
                })()):(Case);
                })()]);
                })();
                    });

kl.defun("findall", 5, function (V3909, V3910, V3911, V3912, V3913) {
                      return (function () {
                  const B = Kl.headCall(kl.fns.shen$donewpv, [V3912]);
                    const A = Kl.headCall(kl.fns.shen$donewpv, [V3912]);
                    return (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.tailCall(kl.fns.bind, [A, Kl.headCall(kl.fns.gensym, [new Sym("shen.a")]), V3912, Kl.setArity("findall_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.bind, [B, kl.fns.set(Kl.headCall(kl.fns.shen$dolazyderef, [A, V3912]), null), V3912, Kl.setArity("findall_freeze_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.shen$dofindallhelp, [V3909, V3910, V3911, A, V3912, V3913]);
                    })]);
                    })]);
                    })();
                })();
                    });

kl.defun("shen.findallhelp", 6, function (V3920, V3921, V3922, V3923, V3924, V3925) {
                      return (function () {
                  const Case = (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.headCall(kl.fns.call, [V3921, V3924, Kl.setArity("shen.findallhelp_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.shen$doremember, [V3923, V3920, V3924, Kl.setArity("shen.findallhelp_freeze_freeze", 0, function () {
                      return Kl.tailCall(kl.fns.fwhen, [klFalse, V3924, V3925]);
                    })]);
                    })]);
                    })();
                    return asJsBool(kl.fns.$eq(Case, klFalse))?((function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.tailCall(kl.fns.bind, [V3922, kl.fns.value(Kl.headCall(kl.fns.shen$dolazyderef, [V3923, V3924])), V3924, V3925]);
                    })()):(Case);
                })();
                    });

kl.defun("shen.remember", 4, function (V3930, V3931, V3932, V3933) {
                      return (function () {
                  const B = Kl.headCall(kl.fns.shen$donewpv, [V3932]);
                    return (function () {
                      Kl.headCall(kl.fns.shen$doincinfs, []);
                      return Kl.tailCall(kl.fns.bind, [B, kl.fns.set(Kl.headCall(kl.fns.shen$doderef, [V3930, V3932]), kl.fns.cons(Kl.headCall(kl.fns.shen$doderef, [V3931, V3932]), kl.fns.value(Kl.headCall(kl.fns.shen$doderef, [V3930, V3932])))), V3932, V3933]);
                    })();
                })();
                    });

kl.symbols.shen$do$sthistory$st = null;

kl.symbols.shen$do$ststep$st = klFalse;

kl.symbols.shen$do$stinstalling_kl$st = klFalse;

kl.symbols.shen$do$sthistory$st = null;

kl.symbols.shen$do$sttc$st = klFalse;

kl.symbols.$stproperty_vector$st = Kl.headCall(kl.fns.shen$dodict, [20000]);

kl.symbols.shen$do$stprocess_counter$st = 0;

kl.symbols.shen$do$stvarcounter$st = Kl.headCall(kl.fns.vector, [10000]);

kl.symbols.shen$do$stprologvectors$st = Kl.headCall(kl.fns.vector, [10000]);

kl.symbols.shen$do$stdemodulation_function$st = Kl.setArity("$$_lambda", 1, function (X) {
                      return X;
                    });

kl.symbols.shen$do$stmacroreg$st = kl.fns.cons(new Sym("shen.timer-macro"), kl.fns.cons(new Sym("shen.cases-macro"), kl.fns.cons(new Sym("shen.abs-macro"), kl.fns.cons(new Sym("shen.put/get-macro"), kl.fns.cons(new Sym("shen.compile-macro"), kl.fns.cons(new Sym("shen.datatype-macro"), kl.fns.cons(new Sym("shen.let-macro"), kl.fns.cons(new Sym("shen.assoc-macro"), kl.fns.cons(new Sym("shen.make-string-macro"), kl.fns.cons(new Sym("shen.output-macro"), kl.fns.cons(new Sym("shen.input-macro"), kl.fns.cons(new Sym("shen.error-macro"), kl.fns.cons(new Sym("shen.prolog-macro"), kl.fns.cons(new Sym("shen.synonyms-macro"), kl.fns.cons(new Sym("shen.nl-macro"), kl.fns.cons(new Sym("shen.@s-macro"), kl.fns.cons(new Sym("shen.defprolog-macro"), kl.fns.cons(new Sym("shen.function-macro"), null))))))))))))))))));

kl.symbols.$stmacros$st = kl.fns.cons(Kl.setArity("$$_lambda", 1, function (X) {
                      return Kl.tailCall(kl.fns.shen$dotimer_macro, [X]);
                    }), kl.fns.cons(Kl.setArity("$$_lambda", 1, function (X) {
                      return Kl.tailCall(kl.fns.shen$docases_macro, [X]);
                    }), kl.fns.cons(Kl.setArity("$$_lambda", 1, function (X) {
                      return Kl.tailCall(kl.fns.shen$doabs_macro, [X]);
                    }), kl.fns.cons(Kl.setArity("$$_lambda", 1, function (X) {
                      return Kl.tailCall(kl.fns.shen$doput$slget_macro, [X]);
                    }), kl.fns.cons(Kl.setArity("$$_lambda", 1, function (X) {
                      return Kl.tailCall(kl.fns.shen$docompile_macro, [X]);
                    }), kl.fns.cons(Kl.setArity("$$_lambda", 1, function (X) {
                      return Kl.tailCall(kl.fns.shen$dodatatype_macro, [X]);
                    }), kl.fns.cons(Kl.setArity("$$_lambda", 1, function (X) {
                      return Kl.tailCall(kl.fns.shen$dolet_macro, [X]);
                    }), kl.fns.cons(Kl.setArity("$$_lambda", 1, function (X) {
                      return Kl.tailCall(kl.fns.shen$doassoc_macro, [X]);
                    }), kl.fns.cons(Kl.setArity("$$_lambda", 1, function (X) {
                      return Kl.tailCall(kl.fns.shen$domake_string_macro, [X]);
                    }), kl.fns.cons(Kl.setArity("$$_lambda", 1, function (X) {
                      return Kl.tailCall(kl.fns.shen$dooutput_macro, [X]);
                    }), kl.fns.cons(Kl.setArity("$$_lambda", 1, function (X) {
                      return Kl.tailCall(kl.fns.shen$doinput_macro, [X]);
                    }), kl.fns.cons(Kl.setArity("$$_lambda", 1, function (X) {
                      return Kl.tailCall(kl.fns.shen$doerror_macro, [X]);
                    }), kl.fns.cons(Kl.setArity("$$_lambda", 1, function (X) {
                      return Kl.tailCall(kl.fns.shen$doprolog_macro, [X]);
                    }), kl.fns.cons(Kl.setArity("$$_lambda", 1, function (X) {
                      return Kl.tailCall(kl.fns.shen$dosynonyms_macro, [X]);
                    }), kl.fns.cons(Kl.setArity("$$_lambda", 1, function (X) {
                      return Kl.tailCall(kl.fns.shen$donl_macro, [X]);
                    }), kl.fns.cons(Kl.setArity("$$_lambda", 1, function (X) {
                      return Kl.tailCall(kl.fns.shen$do$ats_macro, [X]);
                    }), kl.fns.cons(Kl.setArity("$$_lambda", 1, function (X) {
                      return Kl.tailCall(kl.fns.shen$dodefprolog_macro, [X]);
                    }), kl.fns.cons(Kl.setArity("$$_lambda", 1, function (X) {
                      return Kl.tailCall(kl.fns.shen$dofunction_macro, [X]);
                    }), null))))))))))))))))));

kl.symbols.shen$do$stgensym$st = 0;

kl.symbols.shen$do$sttracking$st = null;

kl.symbols.shen$do$stalphabet$st = kl.fns.cons(new Sym("A"), kl.fns.cons(new Sym("B"), kl.fns.cons(new Sym("C"), kl.fns.cons(new Sym("D"), kl.fns.cons(new Sym("E"), kl.fns.cons(new Sym("F"), kl.fns.cons(new Sym("G"), kl.fns.cons(new Sym("H"), kl.fns.cons(new Sym("I"), kl.fns.cons(new Sym("J"), kl.fns.cons(new Sym("K"), kl.fns.cons(new Sym("L"), kl.fns.cons(new Sym("M"), kl.fns.cons(new Sym("N"), kl.fns.cons(new Sym("O"), kl.fns.cons(new Sym("P"), kl.fns.cons(new Sym("Q"), kl.fns.cons(new Sym("R"), kl.fns.cons(new Sym("S"), kl.fns.cons(new Sym("T"), kl.fns.cons(new Sym("U"), kl.fns.cons(new Sym("V"), kl.fns.cons(new Sym("W"), kl.fns.cons(new Sym("X"), kl.fns.cons(new Sym("Y"), kl.fns.cons(new Sym("Z"), null))))))))))))))))))))))))));

kl.symbols.shen$do$stspecial$st = kl.fns.cons(new Sym("@p"), kl.fns.cons(new Sym("@s"), kl.fns.cons(new Sym("@v"), kl.fns.cons(new Sym("cons"), kl.fns.cons(new Sym("lambda"), kl.fns.cons(new Sym("let"), kl.fns.cons(new Sym("where"), kl.fns.cons(new Sym("set"), kl.fns.cons(new Sym("open"), null)))))))));

kl.symbols.shen$do$stextraspecial$st = kl.fns.cons(new Sym("define"), kl.fns.cons(new Sym("shen.process-datatype"), kl.fns.cons(new Sym("input+"), kl.fns.cons(new Sym("defcc"), kl.fns.cons(new Sym("shen.read+"), kl.fns.cons(new Sym("defmacro"), null))))));

kl.symbols.shen$do$stspy$st = klFalse;

kl.symbols.shen$do$stdatatypes$st = null;

kl.symbols.shen$do$stalldatatypes$st = null;

kl.symbols.shen$do$stshen_type_theory_enabled$qu$st = klTrue;

kl.symbols.shen$do$stsynonyms$st = null;

kl.symbols.shen$do$stsystem$st = null;

kl.symbols.shen$do$stsignedfuncs$st = null;

kl.symbols.shen$do$stmaxcomplexity$st = 128;

kl.symbols.shen$do$stoccurs$st = klTrue;

kl.symbols.shen$do$stmaxinferences$st = 1000000;

kl.symbols.$stmaximum_print_sequence_size$st = 20;

kl.symbols.shen$do$stcatch$st = 0;

kl.symbols.shen$do$stcall$st = 0;

kl.symbols.shen$do$stinfs$st = 0;

kl.symbols.$sthush$st = klFalse;

kl.symbols.shen$do$stoptimise$st = klFalse;

kl.symbols.$stversion$st = "Shen 21";

asJsBool(Kl.headCall(kl.fns.not, [Kl.headCall(kl.fns.bound$qu, [new Sym("*home-directory*")])]))?(kl.symbols.$sthome_directory$st = ""):(new Sym("shen.skip"));

asJsBool(Kl.headCall(kl.fns.not, [Kl.headCall(kl.fns.bound$qu, [new Sym("*sterror*")])]))?(kl.symbols.$ststerror$st = kl.symbols.$ststoutput$st):(new Sym("shen.skip"));

Kl.headCall(kl.fns.shen$doinitialise$unarity$untable, [kl.fns.cons(new Sym("abort"), kl.fns.cons(0, kl.fns.cons(new Sym("absvector?"), kl.fns.cons(1, kl.fns.cons(new Sym("absvector"), kl.fns.cons(1, kl.fns.cons(new Sym("adjoin"), kl.fns.cons(2, kl.fns.cons(new Sym("and"), kl.fns.cons(2, kl.fns.cons(new Sym("append"), kl.fns.cons(2, kl.fns.cons(new Sym("arity"), kl.fns.cons(1, kl.fns.cons(new Sym("assoc"), kl.fns.cons(2, kl.fns.cons(new Sym("boolean?"), kl.fns.cons(1, kl.fns.cons(new Sym("bound?"), kl.fns.cons(1, kl.fns.cons(new Sym("cd"), kl.fns.cons(1, kl.fns.cons(new Sym("close"), kl.fns.cons(1, kl.fns.cons(new Sym("compile"), kl.fns.cons(3, kl.fns.cons(new Sym("concat"), kl.fns.cons(2, kl.fns.cons(new Sym("cons"), kl.fns.cons(2, kl.fns.cons(new Sym("cons?"), kl.fns.cons(1, kl.fns.cons(new Sym("cn"), kl.fns.cons(2, kl.fns.cons(new Sym("declare"), kl.fns.cons(2, kl.fns.cons(new Sym("destroy"), kl.fns.cons(1, kl.fns.cons(new Sym("difference"), kl.fns.cons(2, kl.fns.cons(new Sym("do"), kl.fns.cons(2, kl.fns.cons(new Sym("element?"), kl.fns.cons(2, kl.fns.cons(new Sym("empty?"), kl.fns.cons(1, kl.fns.cons(new Sym("enable-type-theory"), kl.fns.cons(1, kl.fns.cons(new Sym("error-to-string"), kl.fns.cons(1, kl.fns.cons(new Sym("shen.interror"), kl.fns.cons(2, kl.fns.cons(new Sym("eval"), kl.fns.cons(1, kl.fns.cons(new Sym("eval-kl"), kl.fns.cons(1, kl.fns.cons(new Sym("explode"), kl.fns.cons(1, kl.fns.cons(new Sym("external"), kl.fns.cons(1, kl.fns.cons(new Sym("fail-if"), kl.fns.cons(2, kl.fns.cons(new Sym("fail"), kl.fns.cons(0, kl.fns.cons(new Sym("fix"), kl.fns.cons(2, kl.fns.cons(new Sym("findall"), kl.fns.cons(5, kl.fns.cons(new Sym("freeze"), kl.fns.cons(1, kl.fns.cons(new Sym("fst"), kl.fns.cons(1, kl.fns.cons(new Sym("gensym"), kl.fns.cons(1, kl.fns.cons(new Sym("get"), kl.fns.cons(3, kl.fns.cons(new Sym("get-time"), kl.fns.cons(1, kl.fns.cons(new Sym("address->"), kl.fns.cons(3, kl.fns.cons(new Sym("<-address"), kl.fns.cons(2, kl.fns.cons(new Sym("<-vector"), kl.fns.cons(2, kl.fns.cons(new Sym(">"), kl.fns.cons(2, kl.fns.cons(new Sym(">="), kl.fns.cons(2, kl.fns.cons(new Sym("="), kl.fns.cons(2, kl.fns.cons(new Sym("hash"), kl.fns.cons(2, kl.fns.cons(new Sym("hd"), kl.fns.cons(1, kl.fns.cons(new Sym("hdv"), kl.fns.cons(1, kl.fns.cons(new Sym("hdstr"), kl.fns.cons(1, kl.fns.cons(new Sym("head"), kl.fns.cons(1, kl.fns.cons(new Sym("if"), kl.fns.cons(3, kl.fns.cons(new Sym("integer?"), kl.fns.cons(1, kl.fns.cons(new Sym("intern"), kl.fns.cons(1, kl.fns.cons(new Sym("identical"), kl.fns.cons(4, kl.fns.cons(new Sym("inferences"), kl.fns.cons(0, kl.fns.cons(new Sym("input"), kl.fns.cons(1, kl.fns.cons(new Sym("input+"), kl.fns.cons(2, kl.fns.cons(new Sym("implementation"), kl.fns.cons(0, kl.fns.cons(new Sym("intersection"), kl.fns.cons(2, kl.fns.cons(new Sym("internal"), kl.fns.cons(1, kl.fns.cons(new Sym("it"), kl.fns.cons(0, kl.fns.cons(new Sym("kill"), kl.fns.cons(0, kl.fns.cons(new Sym("language"), kl.fns.cons(0, kl.fns.cons(new Sym("length"), kl.fns.cons(1, kl.fns.cons(new Sym("limit"), kl.fns.cons(1, kl.fns.cons(new Sym("lineread"), kl.fns.cons(1, kl.fns.cons(new Sym("load"), kl.fns.cons(1, kl.fns.cons(new Sym("<"), kl.fns.cons(2, kl.fns.cons(new Sym("<="), kl.fns.cons(2, kl.fns.cons(new Sym("vector"), kl.fns.cons(1, kl.fns.cons(new Sym("macroexpand"), kl.fns.cons(1, kl.fns.cons(new Sym("map"), kl.fns.cons(2, kl.fns.cons(new Sym("mapcan"), kl.fns.cons(2, kl.fns.cons(new Sym("maxinferences"), kl.fns.cons(1, kl.fns.cons(new Sym("nl"), kl.fns.cons(1, kl.fns.cons(new Sym("not"), kl.fns.cons(1, kl.fns.cons(new Sym("nth"), kl.fns.cons(2, kl.fns.cons(new Sym("n->string"), kl.fns.cons(1, kl.fns.cons(new Sym("number?"), kl.fns.cons(1, kl.fns.cons(new Sym("occurs-check"), kl.fns.cons(1, kl.fns.cons(new Sym("occurrences"), kl.fns.cons(2, kl.fns.cons(new Sym("occurs-check"), kl.fns.cons(1, kl.fns.cons(new Sym("open"), kl.fns.cons(2, kl.fns.cons(new Sym("optimise"), kl.fns.cons(1, kl.fns.cons(new Sym("or"), kl.fns.cons(2, kl.fns.cons(new Sym("os"), kl.fns.cons(0, kl.fns.cons(new Sym("package"), kl.fns.cons(3, kl.fns.cons(new Sym("package?"), kl.fns.cons(1, kl.fns.cons(new Sym("port"), kl.fns.cons(0, kl.fns.cons(new Sym("porters"), kl.fns.cons(0, kl.fns.cons(new Sym("pos"), kl.fns.cons(2, kl.fns.cons(new Sym("print"), kl.fns.cons(1, kl.fns.cons(new Sym("profile"), kl.fns.cons(1, kl.fns.cons(new Sym("profile-results"), kl.fns.cons(1, kl.fns.cons(new Sym("pr"), kl.fns.cons(2, kl.fns.cons(new Sym("ps"), kl.fns.cons(1, kl.fns.cons(new Sym("preclude"), kl.fns.cons(1, kl.fns.cons(new Sym("preclude-all-but"), kl.fns.cons(1, kl.fns.cons(new Sym("protect"), kl.fns.cons(1, kl.fns.cons(new Sym("address->"), kl.fns.cons(3, kl.fns.cons(new Sym("put"), kl.fns.cons(4, kl.fns.cons(new Sym("shen.reassemble"), kl.fns.cons(2, kl.fns.cons(new Sym("read-file-as-string"), kl.fns.cons(1, kl.fns.cons(new Sym("read-file"), kl.fns.cons(1, kl.fns.cons(new Sym("read-file-as-bytelist"), kl.fns.cons(1, kl.fns.cons(new Sym("read"), kl.fns.cons(1, kl.fns.cons(new Sym("read-byte"), kl.fns.cons(1, kl.fns.cons(new Sym("read-from-string"), kl.fns.cons(1, kl.fns.cons(new Sym("receive"), kl.fns.cons(1, kl.fns.cons(new Sym("release"), kl.fns.cons(0, kl.fns.cons(new Sym("remove"), kl.fns.cons(2, kl.fns.cons(new Sym("shen.require"), kl.fns.cons(3, kl.fns.cons(new Sym("reverse"), kl.fns.cons(1, kl.fns.cons(new Sym("set"), kl.fns.cons(2, kl.fns.cons(new Sym("simple-error"), kl.fns.cons(1, kl.fns.cons(new Sym("snd"), kl.fns.cons(1, kl.fns.cons(new Sym("specialise"), kl.fns.cons(1, kl.fns.cons(new Sym("spy"), kl.fns.cons(1, kl.fns.cons(new Sym("step"), kl.fns.cons(1, kl.fns.cons(new Sym("stinput"), kl.fns.cons(0, kl.fns.cons(new Sym("stoutput"), kl.fns.cons(0, kl.fns.cons(new Sym("sterror"), kl.fns.cons(0, kl.fns.cons(new Sym("string->n"), kl.fns.cons(1, kl.fns.cons(new Sym("string->symbol"), kl.fns.cons(1, kl.fns.cons(new Sym("string?"), kl.fns.cons(1, kl.fns.cons(new Sym("str"), kl.fns.cons(1, kl.fns.cons(new Sym("subst"), kl.fns.cons(3, kl.fns.cons(new Sym("sum"), kl.fns.cons(1, kl.fns.cons(new Sym("symbol?"), kl.fns.cons(1, kl.fns.cons(new Sym("systemf"), kl.fns.cons(1, kl.fns.cons(new Sym("tail"), kl.fns.cons(1, kl.fns.cons(new Sym("tl"), kl.fns.cons(1, kl.fns.cons(new Sym("tc"), kl.fns.cons(1, kl.fns.cons(new Sym("tc?"), kl.fns.cons(0, kl.fns.cons(new Sym("thaw"), kl.fns.cons(1, kl.fns.cons(new Sym("tlstr"), kl.fns.cons(1, kl.fns.cons(new Sym("track"), kl.fns.cons(1, kl.fns.cons(new Sym("trap-error"), kl.fns.cons(2, kl.fns.cons(new Sym("tuple?"), kl.fns.cons(1, kl.fns.cons(new Sym("type"), kl.fns.cons(2, kl.fns.cons(new Sym("return"), kl.fns.cons(3, kl.fns.cons(new Sym("undefmacro"), kl.fns.cons(1, kl.fns.cons(new Sym("unput"), kl.fns.cons(3, kl.fns.cons(new Sym("unprofile"), kl.fns.cons(1, kl.fns.cons(new Sym("unify"), kl.fns.cons(4, kl.fns.cons(new Sym("unify!"), kl.fns.cons(4, kl.fns.cons(new Sym("union"), kl.fns.cons(2, kl.fns.cons(new Sym("untrack"), kl.fns.cons(1, kl.fns.cons(new Sym("unspecialise"), kl.fns.cons(1, kl.fns.cons(new Sym("undefmacro"), kl.fns.cons(1, kl.fns.cons(new Sym("vector"), kl.fns.cons(1, kl.fns.cons(new Sym("vector?"), kl.fns.cons(1, kl.fns.cons(new Sym("vector->"), kl.fns.cons(3, kl.fns.cons(new Sym("value"), kl.fns.cons(1, kl.fns.cons(new Sym("variable?"), kl.fns.cons(1, kl.fns.cons(new Sym("version"), kl.fns.cons(0, kl.fns.cons(new Sym("write-byte"), kl.fns.cons(2, kl.fns.cons(new Sym("write-to-file"), kl.fns.cons(2, kl.fns.cons(new Sym("y-or-n?"), kl.fns.cons(1, kl.fns.cons(new Sym("+"), kl.fns.cons(2, kl.fns.cons(new Sym("*"), kl.fns.cons(2, kl.fns.cons(new Sym("/"), kl.fns.cons(2, kl.fns.cons(new Sym("-"), kl.fns.cons(2, kl.fns.cons(new Sym("=="), kl.fns.cons(2, kl.fns.cons(new Sym("<e>"), kl.fns.cons(1, kl.fns.cons(new Sym("<!>"), kl.fns.cons(1, kl.fns.cons(new Sym("@p"), kl.fns.cons(2, kl.fns.cons(new Sym("@v"), kl.fns.cons(2, kl.fns.cons(new Sym("@s"), kl.fns.cons(2, kl.fns.cons(new Sym("preclude"), kl.fns.cons(1, kl.fns.cons(new Sym("include"), kl.fns.cons(1, kl.fns.cons(new Sym("preclude-all-but"), kl.fns.cons(1, kl.fns.cons(new Sym("include-all-but"), kl.fns.cons(1, null))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))]);

Kl.headCall(kl.fns.put, [kl.fns.intern("shen"), new Sym("shen.external-symbols"), kl.fns.cons(new Sym("!"), kl.fns.cons(new Sym("}"), kl.fns.cons(new Sym("{"), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("<--"), kl.fns.cons(new Sym("&&"), kl.fns.cons(new Sym(":"), kl.fns.cons(new Sym(";"), kl.fns.cons(new Sym(":-"), kl.fns.cons(new Sym(":="), kl.fns.cons(new Sym("_"), kl.fns.cons(new Sym(","), kl.fns.cons(new Sym("*language*"), kl.fns.cons(new Sym("*implementation*"), kl.fns.cons(new Sym("*stinput*"), kl.fns.cons(new Sym("*stoutput*"), kl.fns.cons(new Sym("*sterror*"), kl.fns.cons(new Sym("*home-directory*"), kl.fns.cons(new Sym("*version*"), kl.fns.cons(new Sym("*maximum-print-sequence-size*"), kl.fns.cons(new Sym("*macros*"), kl.fns.cons(new Sym("*os*"), kl.fns.cons(new Sym("*release*"), kl.fns.cons(new Sym("*property-vector*"), kl.fns.cons(new Sym("*port*"), kl.fns.cons(new Sym("*porters*"), kl.fns.cons(new Sym("*hush*"), kl.fns.cons(new Sym("@v"), kl.fns.cons(new Sym("@p"), kl.fns.cons(new Sym("@s"), kl.fns.cons(new Sym("<-"), kl.fns.cons(new Sym("->"), kl.fns.cons(new Sym("<e>"), kl.fns.cons(new Sym("<!>"), kl.fns.cons(new Sym("=="), kl.fns.cons(new Sym("="), kl.fns.cons(new Sym(">="), kl.fns.cons(new Sym(">"), kl.fns.cons(new Sym("/."), kl.fns.cons(new Sym("=!"), kl.fns.cons(new Sym("$"), kl.fns.cons(new Sym("-"), kl.fns.cons(new Sym("/"), kl.fns.cons(new Sym("*"), kl.fns.cons(new Sym("+"), kl.fns.cons(new Sym("<="), kl.fns.cons(new Sym("<"), kl.fns.cons(new Sym(">>"), kl.fns.cons(Kl.headCall(kl.fns.vector, [0]), kl.fns.cons(new Sym("y-or-n?"), kl.fns.cons(new Sym("write-to-file"), kl.fns.cons(new Sym("write-byte"), kl.fns.cons(new Sym("where"), kl.fns.cons(new Sym("when"), kl.fns.cons(new Sym("warn"), kl.fns.cons(new Sym("version"), kl.fns.cons(new Sym("verified"), kl.fns.cons(new Sym("variable?"), kl.fns.cons(new Sym("value"), kl.fns.cons(new Sym("vector->"), kl.fns.cons(new Sym("<-vector"), kl.fns.cons(new Sym("vector"), kl.fns.cons(new Sym("vector?"), kl.fns.cons(new Sym("unspecialise"), kl.fns.cons(new Sym("untrack"), kl.fns.cons(new Sym("unit"), kl.fns.cons(new Sym("shen.unix"), kl.fns.cons(new Sym("union"), kl.fns.cons(new Sym("unify"), kl.fns.cons(new Sym("unify!"), kl.fns.cons(new Sym("unput"), kl.fns.cons(new Sym("unprofile"), kl.fns.cons(new Sym("undefmacro"), kl.fns.cons(new Sym("return"), kl.fns.cons(new Sym("type"), kl.fns.cons(new Sym("tuple?"), kl.fns.cons(klTrue, kl.fns.cons(new Sym("trap-error"), kl.fns.cons(new Sym("track"), kl.fns.cons(new Sym("time"), kl.fns.cons(new Sym("thaw"), kl.fns.cons(new Sym("tc?"), kl.fns.cons(new Sym("tc"), kl.fns.cons(new Sym("tl"), kl.fns.cons(new Sym("tlstr"), kl.fns.cons(new Sym("tlv"), kl.fns.cons(new Sym("tail"), kl.fns.cons(new Sym("systemf"), kl.fns.cons(new Sym("synonyms"), kl.fns.cons(new Sym("symbol"), kl.fns.cons(new Sym("symbol?"), kl.fns.cons(new Sym("string->symbol"), kl.fns.cons(new Sym("sum"), kl.fns.cons(new Sym("subst"), kl.fns.cons(new Sym("string?"), kl.fns.cons(new Sym("string->n"), kl.fns.cons(new Sym("stream"), kl.fns.cons(new Sym("string"), kl.fns.cons(new Sym("stinput"), kl.fns.cons(new Sym("sterror"), kl.fns.cons(new Sym("stoutput"), kl.fns.cons(new Sym("step"), kl.fns.cons(new Sym("spy"), kl.fns.cons(new Sym("specialise"), kl.fns.cons(new Sym("snd"), kl.fns.cons(new Sym("simple-error"), kl.fns.cons(new Sym("set"), kl.fns.cons(new Sym("save"), kl.fns.cons(new Sym("str"), kl.fns.cons(new Sym("run"), kl.fns.cons(new Sym("reverse"), kl.fns.cons(new Sym("remove"), kl.fns.cons(new Sym("release"), kl.fns.cons(new Sym("read"), kl.fns.cons(new Sym("receive"), kl.fns.cons(new Sym("read-file"), kl.fns.cons(new Sym("read-file-as-bytelist"), kl.fns.cons(new Sym("read-file-as-string"), kl.fns.cons(new Sym("read-byte"), kl.fns.cons(new Sym("read-from-string"), kl.fns.cons(new Sym("package?"), kl.fns.cons(new Sym("put"), kl.fns.cons(new Sym("preclude"), kl.fns.cons(new Sym("preclude-all-but"), kl.fns.cons(new Sym("ps"), kl.fns.cons(new Sym("prolog?"), kl.fns.cons(new Sym("protect"), kl.fns.cons(new Sym("profile-results"), kl.fns.cons(new Sym("profile"), kl.fns.cons(new Sym("print"), kl.fns.cons(new Sym("pr"), kl.fns.cons(new Sym("pos"), kl.fns.cons(new Sym("porters"), kl.fns.cons(new Sym("port"), kl.fns.cons(new Sym("package"), kl.fns.cons(new Sym("output"), kl.fns.cons(new Sym("out"), kl.fns.cons(new Sym("os"), kl.fns.cons(new Sym("or"), kl.fns.cons(new Sym("optimise"), kl.fns.cons(new Sym("open"), kl.fns.cons(new Sym("occurrences"), kl.fns.cons(new Sym("occurs-check"), kl.fns.cons(new Sym("n->string"), kl.fns.cons(new Sym("number?"), kl.fns.cons(new Sym("number"), kl.fns.cons(new Sym("null"), kl.fns.cons(new Sym("nth"), kl.fns.cons(new Sym("not"), kl.fns.cons(new Sym("nl"), kl.fns.cons(new Sym("mode"), kl.fns.cons(new Sym("macroexpand"), kl.fns.cons(new Sym("maxinferences"), kl.fns.cons(new Sym("mapcan"), kl.fns.cons(new Sym("map"), kl.fns.cons(new Sym("make-string"), kl.fns.cons(new Sym("load"), kl.fns.cons(new Sym("loaded"), kl.fns.cons(new Sym("list"), kl.fns.cons(new Sym("lineread"), kl.fns.cons(new Sym("limit"), kl.fns.cons(new Sym("length"), kl.fns.cons(new Sym("let"), kl.fns.cons(new Sym("lazy"), kl.fns.cons(new Sym("lambda"), kl.fns.cons(new Sym("language"), kl.fns.cons(new Sym("kill"), kl.fns.cons(new Sym("is"), kl.fns.cons(new Sym("intersection"), kl.fns.cons(new Sym("inferences"), kl.fns.cons(new Sym("intern"), kl.fns.cons(new Sym("integer?"), kl.fns.cons(new Sym("input"), kl.fns.cons(new Sym("input+"), kl.fns.cons(new Sym("include"), kl.fns.cons(new Sym("include-all-but"), kl.fns.cons(new Sym("it"), kl.fns.cons(new Sym("in"), kl.fns.cons(new Sym("internal"), kl.fns.cons(new Sym("implementation"), kl.fns.cons(new Sym("if"), kl.fns.cons(new Sym("identical"), kl.fns.cons(new Sym("head"), kl.fns.cons(new Sym("hd"), kl.fns.cons(new Sym("hdv"), kl.fns.cons(new Sym("hdstr"), kl.fns.cons(new Sym("hash"), kl.fns.cons(new Sym("get"), kl.fns.cons(new Sym("get-time"), kl.fns.cons(new Sym("gensym"), kl.fns.cons(new Sym("function"), kl.fns.cons(new Sym("fst"), kl.fns.cons(new Sym("freeze"), kl.fns.cons(new Sym("fix"), kl.fns.cons(new Sym("file"), kl.fns.cons(new Sym("fail"), kl.fns.cons(new Sym("fail-if"), kl.fns.cons(new Sym("fwhen"), kl.fns.cons(new Sym("findall"), kl.fns.cons(klFalse, kl.fns.cons(new Sym("enable-type-theory"), kl.fns.cons(new Sym("explode"), kl.fns.cons(new Sym("external"), kl.fns.cons(new Sym("exception"), kl.fns.cons(new Sym("eval-kl"), kl.fns.cons(new Sym("eval"), kl.fns.cons(new Sym("error-to-string"), kl.fns.cons(new Sym("error"), kl.fns.cons(new Sym("empty?"), kl.fns.cons(new Sym("element?"), kl.fns.cons(new Sym("do"), kl.fns.cons(new Sym("difference"), kl.fns.cons(new Sym("destroy"), kl.fns.cons(new Sym("defun"), kl.fns.cons(new Sym("define"), kl.fns.cons(new Sym("defmacro"), kl.fns.cons(new Sym("defcc"), kl.fns.cons(new Sym("defprolog"), kl.fns.cons(new Sym("declare"), kl.fns.cons(new Sym("datatype"), kl.fns.cons(new Sym("cut"), kl.fns.cons(new Sym("cn"), kl.fns.cons(new Sym("cons?"), kl.fns.cons(new Sym("cons"), kl.fns.cons(new Sym("cond"), kl.fns.cons(new Sym("concat"), kl.fns.cons(new Sym("compile"), kl.fns.cons(new Sym("cd"), kl.fns.cons(new Sym("cases"), kl.fns.cons(new Sym("call"), kl.fns.cons(new Sym("close"), kl.fns.cons(new Sym("bind"), kl.fns.cons(new Sym("bound?"), kl.fns.cons(new Sym("boolean?"), kl.fns.cons(new Sym("boolean"), kl.fns.cons(new Sym("bar!"), kl.fns.cons(new Sym("assoc"), kl.fns.cons(new Sym("arity"), kl.fns.cons(new Sym("abort"), kl.fns.cons(new Sym("append"), kl.fns.cons(new Sym("and"), kl.fns.cons(new Sym("adjoin"), kl.fns.cons(new Sym("<-address"), kl.fns.cons(new Sym("address->"), kl.fns.cons(new Sym("absvector?"), kl.fns.cons(new Sym("absvector"), null)))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))), kl.fns.value(new Sym("*property-vector*"))]);

Kl.headCall(kl.fns.shen$dofor_each, [Kl.setArity("$$_lambda", 1, function (Entry) {
                      return Kl.tailCall(kl.fns.shen$doset_lambda_form_entry, [Entry]);
                    }), kl.fns.cons(kl.fns.cons(new Sym("shen.datatype-error"), Kl.setArity("$$_lambda", 1, function (X) {
                      return Kl.tailCall(kl.fns.shen$dodatatype_error, [X]);
                    })), kl.fns.cons(kl.fns.cons(new Sym("shen.tuple"), Kl.setArity("$$_lambda", 1, function (X) {
                      return Kl.tailCall(kl.fns.shen$dotuple, [X]);
                    })), kl.fns.cons(kl.fns.cons(new Sym("shen.pvar"), Kl.setArity("$$_lambda", 1, function (X) {
                      return Kl.tailCall(kl.fns.shen$dopvar, [X]);
                    })), kl.fns.cons(kl.fns.cons(new Sym("shen.dictionary"), Kl.setArity("$$_lambda", 1, function (X) {
                      return Kl.tailCall(kl.fns.shen$dodictionary, [X]);
                    })), Kl.headCall(kl.fns.mapcan, [Kl.setArity("$$_lambda", 1, function (X) {
                      return Kl.tailCall(kl.fns.shen$dolambda_form_entry, [X]);
                    }), Kl.headCall(kl.fns.external, [kl.fns.intern("shen")])])))))]);

Kl.headCall(kl.fns.declare, [new Sym("absvector?"), kl.fns.cons(new Sym("A"), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("boolean"), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("adjoin"), kl.fns.cons(new Sym("A"), kl.fns.cons(new Sym("-->"), kl.fns.cons(kl.fns.cons(kl.fns.cons(new Sym("list"), kl.fns.cons(new Sym("A"), null)), kl.fns.cons(new Sym("-->"), kl.fns.cons(kl.fns.cons(new Sym("list"), kl.fns.cons(new Sym("A"), null)), null))), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("and"), kl.fns.cons(new Sym("boolean"), kl.fns.cons(new Sym("-->"), kl.fns.cons(kl.fns.cons(new Sym("boolean"), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("boolean"), null))), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("shen.app"), kl.fns.cons(new Sym("A"), kl.fns.cons(new Sym("-->"), kl.fns.cons(kl.fns.cons(new Sym("string"), kl.fns.cons(new Sym("-->"), kl.fns.cons(kl.fns.cons(new Sym("symbol"), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("string"), null))), null))), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("append"), kl.fns.cons(kl.fns.cons(new Sym("list"), kl.fns.cons(new Sym("A"), null)), kl.fns.cons(new Sym("-->"), kl.fns.cons(kl.fns.cons(kl.fns.cons(new Sym("list"), kl.fns.cons(new Sym("A"), null)), kl.fns.cons(new Sym("-->"), kl.fns.cons(kl.fns.cons(new Sym("list"), kl.fns.cons(new Sym("A"), null)), null))), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("arity"), kl.fns.cons(new Sym("A"), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("number"), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("assoc"), kl.fns.cons(new Sym("A"), kl.fns.cons(new Sym("-->"), kl.fns.cons(kl.fns.cons(kl.fns.cons(new Sym("list"), kl.fns.cons(kl.fns.cons(new Sym("list"), kl.fns.cons(new Sym("A"), null)), null)), kl.fns.cons(new Sym("-->"), kl.fns.cons(kl.fns.cons(new Sym("list"), kl.fns.cons(new Sym("A"), null)), null))), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("boolean?"), kl.fns.cons(new Sym("A"), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("boolean"), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("bound?"), kl.fns.cons(new Sym("symbol"), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("boolean"), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("cd"), kl.fns.cons(new Sym("string"), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("string"), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("close"), kl.fns.cons(kl.fns.cons(new Sym("stream"), kl.fns.cons(new Sym("A"), null)), kl.fns.cons(new Sym("-->"), kl.fns.cons(kl.fns.cons(new Sym("list"), kl.fns.cons(new Sym("B"), null)), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("cn"), kl.fns.cons(new Sym("string"), kl.fns.cons(new Sym("-->"), kl.fns.cons(kl.fns.cons(new Sym("string"), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("string"), null))), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("compile"), kl.fns.cons(kl.fns.cons(new Sym("A"), kl.fns.cons(new Sym("shen.==>"), kl.fns.cons(new Sym("B"), null))), kl.fns.cons(new Sym("-->"), kl.fns.cons(kl.fns.cons(new Sym("A"), kl.fns.cons(new Sym("-->"), kl.fns.cons(kl.fns.cons(kl.fns.cons(new Sym("A"), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("B"), null))), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("B"), null))), null))), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("cons?"), kl.fns.cons(new Sym("A"), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("boolean"), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("destroy"), kl.fns.cons(kl.fns.cons(new Sym("A"), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("B"), null))), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("symbol"), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("difference"), kl.fns.cons(kl.fns.cons(new Sym("list"), kl.fns.cons(new Sym("A"), null)), kl.fns.cons(new Sym("-->"), kl.fns.cons(kl.fns.cons(kl.fns.cons(new Sym("list"), kl.fns.cons(new Sym("A"), null)), kl.fns.cons(new Sym("-->"), kl.fns.cons(kl.fns.cons(new Sym("list"), kl.fns.cons(new Sym("A"), null)), null))), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("do"), kl.fns.cons(new Sym("A"), kl.fns.cons(new Sym("-->"), kl.fns.cons(kl.fns.cons(new Sym("B"), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("B"), null))), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("<e>"), kl.fns.cons(kl.fns.cons(new Sym("list"), kl.fns.cons(new Sym("A"), null)), kl.fns.cons(new Sym("shen.==>"), kl.fns.cons(kl.fns.cons(new Sym("list"), kl.fns.cons(new Sym("B"), null)), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("<!>"), kl.fns.cons(kl.fns.cons(new Sym("list"), kl.fns.cons(new Sym("A"), null)), kl.fns.cons(new Sym("shen.==>"), kl.fns.cons(kl.fns.cons(new Sym("list"), kl.fns.cons(new Sym("A"), null)), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("element?"), kl.fns.cons(new Sym("A"), kl.fns.cons(new Sym("-->"), kl.fns.cons(kl.fns.cons(kl.fns.cons(new Sym("list"), kl.fns.cons(new Sym("A"), null)), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("boolean"), null))), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("empty?"), kl.fns.cons(new Sym("A"), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("boolean"), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("enable-type-theory"), kl.fns.cons(new Sym("symbol"), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("boolean"), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("external"), kl.fns.cons(new Sym("symbol"), kl.fns.cons(new Sym("-->"), kl.fns.cons(kl.fns.cons(new Sym("list"), kl.fns.cons(new Sym("symbol"), null)), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("error-to-string"), kl.fns.cons(new Sym("exception"), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("string"), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("explode"), kl.fns.cons(new Sym("A"), kl.fns.cons(new Sym("-->"), kl.fns.cons(kl.fns.cons(new Sym("list"), kl.fns.cons(new Sym("string"), null)), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("fail"), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("symbol"), null))]);

Kl.headCall(kl.fns.declare, [new Sym("fail-if"), kl.fns.cons(kl.fns.cons(new Sym("symbol"), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("boolean"), null))), kl.fns.cons(new Sym("-->"), kl.fns.cons(kl.fns.cons(new Sym("symbol"), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("symbol"), null))), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("fix"), kl.fns.cons(kl.fns.cons(new Sym("A"), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("A"), null))), kl.fns.cons(new Sym("-->"), kl.fns.cons(kl.fns.cons(new Sym("A"), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("A"), null))), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("freeze"), kl.fns.cons(new Sym("A"), kl.fns.cons(new Sym("-->"), kl.fns.cons(kl.fns.cons(new Sym("lazy"), kl.fns.cons(new Sym("A"), null)), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("fst"), kl.fns.cons(kl.fns.cons(new Sym("A"), kl.fns.cons(new Sym("*"), kl.fns.cons(new Sym("B"), null))), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("A"), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("function"), kl.fns.cons(kl.fns.cons(new Sym("A"), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("B"), null))), kl.fns.cons(new Sym("-->"), kl.fns.cons(kl.fns.cons(new Sym("A"), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("B"), null))), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("gensym"), kl.fns.cons(new Sym("symbol"), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("symbol"), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("<-vector"), kl.fns.cons(kl.fns.cons(new Sym("vector"), kl.fns.cons(new Sym("A"), null)), kl.fns.cons(new Sym("-->"), kl.fns.cons(kl.fns.cons(new Sym("number"), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("A"), null))), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("vector->"), kl.fns.cons(kl.fns.cons(new Sym("vector"), kl.fns.cons(new Sym("A"), null)), kl.fns.cons(new Sym("-->"), kl.fns.cons(kl.fns.cons(new Sym("number"), kl.fns.cons(new Sym("-->"), kl.fns.cons(kl.fns.cons(new Sym("A"), kl.fns.cons(new Sym("-->"), kl.fns.cons(kl.fns.cons(new Sym("vector"), kl.fns.cons(new Sym("A"), null)), null))), null))), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("vector"), kl.fns.cons(new Sym("number"), kl.fns.cons(new Sym("-->"), kl.fns.cons(kl.fns.cons(new Sym("vector"), kl.fns.cons(new Sym("A"), null)), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("get-time"), kl.fns.cons(new Sym("symbol"), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("number"), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("hash"), kl.fns.cons(new Sym("A"), kl.fns.cons(new Sym("-->"), kl.fns.cons(kl.fns.cons(new Sym("number"), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("number"), null))), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("head"), kl.fns.cons(kl.fns.cons(new Sym("list"), kl.fns.cons(new Sym("A"), null)), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("A"), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("hdv"), kl.fns.cons(kl.fns.cons(new Sym("vector"), kl.fns.cons(new Sym("A"), null)), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("A"), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("hdstr"), kl.fns.cons(new Sym("string"), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("string"), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("if"), kl.fns.cons(new Sym("boolean"), kl.fns.cons(new Sym("-->"), kl.fns.cons(kl.fns.cons(new Sym("A"), kl.fns.cons(new Sym("-->"), kl.fns.cons(kl.fns.cons(new Sym("A"), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("A"), null))), null))), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("it"), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("string"), null))]);

Kl.headCall(kl.fns.declare, [new Sym("implementation"), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("string"), null))]);

Kl.headCall(kl.fns.declare, [new Sym("include"), kl.fns.cons(kl.fns.cons(new Sym("list"), kl.fns.cons(new Sym("symbol"), null)), kl.fns.cons(new Sym("-->"), kl.fns.cons(kl.fns.cons(new Sym("list"), kl.fns.cons(new Sym("symbol"), null)), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("include-all-but"), kl.fns.cons(kl.fns.cons(new Sym("list"), kl.fns.cons(new Sym("symbol"), null)), kl.fns.cons(new Sym("-->"), kl.fns.cons(kl.fns.cons(new Sym("list"), kl.fns.cons(new Sym("symbol"), null)), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("inferences"), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("number"), null))]);

Kl.headCall(kl.fns.declare, [new Sym("shen.insert"), kl.fns.cons(new Sym("A"), kl.fns.cons(new Sym("-->"), kl.fns.cons(kl.fns.cons(new Sym("string"), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("string"), null))), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("integer?"), kl.fns.cons(new Sym("A"), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("boolean"), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("internal"), kl.fns.cons(new Sym("symbol"), kl.fns.cons(new Sym("-->"), kl.fns.cons(kl.fns.cons(new Sym("list"), kl.fns.cons(new Sym("symbol"), null)), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("intersection"), kl.fns.cons(kl.fns.cons(new Sym("list"), kl.fns.cons(new Sym("A"), null)), kl.fns.cons(new Sym("-->"), kl.fns.cons(kl.fns.cons(kl.fns.cons(new Sym("list"), kl.fns.cons(new Sym("A"), null)), kl.fns.cons(new Sym("-->"), kl.fns.cons(kl.fns.cons(new Sym("list"), kl.fns.cons(new Sym("A"), null)), null))), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("kill"), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("A"), null))]);

Kl.headCall(kl.fns.declare, [new Sym("language"), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("string"), null))]);

Kl.headCall(kl.fns.declare, [new Sym("length"), kl.fns.cons(kl.fns.cons(new Sym("list"), kl.fns.cons(new Sym("A"), null)), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("number"), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("limit"), kl.fns.cons(kl.fns.cons(new Sym("vector"), kl.fns.cons(new Sym("A"), null)), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("number"), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("load"), kl.fns.cons(new Sym("string"), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("symbol"), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("map"), kl.fns.cons(kl.fns.cons(new Sym("A"), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("B"), null))), kl.fns.cons(new Sym("-->"), kl.fns.cons(kl.fns.cons(kl.fns.cons(new Sym("list"), kl.fns.cons(new Sym("A"), null)), kl.fns.cons(new Sym("-->"), kl.fns.cons(kl.fns.cons(new Sym("list"), kl.fns.cons(new Sym("B"), null)), null))), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("mapcan"), kl.fns.cons(kl.fns.cons(new Sym("A"), kl.fns.cons(new Sym("-->"), kl.fns.cons(kl.fns.cons(new Sym("list"), kl.fns.cons(new Sym("B"), null)), null))), kl.fns.cons(new Sym("-->"), kl.fns.cons(kl.fns.cons(kl.fns.cons(new Sym("list"), kl.fns.cons(new Sym("A"), null)), kl.fns.cons(new Sym("-->"), kl.fns.cons(kl.fns.cons(new Sym("list"), kl.fns.cons(new Sym("B"), null)), null))), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("maxinferences"), kl.fns.cons(new Sym("number"), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("number"), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("n->string"), kl.fns.cons(new Sym("number"), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("string"), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("nl"), kl.fns.cons(new Sym("number"), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("number"), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("not"), kl.fns.cons(new Sym("boolean"), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("boolean"), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("nth"), kl.fns.cons(new Sym("number"), kl.fns.cons(new Sym("-->"), kl.fns.cons(kl.fns.cons(kl.fns.cons(new Sym("list"), kl.fns.cons(new Sym("A"), null)), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("A"), null))), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("number?"), kl.fns.cons(new Sym("A"), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("boolean"), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("occurrences"), kl.fns.cons(new Sym("A"), kl.fns.cons(new Sym("-->"), kl.fns.cons(kl.fns.cons(new Sym("B"), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("number"), null))), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("occurs-check"), kl.fns.cons(new Sym("symbol"), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("boolean"), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("optimise"), kl.fns.cons(new Sym("symbol"), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("boolean"), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("or"), kl.fns.cons(new Sym("boolean"), kl.fns.cons(new Sym("-->"), kl.fns.cons(kl.fns.cons(new Sym("boolean"), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("boolean"), null))), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("os"), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("string"), null))]);

Kl.headCall(kl.fns.declare, [new Sym("package?"), kl.fns.cons(new Sym("symbol"), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("boolean"), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("port"), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("string"), null))]);

Kl.headCall(kl.fns.declare, [new Sym("porters"), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("string"), null))]);

Kl.headCall(kl.fns.declare, [new Sym("pos"), kl.fns.cons(new Sym("string"), kl.fns.cons(new Sym("-->"), kl.fns.cons(kl.fns.cons(new Sym("number"), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("string"), null))), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("pr"), kl.fns.cons(new Sym("string"), kl.fns.cons(new Sym("-->"), kl.fns.cons(kl.fns.cons(kl.fns.cons(new Sym("stream"), kl.fns.cons(new Sym("out"), null)), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("string"), null))), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("print"), kl.fns.cons(new Sym("A"), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("A"), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("profile"), kl.fns.cons(kl.fns.cons(new Sym("A"), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("B"), null))), kl.fns.cons(new Sym("-->"), kl.fns.cons(kl.fns.cons(new Sym("A"), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("B"), null))), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("preclude"), kl.fns.cons(kl.fns.cons(new Sym("list"), kl.fns.cons(new Sym("symbol"), null)), kl.fns.cons(new Sym("-->"), kl.fns.cons(kl.fns.cons(new Sym("list"), kl.fns.cons(new Sym("symbol"), null)), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("shen.proc-nl"), kl.fns.cons(new Sym("string"), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("string"), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("profile-results"), kl.fns.cons(kl.fns.cons(new Sym("A"), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("B"), null))), kl.fns.cons(new Sym("-->"), kl.fns.cons(kl.fns.cons(kl.fns.cons(new Sym("A"), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("B"), null))), kl.fns.cons(new Sym("*"), kl.fns.cons(new Sym("number"), null))), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("protect"), kl.fns.cons(new Sym("symbol"), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("symbol"), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("preclude-all-but"), kl.fns.cons(kl.fns.cons(new Sym("list"), kl.fns.cons(new Sym("symbol"), null)), kl.fns.cons(new Sym("-->"), kl.fns.cons(kl.fns.cons(new Sym("list"), kl.fns.cons(new Sym("symbol"), null)), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("shen.prhush"), kl.fns.cons(new Sym("string"), kl.fns.cons(new Sym("-->"), kl.fns.cons(kl.fns.cons(kl.fns.cons(new Sym("stream"), kl.fns.cons(new Sym("out"), null)), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("string"), null))), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("ps"), kl.fns.cons(new Sym("symbol"), kl.fns.cons(new Sym("-->"), kl.fns.cons(kl.fns.cons(new Sym("list"), kl.fns.cons(new Sym("unit"), null)), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("read"), kl.fns.cons(kl.fns.cons(new Sym("stream"), kl.fns.cons(new Sym("in"), null)), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("unit"), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("read-byte"), kl.fns.cons(kl.fns.cons(new Sym("stream"), kl.fns.cons(new Sym("in"), null)), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("number"), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("read-file-as-bytelist"), kl.fns.cons(new Sym("string"), kl.fns.cons(new Sym("-->"), kl.fns.cons(kl.fns.cons(new Sym("list"), kl.fns.cons(new Sym("number"), null)), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("read-file-as-string"), kl.fns.cons(new Sym("string"), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("string"), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("read-file"), kl.fns.cons(new Sym("string"), kl.fns.cons(new Sym("-->"), kl.fns.cons(kl.fns.cons(new Sym("list"), kl.fns.cons(new Sym("unit"), null)), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("read-from-string"), kl.fns.cons(new Sym("string"), kl.fns.cons(new Sym("-->"), kl.fns.cons(kl.fns.cons(new Sym("list"), kl.fns.cons(new Sym("unit"), null)), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("release"), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("string"), null))]);

Kl.headCall(kl.fns.declare, [new Sym("remove"), kl.fns.cons(new Sym("A"), kl.fns.cons(new Sym("-->"), kl.fns.cons(kl.fns.cons(kl.fns.cons(new Sym("list"), kl.fns.cons(new Sym("A"), null)), kl.fns.cons(new Sym("-->"), kl.fns.cons(kl.fns.cons(new Sym("list"), kl.fns.cons(new Sym("A"), null)), null))), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("reverse"), kl.fns.cons(kl.fns.cons(new Sym("list"), kl.fns.cons(new Sym("A"), null)), kl.fns.cons(new Sym("-->"), kl.fns.cons(kl.fns.cons(new Sym("list"), kl.fns.cons(new Sym("A"), null)), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("simple-error"), kl.fns.cons(new Sym("string"), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("A"), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("snd"), kl.fns.cons(kl.fns.cons(new Sym("A"), kl.fns.cons(new Sym("*"), kl.fns.cons(new Sym("B"), null))), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("B"), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("specialise"), kl.fns.cons(new Sym("symbol"), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("symbol"), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("spy"), kl.fns.cons(new Sym("symbol"), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("boolean"), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("step"), kl.fns.cons(new Sym("symbol"), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("boolean"), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("stinput"), kl.fns.cons(new Sym("-->"), kl.fns.cons(kl.fns.cons(new Sym("stream"), kl.fns.cons(new Sym("in"), null)), null))]);

Kl.headCall(kl.fns.declare, [new Sym("sterror"), kl.fns.cons(new Sym("-->"), kl.fns.cons(kl.fns.cons(new Sym("stream"), kl.fns.cons(new Sym("out"), null)), null))]);

Kl.headCall(kl.fns.declare, [new Sym("stoutput"), kl.fns.cons(new Sym("-->"), kl.fns.cons(kl.fns.cons(new Sym("stream"), kl.fns.cons(new Sym("out"), null)), null))]);

Kl.headCall(kl.fns.declare, [new Sym("string?"), kl.fns.cons(new Sym("A"), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("boolean"), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("str"), kl.fns.cons(new Sym("A"), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("string"), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("string->n"), kl.fns.cons(new Sym("string"), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("number"), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("string->symbol"), kl.fns.cons(new Sym("string"), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("symbol"), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("sum"), kl.fns.cons(kl.fns.cons(new Sym("list"), kl.fns.cons(new Sym("number"), null)), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("number"), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("symbol?"), kl.fns.cons(new Sym("A"), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("boolean"), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("systemf"), kl.fns.cons(new Sym("symbol"), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("symbol"), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("tail"), kl.fns.cons(kl.fns.cons(new Sym("list"), kl.fns.cons(new Sym("A"), null)), kl.fns.cons(new Sym("-->"), kl.fns.cons(kl.fns.cons(new Sym("list"), kl.fns.cons(new Sym("A"), null)), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("tlstr"), kl.fns.cons(new Sym("string"), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("string"), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("tlv"), kl.fns.cons(kl.fns.cons(new Sym("vector"), kl.fns.cons(new Sym("A"), null)), kl.fns.cons(new Sym("-->"), kl.fns.cons(kl.fns.cons(new Sym("vector"), kl.fns.cons(new Sym("A"), null)), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("tc"), kl.fns.cons(new Sym("symbol"), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("boolean"), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("tc?"), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("boolean"), null))]);

Kl.headCall(kl.fns.declare, [new Sym("thaw"), kl.fns.cons(kl.fns.cons(new Sym("lazy"), kl.fns.cons(new Sym("A"), null)), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("A"), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("track"), kl.fns.cons(new Sym("symbol"), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("symbol"), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("trap-error"), kl.fns.cons(new Sym("A"), kl.fns.cons(new Sym("-->"), kl.fns.cons(kl.fns.cons(kl.fns.cons(new Sym("exception"), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("A"), null))), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("A"), null))), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("tuple?"), kl.fns.cons(new Sym("A"), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("boolean"), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("undefmacro"), kl.fns.cons(new Sym("symbol"), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("symbol"), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("union"), kl.fns.cons(kl.fns.cons(new Sym("list"), kl.fns.cons(new Sym("A"), null)), kl.fns.cons(new Sym("-->"), kl.fns.cons(kl.fns.cons(kl.fns.cons(new Sym("list"), kl.fns.cons(new Sym("A"), null)), kl.fns.cons(new Sym("-->"), kl.fns.cons(kl.fns.cons(new Sym("list"), kl.fns.cons(new Sym("A"), null)), null))), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("unprofile"), kl.fns.cons(kl.fns.cons(new Sym("A"), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("B"), null))), kl.fns.cons(new Sym("-->"), kl.fns.cons(kl.fns.cons(new Sym("A"), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("B"), null))), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("untrack"), kl.fns.cons(new Sym("symbol"), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("symbol"), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("unspecialise"), kl.fns.cons(new Sym("symbol"), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("symbol"), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("variable?"), kl.fns.cons(new Sym("A"), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("boolean"), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("vector?"), kl.fns.cons(new Sym("A"), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("boolean"), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("version"), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("string"), null))]);

Kl.headCall(kl.fns.declare, [new Sym("write-to-file"), kl.fns.cons(new Sym("string"), kl.fns.cons(new Sym("-->"), kl.fns.cons(kl.fns.cons(new Sym("A"), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("A"), null))), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("write-byte"), kl.fns.cons(new Sym("number"), kl.fns.cons(new Sym("-->"), kl.fns.cons(kl.fns.cons(kl.fns.cons(new Sym("stream"), kl.fns.cons(new Sym("out"), null)), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("number"), null))), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("y-or-n?"), kl.fns.cons(new Sym("string"), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("boolean"), null)))]);

Kl.headCall(kl.fns.declare, [new Sym(">"), kl.fns.cons(new Sym("number"), kl.fns.cons(new Sym("-->"), kl.fns.cons(kl.fns.cons(new Sym("number"), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("boolean"), null))), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("<"), kl.fns.cons(new Sym("number"), kl.fns.cons(new Sym("-->"), kl.fns.cons(kl.fns.cons(new Sym("number"), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("boolean"), null))), null)))]);

Kl.headCall(kl.fns.declare, [new Sym(">="), kl.fns.cons(new Sym("number"), kl.fns.cons(new Sym("-->"), kl.fns.cons(kl.fns.cons(new Sym("number"), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("boolean"), null))), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("<="), kl.fns.cons(new Sym("number"), kl.fns.cons(new Sym("-->"), kl.fns.cons(kl.fns.cons(new Sym("number"), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("boolean"), null))), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("="), kl.fns.cons(new Sym("A"), kl.fns.cons(new Sym("-->"), kl.fns.cons(kl.fns.cons(new Sym("A"), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("boolean"), null))), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("+"), kl.fns.cons(new Sym("number"), kl.fns.cons(new Sym("-->"), kl.fns.cons(kl.fns.cons(new Sym("number"), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("number"), null))), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("/"), kl.fns.cons(new Sym("number"), kl.fns.cons(new Sym("-->"), kl.fns.cons(kl.fns.cons(new Sym("number"), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("number"), null))), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("-"), kl.fns.cons(new Sym("number"), kl.fns.cons(new Sym("-->"), kl.fns.cons(kl.fns.cons(new Sym("number"), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("number"), null))), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("*"), kl.fns.cons(new Sym("number"), kl.fns.cons(new Sym("-->"), kl.fns.cons(kl.fns.cons(new Sym("number"), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("number"), null))), null)))]);

Kl.headCall(kl.fns.declare, [new Sym("=="), kl.fns.cons(new Sym("A"), kl.fns.cons(new Sym("-->"), kl.fns.cons(kl.fns.cons(new Sym("B"), kl.fns.cons(new Sym("-->"), kl.fns.cons(new Sym("boolean"), null))), null)))]);
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(4)))

/***/ })
/******/ ]);