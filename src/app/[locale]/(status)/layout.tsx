import { ContentBoundary } from "@/components/elements/feedback/content-boundary";
import { Footer } from "@/components/layout/nav/footer";
import { NavAuth } from "@/components/layout/nav/nav-auth";
import { Navbar } from "@/components/layout/nav/navbar";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

// AdoRouter: Status sits inside the site's navbar and footer like every other
// public page, instead of unorouter's standalone status page.
export default async function StatusLayout(props: Props) {
  return (
    <>
      <Navbar authSlot={<NavAuth />} />
      <main className="bg-background flex-1">
        <ContentBoundary className="pt-20 pb-24">
          {props.children}
        </ContentBoundary>
      </main>
      <div className="bg-background">
        <Footer />
      </div>
    </>
  );
}
