import React, { useState, useMemo } from 'react';
import { 
  Search, 
  ArrowUpDown, 
  Download, 
  ShieldAlert, 
  ShieldCheck, 
  ChevronRight, 
  X, 
  Activity, 
  Cpu
} from 'lucide-react';
import { AUDIT_HISTORY, AuditRecord } from '../data/auditHistory';

interface InvestigationHistoryViewProps {
  onInspectRecord?: (record: AuditRecord) => void;
}

export const InvestigationHistoryView: React.FC<InvestigationHistoryViewProps> = ({ onInspectRecord }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [verdictFilter, setVerdictFilter] = useState<'ALL' | 'SYNTHETIC' | 'AUTHENTIC'>('ALL');
  const [datasetFilter, setDatasetFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'timestamp' | 'nyquistEnergy' | 'bgNoiseVar' | 'confidence'>('nyquistEnergy');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedRecord, setSelectedRecord] = useState<AuditRecord | null>(null);

  const filteredRecords = useMemo(() => {
    return AUDIT_HISTORY.filter((item) => {
      const matchesSearch = 
        item.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.summary.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesVerdict = 
        verdictFilter === 'ALL' ? true : item.verdict === verdictFilter;

      const matchesDataset =
        datasetFilter === 'ALL' ? true : item.dataset === datasetFilter;

      return matchesSearch && matchesVerdict && matchesDataset;
    }).sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      if (sortBy === 'confidence') {
        valA = parseFloat(a.confidence);
        valB = parseFloat(b.confidence);
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [searchTerm, verdictFilter, datasetFilter, sortBy, sortOrder]);

  const stats = useMemo(() => {
    const total = AUDIT_HISTORY.length;
    const synthetic = AUDIT_HISTORY.filter((r) => r.verdict === 'SYNTHETIC').length;
    const authentic = AUDIT_HISTORY.filter((r) => r.verdict === 'AUTHENTIC').length;
    return { total, synthetic, authentic };
  }, []);

  const handleExportCSV = () => {
    const headers = ['ID', 'Filename', 'Dataset', 'Verdict', 'Confidence', 'Nyquist Energy', 'Sensor Noise Var', 'Device Model'];
    const rows = filteredRecords.map((r) => [
      r.id,
      r.fileName,
      `"${r.dataset}"`,
      r.verdict,
      r.confidence,
      r.nyquistEnergy,
      r.bgNoiseVar,
      `"${r.deviceModel}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `forensiq_audit_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 pt-32 pb-24">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="flex flex-col gap-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono text-[#A1A1AA] w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
            <span>Cryptographic Ledger & Audit Logs</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#EDEDEF] leading-tight">
            Corpus Forensics & Benchmark History
          </h1>
          <p className="text-sm text-[#A1A1AA] leading-relaxed">
            Historical empirical audit repository consisting of 134 verified specimens across smartphone optical lenses, compression channels, and latent diffusion engines.
          </p>
        </div>

        {/* Quick Stat Counter Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col">
            <span className="text-[10px] font-mono text-[#71717A] uppercase">Total Scanned</span>
            <span className="text-xl font-bold font-mono text-[#EDEDEF] mt-0.5">{stats.total}</span>
          </div>
          <div className="px-4 py-3 rounded-xl bg-rose-500/[0.04] border border-rose-500/20 flex flex-col">
            <span className="text-[10px] font-mono text-rose-400 uppercase">Synthetic</span>
            <span className="text-xl font-bold font-mono text-rose-400 mt-0.5">{stats.synthetic}</span>
          </div>
          <div className="px-4 py-3 rounded-xl bg-emerald-500/[0.04] border border-emerald-500/20 flex flex-col">
            <span className="text-[10px] font-mono text-emerald-400 uppercase">Authentic</span>
            <span className="text-xl font-bold font-mono text-emerald-400 mt-0.5">{stats.authentic}</span>
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Filters */}
      <div className="glass-panel p-4 rounded-2xl mb-6 flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full lg:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717A]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by file name, ID, or observation..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder-[#71717A] text-xs focus:outline-none focus:border-white/30 transition"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Verdict Segmented Toggle */}
        <div className="flex items-center gap-1 bg-[#15171C] p-1 rounded-xl border border-white/[0.06] w-full lg:w-auto">
          <button
            onClick={() => setVerdictFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              verdictFilter === 'ALL'
                ? 'bg-white text-[#090A0C] font-semibold shadow-sm'
                : 'text-[#A1A1AA] hover:text-white'
            }`}
          >
            All ({AUDIT_HISTORY.length})
          </button>
          <button
            onClick={() => setVerdictFilter('SYNTHETIC')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              verdictFilter === 'SYNTHETIC'
                ? 'bg-rose-500 text-white font-semibold'
                : 'text-[#A1A1AA] hover:text-white'
            }`}
          >
            Synthetic ({stats.synthetic})
          </button>
          <button
            onClick={() => setVerdictFilter('AUTHENTIC')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              verdictFilter === 'AUTHENTIC'
                ? 'bg-emerald-500 text-white font-semibold'
                : 'text-[#A1A1AA] hover:text-white'
            }`}
          >
            Authentic ({stats.authentic})
          </button>
        </div>

        {/* Dataset Selection & Sort & Export */}
        <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
          <select
            value={datasetFilter}
            onChange={(e) => setDatasetFilter(e.target.value)}
            aria-label="Filter records by dataset"
            className="px-3 py-2 rounded-xl bg-[#15171C] border border-white/10 text-xs text-[#A1A1AA] focus:outline-none focus:border-white/30"
          >
            <option value="ALL">All Datasets</option>
            <option value="Mirha Album Audit">Mirha Album Audit (16)</option>
            <option value="University Friends Corpus">University Friends Corpus (118)</option>
          </select>

          <button
            onClick={() => {
              if (sortBy === 'nyquistEnergy') {
                setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
              } else {
                setSortBy('nyquistEnergy');
                setSortOrder('desc');
              }
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#15171C] border border-white/10 text-xs text-[#A1A1AA] hover:text-white transition"
            title="Sort by Nyquist Energy"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-white/70" />
            <span className="hidden sm:inline">Nyquist</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs text-[#EDEDEF] transition hover:border-white/30"
          >
            <Download className="w-3.5 h-3.5 text-white/80" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Main Forensic Audit Table */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#121317] border-b border-white/[0.06] font-mono text-[11px] text-[#71717A] uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 font-medium">Record ID</th>
                <th className="py-3.5 px-4 font-medium">Image File</th>
                <th className="py-3.5 px-4 font-medium">Dataset Origin</th>
                <th className="py-3.5 px-4 font-medium">Verdict</th>
                <th className="py-3.5 px-4 font-medium">Nyquist Energy</th>
                <th className="py-3.5 px-4 font-medium">Sensor Shot Noise</th>
                <th className="py-3.5 px-4 font-medium">Confidence</th>
                <th className="py-3.5 px-4 text-right font-medium">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] font-sans">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#71717A] text-xs">
                    No forensic records match your current query or filter criteria.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => {
                  const isSynthetic = record.verdict === 'SYNTHETIC';
                  return (
                    <tr
                      key={record.id}
                      onClick={() => setSelectedRecord(record)}
                      className="hover:bg-white/[0.03] transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4 font-mono text-[#A1A1AA]">
                        {record.id}
                      </td>

                      <td className="py-3.5 px-4 font-medium text-[#EDEDEF] max-w-[200px] truncate group-hover:text-white transition-colors">
                        {record.fileName}
                      </td>

                      <td className="py-3.5 px-4 text-[#71717A]">
                        {record.dataset}
                      </td>

                      <td className="py-3.5 px-4">
                        {isSynthetic ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-mono text-[10px] font-semibold">
                            <ShieldAlert className="w-3 h-3" />
                            <span>SYNTHETIC</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-[10px] font-semibold">
                            <ShieldCheck className="w-3 h-3" />
                            <span>AUTHENTIC</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-mono">
                        <span className={record.nyquistEnergy > 0.0008 ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                          {record.nyquistEnergy.toFixed(6)}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[#71717A]">
                        {record.bgNoiseVar.toFixed(1)}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[#EDEDEF] font-medium">
                        {record.confidence}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-white/[0.04] group-hover:bg-white/10 group-hover:text-white text-[#71717A] transition">
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Inspection Side Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-2xl rounded-3xl glass-panel p-8 flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between pb-4 border-b border-white/[0.06]">
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-mono text-[#71717A] uppercase">
                  Specimen Dossier: {selectedRecord.id}
                </span>
                <h3 className="font-display text-2xl font-bold text-white">
                  {selectedRecord.fileName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/10 text-[#A1A1AA] hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className={`p-4 rounded-2xl flex items-center justify-between border ${
              selectedRecord.verdict === 'SYNTHETIC'
                ? 'bg-rose-500/10 border-rose-500/25 text-rose-400'
                : 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
            }`}>
              <div className="flex items-center gap-3">
                {selectedRecord.verdict === 'SYNTHETIC' ? (
                  <ShieldAlert className="w-6 h-6" />
                ) : (
                  <ShieldCheck className="w-6 h-6" />
                )}
                <div>
                  <div className="font-bold text-sm">
                    {selectedRecord.verdict === 'SYNTHETIC' ? 'SYNTHETIC AI GENERATION' : 'AUTHENTIC OPTICAL CAPTURE'}
                  </div>
                  <div className="text-xs opacity-80">
                    Confidence calibrated at {selectedRecord.confidence}
                  </div>
                </div>
              </div>
              <span className="font-mono text-xl font-bold">{selectedRecord.confidence}</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-black/30 border border-white/[0.05] flex flex-col gap-1">
                <span className="text-xs text-[#71717A] flex items-center gap-1.5 font-mono">
                  <Activity className="w-3.5 h-3.5 text-white/70" />
                  Nyquist Frequency Energy
                </span>
                <span className="font-mono text-lg font-bold text-white">
                  {selectedRecord.nyquistEnergy.toFixed(6)}
                </span>
                <span className="text-[10px] text-[#71717A]">
                  {selectedRecord.nyquistEnergy > 0.000800 ? 'Exceeds physical optical threshold (0.0008)' : 'Natural diffraction rolloff (<0.0006)'}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-black/30 border border-white/[0.05] flex flex-col gap-1">
                <span className="text-xs text-[#71717A] flex items-center gap-1.5 font-mono">
                  <Cpu className="w-3.5 h-3.5 text-white/70" />
                  CMOS Sensor Noise Floor
                </span>
                <span className="font-mono text-lg font-bold text-white">
                  {selectedRecord.bgNoiseVar.toFixed(2)}
                </span>
                <span className="text-[10px] text-[#71717A]">
                  {selectedRecord.bgNoiseVar > 2.0 ? 'Natural silicon photon shot variance' : 'Digital mathematical void'}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs font-mono text-[#71717A] uppercase">
                Forensic Analysis & Summary
              </span>
              <p className="text-xs text-[#EDEDEF] bg-black/30 p-4 rounded-xl border border-white/[0.05] leading-relaxed">
                {selectedRecord.summary}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono text-[#71717A]">
              <div>Dataset: <span className="text-[#EDEDEF]">{selectedRecord.dataset}</span></div>
              <div>Device Profile: <span className="text-[#EDEDEF]">{selectedRecord.deviceModel}</span></div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-5 py-2 rounded-full bg-white/[0.06] hover:bg-white/10 text-white font-medium text-xs transition"
              >
                Close
              </button>
              {onInspectRecord && (
                <button
                  onClick={() => {
                    const rec = selectedRecord;
                    setSelectedRecord(null);
                    onInspectRecord(rec);
                  }}
                  className="px-5 py-2 rounded-full btn-porcelain text-xs font-semibold"
                >
                  Inspect in Workbench Lab
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
