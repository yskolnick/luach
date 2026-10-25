// A React component for one day. `npm install luach react`.
import { useMemo } from 'react';
import { dayInfo, ashkenazi } from 'luach';

export function Day({ date, place }) {
  const info = useMemo(() => dayInfo(date, { location: place, locale: ashkenazi }), [date, place]);
  return (
    <section>
      <h2>
        {info.weekdayName}, {info.hebrew.formatted}
      </h2>
      <ul>
        {info.events.map((e) => (
          <li key={e.id + (e.day ?? '')}>{e.name}</li>
        ))}
      </ul>
      {info.parsha?.name && <p>Parshas {info.parsha.name}</p>}
      <table>
        <tbody>
          {info.zmanim.map((z) => (
            <tr key={z.id} title={`${z.opinion}. ${z.source}`}>
              <td>{z.id}</td>
              <td>{z.local ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <small>Ask your rav. Luach calculates; it does not rule.</small>
    </section>
  );
}
