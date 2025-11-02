"use client";

export const dynamic = 'force-dynamic';

import { useState, useMemo, useEffect, Suspense } from "react";
import { saveOnboardingAction } from "@/app/onboarding/actions";
import { useRouter, useSearchParams } from "next/navigation";
import TagInput from "./components/TagInput";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Button } from "@/components/ui/Button";

type Persona = { firstName: string; lastName: string; profileImage?: string | null };

const ALL_STEPS = [
  {
    key: 'workspace',
    title: 'Workspace Basics',
    caption: 'Quick details about your business and inbox needs.',
  },
  {
    key: 'registrar',
    title: 'Registrar Access',
    caption: 'Drop in your domain registrar login. We&apos;ll handle all the DNS stuff.',
  },
  {
    key: 'personas',
    title: 'Personas & Tone',
    caption: 'Set up sender names and profiles for your emails.',
  },
  {
    key: 'warmup',
    title: 'Warmup & Tools',
    caption: 'Connect your sending platform. Takes 30 seconds.',
  },
  {
    key: 'review',
    title: 'Review & Confirm',
    caption: 'Quick look before we get started.',
  },
] as const;

type StepKey = (typeof ALL_STEPS)[number]['key'];

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
  const [warmupTool, setWarmupTool] = useState<"Smartlead" | "Instantly" | "Plus Vibe" | "ReachInbox" | "Lemlist" | "EmailBison" | "Other">("Smartlead");
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
      if (typeof draft.step === 'number') setStep(Math.min(ALL_STEPS.length, Math.max(1, draft.step)));
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
      if (typeof draft.warmupTool === 'string' && ['Smartlead', 'Instantly', 'Plus Vibe', 'ReachInbox', 'Lemlist', 'EmailBison', 'Other'].includes(draft.warmupTool)) {
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
    // If there's a session_id, clear the completed flag to allow new onboarding
    const sessionId = searchParams.get('session_id');
    if (sessionId && typeof window !== 'undefined') {
      window.localStorage.removeItem('onboarding-completed');
    }

    // Check if onboarding was already completed and redirect (only if no session_id)
    const hasCompletedOnboarding = typeof window !== 'undefined' && 
      window.localStorage.getItem('onboarding-completed');
    if (hasCompletedOnboarding && !sessionId) {
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
  }, [router, searchParams]);

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
    setIsLoadingSession(true);
    try {
      const url = `/api/get-session?session_id=${sessionId}`;
      const response = await fetch(url);
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
        // Respect product-specific minimums when applying session quantity (case-insensitive)
        const sessionMin = String(data.productType || '').toUpperCase() === 'MICROSOFT' ? 50 : 10;
        setInboxCount(Math.max(sessionMin, data.quantity));
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
          setError('Your session expired — restart checkout to continue.');
        } else if (response.status === 404) {
          setError('Your session expired — restart checkout to continue.');
        } else if (response.status === 403) {
          setError('Your session expired — restart checkout to continue.');
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
      case 'RESELLER': return 'Premium Inboxes';
      case 'EDU': return 'Edu Inboxes';
      case 'LEGACY': return 'Legacy Inboxes';
      case 'PREWARMED': return 'Prewarmed Inboxes';
      case 'AWS': return 'AWS Inboxes';
      case 'MICROSOFT': return 'Microsoft Inboxes';
      default: return 'Unknown Product';
    }
  };

const isOwnDomainFlow = domainSource === 'OWN' && (productType === 'RESELLER' || productType === 'EDU' || productType === 'LEGACY' || productType === 'AWS' || productType === 'MICROSOFT');
const isBuyForMeFlow = domainSource === 'BUY_FOR_ME' && (productType === 'RESELLER' || productType === 'EDU' || productType === 'LEGACY' || productType === 'AWS' || productType === 'MICROSOFT');

const steps = useMemo(() => {
  return isOwnDomainFlow ? ALL_STEPS : ALL_STEPS.filter((meta) => meta.key !== 'registrar');
}, [isOwnDomainFlow]);
const totalSteps = steps.length;

useEffect(() => {
  if (!totalSteps) return;
  if (step > totalSteps) {
    setStep(totalSteps);
  }
}, [step, totalSteps]);
const currentStepMeta = steps[step - 1];
const currentStepKey = currentStepMeta?.key as StepKey | undefined;

