use serde::Serialize;
use serde_json::{Map, Value};

use crate::layouts::{self, Layout};

pub fn merge_layout_props<T>(layout: Layout, props: T) -> Value
where
    T: Serialize,
{
    let value = serde_json::to_value(props).expect("serialize Inertia page props");
    let mut props = match value {
        Value::Object(props) => props,
        _ => Map::new(),
    };

    props.insert("layout".to_string(), layouts::props(layout));

    Value::Object(props)
}
