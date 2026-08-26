"use client";

import { useState } from "react";
import { Link as LinkIcon, CheckCircle2, X, UserPlus, Copy } from "lucide-react";

interface Props {
  onClose: () => void;
}

const ROLE_OPTIONS = [
  { value: "superadmin", label: "Superadmin" },
  { value: "admin", label: "Admin" },
  { value: "member", label: "Member" },
];

export default function InvitePanel({ onClose }: Props) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("member");
  const [generatedLink, setGeneratedLink] = useState("");
  const [copied, setCopied] = useState(false);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    
    // Generate the registration URL with query parameters
    const url = new URL("/register", window.location.origin);
    url.searchParams.set("name", name);
    url.searchParams.set("role", role);
    
    setGeneratedLink(url.toString());
    setCopied(false);
  };

  const handleCopy = async () => {
    if (!generatedLink) return;
    try {
      await navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link", err);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
        onClick={onClose}
      />

      {/* Centered Modal */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#1a1d24] border border-[#333] z-[101] shadow-2xl rounded-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#333] bg-[#111]">
          <div className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-brand-gold" />
            <span className="font-bold text-white text-base">Invite User</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors p-1"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6">
          <p className="text-xs text-gray-400 mb-6 leading-relaxed">
            Generate an invitation link for a new member. Send this link to them via WhatsApp or Email to complete their registration.
          </p>

          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Nama
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setGeneratedLink(""); // Reset link if they change the name
                }}
                placeholder="Full name"
                className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-gold transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Level / Role
              </label>
              <select
                value={role}
                onChange={(e) => {
                  setRole(e.target.value);
                  setGeneratedLink("");
                }}
                className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-gold transition-colors"
              >
                {ROLE_OPTIONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            {!generatedLink ? (
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-brand-gold text-brand-dark px-4 py-3 mt-6 rounded-xl text-sm font-bold hover:bg-yellow-400 transition-colors shadow-glow-gold"
              >
                Generate Link
                <LinkIcon className="h-4 w-4" />
              </button>
            ) : (
              <div className="mt-6 space-y-3">
                <label className="block text-xs font-semibold text-brand-gold">
                  Invitation Link Ready:
                </label>
                <div className="flex items-center gap-2 bg-[#111] border border-brand-gold/30 rounded-xl p-2 pl-4">
                  <div className="flex-1 truncate text-xs text-gray-300 font-mono">
                    {generatedLink}
                  </div>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex-shrink-0 flex items-center justify-center h-8 w-8 bg-brand-gold/10 hover:bg-brand-gold/20 text-brand-gold rounded-lg transition-colors"
                  >
                    {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
                {copied && <p className="text-xs text-green-400 text-center">Link copied to clipboard!</p>}
              </div>
            )}
          </form>
        </div>
      </div>
    </>
  );
}

