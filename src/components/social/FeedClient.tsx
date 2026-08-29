"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { Image as ImageIcon, BookOpen, HeartHandshake, X, BookMarked, Loader2, ChevronLeft } from "lucide-react";
import Image from "next/image";

// ─── Bible Book list (ID → name) ────────────────────────────────────────────
const BIBLE_BOOKS = [
  "Genesis","Exodus","Leviticus","Numbers","Deuteronomy",
  "Joshua","Judges","Ruth","1 Samuel","2 Samuel","1 Kings","2 Kings",
  "1 Chronicles","2 Chronicles","Ezra","Nehemiah","Tobit","Judith",
  "Esther","1 Maccabees","2 Maccabees","Job","Psalms","Proverbs",
  "Ecclesiastes","Song of Solomon","Wisdom","Sirach","Isaiah","Jeremiah",
  "Lamentations","Baruch","Ezekiel","Daniel","Hosea","Joel","Amos",
  "Obadiah","Jonah","Micah","Nahum","Habakkuk","Zephaniah","Haggai",
  "Zechariah","Malachi","Matthew","Mark","Luke","John","Acts","Romans",
  "1 Corinthians","2 Corinthians","Galatians","Ephesians","Philippians",
  "Colossians","1 Thessalonians","2 Thessalonians","1 Timothy","2 Timothy",
  "Titus","Philemon","Hebrews","James","1 Peter","2 Peter",
  "1 John","2 John","3 John","Jude","Revelation"
];
const BOOK_ID: Record<string,number> = {};
BIBLE_BOOKS.forEach((b,i) => { BOOK_ID[b] = i + 1; });

