use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Delay1 {
    pub value: f64,
    pub delay_time: f64,
}

impl Delay1 {
    pub fn new(initial_val: f64, delay_time: f64) -> Self {
        Self {
            value: initial_val,
            delay_time: delay_time.max(1e-6),
        }
    }

    pub fn update(&mut self, input: f64, dt: f64) -> f64 {
        let change = (input - self.value) / self.delay_time;
        self.value += change * dt;
        self.value
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Delay3 {
    pub s1: f64,
    pub s2: f64,
    pub s3: f64,
    pub delay_time: f64,
}

impl Delay3 {
    pub fn new(initial_val: f64, delay_time: f64) -> Self {
        Self {
            s1: initial_val,
            s2: initial_val,
            s3: initial_val,
            delay_time: delay_time.max(1e-6),
        }
    }

    pub fn update(&mut self, input: f64, dt: f64) -> f64 {
        let step_delay = self.delay_time / 3.0;
        let d1 = (input - self.s1) / step_delay;
        self.s1 += d1 * dt;

        let d2 = (self.s1 - self.s2) / step_delay;
        self.s2 += d2 * dt;

        let d3 = (self.s2 - self.s3) / step_delay;
        self.s3 += d3 * dt;

        self.s3
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Smooth {
    pub smoothed_value: f64,
    pub time_constant: f64,
}

impl Smooth {
    pub fn new(initial_val: f64, time_constant: f64) -> Self {
        Self {
            smoothed_value: initial_val,
            time_constant: time_constant.max(1e-6),
        }
    }

    pub fn update(&mut self, input: f64, dt: f64) -> f64 {
        let delta = (input - self.smoothed_value) / self.time_constant;
        self.smoothed_value += delta * dt;
        self.smoothed_value
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_delay1_convergence() {
        let mut d = Delay1::new(0.0, 5.0);
        let dt = 0.5;
        for _ in 0..100 {
            d.update(100.0, dt);
        }
        assert!((d.value - 100.0).abs() < 0.1);
    }

    #[test]
    fn test_delay3_smoothness() {
        let mut d = Delay3::new(0.0, 10.0);
        let dt = 0.25;
        let mut vals = Vec::new();
        for _ in 0..200 {
            vals.push(d.update(100.0, dt));
        }
        assert!((vals.last().unwrap() - 100.0).abs() < 1.0);
        // S-curve check: initial rate of increase is slower in Delay3 than Delay1
        assert!(vals[5] < 15.0);
    }
}
