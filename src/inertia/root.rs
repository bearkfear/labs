use serde_json::{Value, json};

pub fn development_root_view(page: String) -> String {
    let page = normalize_inertia_page(page);
    let page = escape_json_for_script(&page.to_string());

    format!(
        r#"<!DOCTYPE html><html lang="pt-BR"><head><title>Axum Inertia Solid POC</title><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><script type="module" src="http://localhost:5173/@vite/client"></script><script type="module" src="http://localhost:5173/src/main.tsx"></script></head><body><div id="app"></div><script type="application/json" data-page="app">{page}</script></body></html>"#
    )
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
