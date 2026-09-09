import { redirect } from "next/navigation";
export default function MessagesIndex() {
  redirect("/community/messages/private");
}
