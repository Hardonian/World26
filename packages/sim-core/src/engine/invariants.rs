use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InvariantViolation {
    pub time: f64,
    pub variable: String,
    pub value: f64,
    pub message: String,
}

pub struct InvariantChecker {
    pub violations: Vec<InvariantViolation>,
}

impl Default for InvariantChecker {
    fn default() -> Self {
        Self::new()
    }
}

impl InvariantChecker {
    pub fn new() -> Self {
        Self {
            violations: Vec::new(),
        }
    }

    pub fn assert_non_negative(&mut self, time: f64, name: &str, value: f64) {
        if value < -1e-6 {
            self.violations.push(InvariantViolation {
                time,
                variable: name.to_string(),
                value,
                message: format!(
                    "Physical stock '{}' violated non-negativity: {}",
                    name, value
                ),
            });
        }
    }

    pub fn assert_unit_interval(&mut self, time: f64, name: &str, value: f64) {
        if value < -1e-4 || value > 1.0001 {
            self.violations.push(InvariantViolation {
                time,
                variable: name.to_string(),
                value,
                message: format!(
                    "Fractional share '{}' must be within [0, 1]: {}",
                    name, value
                ),
            });
        }
    }

    pub fn has_fatal_violations(&self) -> bool {
        !self.violations.is_empty()
    }
}
