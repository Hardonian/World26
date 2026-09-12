pub mod causal;
pub mod engine;
pub mod limits25;
pub mod uncertainty;
pub mod world26;
pub mod world3;

pub use causal::{attribute_inflection, detect_inflections, CausalExplanation, InflectionPoint};
pub use engine::table::LookupTable;
pub use engine::{euler_step, heun_step, rk4_step, Integrator};
pub use limits25::{compute_limits25_ai_terms, Limits25Parameters, TABLE_8_BENCHMARKS};
pub use uncertainty::{run_monte_carlo, MonteCarloResult, QuantileBands};
pub use world26::{
    evaluate_planetary_boundaries, run_world26_simulation, BoundaryEvaluation, SimulationOutput,
    World26Model, World26Parameters, World26State,
};
pub use world3::{
    scenarios::{create_world3_scenario, run_world3_simulation, World3ScenarioType},
    World3Model, World3Parameters, World3State,
};
