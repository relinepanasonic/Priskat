import { Tent } from "lucide-react";

export const metadata = {
  title: "Camp - Priskat",
  description: "Information about our spiritual camps",
};

export default function CampPage() {
  return (
    <div className="w-full h-full p-4 md:p-8 flex flex-col items-center justify-center min-h-[70vh] text-center">
      <div className="w-24 h-24 bg-brand-gold/10 rounded-full flex items-center justify-center mb-6">
        <Tent className="h-12 w-12 text-brand-gold" />
      </div>
      <h1 className="text-3xl font-bold text-white mb-4">Pria Sejati Camp</h1>
      <p className="text-brand-muted max-w-md mx-auto mb-8">
        We are preparing exciting details about our upcoming camps and events. 
        Please check back soon for registration and schedules!
      </p>
      
      <div className="p-6 bg-[#111] border border-[#333] rounded-2xl max-w-lg w-full text-left shadow-xl">
        <h3 className="text-white font-semibold mb-2">Upcoming Features:</h3>
        <ul className="space-y-3 text-sm text-gray-400">
          <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-gold"></div> Camp Registration</li>
          <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-gold"></div> Event Schedules & Itineraries</li>
          <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-gold"></div> Testimonials & Gallery</li>
          <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-gold"></div> Alumni Connect</li>
        </ul>
      </div>
    </div>
  );
}
