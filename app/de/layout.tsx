import { SiteLayout } from "@/lib/views/site-layout";
import { rootLayoutMetadata } from "@/lib/views/metadata";

export const metadata = rootLayoutMetadata("de");

export default function Layout({ children }: { children: React.ReactNode }) {
  return <SiteLayout locale="de">{children}</SiteLayout>;
}
