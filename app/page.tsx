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
  Globe,
  Phone,
  ShieldCheck,
  Image as ImageIcon,
  Eye
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

  const filteredJobs = jobs.filter(j => 
    j.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    j.organization.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

      {/* Content Tabs & Main Table/Card UI */}
      {/* ... (Full codebase available inside /web-admin/app/page.tsx) */}
    </div>
  );
}
