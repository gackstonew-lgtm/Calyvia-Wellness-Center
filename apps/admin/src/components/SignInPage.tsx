'use client';

import React, { useState } from 'react';
import {
  Shield,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Building2,
  User,
  Phone,
  Briefcase,
  HelpCircle,
  X,
  Sun,
  Moon,
  Loader2,
} from 'lucide-react';
import { useAuth } from './AuthContext';
import { useTheme } from './ThemeProvider';

export const SignInPage: React.FC = () => {
  const { login, requestAccess } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Mode: 'signin' | 'request-access'
  const [activeTab, setActiveTab] = useState<'signin' | 'request-access'>('signin');

  // Sign In Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Request Access Form State
  const [requestForm, setRequestForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    department: 'Clinical Operations',
    jobTitle: '',
    justification: '',
  });
  const [isRequesting, setIsRequesting] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  // Forgot Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage('Please provide both your institutional email and password.');
      return;
    }

    setIsSubmitting(true);
    const res = await login(email, password);
    setIsSubmitting(false);

    if (!res.success) {
      setErrorMessage(res.error || 'Invalid credentials or account is not authorized.');
    }
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRequestError(null);

    if (!requestForm.fullName || !requestForm.email || !requestForm.phone || !requestForm.jobTitle) {
      setRequestError('Please fill in all required fields.');
      return;
    }

    setIsRequesting(true);
    const res = await requestAccess(requestForm);
    setIsRequesting(false);

    if (res.success) {
      setRequestSuccess(true);
    } else {
      setRequestError(res.error || 'Failed to submit access request.');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-primary/20 transition-colors duration-200">
      {/* Top Utility Bar */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs font-medium text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Calyvia HMIS • Secure Institutional Portal</span>
        </div>

        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="w-9 h-9 rounded-xl bg-surface hover:bg-surface-elevated border border-border text-foreground flex items-center justify-center hover:border-primary/50 transition-all duration-150 shadow-xs"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-primary" />
          )}
        </button>
      </div>

      {/* Main Authentication Container */}
      <div className="w-full max-w-md mx-auto px-4 py-8 sm:py-12 flex-1 flex flex-col justify-center">
        {/* Brand Header */}
        <div className="text-center mb-8 space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-soft border border-primary/20 shadow-xs mb-2">
            <img
              src={theme === 'dark' ? '/brand/calyvia-emblem-dark.svg' : '/brand/calyvia-emblem-light.svg'}
              alt="Calyvia Emblem"
              width={42}
              height={42}
              className="w-10 h-10 object-contain"
            />
          </div>
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Calyvia Wellness Center
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Hospital Management Information System (HMIS / EMR)
            </p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center bg-surface-subtle p-1 rounded-2xl border border-border mb-6">
          <button
            type="button"
            onClick={() => {
              setActiveTab('signin');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all duration-150 ${
              activeTab === 'signin'
                ? 'bg-surface text-primary shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Staff Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('request-access');
              setRequestError(null);
              setRequestSuccess(false);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all duration-150 ${
              activeTab === 'request-access'
                ? 'bg-surface text-primary shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Request Access
          </button>
        </div>

        {/* Sign In Form */}
        {activeTab === 'signin' && (
          <div className="bg-surface border border-border rounded-3xl p-6 sm:p-8 shadow-elevated space-y-6">
            <div className="space-y-1">
              <h2 className="text-base font-semibold text-foreground">Personnel Authentication</h2>
              <p className="text-xs text-muted-foreground">
                Enter your institutional Calyvia credentials to access assigned clinical modules.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-danger-soft border border-danger/20 text-danger text-xs flex items-start space-x-2 animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSignIn} className="space-y-4">
              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-foreground">
                  Institutional Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="e.g. username@calyviawellness.co.ke"
                    className="w-full bg-surface-subtle border border-border rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-foreground">Password</label>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-[11px] text-primary hover:underline font-medium"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter clinical account password"
                    className="w-full bg-surface-subtle border border-border rounded-xl pl-9 pr-10 py-2.5 text-xs text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Session */}
              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary/20 w-3.5 h-3.5 accent-primary"
                />
                <label htmlFor="rememberMe" className="text-xs text-muted-foreground select-none cursor-pointer">
                  Maintain session on this clinical workstation
                </label>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary-hover active:scale-[0.99] shadow-xs transition-all flex items-center justify-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to EMR</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Request Access Form */}
        {activeTab === 'request-access' && (
          <div className="bg-surface border border-border rounded-3xl p-6 sm:p-8 shadow-elevated space-y-6">
            <div className="space-y-1">
              <h2 className="text-base font-semibold text-foreground">Request Staff Account</h2>
              <p className="text-xs text-muted-foreground">
                Private institutional system. Newly submitted accounts require Facility Administration authorization.
              </p>
            </div>

            {requestSuccess ? (
              <div className="p-6 rounded-2xl bg-primary-soft border border-primary/20 text-center space-y-3 animate-in zoom-in-95 duration-150">
                <CheckCircle2 className="w-10 h-10 text-primary mx-auto" />
                <h3 className="font-semibold text-sm text-foreground">Access Request Received</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your request has been routed to the Calyvia Facility Administrator and Medical Director for verification. You will be notified once institutional role assignment is completed.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('signin');
                    setRequestSuccess(false);
                  }}
                  className="mt-3 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary-hover shadow-xs transition-all"
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <>
                {requestError && (
                  <div className="p-3 rounded-xl bg-danger-soft border border-danger/20 text-danger text-xs flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{requestError}</span>
                  </div>
                )}

                <form onSubmit={handleRequestSubmit} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-foreground">Full Name</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={requestForm.fullName}
                        onChange={(e) => setRequestForm({ ...requestForm, fullName: e.target.value })}
                        required
                        placeholder="e.g. Dr. Antony Baraka"
                        className="w-full bg-surface-subtle border border-border rounded-xl pl-9 pr-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-foreground">Institutional Email</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={requestForm.email}
                        onChange={(e) => setRequestForm({ ...requestForm, email: e.target.value })}
                        required
                        placeholder="e.g. a.baraka@calyviawellness.co.ke"
                        className="w-full bg-surface-subtle border border-border rounded-xl pl-9 pr-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-foreground">Phone Number</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        value={requestForm.phone}
                        onChange={(e) => setRequestForm({ ...requestForm, phone: e.target.value })}
                        required
                        placeholder="+254 700 000 000"
                        className="w-full bg-surface-subtle border border-border rounded-xl pl-9 pr-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-foreground">Department</label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <select
                        value={requestForm.department}
                        onChange={(e) => setRequestForm({ ...requestForm, department: e.target.value })}
                        className="w-full bg-surface-subtle border border-border rounded-xl pl-9 pr-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      >
                        <option value="Clinical Operations">Clinical Operations (Psychiatry / Doctors)</option>
                        <option value="Inpatient Nursing">Inpatient Nursing (Detox Ward)</option>
                        <option value="Psychological Therapy">Counselling & Psychology</option>
                        <option value="Admissions & Front Desk">Admissions & Reception</option>
                        <option value="Pharmacy & Dispensary">Pharmacy & Dispensary</option>
                        <option value="Billing & Finance">Billing & Cashier</option>
                        <option value="Stores & Inventory">Stores & Inventory</option>
                        <option value="Facility Administration">Facility Administration</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-foreground">Job Title / Designation</label>
                    <div className="relative">
                      <Briefcase className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={requestForm.jobTitle}
                        onChange={(e) => setRequestForm({ ...requestForm, jobTitle: e.target.value })}
                        required
                        placeholder="e.g. Registered Clinical Nurse"
                        className="w-full bg-surface-subtle border border-border rounded-xl pl-9 pr-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-foreground">Justification for Access</label>
                    <textarea
                      rows={2}
                      value={requestForm.justification}
                      onChange={(e) => setRequestForm({ ...requestForm, justification: e.target.value })}
                      placeholder="Brief note on your assigned clinical duties or shift schedule"
                      className="w-full bg-surface-subtle border border-border rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isRequesting}
                    className="w-full mt-2 py-2.5 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary-hover active:scale-[0.99] shadow-xs transition-all flex items-center justify-center space-x-2 disabled:opacity-60"
                  >
                    {isRequesting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Submitting Request...</span>
                      </>
                    ) : (
                      <span>Submit Authorization Request</span>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        )}
      </div>

      {/* Security & Regulatory Compliance Footer */}
      <footer className="w-full border-t border-border/60 py-4 px-4 text-center text-[11px] text-muted-foreground space-y-1">
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
          <span className="flex items-center gap-1 text-primary">
            <Shield className="w-3.5 h-3.5" />
            <span>Authorized Healthcare Personnel Only</span>
          </span>
          <span>•</span>
          <span>Kenya Data Protection Act, 2019 (Sections 44–47)</span>
          <span>•</span>
          <span>Argon2id & AES-256-GCM Cryptographic Protection</span>
        </div>
        <p className="text-[10px] text-muted-foreground/80">
          Calyvia Wellness Center • Behind Full Gospel Church, Mugutha, Ruiru, Kiambu County
        </p>
      </footer>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-surface border border-border rounded-3xl max-w-md w-full p-6 shadow-elevated space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2 text-primary">
                <HelpCircle className="w-5 h-5" />
                <h3 className="font-semibold text-sm text-foreground">Password Recovery Protocol</h3>
              </div>
              <button
                onClick={() => setShowForgotModal(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-muted-foreground space-y-2 leading-relaxed">
              <p>
                In compliance with the Kenya Data Protection Act 2019 and Calyvia institutional security policies, clinical account passwords cannot be reset via unverified public email links.
              </p>
              <div className="p-3 rounded-xl bg-surface-subtle border border-border space-y-1">
                <div className="font-semibold text-foreground">Self-Recovery Procedure:</div>
                <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                  <li>Contact the Facility Administrator at <span className="font-mono text-primary">admin@calyviawellness.co.ke</span></li>
                  <li>Or visit the ICT & Records Department in person with your staff identification badge.</li>
                </ul>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowForgotModal(false)}
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary-hover shadow-xs transition-all"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
