import InviteUserForm from "@/components/admin/InviteUserForm";

export const metadata = {
  title: "Invite Users - Admin Panel",
};

export default function InviteUsersPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Invite Users</h1>
        <p className="text-sm text-brand-muted">Send onboarding magic links to new members.</p>
      </div>

      <InviteUserForm />
    </div>
  );
}

