"use client";
import { useState, useMemo } from 'react';
import { generateCurveData, getCriticalValue } from '@/utils/statistics';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export default function StatCalculator() {
  const [distType, setDistType] = useState('z');
  const [alpha, setAlpha] = useState(0.05);
  const [df1, setDf1] = useState(1);
  const [df2, setDf2] = useState(1);
  const [tails, setTails] = useState(1);

  const { cv, chartData } = useMemo(() => {
    let typeMap = { 'z': 'normal', 't': 't', 'chi': 'chisquare', 'f': 'f' };
    const mappedType = typeMap[distType] || 'normal';
    
    // params
    let params = { df: df1, df1, df2 };
    
    let criticalVal = getCriticalValue(mappedType, alpha, params, tails);
    if(isNaN(criticalVal) || !isFinite(criticalVal)) criticalVal = 0;

    let cSide = tails === 1 ? 'right' : 'both';
    let data = generateCurveData(mappedType, params, criticalVal, cSide);

    return { cv: Number(criticalVal.toFixed(4)), chartData: data };
  }, [distType, alpha, df1, df2, tails]);

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in text-slate-800">
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-800">
          {"Calculadora de Distribuciones"}
        </h2>
        <p className="text-slate-500 mt-2 text-sm md:text-base">{"Z, T de Student, Chi-Cuadrada y F de Fisher"}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-5 bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <label className="block text-sm text-slate-700 font-bold mb-1">{"Distribución"}</label>
            <select 
              value={distType} 
              onChange={(e) => setDistType(e.target.value)}
              className="w-full bg-white text-slate-800 rounded-lg p-3 border border-slate-300 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="z">Normal (Z)</option>
              <option value="t">T de Student</option>
              <option value="chi">Chi-cuadrada (χ²)</option>
              <option value="f">F de Fisher</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-slate-700 font-bold mb-1">{"Nivel de Significancia (α)"}</label>
            <input 
              type="number" step="0.01" min="0.001" max="0.5" 
              value={alpha} onChange={(e) => setAlpha(parseFloat(e.target.value) || 0.05)}
              className="w-full bg-white text-slate-800 rounded-lg p-3 border border-slate-300 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {(distType === 'z' || distType === 't') && (
            <div>
              <label className="block text-sm text-slate-700 font-bold mb-1">{"Colas"}</label>
              <select 
                value={tails} 
                onChange={(e) => setTails(parseInt(e.target.value))}
                className="w-full bg-white text-slate-800 rounded-lg p-3 border border-slate-300 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value={1}>1 Cola (Derecha)</option>
                <option value={2}>2 Colas</option>
              </select>
            </div>
          )}

          {(distType === 't' || distType === 'chi') && (
            <div>
              <label className="block text-sm text-slate-700 font-bold mb-1">{"Grados de Libertad"}</label>
              <input 
                type="number" step="1" min="1" 
                value={df1} onChange={(e) => setDf1(parseInt(e.target.value) || 1)}
                className="w-full bg-white text-slate-800 rounded-lg p-3 border border-slate-300 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          )}

          {distType === 'f' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-700 font-bold mb-1">{"v1 (Num)"}</label>
                <input 
                  type="number" step="1" min="1" 
                  value={df1} onChange={(e) => setDf1(parseInt(e.target.value) || 1)}
                  className="w-full bg-white text-slate-800 rounded-lg p-3 border border-slate-300 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-700 font-bold mb-1">{"v2 (Den)"}</label>
                <input 
                  type="number" step="1" min="1" 
                  value={df2} onChange={(e) => setDf2(parseInt(e.target.value) || 1)}
                  className="w-full bg-white text-slate-800 rounded-lg p-3 border border-slate-300 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-slate-200">
            <h3 className="text-lg md:text-xl font-bold text-slate-600">
              {"Valor Crítico: "} <span className="text-blue-700">{cv}</span>
            </h3>
            {tails === 2 && (
              <h3 className="text-lg md:text-xl font-bold text-slate-600">
                {"Límite Izquierdo: "} <span className="text-blue-700">-{cv}</span>
              </h3>
            )}
          </div>
        </div>

        {/* Graphical Plot container */}
        <div className="lg:col-span-2 relative bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center min-h-[300px] md:min-h-[400px]">
          <ResponsiveContainer width="100%" height="100%" minHeight={300}>
            <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRejCalc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.7}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorAccCalc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="x" stroke="#64748b" tick={{fill: '#475569'}} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#1e293b' }}
                itemStyle={{ color: '#3b82f6' }}
              />
              
              <Area type="monotone" dataKey={(d) => d.isRejection ? 0 : d.y} stroke="#3b82f6" fillOpacity={1} fill="url(#colorAccCalc)" isAnimationActive={false} />
              <Area type="monotone" dataKey={(d) => d.isRejection ? d.y : 0} stroke="#ef4444" fillOpacity={1} fill="url(#colorRejCalc)" isAnimationActive={false} />

              <ReferenceLine x={cv} stroke="#dc2626" strokeDasharray="3 3" label={{ position: 'top', value: `VC (${cv})`, fill: '#dc2626' }} />
              {tails === 2 && <ReferenceLine x={-cv} stroke="#dc2626" strokeDasharray="3 3" label={{ position: 'top', value: `VC (-${cv})`, fill: '#dc2626' }} />}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
