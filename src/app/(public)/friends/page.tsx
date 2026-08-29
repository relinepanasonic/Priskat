import { redirect } from "next/navigation";

// Old /friends URL now redirects to /community/friends
export default function OldFriendsPage() {
  redirect("/community/friends");
}
