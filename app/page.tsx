'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Briefcase,
  Users,
  FileText,
  Plus,
  Search,
  Bell,
  Clock,
  Send,
  Building2,
  Trash2,
  Megaphone,
  ShieldCheck,
  Image as ImageIcon,
  Eye,
  Loader2,
  X
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

interface CompanyAd {
  id: string;
  company_name: string;
  headline: string;
  description: string;
  image_url: string;
  website_url: string;
  contact_phone: string;
  status: string;
  created_at: string;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'jobs' | 'applications' | 'users' | 'ads'>('jobs');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [companyAds, setCompanyAds] = useState<CompanyAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Job Modal State
  const [showAddJobModal, setShowAddJobModal] = useState(false);
  const [newJobTitle, setNewJobTitle] = useState('');
  const [newJobOrg, setNewJobOrg] = useState('');
  const [newJobPurpose, setNewJobPurpose] = useState('');
  const [newJobRequirements, setNewJobRequirements] = useState('');
  const [newJobDeadline, setNewJobDeadline] = useState('');
  const [submittingJob, setSubmittingJob] = useState(false);

  // Ad Modal State
  const [showAddAdModal, setShowAddAdModal] = useState(false);
  const [adCompanyName, setAdCompanyName] = useState('');
  const [adHeadline, setAdHeadline] = useState('');
  const [adDescription, setAdDescription] = useState('');
  const [adImageUrl, setAdImageUrl] = useState('');
  const [adWebsiteUrl, setAdWebsiteUrl] = useState('');
  const [adContactPhone, setAdContactPhone] = useState('');
  const [submittingAd, setSubmittingAd] = useState(false);

  // View Details Modal State
  const [selectedJobDetails, setSelectedJobDetails] = useState<Job | null>(null);
  const [showJobDetailsModal, setShowJobDetailsModal] = useState(false);
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

      try {
        const adRes = await fetch('/api/ads');
        const adJson = await adRes.json();
        if (adJson.ads) setCompanyAds(adJson.ads);
      } catch (e) {
        const { data: adsData } = await supabase.from('company_ads').select('*').order('created_at', { ascending: false });
        if (adsData) setCompanyAds(adsData);
      }
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