// ─── Bible Picker Modal ──────────────────────────────────────────────────────
function BiblePickerModal({ onInsert, onClose, lang = "id" }: { onInsert: (text: string) => void; onClose: () => void; lang?: "id" | "en" }) {
  const [step, setStep] = useState<"book"|"chapter"|"verse">("book");
  const [book, setBook] = useState("");
  const [chapter, setChapter] = useState(0);
  const [bookSearch, setBookSearch] = useState("");
  const [chapters, setChapters] = useState<number[]>([]);
  const [verses, setVerses] = useState<{verse: number; text: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const isEn = lang === "en";

  const filteredBooks = BIBLE_BOOKS.filter(b => b.toLowerCase().includes(bookSearch.toLowerCase()));

  const pickBook = async (b: string) => {
    setBook(b);
    const bookId = BOOK_ID[b];
    setLoading(true);
    const res = await fetch(`/api/bible/${bookId}/1?lang=${lang}`);
    const data = await res.json();
    setChapters(Array.from({length: 50}, (_,i) => i+1));
    setLoading(false);
    setStep("chapter");
  };

  const pickChapter = async (ch: number) => {
    setChapter(ch);
    const bookId = BOOK_ID[book];
    setLoading(true);
    const res = await fetch(`/api/bible/${bookId}/${ch}?lang=${lang}`);
    const data = await res.json();
    setVerses((data || []).map((v: any) => ({ verse: v.verse, text: v.text || v.content || "" })));
    setLoading(false);
    setStep("verse");
  };

  const pickVerse = (v: {verse: number; text: string}) => {
    const reference = `${book} ${chapter}:${v.verse}`;
    onInsert(`"${v.text.trim()}"\n— ${reference}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg bg-[#111] border border-[#333] rounded-t-3xl flex flex-col" style={{maxHeight:"85dvh"}} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#222] flex-shrink-0">
          <button onClick={step === "book" ? onClose : () => setStep(step === "chapter" ? "book" : "chapter")} className="flex items-center gap-1 text-brand-muted hover:text-white text-sm">
            {step !== "book" && <ChevronLeft className="h-4 w-4" />}
            {step === "book" ? (isEn ? "Cancel" : "Batal") : step === "chapter" ? book : `${book} ${chapter}`}
          </button>
          <h2 className="font-bold text-white text-sm">
            {step === "book" ? (isEn ? "Select Book" : "Pilih Kitab") : step === "chapter" ? (isEn ? "Select Chapter" : "Pilih Pasal") : (isEn ? "Select Verse" : "Pilih Ayat")}
          </h2>
          <button onClick={onClose} className="text-brand-muted hover:text-white"><X className="h-4 w-4" /></button>
        </div>

        <div className="overflow-y-auto flex-1 pb-safe" style={{WebkitOverflowScrolling:"touch"} as React.CSSProperties}>
          {loading && <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 text-brand-gold animate-spin" /></div>}

          {/* Book Step */}
          {!loading && step === "book" && (
            <div className="p-4">
              <input
                value={bookSearch}
                onChange={e => setBookSearch(e.target.value)}
                placeholder={isEn ? "Search book..." : "Cari kitab..."}
                className="w-full bg-[#1a1d24] border border-[#333] rounded-xl px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold mb-3"
              />
              <div className="grid grid-cols-2 gap-1.5">
                {filteredBooks.map(b => (
                  <button key={b} onClick={() => pickBook(b)}
                    className="text-left px-3 py-2.5 rounded-xl text-sm text-brand-light hover:bg-brand-gold/10 hover:text-brand-gold border border-transparent hover:border-brand-gold/30 transition-all">
                    {b}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chapter Step */}
          {!loading && step === "chapter" && (
            <div className="p-4 grid grid-cols-5 gap-2">
              {chapters.map(ch => (
                <button key={ch} onClick={() => pickChapter(ch)}
                  className="py-2.5 rounded-xl text-sm font-medium text-brand-light hover:bg-brand-gold/10 hover:text-brand-gold border border-[#333] hover:border-brand-gold/30 transition-all">
                  {ch}
                </button>
              ))}
            </div>
          )}

          {/* Verse Step */}
          {!loading && step === "verse" && (
            <div className="divide-y divide-[#222]">
              {verses.length === 0 && <p className="text-brand-muted text-center py-8 text-sm">{isEn ? "No verses found. Try another chapter." : "Tidak ada ayat ditemukan."}</p>}
              {verses.map(v => (
                <button key={v.verse} onClick={() => pickVerse(v)}
                  className="w-full text-left px-4 py-3 flex gap-3 hover:bg-brand-gold/5 transition-colors group">
                  <span className="text-brand-gold font-bold text-sm min-w-[1.5rem]">{v.verse}</span>
                  <p className="text-brand-light text-sm leading-relaxed group-hover:text-white">{v.text}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Prayer Picker Modal ─────────────────────────────────────────────────────
function PrayerPickerModal({ onInsert, onClose, lang = "id" }: { onInsert: (text: string) => void; onClose: () => void; lang?: "id" | "en" }) {
  const [prayers, setPrayers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const isEn = lang === "en";

  useEffect(() => {
    supabase.from("prayers" as any).select("id, title_id, title_en, body_id, body_en").limit(100).then(({ data }) => {
      setPrayers(data || []);
      setLoading(false);
    });
  }, []);

  const filtered = prayers.filter(p => {
    const t = isEn ? p.title_en : (p.title_id || p.title_en);
    return t?.toLowerCase().includes(search.toLowerCase());
  });

  const pickPrayer = (p: any) => {
    const t = isEn ? p.title_en : (p.title_id || p.title_en);
    const b = isEn ? p.body_en : (p.body_id || p.body_en);
    onInsert(`🙏 ${t}\n\n${b?.trim()}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg bg-[#111] border border-[#333] rounded-t-3xl flex flex-col" style={{maxHeight:"85dvh"}} onClick={e => e.stopPropagation()}>
        {/* Fixed header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#222] flex-shrink-0">
          <button onClick={onClose} className="text-brand-muted hover:text-white text-sm">{isEn ? "Cancel" : "Batal"}</button>
          <h2 className="font-bold text-white text-sm">{isEn ? "Choose a Prayer" : "Pilih Doa"}</h2>
          <button onClick={onClose} className="text-brand-muted hover:text-white"><X className="h-4 w-4" /></button>
        </div>
        {/* Fixed search bar */}
        <div className="px-4 pt-3 pb-2 flex-shrink-0 border-b border-[#1a1d24]">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={isEn ? "Search prayer..." : "Cari doa..."}
            className="w-full bg-[#1a1d24] border border-[#333] rounded-xl px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold"
          />
        </div>
        {/* Scrollable list */}
        <div className="overflow-y-auto flex-1 pb-8" style={{WebkitOverflowScrolling:"touch"} as React.CSSProperties}>
          {loading && <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 text-brand-gold animate-spin" /></div>}
          <div className="divide-y divide-[#222]">
            {filtered.map(p => (
              <button key={p.id} onClick={() => pickPrayer(p)}
                className="w-full text-left px-4 py-3.5 hover:bg-brand-gold/5 transition-colors">
                <p className="text-sm font-medium text-white">{isEn ? p.title_en : (p.title_id || p.title_en)}</p>
              </button>
            ))}
            {!loading && filtered.length === 0 && <p className="text-brand-muted text-center py-8 text-sm">{isEn ? "No prayers found." : "Tidak ada doa ditemukan."}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main FeedClient ─────────────────────────────────────────────────────────
export default function FeedClient({ userAvatar, userName, userId, posts, lang = "id" }: { 
  userAvatar: string | null; 
  userName: string; 
  userId: string; 
  posts?: any[];
  lang?: "id" | "en";
}) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showBible, setShowBible] = useState(false);
  const [showPrayer, setShowPrayer] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const supabase = createClient();
  const isEn = lang === "en";

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  const insertText = (text: string) => {
    const newContent = content ? `${content}\n\n${text}` : text;
    setContent(newContent);
    setTimeout(() => textareaRef.current?.focus(), 100);
  };

  const handleDevotional = () => {
    insertText(isEn ? "I commit to do devotional '...' for ... days. Let's follow the same devotional! 📖" : "Saya berkomitmen untuk melakukan devotional '...' selama ... hari. Mari ikuti devotional yang sama! 📖");
  };

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("community_posts").insert({ author_id: userId, content: content.trim() });
      if (error) {
        alert(isEn ? "Failed to create post." : "Gagal membuat kiriman.");
      } else {
        setContent("");
        window.location.reload();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {showBible && <BiblePickerModal onInsert={insertText} onClose={() => setShowBible(false)} lang={lang} />}
      {showPrayer && <PrayerPickerModal onInsert={insertText} onClose={() => setShowPrayer(false)} lang={lang} />}

      <div className="bg-[#111] border border-[#2a2d35] rounded-2xl p-4 mb-6 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
        {/* Compose Header */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-white">{isEn ? "New Thought" : "Pikiran Baru"}</h2>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !content.trim()}
            className="px-4 py-1.5 rounded-full bg-brand-gold text-brand-dark text-sm font-bold disabled:opacity-40 hover:bg-yellow-400 transition-colors"
          >
            {isSubmitting ? (isEn ? "Posting..." : "Mengirim...") : (isEn ? "Post" : "Kirim")}
          </button>
        </div>

        {/* Avatar + textarea */}
        <div className="flex gap-3">
          <div className="relative h-9 w-9 rounded-full border border-[#333] bg-[#1a1d24] overflow-hidden flex-shrink-0 flex items-center justify-center">
            {userAvatar ? (
              <Image src={userAvatar} alt={userName} fill className="object-cover" />
            ) : (
              <span className="text-brand-gold font-bold text-sm">{userName[0]?.toUpperCase()}</span>
            )}
          </div>
          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder={isEn ? "Share a thought, verse, or prayer..." : "Bagikan pikiran, ayat, atau doa..."}
              rows={3}
              className="w-full bg-transparent text-[15px] text-brand-light placeholder-gray-500 focus:outline-none resize-none overflow-hidden leading-relaxed"
            />
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[#222]">
          <button
            type="button"
            onClick={() => setShowBible(true)}
            title="Insert Bible verse"
            className="flex items-center gap-1.5 text-gray-400 hover:text-brand-gold transition-colors text-xs font-medium"
          >
            <BookOpen className="h-5 w-5" />
            <span>{isEn ? "Verse" : "Ayat"}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowPrayer(true)}
            title="Insert Prayer"
            className="flex items-center gap-1.5 text-gray-400 hover:text-brand-gold transition-colors text-xs font-medium"
          >
            <HeartHandshake className="h-5 w-5" />
            <span>{isEn ? "Prayer" : "Doa"}</span>
          </button>

          <button
            type="button"
            onClick={handleDevotional}
            title="Share Devotional commitment"
            className="flex items-center gap-1.5 text-gray-400 hover:text-brand-gold transition-colors text-xs font-medium"
          >
            <BookMarked className="h-5 w-5" />
            <span>{isEn ? "Devotional" : "Renungan"}</span>
          </button>

          <button
            type="button"
            className="flex items-center gap-1.5 text-gray-400 hover:text-brand-gold transition-colors text-xs font-medium"
            title="Upload Image (Coming Soon)"
          >
            <ImageIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Render My Posts */}
      {posts && posts.length > 0 && (
        <div className="mt-2">
          <h3 className="text-xs font-bold text-brand-gold uppercase tracking-wider mb-4 border-b border-[#2a2d35] pb-2">{isEn ? "My Thoughts" : "Pikiran Saya"}</h3>
          <div className="space-y-6">
            {posts.map((post: any) => (
              <div key={post.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="relative h-9 w-9 rounded-full border border-[#333] bg-[#1a1d24] overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {userAvatar ? (
                      <Image src={userAvatar} alt={userName} fill className="object-cover" />
                    ) : (
                      <span className="text-brand-gold font-bold text-sm">{userName[0]?.toUpperCase()}</span>
                    )}
                  </div>
                </div>
                <div className="flex-1 flex flex-col pt-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-white text-sm">{userName}</span>
                    <span className="text-brand-muted text-xs">
                      {new Date(post.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-[15px] text-brand-light leading-relaxed whitespace-pre-wrap">{post.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
