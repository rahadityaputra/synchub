import React from "react";
import { useAuth } from "../../stores/useAuth";
import { User, Mail, Shield, Calendar } from "lucide-react";

export default function Profile() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-slate-400">Loading profile...</p>
      </div>
    );
  }

  const profileInitials =
    user.name
      ?.split(" ")
      .slice(0, 2)
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          User Profile
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-8 flex flex-col md:flex-row gap-8 items-center md:items-start border-b border-slate-800 bg-slate-900/50">
          <div className="h-24 w-24 rounded-full bg-blue-600 border-4 border-slate-800 flex items-center justify-center text-3xl font-bold text-white shadow-xl shrink-0">
            {profileInitials}
          </div>
          <div className="flex-1 text-center md:text-left space-y-2">
            <h2 className="text-3xl font-bold text-white">
              {user.name || user.fullName || "User"}
            </h2>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm font-medium text-slate-400">
              <span className="flex items-center gap-1.5">
                <Mail size={16} className="text-slate-500" />
                {user.email || "No email provided"}
              </span>
            </div>
          </div>
        </div>

        <div className="p-8">
          <h3 className="text-lg font-semibold text-white mb-6">
            Account Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Full Name
              </label>
              <div className="flex items-center gap-3 px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-lg text-slate-300">
                <User size={18} className="text-slate-500 shrink-0" />
                <span className="truncate">
                  {user.name || user.fullName || "-"}
                </span>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Email Address
              </label>
              <div className="flex items-center gap-3 px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-lg text-slate-300">
                <Mail size={18} className="text-slate-500 shrink-0" />
                <span className="truncate">{user.email || "-"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
