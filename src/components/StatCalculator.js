"use client";
import { useState, useMemo } from 'react';
import { calculateANOVA, generateCurveData, getCriticalValue } from '@/utils/statistics';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

function ANOVACalculatorMode() {
  const [groups, setGroups] = useState([
    { name: 'Tratamiento 1', data: [0, 0] },
    { name: 'Tratamiento 2', data: [0, 0] }
  ]);
  const [showTable, setShowTable] = useState(true);

  const addGroup = () => setGroups([...groups, { name: `Tratamiento ${groups.length + 1}`, data: Array(groups[0].data.length).fill(0) }]);
  const removeGroup = (idx) => setGroups(groups.filter((_, i) => i !== idx));

  const addRow = () => setGroups(groups.map(g => ({ ...g, data: [...g.data, 0] })));
  const removeRow = (rowIdx) => setGroups(groups.map(g => ({ ...g, data: g.data.filter((_, i) => i !== rowIdx) })));

  const handleDataChange = (gIdx, rIdx, val) => {
    const newG = [...groups];
    newG[gIdx].data[rIdx] = parseFloat(val) || 0;
    setGroups(newG);
  };

  const anova = useMemo(() => {
    const valid = groups.every(g => g.data.length > 1);
    if (!valid) return null;
    return calculateANOVA(groups.map(g => g.data));
  }, [groups]);

  const variances = useMemo(() => {
    if (!anova) return [];
    return groups.map((g, i) => {
      const mean = anova.means[i];
      const sumSq = g.data.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0);
      return sumSq / (g.data.length - 1 || 1);
    });
  }, [groups, anova]);

  return (
    <div className="space-y-6 animate-fade-in text-slate-800">
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-slate-700">Editor de Datos</h3>
          <div className="space-x-2">
            <button onClick={addRow} className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm font-bold hover:bg-blue-200">+ Fila (Ensayo)</button>
            <button onClick={addGroup} className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded text-sm font-bold hover:bg-emerald-200">+ Columna (Tratamiento)</button>
          </div>
        </div>
        <div className="overflow-x-auto no-scrollbar border border-slate-300 rounded shadow-sm">
          <table className="w-full text-left bg-white text-sm">
            <thead className="bg-slate-100 border-b border-slate-300">
              <tr>
                <th className="p-2 border-r border-slate-200 text-center w-12 flex-col gap-2 relative">
                  Ensayo
                  <button onClick={() => removeRow(groups[0].data.length-1)} disabled={groups[0].data.length<=2} className="block mx-auto mt-1 text-xs text-red-500 hover:text-red-700 disabled:opacity-30" title="Eliminar última fila">[- Fila]</button>
                </th>
                {groups.map((g, i) => (
                  <th key={i} className="p-2 border-r border-slate-200 text-center relative group">
                    <input type="text" value={g.name} onChange={(e) => {
                      const newG = [...groups]; newG[i].name = e.target.value; setGroups(newG);
                    }} className="font-bold bg-transparent text-center border-none focus:ring-0 focus:outline-none w-full" />
                    {groups.length > 2 && (
                       <button onClick={() => removeGroup(i)} className="absolute top-1 right-1 text-red-500 hover:text-red-700 text-xs px-1">✕</button>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {groups[0].data.map((_, rIdx) => (
                <tr key={rIdx} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-2 border-r border-slate-200 font-bold text-slate-500 text-center">{rIdx + 1}</td>
                  {groups.map((g, gIdx) => (
                    <td key={gIdx} className="p-1 border-r border-slate-200">
                      <input type="number" step="any" value={g.data[rIdx]} onChange={e => handleDataChange(gIdx, rIdx, e.target.value)}
                        className="w-full p-2 outline-none focus:bg-blue-50 text-center" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
            {anova && (
              <tfoot className="bg-blue-50 border-t-2 border-blue-200">
                <tr>
                  <td className="p-2 font-bold text-center border-r border-slate-200 text-blue-800">Media ȳᵢ</td>
                  {anova.means.map((m, i) => <td key={i} className="p-2 font-bold text-center border-r border-slate-200">{m.toFixed(4)}</td>)}
                </tr>
                <tr>
                  <td className="p-2 font-bold text-center border-r border-slate-200 text-blue-800">Varianza S²ᵢ</td>
                  {variances.map((v, i) => <td key={i} className="p-2 font-bold text-center border-r border-slate-200">{v.toFixed(4)}</td>)}
                </tr>
                <tr>
                  <td className="p-2 font-bold text-center border-r border-slate-200 text-blue-800">Efecto τᵢ</td>
                  {anova.means.map((m, i) => <td key={i} className="p-2 font-bold text-center border-r border-slate-200 text-purple-700">{(m - anova.grandMean).toFixed(4)}</td>)}
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {anova && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-emerald-50 p-5 rounded-xl border border-emerald-200 shadow-sm flex flex-col justify-center">
            <h4 className="font-bold text-emerald-900 mb-2">Resumen Global</h4>
            <div className="text-sm font-mono space-y-1 bg-white p-3 border border-emerald-100 rounded">
              <p>N total = {anova.N}</p>
              <p>Tratamientos (k) = {anova.k}</p>
              <p>Media Global (ȳ): <strong className="text-lg">{anova.grandMean.toFixed(4)}</strong></p>
              <p>CM Error (σ̂²): <strong>{anova.MSe.toFixed(4)}</strong></p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
            <h4 className="font-bold text-blue-800 mb-2">Cuadro ANOVA</h4>
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="border-b-2 border-blue-200 text-blue-800">
                <tr><th>Fuente</th><th>SC</th><th>GL</th><th>CM</th><th>F₀</th><th>Valor P</th></tr>
              </thead>
              <tbody className="text-slate-700 font-mono">
                <tr className="border-b border-slate-100">
                  <td className="py-2">Tratamiento</td><td>{anova.SCt.toFixed(4)}</td><td>{anova.DF_t}</td><td>{anova.MSt.toFixed(4)}</td><td className="font-bold text-emerald-600 bg-emerald-50 px-2 rounded-l">{anova.F.toFixed(4)}</td><td className="font-bold text-purple-600 bg-purple-50 px-2 rounded-r">{anova.p < 0.0001 ? '< 0.0001' : anova.p.toFixed(4)}</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-2">Error</td><td>{anova.SCe.toFixed(4)}</td><td>{anova.DF_e}</td><td>{anova.MSe.toFixed(4)}</td><td></td><td></td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="py-2 font-bold">Total</td><td className="font-bold">{anova.SCT.toFixed(4)}</td><td className="font-bold">{anova.DF_total}</td><td></td><td></td><td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

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

  const [activeMode, setActiveMode] = useState('distributions');

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in text-slate-800">
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-800">
          {"Módulo de Cálculo Matemático"}
        </h2>
        <div className="flex justify-center gap-4 mt-4">
          <button onClick={() => setActiveMode('distributions')} className={`px-4 py-2 rounded-lg font-bold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${activeMode === 'distributions' ? 'bg-blue-800 text-white shadow-md' : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-50'}`}>Distribuciones Críticas</button>
          <button onClick={() => setActiveMode('anova')} className={`px-4 py-2 rounded-lg font-bold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${activeMode === 'anova' ? 'bg-indigo-800 text-white shadow-md' : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-50'}`}>Calculadora ANOVA 1-Vía</button>
        </div>
      </div>

      {activeMode === 'distributions' ? (


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
      ) : (
        <ANOVACalculatorMode />
      )}
    </div>
  );
}
