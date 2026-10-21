# Hebrew text and right-to-left

Put a Hebrew date inside left-to-right text and it can come out with its parts in the wrong order. The Unicode
Bidirectional Algorithm (UAX #9) decides the order of neutral characters (digits, punctuation, spaces) from the text
around them, so the geresh, gershayim and the space between day, month and year can attach to the wrong side.

Wrapping the Hebrew in a right-to-left *isolate* (U+2067 … U+2069) makes the algorithm treat it as one unit:

```ts
const text = formatHebrewDate(date, { style: 'he', isolate: true });
const any = isolateRtl(hebrewText);   // wrap any Hebrew string
```

## See it

The same English sentence with a Hebrew date and a number after it, first as plain text, then with the date
wrapped in an isolate:

<div style="border:1px solid var(--vp-c-divider);border-radius:8px;padding:12px 16px;margin:16px 0">
<p dir="ltr" style="margin:4px 0">Without: Purim is on י״ד אדר ב׳ תשפ״ז, 3 weeks away.</p>
<p dir="ltr" style="margin:4px 0">With: Purim is on ⁧י״ד אדר ב׳ תשפ״ז⁩, 3 weeks away.</p>
</div>

In the first line the comma and the "3" are pulled into the Hebrew run, so the sentence reads in the wrong order; in
the second line the isolate keeps the date in one piece.

Isolates are off by default because the marks are invisible, and a few older systems draw them as boxes. In HTML you
can use `<bdi>` or `dir="rtl"` on the element instead.
