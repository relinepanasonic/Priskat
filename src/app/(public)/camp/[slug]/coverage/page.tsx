import SciFiMap from "@/components/camp/SciFiMap";

export const metadata = {
  title: "Camp Map Command Center",
};

export default function CampMapPage() {
  return (
    <div className="pt-4">
      <SciFiMap />
    </div>
  );
}
