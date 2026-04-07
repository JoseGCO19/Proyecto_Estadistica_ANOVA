"use client";
import { useState, useMemo } from 'react';
import { calculateMLR, getCriticalValue } from '@/utils/statistics';

const initialDataY =  [9.8, 12.6, 11.9, 13.1, 13.3, 13.5, 10.1, 13.1, 10.7, 11.0, 13.0, 11.6, 12.0, 11.4, 12.2, 12.8, 12.4, 13.2, 10.6, 7.9];
const initialDataX1 = [3.3, 4.4, 3.9, 5.9, 4.6, 5.2, 4.0, 4.7, 4.5, 3.7, 4.6, 4.7, 3.9, 4.6, 5.1, 5.0, 4.8, 5.3, 3.9, 3.4];
const initialDataX2 = [2.8, 4.9, 5.3, 2.6, 5.1, 3.2, 4.0, 4.5, 4.1, 3.6, 4.6, 3.5, 4.6, 4.0, 3.6, 4.4, 4.4, 3.5, 3.8, 3.8];
const initialDataX3 = [3.1, 3.5, 4.8, 3.1, 5.0, 3.3, 3.3, 3.5, 3.7, 3.3, 3.6, 3.5, 3.6, 3.4, 3.3, 3.6, 3.4, 3.6, 3.4, 3.4];
const initialDataX4 = [4.1, 3.9, 4.7, 3.6, 4.1, 4.3, 4.0, 3.8, 3.6, 3.6, 3.6, 3.7, 4.1, 3.6, 4.0, 3.7, 3.6, 3.7, 4.0, 3.4];

function ExplainBox({ children }) {
  return (
    <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-900 leading-relaxed shadow-sm">
      <div className="flex items-start gap-2">
        <span className="text-lg flex-shrink-0">📖</span>
        <div className="space-y-2">{children}</div>
      </div>
    </div>
  );
}

