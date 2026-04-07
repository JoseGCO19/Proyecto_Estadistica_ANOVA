"use client";
import { useState } from 'react';
import Part1ANOVA from '@/components/Part1ANOVA';
import Part2MLR from '@/components/Part2MLR';
import StatCalculator from '@/components/StatCalculator';
import { LayoutDashboard, Target, Calculator } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('part1');
  const [showExplanations, setShowExplanations] = useState(false);

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-slate-200 text-slate-800 p-3 md:p-8 font-sans transition-colors duration-500">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6 md:mb-10 text-center space-y-3">
          <h1 className="text-3xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-800 to-slate-800">
            Estadística Inferencial: Proyecto ANOVA
          </h1>
          <p className="text-slate-600 text-sm md:text-lg font-medium">
            Defensa interactiva del proyecto estadístico - Banco de Venezuela
          </p>
        </header>

        {/* Tab Navigation - Scrollable on mobile */}
        <div className="flex overflow-x-auto pb-4 mb-4 md:mb-8 md:justify-center gap-3 no-scrollbar relative z-20">
          <button
            onClick={() => setActiveTab('part1')}
            className={`flex items-center gap-2 px-5 py-3 md:px-6 md:py-3 rounded-full font-bold transition-all duration-300 shadow-sm whitespace-nowrap active:scale-95 ${activeTab === 'part1' ? 'bg-blue-700 text-white shadow-blue-500/30' : 'bg-white text-slate-600 hover:bg-blue-50'}`}
          >
            <LayoutDashboard size={20} /> Parte 1 (ANOVA)
          </button>
          <button
            onClick={() => setActiveTab('part2')}
            className={`flex items-center gap-2 px-5 py-3 md:px-6 md:py-3 rounded-full font-bold transition-all duration-300 shadow-sm whitespace-nowrap active:scale-95 ${activeTab === 'part2' ? 'bg-slate-800 text-white shadow-slate-500/30' : 'bg-white text-slate-600 hover:bg-blue-50'}`}
          >
            <Target size={20} /> Parte 2 (Regresión)
          </button>
          <button
            onClick={() => setActiveTab('calc')}
            className={`flex items-center gap-2 px-5 py-3 md:px-6 md:py-3 rounded-full font-bold transition-all duration-300 shadow-sm whitespace-nowrap active:scale-95 ${activeTab === 'calc' ? 'bg-teal-700 text-white shadow-teal-500/30' : 'bg-white text-slate-600 hover:bg-blue-50'}`}
          >
            <Calculator size={20} /> Calculadora Estadística
          </button>
        </div>

        {/* Content Area */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl md:rounded-3xl p-4 md:p-8 border border-white/60 shadow-xl shadow-blue-900/5">
          {activeTab === 'part1' && <Part1ANOVA showExplanations={showExplanations} />}
          {activeTab === 'part2' && <Part2MLR showExplanations={showExplanations} />}
          {activeTab === 'calc' && <StatCalculator />}
        </div>
      </div>

      {/* FLOATING EXPLANATION TOGGLE BUTTON */}
      <button
        onClick={() => setShowExplanations(prev => !prev)}
        className={`fixed bottom-6 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-full font-bold text-sm shadow-2xl border-2 transition-all duration-300 active:scale-95 ${
          showExplanations
            ? 'bg-amber-500 text-white border-amber-600 shadow-amber-400/40'
            : 'bg-blue-900 text-white border-blue-700 shadow-blue-900/40'
        }`}
        title={showExplanations ? 'Ocultar explicaciones' : 'Mostrar explicaciones detalladas'}
      >
        <span className="text-lg">{showExplanations ? '📖' : '💡'}</span>
        <span className="hidden md:inline">
          {showExplanations ? 'Ocultar Explicaciones' : 'Modo Explicación'}
        </span>
        <span className="md:hidden">
          {showExplanations ? 'Ocultar' : 'Explicar'}
        </span>
      </button>
    </main>
  );
}
