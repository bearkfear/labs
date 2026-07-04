import { For } from 'solid-js'
import { Title } from '@solidjs/meta'

type CounterItem = {
  label: string
  value: number
}

type HomeProps = {
  headline: string
  message: string
  counters: CounterItem[]
}

export default function Home(props: HomeProps) {
  return (
    <>
      <Title>{props.headline}</Title>
      <div class="hero">
        <p class="eyebrow">POC Rust</p>
        <h1>{props.headline}</h1>
        <p>{props.message}</p>
      </div>

      <div class="metrics">
        <For each={props.counters}>
          {(item) => (
            <article class="metric">
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </article>
          )}
        </For>
      </div>
    </>
  )
}
