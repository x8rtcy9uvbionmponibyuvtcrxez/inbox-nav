"use client";

export const dynamic = 'force-dynamic';

import { useState, useMemo, useEffect, Suspense } from "react";
import { saveOnboardingAction } from "@/app/onboarding/actions";
import { useRouter, useSearchParams } from "next/navigation";
import TagInput from "./components/TagInput";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Button } from "@/components/ui/Button";

type Persona = { firstName: string; lastName: string; profileImage?: string | null };

const STEP_META = [
  {
    id: 1,
    title: 'Workspace Basics',
    caption: 'Context about your brand and access so we can configure your fleet confidently.',
  },
  {
    id: 2,
    title: 'Personas & Tone',
    caption: 'Define the humans behind the inboxes so signatures and copy feel authentic.',
  },
  {
    id: 3,
    title: 'Warmup & Tools',
    caption: 'Securely hand off ESP credentials so we can plug into your existing stack.',
  },
  {
    id: 4,
    title: 'Review & Confirm',
    caption: 'Tag your fleet, leave notes, and confirm launch details before we provision.',
  },
] as const;

const STORAGE_NAMESPACE = 'inbox-nav:onboarding';

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
  const [hasLoadedDraft, setHasLoadedDraft] = useState(false);

  const storageKey = useMemo(() => {
    const sessionKey = sessionData?.sessionId ?? 'manual';
    return `${STORAGE_NAMESPACE}:${sessionKey}`;
  }, [sessionData?.sessionId]);

  useEffect(() => {
    setHasLoadedDraft(false);
  }, [storageKey]);

  useEffect(() => {
    if (hasLoadedDraft || typeof window === 'undefined') return;
    try {
      const rawDraft = window.localStorage.getItem(storageKey);
      if (!rawDraft) {
        setHasLoadedDraft(true);
        return;
      }
      const draft = JSON.parse(rawDraft) as Record<string, unknown>;
      if (typeof draft.step === 'number') setStep(Math.min(4, Math.max(1, draft.step)));
      if (typeof draft.inboxCount === 'number' && !isQuantityLocked) setInboxCount(draft.inboxCount);
      if (typeof draft.businessName === 'string') setBusinessName(draft.businessName);
      if (typeof draft.primaryForwardUrl === 'string') setPrimaryForwardUrl(draft.primaryForwardUrl);
      if (typeof draft.domainSource === 'string') setDomainSource(draft.domainSource);
      if (typeof draft.ownDomainsRaw === 'string') setOwnDomainsRaw(draft.ownDomainsRaw);
      if (typeof draft.domainRegistrar === 'string') setDomainRegistrar(draft.domainRegistrar);
      if (typeof draft.registrarOtherName === 'string') setRegistrarOtherName(draft.registrarOtherName);
      if (typeof draft.registrarUsername === 'string') setRegistrarUsername(draft.registrarUsername);
      if (typeof draft.registrarPassword === 'string') setRegistrarPassword(draft.registrarPassword);
      if (typeof draft.numPersonas === 'number') setNumPersonas(Math.min(20, Math.max(1, draft.numPersonas)));
      if (Array.isArray(draft.personas)) setPersonas(draft.personas as Persona[]);
      if (typeof draft.warmupTool === 'string' && ['Smartlead', 'Instantly', 'Plusvibe', 'EmailBison', 'Other'].includes(draft.warmupTool)) {
        setWarmupTool(draft.warmupTool as typeof warmupTool);
      }
      if (typeof draft.warmupToolOther === 'string') setWarmupToolOther(draft.warmupToolOther);
      if (typeof draft.accountId === 'string') setAccountId(draft.accountId);
      if (typeof draft.password === 'string') setPassword(draft.password);
      if (typeof draft.apiKey === 'string') setApiKey(draft.apiKey);
      if (typeof draft.notes === 'string') setNotes(draft.notes);
      if (typeof draft.specialRequirements === 'string') setSpecialRequirements(draft.specialRequirements);
      if (Array.isArray(draft.internalTags)) setInternalTags(draft.internalTags as string[]);
      if (Array.isArray(draft.espTags)) setEspTags(draft.espTags as string[]);
    } catch (draftError) {
      console.warn('[ONBOARDING] Failed to restore draft', draftError);
    } finally {
      setHasLoadedDraft(true);
    }
  }, [hasLoadedDraft, storageKey, isQuantityLocked]);

  const draftState = useMemo(
    () =>
      JSON.stringify({
        step,
        inboxCount,
        businessName,
        primaryForwardUrl,
        domainSource,
        ownDomainsRaw,
        domainRegistrar,
        registrarOtherName,
        registrarUsername,
        registrarPassword,
        numPersonas,
        personas,
        warmupTool,
        warmupToolOther,
        accountId,
        password,
        apiKey,
        notes,
        specialRequirements,
        internalTags,
        espTags,
      }),
    [
      step,
      inboxCount,
      businessName,
      primaryForwardUrl,
      domainSource,
      ownDomainsRaw,
      domainRegistrar,
      registrarOtherName,
      registrarUsername,
      registrarPassword,
      numPersonas,
      personas,
      warmupTool,
      warmupToolOther,
      accountId,
      password,
      apiKey,
      notes,
      specialRequirements,
      internalTags,
      espTags,
    ]
  );

  useEffect(() => {
    if (!hasLoadedDraft || typeof window === 'undefined') return;
    window.localStorage.setItem(storageKey, draftState);
  }, [hasLoadedDraft, storageKey, draftState]);

  // Block back navigation after onboarding completion
  useEffect(() => {
    // Check if onboarding was already completed and redirect
    const hasCompletedOnboarding = typeof window !== 'undefined' && 
      window.localStorage.getItem('onboarding-completed');
    if (hasCompletedOnboarding) {
      router.push('/dashboard');
      return;
    }

    const handlePopState = (e: PopStateEvent) => {
      // Check if user is trying to go back to onboarding after completion
      const hasCompletedOnboarding = typeof window !== 'undefined' && 
        window.localStorage.getItem('onboarding-completed');
      if (hasCompletedOnboarding) {
        e.preventDefault();
        router.push('/dashboard');
        return;
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [router]);

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
  }
  return true;
}, [step, inboxCount, businessName, primaryForwardUrl, domainSource, ownDomainsRaw, domainRegistrar, registrarOtherName, registrarUsername, registrarPassword, numPersonas, personas, warmupTool, warmupToolOther, accountId, password, productType]);

