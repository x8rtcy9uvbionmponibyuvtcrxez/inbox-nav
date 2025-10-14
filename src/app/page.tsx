import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Welcome to Inbox Nav
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            A modern inbox navigation app with secure authentication
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <SignedOut>
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Get Started
              </h2>
              <p className="text-gray-600 mb-6">
                Sign in or create an account to access your personalized inbox navigation.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <SignInButton mode="modal">
                  <button className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
                    Sign Up
                  </button>
                </SignUpButton>
              </div>
            </div>
          </SignedOut>

          <SignedIn>
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Welcome back!
              </h2>
              <p className="text-gray-600 mb-6">
                You&apos;re successfully signed in. Your inbox navigation is ready to use.
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800">
                  ✅ Authentication successful! You can now access all features.
                </p>
              </div>
            </div>
          </SignedIn>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Secure Authentication
            </h3>
            <p className="text-gray-600">
              Powered by Clerk for enterprise-grade security and user management.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Modern UI
            </h3>
            <p className="text-gray-600">
              Built with Next.js 15 and Tailwind CSS for a beautiful, responsive experience.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Fast & Reliable
            </h3>
            <p className="text-gray-600">
              Optimized for performance with Turbopack and modern web standards.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
