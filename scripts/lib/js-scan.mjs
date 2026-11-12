// A small JavaScript/TypeScript tokenizer for the import and licence checks. It is not a
// parser: it only needs to know what is a comment, a string, a template literal or a regex
// literal, so that text inside them is never mistaken for code (and code is never hidden
// by a "/*" inside a string).

const IDENT_START = /[A-Za-z_$\u0080-￿]/;
const IDENT_PART = /[\w$\u0080-￿]/;
// After these keywords a "/" starts a regex literal, not a division.
const REGEX_AFTER_WORD = new Set([
  'return', 'typeof', 'instanceof', 'in', 'of', 'new', 'delete', 'void', 'throw', 'case', 'do', 'else', 'yield', 'await',
]);

/**
 * Tokens of `src`. Each token is `{ type, value, start }` where type is one of
 * `ident`, `number`, `punct`, `string` (also a template literal without `${}`; value is
 * its text), `template` (with substitutions; value null; the substitutions are tokenized
 * as code) or `regex`. Comments are dropped. `code` is `src` with comments and the
 * contents of strings, templates and regex literals blanked to spaces (line breaks kept).
 */
export function scan(src) {
  const tokens = [];
  const out = src.split('');
  const blank = (from, to) => {
    for (let k = from; k < to; k++) if (out[k] !== '\n' && out[k] !== '\r') out[k] = ' ';
  };
  const braces = []; // for each open "{" or "${": true if it opened a template substitution
  let i = 0;
  const n = src.length;

  const prevSignificant = () => tokens[tokens.length - 1];
  const regexAllowed = () => {
    const t = prevSignificant();
    if (!t) return true;
    if (t.type === 'number' || t.type === 'string' || t.type === 'template' || t.type === 'regex') return false;
    if (t.type === 'ident') return REGEX_AFTER_WORD.has(t.value);
    return !(t.value === ')' || t.value === ']' || t.value === '}');
  };

  // Scans a template body from i (just after "`" or a closing "}" of a substitution).
  // Returns true if it ended at "${" (a substitution follows), false at the closing "`".
  const templateBody = (tokStart, isHead) => {
    let text = '';
    const bodyStart = i;
    while (i < n) {
      const c = src[i];
      if (c === '\\') {
        text += src[i + 1] ?? '';
        i += 2;
      } else if (c === '`') {
        blank(bodyStart, i);
        i++;
        if (isHead) tokens.push({ type: 'string', value: text, start: tokStart });
        return false;
      } else if (c === '$' && src[i + 1] === '{') {
        blank(bodyStart, i);
        i += 2;
        if (isHead) tokens.push({ type: 'template', value: null, start: tokStart });
        braces.push(true);
        return true;
      } else {
        text += c;
        i++;
      }
    }
    blank(bodyStart, n);
    if (isHead) tokens.push({ type: 'string', value: text, start: tokStart });
    return false;
  };

  while (i < n) {
    const c = src[i];
    const d = src[i + 1];
    if (c === '/' && d === '/') {
      const end = src.indexOf('\n', i);
      const stop = end < 0 ? n : end;
      blank(i, stop);
      i = stop;
    } else if (c === '/' && d === '*') {
      const end = src.indexOf('*/', i + 2);
      const stop = end < 0 ? n : end + 2;
      blank(i, stop);
      i = stop;
    } else if (c === '"' || c === "'") {
      const start = i;
      let text = '';
      i++;
      while (i < n && src[i] !== c && src[i] !== '\n') {
        if (src[i] === '\\') {
          text += src[i + 1] ?? '';
          i += 2;
        } else text += src[i++];
      }
      blank(start + 1, i);
      i++;
      tokens.push({ type: 'string', value: text, start });
    } else if (c === '`') {
      const start = i;
      i++;
      templateBody(start, true);
    } else if (c === '}' && braces.length && braces[braces.length - 1]) {
      braces.pop();
      i++;
      templateBody(i, false);
    } else if (c === '/' && regexAllowed()) {
      const start = i;
      let inClass = false;
      i++;
      while (i < n && src[i] !== '\n') {
        const r = src[i];
        if (r === '/' && !inClass) break;
        if (r === '[') inClass = true;
        else if (r === ']') inClass = false;
        i += r === '\\' ? 2 : 1;
      }
      blank(start + 1, i);
      i++;
      while (i < n && IDENT_PART.test(src[i])) i++;
      tokens.push({ type: 'regex', value: null, start });
    } else if (IDENT_START.test(c)) {
      const start = i;
      while (i < n && IDENT_PART.test(src[i])) i++;
      tokens.push({ type: 'ident', value: src.slice(start, i), start });
    } else if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(d ?? ''))) {
      const start = i;
      while (i < n && /[\w.]/.test(src[i])) i++;
      tokens.push({ type: 'number', value: src.slice(start, i), start });
    } else if (/\s/.test(c)) {
      i++;
    } else {
      if (c === '{') braces.push(false);
      else if (c === '}') braces.pop();
      tokens.push({ type: 'punct', value: c, start: i });
      i++;
    }
  }
  return { tokens, code: out.join('') };
}

/**
 * Module specifiers that `src` loads, and problems: `import x from 'a'`, `export … from 'a'`,
 * `import 'a'`, `import('a')` and `require('a')` (string or plain template literal), plus
 * `import(expr)` / `require(expr)` with a computed specifier and any `createRequire`.
 */
export function findImports(src) {
  const { tokens } = scan(src);
  const specs = [];
  const problems = [];
  const at = (k) => tokens[k] ?? { type: 'eof', value: null };
  for (let k = 0; k < tokens.length; k++) {
    const t = tokens[k];
    if (t.type !== 'ident') continue;
    const before = at(k - 1);
    if (before.type === 'punct' && before.value === '.') continue; // a property, e.g. x.require
    if (t.value === 'from' && at(k + 1).type === 'string') specs.push(at(k + 1).value);
    else if (t.value === 'import' && at(k + 1).type === 'string') specs.push(at(k + 1).value);
    else if ((t.value === 'import' || t.value === 'require') && at(k + 1).value === '(') {
      const arg = at(k + 2);
      const close = at(k + 3);
      if (arg.type === 'string' && (close.value === ')' || close.value === ',')) specs.push(arg.value);
      else problems.push(`${t.value}() with a computed specifier`);
    } else if (t.value === 'createRequire') problems.push('uses createRequire');
  }
  return { specs, problems, strings: tokens.filter((x) => x.type === 'string').map((x) => x.value) };
}

/** The package name of a bare specifier ("@scope/pkg/sub" → "@scope/pkg"), or null if relative. */
export function packageName(spec) {
  if (spec.startsWith('.') || spec.startsWith('/')) return null;
  return spec.startsWith('@') ? spec.split('/').slice(0, 2).join('/') : spec.split('/')[0];
}
