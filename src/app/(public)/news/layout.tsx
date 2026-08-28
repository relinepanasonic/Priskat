import NewsLayoutClient from "./NewsLayoutClient";

export default function NewsLayout({ children }: { children: React.ReactNode }) {
  return <NewsLayoutClient>{children}</NewsLayoutClient>;
}
