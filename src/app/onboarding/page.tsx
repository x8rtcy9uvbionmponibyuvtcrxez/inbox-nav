"use client";

export const dynamic = 'force-dynamic';

import { useState, useMemo, useEffect, Suspense } from "react";
import { saveOnboardingAction } from "@/app/onboarding/actions";
import { useRouter, useSearchParams } from "next/navigation";
import TagInput from "./components/TagInput";

type Persona = { firstName: string; lastName: string; profileImage?: string | null };

function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL parameters
  const [productType, setProductType] = useState<string | null>(null);
  const [isQuantityLocked, setIsQuantityLocked] = useState(false);
  const [sessionData, setSessionData] = useState<{
    sessionId: string;
    productType: string;
    quantity: number;
    paymentStatus: string;
    customerEmail: string;
  } | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(false);

  // Step 1
  const [inboxCount, setInboxCount] = useState<number>(10);
  const [businessName, setBusinessName] = useState("");
  const [domainSource, setDomainSource] = useState<'OWN' | 'BUY_FOR_ME'>('BUY_FOR_ME');
  const [inboxesPerDomain, setInboxesPerDomain] = useState<number>(3);
  const [providedDomains, setProvidedDomains] = useState<string[]>([]);
  const [domainListRaw, setDomainListRaw] = useState("");
  const [primaryForwardUrl, setPrimaryForwardUrl] = useState("");

  // Step 2
  const [numPersonas, setNumPersonas] = useState<number>(1);
  const [personas, setPersonas] = useState<Persona[]>([{ firstName: "", lastName: "", profileImage: null }]);

  // Step 3
  const [warmupTool, setWarmupTool] = useState<"Smartlead" | "Instantly" | "Plusvibe" | "EmailBison">("Smartlead");
  const [accountId, setAccountId] = useState("");
  const [password, setPassword] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [notes, setNotes] = useState("");

  // Step 4
  const [specialRequirements, setSpecialRequirements] = useState("");
  const [internalTags, setInternalTags] = useState<string[]>([]);
  const [espTags, setEspTags] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Read URL parameters on component mount
  useEffect(() => {
    const product = searchParams.get('product');
    const quantity = searchParams.get('quantity');
    const sessionId = searchParams.get('session_id');
    
    // Handle direct product selection (from products page)
    if (product && quantity) {
      const quantityNum = parseInt(quantity);
      if (quantityNum >= 10 && quantityNum <= 2000) {
        setProductType(product);
        setInboxCount(quantityNum);
        setIsQuantityLocked(true);
      }
    }
    
    // Handle Stripe checkout completion
    if (sessionId) {
      fetchSessionData(sessionId);
    }
  }, [searchParams]);

  const fetchSessionData = async (sessionId: string) => {
    console.log('[ONBOARDING] Fetching session...', { sessionId });
    setIsLoadingSession(true);
    try {
      const url = `/api/get-session?session_id=${sessionId}`;
      console.log('[ONBOARDING] GET', url);
      const response = await fetch(url);
      console.log('[ONBOARDING] Session fetch status:', response.status);
      const data = await response.json() as {
        sessionId: string;
        productType: string;
        quantity: number;
        paymentStatus: string;
        customerEmail: string;
      };
      console.log('[ONBOARDING] Session fetch data:', data);

      if (response.ok) {
        console.log('[ONBOARDING] Applying session data to form state');
        setSessionData(data);
        setProductType(data.productType);
        setInboxCount(data.quantity);
        setIsQuantityLocked(true);
      } else {
        console.error('[ONBOARDING] Failed to fetch session data (non-OK response)');
        setError('Failed to load payment information');
      }
    } catch (error) {
      console.error('[ONBOARDING] Error fetching session data:', error);
      if (error instanceof Error) console.error('[ONBOARDING] Error stack:', error.stack);
      setError('Failed to load payment information');
    } finally {
      setIsLoadingSession(false);
      console.log('[ONBOARDING] Done fetching session');
    }
  };

  const parsedDomains = useMemo(() => {
    return domainListRaw
      .split("\n")
      .map((d) => d.trim())
      .filter(Boolean);
  }, [domainListRaw]);

  const getProductDisplayName = (productType: string | null) => {
    switch (productType) {
      case 'GOOGLE': return 'Google Inboxes';
      case 'PREWARMED': return 'Prewarmed Inboxes';
      case 'MICROSOFT': return 'Microsoft Inboxes';
      default: return 'Unknown Product';
    }
  };

  const canNext = useMemo(() => {
    if (step === 1) {
      if (inboxCount < 10 || inboxCount > 2000) return false;
      if (!businessName.trim()) return false;
      if (!primaryForwardUrl.trim()) return false;
      if (domainSource === 'OWN' && parsedDomains.length === 0) return false;
    }
    if (step === 2) {
      if (numPersonas < 1) return false;
      for (const p of personas.slice(0, numPersonas)) {
        if (!p.firstName.trim() || !p.lastName.trim()) return false;
      }
    }
    if (step === 3) {
      if (!warmupTool) return false;
      if (!accountId.trim()) return false;
      if (!password.trim()) return false;
      if (!apiKey.trim()) return false;
    }
    return true;
  }, [step, inboxCount, businessName, primaryForwardUrl, domainSource, parsedDomains.length, numPersonas, personas, warmupTool, accountId, password, apiKey]);

  const handlePersonaCountChange = (value: number) => {
    const next = Math.max(1, Math.min(20, value || 1));
    setNumPersonas(next);
    setPersonas((prev) => {
      const copy = [...prev];
      while (copy.length < next) copy.push({ firstName: "", lastName: "", profileImage: null });
      return copy.slice(0, next);
    });
  };

  const handleImageChange = async (index: number, file: File | null) => {
    if (!file) {
      setPersonas((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], profileImage: null };
        return next;
      });
      return;
    }
    const base64 = await fileToBase64(file);
    setPersonas((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], profileImage: base64 };
      return next;
    });
  };

  const goNext = () => setStep((s) => Math.min(4, s + 1));
  const goPrev = () => setStep((s) => Math.max(1, s - 1));

  const handleSubmit = async () => {
    console.log('[ONBOARDING] Handle submit start');
    setLoading(true);
    setError(null);
    
    const formData = {
      inboxCount,
      businessName,
      domainSource,
      inboxesPerDomain,
      providedDomains: domainSource === 'OWN' ? parsedDomains : [],
      primaryForwardUrl,
      personas: personas.slice(0, numPersonas),
      warmupTool,
      accountId,
      password,
      apiKey,
      notes,
      specialRequirements,
      internalTags,
      espTags,
      productType: productType || undefined,
      sessionId: sessionData?.sessionId || undefined,
    };

    try {
      console.log('[ONBOARDING] Payload summary:', {
        inboxCount,
        businessName,
        domainSource,
        domainListCount: domainSource === 'OWN' ? parsedDomains.length : 0,
        personaCount: personas.length,
        warmupTool,
        internalTagsCount: internalTags.length,
        espTagsCount: espTags.length,
        hasSessionId: Boolean(sessionData?.sessionId),
        productType,
      });
      console.log('[ONBOARDING] Calling saveOnboardingAction...');
      
        const result = await saveOnboardingAction(formData) as {
          success: boolean;
          error?: string;
          orderId?: string;
          onboardingId?: string;
        };
      
      console.log('[ONBOARDING] Server response:', result);
      
      if (result?.success) {
        console.log("✅ Submission successful, redirecting to dashboard");
        router.push("/dashboard");
      } else {
        console.error("❌ Submission failed with error:", result?.error);
        const errorMessage = result?.error || "Failed to save onboarding data. Please try again.";
        setError(errorMessage);
        alert("Submission failed: " + errorMessage);
        setLoading(false);
      }
    } catch (error: unknown) {
      console.error('[ONBOARDING] Client error during submit:', error);
      if (error instanceof Error) console.error('[ONBOARDING] Client error stack:', error.stack);
      const errorMessage = error instanceof Error ? error.message : "Unexpected error";
      setError(errorMessage);
      alert("Submission failed: " + errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-3xl">
        <div className="mb-6 text-sm text-gray-300">Step {step} of 4</div>
        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden mb-8">
          <div
            className="h-full bg-indigo-500 transition-all"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-lg p-6">
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Domain Setup</h2>
              
              {/* Product Selection Badge */}
              {productType && isQuantityLocked && (
                <div className={`p-4 rounded-lg border ${
                  sessionData 
                    ? 'bg-green-500/20 border-green-500/30' 
                    : 'bg-blue-500/20 border-blue-500/30'
                }`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      sessionData ? 'bg-green-400' : 'bg-blue-400'
                    }`}></div>
                    <span className={`font-medium ${
                      sessionData ? 'text-green-300' : 'text-blue-300'
                    }`}>
                      {sessionData ? '✅ Payment Complete - ' : 'Selected: '}
                      {getProductDisplayName(productType)} ({inboxCount} inboxes)
                    </span>
                  </div>
                  <p className={`text-sm mt-1 ${
                    sessionData ? 'text-green-200' : 'text-blue-200'
                  }`}>
                    {sessionData 
                      ? 'Your payment was successful! Complete the setup below.'
                      : 'Quantity is locked based on your product selection'
                    }
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm mb-2">Number of inboxes</label>
                <input
                  type="number"
                  min={10}
                  max={2000}
                  value={inboxCount}
                  onChange={(e) => !isQuantityLocked && setInboxCount(parseInt(e.target.value, 10) || 10)}
                  disabled={isQuantityLocked || isLoadingSession}
                  className={`w-full rounded-md border border-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isQuantityLocked 
                      ? 'bg-gray-800 cursor-not-allowed opacity-70' 
                      : 'bg-gray-800'
                  }`}
                  required
                />
                {isQuantityLocked && (
                  <p className="mt-2 text-sm text-blue-400">Quantity is locked based on your product selection.</p>
                )}
              </div>
              <div>
                <label className="block text-sm mb-2">Business name</label>
                <input
                  className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm">Domain source</label>
                <div className="flex gap-6 text-sm">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      name="domainSource"
                      checked={domainSource === 'BUY_FOR_ME'}
                      onChange={() => setDomainSource('BUY_FOR_ME')}
                    />
                    Buy new domains for me
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      name="domainSource"
                      checked={domainSource === 'OWN'}
                      onChange={() => setDomainSource('OWN')}
                    />
                    I have my own domains
                  </label>
                </div>
              </div>
              {productType === 'GOOGLE' && (
                <div>
                  <label className="block text-sm mb-2">Inboxes per domain (Google only)</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={inboxesPerDomain}
                    onChange={(e) => setInboxesPerDomain(Math.max(1, Math.min(10, parseInt(e.target.value) || 3)))}
                    className="w-32 rounded-md bg-gray-800 border border-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <p className="text-sm text-gray-400 mt-1">Recommended: 3 inboxes per domain</p>
                </div>
              )}
              {domainSource === 'BUY_FOR_ME' && (
                <div className="bg-blue-500/10 border border-blue-500/30 text-blue-200 rounded p-4 text-sm">
                  We will purchase approximately {Math.ceil(inboxCount / Math.max(1, (productType === 'GOOGLE' ? inboxesPerDomain : 5)))} domains and set up your inboxes within 24-48 hours.
                </div>
              )}
              {domainSource === 'OWN' && (
                <div>
                  <label className="block text-sm mb-2">Domain list (one per line)</label>
                  <textarea
                    className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 h-28 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={domainListRaw}
                    onChange={(e) => setDomainListRaw(e.target.value)}
                    placeholder="example1.com\nexample2.com"
                  />
                  <p className="text-sm text-gray-400 mt-1">{parsedDomains.length} domains added</p>
                </div>
              )}
              <div>
                <label className="block text-sm mb-2">Primary forwarding URL</label>
                <input
                  className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={primaryForwardUrl}
                  onChange={(e) => setPrimaryForwardUrl(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Persona Setup</h2>
              <div>
                <label className="block text-sm mb-2">Number of personas</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={numPersonas}
                  onChange={(e) => handlePersonaCountChange(parseInt(e.target.value, 10))}
                  className="w-28 rounded-md bg-gray-800 border border-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="space-y-4">
                {Array.from({ length: numPersonas }).map((_, idx) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                    <div>
                      <label className="block text-sm mb-2">First name</label>
                      <input
                        className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={personas[idx]?.firstName ?? ""}
                        onChange={(e) =>
                          setPersonas((prev) => {
                            const next = [...prev];
                            next[idx] = { ...next[idx], firstName: e.target.value };
                            return next;
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-2">Last name</label>
                      <input
                        className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={personas[idx]?.lastName ?? ""}
                        onChange={(e) =>
                          setPersonas((prev) => {
                            const next = [...prev];
                            next[idx] = { ...next[idx], lastName: e.target.value };
                            return next;
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-2">Profile image</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(idx, e.target.files?.[0] ?? null)}
                        className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-indigo-600 file:text-white hover:file:bg-indigo-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Warmup Tool Integration</h2>
              <div>
                <label className="block text-sm mb-2">Warmup tool</label>
                <select
                  value={warmupTool}
                  onChange={(e) => setWarmupTool(e.target.value as "Smartlead" | "Instantly" | "Plusvibe" | "EmailBison")}
                  className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option>Smartlead</option>
                  <option>Instantly</option>
                  <option>Plusvibe</option>
                  <option>EmailBison</option>
                </select>
              </div>
              <div>
                <label className="block text-sm mb-2">Account ID</label>
                <input
                  type="text"
                  className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-2">Password</label>
                <input
                  type="password"
                  className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-2">API Key</label>
                <input
                  type="text"
                  className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-2">Additional notes (optional)</label>
                <textarea
                  className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 h-24 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Final Review & Submit</h2>
              <div>
                <label className="block text-sm mb-2">Internal tags</label>
                <TagInput
                  tags={internalTags}
                  onChange={setInternalTags}
                  placeholder="e.g., high-priority, tech-company"
                />
              </div>
              <div>
                <label className="block text-sm mb-2">ESP tags</label>
                <TagInput
                  tags={espTags}
                  onChange={setEspTags}
                  placeholder="e.g., campaign-a, outreach-2024"
                />
              </div>
              <div>
                <label className="block text-sm mb-2">Special requirements</label>
                <textarea
                  className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 h-28 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={specialRequirements}
                  onChange={(e) => setSpecialRequirements(e.target.value)}
                />
              </div>

              <div className="bg-gray-800 border border-gray-700 rounded-md p-4 text-sm space-y-2">
                <div className="font-medium text-gray-200">Summary</div>
                <div>Inboxes: {inboxCount}</div>
                <div>Business: {businessName}</div>
                <div>Primary URL: {primaryForwardUrl}</div>
                <div>Domain source: {domainSource === 'BUY_FOR_ME' ? 'Buy new domains' : 'Own domains'}</div>
                {domainSource === 'OWN' && (
                  <div>Domains: {parsedDomains.join(", ") || "-"}</div>
                )}
                <div>Personas: {numPersonas}</div>
                <div>Warmup tool: {warmupTool}</div>
                <div>Account ID: {accountId}</div>
                {internalTags.length > 0 && <div>Internal tags: {internalTags.join(", ")}</div>}
                {espTags.length > 0 && <div>ESP tags: {espTags.join(", ")}</div>}
              </div>
            </div>
          )}

          {error && (
            <div className="mt-6 text-sm text-red-400">{error}</div>
          )}

          <div className="mt-8 flex items-center justify-between">
            <button
              className="px-4 py-2 rounded-md bg-gray-800 border border-gray-700 text-gray-300 disabled:opacity-50"
              onClick={goPrev}
              disabled={step === 1 || loading}
            >
              Previous
            </button>
            {step < 4 ? (
              <button
                className="px-4 py-2 rounded-md bg-indigo-600 text-white disabled:opacity-50"
                onClick={goNext}
                disabled={!canNext || loading}
              >
                Next
              </button>
            ) : (
              <button
                className="px-4 py-2 rounded-md bg-green-600 text-white disabled:opacity-50 flex items-center gap-2"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading && (
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent" />
                )}
                Submit
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OnboardingPageWrapper() {
  return (
    <Suspense fallback={<div className="p-6 text-gray-400">Loading...</div>}>
      <OnboardingPage />
    </Suspense>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}


