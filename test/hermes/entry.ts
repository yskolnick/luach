import { computeVectors } from './vectors.js';
declare const print: ((s: string) => void) | undefined;
const json = JSON.stringify(computeVectors());
if (typeof print === 'function') print(json);
else console.log(json);
