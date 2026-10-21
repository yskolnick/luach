// A React component showing today's date and zmanim. `npm install luach`, then drop this into your app.
import { useMemo, useState } from 'react';
import { getDay, findCity, dayNumberInZone, type Location } from 'luach';

export function LuachToday({ cityName = 'Lakewood' }: { cityName?: string }) {
  const city = findCity(cityName);
  // Let the user choose; default from the city.
  const [calendar, setCalendar] = useState<Location>(city?.israel ? 'israel' : 'diaspora');
  const day = useMemo(
    () => (city ? getDay(dayNumberInZone(Date.now(), city.timeZone), { location: city, calendar }) : null),
    [city, calendar],
  );
  if (!city || !day) return <p>Unknown city: {cityName}</p>;

  return (
    <section>
      <h2>
        {day.hebrew.text} · <bdi dir="rtl">{day.hebrew.textHebrew}</bdi>
      </h2>
      <p>
        {city.name} ·{' '}
        <select value={calendar} onChange={(e) => setCalendar(e.target.value as Location)} aria-label="Calendar">
          <option value="diaspora">Diaspora</option>
          <option value="israel">Israel</option>
        </select>{' '}
        · {day.parsha.name}
      </p>
      {day.holidays.length > 0 && <p>{day.holidays.map((h) => h.name).join(' · ')}</p>}
      <table>
        <tbody>
          {Object.entries(day.zmanim).map(([key, z]) => (
            <tr key={key}>
              <td>{z.local ?? '—'}</td>
              <td title={z.source}>{z.opinion}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <small>Built on Luach by Yosef Skolnick. Ask your rav: this calculates; it does not rule.</small>
    </section>
  );
}
