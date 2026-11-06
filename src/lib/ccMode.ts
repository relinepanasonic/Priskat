import { headers } from "next/headers";

/** True on communitycenter.ruangiman.com, the community back office. */
export async function isCommunityCenterHost() {
  const host = ((await headers()).get("host") ?? "").toLowerCase();
  return host.startsWith("communitycenter.");
}
