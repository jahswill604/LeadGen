import React, { useState, useCallback } from 'react';
import { Command } from 'lucide-react';
import ProcessingView from './components/ProcessingView';
import { generateLeads, enrichCompanyData } from './services/leadGenService';
import { SearchParams, Lead, LogEntry, AppState } from './types';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('idle');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [targetCount, setTargetCount] = useState(0);
  const [error, setError] = useState<string | undefined>(undefined);
  // Store the last search params to access the product context during enrichment
  const [lastSearchParams, setLastSearchParams] = useState<SearchParams | null>(null);

  const addLog = useCallback((message: string, type: LogEntry['type'] = 'info') => {
    setLogs(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      message,
      type
    }]);
  }, []);

  const handleStartSearch = async (params: SearchParams) => {
    setAppState('processing');
    setTargetCount(params.count);
    setLeads([]);
    setLogs([]);
    setError(undefined);
    setLastSearchParams(params);

    try {
      // 1. Initialization
      addLog(`Initializing Genkit pipeline for project 'lead-gen-v1'...`, 'info');
      await new Promise(r => setTimeout(r, 800));
      addLog(`Loading search configuration for niche: "${params.niche}" in "${params.location}"`, 'info');
      
      if (params.searchType === 'b2b' && params.productContext) {
        addLog(`Contextualizing for product: "${params.productContext}"`, 'info');
      } else if (params.targetRole) {
         addLog(`Targeting decision maker role: "${params.targetRole}"`, 'info');
      }
      
      if (params.keywords) {
         addLog(`Applying specific criteria: "${params.keywords}"`, 'info');
      }

      await new Promise(r => setTimeout(r, 800));
      
      // 2. Discovery Phase
      addLog(`Executing 'companyDiscovery' flow...`, 'info');
      addLog(`Generating search queries via Gemini 3.0 Pro...`, 'info');
      await new Promise(r => setTimeout(r, 1000));
      addLog(`Querying SERP API and LinkedIn Index...`, 'info');
      
      // Call our service (which uses Gemini)
      const generatedLeads = await generateLeads(params, process.env.API_KEY || '');
      
      addLog(`Found ${generatedLeads.length} potential candidates. Starting preliminary enrichment...`, 'success');

      // 3. Preliminary Enrichment Phase (Simulation for UI effect + actual basic extraction)
      for (let i = 0; i < generatedLeads.length; i++) {
        const lead = generatedLeads[i];
        
        // Simulating different processing steps for each lead for the UI effect
        addLog(`[${lead.companyName}] Fetching website metadata from ${lead.websiteUrl}...`, 'info');
        await new Promise(r => setTimeout(r, 300 + Math.random() * 400));
        
        // Add the lead to state
        setLeads(prev => [...prev, lead]);
        addLog(`[${lead.companyName}] Contact identified.`, 'success');
      }

      addLog(`Pipeline completed successfully. ${generatedLeads.length} leads exported to memory.`, 'success');
      setAppState('completed');

    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred during the pipeline execution.");
      addLog(`Pipeline crashed: ${err.message}`, 'error');
      setAppState('idle'); 
    }
  };

  const handleEnrich = async (leadId: string) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;

    if (lead.enrichedData) {
        addLog(`[${lead.companyName}] Data is already enriched.`, 'warning');
        return;
    }

    // Set status to enriching immediately for UI feedback
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: 'enriching' } : l));

    addLog(`Initiating Deep Enrichment Protocol for ${lead.companyName}...`, 'info');
    
    // Simulate initial latency for "scraping"
    setTimeout(async () => {
        addLog(`[${lead.companyName}] Scraping website content and analyzing business model...`, 'info');
        
        try {
            const enrichedData = await enrichCompanyData(
                lead, 
                lastSearchParams?.productContext, // Pass the user's selling context
                process.env.API_KEY || ''
            );

            if (enrichedData) {
                setLeads(prev => prev.map(l => {
                    if (l.id === leadId) {
                        return { ...l, enrichedData, status: 'complete' };
                    }
                    return l;
                }));
                addLog(`[${lead.companyName}] Strategic analysis complete. Pitch generated.`, 'success');
            } else {
                setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: 'complete' } : l));
                addLog(`[${lead.companyName}] Failed to generate deep insights.`, 'error');
            }
        } catch (e) {
             setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: 'failed' } : l));
             addLog(`[${lead.companyName}] Enrichment error: ${e}`, 'error');
        }
    }, 500);
  };

  const handleReset = () => {
    setAppState('idle');
    setLeads([]);
    setLogs([]);
    setLastSearchParams(null);
  };

  return (
    <div className="h-full bg-slate-50 text-slate-900 font-sans flex flex-col relative overflow-hidden">
      
      {/* API Key Check Overlay */}
      {!process.env.API_KEY && (
        <div className="absolute inset-0 z-[60] bg-white/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-2xl border border-red-100 max-w-lg text-center ring-1 ring-slate-100">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Command className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">API Key Missing</h2>
              <p className="text-slate-500 mb-6 leading-relaxed">
                This application requires a Google Gemini API key to function. 
                The key is injected via <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">process.env.API_KEY</code>.
              </p>
              <div className="bg-slate-50 text-slate-600 px-4 py-3 rounded-lg text-xs font-mono border border-slate-200">
                  Error: E_MISSING_ENV_VAR
              </div>
            </div>
        </div>
      )}

      {/* Main Dashboard View */}
      <ProcessingView 
        leads={leads}
        logs={logs}
        totalTarget={targetCount}
        isComplete={appState === 'completed'}
        isLoading={appState === 'processing'}
        onSearch={handleStartSearch}
        onReset={handleReset}
        onEnrich={handleEnrich}
        error={error}
      />
    </div>
  );
};

export default App;