const canNext = useMemo(() => {
  switch (currentStepKey) {
    case 'workspace': {
      const minRequired = productType === 'MICROSOFT' ? 50 : 10;
      if (inboxCount < minRequired || inboxCount > 2000) return false;
      if (!businessName.trim()) return false;

      if (productType === 'PREWARMED' && !primaryForwardUrl.trim()) return false;

      if (isOwnDomainFlow) {
        if (!ownDomainsRaw.trim()) return false;
        if (!primaryForwardUrl.trim()) return false;
        const domains = ownDomainsRaw.split('\n').map((d) => d.trim()).filter(Boolean);
        if (domains.length === 0) return false;
      }

      if (isBuyForMeFlow && !primaryForwardUrl.trim()) return false;
      return true;
    }
    case 'registrar': {
      if (!isOwnDomainFlow) return true;
      if (!domainRegistrar) return false;
      if (domainRegistrar === 'Other' && !registrarOtherName.trim()) return false;
      if (!registrarUsername.trim()) return false;
      if (!registrarPassword.trim()) return false;
      return true;
    }
    case 'personas': {
      if (numPersonas < 1) return false;
      for (const p of personas.slice(0, numPersonas)) {
        if (!p.firstName.trim() || !p.lastName.trim()) return false;
      }
      return true;
    }
    case 'warmup': {
      if (!warmupTool) return false;
      if (warmupTool === 'Other' && !warmupToolOther.trim()) return false;
      if (!accountId.trim()) return false;
      if (!password.trim()) return false;
      return true;
    }
    default:
      return true;
  }
}, [
  accountId,
  businessName,
  currentStepKey,
  domainRegistrar,
  inboxCount,
  isBuyForMeFlow,
  isOwnDomainFlow,
  numPersonas,
  ownDomainsRaw,
  password,
  personas,
  primaryForwardUrl,
  productType,
  registrarOtherName,
  registrarPassword,
  registrarUsername,
  warmupTool,
  warmupToolOther,
]);

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

const currentStepTitle = currentStepMeta?.title ?? '';

const goNext = () => setStep((s) => Math.min(totalSteps, s + 1));
const goPrev = () => setStep((s) => Math.max(1, s - 1));

const nextLabel = useMemo(() => {
  switch (currentStepKey) {
    case 'workspace':
      return isOwnDomainFlow ? 'Continue to registrar access' : 'Continue to personas';
    case 'registrar':
      return 'Continue to personas';
    case 'personas':
      return 'Continue to warmup setup';
    case 'warmup':
      return 'Review & confirm';
    default:
      return 'Next';
  }
}, [currentStepKey, isOwnDomainFlow]);