    setSubmittingJob(true);
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newJobTitle,
          organization: newJobOrg,
          purpose: newJobPurpose,
          requirements: newJobRequirements,
          deadline: newJobDeadline,
          status: 'active',
        }),
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'Failed to create job');

      showNotification('✅ New job published successfully!');
      setShowAddJobModal(false);
      setNewJobTitle('');
      setNewJobOrg('');
      setNewJobPurpose('');
      setNewJobRequirements('');
      setNewJobDeadline('');
      fetchData();
    } catch (err: any) {
      alert('Error creating job: ' + err.message);
    } finally {
      setSubmittingJob(false);
    }
  };

  const handleDeleteJob = async (jobId: string, jobTitle: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${jobTitle}"?`)) return;

    try {
      const res = await fetch(`/api/jobs?id=${jobId}`, { method: 'DELETE' });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'Failed to delete job');

      showNotification('🗑️ Job deleted permanently.');
      fetchData();
    } catch (err: any) {
      alert('Error deleting job: ' + err.message);
    }
  };

  const handleCreateAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adCompanyName || !adHeadline) {
      alert('Company name and headline are required.');
      return;
    }

    setSubmittingAd(true);
    try {
      const res = await fetch('/api/ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: adCompanyName,
          headline: adHeadline,
          description: adDescription,
          image_url: adImageUrl,
          website_url: adWebsiteUrl,
          contact_phone: adContactPhone,
          status: 'active',
        }),
      });

      if (!res.ok) throw new Error('Failed to post advertisement');

      showNotification('🚀 Company advertisement published live!');
      setShowAddAdModal(false);
      setAdCompanyName('');
      setAdHeadline('');
      setAdDescription('');
      setAdImageUrl('');
      setAdWebsiteUrl('');
      setAdContactPhone('');
      fetchData();
    } catch (err: any) {
      alert('Error posting ad: ' + err.message);
    } finally {
      setSubmittingAd(false);
    }
  };

  const handleDeleteAd = async (adId: string) => {
    if (!confirm('Are you sure you want to delete this company ad?')) return;
    try {
      const res = await fetch(`/api/ads?id=${adId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete ad');
      showNotification('🗑️ Advertisement removed.');
      fetchData();
    } catch (err: any) {
      alert('Error deleting ad: ' + err.message);
    }
  };

  const openJobDetails = (job: Job) => {
    setSelectedJobDetails(job);
    setShowJobDetailsModal(true);
  };

  // Helpers with fallbacks for missing data
  const getJobTitle = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    return job?.title || '—';
  };

  const getUserName = (userId: string) => {
    if (!userId) return 'Unknown';
    const profile = profiles.find(p => p.id === userId);
    return profile?.full_name || '—';
  };

  // Null‑safe filters
  const filteredJobs = jobs.filter(j =>
    (j.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (j.organization || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredApplications = applications.filter(a =>
    (getJobTitle(a.job_id) || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (getUserName(a.user_id) || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProfiles = profiles.filter(p =>
    (p.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.phone || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAds = companyAds.filter(ad =>
    (ad.company_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (ad.headline || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = [
    { label: 'Total Jobs', value: jobs.length, icon: Briefcase, color: 'text-blue-400' },
    { label: 'Applications', value: applications.length, icon: FileText, color: 'text-emerald-400' },
    { label: 'Registered Users', value: profiles.length, icon: Users, color: 'text-purple-400' },
    { label: 'Active Ads', value: companyAds.filter(ad => ad.status === 'active').length, icon: Megaphone, color: 'text-amber-400' },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce">
          <Bell className="w-5 h-5" />
          <span className="font-medium text-sm">{toast}</span>
        </div>
      )}

      {/* Header Bar */}
      <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
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

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddAdModal(true)}
            className="bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-sm font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all"
          >
            <Megaphone className="w-4 h-4 text-purple-400" /> Post Company Ad
          </button>
          <button
            onClick={() => setShowAddJobModal(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" /> Post New Job
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
          </div>
        ) : (
          <>
            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {stats.map((stat) => (
                <div key={stat.label} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 flex items-center gap-4 backdrop-blur-sm">
                  <div className={`p-3 rounded-xl bg-slate-700/50 ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-800 pb-2">
              {[
                { key: 'jobs', label: 'Jobs', icon: Briefcase },
                { key: 'applications', label: 'Applications', icon: FileText },
                { key: 'users', label: 'Users', icon: Users },
                { key: 'ads', label: 'Company Ads', icon: Megaphone },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as typeof activeTab)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.key
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Tab Content */}
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl overflow-hidden backdrop-blur-sm">
              {/* Jobs Table */}
              {activeTab === 'jobs' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-800 text-slate-300">
                      <tr>
                        <th className="text-left p-4 font-medium">Title</th>
                        <th className="text-left p-4 font-medium">Organization</th>
                        <th className="text-left p-4 font-medium">Deadline</th>
                        <th className="text-left p-4 font-medium">Status</th>
                        <th className="text-right p-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                      {filteredJobs.map((job) => (
                        <tr key={job.id} className="hover:bg-slate-700/20 transition-colors">
                          <td className="p-4 font-medium text-white">{job.title || '—'}</td>
                          <td className="p-4 text-slate-300">{job.organization || '—'}</td>
                          <td className="p-4 text-slate-400">
                            {job.deadline ? new Date(job.deadline).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              job.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20 text-slate-400'
                            }`}>
                              {job.status || 'unknown'}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => openJobDetails(job)}
                                className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteJob(job.id, job.title)}
                                className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-slate-400 hover:text-red-400"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredJobs.length === 0 && (
                        <tr>
                          <td colSpan={5} className="p-6 text-center text-slate-500">No jobs found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Applications Table */}
              {activeTab === 'applications' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-800 text-slate-300">
                      <tr>
                        <th className="text-left p-4 font-medium">Job Title</th>
                        <th className="text-left p-4 font-medium">Applicant</th>
                        <th className="text-left p-4 font-medium">Status</th>
                        <th className="text-left p-4 font-medium">Applied At</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                      {filteredApplications.map((app) => (
                        <tr key={app.id} className="hover:bg-slate-700/20">
                          <td className="p-4 font-medium text-white">{getJobTitle(app.job_id)}</td>
                          <td className="p-4 text-slate-300">{getUserName(app.user_id)}</td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              app.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                              app.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
                              app.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                              'bg-slate-500/20 text-slate-400'
                            }`}>
                              {app.status || 'unknown'}
                            </span>
                          </td>
                          <td className="p-4 text-slate-400">
                            {app.applied_at ? new Date(app.applied_at).toLocaleDateString() : 'N/A'}
                          </td>
                        </tr>
                      ))}
                      {filteredApplications.length === 0 && (
                        <tr>
                          <td colSpan={4} className="p-6 text-center text-slate-500">No applications found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Users Table */}
              {activeTab === 'users' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-800 text-slate-300">
                      <tr>
                        <th className="text-left p-4 font-medium">Full Name</th>
                        <th className="text-left p-4 font-medium">Phone</th>
                        <th className="text-left p-4 font-medium">Role</th>
                        <th className="text-left p-4 font-medium">Registered</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                      {filteredProfiles.map((profile) => (
                        <tr key={profile.id} className="hover:bg-slate-700/20">
                          <td className="p-4 font-medium text-white">{profile.full_name || '—'}</td>
                          <td className="p-4 text-slate-300">{profile.phone || '—'}</td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              profile.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-500/20 text-slate-400'
                            }`}>
                              {profile.role || 'user'}
                            </span>
                          </td>
                          <td className="p-4 text-slate-400">
                            {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
                          </td>
                        </tr>
                      ))}
                      {filteredProfiles.length === 0 && (
                        <tr>
                          <td colSpan={4} className="p-6 text-center text-slate-500">No users found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Ads Table */}
              {activeTab === 'ads' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-800 text-slate-300">
                      <tr>
                        <th className="text-left p-4 font-medium">Company</th>
                        <th className="text-left p-4 font-medium">Headline</th>
                        <th className="text-left p-4 font-medium">Status</th>
                        <th className="text-right p-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                      {filteredAds.map((ad) => (
                        <tr key={ad.id} className="hover:bg-slate-700/20">
                          <td className="p-4 font-medium text-white">{ad.company_name || '—'}</td>
                          <td className="p-4 text-slate-300 max-w-xs truncate">{ad.headline || '—'}</td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              ad.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20 text-slate-400'
                            }`}>
                              {ad.status || 'unknown'}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => handleDeleteAd(ad.id)}
                              className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-slate-400 hover:text-red-400"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredAds.length === 0 && (
                        <tr>
                          <td colSpan={4} className="p-6 text-center text-slate-500">No advertisements found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* Add Job Modal */}
      {showAddJobModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Post New Job</h2>
              <button onClick={() => setShowAddJobModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateJob} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Job Title *</label>
                <input value={newJobTitle} onChange={(e) => setNewJobTitle(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-500" placeholder="e.g. Farm Supervisor" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Organization *</label>
                <input value={newJobOrg} onChange={(e) => setNewJobOrg(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-500" placeholder="e.g. AgriTech Uganda Ltd" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Purpose</label>
                <textarea value={newJobPurpose} onChange={(e) => setNewJobPurpose(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-500 h-20" placeholder="Job purpose..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Requirements</label>
                <textarea value={newJobRequirements} onChange={(e) => setNewJobRequirements(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-500 h-20" placeholder="Requirements..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Deadline *</label>
                <input type="date" value={newJobDeadline} onChange={(e) => setNewJobDeadline(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white" required />
              </div>
              <button type="submit" disabled={submittingJob} className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                {submittingJob ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4" />}
                {submittingJob ? 'Publishing...' : 'Publish Job'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Ad Modal */}
      {showAddAdModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Post Company Ad</h2>
              <button onClick={() => setShowAddAdModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateAd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Company Name *</label>
                <input value={adCompanyName} onChange={(e) => setAdCompanyName(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Headline *</label>
                <input value={adHeadline} onChange={(e) => setAdHeadline(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                <textarea value={adDescription} onChange={(e) => setAdDescription(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white h-20" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Image URL</label>
                <input value={adImageUrl} onChange={(e) => setAdImageUrl(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white" placeholder="https://..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Website URL</label>
                <input value={adWebsiteUrl} onChange={(e) => setAdWebsiteUrl(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white" placeholder="https://..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Contact Phone</label>
                <input value={adContactPhone} onChange={(e) => setAdContactPhone(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white" />
              </div>
              <button type="submit" disabled={submittingAd} className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                {submittingAd ? <Loader2 className="w-5 h-5 animate-spin" /> : <Megaphone className="w-4 h-4" />}
                {submittingAd ? 'Publishing...' : 'Publish Advertisement'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Job Details Modal */}
      {showJobDetailsModal && selectedJobDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">{selectedJobDetails.title || '—'}</h2>
              <button onClick={() => setShowJobDetailsModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-400">Organization</p>
                <p className="text-white font-medium flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-400" /> {selectedJobDetails.organization || '—'}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Deadline</p>
                <p className="text-white font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" /> {selectedJobDetails.deadline ? new Date(selectedJobDetails.deadline).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Status</p>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                  selectedJobDetails.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20 text-slate-400'
                }`}>
                  {selectedJobDetails.status || 'unknown'}
                </span>
              </div>
              <div>
                <p className="text-sm text-slate-400">Purpose</p>
                <p className="text-white mt-1 whitespace-pre-wrap">{selectedJobDetails.purpose || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Requirements</p>
                <p className="text-white mt-1 whitespace-pre-wrap">{selectedJobDetails.requirements || 'Not specified'}</p>
              </div>
              <div className="text-xs text-slate-500 pt-2 border-t border-slate-700">
                Created {selectedJobDetails.created_at ? new Date(selectedJobDetails.created_at).toLocaleString() : 'unknown'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