export default function Part2MLR({ showExplanations = false }) {
  const [data, setData] = useState(() =>
    initialDataY.map((y, i) => ({ id: i + 1, y, x1: initialDataX1[i], x2: initialDataX2[i], x3: initialDataX3[i], x4: initialDataX4[i] }))
  );
  const [activeQ, setActiveQ] = useState(1);
  const [predX, setPredX] = useState({ x1: 5.1, x2: 4.7, x3: 4.8, x4: 4.0 });
  const alpha = 0.05;

  const handleDataChange = (index, field, value) => {
    let newData = [...data];
    newData[index][field] = parseFloat(value) || 0;
    setData(newData);
  };

  const mlr = useMemo(() => {
    const Y = data.map(d => d.y);
    const XMatrix = data.map(d => [d.x1, d.x2, d.x3, d.x4]);
    return calculateMLR(XMatrix, Y);
  }, [data]);

  const y_prediction = mlr.B[0] + mlr.B[1] * predX.x1 + mlr.B[2] * predX.x2 + mlr.B[3] * predX.x3 + mlr.B[4] * predX.x4;
  const f_crit = getCriticalValue('f', alpha, { df1: mlr.DF_R, df2: mlr.DF_E });
  const tCrit = Math.abs(getCriticalValue('t', alpha, { df: mlr.DF_E }, 2));

  return (
    <div className="space-y-6 animate-fade-in text-slate-800">

      {/* DATA TABLE */}
      <section className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-xl font-bold text-indigo-800 mb-3">Datos del Servidor (Uso de CPU vs Tráfico)</h2>
        {showExplanations && (
          <ExplainBox>
            <p><strong>¿Qué representa esta tabla?</strong> Contiene 20 observaciones del servidor del Banco de Venezuela. Cada fila es una medición simultánea del Uso de CPU (<strong>y</strong>, en %) junto con 4 métricas de red independientes:</p>
            <ul className="list-disc list-inside ml-2 space-y-1">
              <li><strong>x₁ (Tasa de Peticiones):</strong> Número de solicitudes por segundo al servidor, en miles. Más peticiones → mayor carga CPU esperada.</li>
              <li><strong>x₂ (Tamaño de Trama):</strong> Tamaño promedio de los paquetes de datos en KB. Tramas grandes requieren más procesamiento.</li>
              <li><strong>x₃ (Latencia de Red):</strong> Tiempo promedio de respuesta en ms. Puede actuar como proxy de congestión del servidor.</li>
              <li><strong>x₄ (Uso de Memoria):</strong> Porcentaje de memoria RAM utilizada simultáneamente. Podría correlacionar con CPU.</li>
            </ul>
            <p>El objetivo de la Regresión Lineal Múltiple es encontrar la ecuación que mejor predice el <strong>% de CPU (y)</strong> a partir de estas 4 variables explicativas, cuantificando el peso individual de cada una.</p>
          </ExplainBox>
        )}
        <div className="overflow-x-auto max-h-[250px] no-scrollbar border border-slate-200 rounded-lg mt-3">
          <table className="w-full text-left bg-white text-sm">
            <thead className="bg-slate-50 text-slate-600 sticky top-0 z-10">
              <tr>
                <th className="p-3">Obs.</th>
                <th className="p-3">CPU (y)</th>
                <th className="p-3">Peticiones (x<sub>1</sub>)</th>
                <th className="p-3">Trama (x<sub>2</sub>)</th>
                <th className="p-3">Latencia (x<sub>3</sub>)</th>
                <th className="p-3">Memoria (x<sub>4</sub>)</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="p-3 font-semibold text-slate-500">{row.id}</td>
                  {['y','x1','x2','x3','x4'].map(f => (
                    <td key={f} className="p-1">
                      <input type="number" step="0.1" value={row[f]} onChange={e => handleDataChange(i, f, e.target.value)}
                        className="w-16 bg-white border border-slate-300 text-slate-700 p-1.5 rounded outline-none text-sm" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* SUB-TABS */}
      <div className="flex overflow-x-auto pb-2 gap-2 no-scrollbar relative z-20">
        {[1,2,3,4,5,6,7].map(num => (
          <button key={num} onClick={() => setActiveQ(num)}
            className={`flex-shrink-0 px-4 py-2 rounded-lg font-bold text-sm transition-all active:scale-95 ${activeQ === num ? 'bg-indigo-800 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-indigo-50'}`}>
            Pregunta {num}
          </button>
        ))}
      </div>

      <div className="bg-white p-4 md:p-6 rounded-2xl border border-indigo-100 shadow-sm min-h-[400px]">

        {/* P1: Mínimos Cuadrados */}
        {activeQ === 1 && (
          <div className="space-y-6 animate-fade-in flex flex-col h-full">
            <h3 className="text-2xl font-bold text-indigo-800 border-b border-indigo-100 pb-2">1. Estimadores del Modelo por Mínimos Cuadrados</h3>

            {showExplanations && (
              <ExplainBox>
                <p><strong>¿Qué es la Regresión Lineal Múltiple (RLM)?</strong> Es una extensión de la regresión simple que modela la relación lineal entre una variable respuesta (y = CPU%) y múltiples predictoras (x₁, x₂, x₃, x₄). El modelo es: ŷ = β₀ + β₁x₁ + β₂x₂ + β₃x₃ + β₄x₄ + ε</p>
                <p><strong>El Método de Mínimos Cuadrados Ordinarios (MCO):</strong> Busca los valores de β que minimizan la Suma de Cuadrados de los Residuales (SCE = Σ(yᵢ - ŷᵢ)²). La solución analítica exacta en forma matricial es:</p>
                <p className="bg-white/80 p-2 rounded text-center font-mono font-bold text-indigo-800">B = (XᵀX)⁻¹ XᵀY</p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  <li><strong>X (Matriz de diseño, 20×5):</strong> Primera columna de "1s" para el intercepto, luego las 4 columnas de x₁...x₄. Con n=20 observaciones.</li>
                  <li><strong>Y (Vector respuesta, 20×1):</strong> Los 20 valores de CPU%.</li>
                  <li><strong>XᵀX (Matriz 5×5):</strong> Contiene las sumas de cuadrados y productos cruzados entre todas las variables. Su inversión es el paso más costoso computacionalmente.</li>
                  <li><strong>Xᵀy (Vector 5×1):</strong> Productos cruzados entre cada predictor y la respuesta.</li>
                  <li><strong>β₀ = Intercepto:</strong> Valor esperado del CPU% cuando TODAS las métricas de red son cero. Tiene valor matemático pero no interpretación práctica directa.</li>
                  <li><strong>βᵢ = Pendiente parcial:</strong> Cambio esperado en CPU% por cada unidad de incremento en xᵢ, manteniendo todas las demás constantes (ceteris paribus).</li>
                </ul>
              </ExplainBox>
            )}

            <div className="flex-grow space-y-6">
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 shadow-sm">
                <h4 className="font-bold text-slate-700 mb-2">Planteamiento Matricial:</h4>
                <p className="font-serif text-lg text-indigo-700 text-center py-2 bg-indigo-50 rounded border border-indigo-200">B = (XᵀX)⁻¹ XᵀY</p>
                <p className="text-sm mt-3 text-slate-600">X: Matriz 20×5 con columna de 1s + las 4 variables predictoras. Y: Vector columna 20×1 de uso de CPU%.</p>
              </div>
              <div className="bg-white p-5 border border-slate-200 rounded-lg shadow-sm">
                <h4 className="font-bold text-indigo-800 mb-3">Modelo Estimado (Resultado Numérico):</h4>
                <div className="font-mono text-sm overflow-x-auto whitespace-nowrap bg-slate-50 p-4 border border-slate-300 rounded leading-loose">
                  ŷ = β<sub>0</sub> + β<sub>1</sub>x<sub>1</sub> + β<sub>2</sub>x<sub>2</sub> + β<sub>3</sub>x<sub>3</sub> + β<sub>4</sub>x<sub>4</sub><br/>
                  ŷ = <strong>{mlr.B[0].toFixed(4)}</strong><br/>
                  {"    "}{mlr.B[1] >= 0 ? '+ ' : '- '}<strong>{Math.abs(mlr.B[1]).toFixed(4)}</strong> x<sub>1</sub><br/>
                  {"    "}{mlr.B[2] >= 0 ? '+ ' : '- '}<strong>{Math.abs(mlr.B[2]).toFixed(4)}</strong> x<sub>2</sub><br/>
                  {"    "}{mlr.B[3] >= 0 ? '+ ' : '- '}<strong>{Math.abs(mlr.B[3]).toFixed(4)}</strong> x<sub>3</sub><br/>
                  {"    "}{mlr.B[4] >= 0 ? '+ ' : '- '}<strong>{Math.abs(mlr.B[4]).toFixed(4)}</strong> x<sub>4</sub>
                </div>
              </div>
            </div>
            <div className="w-full mt-6 bg-indigo-900 text-white p-4 rounded-xl shadow-lg border-l-8 border-l-indigo-400">
              <h4 className="font-bold uppercase text-sm mb-1 tracking-wider opacity-90">Respuesta Final:</h4>
              <p>El modelo de MCO estima que la carga base del CPU es <strong>{mlr.B[0].toFixed(4)}%</strong>. Las peticiones de red (x₁) y la latencia (x₃) tienen el mayor impacto positivo en el consumo de CPU, mientras que x₂ y x₄ muestran efectos marginales.</p>
            </div>
          </div>
        )}

        {/* P2: Predicción */}
        {activeQ === 2 && (
          <div className="space-y-6 animate-fade-in flex flex-col h-full">
            <h3 className="text-2xl font-bold text-indigo-800 border-b border-indigo-100 pb-2">2. Predecir Uso de CPU del Servidor</h3>

            {showExplanations && (
              <ExplainBox>
                <p><strong>¿Cómo funciona la predicción con el modelo RLM?</strong> Una vez estimados los coeficientes β, predecir es simplemente sustituir los valores deseados de las variables predictoras en la ecuación del modelo y calcular ŷ.</p>
                <p><strong>¿Qué significa ŷ?</strong> ŷ (y-sombrero) es el valor <em>esperado</em> del CPU% para ese conjunto específico de condiciones de red. No es una medición real — es la predicción promedio del modelo para esos valores de x. La diferencia entre ŷ y el valor real observado sería el residual eᵢ = yᵢ - ŷᵢ.</p>
                <p><strong>Limitaciones importantes de la predicción:</strong></p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  <li><strong>Interpolación vs Extrapolación:</strong> El modelo es confiable solo si los valores de x que ingresas están dentro del rango de los datos originales. Predecir con x₁=10.0 cuando los datos van de 3.3 a 5.9 sería extrapolación — el modelo podría dar resultados sin sentido.</li>
                  <li><strong>Incertidumbre:</strong> La predicción puntual ŷ tiene un margen de error. El Intervalo de Predicción (más ancho que el IC de la media) cuantifica esa incertidumbre.</li>
                  <li><strong>Supuestos:</strong> La predicción es válida asumiendo que la relación lineal observada en los datos históricos se mantiene en el punto de predicción.</li>
                </ul>
                <p>Los valores por defecto (x₁=5.1, x₂=4.7, x₃=4.8, x₄=4.0) corresponden a un escenario específico descrito en el PDF del proyecto.</p>
              </ExplainBox>
            )}

            <div className="flex-grow space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                <div className="bg-slate-50 p-5 rounded-lg border border-slate-200 shadow-sm">
                  <h4 className="font-bold text-slate-800 mb-3">Variables del Escenario a Predecir</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm font-semibold text-slate-700">
                    {['x1','x2','x3','x4'].map((k, i) => (
                      <label key={k} className="flex flex-col gap-1">
                        x<sub>{i+1}</sub> {['(Peticiones)','(Trama)','(Latencia)','(Memoria)'][i]}
                        <input type="number" step="0.1" value={predX[k]} onChange={e => setPredX({...predX, [k]: parseFloat(e.target.value)||0})}
                          className="bg-white border border-slate-300 p-2 rounded outline-none focus:ring-1 focus:ring-indigo-400 font-mono text-indigo-700" />
                      </label>
                    ))}
                  </div>
                </div>
                <div className="bg-white p-5 rounded-lg border border-indigo-200 shadow-sm">
                  <h4 className="font-bold text-indigo-800 mb-3">Sustitución en el Modelo:</h4>
                  <div className="text-sm font-mono text-slate-600 mb-4 leading-relaxed bg-slate-50 p-3 rounded border border-slate-200">
                    ŷ = {mlr.B[0].toFixed(4)}<br/>
                    {"   "}{mlr.B[1] >= 0?'+':''}{mlr.B[1].toFixed(4)} × {predX.x1} = {(mlr.B[1]*predX.x1).toFixed(4)}<br/>
                    {"   "}{mlr.B[2] >= 0?'+':''}{mlr.B[2].toFixed(4)} × {predX.x2} = {(mlr.B[2]*predX.x2).toFixed(4)}<br/>
                    {"   "}{mlr.B[3] >= 0?'+':''}{mlr.B[3].toFixed(4)} × {predX.x3} = {(mlr.B[3]*predX.x3).toFixed(4)}<br/>
                    {"   "}{mlr.B[4] >= 0?'+':''}{mlr.B[4].toFixed(4)} × {predX.x4} = {(mlr.B[4]*predX.x4).toFixed(4)}
                  </div>
                  <div className="text-center bg-indigo-50 p-3 rounded-lg border border-indigo-200">
                    <span className="text-slate-600 text-sm">Σ =</span>
                    <span className="text-3xl font-black text-indigo-800 ml-2">{y_prediction.toFixed(4)}<span className="text-lg font-normal">%</span></span>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full mt-6 bg-indigo-900 text-white p-4 rounded-xl shadow-lg border-l-8 border-l-indigo-400">
              <h4 className="font-bold uppercase text-sm mb-1 tracking-wider opacity-90">Respuesta Final:</h4>
              <p>Para x = ({predX.x1}, {predX.x2}, {predX.x3}, {predX.x4}), el modelo predice un uso de CPU de <strong className="text-2xl">{y_prediction.toFixed(4)}%</strong>. Este valor es el promedio esperado bajo esas condiciones específicas de tráfico de red.</p>
            </div>
          </div>
        )}

        {/* P3: ANOVA Regresión */}
        {activeQ === 3 && (
          <div className="space-y-6 animate-fade-in flex flex-col h-full">
            <h3 className="text-2xl font-bold text-indigo-800 border-b border-indigo-100 pb-2">3. ANOVA para Bondad de Ajuste del Modelo</h3>

            {showExplanations && (
              <ExplainBox>
                <p><strong>¿Para qué sirve el ANOVA en Regresión?</strong> Evalúa si el modelo de regresión en su conjunto explica una cantidad estadísticamente significativa de la variación en y (CPU%). Es la prueba de significancia global del modelo.</p>
                <p><strong>Descomposición de la variabilidad total (SC<sub>Total</sub>):</strong></p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  <li><strong>SC<sub>Regresión</sub> = Σ(ŷᵢ - ȳ)²:</strong> Variación de los valores PREDICHOS respecto a la media. Es la parte de la variación de y que el modelo LOGRA explicar. Si sc_R es grande relativo a SC_T, el modelo es útil.</li>
                  <li><strong>SC<sub>Error</sub> = Σ(yᵢ - ŷᵢ)²:</strong> Variación de los residuales. Es la parte de la variabilidad de y que el modelo NO puede explicar. Idealmente debería ser pequeña.</li>
                  <li><strong>SC<sub>Total</sub> = SC<sub>R</sub> + SC<sub>E</sub>:</strong> Variación total de y respecto a su media global ȳ.</li>
                </ul>
                <p><strong>El estadístico F₀ = CM<sub>R</sub> / CM<sub>E</sub>:</strong></p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  <li>CM<sub>R</sub> = SC<sub>R</sub> / k = {mlr.SSR.toFixed(4)} / {mlr.DF_R} = {mlr.MSR.toFixed(4)} (k = número de predictores = 4)</li>
                  <li>CM<sub>E</sub> = SC<sub>E</sub> / (n-k-1) = {mlr.SSE.toFixed(4)} / {mlr.DF_E} = {mlr.MSE.toFixed(4)}</li>
                  <li>Un F₀ grande ({">"} F crítico = {f_crit.toFixed(4)}) indica que la variación explicada por el modelo es significativamente mayor que el error residual — el modelo añade valor predictivo real.</li>
                </ul>
                <p><strong>H₀ en esta prueba:</strong> β₁ = β₂ = β₃ = β₄ = 0 (ninguna variable aporta). H₁: Al menos un βᵢ ≠ 0.</p>
              </ExplainBox>
            )}

            <div className="flex-grow space-y-6">
              <p className="text-slate-600 text-sm">Se evalúa si al menos una de las 4 variables de red contribuye significativamente a explicar el Uso de CPU.</p>
              <div className="overflow-x-auto no-scrollbar shadow-sm">
                <table className="w-full text-left bg-white rounded-lg border border-slate-200">
                  <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
                    <tr>
                      <th className="p-3">Fuente</th><th className="p-3">SC</th><th className="p-3">GL</th><th className="p-3">CM</th><th className="p-3">F<sub>0</sub></th><th className="p-3">Valor P</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-600 text-sm">
                    <tr className="border-b border-slate-100">
                      <td className="p-3 font-semibold">Regresión</td>
                      <td className="p-3 font-mono">{mlr.SSR.toFixed(4)}</td>
                      <td className="p-3">{mlr.DF_R}</td>
                      <td className="p-3 font-mono">{mlr.MSR.toFixed(4)}</td>
                      <td className="p-3 text-indigo-700 font-bold bg-indigo-50">{mlr.F.toFixed(4)}</td>
                      <td className="p-3 font-bold text-emerald-600 bg-emerald-50">{mlr.p_F < 0.0001 ? '< 0.0001' : mlr.p_F.toFixed(4)}</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-3 font-semibold">Error</td>
                      <td className="p-3 font-mono">{mlr.SSE.toFixed(4)}</td>
                      <td className="p-3">{mlr.DF_E}</td>
                      <td className="p-3 font-mono">{mlr.MSE.toFixed(4)}</td>
                      <td></td><td></td>
                    </tr>
                    <tr className="bg-slate-50">
                      <td className="p-3 font-bold">Total</td>
                      <td className="p-3 font-bold">{(mlr.SSR + mlr.SSE).toFixed(4)}</td>
                      <td className="p-3 font-bold">{mlr.DF_R + mlr.DF_E}</td>
                      <td colSpan={3}></td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="bg-indigo-50 p-4 border border-indigo-200 rounded-lg text-sm text-indigo-900 flex flex-col md:flex-row gap-4 justify-between items-center">
                <div>
                  <strong>Cálculo:</strong> F<sub>0</sub> = CM<sub>R</sub> / CM<sub>E</sub> = {mlr.MSR.toFixed(4)} / {mlr.MSE.toFixed(4)} = <strong>{mlr.F.toFixed(4)}</strong>
                </div>
                <div className="bg-white p-3 rounded border border-indigo-100">
                  F<sub>crítico</sub> (α=0.05, {mlr.DF_R},{mlr.DF_E}) = <strong className="text-red-600">{f_crit.toFixed(4)}</strong>
                </div>
              </div>
            </div>
            <div className={`w-full mt-6 text-white p-4 rounded-xl shadow-lg border-l-8 ${mlr.F > f_crit ? 'bg-emerald-900 border-l-emerald-500' : 'bg-red-900 border-l-red-500'}`}>
              <h4 className="font-bold uppercase text-sm mb-1 tracking-wider opacity-90">Respuesta Final:</h4>
              <p>F<sub>0</sub> = {mlr.F.toFixed(4)} {">"} F<sub>crítico</sub> = {f_crit.toFixed(4)} (Valor P {mlr.p_F < 0.0001 ? '< 0.0001' : mlr.p_F.toFixed(4)}). <strong>El modelo RLM tiene bondad de ajuste global significativa</strong>: al menos una de las variables de red ayuda realmente a predecir el uso de CPU.</p>
            </div>
          </div>
        )}

        {/* P4: R² */}
        {activeQ === 4 && (
          <div className="space-y-6 animate-fade-in flex flex-col h-full">
            <h3 className="text-2xl font-bold text-indigo-800 border-b border-indigo-100 pb-2">4. Coeficiente de Determinación (R²)</h3>

            {showExplanations && (
              <ExplainBox>
                <p><strong>¿Qué mide R²?</strong> El Coeficiente de Determinación R² cuantifica la proporción de la variabilidad total de y (CPU%) que es explicada por el modelo de regresión. Varía entre 0 y 1 (o 0% y 100%).</p>
                <p><strong>Fórmula e interpretación:</strong></p>
                <p className="bg-white/80 p-2 rounded font-mono text-center">R² = SC<sub>Regresión</sub> / SC<sub>Total</sub> = {mlr.SSR.toFixed(4)} / {(mlr.SSR+mlr.SSE).toFixed(4)} = <strong>{mlr.R_squared.toFixed(4)}</strong></p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  <li><strong>R² = 1.0 (100%):</strong> El modelo predice perfectamente todos los valores. Prácticamente imposible con datos reales.</li>
                  <li><strong>R² = 0.0 (0%):</strong> El modelo no explica nada más que el promedio. Equivale a decir ŷ = ȳ siempre.</li>
                  <li><strong>R² = {(mlr.R_squared*100).toFixed(1)}%:</strong> Nuestro modelo explica el {(mlr.R_squared*100).toFixed(1)}% de la variabilidad observada en el CPU%. El {(100-mlr.R_squared*100).toFixed(1)}% restante se debe a factores no capturados (otras variables, ruido, no-linealidades).</li>
                </ul>
                <p><strong>¿Es un R² bueno?</strong> Depende del contexto. En ciencias exactas se esperan R² {">"} 0.95. En ciencias sociales o sistemas complejos, R² {">"} 0.60 suele considerarse aceptable. Para datos de uso de CPU de un servidor real con muchas fuentes de variación, este valor refleja una capacidad predictiva moderada-alta.</p>
                <p><strong>Importante — R² ajustado:</strong> Cuando se añaden predictores, R² siempre sube aunque no aporten información. El R² ajustado = 1 - (1-R²)(n-1)/(n-k-1) penaliza por predictores innecesarios y es una métrica más honesta del ajuste real.</p>
              </ExplainBox>
            )}

            <div className="flex-grow space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="bg-slate-50 p-5 rounded-lg border border-slate-200 shadow-sm text-center">
                  <h4 className="font-bold text-slate-800 mb-3">Cálculo Numérico de R²:</h4>
                  <div className="font-serif text-base bg-white p-4 border border-slate-200 rounded leading-relaxed">
                    R² = SC<sub>Regresión</sub> / SC<sub>Total</sub><br/>
                    R² = {mlr.SSR.toFixed(4)} / ({mlr.SSR.toFixed(4)} + {mlr.SSE.toFixed(4)})<br/>
                    R² = {mlr.SSR.toFixed(4)} / {(mlr.SSR + mlr.SSE).toFixed(4)}
                  </div>
                </div>
                <div className="bg-emerald-50 p-5 rounded-lg border border-emerald-200 shadow-sm text-center flex flex-col items-center">
                  <h4 className="font-bold text-emerald-900 mb-3">Resultado:</h4>
                  <div className="text-5xl font-black text-emerald-700 bg-white p-6 rounded-full aspect-square flex items-center justify-center border-4 border-emerald-500 shadow-lg">
                    {(mlr.R_squared * 100).toFixed(1)}<span className="text-2xl ml-1">%</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full mt-6 bg-indigo-900 text-white p-4 rounded-xl shadow-lg border-l-8 border-l-indigo-400">
              <h4 className="font-bold uppercase text-sm mb-1 tracking-wider opacity-90">Respuesta Final (Interpretación Explícita):</h4>
              <p>R² = <strong>{mlr.R_squared.toFixed(4)}</strong>. El <strong>{(mlr.R_squared*100).toFixed(2)}%</strong> de la variabilidad total observada en el Uso de CPU del servidor queda explicada por el comportamiento conjunto de las 4 métricas de red (Peticiones, Trama, Latencia y Memoria). El {(100-mlr.R_squared*100).toFixed(2)}% restante se atribuye a factores externos no medidos.</p>
            </div>
          </div>
        )}

        {/* P5: IC */}
        {activeQ === 5 && (
          <div className="space-y-6 animate-fade-in flex flex-col h-full">
            <h3 className="text-2xl font-bold text-indigo-800 border-b border-indigo-100 pb-2">5. Intervalos de Confianza 95% para β<sub>i</sub></h3>

            {showExplanations && (
              <ExplainBox>
                <p><strong>¿Qué es un Intervalo de Confianza para βᵢ?</strong> El coeficiente estimado β̂ᵢ es solo una estimación puntual basada en la muestra de 20 observaciones. Si se repitiera el experimento con otra muestra diferente, se obtendría un β̂ᵢ diferente. El IC al 95% define el rango [LI, LS] donde esperamos que caiga el parámetro poblacional verdadero βᵢ el 95% de las veces en muestras repetidas.</p>
                <p><strong>Fórmula:</strong> IC = β̂ᵢ ± t<sub>α/2, n-k-1</sub> · SE(β̂ᵢ)</p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  <li><strong>t<sub>α/2, {mlr.DF_E}</sub> = {tCrit.toFixed(4)}:</strong> Valor crítico de la distribución t de Student con {mlr.DF_E} grados de libertad. Con 95% de confianza y α=0.05.</li>
                  <li><strong>SE(β̂ᵢ):</strong> Error estándar del estimador. Se obtiene de la raíz de la diagonal de la matriz de covarianzas (XᵀX)⁻¹·σ̂². Mide la incertidumbre de la estimación.</li>
                  <li><strong>Margen = t · SE:</strong> El "rango de incertidumbre" a ambos lados del estimador.</li>
                </ul>
                <p><strong>Interpretación crítica — ¿El IC cruza el cero?</strong></p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  <li>Si LI {"< 0 <"} LS: El IC incluye el cero → el verdadero βᵢ <em>podría ser cero</em> → la variable <strong>puede no aportar</strong> al modelo (coincide con P-valor {">"} 0.05 en el test t).</li>
                  <li>Si ambos LI y LS son positivos (o ambos negativos): βᵢ definitivamente ≠ 0 → la variable <strong>sí aporta</strong> al modelo.</li>
                </ul>
                <p>Esta es una forma alternativa (y equivalente) al test t de significancia individual para interpretar si cada predictor es útil.</p>
              </ExplainBox>
            )}

            <div className="flex-grow space-y-6">
              <div className="bg-slate-50 p-4 border border-slate-200 rounded-lg text-sm text-slate-700">
                <p className="mb-2 font-bold">Fórmula aplicada:</p>
                <div className="flex flex-col md:flex-row gap-4 items-center">
                  <div className="font-mono bg-white p-3 rounded shadow-sm border border-slate-300">
                    IC = β̂<sub>i</sub> ± (t<sub>α/2, {mlr.DF_E}</sub> · SE<sub>βi</sub>)
                  </div>
                  <div className="text-xs bg-indigo-50 border border-indigo-200 p-2 rounded">
                    t<sub>0.025, {mlr.DF_E}</sub> = <strong className="text-indigo-700 text-sm">{tCrit.toFixed(4)}</strong>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left bg-white rounded-lg border border-slate-200 shadow-sm">
                  <thead className="bg-indigo-50 text-indigo-900 border-b border-indigo-200 text-sm">
                    <tr>
                      <th className="p-3">Estimador</th>
                      <th className="p-3">β̂<sub>i</sub></th>
                      <th className="p-3">SE(β̂<sub>i</sub>)</th>
                      <th className="p-3">Margen (±)</th>
                      <th className="p-3 text-center border-l border-indigo-100">Límite Inferior</th>
                      <th className="p-3 text-center">Límite Superior</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {mlr.B.map((b, idx) => {
                      const se = mlr.B_std_err[idx];
                      const me = tCrit * se;
                      const lo = b - me, hi = b + me;
                      const crossesZero = lo < 0 && hi > 0;
                      return (
                        <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="p-3 font-bold text-slate-700">{idx === 0 ? 'β₀ (Intercepto)' : `β${idx} (x${idx})`}</td>
                          <td className="p-3 font-mono">{b.toFixed(4)}</td>
                          <td className="p-3 font-mono">{se.toFixed(4)}</td>
                          <td className="p-3 font-mono text-red-500">±{me.toFixed(4)}</td>
                          <td className="p-3 text-center border-l border-slate-100">
                            <span className={`px-2 py-1 rounded text-sm ${lo < 0 ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>{lo.toFixed(4)}</span>
                          </td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-1 rounded text-sm ${hi < 0 ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>{hi.toFixed(4)}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="w-full mt-6 bg-indigo-900 text-white p-4 rounded-xl shadow-lg border-l-8 border-l-amber-400">
              <h4 className="font-bold uppercase text-sm mb-1 tracking-wider opacity-90">Respuesta Final:</h4>
              <p>Los intervalos donde el rango [LI, LS] <strong>cruza el cero</strong> (LI negativo y LS positivo) indican variables cuyo aporte real podría ser nulo. Estas coincidirán con las de mayor P-valor en la Pregunta 6. Los intervalos que no cruzan el cero confirman coeficientes significativamente distintos de cero con 95% de confianza.</p>
            </div>
          </div>
        )}

        {/* P6: Test T Individual */}
        {activeQ === 6 && (
          <div className="space-y-6 animate-fade-in flex flex-col h-full">
            <h3 className="text-2xl font-bold text-indigo-800 border-b border-indigo-100 pb-2">6. Significancia Individual de cada Variable (α=5%)</h3>

            {showExplanations && (
              <ExplainBox>
                <p><strong>¿Por qué probar cada βᵢ individualmente?</strong> El ANOVA global (Pregunta 3) solo dice que "al menos uno" de los predictores es significativo. Esta prueba individual desglosa cuál o cuáles son los responsables, permitiendo identificar variables redundantes que podrían eliminarse del modelo.</p>
                <p><strong>Hipótesis para cada predictor xᵢ:</strong></p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  <li>H₀: βᵢ = 0 (xᵢ no aporta información adicional al modelo, dado que los otros predictores ya están incluidos)</li>
                  <li>H₁: βᵢ ≠ 0 (xᵢ sí contribuye significativamente a predecir y)</li>
                </ul>
                <p><strong>Estadístico t₀ = β̂ᵢ / SE(β̂ᵢ):</strong> Mide cuántos errores estándar está β̂ᵢ alejado del cero. Un valor grande (en magnitud) indica que β̂ᵢ es "demasiado grande para ser cero por azar".</p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  <li>El P-valor de t₀ es la probabilidad de obtener un |t| tan extremo si H₀ fuera verdadera.</li>
                  <li>P {"< 0.05"}: SE RECHAZA H₀ → el predictor xᵢ aporta información significativa → <strong>DEBE mantenerse en el modelo</strong>.</li>
                  <li>P {"≥ 0.05"}: NO se rechaza H₀ → xᵢ podría ser prescindible → <strong>candidato a eliminarse</strong>.</li>
                </ul>
                <p><strong>Nota importante — multicolinealidad:</strong> Si dos predictores están muy correlacionados entre sí (ej. x₂ y x₄), ambos podrían resultar no significativos individualmente aunque juntos sí aporten al modelo. Esto se llama multicolinealidad y debe investigarse con el VIF (Factor de Inflación de Varianza).</p>
              </ExplainBox>
            )}

            <div className="flex-grow space-y-6">
              <p className="text-slate-600 text-sm">Se contrasta H₀: βᵢ = 0 para cada predictor mediante distribución t con {mlr.DF_E} grados de libertad. Valor crítico: t<sub>0.025, {mlr.DF_E}</sub> = ±{tCrit.toFixed(4)}.</p>
              <div className="overflow-x-auto no-scrollbar shadow-sm">
                <table className="w-full text-left bg-white rounded-lg border border-slate-200">
                  <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
                    <tr>
                      <th className="p-3">Predictor</th>
                      <th className="p-3">β̂ᵢ / SE = t₀</th>
                      <th className="p-3">Valor P</th>
                      <th className="p-3 text-center bg-indigo-50 border-l border-slate-200">Decisión (α=0.05)</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-600 text-sm">
                    {mlr.B.map((b, idx) => {
                      if (idx === 0) return null;
                      const se = mlr.B_std_err[idx];
                      const tstat = mlr.t_stats[idx];
                      const pval = mlr.p_values[idx];
                      return (
                        <tr key={idx} className="border-b border-slate-100">
                          <td className="p-3 font-bold text-slate-800">x<sub>{idx}</sub></td>
                          <td className="p-3 font-mono">{b.toFixed(4)} / {se.toFixed(4)} = <strong className="text-blue-700">{tstat.toFixed(4)}</strong></td>
                          <td className="p-3 font-mono">{pval < 0.0001 ? '< 0.0001' : pval.toFixed(4)}</td>
                          <td className="p-3 text-center bg-slate-50 border-l border-slate-100">
                            {pval < 0.05
                              ? <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded font-bold border border-emerald-200">✓ SÍ APORTA (Rechaza H₀)</span>
                              : <span className="bg-red-50 text-red-800 px-3 py-1 rounded font-bold border border-red-200">✗ NO Significativa (P {">"} 0.05)</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="w-full mt-6 bg-indigo-900 text-white p-4 rounded-xl shadow-lg border-l-8 border-l-indigo-400">
              <h4 className="font-bold uppercase text-sm mb-1 tracking-wider opacity-90">Respuesta Final:</h4>
              <p>Las variables con P {"< 0.05"} son estadísticamente significativas y deben mantenerse en el modelo. Las que muestran P alto no aportan evidencia de impacto individual sobre el CPU%, y son candidatas a eliminarse en la Pregunta 7.</p>
            </div>
          </div>
        )}

        {/* P7: Modelo Recomendado */}
        {activeQ === 7 && (
          <div className="space-y-6 animate-fade-in flex flex-col h-full">
            <h3 className="text-2xl font-bold text-blue-900 border-b border-blue-200 pb-2">7. ¿Cuál modelo recomendaría para el Banco?</h3>

            {showExplanations && (
              <ExplainBox>
                <p><strong>¿Por qué simplificar el modelo?</strong> Incluir predictores no significativos en un modelo de regresión tiene consecuencias negativas reales:</p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  <li><strong>Infla la varianza de los estimadores:</strong> Los SE(β̂ᵢ) de los predictores significativos aumentan cuando hay multicolinealidad, reduciendo el poder estadístico para detectar efectos reales.</li>
                  <li><strong>Sobreajuste (Overfitting):</strong> El R² siempre sube al añadir variables, pero el modelo puede adaptarse al ruido de los datos de entrenamiento y funcionar peor al predecir datos nuevos.</li>
                  <li><strong>Complejidad operacional innecesaria:</strong> Para el banco, monitorear 4 métricas de red en tiempo real tiene un costo de infraestructura. Si 2 de ellas no aportan, son recursos desperdiciados.</li>
                </ul>
                <p><strong>Principio de Parsimonia (Navaja de Ockham):</strong> Entre dos modelos que explican igual de bien los datos, siempre se prefiere el más simple. El modelo reducido ŷ = β₀ + β₁x₁ + β₃x₃ mantiene el poder predictivo esencial con menor complejidad.</p>
                <p><strong>Proceso de selección de variables:</strong></p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  <li><strong>Backward Elimination (usado aquí):</strong> Empezar con el modelo completo y eliminar una por una las variables con mayor P-valor hasta que todas las restantes sean significativas.</li>
                  <li><strong>Forward Selection:</strong> Empezar con el intercepto y añadir variables de mayor a menor significancia.</li>
                  <li><strong>Stepwise:</strong> Combinación de ambos — añadir y eliminar en cada paso según criterios AIC/BIC.</li>
                </ul>
                <p><strong>Recomendación final para el banco:</strong> Implementar monitoreo continuo solo de la Tasa de Peticiones (x₁) y la Latencia (x₃), eliminando los sensores de Tamaño de Trama (x₂) y Uso de Memoria (x₄) del modelo predictivo de CPU. Esto reduce costos sin sacrificar capacidad predictiva.</p>
              </ExplainBox>
            )}

            <div className="flex-grow space-y-6">
              <div className="bg-gradient-to-br from-white to-blue-50 p-6 rounded-xl border border-blue-200 shadow-sm leading-relaxed text-slate-800">
                <p className="mb-4">Basados en la Pregunta 6, las variables x₂ (Trama) y x₄ (Memoria) mostraron P-valores no significativos. Aplicando el Principio de Parsimonia, recomendamos el <strong>Modelo Reducido</strong>:</p>
                <div className="flex justify-center items-center py-6">
                  <div className="bg-white p-4 md:p-6 rounded-full shadow-lg border-2 border-dashed border-blue-400 font-mono text-xl md:text-2xl text-blue-900 font-extrabold">
                    ŷ = β<sub>0</sub> + β<sub>1</sub>x<sub>1</sub> + β<sub>3</sub>x<sub>3</sub>
                  </div>
                </div>
                <h4 className="font-bold text-slate-800 mb-2">Justificación técnica:</h4>
                <ul className="list-disc list-inside space-y-2 text-sm bg-white/70 p-4 rounded shadow-sm border border-slate-100">
                  <li><strong>Principio de Parsimonia:</strong> El modelo más simple con igual capacidad predictiva siempre es preferible. Las variables x₂ y x₄ no superan el umbral de significancia al 5%.</li>
                  <li><strong>Reducción del Ruido:</strong> Mantener predictores redundantes infla artificialmente los errores estándar de β₁ y β₃, reduciendo la confianza en sus estimaciones.</li>
                  <li><strong>Eficiencia Operacional:</strong> Para el banco, monitorear solo 2 métricas en lugar de 4 reduce costos de infraestructura de telemetría en ~50%.</li>
                </ul>
              </div>
            </div>
            <div className="w-full mt-6 bg-black text-white p-4 rounded-xl shadow-lg border-l-8 border-l-emerald-400">
              <h4 className="font-bold uppercase text-sm mb-1 tracking-wider text-emerald-400">Decisión Corporativa / Veredicto Final:</h4>
              <p className="text-slate-300">Implementar el <strong className="text-white">modelo reducido ŷ = β₀ + β₁x₁ + β₃x₃</strong>, monitoreando exclusivamente la Tasa de Peticiones y la Latencia de Red para predecir el uso de CPU del servidor con máxima eficiencia estadística y operacional.</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
