import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  RefreshCw,
  X,
  Volume2,
  Layout,
  BellRing
} from "lucide-react";
import { useEffect, useState } from "react";

import { adminRepository } from "../../../data/api/admin/adminRepository";

import ConfirmationDialog from "@shared/components/ConfirmationDialog";
import { SkeletonCard } from "@shared/components/Skeleton";
import { useToast } from "@shared/components/Toast";

export default function AdminContent() {
  const [activeTab, setActiveTab] = useState("announcements");
  const toast = useToast();

  // Announcements lists
  const [announcements, setAnnouncements] = useState([]);
  const [loadingAnn, setLoadingAnn] = useState(true);
  const [errorAnn, setErrorAnn] = useState(null);

  // Content Settings configuration
  const [loadingSet, setLoadingSet] = useState(true);
  const [errorSet, setErrorSet] = useState(null);
  const [savingSettings, setSavingSettings] = useState(false);

  // Announcement Modal State
  const [showAnnModal, setShowAnnModal] = useState(false);
  const [editAnnId, setEditAnnId] = useState(null);
  const [submittingAnn, setSubmittingAnn] = useState(false);

  // Announcement Fields
  const [annTitle, setAnnTitle] = useState("");
  const [annContent, setAnnContent] = useState("");
  const [annType, setAnnType] = useState("info");
  const [annActive, setAnnActive] = useState(true);

  // Content settings fields
  const [bannerText, setBannerText] = useState("");
  const [homepageHeadline, setHomepageHeadline] = useState("");
  const [homepageSubheadline, setHomepageSubheadline] = useState("");

  // Confirmation state
  const [pendingDeleteAnnId, setPendingDeleteAnnId] = useState(null);

  const fetchAnnouncements = async () => {
    setLoadingAnn(true);
    setErrorAnn(null);
    try {
      const response = await adminRepository.getAnnouncements();
      setAnnouncements(response?.data || response || []);
    } catch (err) {
      console.error(err);
      setErrorAnn("Failed to load announcements feed database.");
    } finally {
      setLoadingAnn(false);
    }
  };

  const fetchContentSettings = async () => {
    setLoadingSet(true);
    setErrorSet(null);
    try {
      const response = await adminRepository.getContentSettings();
      const config = response?.data || response || {};
      
      setBannerText(config.banner_text || "");
      setHomepageHeadline(config.homepage_headline || "");
      setHomepageSubheadline(config.homepage_subheadline || "");
    } catch (err) {
      console.error(err);
      setErrorSet("Failed to load homepage text settings configuration.");
    } finally {
      setLoadingSet(false);
    }
  };

  useEffect(() => {
    if (activeTab === "announcements") {
      fetchAnnouncements();
    } else {
      fetchContentSettings();
    }
  }, [activeTab]);

  const handleOpenCreateAnn = () => {
    setEditAnnId(null);
    setAnnTitle("");
    setAnnContent("");
    setAnnType("info");
    setAnnActive(true);
    setShowAnnModal(true);
  };

  const handleOpenEditAnn = (ann) => {
    setEditAnnId(ann.id);
    setAnnTitle(ann.title || "");
    setAnnContent(ann.content || "");
    setAnnType(ann.type || "info");
    setAnnActive(ann.is_active !== false);
    setShowAnnModal(true);
  };

  const triggerDeleteAnn = (id) => {
    setPendingDeleteAnnId(id);
  };

  const executeDeleteAnn = async () => {
    if (!pendingDeleteAnnId) return;
    const id = pendingDeleteAnnId;
    setPendingDeleteAnnId(null);
    try {
      await adminRepository.deleteAnnouncement(id);
      setAnnouncements(prev => prev.filter(a => a.id !== id));
      toast.success("Alert notice deleted successfully.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete announcement.");
    }
  };

  const handleAnnSubmit = async (e) => {
    e.preventDefault();
    if (!annTitle || !annContent) return;
    setSubmittingAnn(true);

    const payload = {
      title: annTitle,
      content: annContent,
      type: annType,
      is_active: annActive
    };

    try {
      if (editAnnId) {
        const response = await adminRepository.updateAnnouncement(editAnnId, payload);
        const updated = response?.data || response;
        setAnnouncements(prev => prev.map(a => a.id === editAnnId ? updated : a));
        toast.success("Broadcast notice updated!");
      } else {
        const response = await adminRepository.createAnnouncement(payload);
        const created = response?.data || response;
        setAnnouncements(prev => [created, ...prev]);
        toast.success("New portal alert broadcasted!");
      }
      setShowAnnModal(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save announcement.");
    } finally {
      setSubmittingAnn(false);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await adminRepository.updateContentSettings({
        banner_text: bannerText,
        homepage_headline: homepageHeadline,
        homepage_subheadline: homepageSubheadline,
      });
      toast.success("Homepage portal content settings saved successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update homepage settings configuration.");
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <div className="p-8 space-y-8 pt-24">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-white/5 pb-5">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight">Portal Configuration</h1>
          <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Broadcast system-wide notices or alter public homepage landing variables</p>
        </div>
        {activeTab === "announcements" && (
          <button
            onClick={handleOpenCreateAnn}
            className="px-4 py-2.5 bg-orange-500 hover:bg-orange-400 text-black font-black uppercase text-xs rounded-xl transition flex items-center gap-2"
          >
            <Plus size={14} /> Add Announcement
          </button>
        )}
      </div>

      {/* Tabs Selector */}
      <div className="flex gap-4 border-b border-white/5 pb-1">
        <button
          onClick={() => setActiveTab("announcements")}
          className={`py-2 px-4 text-xs font-black uppercase tracking-wider transition ${
            activeTab === "announcements"
              ? "text-orange-500 border-b-2 border-orange-500 font-bold"
              : "text-gray-500 hover:text-gray-300"
          }`}
        >
          Announcements Broadcaster ({announcements.length})
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`py-2 px-4 text-xs font-black uppercase tracking-wider transition ${
            activeTab === "settings"
              ? "text-orange-500 border-b-2 border-orange-500 font-bold"
              : "text-gray-500 hover:text-gray-300"
          }`}
        >
          Homepage Content Editor
        </button>
      </div>

      {/* Tab View Announcements */}
      {activeTab === "announcements" && (
        <div className="space-y-6">
          {loadingAnn ? (
            <div className="grid md:grid-cols-2 gap-6">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : errorAnn ? (
            <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-2xl flex items-center gap-3 text-red-400 text-sm">
              <AlertCircle size={18} />
              <span>{errorAnn}</span>
            </div>
          ) : announcements.length === 0 ? (
            <div className="bg-white/[0.02] border border-white/5 p-16 rounded-3xl text-center text-gray-500 text-sm">
              No system announcements published.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {announcements.map((ann) => (
                <div
                  key={ann.id}
                  className={`p-6 rounded-2xl border bg-[#111] space-y-3 flex flex-col justify-between ${
                    ann.type === 'danger' ? "border-red-500/30" :
                    ann.type === 'warning' ? "border-yellow-500/30" :
                    ann.type === 'success' ? "border-green-500/30" :
                    "border-white/5"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-white text-sm uppercase flex items-center gap-2 leading-tight">
                        <Volume2 size={16} className="text-orange-500" />
                        {ann.title}
                      </h4>
                      <span className={`px-2 py-0.5 rounded font-black text-[8px] uppercase ${
                        ann.type === 'danger' ? "bg-red-500/15 text-red-400" :
                        ann.type === 'warning' ? "bg-yellow-500/15 text-yellow-400" :
                        ann.type === 'success' ? "bg-green-500/15 text-green-400" :
                        "bg-blue-500/15 text-blue-400"
                      }`}>
                        {ann.type}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed mt-2 whitespace-pre-wrap">
                      {ann.content}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-white/5 mt-3 flex items-center justify-between">
                    <span className={`text-[9px] font-bold uppercase ${ann.is_active ? "text-green-500" : "text-gray-500"}`}>
                      {ann.is_active ? "Broadcast Active" : "Disabled notice"}
                    </span>
                    <div className="flex gap-1.5 shrink-0">
                      <button
                        onClick={() => handleOpenEditAnn(ann)}
                        className="p-1.5 bg-white/5 border border-white/5 hover:border-orange-500/30 hover:bg-orange-500/10 text-gray-400 hover:text-orange-500 rounded-lg transition"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        onClick={() => triggerDeleteAnn(ann.id)}
                        className="p-1.5 bg-white/5 border border-white/5 hover:border-red-500/30 hover:bg-red-500/10 text-gray-400 hover:text-red-500 rounded-lg transition"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab View Settings */}
      {activeTab === "settings" && (
        <div className="space-y-6 max-w-2xl">
          {loadingSet ? (
            <div className="text-center py-20 text-gray-500 text-sm flex flex-col items-center gap-3">
              <RefreshCw size={24} className="animate-spin text-orange-500" />
              <span>Fetching homepage variables...</span>
            </div>
          ) : errorSet ? (
            <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-2xl flex items-center gap-3 text-red-400 text-sm">
              <AlertCircle size={18} />
              <span>{errorSet}</span>
            </div>
          ) : (
            <form onSubmit={handleSaveSettings} className="bg-[#111] p-8 rounded-3xl border border-white/5 space-y-6 shadow-xl">
              <h3 className="text-lg font-bold uppercase tracking-tight flex items-center gap-3 border-b border-white/5 pb-3">
                <Layout className="text-orange-500" /> Landing Page Settings
              </h3>

              {/* Banner Text */}
              <div className="space-y-1.5">
                <span className="block text-[10px] font-black text-gray-500 uppercase">Featured Promo Banner Copy</span>
                <input
                  type="text"
                  value={bannerText}
                  onChange={(e) => setBannerText(e.target.value)}
                  placeholder="e.g. 🔥 Get 50% off Premium tier this weekend only! Use Vodafone Cash."
                  className="w-full p-3 bg-black border border-gray-800 rounded-xl text-xs outline-none focus:border-orange-500 transition text-gray-200"
                />
              </div>

              {/* Homepage Headline */}
              <div className="space-y-1.5">
                <span className="block text-[10px] font-black text-gray-500 uppercase">Hero Headline Copy</span>
                <input
                  type="text"
                  value={homepageHeadline}
                  onChange={(e) => setHomepageHeadline(e.target.value)}
                  placeholder="e.g. DOMINATE YOUR PROGRESS"
                  className="w-full p-3 bg-black border border-gray-800 rounded-xl text-xs outline-none focus:border-orange-500 transition text-gray-200"
                />
              </div>

              {/* Homepage Subheadline */}
              <div className="space-y-1.5">
                <span className="block text-[10px] font-black text-gray-500 uppercase">Hero Sub-headline Copy</span>
                <textarea
                  value={homepageSubheadline}
                  onChange={(e) => setHomepageSubheadline(e.target.value)}
                  placeholder="e.g. Master splits, track weight progression, and consult our smart Groq-powered AI fitness coach."
                  rows={3}
                  className="w-full p-3 bg-black border border-gray-800 rounded-xl text-xs outline-none focus:border-orange-500 transition text-gray-200 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={savingSettings}
                className="w-full py-4 bg-orange-500 hover:bg-orange-400 text-black font-black uppercase text-xs rounded-xl transition flex items-center justify-center gap-2"
              >
                {savingSettings ? <RefreshCw size={14} className="animate-spin" /> : "Save Settings Map"}
              </button>
            </form>
          )}
        </div>
      )}

      {/* ================= BROADCAST ANNOUNCEMENT MODAL ================= */}
      <AnimatePresence>
        {showAnnModal && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-[98] p-4">
            <motion.div
              className="bg-[#111] border border-gray-800 max-w-md w-full p-8 rounded-3xl overflow-hidden shadow-2xl relative space-y-6"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <button
                onClick={() => setShowAnnModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 rounded-xl transition"
              >
                <X size={18} />
              </button>

              <h3 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                <BellRing className="text-orange-500" size={22} />
                {editAnnId ? "Edit Announcement" : "Publish Announcement"}
              </h3>

              <form onSubmit={handleAnnSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <span className="block text-[10px] font-black text-gray-500 uppercase">Notice Title</span>
                  <input
                    type="text"
                    value={annTitle}
                    onChange={(e) => setAnnTitle(e.target.value)}
                    placeholder="e.g. Upcoming Scheduled Database Maintenance"
                    className="w-full p-3 bg-black border border-gray-800 rounded-xl text-xs outline-none focus:border-orange-500 transition text-gray-200"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <span className="block text-[10px] font-black text-gray-500 uppercase">Announcement Severity Type</span>
                  <select
                    value={annType}
                    onChange={(e) => setAnnType(e.target.value)}
                    className="w-full p-3 bg-black border border-gray-800 rounded-xl text-xs outline-none focus:border-orange-500 transition text-gray-300"
                  >
                    <option value="info">Information (Blue)</option>
                    <option value="success">Upgrade / Success (Green)</option>
                    <option value="warning">Schedules / Warnings (Yellow)</option>
                    <option value="danger">Critical Notice (Red)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <span className="block text-[10px] font-black text-gray-500 uppercase">Detailed Content</span>
                  <textarea
                    value={annContent}
                    onChange={(e) => setAnnContent(e.target.value)}
                    placeholder="Provide full description of the alert or system release notes..."
                    className="w-full p-3 bg-black border border-gray-800 rounded-xl text-xs outline-none focus:border-orange-500 transition text-gray-200 h-28 resize-none"
                    required
                  />
                </div>

                <div className="flex items-center gap-3 p-3 bg-black border border-gray-800 rounded-xl">
                  <input
                    id="annActive"
                    type="checkbox"
                    checked={annActive}
                    onChange={(e) => setAnnActive(e.target.checked)}
                    className="w-4 h-4 accent-orange-500"
                  />
                  <label htmlFor="annActive" className="text-xs text-gray-300 font-semibold cursor-pointer">
                    Enable and broadcast immediately to all dashboards
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={submittingAnn || !annTitle || !annContent}
                  className="w-full py-4 bg-orange-500 hover:bg-orange-400 text-black font-black uppercase text-xs rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submittingAnn ? <RefreshCw size={14} className="animate-spin" /> : "Broadcast Notice"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmationDialog
        isOpen={pendingDeleteAnnId !== null}
        title="Delete Announcement"
        message="Are you sure you want to delete this announcement? It will be removed immediately from all user dashboards."
        confirmLabel="Delete Notice"
        cancelLabel="Cancel"
        onConfirm={executeDeleteAnn}
        onCancel={() => setPendingDeleteAnnId(null)}
        isDanger={true}
      />
    </div>
  );
}