const hasProductSelection = Boolean(productType || sessionData?.productType);
const productDisplayName = getProductDisplayName(productType ?? sessionData?.productType ?? null);
const domainPlanSummary =
  !domainSource
    ? 'Domain plan was captured during checkout.'
    : domainSource === 'BUY_FOR_ME'
      ? 'Our team will purchase and configure the domains you selected during checkout.'
      : 'List the domains you want us to use. We&apos;ll handle all the DNS configuration.';
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
    <div className="min-h-screen bg-gradient-to-br from-[#06040f] via-[#0b0d1f] to-[#050509] px-4 md:px-10 lg:px-16 py-10 text-slate-100">
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-12 space-y-4 text-brand-primary">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-brand-muted-strong">
              Step {step} of {totalSteps}
            </span>
            <span className="text-xs uppercase tracking-[0.25em] text-brand-muted-strong">You&apos;re on: <span className="text-brand-primary font-semibold">{currentStepTitle}</span></span>
          </div>
          <h1 className="text-4xl font-bold text-brand-primary sm:text-5xl">Let&apos;s get you set up</h1>
          <p className="max-w-3xl text-lg text-brand-secondary leading-relaxed">
            Takes about 5 minutes. We&apos;ll use these details to configure everything on our end. Auto-saves as you go, so no stress.
          </p>
        </header>

        <ol className="mb-12 grid gap-6 text-sm md:grid-cols-2 lg:grid-cols-5">
          {steps.map((meta, index) => {
            const stepNumber = index + 1;
            const isActive = stepNumber === step;
            const isCompleted = stepNumber < step;
            return (
              <li
                key={meta.key}
                className={`rounded-2xl border p-6 transition-all duration-200 ${
                  isActive 
                    ? 'border-white/50 bg-white/[0.08] shadow-lg' 
                    : isCompleted 
                      ? 'border-emerald-400/40 bg-emerald-500/10 hover:border-emerald-400/60' 
                      : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-all duration-200 ${
                      isCompleted 
                        ? 'bg-emerald-400 text-emerald-950 shadow-sm' 
                        : isActive 
                          ? 'bg-white text-black shadow-sm' 
                          : 'bg-white/10 text-brand-muted'
                    }`}
                  >
                    {isCompleted ? (
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M16.704 5.29a1 1 0 0 1 .006 1.414l-7.25 7.334a1 1 0 0 1-1.438 0L3.29 9.225a1 1 0 1 1 1.418-1.41l3.13 3.147 6.53-6.598a1 1 0 0 1 1.336-.074z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      stepNumber
                    )}
                  </span>
                  <div className="flex-1">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-brand-muted-strong">Step {stepNumber}</p>
                    <p className="mt-1 text-base font-bold text-brand-primary">{meta.title}</p>
                  </div>
                </div>
                <p className="mt-4 text-sm text-brand-secondary leading-relaxed">{meta.caption}</p>
              </li>
            );
          })}
        </ol>

        <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-8 shadow-[0_40px_90px_-60px_rgba(10,10,15,0.8)] backdrop-blur-sm">
          {currentStepKey === 'workspace' && (
            <div className="space-y-8">
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-white">Workspace basics</h2>
                <p className="text-sm text-white/60">
                  We&apos;ll use this to set up your inboxes and domains. Everything stays private—only our onboarding team sees this.
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
                      <p className="text-xs uppercase tracking-[0.28em] opacity-70">{sessionData ? 'Payment confirmed! 🎉' : 'Selected plan'}</p>
                      <p className="mt-1 text-lg font-semibold">{productDisplayName}</p>
                      <p className="text-sm opacity-80">{String((productType ?? sessionData?.productType) || '').toUpperCase() === 'MICROSOFT' ? Math.max(50, inboxCount) : inboxCount} per month</p>
                    </div>
                    {sessionData && (
                      <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-emerald-100">
                        Payment captured
                      </span>
                    )}
                  </div>
                  <p className="mt-3 text-xs text-white/75">
                    Nice! Finish this quick 5-minute setup and we&apos;ll get your inboxes cooking.
                  </p>
                </div>
              )}

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">
                    {String((productType ?? sessionData?.productType) || '').toUpperCase() === 'MICROSOFT' 
                      ? 'Total Monthly Domains' 
                      : 'Total Monthly Inboxes'}
                  </label>
                  <input
                    type="number"
                    min={String((productType ?? sessionData?.productType) || '').toUpperCase() === 'MICROSOFT' ? 50 : 10}
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
                  <p className="text-xs text-white/50">Whose inboxes are these for? Your business or a client&apos;s?</p>
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
                  <label className="text-sm font-medium text-white">Where should domains redirect?</label>
                  <p className="text-xs text-white/50">Your domains will redirect here (e.g., your main website).</p>
                  <input
                    className="mt-2 w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white focus:border-white/40 focus:outline-none focus:ring-0"
                    placeholder="https://yourbusiness.com"
                    value={primaryForwardUrl}
                    onChange={(e) => setPrimaryForwardUrl(e.target.value)}
                    required
                  />
                </div>
              )}

              {productType !== 'PREWARMED' && (
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-5">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">Domain setup</h3>
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
                        <label className="text-sm font-medium text-white">Your domains</label>
                        <p className="text-xs text-white/50">List your domains (one per line). We&apos;ll configure SPF, DKIM, and DMARC automatically.</p>
                        <textarea
                          className="mt-2 h-28 w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white focus:border-white/40 focus:outline-none focus:ring-0"
                          placeholder="cold-email-gang.com&#10;inbox-champions.io&#10;reply-rates-go-brrr.net"
                          value={ownDomainsRaw}
                          onChange={(e) => setOwnDomainsRaw(e.target.value)}
                          required
                        />
                        <p className="mt-2 text-xs text-white/40">
                          {ownDomainsRaw.split('\n').filter((d) => d.trim()).length} domain(s) listed
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white">Where should domains redirect?</label>
                        <p className="text-xs text-white/50">Your domains will redirect here (e.g., your main website).</p>
                        <input
                          className="mt-2 w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white focus:border-white/40 focus:outline-none focus:ring-0"
                          placeholder="https://yourbusiness.com"
                          value={primaryForwardUrl}
                          onChange={(e) => setPrimaryForwardUrl(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  ) : isBuyForMeFlow ? (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white">Where should domains redirect?</label>
                      <p className="text-xs text-white/50">Your domains will redirect here (e.g., your main website).</p>
                      <input
                        className="mt-2 w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white focus:border-white/40 focus:outline-none focus:ring-0"
                        placeholder="https://yourbusiness.com"
                        value={primaryForwardUrl}
                        onChange={(e) => setPrimaryForwardUrl(e.target.value)}
                        required
                      />
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          )}

          {currentStepKey === 'registrar' && (
            <div className="space-y-8">
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-white">Registrar login</h2>
                <p className="text-sm text-white/60">
                  Drop your registrar login so we can configure your domains. Everything&apos;s encrypted and only our onboarding team can access it.
                </p>
              </div>

              <div className="space-y-5">
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
                  Pro tip: Add <a className="font-mono text-blue-200 underline" href="mailto:team@inboxnavigator.com">team@inboxnavigator.com</a> as an admin on your registrar account for smoother setup.
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
                    <p className="text-xs text-white/45">Encrypted and secure. Only our onboarding team can access this.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStepKey === 'personas' && (
            <div className="space-y-8">
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-white">Sender personas</h2>
                <p className="text-sm text-white/60">
                  Create sender profiles for your inboxes. Each one needs a name and profile pic.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <label className="text-sm font-medium text-white">How many sender profiles?</label>
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
                          placeholder="e.g. Definitely Real"
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
                          placeholder="e.g. Person"
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
                      <label className="text-sm font-medium text-white">Profile pic (optional)</label>
                      <p className="text-xs text-white/50">
                        Any square image works. We&apos;ll resize it automatically.
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

          {currentStepKey === 'warmup' && (
            <div className="space-y-8">
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-white">Connect your sending platform</h2>
                <p className="text-sm text-white/60">
                  Connect Instantly, Smartlead, or whatever you&apos;re using. We&apos;ll integrate your inboxes automatically.
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Which platform?</label>
                  <select
                    value={warmupTool}
                    onChange={(e) => setWarmupTool(e.target.value as "Smartlead" | "Instantly" | "Plus Vibe" | "ReachInbox" | "Lemlist" | "EmailBison" | "Other")}
                    className="mt-1 w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white focus:border-white/40 focus:outline-none focus:ring-0"
                  >
                    <option value="">Select platform…</option>
                    <option>Smartlead</option>
                    <option>Instantly</option>
                    <option>Plus Vibe</option>
                    <option>ReachInbox</option>
                    <option>Lemlist</option>
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
                  <label className="text-sm font-medium text-white">Account ID or email</label>
                  <input
                    type="text"
                    className="mt-1 w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white focus:border-white/40 focus:outline-none focus:ring-0"
                    placeholder="your-account@email.com"
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
                    placeholder="Your account password"
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
                  placeholder="Paste your API key if you have one"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Anything else we should know? (optional)</label>
                <textarea
                  className="mt-1 h-28 w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white focus:border-white/40 focus:outline-none focus:ring-0"
                  placeholder='e.g., "Add to Agency workspace" or "idk you&apos;re the expert"'
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
          )}

          {currentStepKey === 'review' && (
            <div className="space-y-8">
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-white">Almost there</h2>
                <p className="text-sm text-white/60">
                  Look things over, add any tags you need, and we&apos;ll get your inboxes cooking.
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Internal tags</label>
                  <p className="text-xs text-white/50">For your own organization and tracking. Comma or Enter to add.</p>
                  <TagInput
                    tags={internalTags}
                    onChange={setInternalTags}
                    placeholder="agency-work, client-abc, q4-campaign"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">ESP tags</label>
                  <p className="text-xs text-white/50">We&apos;ll add these tags in your sending platform (Instantly, Smartlead, etc.) so you can easily filter and organize your inboxes.</p>
                  <TagInput
                    tags={espTags}
                    onChange={setEspTags}
                    placeholder="warmup, primary, high-priority"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Anything special we should know? (optional)</label>
                <textarea
                  className="mt-1 h-28 w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white focus:border-white/40 focus:outline-none focus:ring-0"
                  value={specialRequirements}
                  placeholder='"Need 10% reply rates minimum", "Need it yesterday", or actual requirements work too'
                  onChange={(e) => setSpecialRequirements(e.target.value)}
                />
              </div>

              <div className="space-y-6">
                {/* Order Basics */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-semibold text-white">Order Details</h3>
                    <span className="text-xs uppercase tracking-[0.3em] text-white/50">Basic Info</span>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {[
                      { label: 'Product', value: productDisplayName },
                      { label: 'Inboxes', value: `${inboxCount}` },
                      { label: 'Business/Sender Name', value: businessName || '—' },
                      { label: 'Forwarding URL', value: primaryForwardUrl || '—' },
                    ].map((item) => (
                      <div key={item.label} className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm">
                        <p className="text-xs uppercase tracking-[0.25em] text-white/50">{item.label}</p>
                        <p className="mt-2 font-medium text-white break-words">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Domain Details */}
                {(isOwnDomainFlow || isBuyForMeFlow) && (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="text-lg font-semibold text-white">Domain Configuration</h3>
                      <span className="text-xs uppercase tracking-[0.3em] text-white/50">
                        {isOwnDomainFlow ? 'Your Domains' : 'Domain Purchase'}
                      </span>
                    </div>
                    <div className="space-y-4">
                      {isOwnDomainFlow ? (
                        <>
                          <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm">
                            <p className="text-xs uppercase tracking-[0.25em] text-white/50 mb-2">Your Domains</p>
                            <div className="space-y-1">
                              {ownDomainsRaw.split('\n').filter((d) => d.trim()).length > 0 ? (
                                ownDomainsRaw.split('\n').filter((d) => d.trim()).map((domain, idx) => (
                                  <p key={idx} className="font-mono text-sm text-white/90">{domain.trim()}</p>
                                ))
                              ) : (
                                <p className="text-white/50">—</p>
                              )}
                            </div>
                          </div>
                          {domainRegistrar && (
                            <div className="grid gap-4 sm:grid-cols-2">
                              <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm">
                                <p className="text-xs uppercase tracking-[0.25em] text-white/50">Registrar</p>
                                <p className="mt-2 font-medium text-white">{domainRegistrar === 'Other' ? registrarOtherName || 'Other' : domainRegistrar}</p>
                              </div>
                              <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm">
                                <p className="text-xs uppercase tracking-[0.25em] text-white/50">Registrar Username</p>
                                <p className="mt-2 font-medium text-white break-words">{registrarUsername || '—'}</p>
                              </div>
                              <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm sm:col-span-2">
                                <p className="text-xs uppercase tracking-[0.25em] text-white/50 mb-2">Registrar Password</p>
                                <div className="flex items-center gap-2">
                                  <p className="font-mono text-sm text-white/90">
                                    {registrarPassword ? '•'.repeat(Math.min(registrarPassword.length, 20)) : '—'}
                                  </p>
                                  <span className="text-xs text-white/40">(encrypted)</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm">
                          <p className="text-xs uppercase tracking-[0.25em] text-white/50 mb-2">Domain Purchase</p>
                          <p className="text-white/90">
                            Our team will purchase and configure fresh domains for your inboxes. Domain details were selected during checkout.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Persona Details */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-semibold text-white">Sender Profiles</h3>
                    <span className="text-xs uppercase tracking-[0.3em] text-white/50">{numPersonas} Persona{numPersonas !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {personas.slice(0, numPersonas).map((persona, idx) => (
                      <div key={idx} className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm">
                        <p className="text-xs uppercase tracking-[0.25em] text-white/50 mb-2">Persona {idx + 1}</p>
                        <p className="font-medium text-white">{`${persona.firstName} ${persona.lastName}`.trim() || '—'}</p>
                        {persona.profileImage && (
                          <p className="mt-1 text-xs text-white/60">✓ Profile image provided</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sending Platform Details */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-semibold text-white">Sending Platform</h3>
                    <span className="text-xs uppercase tracking-[0.3em] text-white/50">Connection</span>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm">
                      <p className="text-xs uppercase tracking-[0.25em] text-white/50">Platform</p>
                      <p className="mt-2 font-medium text-white">{warmupTool === 'Other' ? warmupToolOther || 'Other' : warmupTool}</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm">
                      <p className="text-xs uppercase tracking-[0.25em] text-white/50">Account ID or Email</p>
                      <p className="mt-2 font-medium text-white break-words">{accountId || '—'}</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm">
                      <p className="text-xs uppercase tracking-[0.25em] text-white/50 mb-2">Password</p>
                      <div className="flex items-center gap-2">
                        <p className="font-mono text-sm text-white/90">
                          {password ? '•'.repeat(Math.min(password.length, 20)) : '—'}
                        </p>
                        <span className="text-xs text-white/40">(encrypted)</span>
                      </div>
                    </div>
                    {apiKey && (
                      <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm">
                        <p className="text-xs uppercase tracking-[0.25em] text-white/50 mb-2">API Key</p>
                        <p className="font-mono text-xs text-white/70 break-all">{apiKey.substring(0, 20)}...</p>
                      </div>
                    )}
                    {notes && (
                      <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm sm:col-span-2">
                        <p className="text-xs uppercase tracking-[0.25em] text-white/50 mb-2">Additional Notes</p>
                        <p className="text-sm text-white/80 whitespace-pre-wrap">{notes}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tags & Requirements */}
                {(internalTags.length > 0 || espTags.length > 0 || specialRequirements) && (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="text-lg font-semibold text-white">Tags & Requirements</h3>
                      <span className="text-xs uppercase tracking-[0.3em] text-white/50">Metadata</span>
                    </div>
                    <div className="space-y-4">
                      {internalTags.length > 0 && (
                        <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm">
                          <p className="text-xs uppercase tracking-[0.25em] text-white/50 mb-2">Internal Tags</p>
                          <p className="text-white/90">{internalTags.join(', ')}</p>
                        </div>
                      )}
                      {espTags.length > 0 && (
                        <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm">
                          <p className="text-xs uppercase tracking-[0.25em] text-white/50 mb-2">ESP Tags</p>
                          <p className="text-white/90">{espTags.join(', ')}</p>
                        </div>
                      )}
                      {specialRequirements && (
                        <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm">
                          <p className="text-xs uppercase tracking-[0.25em] text-white/50 mb-2">Special Requirements</p>
                          <p className="text-sm text-white/80 whitespace-pre-wrap">{specialRequirements}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="mt-8 rounded-2xl border border-red-500/30 bg-red-600/10 p-5 text-sm text-red-100">
              <p className="font-semibold">Something went wrong. Try again or restart checkout.</p>
              <p className="mt-1 text-red-200">{error}</p>
              {(error.includes('expired') || error.includes('not found') || error.includes('does not belong')) && (
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    onClick={() => window.location.href = '/dashboard/products'}
                    className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-white/90"
                  >
                    Restart checkout
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

          <div className="mt-12 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <Button
              variant="outline"
              size="lg"
              onClick={goPrev}
              disabled={step === 1 || loading}
              className="px-8"
            >
              Back
            </Button>
            <div className="flex flex-col items-start gap-3 text-xs text-white/45 sm:items-end">
              <span className="text-sm">{hasLoadedDraft ? 'Auto-saves as you type.' : 'Restoring previous progress…'}</span>
              {step < totalSteps ? (
                <Button
                  variant="primary"
                  size="lg"
                  onClick={goNext}
                  disabled={!canNext || loading}
                  className="px-8"
                >
                  {loading ? 'Saving…' : nextLabel}
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="gap-3 px-8"
                >
                  {loading && (
                    <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-black border-r-transparent" />
                  )}
                  Complete your Order
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
