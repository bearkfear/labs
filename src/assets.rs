#[cfg(not(debug_assertions))]
use axum::{
    body::Body,
    extract::Path,
    http::{StatusCode, header},
    response::{IntoResponse, Response},
};

#[cfg(not(debug_assertions))]
use rust_embed::RustEmbed;

#[cfg(not(debug_assertions))]
#[derive(RustEmbed)]
#[folder = "dist"]
struct Assets;

#[cfg(not(debug_assertions))]
pub async fn serve(Path(path): Path<String>) -> Response {
    let path = path.trim_start_matches('/');
    let embedded_path = format!("assets/{path}");

    match Assets::get(&embedded_path) {
        Some(file) => {
            let mime = mime_guess::from_path(&embedded_path).first_or_octet_stream();

            Response::builder()
                .status(StatusCode::OK)
                .header(header::CONTENT_TYPE, mime.as_ref())
                .header(header::CACHE_CONTROL, cache_control(&embedded_path))
                .body(Body::from(file.data.into_owned()))
                .expect("build embedded asset response")
        }
        None => StatusCode::NOT_FOUND.into_response(),
    }
}

#[cfg(not(debug_assertions))]
fn cache_control(path: &str) -> &'static str {
    if path.starts_with("assets/") {
        "public, max-age=31536000, immutable"
    } else {
        "no-cache"
    }
}

#[cfg(debug_assertions)]
pub async fn serve() -> axum::http::StatusCode {
    axum::http::StatusCode::NOT_FOUND
}
