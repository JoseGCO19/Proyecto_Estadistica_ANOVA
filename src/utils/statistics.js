import * as math from 'mathjs';
import jStat from 'jstat';

export function calculateMean(arr) {
  return math.mean(arr);
}

export function calculateVariance(arr, population = false) {
  return population ? math.variance(arr, 'uncorrected') : math.variance(arr, 'unbiased');
}

export function calculateANOVA(groups) {
  // groups is an array of arrays [[3.30, ...], [3.25, ...], ...]
  const k = groups.length;
  let N = 0;
  let sumTotal = 0;
  let means = [];
  let counts = [];

  groups.forEach(g => {
    N += g.length;
    counts.push(g.length);
    let s = math.sum(g);
    sumTotal += s;
    means.push(s / g.length);
  });

  const grandMean = sumTotal / N;
  
  let SCT = 0;
  let SCt = 0; // Treatment (Between)
  let SCe = 0; // Error (Within)

  groups.forEach((g, idx) => {
    const groupMean = means[idx];
    SCt += counts[idx] * Math.pow(groupMean - grandMean, 2);
    g.forEach(val => {
      SCT += Math.pow(val - grandMean, 2);
      SCe += Math.pow(val - groupMean, 2);
    });
  });

  const DF_T = N - 1;
  const DF_t = k - 1;
  const DF_e = N - k;

  const MSt = SCt / DF_t;
  const MSe = SCe / DF_e;

  const F = MSt / MSe;
  const p = 1 - jStat.centralF.cdf(F, DF_t, DF_e);

  return { SCT, SCt, SCe, DF_total: DF_T, DF_t, DF_e, MSt, MSe, F, p, grandMean, means, N, k };
}

export function calculateMLR(X_matrix, Y_vector) {
  // X_matrix: 2D array, Y_vector: 1D array
  // Add intercept column to X
  const X = X_matrix.map(row => [1, ...row]);
  const Y = Y_vector;
  const N = X.length;
  const k = X[0].length; // Includes intercept => variables p = k-1
  
  // B = (X'X)^-1 X'Y
  const X_mat = math.matrix(X);
  const Y_mat = math.matrix(math.transpose([Y]));
  const X_T = math.transpose(X_mat);
  
  const X_T_X = math.multiply(X_T, X_mat);
  const X_T_X_inv = math.inv(X_T_X);
  const B_mat = math.multiply(math.multiply(X_T_X_inv, X_T), Y_mat);
  
  const B = B_mat.toArray().map(r => r[0]);

  // Predict Y
  const Y_pred = math.multiply(X_mat, B_mat).toArray().map(r => r[0]);

  let Y_mean = math.mean(Y);
  let SST = 0;
  let SSR = 0;
  let SSE = 0;

  for(let i=0; i<N; i++) {
    SST += Math.pow(Y[i] - Y_mean, 2);
    SSR += Math.pow(Y_pred[i] - Y_mean, 2);
    SSE += Math.pow(Y[i] - Y_pred[i], 2);
  }

  const R_squared = SSR / SST;

  // Variances of parameters
  const sigma_squared = SSE / (N - k);
  const B_var_mat = math.multiply(X_T_X_inv, sigma_squared);
  const B_std_err = [];
  for(let i=0; i<k; i++) {
    B_std_err.push(Math.sqrt(B_var_mat.get([i, i])));
  }

  // T stats and p-values
  const t_stats = B.map((b, i) => b / B_std_err[i]);
  const p_values = t_stats.map(t => 2 * (1 - jStat.studentt.cdf(Math.abs(t), N - k)));

  // ANOVA for Regression
  const MSR = SSR / (k - 1);
  const MSE = sigma_squared; // SSE / (N - k)
  const F = MSR / MSE;
  const p_F = 1 - jStat.centralF.cdf(F, k - 1, N - k);

  return {
    B, Y_pred, R_squared, SST, SSR, SSE, 
    DF_total: N-1, DF_R: k-1, DF_E: N-k, 
    MSR, MSE, F, p_F, B_std_err, t_stats, p_values
  };
}

export function generateCurveData(type, params, criticalVal, criticalSide='right') {
  let data = [];
  let min, max, step;
  if(type === 'normal' || type === 't' || type === 'z') {
    min = -4; max = 4; step = 0.1;
    if(Math.abs(criticalVal) > 3) {
      min = -Math.abs(criticalVal) - 1;
      max = Math.abs(criticalVal) + 1;
    }
  } else if(type === 'f' || type === 'chisquare') {
    min = 0.01; max = type === 'f' ? 6 : 20; step = 0.1;
    if(type === 'f' && params.df1 && params.df2) {
       max = Math.max(5, criticalVal * 1.5 || 5);
    }
  }

  for(let x = min; x <= max; x += step) {
    let y = 0;
    if(type === 'f') {
      y = jStat.centralF.pdf(x, params.df1, params.df2);
    } else if(type === 'z' || type === 'normal') {
      y = jStat.normal.pdf(x, 0, 1);
    } else if(type === 't') {
      y = jStat.studentt.pdf(x, params.df);
    } else if(type === 'chisquare') {
      y = jStat.chisquare.pdf(x, params.df);
    }
    
    // Check if in rejection region
    let isRejection = false;
    let cv = Math.abs(criticalVal);
    if(criticalSide === 'right' && x >= criticalVal) isRejection = true;
    if(criticalSide === 'left' && x <= -cv) isRejection = true;
    if(criticalSide === 'both' && (x <= -cv || x >= cv)) isRejection = true;

    data.push({ x: Number(x.toFixed(2)), y, isRejection });
  }
  return data;
}

export function getCriticalValue(type, alpha, params, tails=1) {
  let a = tails === 2 ? alpha/2 : alpha;
  if(type === 'f') return jStat.centralF.inv(1-a, params.df1, params.df2);
  if(type === 'z' || type === 'normal') return jStat.normal.inv(1-a, 0, 1); // Right tail
  if(type === 't') return jStat.studentt.inv(1-a, params.df);
  if(type === 'chisquare') return jStat.chisquare.inv(1-a, params.df);
  return 0;
}
