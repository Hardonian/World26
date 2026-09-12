use super::state::World26State;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BoundaryEvaluation {
    pub id: String,
    pub name: String,
    pub value: f64,
    pub unit: String,
    pub safe_limit: f64,
    pub ratio_to_safe: f64,
    pub status: String, // "safe", "increasing_risk", "transgressed"
}

pub fn evaluate_planetary_boundaries(s: &World26State) -> Vec<BoundaryEvaluation> {
    vec![
        // 1. Climate Change (CO2)
        BoundaryEvaluation {
            id: "climate_co2".to_string(),
            name: "Climate Change (CO2)".to_string(),
            value: s.atmospheric_co2_ppm,
            unit: "ppm".to_string(),
            safe_limit: 350.0,
            ratio_to_safe: s.atmospheric_co2_ppm / 350.0,
            status: if s.atmospheric_co2_ppm <= 350.0 {
                "safe".to_string()
            } else if s.atmospheric_co2_ppm <= 450.0 {
                "increasing_risk".to_string()
            } else {
                "transgressed".to_string()
            },
        },
        // 2. Climate Change (Radiative Forcing)
        BoundaryEvaluation {
            id: "climate_forcing".to_string(),
            name: "Radiative Forcing".to_string(),
            value: s.radiative_forcing,
            unit: "W/m²".to_string(),
            safe_limit: 1.0,
            ratio_to_safe: s.radiative_forcing / 1.0,
            status: if s.radiative_forcing <= 1.0 {
                "safe".to_string()
            } else {
                "transgressed".to_string()
            },
        },
        // 3. Biosphere Integrity (Extinction Rate)
        BoundaryEvaluation {
            id: "biosphere_genetic".to_string(),
            name: "Extinction Rate".to_string(),
            value: s.extinction_rate,
            unit: "E/MSY".to_string(),
            safe_limit: 10.0,
            ratio_to_safe: s.extinction_rate / 10.0,
            status: if s.extinction_rate <= 10.0 {
                "safe".to_string()
            } else {
                "transgressed".to_string()
            },
        },
        // 4. Biosphere Functional (BII)
        BoundaryEvaluation {
            id: "biosphere_functional".to_string(),
            name: "Biodiversity Intactness (BII)".to_string(),
            value: s.biodiversity_intactness_index,
            unit: "%".to_string(),
            safe_limit: 90.0,
            ratio_to_safe: 90.0 / s.biodiversity_intactness_index.max(1.0),
            status: if s.biodiversity_intactness_index >= 90.0 {
                "safe".to_string()
            } else {
                "transgressed".to_string()
            },
        },
        // 5. Land-System Change (Forest remaining)
        BoundaryEvaluation {
            id: "land_system".to_string(),
            name: "Global Forest Cover".to_string(),
            value: s.forest_fraction_remaining * 100.0,
            unit: "%".to_string(),
            safe_limit: 75.0,
            ratio_to_safe: 75.0 / (s.forest_fraction_remaining * 100.0).max(1.0),
            status: if s.forest_fraction_remaining >= 0.75 {
                "safe".to_string()
            } else {
                "transgressed".to_string()
            },
        },
        // 6. Freshwater Change (Blue Water)
        BoundaryEvaluation {
            id: "freshwater_blue".to_string(),
            name: "Blue Water Consumption".to_string(),
            value: s.blue_water_consumption_km3,
            unit: "km³/yr".to_string(),
            safe_limit: 4000.0,
            ratio_to_safe: s.blue_water_consumption_km3 / 4000.0,
            status: if s.blue_water_consumption_km3 <= 4000.0 {
                "safe".to_string()
            } else {
                "transgressed".to_string()
            },
        },
        // 7. Biogeochemical (Nitrogen Fixation)
        BoundaryEvaluation {
            id: "biogeochemical_nitrogen".to_string(),
            name: "Nitrogen Fixation".to_string(),
            value: s.nitrogen_fixation_tg,
            unit: "Tg N/yr".to_string(),
            safe_limit: 62.0,
            ratio_to_safe: s.nitrogen_fixation_tg / 62.0,
            status: if s.nitrogen_fixation_tg <= 62.0 {
                "safe".to_string()
            } else {
                "transgressed".to_string()
            },
        },
        // 8. Ocean Acidification (Aragonite Saturation State)
        BoundaryEvaluation {
            id: "ocean_acidification".to_string(),
            name: "Ocean Aragonite Saturation".to_string(),
            value: s.aragonite_saturation_state,
            unit: "Ωarag".to_string(),
            safe_limit: 2.80,
            ratio_to_safe: 2.80 / s.aragonite_saturation_state.max(0.1),
            status: if s.aragonite_saturation_state >= 2.80 {
                "safe".to_string()
            } else {
                "transgressed".to_string()
            },
        },
        // 9. Stratospheric Ozone
        BoundaryEvaluation {
            id: "stratospheric_ozone".to_string(),
            name: "Stratospheric Ozone".to_string(),
            value: s.ozone_dobson_units,
            unit: "DU".to_string(),
            safe_limit: 276.0,
            ratio_to_safe: 276.0 / s.ozone_dobson_units.max(1.0),
            status: if s.ozone_dobson_units >= 276.0 {
                "safe".to_string()
            } else {
                "increasing_risk".to_string()
            },
        },
        // 10. Novel Entities (Toxics + Plastics + E-Waste)
        BoundaryEvaluation {
            id: "novel_entities".to_string(),
            name: "Novel Entities / Toxics".to_string(),
            value: s.novel_entities_index,
            unit: "Index".to_string(),
            safe_limit: 1.0,
            ratio_to_safe: s.novel_entities_index / 1.0,
            status: if s.novel_entities_index <= 1.0 {
                "safe".to_string()
            } else {
                "transgressed".to_string()
            },
        },
    ]
}
