import React, { useState } from 'react';
import { ApplicationItem, ApplicationStatus } from '../types';
import {
  Briefcase,
  Plus,
  Sparkles,
  TrendingUp,
  MapPin,
  Calendar,
  DollarSign,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Trash2,
  ExternalLink,
  ChevronRight,
  Target,
  Share2,
  Info,
  RotateCcw,
  BarChart3,
  Award
} from 'lucide-react';
import { storageService } from '../services/storage';

interface ProgressApplicationsViewProps {
  applications: ApplicationItem[];
  onUpdateApplications: (apps: ApplicationItem[]) => void;
  onSelectApplicationForPitch: (app: ApplicationItem) => void;
}

export const ProgressApplicationsView: React.FC<ProgressApplicationsViewProps> = ({
  applications,
  onUpdateApplications,
  onSelectApplicationForPitch
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedFamily, setSelectedFamily] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState<boolean>(false);

  // New Application Form State
  const [newCompany, setNewCompany] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newJobFamily, setNewJobFamily] = useState('Generative AI & Agents');
  const [newDateApplied, setNewDateApplied] = useState(() => new Date().toISOString().split('T')[0]);
  const [newSource, setNewSource] = useState('LinkedIn');
  const [newStatus, setNewStatus] = useState<ApplicationStatus>('applied');
  const [newLocation, setNewLocation] = useState('Remote (US)');
  const [newSalary, setNewSalary] = useState('$175,000 - $210,000');
  const [newNotes, setNewNotes] = useState('');

  const statusOptions: Array<{ value: ApplicationStatus; label: string; color: string; bg: string; border: string }> = [
    { value: 'applied', label: 'Applied', color: 'text-blue-300', bg: 'bg-blue-950/40', border: 'border-blue-500/30' },
    { value: 'assessment', label: 'Assessment', color: 'text-purple-300', bg: 'bg-purple-950/40', border: 'border-purple-500/30' },
    { value: 'interview', label: 'Interview', color: 'text-amber-300', bg: 'bg-amber-950/40', border: 'border-amber-500/30' },
    { value: 'offer', label: 'Offer', color: 'text-emerald-300', bg: 'bg-emerald-950/40', border: 'border-emerald-500/30' },
    { value: 'rejected', label: 'Rejected', color: 'text-rose-300', bg: 'bg-rose-950/40', border: 'border-rose-500/30' }
  ];

  const jobFamilyOptions = [
    'Generative AI & Agents',
    'Backend & Cloud Systems',
    'Machine Learning & Data',
    'Full-Stack AI Engineering',
    'Other'
  ];

  const sourceOptions = [
    'LinkedIn',
    'Company Careers',
    'Referral',
    'Wellfound',
    'Direct Pitch',
    'Recruiter Outreach',
    'Other'
  ];

  // -------------------------------------------------------------
  // Analytics Calculations
  // -------------------------------------------------------------
  const totalApps = applications.length;
  // A "response" is defined as any stage beyond initial un-responded submission ('applied')
  const responsesCount = applications.filter((app) => app.status !== 'applied').length;
  // Interviews: currently in interview stage or progressed to offer
  const interviewsCount = applications.filter((app) => app.status === 'interview' || app.status === 'offer').length;
  const offersCount = applications.filter((app) => app.status === 'offer').length;
  const overallResponseRate = totalApps > 0 ? Math.round((responsesCount / totalApps) * 100) : 0;

  // Breakdown by Job Family
  const familyStats = React.useMemo(() => {
    const map: Record<string, { total: number; responses: number; interviews: number; offers: number }> = {};
    applications.forEach((app) => {
      const fam = app.job_family || 'Other';
      if (!map[fam]) {
        map[fam] = { total: 0, responses: 0, interviews: 0, offers: 0 };
      }
      map[fam].total += 1;
      if (app.status !== 'applied') map[fam].responses += 1;
      if (app.status === 'interview' || app.status === 'offer') map[fam].interviews += 1;
      if (app.status === 'offer') map[fam].offers += 1;
    });
    return Object.entries(map).map(([family, stats]) => ({
      family,
      total: stats.total,
      responses: stats.responses,
      interviews: stats.interviews,
      offers: stats.offers,
      responseRate: Math.round((stats.responses / stats.total) * 100)
    }));
  }, [applications]);

  // -------------------------------------------------------------
  // Filtered List
  // -------------------------------------------------------------
  const filteredApps = applications.filter((app) => {
    const matchesStatus = selectedStatus === 'All' || app.status === selectedStatus;
    const matchesFamily = selectedFamily === 'All' || app.job_family === selectedFamily;
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      !q ||
      app.company.toLowerCase().includes(q) ||
      app.role.toLowerCase().includes(q) ||
      (app.job_family && app.job_family.toLowerCase().includes(q)) ||
      (app.source && app.source.toLowerCase().includes(q)) ||
      (app.notes && app.notes.toLowerCase().includes(q));
    return matchesStatus && matchesFamily && matchesSearch;
  });

  // Handlers
  const handleStatusChange = (appId: string, nextStatus: ApplicationStatus) => {
    const updated = applications.map((app) =>
      app.id === appId ? { ...app, status: nextStatus, is_synthetic: app.is_synthetic ?? false } : app
    );
    onUpdateApplications(updated);
  };

  const handleDeleteApplication = (appId: string) => {
    if (window.confirm('Are you sure you want to remove this application record?')) {
      const updated = applications.filter((app) => app.id !== appId);
      onUpdateApplications(updated);
    }
  };

  const handleResetToSample = () => {
    if (window.confirm('Reset application pipeline to the 6 synthetic sample applications? Any custom entries will be replaced.')) {
      const resetApps = storageService.resetApplicationsToSynthetic();
      onUpdateApplications(resetApps);
    }
  };

  const handleAddApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany.trim() || !newRole.trim()) return;

    const newApp: ApplicationItem = {
      id: `app-user-${Date.now()}`,
      company: newCompany.trim(),
      role: newRole.trim(),
      job_family: newJobFamily,
      date_applied: newDateApplied || new Date().toISOString().split('T')[0],
      source: newSource,
      status: newStatus,
      is_synthetic: false, // Visibly distinguishes actual candidate records
      location: newLocation.trim() || 'Remote',
      salary_range: newSalary.trim() || 'Competitive',
      notes: newNotes.trim() || 'Tracked in Pivot Pilot career pipeline.',
      match_score: 84,
      key_requirements_met: ['Career pivot alignment', 'Demonstrated core skills'],
      missing_requirements: []
    };

    onUpdateApplications([newApp, ...applications]);
    setShowAddForm(false);
    setNewCompany('');
    setNewRole('');
    setNewNotes('');
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    const cfg = statusOptions.find((s) => s.value === status) || statusOptions[0];
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider ${cfg.bg} ${cfg.color} ${cfg.border}`}>
        {cfg.label}
      </span>
    );
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Top Banner & Context */}
      <div className="p-6 md:p-8 rounded-3xl bg-slate-900 border border-violet-500/30 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 text-xs font-semibold mb-2">
            <TrendingUp className="w-3.5 h-3.5 text-violet-400" />
            <span>Career Pivot Pipeline & Conversion Tracker</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Job Applications & Pipeline Analytics
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Organize target applications across job families, monitor interview conversions, and generate tailored 30-second elevator pitches for hiring managers.
          </p>
        </div>

        <div className="flex items-center space-x-3 self-start md:self-auto">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white flex items-center space-x-2 shadow-lg shadow-violet-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{showAddForm ? 'Close Form' : 'Track Application'}</span>
          </button>
          <button
            onClick={handleResetToSample}
            className="px-3 py-2.5 rounded-xl text-xs font-semibold bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 flex items-center space-x-1.5 transition-all"
            title="Reset to the 6 sample synthetic applications"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset Samples</span>
          </button>
        </div>
      </div>

      {/* Prominent Mandatory Disclaimer Regarding Synthetic Demo Baseline */}
      <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex items-start space-x-3 text-xs text-amber-200/90 leading-relaxed">
        <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-amber-300 mr-1.5">[Synthetic Demo Baseline]:</span>
          Preloaded sample records are visibly labeled with synthetic badges. They are illustrative examples configured to demonstrate stage conversion tracking and do not represent real employer job applications, actual hiring decisions, or statistically predictive outcomes for any candidate. Any new applications you create or statuses you modify are persisted privately in your browser local storage.
        </div>
      </div>

      {/* Analytics Section: Core Metrics & Job Family Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        
        {/* Core Metric 1: Total Applications */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Total Tracked</span>
            <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-white font-mono">{totalApps}</div>
            <div className="text-[11px] text-slate-400 mt-1">Applications in career pivot pipeline</div>
          </div>
        </div>

        {/* Core Metric 2: Employer Responses */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Responses</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-blue-400 font-mono">{responsesCount}</div>
            <div className="text-[11px] text-slate-400 mt-1">Moved past initial applied stage</div>
          </div>
        </div>

        {/* Core Metric 3: Active Interviews & Offers */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Interviews & Offers</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-amber-400 font-mono">
              {interviewsCount}
              {offersCount > 0 && (
                <span className="text-xs font-semibold text-emerald-400 ml-2 font-sans">
                  ({offersCount} offer)
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Advanced to interview/decision stage</div>
          </div>
        </div>

        {/* Core Metric 4: Response Rate */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Response Rate</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-emerald-400 font-mono">{overallResponseRate}%</div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(overallResponseRate, 100)}%` }}
              />
            </div>
          </div>
        </div>

      </div>

      {/* Insights by Job Family Section (When data exist) */}
      {familyStats.length > 0 && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-violet-400" />
                Pipeline Conversion Insights by Job Family
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Breakdown of response velocity and interview traction across target role families.
              </p>
            </div>
            <div className="text-[11px] font-semibold text-slate-400 italic">
              *Sample analytics from current {totalApps} tracked records
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {familyStats.map((item) => (
              <div
                key={item.family}
                className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">{item.family}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-slate-800 text-slate-300">
                      {item.total} {item.total === 1 ? 'app' : 'apps'}
                    </span>
                  </div>

                  <div className="mt-2.5 flex items-center justify-between text-xs">
                    <span className="text-slate-400 text-[11px]">Response Rate:</span>
                    <span className="font-mono font-bold text-emerald-400">{item.responseRate}%</span>
                  </div>

                  <div className="w-full bg-slate-900 h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <div
                      className="bg-violet-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(item.responseRate, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-900 text-slate-400">
                  <span>Interviews: <strong className="text-amber-400">{item.interviews}</strong></span>
                  {item.offers > 0 && (
                    <span className="text-emerald-400 font-semibold">{item.offers} Offer</span>
                  )}
                  <span>Responses: <strong className="text-slate-200">{item.responses}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Control Bar: Filters, Search, Add */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Search & Job Family Filter */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search company, role, notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500 w-60"
            />
          </div>

          {/* Job Family Selector */}
          <select
            value={selectedFamily}
            onChange={(e) => setSelectedFamily(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-violet-500"
          >
            <option value="All">All Job Families</option>
            {jobFamilyOptions.map((fam) => (
              <option key={fam} value={fam}>{fam}</option>
            ))}
          </select>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center space-x-1 p-1 rounded-xl bg-slate-900 border border-slate-800 overflow-x-auto">
          <button
            onClick={() => setSelectedStatus('All')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              selectedStatus === 'All'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({applications.length})
          </button>
          {statusOptions.map((stg) => {
            const count = applications.filter((a) => a.status === stg.value).length;
            return (
              <button
                key={stg.value}
                onClick={() => setSelectedStatus(stg.value)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center space-x-1.5 ${
                  selectedStatus === stg.value
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>{stg.label}</span>
                <span className="text-[10px] opacity-75 font-mono">({count})</span>
              </button>
            );
          })}
        </div>

      </div>

      {/* Add New Opportunity Modal / Form */}
      {showAddForm && (
        <form
          onSubmit={handleAddApplication}
          className="p-6 rounded-2xl bg-slate-900 border border-violet-500/40 shadow-2xl space-y-4 text-xs animate-fadeIn"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-violet-400" />
              Track New Target Application
            </h3>
            <span className="text-[11px] text-emerald-400 font-semibold bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded-full">
              Custom Record (Saved to Local Storage)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Company Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. OpenAI, Cohere, Scale AI"
                value={newCompany}
                onChange={(e) => setNewCompany(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Job Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Generative AI Solutions Engineer"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Job Family *</label>
              <select
                value={newJobFamily}
                onChange={(e) => setNewJobFamily(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-violet-500"
              >
                {jobFamilyOptions.map((fam) => (
                  <option key={fam} value={fam}>{fam}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Application Date</label>
              <input
                type="date"
                required
                value={newDateApplied}
                onChange={(e) => setNewDateApplied(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Application Source</label>
              <select
                value={newSource}
                onChange={(e) => setNewSource(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-violet-500"
              >
                {sourceOptions.map((src) => (
                  <option key={src} value={src}>{src}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Application Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as ApplicationStatus)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-violet-500"
              >
                {statusOptions.map((stg) => (
                  <option key={stg.value} value={stg.value}>{stg.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Salary Range</label>
              <input
                type="text"
                value={newSalary}
                onChange={(e) => setNewSalary(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Prep Notes & Next Round Details</label>
            <input
              type="text"
              placeholder="e.g. Recruiter screen went well; next round covers hybrid retrieval with LangGraph."
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-violet-500"
            />
          </div>

          <div className="pt-2 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold shadow-md shadow-violet-600/30"
            >
              Save Application
            </button>
          </div>
        </form>
      )}

      {/* Applications Cards Grid */}
      <div className="space-y-4">
        {filteredApps.length === 0 ? (
          <div className="p-12 text-center bg-slate-900 rounded-2xl border border-slate-800 text-slate-400 space-y-2">
            <Briefcase className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="font-semibold text-slate-300">No applications match your selected filters.</p>
            <p className="text-xs text-slate-500">Try clearing filters or click "Track Application" to record a new submission.</p>
          </div>
        ) : (
          filteredApps.map((app) => (
            <div
              key={app.id}
              className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-violet-500/40 transition-all duration-200 shadow-xl space-y-4"
            >
              {/* Header row: Company, Role, Synthetic vs User badge, Status picker */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-lg font-bold text-white tracking-tight">{app.company}</span>
                    
                    {/* Visual Synthetic vs User Data Marker */}
                    {app.is_synthetic ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-950/40 text-amber-300 border border-amber-500/30">
                        Synthetic Demo Data
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950/40 text-emerald-300 border border-emerald-500/30">
                        Custom User Record
                      </span>
                    )}

                    {app.match_score && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-mono font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30">
                        {app.match_score}% Target Match
                      </span>
                    )}
                  </div>
                  
                  <div className="text-xs font-semibold text-slate-300 flex items-center space-x-2">
                    <span>{app.role}</span>
                    <span className="text-slate-500">·</span>
                    <span className="text-violet-400 font-medium">{app.job_family}</span>
                  </div>
                </div>

                {/* Status Selector & AI Pitch Button */}
                <div className="flex items-center space-x-2.5 self-start sm:self-auto">
                  
                  {/* Status Dropdown */}
                  <div className="flex items-center space-x-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-400 hidden md:inline">Status:</label>
                    <select
                      value={app.status}
                      onChange={(e) => handleStatusChange(app.id, e.target.value as ApplicationStatus)}
                      className="bg-slate-950 border border-slate-700 hover:border-violet-500 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-200 focus:outline-none focus:border-violet-500 transition-all cursor-pointer"
                    >
                      {statusOptions.map((stg) => (
                        <option key={stg.value} value={stg.value}>{stg.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Personalized Career Pitch Trigger */}
                  <button
                    onClick={() => onSelectApplicationForPitch(app)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-violet-950/60 hover:bg-violet-900/60 text-violet-300 border border-violet-800/60 flex items-center space-x-1.5 transition-all"
                    title="Generate personalized career pitch and cover note using deterministic template synthesis"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                    <span>Generate Career Pitch</span>
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteApplication(app.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-all"
                    title="Remove application record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Meta row: Job Family, Application Date, Source, Location, Salary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-400">
                <div className="flex items-center space-x-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                  <span className="truncate">Family: <strong className="text-slate-200">{app.job_family}</strong></span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>Applied: <strong className="text-slate-200">{app.date_applied}</strong></span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Share2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Source: <strong className="text-slate-200">{app.source}</strong></span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Comp: <strong className="text-slate-200">{app.salary_range || 'Competitive'}</strong></span>
                </div>
              </div>

              {/* Notes & Context */}
              {app.notes && (
                <div className="text-xs text-slate-400 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60">
                  <span className="text-slate-500 font-semibold mr-1.5">Interview / Pipeline Note:</span>
                  <span className="text-slate-300">{app.notes}</span>
                </div>
              )}

              {/* Requirements & Target Strengths */}
              {app.key_requirements_met && app.key_requirements_met.length > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-bold text-slate-400">Demonstrated Strengths:</span>
                    {app.key_requirements_met.map((req, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] bg-emerald-950/40 text-emerald-300 border border-emerald-500/30"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{req}</span>
                      </span>
                    ))}
                  </div>

                  {app.missing_requirements && app.missing_requirements.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-bold text-amber-400">Focus Prep:</span>
                      {app.missing_requirements.map((miss, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded text-[10px] bg-amber-950/30 text-amber-300 border border-amber-500/30"
                        >
                          {miss}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          ))
        )}
      </div>

    </div>
  );
};
