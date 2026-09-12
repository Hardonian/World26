use std::collections::HashMap;
use wasm_bindgen::prelude::*;
use world26_sim_core::causal::attribute_inflection;
use world26_sim_core::uncertainty::run_monte_carlo;
use world26_sim_core::world26::{run_world26_simulation, World26Parameters};
use world26_sim_core::world3::scenarios::{run_world3_simulation, World3ScenarioType};

#[wasm_bindgen]
pub fn init_engine() -> String {
    "WORLD//26 System Dynamics Engine Initialized (v2026.1)".to_string()
}

#[wasm_bindgen]
pub fn run_world3_scenario_wasm(
    scenario: &str,
    start_year: f64,
    end_year: f64,
    dt: f64,
) -> Result<JsValue, JsValue> {
    let sc_type = match scenario {
        "bau" => World3ScenarioType::Bau,
        "bau2" => World3ScenarioType::Bau2,
        "ct" => World3ScenarioType::ComprehensiveTechnology,
        "sw" => World3ScenarioType::StabilizedWorld,
        _ => return Err(JsValue::from_str("Unknown World3 scenario")),
    };

    let results = run_world3_simulation(sc_type, start_year, end_year, dt);
    serde_wasm_bindgen::to_value(&results).map_err(|e| JsValue::from_str(&e.to_string()))
}

#[wasm_bindgen]
pub fn run_world26_simulation_wasm(
    params_json: &str,
    start_year: f64,
    end_year: f64,
    dt: f64,
) -> Result<JsValue, JsValue> {
    let params: World26Parameters = if params_json.is_empty() || params_json == "{}" {
        World26Parameters::default()
    } else {
        serde_json::from_str(params_json).map_err(|e| JsValue::from_str(&e.to_string()))?
    };

    let output = run_world26_simulation(params, start_year, end_year, dt);
    serde_wasm_bindgen::to_value(&output).map_err(|e| JsValue::from_str(&e.to_string()))
}

#[wasm_bindgen]
pub fn run_monte_carlo_wasm(
    params_json: &str,
    iterations: usize,
    seed: u64,
    start_year: f64,
    end_year: f64,
    dt: f64,
) -> Result<JsValue, JsValue> {
    let params: World26Parameters = if params_json.is_empty() || params_json == "{}" {
        World26Parameters::default()
    } else {
        serde_json::from_str(params_json).map_err(|e| JsValue::from_str(&e.to_string()))?
    };

    let result = run_monte_carlo(&params, iterations, seed, start_year, end_year, dt);
    serde_wasm_bindgen::to_value(&result).map_err(|e| JsValue::from_str(&e.to_string()))
}

#[wasm_bindgen]
pub fn explain_inflection_wasm(
    target_var: &str,
    year: f64,
    times_json: &str,
    series_map_json: &str,
) -> Result<JsValue, JsValue> {
    let times: Vec<f64> =
        serde_json::from_str(times_json).map_err(|e| JsValue::from_str(&e.to_string()))?;
    let series_map: HashMap<String, Vec<f64>> =
        serde_json::from_str(series_map_json).map_err(|e| JsValue::from_str(&e.to_string()))?;

    let explanation = attribute_inflection(target_var, year, &times, &series_map);
    serde_wasm_bindgen::to_value(&explanation).map_err(|e| JsValue::from_str(&e.to_string()))
}
