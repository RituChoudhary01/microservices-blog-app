"use client";
import { useAppData, User, user_service } from "../../../components/context/AppContext";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Loading from "@/components/loading";
import { Facebook, Instagram, Linkedin, BookOpen } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

const UserProfilePage = () => {
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [fetching, setFetching] = useState(true);
  const { id } = useParams();
  const { user: currentUser } = useAppData();
  const router = useRouter();

  useEffect(() => {
    async function fetchUser() {
      try {
        setFetching(true);
        const { data } = await axios.get(`${user_service}/api/v1/user/${id}`);
        setProfileUser(data);
      } catch (error) {
        console.log(error);
      } finally {
        setFetching(false);
      }
    }
    fetchUser();
  }, [id]);

  // Redirect to own profile page if viewing yourself
  useEffect(() => {
    if (currentUser && profileUser && currentUser._id === profileUser._id) {
      router.replace("/profile");
    }
  }, [currentUser, profileUser]);

  if (fetching) return <Loading />;

  if (!profileUser) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <BookOpen className="w-7 h-7 text-slate-300 dark:text-slate-600" />
          </div>
          <p className="text-base font-medium text-slate-600 dark:text-slate-300">User not found</p>
        </div>
      </div>
    );
  }

  const socialLinks = [
    { href: profileUser?.instagram, icon: <Instagram className="w-4 h-4" />, label: "Instagram", color: "hover:text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/20" },
    { href: profileUser?.facebook, icon: <Facebook className="w-4 h-4" />, label: "Facebook", color: "hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20" },
    { href: profileUser?.linkedin, icon: <Linkedin className="w-4 h-4" />, label: "LinkedIn", color: "hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20" },
  ].filter((s) => s.href);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 flex items-start justify-center px-4 py-16">
      <div className="w-full max-w-md">

        {/* Avatar & Info */}
        <div className="flex flex-col items-center mb-8">
          {profileUser?.image ? (
            <img
              src={profileUser.image}
              alt={profileUser.name}
              className="w-24 h-24 rounded-full object-cover ring-4 ring-white dark:ring-slate-800 shadow-md"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-400 to-indigo-600 flex items-center justify-center ring-4 ring-white dark:ring-slate-800 shadow-md">
              <span className="text-2xl font-bold text-white">
                {profileUser?.name?.[0]?.toUpperCase()}
              </span>
            </div>
          )}

          <h1 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
            {profileUser?.name}
          </h1>

          {profileUser?.bio && (
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 text-center max-w-xs leading-relaxed">
              {profileUser.bio}
            </p>
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
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs transition-all duration-150 ${color}`}
                >
                  {icon}
                  <span className="hidden sm:inline">{label}</span>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Info card */}
        <div className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-2xl px-5 py-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">
            About
          </p>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500 dark:text-slate-400">Name</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">{profileUser.name}</span>
            </div>
            {profileUser.bio && (
              <div className="flex items-start justify-between gap-4 text-sm">
                <span className="text-slate-500 dark:text-slate-400 flex-shrink-0">Bio</span>
                <span className="font-medium text-slate-800 dark:text-slate-200 text-right">{profileUser.bio}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;