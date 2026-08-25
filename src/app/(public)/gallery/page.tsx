import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Gallery" };

export default function GalleryPage() {
  // If the user configures a Google Drive Folder ID in their environment variables,
  // we will render the iframe. 
  // Example Folder ID format: 1A2B3C4D5E6F7G8H9I0J
  const driveFolderId = process.env.NEXT_PUBLIC_GOOGLE_DRIVE_FOLDER_ID;

  return (
    <main className="flex-1 px-4 py-8 max-w-4xl mx-auto w-full">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-white mb-3">Community Gallery</h1>
          <p className="text-brand-muted max-w-2xl mx-auto">
            Memories and moments from our events and modules.
          </p>
        </div>

        {driveFolderId ? (
          <div className="w-full bg-brand-surface rounded-2xl overflow-hidden shadow-lg border border-brand-border h-[600px] md:h-[800px]">
            <iframe 
              src={`https://drive.google.com/embeddedfolderview?id=${driveFolderId}#grid`} 
              width="100%" 
              height="100%" 
              className="border-0"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="text-center py-20 card-3d border-dashed">
            <h3 className="text-xl font-semibold text-brand-gold mb-2">Gallery is not configured yet.</h3>
            <p className="text-brand-light max-w-md mx-auto text-sm">
              To embed a Google Drive folder, add your public folder ID to your environment variables as <code>NEXT_PUBLIC_GOOGLE_DRIVE_FOLDER_ID</code>.
            </p>
          </div>
        )}
    </main>
  );
}

