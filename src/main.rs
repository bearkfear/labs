mod inertia;
mod layouts;

use axum::{Router, response::IntoResponse, routing::get};
use inertia::{Inertia, inertia_config};
use layouts::Layout;
use serde::Serialize;
use serde_json::json;
use tower_http::trace::TraceLayer;

#[derive(Serialize)]
struct CounterItem {
    label: &'static str,
    value: usize,
}

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "axum_inertia_solid_poc=debug,tower_http=debug".into()),
        )
        .init();

    let app = Router::new()
        .route("/", get(home))
        .route("/about", get(about))
        .layer(TraceLayer::new_for_http())
        .with_state(inertia_config());

    let listener = tokio::net::TcpListener::bind("127.0.0.1:3000")
        .await
        .expect("bind Axum server");

    println!("Axum listening on http://127.0.0.1:3000");
    axum::serve(listener, app).await.expect("run Axum server");
}

async fn home(inertia: Inertia) -> impl IntoResponse {
    let counters = vec![
        CounterItem {
            label: "Rust handlers",
            value: 2,
        },
        CounterItem {
            label: "Solid pages",
            value: 2,
        },
        CounterItem {
            label: "Inertia protocol",
            value: 1,
        },
    ];

    inertia.render("Home").layout(Layout::App).props(json!({
        "headline": "Axum + Inertia + SolidJS",
        "message": "Props serializadas no Rust e renderizadas no Solid via Inertia.",
        "counters": counters,
    }))
}

async fn about(inertia: Inertia) -> impl IntoResponse {
    inertia.render("About").layout(Layout::Plain).props(json!({
        "title": "POC em Rust",
        "stack": ["axum", "axum-inertia", "vite", "solid-js", "inertia-adapter-solid"],
    }))
}
