// Cross-component signal that DM unread state may have changed
// (a thread was opened / marked read, a message arrived, one was sent).
// Badges listen for this to refresh immediately instead of waiting for
// their poll interval.

export const DM_CHANGED = "dm:changed";

export function pingDmChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(DM_CHANGED));
  }
}

// Which thread the user is actively looking at (chat pane on screen).
// The global notifier uses this to suppress the chime for the open chat.
let viewingThreadId: string | null = null;

export function setViewingThread(id: string | null) {
  viewingThreadId = id;
}

export function getViewingThread() {
  return viewingThreadId;
}
