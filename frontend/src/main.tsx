import { createInertiaApp } from 'inertia-adapter-solid'
import type { Component } from 'solid-js'
import type { JSX } from 'solid-js'
import { render } from 'solid-js/web'
import Layout from './Shared/Layout'
import type { SharedPageProps } from './types'
import './styles.css'

type PageModule = {
  default: Component & {
    layout?: Component<SharedPageProps & { children: JSX.Element }>
  }
}

createInertiaApp({
  resolve(name) {
    const pages = import.meta.glob<PageModule>('./Pages/**/*.tsx')
    return pages[`./Pages/${name}.tsx`]?.().then((module) => {
      module.default.layout = (props) => (
        <Layout layout={props.layout}>
          {props.children}
        </Layout>
      )

      return module.default
    })
  },
  setup({ el, App, props }) {
    render(() => <App {...props} />, el)
  },
})