const personaCountOptions = [1, 2, 3, 4];

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

const nextButtonLabels: Record<number, string> = {
  1: 'Continue to personas',
  2: 'Continue to warmup setup',
  3: 'Review & confirm',
};
const nextLabel = nextButtonLabels[step] ?? 'Next';
const hasProductSelection = Boolean(productType || sessionData?.productType);
const productDisplayName = getProductDisplayName(productType ?? sessionData?.productType ?? null);
const domainPlanSummary =
  !domainSource
    ? 'Domain plan was captured during checkout.'
    : domainSource === 'BUY_FOR_ME'
      ? 'Our team will purchase and configure the domains you selected during checkout.'
      : 'You will connect your existing domains so we can manage DNS and routing.';
const isOwnDomainFlow = domainSource === 'OWN' && (productType === 'GOOGLE' || productType === 'MICROSOFT');
const isBuyForMeFlow = domainSource === 'BUY_FOR_ME' && (productType === 'GOOGLE' || productType === 'MICROSOFT');
const currentStepTitle = STEP_META[step - 1]?.title ?? '';
const personaSummaryNames = personas
  .slice(0, numPersonas)
  .map((persona, index) => {
    const fullName = `${persona.firstName} ${persona.lastName}`.trim();
    return fullName || `Persona ${index + 1}`;
  })
  .join(', ');

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
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem(storageKey);
          // Mark onboarding as completed to prevent back navigation
          window.localStorage.setItem('onboarding-completed', 'true');
        }
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
    <div className="min-h-screen bg-gradient-to-br from-[#06040f] via-[#0b0d1f] to-[#050509] px-4 py-10 text-slate-100">
      <div className="mx-auto w-full max-w-4xl">
        <header className="mb-8 space-y-3 text-brand-primary">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand-muted-strong">
            Step {step} of {STEP_META.length}
          </p>
          <h1 className="text-3xl font-semibold text-brand-primary sm:text-4xl">Launch your inbox fleet</h1>
          <p className="max-w-3xl text-base text-brand-secondary">
            We’ll use these details to provision inboxes, align forwarding, and plug into your warmup tooling. Everything auto-saves in this browser so you can come back any time.
          </p>
          <p className="text-xs uppercase tracking-[0.25em] text-brand-muted-strong">Current focus: <span className="text-brand-primary">{currentStepTitle}</span></p>
        </header>

        <ol className="mb-8 grid gap-4 text-sm md:grid-cols-2 lg:grid-cols-4">
          {STEP_META.map((meta) => {
            const isActive = meta.id === step;
            const isCompleted = meta.id < step;
            return (
              <li
                key={meta.id}
                className={`rounded-2xl border p-4 transition ${
                  isActive ? 'border-white/50 bg-white/[0.08]' : isCompleted ? 'border-emerald-400/40 bg-emerald-500/10' : 'border-white/10 bg-white/[0.02]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                      isCompleted ? 'bg-emerald-400 text-emerald-950' : isActive ? 'bg-white text-black' : 'bg-white/10 text-brand-muted'
                    }`}
                  >
                    {isCompleted ? (
                      <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M16.704 5.29a1 1 0 0 1 .006 1.414l-7.25 7.334a1 1 0 0 1-1.438 0L3.29 9.225a1 1 0 1 1 1.418-1.41l3.13 3.147 6.53-6.598a1 1 0 0 1 1.336-.074z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      meta.id
                    )}
                  </span>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-brand-muted-strong">Step {meta.id}</p>
                    <p className="mt-1 text-sm font-semibold text-brand-primary">{meta.title}</p>
                  </div>
                </div>
                <p className="mt-3 text-sm text-brand-secondary">{meta.caption}</p>
              </li>
            );
          })}
        </ol>

        <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 shadow-[0_40px_90px_-60px_rgba(10,10,15,0.8)]">
          {step === 1 && (
            <div className="space-y-8">
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-white">Workspace basics</h2>
                <p className="text-sm text-white/60">
                  We’ll use this to configure forwarding, signatures, and DNS access. Nothing is shared outside the Inbox Navigator onboarding team.
                </p>
              </div>

              {hasProductSelection && (
                <div
                  className={`rounded-2xl border ${
                    sessionData ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-100' : 'border-indigo-400/30 bg-indigo-500/10 text-indigo-100'
                  } p-5`}
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.28em] opacity-70">{sessionData ? 'Checkout locked' : 'Selected plan'}</p>
                      <p className="mt-1 text-lg font-semibold">{productDisplayName}</p>
                      <p className="text-sm opacity-80">{inboxCount} inboxes / month</p>
                    </div>
                    {sessionData && (
                      <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-emerald-100">
                        Payment captured
                      </span>
                    )}
                  </div>
                  <p className="mt-3 text-xs text-white/75">
                    Need to change quantity or product? Visit <span className="font-medium">Dashboard → Products</span> to start a new checkout.
                  </p>
                </div>
              )}

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Monthly inbox volume</label>
                  <p className="text-xs text-white/50">We recommend at least 10 inboxes per product to keep warmup smooth.</p>
                  <input
                    type="number"
                    min={10}
                    max={2000}
                    value={inboxCount}
                    onChange={(e) => !isQuantityLocked && setInboxCount(parseInt(e.target.value, 10) || 10)}
                    disabled={isQuantityLocked || isLoadingSession}
                    className={`mt-2 w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white shadow-inner focus:border-white/40 focus:outline-none focus:ring-0 ${
                      isQuantityLocked ? 'cursor-not-allowed opacity-60' : ''
                    }`}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Business or sender name</label>
                  <p className="text-xs text-white/50">Appears in signatures and ownership records.</p>
                  <input
                    className="mt-2 w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white focus:border-white/40 focus:outline-none focus:ring-0"
                    placeholder="e.g. Acme Growth Studio"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    required
                  />
                </div>
              </div>

              {productType === 'PREWARMED' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Primary forwarding URL</label>
                  <p className="text-xs text-white/50">Tell us where replies should land once this fleet is warmed and live.</p>
                  <input
                    className="mt-2 w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white focus:border-white/40 focus:outline-none focus:ring-0"
                    placeholder="https://yourbusiness.com"
                    value={primaryForwardUrl}
                    onChange={(e) => setPrimaryForwardUrl(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Domain plan</h3>
                    <p className="text-sm text-white/60">{domainPlanSummary}</p>
                  </div>
                  {domainSource && (
                    <span className="inline-flex items-center rounded-full border border-white/15 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.25em] text-white/70">
                      {domainSource === 'BUY_FOR_ME' ? 'We buy for you' : 'Using your domains'}
                    </span>
                  )}
                </div>

                {isOwnDomainFlow ? (
                  <div className="space-y-5">
                    <div>
                      <label className="text-sm font-medium text-white">Domains we should use</label>
                      <p className="text-xs text-white/50">One per line. We’ll confirm DNS access before provisioning.</p>
                      <textarea
                        className="mt-2 h-28 w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white focus:border-white/40 focus:outline-none focus:ring-0"
                        placeholder="example1.com&#10;example2.io&#10;example3.net"
                        value={ownDomainsRaw}
                        onChange={(e) => setOwnDomainsRaw(e.target.value)}
                        required
                      />
                      <p className="mt-2 text-xs text-white/40">
                        {ownDomainsRaw.split('\n').filter((d) => d.trim()).length} domain(s) listed
                      </p>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white">Primary forwarding URL</label>
                        <p className="text-xs text-white/50">Where should warm inboxes forward once live?</p>
                        <input
                          className="mt-2 w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white focus:border-white/40 focus:outline-none focus:ring-0"
                          placeholder="https://yourbusiness.com"
                          value={primaryForwardUrl}
                          onChange={(e) => setPrimaryForwardUrl(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white">Registrar</label>
                        <select
                          className="mt-2 w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white focus:border-white/40 focus:outline-none focus:ring-0"
                          value={domainRegistrar}
                          onChange={(e) => setDomainRegistrar(e.target.value)}
                          required
                        >
                          <option value="">Select registrar…</option>
                          <option value="Cloudflare">Cloudflare</option>
                          <option value="Godaddy">GoDaddy</option>
                          <option value="Porkbun">Porkbun</option>
                          <option value="Namecheap">Namecheap</option>
                          <option value="Hostinger">Hostinger</option>
                          <option value="Bluehost">Bluehost</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    {domainRegistrar === 'Other' && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white">Registrar name</label>
                        <input
                          className="mt-2 w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white focus:border-white/40 focus:outline-none focus:ring-0"
                          placeholder="Who hosts these domains?"
                          value={registrarOtherName}
                          onChange={(e) => setRegistrarOtherName(e.target.value)}
                          required
                        />
                      </div>
                    )}

                    <div className="rounded-xl border border-blue-400/30 bg-blue-500/10 p-4 text-sm text-blue-100">
                      Please invite <span className="font-mono">team@inboxnavigator.com</span> as an admin to this registrar so we can configure DNS records.
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white">Registrar username</label>
                        <input
                          className="mt-2 w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white focus:border-white/40 focus:outline-none focus:ring-0"
                          placeholder="Login email or username"
                          value={registrarUsername}
                          onChange={(e) => setRegistrarUsername(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white">Registrar password</label>
                        <div className="relative">
                          <input
                            type={showRegistrarPassword ? "text" : "password"}
                            className="mt-2 w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 pr-12 text-sm text-white focus:border-white/40 focus:outline-none focus:ring-0"
                            placeholder="Stored securely & purged after setup"
                            value={registrarPassword}
                            onChange={(e) => setRegistrarPassword(e.target.value)}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowRegistrarPassword(!showRegistrarPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white/90"
                          >
                            {showRegistrarPassword ? (
                              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10L21 2m-5.5 11.5L21 19M10.5 6.5L3 14" />
                              </svg>
                            ) : (
                              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.808 9.818C4.773 6.744 7.985 4.75 12 4.75c4.016 0 7.228 1.994 9.193 5.068.282.443.282.971 0 1.414C19.228 14.306 16.016 16.3 12 16.3c-4.015 0-7.227-1.994-9.192-5.068a1.1 1.1 0 0 1 0-1.414z" />
                                <circle cx="12" cy="11" r="3.5" />
                              </svg>
                            )}
                          </button>
                        </div>
                        <p className="text-xs text-white/45">Only the onboarding team can view this and we remove it after DNS is configured.</p>
                      </div>
                    </div>
                  </div>
                ) : isBuyForMeFlow ? (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Primary forwarding URL</label>
                    <p className="text-xs text-white/50">Where should inboxes route once live? This can be a website, landing page, or shared mailbox.</p>
                    <input
                      className="mt-2 w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white focus:border-white/40 focus:outline-none focus:ring-0"
                      placeholder="https://yourbusiness.com"
                      value={primaryForwardUrl}
                      onChange={(e) => setPrimaryForwardUrl(e.target.value)}
                      required
                    />
                  </div>
                ) : (
                  <p className="text-sm text-white/55">
                    Domain configuration is locked from checkout. Reach out to <a className="text-white underline" href="mailto:contact@inboxnavigator.com">contact@inboxnavigator.com</a> if you need to adjust it.
                  </p>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8">
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-white">Personas & tone</h2>
                <p className="text-sm text-white/60">
                  Share who is sending email so we can align signatures, avatar images, and copy. We can manage up to 20 personas per fleet.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <label className="text-sm font-medium text-white">How many personas do you need?</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {personaCountOptions.map((option) => {
                      const isActive = numPersonas === option;
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => handlePersonaCountChange(option)}
                          className={`inline-flex h-9 w-9 items-center justify-center rounded-full border text-sm font-medium transition ${
                            isActive
                              ? 'border-white bg-white text-black shadow'
                              : 'border-white/20 bg-black/30 text-white/70 hover:border-white/40 hover:text-white'
                          }`}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {Array.from({ length: numPersonas }).map((_, idx) => (
                  <div key={idx} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-white">Persona {idx + 1}</span>
                      <span className="text-xs uppercase tracking-[0.25em] text-white/50">
                        Sender identity
                      </span>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white">First name</label>
                        <input
                          className="w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white focus:border-white/40 focus:outline-none focus:ring-0"
                          placeholder="e.g. Jordan"
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
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white">Last name</label>
                        <input
                          className="w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white focus:border-white/40 focus:outline-none focus:ring-0"
                          placeholder="e.g. Winters"
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
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white">Profile image (optional)</label>
                      <p className="text-xs text-white/50">
                        Square images (200×200) work best. We’ll resize automatically.
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(idx, e.target.files?.[0] ?? null)}
                        className="block w-full text-sm text-white/80 file:mr-4 file:rounded-lg file:border-0 file:bg-white/80 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-black hover:file:bg-white"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8">
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-white">Connect your warmup tool</h2>
                <p className="text-sm text-white/60">
                  We’ll plug directly into your sending or warmup provider to import settings and monitor reputation. Credentials are stored securely and audited.
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Warmup tool</label>
                  <select
                    value={warmupTool}
                    onChange={(e) => setWarmupTool(e.target.value as "Smartlead" | "Instantly" | "Plusvibe" | "EmailBison" | "Other")}
                    className="mt-1 w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white focus:border-white/40 focus:outline-none focus:ring-0"
                  >
                    <option value="">Select warmup tool…</option>
                    <option>Smartlead</option>
                    <option>Instantly</option>
                    <option>Plusvibe</option>
                    <option>EmailBison</option>
                    <option>Other</option>
                  </select>
                </div>
                {warmupTool === 'Other' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Tool name</label>
                    <input
                      type="text"
                      className="mt-1 w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white focus:border-white/40 focus:outline-none focus:ring-0"
                      placeholder="Let us know what you’re using"
                      value={warmupToolOther}
                      onChange={(e) => setWarmupToolOther(e.target.value)}
                      required
                    />
                  </div>
                )}
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Account ID</label>
                  <input
                    type="text"
                    className="mt-1 w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white focus:border-white/40 focus:outline-none focus:ring-0"
                    placeholder="Account email or ID"
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Password</label>
                  <input
                    type="password"
                    className="mt-1 w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white focus:border-white/40 focus:outline-none focus:ring-0"
                    placeholder="Used only for warmup configuration"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white">API key (optional)</label>
                <input
                  type="text"
                  className="mt-1 w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white focus:border-white/40 focus:outline-none focus:ring-0"
                  placeholder="Paste the key with warmup permissions (optional)"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Additional notes (optional)</label>
                <textarea
                  className="mt-1 h-28 w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white focus:border-white/40 focus:outline-none focus:ring-0"
                  placeholder="Please let us know which workspace to add them to (if applicable)."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-8">
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-white">Review & confirm</h2>
                <p className="text-sm text-white/60">
                  Tag your fleet, leave any special instructions, and confirm the launch package. We’ll start provisioning as soon as you submit.
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Internal tags</label>
                  <p className="text-xs text-white/50">For your internal reporting and account routing (comma separated).</p>
                  <TagInput
                    tags={internalTags}
                    onChange={setInternalTags}
                    placeholder="marketing, outbound, team-alpha"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">ESP tags</label>
                  <p className="text-xs text-white/50">Visible to us when configuring your ESP or warmup tool.</p>
                  <TagInput
                    tags={espTags}
                    onChange={setEspTags}
                    placeholder="warmup, primary, high-priority"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Special requirements (optional)</label>
                <textarea
                  className="mt-1 h-28 w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white focus:border-white/40 focus:outline-none focus:ring-0"
                  value={specialRequirements}
                  placeholder="Example: “Use our existing SPF record”, “Launch after 10/15”, “Share updates in #deliverability.”"
                  onChange={(e) => setSpecialRequirements(e.target.value)}
                />
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Launch summary</h3>
                  <span className="text-xs uppercase tracking-[0.3em] text-white/50">Review</span>
                </div>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {[
                    { label: 'Product', value: productDisplayName },
                    { label: 'Inboxes', value: `${inboxCount}` },
                    { label: 'Forwarding URL', value: primaryForwardUrl || '—' },
                    { label: 'Personas', value: `${numPersonas}` },
                    { label: 'Persona names', value: personaSummaryNames || '—' },
                    { label: 'Warmup tool', value: warmupTool === 'Other' ? warmupToolOther || 'Other' : warmupTool },
                    { label: 'Account ID', value: accountId || '—' },
                    { label: 'Internal tags', value: internalTags.length ? internalTags.join(', ') : '—' },
                    { label: 'ESP tags', value: espTags.length ? espTags.join(', ') : '—' },
                  ].map((item) => (
                    <div key={item.label} className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm">
                      <p className="text-xs uppercase tracking-[0.25em] text-white/50">{item.label}</p>
                      <p className="mt-2 font-medium text-white">{item.value}</p>
                    </div>
                  ))}
                </div>
                {specialRequirements && (
                  <div className="mt-4 rounded-xl border border-amber-400/30 bg-amber-500/10 p-4 text-sm text-amber-100">
                    <span className="font-semibold">Special instructions: </span>
                    {specialRequirements}
                  </div>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="mt-8 rounded-2xl border border-red-500/30 bg-red-600/10 p-5 text-sm text-red-100">
              <p className="font-semibold">We couldn’t complete this step.</p>
              <p className="mt-1 text-red-200">{error}</p>
              {(error.includes('expired') || error.includes('not found') || error.includes('does not belong')) && (
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    onClick={() => window.location.href = '/dashboard/products'}
                    className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-white/90"
                  >
                    Start a new checkout
                  </button>
                  <button
                    onClick={() => setError(null)}
                    className="rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-white/80 transition hover:border-white/40 hover:text-white"
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Button
              variant="outline"
              onClick={goPrev}
              disabled={step === 1 || loading}
            >
              Back
            </Button>
            <div className="flex flex-col items-start gap-2 text-xs text-white/45 sm:items-end">
              <span>{hasLoadedDraft ? 'Progress auto-saves to this browser.' : 'Restoring previous progress…'}</span>
              {step < 4 ? (
                <Button
                  variant="primary"
                  onClick={goNext}
                  disabled={!canNext || loading}
                >
                  {loading ? 'Saving…' : nextLabel}
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="gap-2"
                >
                  {loading && (
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-black border-r-transparent" />
                  )}
                  Complete Order
                </Button>
              )}
            </div>
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
