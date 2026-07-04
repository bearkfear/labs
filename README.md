## Axum + Inertia + SolidJS POC

POC usando Rust, Axum, [`axum-inertia`](https://docs.rs/axum-inertia/latest/axum_inertia/), Vite, SolidJS e [`inertia-adapter-solid`](https://github.com/iksaku/inertia-adapter-solid).

### Rodando em desenvolvimento

Instale as dependencias JS:

```bash
npm install
```

Suba o Vite em um terminal:

```bash
npm run dev
```

Suba o Axum em outro terminal:

```bash
cargo run
```

Abra:

```text
http://127.0.0.1:3000
```

O Axum serve as rotas Inertia (`/` e `/about`) e o Vite entrega o bundle Solid em `http://127.0.0.1:5173`.
