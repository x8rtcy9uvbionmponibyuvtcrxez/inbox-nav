"use client";

export const dynamic = 'force-dynamic';

import { useState, useMemo, useEffect, Suspense } from "react";
import { saveOnboardingAction } from "@/app/onboarding/actions";
import { useRouter, useSearchParams } from "next/navigation";
import TagInput from "./components/TagInput";
import ErrorBoundary from "@/components/ErrorBoundary";

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

  // Step 1 (Business info only; domain config moved to /checkout/configure)
  const [inboxCount, setInboxCount] = useState<number>(10);
  const [businessName, setBusinessName] = useState("");
  const [primaryForwardUrl, setPrimaryForwardUrl] = useState("");
  
  // Step 1 - Domain & Registrar fields (for OWN domains from checkout)
  const [domainSource, setDomainSource] = useState<string | null>(null);
  const [ownDomainsRaw, setOwnDomainsRaw] = useState("");
  const [domainRegistrar, setDomainRegistrar] = useState("");
  const [registrarOtherName, setRegistrarOtherName] = useState("");
  const [registrarUsername, setRegistrarUsername] = useState("");
  const [registrarPassword, setRegistrarPassword] = useState("");
  const [showRegistrarPassword, setShowRegistrarPassword] = useState(false);

  // Step 2
  const [numPersonas, setNumPersonas] = useState<number>(1);
  const [personas, setPersonas] = useState<Persona[]>([{ firstName: "", lastName: "", profileImage: null }]);

  // Step 3
  const [warmupTool, setWarmupTool] = useState<"Smartlead" | "Instantly" | "Plusvibe" | "EmailBison" | "Other">("Smartlead");
  const [warmupToolOther, setWarmupToolOther] = useState("");
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
        
        // Extract domain source from session metadata if available
        const metadata = (data as { metadata?: Record<string, unknown> }).metadata;
        if (metadata && typeof metadata.domainSource === 'string') {
          setDomainSource(metadata.domainSource);
          console.log('[ONBOARDING] Domain source from metadata:', metadata.domainSource);
        }
      } else {
        console.error('[ONBOARDING] Failed to fetch session data (non-OK response)');
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 410) {
          setError('Your checkout session has expired. Please start a new order.');
        } else if (response.status === 404) {
          setError('Checkout session not found. Please start a new order.');
        } else if (response.status === 403) {
          setError('This session does not belong to you. Please sign in with the correct account.');
        } else {
          setError(errorData.error || 'Failed to load payment information');
        }
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
      
      // For PREWARMED, collect forwarding URL here
      if (productType === 'PREWARMED' && !primaryForwardUrl.trim()) return false;
      
      // For OWN domains (Google/Microsoft), validate domain list, forwarding URL, and registrar credentials
      if (domainSource === 'OWN' && (productType === 'GOOGLE' || productType === 'MICROSOFT')) {
        if (!ownDomainsRaw.trim()) return false; // Must have domains
        if (!primaryForwardUrl.trim()) return false; // Must have forwarding URL
        if (!domainRegistrar) return false; // Must select registrar
        if (domainRegistrar === 'Other' && !registrarOtherName.trim()) return false; // Must specify registrar name if "Other"
        if (!registrarUsername.trim()) return false; // Must have username
        if (!registrarPassword.trim()) return false; // Must have password
        
        // Validate that domain list has actual domains
        const domains = ownDomainsRaw.split('\n').map(d => d.trim()).filter(Boolean);
        if (domains.length === 0) return false; // Must have at least one domain
      }
      
      // For BUY_FOR_ME, collect forwarding URL
      if (domainSource === 'BUY_FOR_ME' && !primaryForwardUrl.trim()) return false;
    }
    if (step === 2) {
      if (numPersonas < 1) return false;
      for (const p of personas.slice(0, numPersonas)) {
        if (!p.firstName.trim() || !p.lastName.trim()) return false;
      }
    }
    if (step === 3) {
      if (!warmupTool) return false;
      if (warmupTool === 'Other' && !warmupToolOther.trim()) return false;
      if (!accountId.trim()) return false;
      if (!password.trim()) return false;
      if (!apiKey.trim()) return false;
    }
    return true;
  }, [step, inboxCount, businessName, primaryForwardUrl, domainSource, ownDomainsRaw, domainRegistrar, registrarOtherName, registrarUsername, registrarPassword, numPersonas, personas, warmupTool, warmupToolOther, accountId, password, apiKey, productType]);

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
    
    const ownDomains = ownDomainsRaw.split('\n').map(d => d.trim()).filter(Boolean);
    
    const formData = {
      inboxCount,
      businessName,
      primaryForwardUrl,
      domainSource: (domainSource === 'OWN' || domainSource === 'BUY_FOR_ME') ? domainSource as 'OWN' | 'BUY_FOR_ME' : undefined,
      ownDomains: domainSource === 'OWN' ? ownDomains : undefined,
      domainRegistrar: domainSource === 'OWN' ? (domainRegistrar === 'Other' ? registrarOtherName : domainRegistrar) : undefined,
      registrarUsername: domainSource === 'OWN' ? registrarUsername : undefined,
      registrarPassword: domainSource === 'OWN' ? registrarPassword : undefined,
      personas: personas.slice(0, numPersonas),
      warmupTool: warmupTool === 'Other' ? warmupToolOther : warmupTool,
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
    <ErrorBoundary>
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
              <h2 className="text-xl font-semibold">Business Info</h2>
              
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
              </div>
              <div>
                <label className="block text-sm mb-2">Business name</label>
                <input
                  className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., Acme Corp"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  required
                />
              </div>

              {/* For PREWARMED only, show forwarding URL on Step 1 */}
              {productType === 'PREWARMED' && (
                <div>
                  <label className="block text-sm mb-2">Primary forwarding URL</label>
                  <input
                    className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="https://yourbusiness.com"
                    value={primaryForwardUrl}
                    onChange={(e) => setPrimaryForwardUrl(e.target.value)}
                    required
                  />
                </div>
              )}

              {/* For OWN domains (Google/Microsoft), collect domain list and registrar credentials */}
              {domainSource === 'OWN' && (productType === 'GOOGLE' || productType === 'MICROSOFT') && (
                <>
                  <div>
                    <label className="block text-sm mb-2">Your Domains</label>
                    <textarea
                      className="w-full h-28 rounded-md bg-gray-800 border border-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Enter your domains, one per line&#10;example1.com&#10;example2.com&#10;example3.com"
                      value={ownDomainsRaw}
                      onChange={(e) => setOwnDomainsRaw(e.target.value)}
                      required
                    />
                    <div className="text-xs text-gray-400 mt-1">
                      {ownDomainsRaw.split('\n').filter(d => d.trim()).length} domains provided
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm mb-2">Primary forwarding URL</label>
                    <input
                      className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="yourbusiness.com or https://yourbusiness.com"
                      value={primaryForwardUrl}
                      onChange={(e) => setPrimaryForwardUrl(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-2">Domain Registrar</label>
                    <select
                      className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={domainRegistrar}
                      onChange={(e) => setDomainRegistrar(e.target.value)}
                      required
                    >
                      <option value="">Select your registrar...</option>
                      <option value="Cloudflare">Cloudflare</option>
                      <option value="Godaddy">Godaddy</option>
                      <option value="Porkbun">Porkbun</option>
                      <option value="Namecheap">Namecheap</option>
                      <option value="Hostinger">Hostinger</option>
                      <option value="Bluehost">Bluehost</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {domainRegistrar === 'Other' && (
                    <div>
                      <label className="block text-sm mb-2">Registrar Name</label>
                      <input
                        className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Enter the name of your registrar"
                        value={registrarOtherName}
                        onChange={(e) => setRegistrarOtherName(e.target.value)}
                        required
                      />
                </div>
              )}

                  <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-4">
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-blue-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-blue-300 mb-1">Important: Admin Access Required</p>
                        <p className="text-sm text-blue-200">
                          Please invite <span className="font-mono font-semibold">team@inboxnavigator.com</span> as an admin to your {domainRegistrar || 'domain registrar'} account. This enables us to configure DNS records and manage your domains for optimal email delivery.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm mb-2">Registrar Login Username</label>
                    <input
                      className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Your registrar account username"
                      value={registrarUsername}
                      onChange={(e) => setRegistrarUsername(e.target.value)}
                      required
                    />
                  </div>

                <div>
                    <label className="block text-sm mb-2">Registrar Login Password</label>
                    <div className="relative">
                      <input
                        type={showRegistrarPassword ? "text" : "password"}
                        className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Your registrar account password"
                        value={registrarPassword}
                        onChange={(e) => setRegistrarPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegistrarPassword(!showRegistrarPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                      >
                        {showRegistrarPassword ? (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      This information is encrypted and securely stored
                    </div>
                </div>
                </>
              )}

              {/* For BUY_FOR_ME, collect forwarding URL */}
              {domainSource === 'BUY_FOR_ME' && (productType === 'GOOGLE' || productType === 'MICROSOFT') && (
              <div>
                <label className="block text-sm mb-2">Primary forwarding URL</label>
                <input
                  className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="yourbusiness.com or https://yourbusiness.com"
                  value={primaryForwardUrl}
                  onChange={(e) => setPrimaryForwardUrl(e.target.value)}
                  required
                />
              </div>
              )}
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
                        placeholder="e.g., John"
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
                        placeholder="e.g., Smith"
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
                  onChange={(e) => setWarmupTool(e.target.value as "Smartlead" | "Instantly" | "Plusvibe" | "EmailBison" | "Other")}
                  className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option>Select warmup tool...</option>
                  <option>Smartlead</option>
                  <option>Instantly</option>
                  <option>Plusvibe</option>
                  <option>EmailBison</option>
                  <option>Other</option>
                </select>
              </div>

              {warmupTool === 'Other' && (
                <div>
                  <label className="block text-sm mb-2">Warmup Tool Name</label>
                  <input
                    type="text"
                    className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter the name of your warmup tool"
                    value={warmupToolOther}
                    onChange={(e) => setWarmupToolOther(e.target.value)}
                    required
                  />
                </div>
              )}
              <div>
                <label className="block text-sm mb-2">Account ID</label>
                <input
                  type="text"
                  className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Your warmup tool account ID"
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
                  placeholder="Your account password"
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
                  placeholder="Your API key"
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
                  placeholder="marketing, outbound, team-alpha (comma separated)"
                />
              </div>
              <div>
                <label className="block text-sm mb-2">ESP tags</label>
                <TagInput
                  tags={espTags}
                  onChange={setEspTags}
                  placeholder="warmup, primary, high-priority (comma separated)"
                />
              </div>
              <div>
                <label className="block text-sm mb-2">Special requirements</label>
                <textarea
                  className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 h-28 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={specialRequirements}
                  placeholder="Any special instructions or requirements..."
                  onChange={(e) => setSpecialRequirements(e.target.value)}
                />
              </div>

              <div className="bg-gray-800 border border-gray-700 rounded-md p-4 text-sm space-y-2">
                <div className="font-medium text-gray-200">Summary</div>
                <div>Inboxes: {inboxCount}</div>
                <div>Business: {businessName}</div>
                <div>Primary URL: {primaryForwardUrl}</div>
                {/* Domain configuration was completed during checkout configuration */}
                <div>Personas: {numPersonas}</div>
                <div>Warmup tool: {warmupTool === 'Other' ? warmupToolOther : warmupTool}</div>
                <div>Account ID: {accountId}</div>
                {internalTags.length > 0 && <div>Internal tags: {internalTags.join(", ")}</div>}
                {espTags.length > 0 && <div>ESP tags: {espTags.join(", ")}</div>}
              </div>
            </div>
          )}

          {error && (
            <div className="mt-6 p-4 rounded-lg border border-red-500/20 bg-red-500/10">
              <div className="text-sm text-red-400 mb-3">{error}</div>
              {(error.includes('expired') || error.includes('not found') || error.includes('does not belong')) && (
                <div className="flex gap-3">
                  <button
                    onClick={() => window.location.href = '/dashboard/products'}
                    className="px-4 py-2 rounded-md bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors"
                  >
                    Start New Order
                  </button>
                  <button
                    onClick={() => setError(null)}
                    className="px-4 py-2 rounded-md border border-gray-600 text-gray-300 text-sm hover:bg-gray-800 transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </div>
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
    </ErrorBoundary>
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
