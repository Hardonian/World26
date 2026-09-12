use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LookupTable {
    pub name: String,
    pub x: Vec<f64>,
    pub y: Vec<f64>,
}

impl LookupTable {
    pub fn new(name: &str, x: Vec<f64>, y: Vec<f64>) -> Self {
        assert_eq!(x.len(), y.len(), "LookupTable x and y lengths must match");
        assert!(x.len() >= 2, "LookupTable must have at least 2 points");
        Self {
            name: name.to_string(),
            x,
            y,
        }
    }

    /// Linear interpolation with clamping at bounds
    pub fn lookup(&self, val: f64) -> f64 {
        if val <= self.x[0] {
            return self.y[0];
        }
        let last_idx = self.x.len() - 1;
        if val >= self.x[last_idx] {
            return self.y[last_idx];
        }

        // Binary search or linear scan
        for i in 0..last_idx {
            if val >= self.x[i] && val <= self.x[i + 1] {
                let dx = self.x[i + 1] - self.x[i];
                if dx == 0.0 {
                    return self.y[i];
                }
                let fraction = (val - self.x[i]) / dx;
                return self.y[i] + fraction * (self.y[i + 1] - self.y[i]);
            }
        }

        self.y[last_idx]
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_lookup_interpolation() {
        let table = LookupTable::new("test", vec![0.0, 10.0, 20.0], vec![0.0, 50.0, 200.0]);
        assert_eq!(table.lookup(-5.0), 0.0);
        assert_eq!(table.lookup(0.0), 0.0);
        assert_eq!(table.lookup(5.0), 25.0);
        assert_eq!(table.lookup(10.0), 50.0);
        assert_eq!(table.lookup(15.0), 125.0);
        assert_eq!(table.lookup(20.0), 200.0);
        assert_eq!(table.lookup(30.0), 200.0);
    }
}
