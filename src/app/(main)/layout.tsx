import { ThemeProvider } from "@/components/providers/theme-provider";
import { MainLayout } from "@/components/app/main-layout";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const sidebarLogo =
    PlaceHolderImages.find((img) => img.id === "sidebar-logo")?.imageUrl ||
    "https://picsum.photos/seed/sidebarlogo/100/100";

  return (
    <ThemeProvider defaultTheme="light" storageKey="peepos-theme">
      <MainLayout sidebarLogo={sidebarLogo}>{children}</MainLayout>
    </ThemeProvider>
  );
}
