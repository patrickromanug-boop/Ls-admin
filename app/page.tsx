'use me';
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Briefcase, 
  Users, 
  FileText, 
  AlertTriangle, 
  Plus, 
  Search, 
  Bell, 
  LogOut, 
  CheckCircle, 
  Clock, 
  Send,
  Building2,
  MapPin,
  Tag,
  ShieldCheck
} from 'lucide-react';

interface Job {
  id: string;
  title: string;
  organization: string;
  purpose: string;
  requirements: string;
  deadline: string;
  status: string;
  created_at: string;
}

interface Application {
  id: string;
  job_id: string;
  user_id: string;
  status: string;
  applied_at: string;
}

interface Profile {
  id: string;
  full_name: string;
  phone: string;
  role: string;
  created_at: string;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'jobs' | 'applications' | 'users' | 'reports'>('jobs');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddJobModal, setShowAddJobModal] = useState(false);

  // New Job Form
  const [newJobTitle, setNewJobTitle] = useState('');
  const [newJobOrg, setNewJobOrg] = useState('');
  const [newJobPurpose, setNewJobPurpose] = useState('');
  const [newJobRequirements, setNewJobRequirements] = useState('');
  const [newJobDeadline, setNewJobDeadline] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const showNotification = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: jobsData } = await supabase.from('jobs').select('*').order('created_at', { ascending: false });
      if (jobsData) setJobs(jobsData);

      const { data: appsData } = await supabase.from('applications').select('*').order('applied_at', { ascending: false });
      if (appsData) setApplications(appsData);

      const { data: profilesData } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (profilesData) setProfiles(profilesData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJobTitle || !newJobOrg || !newJobDeadline) {
      alert('Please fill in required fields');
      return;
    }

    setSubmitting(true);
    try {
      // First get a default location and category ID from DB
      const { data: locations } = await supabase.from('locations').select('id').limit(1);
      const { data: categories } = await supabase.from('categories').select('id').limit(1);
      const { data: jobTypes } = await supabase.from('job_types').select('id').limit(1);

      const locationId = locations?.[0]?.id;
      const categoryId = categories?.[0]?.id;
      const jobTypeId = jobTypes?.[0]?.id;

      const { data, error } = await supabase.from('jobs').insert([
        {
          title: newJobTitle,
          organization: newJobOrg,
          purpose: newJobPurpose || 'Job opportunity published via Admin Portal',
          requirements: newJobRequirements || 'Minimum qualifications required.',
          deadline: newJobDeadline,
          status: 'active',
          location_id: locationId,
          category_id: categoryId,
          job_type_id: jobTypeId,
        }
      ]).select();

      if (error) {
        throw error;
      }

      showNotification('✅ New job posted successfully! Auto-push webhook triggered.');
      setShowAddJobModal(false);
      setNewJobTitle('');
      setNewJobOrg('');
      setNewJobPurpose('');
      setNewJobRequirements('');
      setNewJobDeadline('');
      fetchData();
    } catch (err: any) {
      alert('Error creating job: ' + (err.message || err));
    } finally {
      setSubmitting(false);
    }
  };

  const filteredJobs = jobs.filter(j => 
    j.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    j.organization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce">
          <Bell className="w-5 h-5" />
          <span className="font-medium text-sm">{toast}</span>
        </div>
      )}

      {/* Header Bar */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/20">
            LS
          </div>
          <div>
            <h1 className="text-lg font-bold text-white leading-none">LS Services Admin Portal</h1>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Admin Access • Uganda Operations
            </p>
          </div>
        </div>

        <button 
          onClick={() => setShowAddJobModal(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4" /> Post New Job
        </button>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">Total Active Jobs</p>
              <h3 className="text-2xl font-black text-white mt-1">{jobs.length}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Briefcase className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">Total Applications</p>
              <h3 className="text-2xl font-black text-white mt-1">{applications.length}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">Registered Candidates</p>
              <h3 className="text-2xl font-black text-white mt-1">{profiles.length}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">Webhook Status</p>
              <h3 className="text-sm font-bold text-emerald-400 mt-2 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-400" /> Active (Auto-Push)
              </h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Bell className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 gap-8">
          <button 
            onClick={() => setActiveTab('jobs')}
            className={`pb-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'jobs' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Briefcase className="w-4 h-4" /> Jobs ({jobs.length})
          </button>
          <button 
            onClick={() => setActiveTab('applications')}
            className={`pb-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'applications' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" /> Applications ({applications.length})
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`pb-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'users' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" /> Candidates ({profiles.length})
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search titles, organizations, candidates..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-700 text-white text-sm rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-blue-500 transition-all placeholder-slate-500"
          />
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="py-20 text-center text-slate-400 text-sm animate-pulse">Loading dashboard records...</div>
        ) : (
          <div className="space-y-4">
            {activeTab === 'jobs' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredJobs.length === 0 ? (
                  <div className="col-span-2 text-center py-12 text-slate-500 text-sm">No jobs found in database.</div>
                ) : (
                  filteredJobs.map((job) => (
                    <div key={job.id} className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-5 hover:border-slate-600 transition-all">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-md border border-blue-500/20">
                            {job.status}
                          </span>
                          <h4 className="text-base font-bold text-white mt-2">{job.title}</h4>
                          <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                            <Building2 className="w-3.5 h-3.5 text-slate-500" /> {job.organization}
                          </p>
                        </div>
                        <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> Due: {job.deadline}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-3 line-clamp-2 leading-relaxed">{job.purpose}</p>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'applications' && (
              <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900/80 border-b border-slate-700 text-slate-400 uppercase font-semibold">
                    <tr>
                      <th className="px-6 py-4">Application ID</th>
                      <th className="px-6 py-4">Job Reference</th>
                      <th className="px-6 py-4">Candidate ID</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Submitted Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {applications.length === 0 ? (
                      <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No applications registered yet.</td></tr>
                    ) : (
                      applications.map(app => (
                        <tr key={app.id} className="hover:bg-slate-800/80">
                          <td className="px-6 py-4 font-mono text-slate-400">{app.id.substring(0, 8)}...</td>
                          <td className="px-6 py-4 font-mono text-blue-400">{app.job_id.substring(0, 8)}...</td>
                          <td className="px-6 py-4 font-mono text-purple-400">{app.user_id.substring(0, 8)}...</td>
                          <td className="px-6 py-4">
                            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase">
                              {app.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-400">{new Date(app.applied_at).toLocaleDateString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {profiles.map(p => (
                  <div key={p.id} className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-white text-sm">
                        {p.full_name ? p.full_name[0] : 'U'}
                      </div>
                      <div>
                        <h5 className="text-sm font-bold text-white">{p.full_name || 'Anonymous User'}</h5>
                        <span className="text-xs text-slate-400">{p.phone || 'No phone'}</span>
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-700/50 flex items-center justify-between text-xs text-slate-400">
                      <span>Role: <strong className="text-blue-400 capitalize">{p.role}</strong></span>
                      <span>Joined {new Date(p.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Post New Job Modal */}
      {showAddJobModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-500" /> Post New Job & Trigger Push Alert
              </h3>
              <button 
                onClick={() => setShowAddJobModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Job Title *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Senior Field Marketing Specialist" 
                  value={newJobTitle}
                  onChange={e => setNewJobTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Organization Name *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Uganda Telecom / NGO Forum" 
                  value={newJobOrg}
                  onChange={e => setNewJobOrg(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Application Deadline *</label>
                  <input 
                    type="date" 
                    required
                    value={newJobDeadline}
                    onChange={e => setNewJobDeadline(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Auto-Push Webhook</label>
                  <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl px-3 py-2.5 text-xs font-semibold flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4" /> Enabled on Insert
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Job Purpose / Description</label>
                <textarea 
                  rows={3}
                  placeholder="Overview of duties and responsibilities..." 
                  value={newJobPurpose}
                  onChange={e => setNewJobPurpose(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Requirements</label>
                <textarea 
                  rows={2}
                  placeholder="• Bachelor's Degree&#10;• 2+ Years Experience" 
                  value={newJobRequirements}
                  onChange={e => setNewJobRequirements(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowAddJobModal(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-blue-600/30 flex items-center gap-2"
                >
                  {submitting ? 'Publishing...' : <><Send className="w-4 h-4" /> Publish Job & Notify Users</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
