import React, { useState } from 'react';
import { 
  ExternalLink, Mail, User, Globe, 
  ChevronDown, Building2, MapPin, MessageCircle, 
  Send, Sparkles, Facebook, Linkedin, Instagram, Twitter, 
  Lightbulb, Zap, Target, Layers
} from 'lucide-react';
import { Lead } from '../types';

interface ResultsTableProps {
  leads: Lead[];
  onEnrich?: (leadId: string) => void;
}

const ResultsTable: React.FC<ResultsTableProps> = ({ leads, onEnrich }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 bg-slate-50/50">
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-slate-100">
          <div className="relative">
            <User className="w-8 h-8 text-slate-300" />
            <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-slate-300 rounded-full border-2 border-white"></div>
          </div>
        </div>
        <p className="text-sm font-medium text-slate-500">Initializing data extraction...</p>
      </div>
    );
  }

  // Determine mode based on first lead (batch is homogenous)
  const isB2C = leads[0]?.leadType === 'b2c';

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50">
      <div className="min-w-full">
         <div className="flex flex-col">
            {leads.map((lead, index) => {
               const isExpanded = expandedId === lead.id;
               
               return (
                  <div key={lead.id} className="bg-white border-b border-slate-100 last:border-0 transition-all duration-200">
                     {/* Summary Row (Clickable) */}
                     <div 
                       onClick={() => toggleExpand(lead.id)}
                       className={`
                          flex items-center justify-between p-5 cursor-pointer transition-colors select-none
                          ${isExpanded ? 'bg-brand-50/40' : 'hover:bg-slate-50'}
                       `}
                     >
                        {/* Basic Info to Identify */}
                        <div className="flex items-center gap-5">
                           <span className="text-slate-300 font-mono text-xs w-6">#{index + 1}</span>
                           <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-slate-500 transition-colors ${isExpanded ? 'bg-white shadow-sm text-brand-600' : 'bg-slate-100'}`}>
                                 {isB2C ? <MessageCircle className="w-6 h-6" /> : <Building2 className="w-6 h-6" />}
                              </div>
                              <div className="max-w-[200px] md:max-w-md">
                                 <h4 className={`font-bold text-sm transition-colors truncate ${isExpanded ? 'text-brand-700' : 'text-slate-900'}`}>
                                    {lead.companyName}
                                 </h4>
                                 <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                    {isB2C ? (
                                        <>
                                            <span className="flex items-center gap-1 font-medium text-slate-600">
                                              {lead.decisionMakers[0]?.name || 'Anonymous User'}
                                            </span>
                                            <span>•</span>
                                            <span className="truncate max-w-[150px]">{lead.summary.substring(0, 40)}...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> {new URL(lead.websiteUrl).hostname.replace('www.','')}</span>
                                            <span>•</span>
                                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {lead.country}</span>
                                        </>
                                    )}
                                 </div>
                              </div>
                           </div>
                        </div>
                        
                        <div className="flex items-center gap-8">
                           {/* Quality/Sentiment Score */}
                           <div className="flex flex-col items-end mr-4">
                              <span className={`text-sm font-bold ${lead.qualityScore > 75 ? 'text-emerald-600' : lead.qualityScore > 50 ? 'text-amber-600' : 'text-slate-500'}`}>
                                {isB2C ? 'High Intent' : `${lead.qualityScore}% Match`}
                              </span>
                              <div className="w-16 h-1 rounded-full bg-slate-100 mt-1 overflow-hidden">
                                <div className={`h-full rounded-full ${lead.qualityScore > 75 ? 'bg-emerald-500' : lead.qualityScore > 50 ? 'bg-amber-500' : 'bg-slate-400'}`} style={{width: `${lead.qualityScore}%`}}></div>
                              </div>
                           </div>
                           
                           <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                             <ChevronDown className={`w-5 h-5 ${isExpanded ? 'text-brand-600' : 'text-slate-300'}`} />
                           </div>
                        </div>
                     </div>

                     {/* Expanded Dropdown Content */}
                     {isExpanded && (
                        <div className="px-5 pb-6 sm:pl-[5.5rem] animate-in slide-in-from-top-1 fade-in duration-200">
                           <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6 ring-4 ring-slate-50">
                              
                              {/* Action Bar */}
                              {!lead.enrichedData && (
                                <div className="flex justify-end mb-2">
                                  <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEnrich?.(lead.id);
                                    }}
                                    disabled={lead.status === 'enriching'}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm border group
                                        ${lead.status === 'enriching' 
                                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200' 
                                            : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-100'
                                        }
                                    `}
                                  >
                                    {lead.status === 'enriching' ? (
                                        <>
                                            <div className="w-3.5 h-3.5 border-2 border-slate-400/30 border-t-slate-500 rounded-full animate-spin" />
                                            <span>Enriching...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-3.5 h-3.5 group-hover:text-indigo-600" />
                                            <span>Enrich Data & Generate Pitch</span>
                                        </>
                                    )}
                                  </button>
                                </div>
                              )}

                              {isB2C ? (
                                // --- B2C EXPANDED VIEW ---
                                <>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-slate-100">
                                      <div>
                                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Discussion Platform</label>
                                          <div className="text-xl font-bold text-slate-900">{lead.companyName}</div>
                                      </div>
                                      <div>
                                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Source Link</label>
                                          <a href={lead.websiteUrl} target="_blank" rel="noreferrer" className="text-pink-600 hover:text-pink-700 hover:underline flex items-center gap-2 font-medium text-lg w-fit">
                                            View Original Post <ExternalLink className="w-4 h-4" />
                                          </a>
                                      </div>
                                  </div>
                                  <div>
                                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Post Content / Context</label>
                                      <div className="text-sm text-slate-800 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100 relative">
                                        <span className="absolute top-2 left-2 text-3xl text-slate-200 font-serif leading-none">“</span>
                                        <p className="relative z-10 px-2">{lead.summary}</p>
                                      </div>
                                  </div>
                                  <div>
                                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">Actionable Lead Contact</label>
                                      <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200">
                                          <div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center text-pink-600 font-bold">
                                              <User className="w-5 h-5" />
                                          </div>
                                          <div>
                                              <div className="font-bold text-slate-900">{lead.decisionMakers[0]?.name || 'Anonymous'}</div>
                                              <div className="text-xs text-slate-500 mb-1">
                                                  Posted: <span className="font-medium">{lead.size || 'Recently'}</span>
                                              </div>
                                              {lead.decisionMakers[0]?.email && (
                                                <a href={lead.decisionMakers[0].email} target="_blank" rel="noreferrer" className="mt-1 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm hover:shadow flex items-center gap-1.5 w-fit">
                                                    <Send className="w-3 h-3" />
                                                    Inbox / Message User
                                                </a>
                                              )}
                                          </div>
                                      </div>
                                  </div>
                                </>
                              ) : (
                                // --- B2B EXPANDED VIEW ---
                                <>
                                  {/* Basic Info */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-slate-100">
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Company Name</label>
                                        <div className="text-xl font-bold text-slate-900">{lead.companyName}</div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Website</label>
                                        <a href={lead.websiteUrl} target="_blank" rel="noreferrer" className="text-brand-600 hover:text-brand-700 hover:underline flex items-center gap-2 font-medium text-lg w-fit">
                                          {lead.websiteUrl} <ExternalLink className="w-4 h-4" />
                                        </a>
                                    </div>
                                  </div>

                                  {/* Deep Enrichment Data (If Available) */}
                                  {lead.enrichedData && (
                                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-6">
                                       
                                       {/* Insights Grid */}
                                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100">
                                              <div className="flex items-center gap-2 mb-3 text-amber-800 font-bold text-xs uppercase tracking-wide">
                                                  <Lightbulb className="w-4 h-4" /> Key Insights
                                              </div>
                                              <ul className="list-disc list-outside ml-4 space-y-1.5">
                                                  {lead.enrichedData.keyInsights.map((insight, i) => (
                                                      <li key={i} className="text-xs text-slate-700">{insight}</li>
                                                  ))}
                                              </ul>
                                          </div>
                                          
                                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                               <div className="flex items-center gap-2 mb-3 text-slate-600 font-bold text-xs uppercase tracking-wide">
                                                  <Layers className="w-4 h-4" /> Products & Tech
                                              </div>
                                              <div className="space-y-3">
                                                 <div>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Offerings</span>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {lead.enrichedData.productsServices.slice(0,5).map((p, i) => (
                                                            <span key={i} className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] text-slate-600">{p}</span>
                                                        ))}
                                                    </div>
                                                 </div>
                                                 <div>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Tech Stack</span>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {lead.enrichedData.technologies.slice(0,5).map((t, i) => (
                                                            <span key={i} className="px-2 py-0.5 bg-slate-200 rounded text-[10px] text-slate-700 font-medium">{t}</span>
                                                        ))}
                                                    </div>
                                                 </div>
                                              </div>
                                          </div>
                                       </div>

                                       {/* Strategic Fit */}
                                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                           <div>
                                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Competitive Advantage</label>
                                              <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                                                  {lead.enrichedData.competitiveAdvantage}
                                              </p>
                                           </div>
                                            <div>
                                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Target Market</label>
                                              <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                                                  {lead.enrichedData.targetMarket}
                                              </p>
                                           </div>
                                       </div>

                                       {/* Sales Intelligence - PITCH & EMAIL */}
                                       <div className="bg-gradient-to-br from-indigo-50 to-white p-5 rounded-xl border border-indigo-100 shadow-sm relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-3 opacity-10">
                                                <Zap className="w-24 h-24 text-indigo-600" />
                                            </div>
                                            
                                            <div className="relative z-10">
                                                <h5 className="font-bold text-indigo-900 text-sm flex items-center gap-2 mb-4">
                                                    <Target className="w-4 h-4 text-indigo-600" /> Sales Intelligence
                                                </h5>

                                                <div className="space-y-4">
                                                    <div>
                                                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block mb-1">Pitch Strategy</span>
                                                        <p className="text-sm text-slate-800 leading-relaxed font-medium">
                                                            {lead.enrichedData.pitchStrategy}
                                                        </p>
                                                    </div>

                                                    <div className="pt-4 border-t border-indigo-100">
                                                         <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block mb-2">Personalized Outreach Draft</span>
                                                         <div className="bg-white p-4 rounded-lg border border-indigo-100 text-sm text-slate-600 font-mono whitespace-pre-wrap shadow-sm">
                                                            {lead.enrichedData.outreachEmail}
                                                         </div>
                                                    </div>
                                                </div>
                                            </div>
                                       </div>
                                    </div>
                                  )}

                                  {/* Contact Info (Always Visible) */}
                                  <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">Decision Makers & Contacts</label>
                                    
                                    {/* Enriched Socials in Contact List */}
                                    <div className="mb-4">
                                       <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                              <Mail className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-sm text-slate-900 font-medium select-all">{lead.generalEmail || 'Not listed publicly'}</div>
                                                {/* Social Icons Row */}
                                                {lead.enrichedData?.socialLinks && (
                                                    <div className="flex items-center gap-2 mt-1.5">
                                                        {lead.enrichedData.socialLinks.twitter && (
                                                            <a href={lead.enrichedData.socialLinks.twitter} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-slate-900 transition-colors"><Twitter className="w-3.5 h-3.5" /></a>
                                                        )}
                                                        {lead.enrichedData.socialLinks.linkedin && (
                                                            <a href={lead.enrichedData.socialLinks.linkedin} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-blue-700 transition-colors"><Linkedin className="w-3.5 h-3.5" /></a>
                                                        )}
                                                        {lead.enrichedData.socialLinks.facebook && (
                                                            <a href={lead.enrichedData.socialLinks.facebook} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-blue-600 transition-colors"><Facebook className="w-3.5 h-3.5" /></a>
                                                        )}
                                                        {lead.enrichedData.socialLinks.instagram && (
                                                            <a href={lead.enrichedData.socialLinks.instagram} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-pink-600 transition-colors"><Instagram className="w-3.5 h-3.5" /></a>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                       </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {lead.decisionMakers.map((dm, i) => (
                                          <div key={i} className="flex items-start gap-4 bg-white p-4 rounded-xl border border-slate-200 hover:border-brand-200 hover:shadow-sm transition-all group">
                                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-500 font-bold text-sm shadow-inner group-hover:from-brand-50 group-hover:to-brand-100 group-hover:text-brand-600 transition-colors">
                                                {dm.name ? dm.name.substring(0,2).toUpperCase() : '??'}
                                              </div>
                                              <div className="flex-1 min-w-0">
                                                <div className="font-bold text-slate-900 truncate">{dm.name}</div>
                                                <div className="text-xs text-brand-600 font-medium mb-2">{dm.title}</div>
                                                {dm.email ? (
                                                    <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-md border border-slate-100 group-hover:bg-brand-50/50 group-hover:border-brand-100/50 transition-colors">
                                                      <Mail className="w-3 h-3 text-slate-400" />
                                                      <span className="select-all truncate">{dm.email}</span>
                                                    </div>
                                                ) : (
                                                    <div className="text-xs text-slate-400 italic">Email not verified</div>
                                                )}
                                              </div>
                                          </div>
                                        ))}
                                    </div>
                                  </div>
                                </>
                              )}

                           </div>
                        </div>
                     )}
                  </div>
               );
            })}
         </div>
      </div>
    </div>
  );
};

export default ResultsTable;