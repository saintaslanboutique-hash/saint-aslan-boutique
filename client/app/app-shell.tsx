"use client";

import { AnimatePresence, LayoutGroup } from "framer-motion";
import { Toaster } from "react-hot-toast";
import { IntroProvider, useIntro } from "@/src/shared/lib/intro-context";
import { IntroLoader } from "@/src/shared/ui/intro-loader";
import Header from "@/src/widgets/header/header";
import Footer from "@/src/widgets/footer/footer";

function ContentWithFade({ children }: { children: React.ReactNode }) {
  const { introDone, titleInNavbar } = useIntro();
  const visible = titleInNavbar || introDone;
  return (
    <div
      className="min-h-screen transition-opacity duration-500 ease-out"
      style={{
        opacity: visible ? 1 : 0,
        pointerEvents: introDone ? "auto" : "none",
      }}
    >
      <Header />
      {children}
      <Footer />
    </div>
  );
}

function IntroAndContent({ children }: { children: React.ReactNode }) {
  const { introDone } = useIntro();
  return (
    <AnimatePresence mode="wait">
      {!introDone && <IntroLoader key="intro" />}
      <ContentWithFade>{children}</ContentWithFade>
    </AnimatePresence>
  );
}

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <IntroProvider>
      <LayoutGroup>
        <IntroAndContent>{children}</IntroAndContent>
      </LayoutGroup>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
    </IntroProvider>
  );
}
