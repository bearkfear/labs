import { Title } from '@solidjs/meta'
import { For, createSignal, onCleanup, onMount } from 'solid-js'
import * as THREE from 'three'

type FlowNode = {
  id: string
  label: string
  group: 'server' | 'bridge' | 'shared' | 'client'
  x: number
  y: number
}

type FlowEdge = {
  from: string
  to: string
  label: string
}

type ArchitectureProps = {
  title: string
  nodes: FlowNode[]
  edges: FlowEdge[]
}

const nodeTheme: Record<FlowNode['group'], { title: string; color: string }> = {
  server: { title: 'Rust', color: '#18a28f' },
  bridge: { title: 'Bridge', color: '#f5b84b' },
  shared: { title: 'Shared', color: '#e15b64' },
  client: { title: 'Solid', color: '#7c8cff' },
}

export default function Architecture(props: ArchitectureProps) {
  let canvas!: HTMLCanvasElement
  let frame = 0
  const [ready, setReady] = createSignal(false)

  onMount(() => {
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
    })
    renderer.setClearColor(0x000000, 0)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 20)
    camera.position.z = 10

    const root = new THREE.Group()
    scene.add(root)

    const nodeMap = new Map(props.nodes.map((node) => [node.id, node]))
    const curves = props.edges
      .map((edge) => {
        const from = nodeMap.get(edge.from)
        const to = nodeMap.get(edge.to)
        if (!from || !to) return null

        const start = toScenePoint(from)
        const end = toScenePoint(to)
        const lift = Math.abs(end.x - start.x) * 0.16 + 0.1
        const control = new THREE.Vector3(
          (start.x + end.x) / 2,
          (start.y + end.y) / 2 + lift,
          0,
        )

        return new THREE.QuadraticBezierCurve3(start, control, end)
      })
      .filter(Boolean) as THREE.QuadraticBezierCurve3[]

    const background = new THREE.Group()
    root.add(background)

    for (let i = 0; i < 9; i += 1) {
      const beam = new THREE.Mesh(
        new THREE.PlaneGeometry(0.055, 3.2),
        new THREE.MeshBasicMaterial({
          color: i % 2 === 0 ? 0xf5b84b : 0xe15b64,
          transparent: true,
          opacity: 0.12,
        }),
      )
      beam.position.set(-1.25 + i * 0.32, 0, -1)
      beam.rotation.z = -0.52
      background.add(beam)
    }

    const rings = new THREE.Group()
    root.add(rings)
    for (let i = 0; i < 5; i += 1) {
      rings.add(
        new THREE.Line(
          new THREE.BufferGeometry().setFromPoints(makeCircle(0.18 + i * 0.12)),
          new THREE.LineBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.08,
          }),
        ),
      )
    }
    rings.position.set(-0.35, -0.08, -0.4)

    for (const curve of curves) {
      root.add(
        new THREE.Line(
          new THREE.BufferGeometry().setFromPoints(curve.getPoints(60)),
          new THREE.LineBasicMaterial({
            color: 0xfff2c4,
            transparent: true,
            opacity: 0.5,
          }),
        ),
      )
    }

    const packets = curves.flatMap((curve, curveIndex) =>
      [0, 0.33, 0.66].map((offset) => {
        const mesh = new THREE.Mesh(
          new THREE.CircleGeometry(0.018, 24),
          new THREE.MeshBasicMaterial({
            color: curveIndex % 2 === 0 ? 0x18a28f : 0xf5b84b,
            transparent: true,
            opacity: 0.95,
          }),
        )
        mesh.userData.curve = curve
        mesh.userData.offset = offset
        root.add(mesh)
        return mesh
      }),
    )

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      renderer.setSize(rect.width, rect.height, false)
    }

    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    resize()
    setReady(true)

    const animate = () => {
      frame = requestAnimationFrame(animate)
      const time = performance.now() * 0.001

      background.position.x = Math.sin(time * 0.35) * 0.05
      rings.rotation.z = time * 0.28
      rings.scale.setScalar(1 + Math.sin(time * 1.4) * 0.04)

      for (const packet of packets) {
        const curve = packet.userData.curve as THREE.QuadraticBezierCurve3
        const offset = packet.userData.offset as number
        const point = curve.getPoint((time * 0.18 + offset) % 1)
        packet.position.copy(point)
        packet.scale.setScalar(1 + Math.sin(time * 7 + offset * 10) * 0.25)
      }

      renderer.render(scene, camera)
    }
    animate()

    onCleanup(() => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      renderer.dispose()
      root.clear()
    })
  })

  return (
    <>
      <Title>{props.title}</Title>
      <section class="architecture-page">
        <canvas
          ref={canvas}
          class="architecture-cinema-canvas"
          data-ready={ready() ? 'true' : 'false'}
        />

        <div class="architecture-copy">
          <p class="eyebrow">Architecture</p>
          <h1>{props.title}</h1>
          <p>
            Uma tomada do fluxo inteiro: Rust escolhe a page, a ponte Inertia
            monta o page object, o root entrega o payload e Solid separa layout
            de conteúdo.
          </p>
        </div>

        <div class="node-board">
          <For each={props.nodes}>
            {(node) => (
              <article
                class="flow-node"
                style={{
                  '--node-color': nodeTheme[node.group].color,
                  left: `${nodeLeft(node)}%`,
                  top: `${nodeTop(node)}%`,
                }}
              >
                <span>{nodeTheme[node.group].title}</span>
                <strong>{node.label}</strong>
              </article>
            )}
          </For>
        </div>

        <ol class="film-strip">
          <For each={props.edges}>
            {(edge, index) => (
              <li>
                <em>{String(index() + 1).padStart(2, '0')}</em>
                <strong>{edge.label}</strong>
                <span>
                  {edge.from} {'->'} {edge.to}
                </span>
              </li>
            )}
          </For>
        </ol>
      </section>
    </>
  )
}

function toScenePoint(node: FlowNode) {
  return new THREE.Vector3((nodeLeft(node) - 50) / 52, (50 - nodeTop(node)) / 50, 0)
}

function nodeLeft(node: FlowNode) {
  return clamp(((node.x + 5.2) / 10.4) * 100, 8, 92)
}

function nodeTop(node: FlowNode) {
  return clamp(((3.3 - node.y) / 4.3) * 100 + 30, 32, 88)
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function makeCircle(radius: number) {
  const points: THREE.Vector3[] = []
  for (let i = 0; i <= 96; i += 1) {
    const angle = (i / 96) * Math.PI * 2
    points.push(new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, 0))
  }
  return points
}
