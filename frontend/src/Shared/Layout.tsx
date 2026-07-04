import { Link, usePage } from 'inertia-adapter-solid'
import { For } from 'solid-js'
import type { JSX } from 'solid-js'
import type { LayoutData, PlainLayoutData, SharedPageProps } from '../types'

type LayoutProps = {
  children: JSX.Element
  layout: SharedPageProps['layout']
}

export default function Layout(props: LayoutProps) {
  const page = usePage<SharedPageProps>()

  if (props.layout.name === 'plain') {
    return <PlainLayout layout={props.layout}>{props.children}</PlainLayout>
  }

  return (
    <AppLayout layout={props.layout} url={page.url}>
      {props.children}
    </AppLayout>
  )
}

function AppLayout(props: {
  children: JSX.Element
  layout: LayoutData
  url: string
}) {
  return (
    <main class="shell">
      <nav class="nav">
        <div class="brand">{props.layout.appName}</div>
        <div class="links">
          <For each={props.layout.nav}>
            {(item) => (
              <Link
                href={item.href}
                class={props.url === item.href ? 'active' : undefined}
              >
                {item.label}
              </Link>
            )}
          </For>
        </div>
      </nav>
      <aside class="server-strip">
        <span>layout: app</span>
        <span>server user: {props.layout.server.user}</span>
        <span>host: {props.layout.server.host}</span>
        <span>cwd: {props.layout.server.cwd}</span>
      </aside>
      <section class="content">{props.children}</section>
    </main>
  )
}

function PlainLayout(props: { children: JSX.Element; layout: PlainLayoutData }) {
  return (
    <main class="shell plain-shell">
      <aside class="server-strip">
        <span>layout: plain</span>
        <span>server user: {props.layout.server.user}</span>
        <span>host: {props.layout.server.host}</span>
      </aside>
      <section class="content">{props.children}</section>
    </main>
  )
}
