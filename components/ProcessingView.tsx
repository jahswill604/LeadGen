import React, { useEffect, useState, useRef } from 'react';
import { 
  CheckCircle2, AlertCircle, Database, Server, 
  RotateCcw, Download, Clock, BarChart3, 
  LayoutDashboard, ScrollText, Activity, ChevronRight, PlusCircle, Settings2,
  MessageSquare, Menu, X
} from 'lucide-react';
import { Lead, LogEntry, SearchParams } from '../types';
import { exportToCSV } from '../utils/exportUtils';
import ResultsTable from './ResultsTable';
import LeadForm from './LeadForm';
import ChatView from './ChatView';

interface ProcessingViewProps {
  leads: Lead[];
  logs: LogEntry[];
  totalTarget: number;
  isComplete: boolean;
  isLoading: boolean;
  onSearch: (params: SearchParams) => void;
  onReset: () => void;
  onEnrich?: (leadId: string) => void;
  error?: string;
}

const ProcessingView: React.FC<ProcessingViewProps> = ({ 
  leads, 
  logs, 
  totalTarget, 
  isComplete,
  isLoading,
  onSearch,
  onReset,
  onEnrich,
  error
}) => {
  const [activeView, setActiveView] = useState<'config' | 'overview' | 'data' | 'logs' | 'chat'>('config');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll logs when in logs view
  useEffect(() => {
    if (scrollRef.current && activeView === 'logs') {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, activeView]);

  // Automatically switch to overview when processing starts
  useEffect(() => {
    if (isLoading && activeView === 'config') {
      setActiveView('overview');
    }
  }, [isLoading]);

  // Close mobile menu when view changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [activeView]);

  const progress = totalTarget > 0 ? Math.min(100, Math.round((leads.length / totalTarget) * 100)) : 0;
  const emailsFound = leads.filter(l => l.decisionMakers.some(dm => dm.email) || l.generalEmail).length;
  const successRate = leads.length > 0 ? Math.round((emailsFound / leads.length) * 100) : 0;

  return (
    <div className="flex h-full bg-slate-50/50 overflow-hidden relative">
      
      {/* MOBILE OVERLAY */}
      {isMobileMenuOpen && (
        <div 
          className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR NAVIGATION */}
      <div className={`
        fixed lg:relative inset-y-0 left-0 z-40 w-72 bg-white border-r border-slate-200 flex flex-col shadow-2xl lg:shadow-none transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
         {/* Sidebar Header */}
         <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center shadow-lg shadow-brand-500/30">
                  <Activity className="w-5 h-5" />
               </div>
               <div>
                  <div className="font-bold text-slate-900 text-sm">Lead Gen Kit</div>
                  <div className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                    {isLoading ? (
                      <span className="text-amber-500">Processing...</span>
                    ) : (
                      <span className="text-slate-400">Idle</span>
                    )}
                  </div>
               </div>
            </div>
            {/* Mobile Close Button */}
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
         </div>

         {/* Nav Links */}
         <nav className="flex-1 px-4 space-y-6 overflow-y-auto custom-scrollbar py-2">
            <div>
              <NavItem 
                 active={activeView === 'config'} 
                 onClick={() => setActiveView('config')} 
                 icon={<PlusCircle className="w-4 h-4" />} 
                 label="New Discovery" 
                 highlight
              />
            </div>

            <div>
              <div className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Current Campaign
              </div>
              <div className="space-y-1">
                <NavItem 
                   active={activeView === 'overview'} 
                   onClick={() => setActiveView('overview')} 
                   icon={<LayoutDashboard className="w-4 h-4" />} 
                   label="Dashboard Overview" 
                />
                <NavItem 
                   active={activeView === 'data'} 
                   onClick={() => setActiveView('data')} 
                   icon={<Database className="w-4 h-4" />} 
                   label="Live Data Sheet" 
                   badge={leads.length}
                />
                <NavItem 
                   active={activeView === 'logs'} 
                   onClick={() => setActiveView('logs')} 
                   icon={<ScrollText className="w-4 h-4" />} 
                   label="System Logs" 
                />
              </div>
            </div>

            <div>
              <div className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Assistant
              </div>
              <NavItem 
                 active={activeView === 'chat'} 
                 onClick={() => setActiveView('chat')} 
                 icon={<MessageSquare className="w-4 h-4" />} 
                 label="AI Agent Chat" 
              />
            </div>
         </nav>

         {/* Sidebar Footer / Status */}
         <div className="p-4 border-t border-slate-100 bg-slate-50/30">
            <div className="flex items-center gap-3 mb-2">
               {isComplete ? (
                   <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
               ) : error ? (
                   <div className="w-2 h-2 rounded-full bg-red-500" />
               ) : isLoading ? (
                   <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
               ) : (
                   <div className="w-2 h-2 rounded-full bg-slate-300" />
               )}
               <span className="text-xs font-semibold text-slate-700">
                  {isComplete ? 'Completed' : error ? 'Failed' : isLoading ? 'Filling sheet...' : 'Ready'}
               </span>
            </div>
            
            {/* Mini Progress */}
            {isLoading || isComplete ? (
              <>
                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                   <div 
                      className={`h-full transition-all duration-500 ${isComplete ? 'bg-green-500' : error ? 'bg-red-500' : 'bg-brand-500'}`} 
                      style={{width: `${progress}%`}} 
                   />
                </div>
                <div className="flex justify-between mt-1 text-[10px] text-slate-400 font-medium">
                   <span>{leads.length} leads</span>
                   <span>{Math.round(progress)}%</span>
                </div>
              </>
            ) : (
              <div className="text-[10px] text-slate-400">Waiting to start...</div>
            )}
         </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col w-full overflow-hidden bg-slate-50/50">
         {/* Context Header */}
         <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-8 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
               {/* Mobile Hamburger */}
               <button 
                 onClick={() => setIsMobileMenuOpen(true)}
                 className="lg:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg"
               >
                 <Menu className="w-5 h-5" />
               </button>

               <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <span className="hidden md:inline hover:text-slate-700 cursor-pointer">Workspace</span>
                  <ChevronRight className="hidden md:inline w-4 h-4 text-slate-300" />
                  <span className="font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-xs truncate max-w-[150px] md:max-w-none">
                     {activeView === 'config' && 'New Discovery Campaign'}
                     {activeView === 'overview' && 'Dashboard Overview'}
                     {activeView === 'data' && 'Live Data Sheet'}
                     {activeView === 'logs' && 'System Events'}
                     {activeView === 'chat' && 'AI Assistant'}
                  </span>
               </div>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
               {isComplete && (
                 <>
                   <button 
                     onClick={onReset}
                     className="px-2 md:px-3 py-1.5 text-slate-600 bg-white border border-slate-300 hover:border-slate-400 hover:bg-slate-50 rounded-lg shadow-sm font-medium flex items-center gap-2 text-xs transition-all"
                   >
                     <RotateCcw className="w-3.5 h-3.5" />
                     <span className="hidden md:inline">Reset</span>
                   </button>
                   <button 
                     onClick={() => exportToCSV(leads)}
                     className="px-2 md:px-3 py-1.5 text-white bg-green-600 hover:bg-green-700 border border-transparent rounded-lg shadow-sm font-medium flex items-center gap-2 text-xs transition-all"
                   >
                     <Download className="w-3.5 h-3.5" />
                     <span className="hidden md:inline">Export CSV</span>
                   </button>
                 </>
               )}
            </div>
         </header>

         {/* Scrollable View Content */}
         <div className="flex-1 overflow-hidden relative p-4 md:p-6">
            
            {/* ERROR OVERLAY */}
            {error && (
               <div className="absolute inset-0 z-50 bg-white/60 backdrop-blur-sm flex items-center justify-center p-4">
                 <div className="bg-white border border-red-100 shadow-2xl rounded-2xl p-6 md:p-8 max-w-md text-center ring-1 ring-slate-200">
                    <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <AlertCircle className="w-6 h-6 text-red-500" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">Pipeline Error</h3>
                    <p className="text-slate-500 text-sm mb-6">{error}</p>
                    <button onClick={onReset} className="w-full px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 text-sm font-bold">
                      Reset System
                    </button>
                 </div>
               </div>
            )}
            
            {activeView === 'config' && (
              <div className="h-full overflow-y-auto custom-scrollbar flex flex-col items-center">
                 <div className="w-full max-w-5xl pt-2 md:pt-6">
                    <LeadForm onSubmit={onSearch} isLoading={isLoading} />
                 </div>
              </div>
            )}

            {activeView === 'chat' && (
               <div className="h-full max-w-4xl mx-auto pt-2 md:pt-4">
                  <ChatView />
               </div>
            )}

            {activeView === 'overview' && (
                <div className="h-full overflow-y-auto custom-scrollbar pr-2 space-y-6">
                    {/* Header */}
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">Campaign Performance</h3>
                        <p className="text-slate-500 text-sm">Real-time metrics and pipeline progress.</p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                       <StatCard 
                          label="Total Leads" 
                          value={leads.length.toString()} 
                          subValue={`Target: ${totalTarget}`}
                          icon={<Database className="w-4 h-4 text-brand-600" />}
                          color="brand"
                        />
                        <StatCard 
                          label="Enrichment" 
                          value={`${successRate}%`} 
                          subValue="Contact Found"
                          icon={<BarChart3 className="w-4 h-4 text-emerald-600" />}
                          color="emerald"
                        />
                         <StatCard 
                          label="Sources" 
                          value={(leads.length * 12).toString()} 
                          subValue="Scanned"
                          icon={<Server className="w-4 h-4 text-amber-600" />}
                          color="amber"
                        />
                        <StatCard 
                          label="Time" 
                          value={isComplete ? 'Done' : isLoading ? `${Math.max(0, (totalTarget - leads.length) * 1.5).toFixed(0)}s` : '--'}
                          subValue="Estimated"
                          icon={<Clock className="w-4 h-4 text-slate-600" />}
                          color="slate"
                        />
                    </div>

                    {/* Progress Bar Large */}
                    <div className="bg-white p-4 md:p-6 rounded-xl border border-slate-200 shadow-sm">
                       <div className="flex justify-between items-center mb-4">
                          <h4 className="font-semibold text-slate-800 text-sm">Extraction Progress</h4>
                          <span className="text-xs font-bold bg-slate-100 px-2 py-1 rounded text-slate-600">{Math.round(progress)}% Complete</span>
                       </div>
                       <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 relative ${isComplete ? 'bg-green-500' : 'bg-brand-600'}`} 
                            style={{ width: `${progress}%` }}
                          >
                             {isLoading && !isComplete && (
                                <div className="absolute inset-0 bg-white/30 animate-[shimmer_2s_infinite] w-full h-full" style={{ backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 100%)', backgroundSize: '50% 100%', backgroundRepeat: 'no-repeat' }}></div>
                             )}
                          </div>
                       </div>
                    </div>

                    {/* Recent Logs Preview */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col flex-1 min-h-[300px]">
                        <div className="px-4 md:px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                           <h4 className="font-semibold text-slate-800 text-sm">Recent Activity</h4>
                           <button onClick={() => setActiveView('logs')} className="text-xs text-brand-600 font-medium hover:underline">View All</button>
                        </div>
                        <div className="p-4 space-y-2 bg-slate-50/50 flex-1 font-mono text-xs">
                           {logs.slice(-6).reverse().map((log) => (
                              <div key={log.id} className="flex gap-3 items-start opacity-80">
                                 <span className="text-slate-400 min-w-[70px]">{log.timestamp.toLocaleTimeString().split(' ')[0]}</span>
                                 <span className={log.type === 'error' ? 'text-red-600' : log.type === 'success' ? 'text-green-600' : 'text-slate-600'}>
                                   {log.message}
                                 </span>
                              </div>
                           ))}
                           {logs.length === 0 && <div className="text-slate-400 italic p-2">System initialized. Ready to start.</div>}
                        </div>
                    </div>
                </div>
            )}

            {activeView === 'data' && (
                <div className="h-full bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                   <div className="px-4 md:px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                       <h3 className="font-bold text-slate-700 text-sm">Extracted Companies</h3>
                       <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500">{leads.length} records</span>
                       </div>
                   </div>
                   <ResultsTable leads={leads} onEnrich={onEnrich} />
                </div>
            )}
            
            {activeView === 'logs' && (
                <div className="h-full bg-slate-900 rounded-xl border border-slate-800 shadow-sm overflow-hidden flex flex-col">
                   <div className="px-4 py-2 border-b border-slate-800 bg-slate-950 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20 border border-amber-500/50"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50"></div>
                      </div>
                      <span className="text-xs font-mono text-slate-500">term://genkit-pipeline-logs</span>
                   </div>
                   <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-1.5 font-mono text-xs custom-scrollbar">
                     {logs.map((log) => (
                       <div key={log.id} className="flex gap-4 items-start hover:bg-white/5 p-0.5 rounded px-2">
                         <span className="text-slate-500 min-w-[80px] select-none">
                           {log.timestamp.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' })}.{log.timestamp.getMilliseconds().toString().padStart(3, '0')}
                         </span>
                         <span className={`break-all ${
                            log.type === 'info' ? 'text-slate-300' :
                            log.type === 'success' ? 'text-green-400' :
                            log.type === 'warning' ? 'text-amber-400' :
                            'text-red-400 font-bold'
                         }`}>
                           {log.type === 'success' && '✓ '}
                           {log.type === 'error' && '✗ '}
                           {log.message}
                         </span>
                       </div>
                     ))}
                     {logs.length === 0 && (
                       <div className="text-slate-600 italic">Waiting for pipeline to start...</div>
                     )}
                   </div>
                </div>
            )}
         </div>
      </div>
    </div>
  );
};

// NavItem Component
const NavItem = ({ active, onClick, icon, label, badge, highlight }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string, badge?: number, highlight?: boolean }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
      active 
        ? 'bg-brand-50 text-brand-700 shadow-sm ring-1 ring-brand-100' 
        : highlight 
          ? 'bg-slate-900 text-white shadow-md hover:bg-slate-800' 
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
    }`}
  >
    <div className="flex items-center gap-3">
      <span className={`transition-colors ${active ? 'text-brand-600' : highlight ? 'text-slate-300' : 'text-slate-400 group-hover:text-slate-600'}`}>
        {icon}
      </span>
      {label}
    </div>
    {badge !== undefined && badge > 0 && (
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
        active ? 'bg-brand-100 text-brand-700' : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
      }`}>
        {badge}
      </span>
    )}
  </button>
);

const StatCard = ({ label, value, subValue, icon, color }: { label: string, value: string, subValue: string, icon: React.ReactNode, color: 'brand'|'emerald'|'amber'|'slate' }) => {
  const styles = {
    brand: { bg: 'bg-brand-50', border: 'border-brand-100', text: 'text-brand-900' },
    emerald: { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-900' },
    amber: { bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-900' },
    slate: { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-900' }
  };
  const s = styles[color];

  return (
    <div className={`p-4 rounded-xl border bg-white border-slate-100 shadow-sm transition-all hover:shadow-md`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
        <div className={`p-1.5 rounded-md ${s.bg} border ${s.border}`}>
          {icon}
        </div>
      </div>
      <div>
        <div className={`text-2xl font-bold ${s.text} tracking-tight`}>{value}</div>
        <div className="text-xs text-slate-400 font-medium mt-0.5">{subValue}</div>
      </div>
    </div>
  )
}

export default ProcessingView;