import { For } from 'solid-js'
import { Title } from '@solidjs/meta'

type AboutProps = {
  title: string
  stack: string[]
}

export default function About(props: AboutProps) {
  return (
    <>
      <Title>{props.title}</Title>
      <div class="panel">
        <p class="eyebrow">Stack</p>
        <h1>{props.title}</h1>
        <p>
          Essa rota também vem do Axum. O Inertia troca a página sem API separada
          e sem roteador client-side dedicado.
        </p>
        <div class="chips">
          <For each={props.stack}>{(item) => <span>{item}</span>}</For>
        </div>
      </div>
    </>
  )
}
