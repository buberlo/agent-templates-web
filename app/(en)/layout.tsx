import { SiteLayout } from "@/lib/views/site-layout";
import { rootLayoutMetadata } from "@/lib/views/metadata";

export const metadata = rootLayoutMetadata("en");

export default function Layout({ children }: { children: React.ReactNode }) {
  return <SiteLayout locale="en">{children}</SiteLayout>;
}
