pub mod delay;
pub mod invariants;
pub mod table;

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, Default)]
#[serde(rename_all = "snake_case")]
pub enum Integrator {
    Euler,
    Heun,
    #[default]
    Rk4,
}

/// Computes Runge-Kutta 4th order step for a generic state vector `y` with ODE function `f(t, y) -> dy/dt`.
pub fn rk4_step<F>(t: f64, y: &[f64], dt: f64, mut f: F) -> Vec<f64>
where
    F: FnMut(f64, &[f64]) -> Vec<f64>,
{
    let n = y.len();
    let k1 = f(t, y);

    let mut y2 = vec![0.0; n];
    for i in 0..n {
        y2[i] = y[i] + 0.5 * dt * k1[i];
    }
    let k2 = f(t + 0.5 * dt, &y2);

    let mut y3 = vec![0.0; n];
    for i in 0..n {
        y3[i] = y[i] + 0.5 * dt * k2[i];
    }
    let k3 = f(t + 0.5 * dt, &y3);

    let mut y4 = vec![0.0; n];
    for i in 0..n {
        y4[i] = y[i] + dt * k3[i];
    }
    let k4 = f(t + dt, &y4);

    let mut y_next = vec![0.0; n];
    for i in 0..n {
        y_next[i] = y[i] + (dt / 6.0) * (k1[i] + 2.0 * k2[i] + 2.0 * k3[i] + k4[i]);
    }
    y_next
}

/// Fixed-step Euler integration step.
pub fn euler_step<F>(t: f64, y: &[f64], dt: f64, mut f: F) -> Vec<f64>
where
    F: FnMut(f64, &[f64]) -> Vec<f64>,
{
    let n = y.len();
    let dy = f(t, y);
    let mut y_next = vec![0.0; n];
    for i in 0..n {
        y_next[i] = y[i] + dt * dy[i];
    }
    y_next
}

/// Heun (Runge-Kutta 2nd order predictor-corrector) step.
pub fn heun_step<F>(t: f64, y: &[f64], dt: f64, mut f: F) -> Vec<f64>
where
    F: FnMut(f64, &[f64]) -> Vec<f64>,
{
    let n = y.len();
    let k1 = f(t, y);

    let mut y_pred = vec![0.0; n];
    for i in 0..n {
        y_pred[i] = y[i] + dt * k1[i];
    }
    let k2 = f(t + dt, &y_pred);

    let mut y_next = vec![0.0; n];
    for i in 0..n {
        y_next[i] = y[i] + 0.5 * dt * (k1[i] + k2[i]);
    }
    y_next
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_rk4_exponential_decay() {
        // dy/dt = -0.1 * y, y(0) = 100. Analytic solution at t=10 is 100 * exp(-1) = 36.78794
        let mut y = vec![100.0];
        let dt = 0.5;
        let mut t = 0.0;
        while t < 10.0 {
            y = rk4_step(t, &y, dt, |_t, state| vec![-0.1 * state[0]]);
            t += dt;
        }
        let analytic = 100.0 * (-1.0_f64).exp();
        assert!((y[0] - analytic).abs() < 0.01);
    }
}
