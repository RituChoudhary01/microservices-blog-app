"use client";
import { useAppData, user_service } from "../../components/context/AppContext";
import React, { useRef, useState } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import toast from "react-hot-toast";
import Loading from "@/components/loading";
import {
  Facebook, Instagram, Linkedin, Camera, LogOut,
  PenLine, Plus, BookOpen, ExternalLink
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { redirect, useRouter } from "next/navigation";

const ProfilePage = () => {
  const { user, setUser, logoutUser } = useAppData();

  if (!user) return redirect("/login");

  const InputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: user?.name || "",
    instagram: user?.instagram || "",
    facebook: user?.facebook || "",
    linkedin: user?.linkedin || "",
    bio: user?.bio || "",
  });

  const changeHandler = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    try {
      setLoading(true);
      const token = Cookies.get("token");
      const { data } = await axios.post(`${user_service}/api/v1/user/update/pic`, fd, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(data.message);
      Cookies.set("token", data.token, { expires: 5, secure: true, path: "/" });
      setUser(data.user);
    } catch {
      toast.error("Image update failed");
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async () => {
    try {
      setLoading(true);
      const token = Cookies.get("token");
      const { data } = await axios.post(`${user_service}/api/v1/user/update`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(data.message);
      Cookies.set("token", data.token, { expires: 5, secure: true, path: "/" });
      setUser(data.user);
      setOpen(false);
    } catch {
      toast.error("Update failed");
    } finally {
      setLoading(false);
    }
  };

  const socialLinks = [
    { href: user?.instagram, icon: <Instagram className="w-4 h-4" />, label: "Instagram", color: "hover:text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/20" },
    { href: user?.facebook, icon: <Facebook className="w-4 h-4" />, label: "Facebook", color: "hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20" },
    { href: user?.linkedin, icon: <Linkedin className="w-4 h-4" />, label: "LinkedIn", color: "hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20" },
  ].filter((s) => s.href);

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 flex items-start justify-center px-4 py-16">
      <div className="w-full max-w-md">

        {/* Avatar */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative group cursor-pointer" onClick={() => InputRef.current?.click()}>
            {user?.image ? (
              <img
                src={user.image}
                alt={user.name}
                className="w-24 h-24 rounded-full object-cover ring-4 ring-white dark:ring-slate-800 shadow-md"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-400 to-indigo-600 flex items-center justify-center ring-4 ring-white dark:ring-slate-800 shadow-md">
                <span className="text-2xl font-bold text-white">
                  {user?.name?.[0]?.toUpperCase()}
                </span>
              </div>
            )}
            <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <input type="file" className="hidden" accept="image/*" ref={InputRef} onChange={changeHandler} />
          </div>
          <h1 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">{user?.name}</h1>
          {user?.bio && (
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 text-center max-w-xs">{user.bio}</p>
          )}

          {/* Social links */}
          {socialLinks.length > 0 && (
            <div className="flex items-center gap-2 mt-4">
              {socialLinks.map(({ href, icon, label, color }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={label}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs transition-all duration-150 ${color}`}
                >
                  {icon}
                  <span className="hidden sm:inline">{label}</span>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Action Card */}
        <div className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-2xl divide-y divide-slate-100 dark:divide-slate-700/60 shadow-sm overflow-hidden">

          <button
            onClick={() => router.push("/blog/new")}
            className="w-full flex items-center gap-3 px-5 py-4 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors text-left group"
          >
            <div className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center flex-shrink-0 group-hover:bg-violet-100 dark:group-hover:bg-violet-900/50 transition-colors">
              <Plus className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            </div>
            <div className="flex-1">
              <p className="font-medium">Write a blog</p>
              <p className="text-xs text-slate-400 mt-0.5">Share your thoughts with the world</p>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 transition-colors" />
          </button>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <button className="w-full flex items-center gap-3 px-5 py-4 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors text-left group">
                <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-700 flex items-center justify-center flex-shrink-0 group-hover:bg-slate-100 dark:group-hover:bg-slate-600 transition-colors">
                  <PenLine className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Edit profile</p>
                  <p className="text-xs text-slate-400 mt-0.5">Update your name, bio & links</p>
                </div>
              </button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-base font-semibold">Edit Profile</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                {[
                  { key: "name", label: "Name", placeholder: "Your name" },
                  { key: "bio", label: "Bio", placeholder: "Tell us about yourself" },
                  { key: "instagram", label: "Instagram URL", placeholder: "https://instagram.com/..." },
                  { key: "facebook", label: "Facebook URL", placeholder: "https://facebook.com/..." },
                  { key: "linkedin", label: "LinkedIn URL", placeholder: "https://linkedin.com/in/..." },
                ].map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">{label}</label>
                    <input
                      value={formData[key as keyof typeof formData]}
                      onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                      placeholder={placeholder}
                      className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/40 transition"
                    />
                  </div>
                ))}
                <button
                  onClick={handleFormSubmit}
                  className="w-full py-2.5 text-sm font-medium rounded-lg bg-violet-600 hover:bg-violet-700 text-white transition-colors mt-2"
                >
                  Save changes
                </button>
              </div>
            </DialogContent>
          </Dialog>

          <button
            onClick={logoutUser}
            className="w-full flex items-center gap-3 px-5 py-4 text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors text-left group"
          >
            <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center flex-shrink-0">
              <LogOut className="w-4 h-4 text-red-400" />
            </div>
            <div className="flex-1">
              <p className="font-medium">Sign out</p>
              <p className="text-xs text-red-300 dark:text-red-500 mt-0.5">See you next time</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
