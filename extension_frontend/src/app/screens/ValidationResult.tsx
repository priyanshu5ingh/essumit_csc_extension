import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { ShieldAlert, AlertTriangle, AlertCircle, X, Check, ChevronLeft, Loader2 } from 'lucide-react';
import ChatBubble from '../components/ChatBubble';
import { validateExtraction, type ValidationResult as ValidationResultType } from '../api/validationApi';
import { getBackendServiceId } from '../config/serviceConfig';

export default function ValidationResult() {
  const navigate = useNavigate();
  const location = useLocation();
  const { extraction, serviceId, name, mobile, formScannedFields, formTabId } = location.state || {};
  const backendServiceId = serviceId ? getBackendServiceId(serviceId) : 'birth_certificate';

  const [validation, setValidation] = useState<ValidationResultType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!extraction?.extractedFields) {
      setError('कोई निकाला गया डेटा नहीं मिला।');
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const result = await validateExtraction(backendServiceId || 'birth_certificate', extraction.extractedFields);
        setValidation(result);
      } catch (e: unknown) {
        console.error('[ValidationResult] Validation error', e);
        setError('सत्यापन में समस्या आई।');
        setValidation({
          overallRisk: 'MEDIUM',
          riskScore: 0.5,
          issues: [],
          eligibilityVerdict: 'NEEDS_REVIEW',
          summaryHindi: 'सत्यापन असफल रहा।',
          summaryEnglish: 'Validation failed.',
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [extraction, backendServiceId]);

  const rejectionProbability = validation ? Math.round(validation.riskScore * 100) : 0;
  const issues = validation?.issues ?? [];
  const riskLevel = validation?.overallRisk || 'MEDIUM';
  const hasRedBorder = riskLevel === 'HIGH';

  const riskHeaderBg =
    riskLevel === 'HIGH' ? 'bg-risk-red' : riskLevel === 'MEDIUM' ? 'bg-risk-amber' : 'bg-green';
  const riskCardBorder =
    riskLevel === 'HIGH' ? 'border-risk-red' : riskLevel === 'MEDIUM' ? 'border-risk-amber' : 'border-green';

  const handleSubmit = () => {
    navigate('/success', {
      state: {
        extraction,
        serviceId,
        name,
        mobile,
        validation,
      },
    });
  };

  const handleCancel = () => {
    navigate('/welcome');
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full items-center justify-center py-12 animate-fadeIn">
        <div className="relative w-16 h-16 mb-4">
          <div className="absolute inset-0 rounded-full border-4 border-saffron/20 border-t-saffron animate-spin"></div>
          <ShieldAlert className="w-6 h-6 text-saffron absolute inset-0 m-auto" strokeWidth={2} />
        </div>
        <div className="text-sm text-muted-text font-medium">AI सत्यापन कर रहा है...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto py-6">
        <ChatBubble
          type="bot"
          titleHi={issues.length ? 'AI ने समस्याएं पाई' : 'AI ने डेटा जाँच लिया'}
          titleEn={issues.length ? 'AI found issues' : 'AI verified data'}
          hasRedBorder={hasRedBorder}
        />

        {error && (
          <div className="px-4 mb-3 animate-slideUp">
            <div className="bg-red-50 border border-risk-red/30 rounded-xl p-3.5 text-xs text-risk-red">
              {error}
            </div>
          </div>
        )}

        <div className="px-4 mb-4 animate-slideUp">
          <div className={`bg-surface rounded-xl overflow-hidden border-2 shadow-lg ${riskCardBorder}`}>
            <div className={`px-5 py-4 ${riskHeaderBg} flex items-center justify-between`}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center backdrop-blur-sm">
                  <ShieldAlert className="w-5 h-5 text-white" strokeWidth={2} />
                </div>
                <div>
                  <div className="text-white font-bold text-sm tracking-tight">
                    {validation?.overallRisk === 'HIGH' ? 'उच्च जोखिम' : validation?.overallRisk === 'MEDIUM' ? 'मध्यम जोखिम' : 'कम जोखिम'}
                  </div>
                  <div className="text-white/70 text-[10px] font-medium">
                    {validation?.overallRisk || 'MEDIUM'} RISK
                  </div>
                </div>
              </div>
              <div className="text-white font-mono font-bold text-xl tabular-nums">
                {rejectionProbability}%
              </div>
            </div>

            <div className="px-5 py-4 bg-gradient-to-b from-slate-50 to-white">
              <div className="text-xs text-muted-text mb-2 text-center font-semibold">
                अस्वीकृति संभावना / Rejection Probability
              </div>
              <div className="relative h-3 bg-slate-200 rounded-full overflow-hidden">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green via-risk-amber to-risk-red" />
                <div
                  className="absolute top-0 bottom-0 w-4 h-4 bg-white border-2 border-navy rounded-full shadow-md -ml-2 transition-all duration-500"
                  style={{ left: `${Math.min(96, rejectionProbability)}%` }}
                />
              </div>
            </div>

            <div className="px-5 pb-4 space-y-3">
              {issues.map((issue, idx) => (
                <div
                  key={issue.field + idx}
                  className={`p-3.5 rounded-xl border-l-4 transition-all ${
                    issue.severity === 'CRITICAL'
                      ? 'border-risk-red bg-gradient-to-r from-red-50 to-red-50/30'
                      : issue.severity === 'WARNING'
                      ? 'border-risk-amber bg-gradient-to-r from-amber-50 to-amber-50/30'
                      : 'border-slate-300 bg-gradient-to-r from-slate-50 to-white'
                  }`}
                >
                  <div className="flex gap-3">
                    {issue.severity === 'CRITICAL' ? (
                      <div className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                        <AlertTriangle className="w-4 h-4 text-risk-red" strokeWidth={2} />
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="w-4 h-4 text-risk-amber" strokeWidth={2} />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className={`text-sm font-bold mb-0.5 ${
                        issue.severity === 'CRITICAL' ? 'text-risk-red' : 'text-risk-amber'
                      }`}>
                        {issue.messageHindi || issue.message}
                      </div>
                      <div className="text-xs text-slate mb-2 font-medium">
                        {issue.message}
                      </div>
                      {issue.suggestion && (
                        <div className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-white text-[10px] font-bold text-navy border border-border-strong shadow-sm">
                          &rarr; {issue.suggestion}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-5 pb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border-custom to-transparent" />
                <div className="text-xs text-muted-text font-semibold">आप क्या करना चाहते हैं?</div>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border-custom to-transparent" />
              </div>
              <div className="text-center text-[10px] text-muted-text font-medium">
                निर्णय आपका है &mdash; डेटा सुरक्षित है
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-3 bg-white/90 backdrop-blur-md border-t border-border-custom">
        <div className="grid grid-cols-2 gap-2.5 mb-2.5">
          <button
            onClick={handleCancel}
            className="h-11 rounded-xl bg-white border-2 border-risk-red/40 text-risk-red font-bold text-sm flex items-center justify-center gap-1.5 transition-all duration-200 hover:bg-red-50 hover:border-risk-red active:scale-[0.98]"
          >
            <X className="w-4 h-4" strokeWidth={2.5} />
            <span>रद्द करें</span>
          </button>
          <button
            onClick={handleSubmit}
            className="h-11 rounded-xl bg-gradient-to-r from-saffron to-saffron-deep hover:from-saffron-hover hover:to-saffron-deep text-white font-bold text-sm flex items-center justify-center gap-1.5 transition-all duration-200 shadow-md shadow-saffron/20 active:scale-[0.98]"
          >
            <Check className="w-4 h-4" strokeWidth={2.5} />
            <span>जमा करें</span>
          </button>
        </div>
        <button
          onClick={() =>
            navigate('/data-review', {
              state: { extraction, serviceId, name, mobile, formScannedFields, formTabId },
            })
          }
          className="w-full h-10 rounded-xl bg-surface border-2 border-border-custom text-navy text-sm font-semibold flex items-center justify-center gap-1.5 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 active:scale-[0.98]"
        >
          <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />
          <span>संपादित करें / पीछे जाएं</span>
        </button>
      </div>
    </div>
  );
}
