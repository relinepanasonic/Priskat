import { redirect } from "next/navigation";

/** The old "My Profile" page repeated what Beranda and Edit Profile already show, so it is gone: /profile goes to Beranda. */
export default function ProfileRedirect() {
  redirect("/");
}
