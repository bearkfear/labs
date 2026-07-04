use serde_json::{Value, json};

#[derive(Clone, Copy)]
pub enum Layout {
    App,
    Plain,
}

pub fn props(layout: Layout) -> Value {
    match layout {
        Layout::App => json!({
            "name": "app",
            "appName": "Axum Inertia Solid",
            "nav": [
                { "label": "Home", "href": "/" },
                { "label": "About", "href": "/about" }
            ],
            "server": server_info()
        }),
        Layout::Plain => json!({
            "name": "plain",
            "server": server_info()
        }),
    }
}

fn server_info() -> Value {
    json!({
        "user": std::env::var("USER")
            .or_else(|_| std::env::var("USERNAME"))
            .unwrap_or_else(|_| "unknown".to_string()),
        "host": std::env::var("HOSTNAME")
            .or_else(|_| std::env::var("COMPUTERNAME"))
            .unwrap_or_else(|_| "local".to_string()),
        "cwd": std::env::current_dir()
            .map(|path| path.display().to_string())
            .unwrap_or_else(|_| ".".to_string()),
    })
}
