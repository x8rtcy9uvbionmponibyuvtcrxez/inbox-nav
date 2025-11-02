import { SignInPanel } from "@/components/auth/SignInPanel";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(34,34,42,0.85)_0%,_#060608_65%)] px-4">
      <SignInPanel />
    </div>
  );
}
