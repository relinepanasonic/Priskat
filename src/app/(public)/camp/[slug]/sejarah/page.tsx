import { HISTORY } from "@/lib/catholicIndonesia";

export const metadata = { title: "Sejarah Gereja Katolik Indonesia" };

const GOLD = "#D6B072";
const serif = { fontFamily: "'Lora', Georgia, serif" };

export default function HistoryPage() {
  return (
    <div className="pb-24">
      <header className="mb-8 max-w-2xl">
        <p className="text-xs uppercase tracking-[0.25em]" style={{ color: GOLD }}>Sejarah</p>
        <h2 className="mt-1 text-3xl font-semibold text-white" style={serif}>Gereja Katolik di Indonesia</h2>
        <p className="mt-3 leading-relaxed text-[#EAE5D9]/80">
          Hampir lima abad perjalanan iman, dari benih yang ditabur di Maluku hingga Gereja yang hidup di seluruh Nusantara.
        </p>
      </header>

      <ol className="relative ml-3 border-l" style={{ borderColor: `${GOLD}40` }}>
        {HISTORY.map((h) => (
          <li key={h.year} className="mb-8 ml-6">
            <span
              className="absolute -left-[7px] mt-1.5 h-3.5 w-3.5 rounded-full"
              style={{ background: GOLD, boxShadow: `0 0 0 4px #121417, 0 0 14px ${GOLD}88` }}
            />
            <div className="text-sm font-semibold tracking-wide" style={{ color: GOLD }}>{h.year}</div>
            <h3 className="mt-0.5 text-lg font-semibold text-white" style={serif}>{h.title}</h3>
            <p className="mt-1 max-w-2xl leading-relaxed text-[#EAE5D9]/85">{h.text}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
