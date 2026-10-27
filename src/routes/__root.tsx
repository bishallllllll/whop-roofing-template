import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'

import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Apex Shield Roofing | Premier US Residential & Commercial Roofing',
      },
      {
        name: 'description',
        content: 'GAF Master Elite certified roofing contractor providing residential roof replacement, commercial flat roofing, storm damage repair, and annual maintenance plans powered by Whop.',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
      {
        rel: 'preconnect',
        href: 'https://fonts.googleapis.com',
      },
      {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossOrigin: 'anonymous',
      },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap',
      },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        <script src="https://cdn.whop.com/elements/amber/elements.js" async></script>
      </head>
      <body className="bg-slate-950 text-slate-100 font-['Plus_Jakarta_Sans',sans-serif] antialiased selection:bg-amber-500 selection:text-slate-950">
        {children}
        <Scripts />
      </body>
    </html>
  )
}
