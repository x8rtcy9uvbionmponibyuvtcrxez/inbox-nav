import { redirect } from "next/navigation";
import { SignIn } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import FadeIn from "@/components/animations/FadeIn";
import PageTransition from "@/components/animations/PageTransition";
import { clerkDarkAppearance } from "@/lib/clerkAppearance";

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <div className="app-shell">
          <div className="flex min-h-screen items-center justify-center">
            <div className="w-full max-w-md">
              <FadeIn delay={0.2}>
                <div className="text-center mb-8">
                  <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-4">
                    Inbox Navigator
                  </h1>
                  <p className="text-lg text-[var(--text-secondary)]">
                    Email inbox management platform
                  </p>
                </div>
              </FadeIn>
              <FadeIn delay={0.4} direction="up">
                <SignIn
                  routing="hash"
                  signUpUrl="/sign-up"
                  appearance={clerkDarkAppearance}
                />
              </FadeIn>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
