'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api-client';
import { 
  Microscope, 
  BarChart3, 
  Radio, 
  HardDrive, 
  BrainCircuit, 
  Download, 
  Layers, 
  Cpu, 
  FileSpreadsheet, 
  Plus, 
  Sparkles,
  Activity,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

export default function ResearchPage() {
  const [mounted, setMounted] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const handleDownloadDataset = async (datasetName: string) => {
    setIsExporting(true);
    try {
      const res = await api.getResearchDatasets();
      const jsonStr = JSON.stringify(res.data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${datasetName.toLowerCase().replace(/\s+/g, '_')}_anonymized.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      alert(`Export notice: ${e.message || 'Error exporting dataset'}`);
    } finally {
      setIsExporting(false);
    }
  };

  const sensors = [
    { name: 'Photoplethysmography (PPG)', status: 'active', dataRate: '100 Hz', samples: '1.24M', color: '#FF3366' },
    { name: 'Tri-Axial Accelerometer', status: 'active', dataRate: '50 Hz', samples: '890K', color: '#00D4FF' },
    { name: '6-Axis Gyroscope', status: 'active', dataRate: '50 Hz', samples: '890K', color: '#A855F7' },
    { name: 'Sub-Dermal Epidermal Temp', status: 'active', dataRate: '1 Hz', samples: '45.2K', color: '#FFB800' },
    { name: 'Galvanic Skin Response (EDA)', status: 'standby', dataRate: '4 Hz', samples: '210K', color: '#06FDD8' },
    { name: 'Dual-Wavelength SpO2 Module', status: 'active', dataRate: '25 Hz', samples: '520K', color: '#00FF88' },
  ];

  const datasets = [
    { name: 'Heart Rate Variability Time-Domain', records: '2.4M', size: '1.8 GB', format: 'JSON', updated: '2 hrs ago' },
    { name: 'Polysomnographic Sleep Stages', records: '180K', size: '420 MB', format: 'JSON', updated: '6 hrs ago' },
    { name: 'Electrodermal Stress Biomarkers', records: '960K', size: '780 MB', format: 'JSON', updated: '1 day ago' },
    { name: 'Continuous Gait Kinetic Series', records: '3.1M', size: '2.2 GB', format: 'JSON', updated: '4 hrs ago' },
  ];

  const behaviorPatterns = [
    { pattern: 'Morning Sympathetic Activity Surge', confidence: 94, trend: 'Harmonic', color: '#00FF88' },
    { pattern: 'Post-Prandial Glycemic Dips', confidence: 87, trend: 'Observed', color: '#FFB800' },
    { pattern: 'Evening Vagal Tone Restoration', confidence: 91, trend: 'Optimal', color: '#00D4FF' },
    { pattern: 'Circadian Sleep Spindle Coherence', confidence: 84, trend: 'Stabilizing', color: '#A855F7' },
  ];

  return (
    <div className="page-section space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Microscope className="w-4 h-4 text-neon-purple" />
            <span className="text-xs font-mono text-neon-purple tracking-wider uppercase font-semibold">BioData Science & Multimodal Sensors</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white" style={{ fontFamily: 'var(--font-display)' }}>
            Research <span className="gradient-text">Portal</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">High-frequency biometric sampling, dataset export pipeline, and neural behavior analysis</p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => handleDownloadDataset('VitaWatch_Spectra_Telemetry_Archive')}
            disabled={isExporting}
            className="btn-neon text-xs px-4 py-2 cursor-pointer flex items-center gap-2"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? 'Exporting...' : 'Export Archive'}</span>
          </button>
          <button 
            onClick={() => alert('New Clinical Study pipeline registered (IRB Protocol Attached).')}
            className="btn-neon-solid text-xs px-4 py-2 cursor-pointer flex items-center gap-2"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Study Protocol</span>
          </button>
        </div>
      </div>

      {/* Aggregate Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Sample Telemetry Points', value: '8.24M', icon: BarChart3, color: '#00D4FF' },
          { label: 'Active Micro-Sensors', value: '5/6 Online', icon: Radio, color: '#00FF88' },
          { label: 'Ingested Vault Size', value: '5.20 GB', icon: HardDrive, color: '#A855F7' },
          { label: 'Inference AI Models', value: '14 Active', icon: BrainCircuit, color: '#FFB800' },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="glass-card p-5 text-center border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
              <div className="w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ background: `${s.color}15`, color: s.color, border: `1px solid ${s.color}30` }}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="text-2xl font-black font-mono text-white mb-1" style={{ color: s.color }}>
                {s.value}
              </div>
              <div className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider">{s.label}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sensor Analytics */}
        <div className="glass-card p-6 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center text-neon-cyan">
                <Radio className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white tracking-wide">Sensor Hardware Bus</h3>
            </div>
            <span className="text-[0.62rem] font-mono text-neon-cyan">I2C / SPI Bus Active</span>
          </div>

          <div className="space-y-3">
            {sensors.map((s, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/15 transition-colors">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.status === 'active' ? s.color : '#64748B', boxShadow: s.status === 'active' ? `0 0 8px ${s.color}` : 'none' }} />
                <span className="text-xs font-semibold text-white flex-1">{s.name}</span>
                <span className="text-[0.68rem] font-mono text-slate-400 font-bold px-2 py-0.5 rounded-md bg-white/[0.04]">{s.dataRate}</span>
                <span className="text-[0.68rem] font-mono font-bold" style={{ color: s.color }}>{s.samples}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Behavior Analysis */}
        <div className="glass-card p-6 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-neon-purple/10 border border-neon-purple/30 flex items-center justify-center text-neon-purple">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white tracking-wide">Neural Pattern Signatures</h3>
            </div>
            <span className="text-[0.62rem] font-mono text-slate-400">Bayesian Confidence</span>
          </div>

          <div className="space-y-3.5">
            {behaviorPatterns.map((b, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/15 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white">{b.pattern}</span>
                  <span className="text-[0.62rem] font-mono px-2 py-0.5 rounded-full font-bold" style={{ background: `${b.color}20`, color: b.color, border: `1px solid ${b.color}35` }}>
                    {b.trend}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 rounded-full bg-white/[0.05] overflow-hidden p-[1px]">
                    <div 
                      className="h-full rounded-full transition-all duration-1000" 
                      style={{ 
                        width: `${b.confidence}%`, 
                        background: b.color, 
                        boxShadow: `0 0 8px ${b.color}60` 
                      }} 
                    />
                  </div>
                  <span className="text-[0.68rem] font-mono font-bold" style={{ color: b.color }}>{b.confidence}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dataset Management */}
      <div className="glass-card p-6 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-neon-blue/10 border border-neon-blue/30 flex items-center justify-center text-neon-blue">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">Structured Clinical Dataset Vault</h3>
              <p className="text-[0.68rem] text-slate-400 font-mono">Strict k-anonymity guarantee • Zero PII retention</p>
            </div>
          </div>
          <span className="text-[0.62rem] font-mono text-emerald-400 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            <span>GDPR & HIPAA Anonymized</span>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 uppercase font-mono text-[0.65rem]">
                <th className="text-left p-3">Dataset Name</th>
                <th className="text-left p-3">Telemetry Points</th>
                <th className="text-left p-3">Compressed Size</th>
                <th className="text-left p-3">Data Schema</th>
                <th className="text-left p-3">Last Synchronized</th>
                <th className="text-right p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {datasets.map((d, i) => (
                <tr key={i} className="hover:bg-white/[0.03] transition-colors border-b border-white/5">
                  <td className="p-3.5 font-bold text-white flex items-center gap-2">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-neon-cyan" />
                    {d.name}
                  </td>
                  <td className="p-3.5 font-mono text-neon-cyan font-bold">{d.records}</td>
                  <td className="p-3.5 text-slate-300 font-mono">{d.size}</td>
                  <td className="p-3.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[0.62rem] font-mono font-bold bg-neon-blue/15 text-neon-blue border border-neon-blue/30">
                      {d.format}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-400 font-mono text-[0.68rem]">{d.updated}</td>
                  <td className="p-3.5 text-right">
                    <button 
                      onClick={() => handleDownloadDataset(d.name)}
                      disabled={isExporting}
                      className="btn-emerald text-[0.68rem] px-3 py-1 cursor-pointer"
                    >
                      <Download className="w-3 h-3 mr-1" /> Download JSON
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
