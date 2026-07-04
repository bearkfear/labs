import type { PageProps } from '@inertiajs/core'

export type NavItem = {
  label: string
  href: string
}

export type LayoutData = {
  name: 'app'
  appName: string
  nav: NavItem[]
  server: {
    user: string
    host: string
    cwd: string
  }
}

export type PlainLayoutData = {
  name: 'plain'
  server: LayoutData['server']
}

export type SharedPageProps = PageProps & {
  layout: LayoutData | PlainLayoutData
}
