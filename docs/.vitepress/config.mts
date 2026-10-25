import { defineConfig } from 'vitepress';
import typedocSidebar from '../api/typedoc-sidebar.json';

export default defineConfig({
  title: 'Luach',
  description: 'Hebrew calendar, holidays, parsha, learning cycles and zmanim for JavaScript.',
  base: process.env.DOCS_BASE ?? '/',
  cleanUrls: true,
  lastUpdated: false,
  srcExclude: ['research/data/**', 'decisions/adr-template.md'],
  // Links to files in the repository (outside docs/) are not pages.
  ignoreDeadLinks: [/^\.\.\//, /^\.\/schema\//, /\/LICENSE$/, /\/NOTICE$/],
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'Zmanim sources', link: '/halacha/zmanim' },
      { text: 'Halachic choices', link: '/halacha/choices' },
      { text: 'Sources', link: '/sources' },
      { text: 'Accuracy', link: '/accuracy' },
      { text: 'API', link: '/api/' },
    ],
    sidebar: {
      '/api/': [{ text: 'API reference', items: typedocSidebar }],
      '/': [
        {
          text: 'Guide',
          items: [
            { text: 'Getting started', link: '/guide/getting-started' },
            { text: 'Dates', link: '/guide/dates' },
            { text: 'Holidays', link: '/guide/holidays' },
            { text: 'Parsha and haftara', link: '/guide/parsha' },
            { text: 'Learning cycles', link: '/guide/learning' },
            { text: 'Zmanim', link: '/guide/zmanim' },
            { text: 'Places', link: '/guide/places' },
            { text: 'JSON, iCal, CLI', link: '/guide/outputs' },
            { text: 'Right-to-left text', link: '/guide/rtl' },
            { text: 'React Native', link: '/guide/react-native' },
          ],
        },
        {
          text: 'Halacha',
          items: [
            { text: 'Notes', link: '/halacha/' },
            { text: 'Zmanim and sources', link: '/halacha/zmanim' },
            { text: 'Halachic choices and calculations', link: '/halacha/choices' },
                ],
        },
        {
          text: 'Project',
          items: [
            { text: 'Sources', link: '/sources' },
            { text: 'Accuracy', link: '/accuracy' },
            { text: 'Zmanim accuracy table', link: '/accuracy-zmanim' },
            { text: 'Data sources', link: '/data-sources' },
            { text: 'Licence and credit', link: '/licence' },
          ],
        },
      ],
    },
    socialLinks: [{ icon: 'github', link: 'https://github.com/yskolnick/luach' }],
    footer: { message: 'Ask your rav. This library calculates; it does not rule.', copyright: 'Apache-2.0 · Yosef Skolnick' },
  },
});
