mod root;
mod shared;

use axum::extract::{FromRef, FromRequestParts};
use axum::http::{HeaderMap, HeaderValue, StatusCode, request::Parts};
use axum::response::IntoResponse;
use axum_inertia::{Inertia as AxumInertia, InertiaConfig};
use serde::Serialize;

use crate::layouts::Layout;

pub struct Inertia(AxumInertia);

pub struct RenderBuilder {
    inertia: Inertia,
    component: &'static str,
    layout: Layout,
}

impl Inertia {
    pub fn render(self, component: &'static str) -> RenderBuilder {
        RenderBuilder {
            inertia: self,
            component,
            layout: Layout::App,
        }
    }
}

impl RenderBuilder {
    pub fn layout(mut self, layout: Layout) -> Self {
        self.layout = layout;
        self
    }

    pub fn props<T>(self, props: T) -> impl IntoResponse
    where
        T: Serialize,
    {
        self.inertia.0.render(
            self.component,
            shared::merge_layout_props(self.layout, props),
        )
    }
}

impl<S> FromRequestParts<S> for Inertia
where
    S: Send + Sync,
    InertiaConfig: FromRef<S>,
{
    type Rejection = (StatusCode, HeaderMap<HeaderValue>);

    async fn from_request_parts(parts: &mut Parts, state: &S) -> Result<Self, Self::Rejection> {
        AxumInertia::from_request_parts(parts, state)
            .await
            .map(Self)
    }
}

pub fn inertia_config() -> InertiaConfig {
    InertiaConfig::new(None, Box::new(root::development_root_view))
}
