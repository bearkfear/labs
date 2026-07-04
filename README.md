## Axum + Inertia + SolidJS POC

POC usando Rust, Axum, [`axum-inertia`](https://docs.rs/axum-inertia/latest/axum_inertia/), Vite, SolidJS e [`inertia-adapter-solid`](https://github.com/iksaku/inertia-adapter-solid).

### Rodando em desenvolvimento

Instale as dependencias JS:

```bash
bun install
```

Suba o Vite em um terminal:

```bash
bun run dev
```

Suba o Axum em outro terminal:

```bash
cargo run
```

Abra:

```text
http://127.0.0.1:3000
```

O Axum serve as rotas Inertia (`/`, `/about` e `/architecture`) e o Vite entrega o bundle Solid em `http://127.0.0.1:5173`.

### Build release com binario unico

Gere o bundle do front e compile o Rust em release:

```bash
bun run build:release
```

Rode o binario:

```bash
./target/release/axum-inertia-solid-poc
```

Em release, os arquivos de `dist/` ficam embutidos no executavel via `rust-embed`. Nao precisa rodar Vite para servir o front.
