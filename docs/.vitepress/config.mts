import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'Luach',
  description: 'Hebrew calendar and zmanim for JavaScript. Every opinion named and sourced.',
  cleanUrls: true,
  srcExclude: ['research/**/*.md', 'decisions/adr-template.md'],
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'Recipes', link: '/recipes/dates' },
      { text: 'Halachic notes', link: '/halacha/opinions' },
      { text: 'API', link: '/api/' },
      { text: 'Accuracy', link: '/accuracy' },
      { text: 'Licence & credit', link: '/guide/licence' },
    ],
    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Getting started', link: '/guide/getting-started' },
          { text: 'Concepts', link: '/guide/concepts' },
          { text: 'Time zones and React Native', link: '/guide/time-zones' },
          { text: 'Licence and how to credit', link: '/guide/licence' },
        ],
      },
      {
        text: 'Recipes',
        items: [
          { text: 'Dates and formatting', link: '/recipes/dates' },
          { text: 'Holidays and fasts', link: '/recipes/holidays' },
          { text: 'Parsha', link: '/recipes/parsha' },
          { text: 'Zmanim', link: '/recipes/zmanim' },
          { text: 'Shabbos and Yom Tov times', link: '/recipes/shabbos' },
          { text: 'Places and location', link: '/recipes/places' },
          { text: 'A whole day as JSON', link: '/recipes/day-json' },
          { text: 'iCal export', link: '/recipes/ical' },
          { text: 'Command line', link: '/recipes/cli' },
          { text: 'Hebrew text and RTL', link: '/recipes/rtl' },
        ],
      },
      {
        text: 'Reference',
        items: [
          { text: 'Halachic notes', link: '/halacha/opinions' },
          { text: 'API', link: '/api/' },
          { text: 'Accuracy report', link: '/accuracy' },
          { text: 'Data sources', link: '/data-sources' },
        ],
      },
    ],
    footer: {
      message: 'Ask your rav. This library calculates; it does not rule.',
      copyright: 'Apache-2.0 · Built on Luach by Yosef Skolnick',
    },
  },
});
