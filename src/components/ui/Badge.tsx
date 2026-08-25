interface BadgeProps {
  children: React.ReactNode;
  variant?: "blue" | "gold" | "green" | "red" | "gray";
  className?: string;
}

const variantClasses = {
  blue: "bg-brand-bg text-brand-gold-700",
  gold: "bg-brand-gold-50 text-brand-gold-400 border border-brand-gold-400",
  green: "bg-green-100 text-green-700",
  red: "bg-red-100 text-red-700",
  gray: "bg-brand-surface-hover text-brand-light",
};

export default function Badge({
  children,
  variant = "blue",
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
