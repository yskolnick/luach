# Right-to-left text

A Hebrew date inside left-to-right text can display scrambled. The Unicode bidirectional
algorithm decides the order of "neutral" characters (spaces, digits, punctuation) from the
strong letters around them, so in an English sentence `י״ד אדר תשפ״ז, 2027` may show its
parts swapped.

Pass `{ isolate: true }` to wrap Hebrew output in invisible Unicode *isolates*
(U+2067 RIGHT-TO-LEFT ISOLATE … U+2069 POP DIRECTIONAL ISOLATE). The wrapped text is laid out
as one right-to-left unit that cannot mix with its neighbours.

```ts
formatHebrewDate(d, { isolate: true }); // "⁧י״ד אדר תשפ״ז⁩"
```

It is opt-in because the isolates are real characters: they count in `length`, and they
appear when text is compared or copied. `stripBidiControls()` removes them. In HTML, prefer
`<bdi>` or `dir="rtl"` on the element.
