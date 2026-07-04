use serde_json::{Value, json};

#[cfg(not(debug_assertions))]
use rust_embed::RustEmbed;
#[cfg(not(debug_assertions))]
use std::collections::HashMap;

#[cfg(not(debug_assertions))]
#[derive(RustEmbed)]
#[folder = "dist"]
struct Assets;

#[cfg(not(debug_assertions))]
#[derive(serde::Deserialize)]
struct ManifestEntry {
    file: String,
    #[serde(default)]
    css: Vec<String>,
}

pub fn root_view() -> Box<dyn Fn(String) -> String + Send + Sync> {
    #[cfg(debug_assertions)]
    {
        Box::new(development_root_view)
    }

    #[cfg(not(debug_assertions))]
    {
        Box::new(production_root_view)
    }
}

pub fn asset_version() -> Option<String> {
    #[cfg(debug_assertions)]
    {
        None
    }

    #[cfg(not(debug_assertions))]
    {
        Some(env!("CARGO_PKG_VERSION").to_string())
    }
}

#[cfg(debug_assertions)]
fn development_root_view(page: String) -> String {
    let page = normalize_inertia_page(page);
    let page = escape_json_for_script(&page.to_string());

    format!(
        r#"<!DOCTYPE html><html lang="pt-BR"><head><title>Axum Inertia Solid POC</title><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><script type="module" src="http://localhost:5173/@vite/client"></script><script type="module" src="http://localhost:5173/src/main.tsx"></script></head><body><div id="app"></div><script type="application/json" data-page="app">{page}</script></body></html>"#
    )
}

#[cfg(not(debug_assertions))]
pub fn production_root_view(page: String) -> String {
    let page = normalize_inertia_page(page);
    let page = escape_json_for_script(&page.to_string());
    let entry = manifest_entry("src/main.tsx");
    let styles = entry
        .css
        .iter()
        .map(|path| format!(r#"<link rel="stylesheet" href="/{path}">"#))
        .collect::<String>();

    format!(
        r#"<!DOCTYPE html><html lang="pt-BR"><head><title>Axum Inertia Solid POC</title><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">{styles}<script type="module" src="/{script}"></script></head><body><div id="app"></div><script type="application/json" data-page="app">{page}</script></body></html>"#,
        script = entry.file,
    )
}

#[cfg(not(debug_assertions))]
fn manifest_entry(name: &str) -> ManifestEntry {
    let manifest = Assets::get(".vite/manifest.json").expect("embedded Vite manifest");
    let manifest = std::str::from_utf8(manifest.data.as_ref()).expect("Vite manifest is utf-8");
    let mut manifest: HashMap<String, ManifestEntry> =
        serde_json::from_str(manifest).expect("parse Vite manifest");

    manifest
        .remove(name)
        .unwrap_or_else(|| panic!("missing Vite manifest entry for {name}"))
}

fn normalize_inertia_page(page: String) -> Value {
    let mut page: Value = serde_json::from_str(&page).expect("valid Inertia page JSON");

    if let Some(props) = page.get_mut("props").and_then(Value::as_object_mut) {
        props.entry("errors").or_insert_with(|| json!({}));
    }

    if let Some(page) = page.as_object_mut() {
        page.entry("rescuedProps").or_insert_with(|| json!([]));
    }

    page
}

fn escape_json_for_script(json: &str) -> String {
    json.replace("</", "<\\/")
}
