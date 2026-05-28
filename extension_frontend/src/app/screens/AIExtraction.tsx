import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { FileSearch, Scan, Brain, FileText, Loader2 } from 'lucide-react';
import ChatBubble from '../components/ChatBubble';
import { extractFromDocuments } from '../api/filetractApi';
import { getFormFieldsForExtraction } from '../api/formScanApi';
import { getServiceById } from '../config/services';

const genericStatusMessages = [
  { icon: FileSearch, textHi: 'दस्तावेज़ पढ़ रहा है...', textEn: 'Reading document' },
  { icon: Scan, textHi: 'फ़ील्ड्स खोज रहा है...', textEn: 'Extracting fields' },
  { icon: Brain, textHi: 'AI विश्लेषण कर रहा है...', textEn: 'AI analysis in progress' },
];

export default function AIExtraction() {
  const navigate = useNavigate();
  const location = useLocation();
  const { name, mobile, serviceId, files, formFieldKeys, formScannedFields: formScannedFieldsFromState, formTabId: formTabIdFromState } = location.state || {};
  const service = serviceId ? getServiceById(serviceId) : null;
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  const fileList = files && Array.isArray(files) ? files : [];
  const currentFileName = fileList[currentFileIndex]?.name || '';
  const CurrentIcon = genericStatusMessages[statusIndex].icon;

  useEffect(() => {
    if (!fileList.length || !service) {
      setError('कोई दस्तावेज़ नहीं मिले या सेवा चयनित नहीं है।');
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        let fieldKeys = Array.isArray(formFieldKeys) ? formFieldKeys : [];
        let scannedFields = Array.isArray(formScannedFieldsFromState) ? formScannedFieldsFromState : [];
        let formTabId = typeof formTabIdFromState === 'number' ? formTabIdFromState : null;

        if (fieldKeys.length === 0) {
          const scanned = await getFormFieldsForExtraction();
          fieldKeys = scanned.fieldKeys;
          scannedFields = scanned.scannedFields;
          formTabId = scanned.formTabId;
        }

        if (cancelled) return;

        const result = await extractFromDocuments(
          fileList,
          service,
          fieldKeys.length > 0 ? fieldKeys : undefined
        );

        if (cancelled) return;

        navigate('/data-review', {
          state: {
            name, mobile, serviceId,
            extraction: result,
            formScannedFields: scannedFields.length > 0 ? scannedFields : undefined,
            formTabId,
          },
        });
      } catch (e: unknown) {
        if (cancelled) return;
        let msg = 'दस्तावेज़ से जानकारी निकालने में समस्या आई। कृपया बाद में फिर कोशिश करें।';
        if (typeof e === 'object' && e && 'message' in e) {
          msg = (e as any).message;
        } else if (typeof e === 'string') {
          msg = e;
        }
        setError(msg);
        if (process.env.NODE_ENV === 'development') {
          // Log full error in dev
          // eslint-disable-next-line no-console
          console.error('[AIExtraction] Extraction error', e);
        }
      }
    })();

    return () => { cancelled = true; };
  }, [fileList, service, navigate, name, mobile, serviceId, formFieldKeys, formScannedFieldsFromState, formTabIdFromState, retryKey]);

  useEffect(() => {
    if (fileList.length < 2) return;
    const interval = setInterval(() => {
      setCurrentFileIndex((prev) => (prev + 1) % fileList.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [fileList.length]);

  useEffect(() => {
    const statusInterval = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % genericStatusMessages.length);
    }, 4000);
    return () => clearInterval(statusInterval);
  }, []);

  return (
    <div className="py-6">
      <ChatBubble
        type="bot"
        titleHi="AI दस्तावेज़ पढ़ रहा है..."
        titleEn="AI is reading documents"
      />

      {error && (
        <div className="px-4 mb-3 animate-slideUp">
          <div className="bg-red-50 border border-risk-red/30 rounded-xl p-3.5 text-xs text-risk-red flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
            {error}
            <div className="mt-2 flex gap-2">
              <button
                className="px-3 py-1 bg-navy text-white rounded text-xs hover:bg-navy-dark transition"
                onClick={() => {
                  setError(null);
                  setRetryKey((k) => k + 1);
                }}
              >
                पुनः प्रयास करें / Retry
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="px-4 animate-slideUp">
        <div className="bg-surface rounded-xl p-8 border border-border-custom shadow-card">
          <div className="flex justify-center mb-6">
            <div className="relative w-20 h-20">
              <svg
                className="animate-spin w-20 h-20"
                viewBox="0 0 100 100"
                style={{ animationDuration: '3s' }}
              >
                <circle cx="50" cy="50" r="45" fill="none" stroke="#D56B14" strokeWidth="2" opacity="0.3" />
                {Array.from({ length: 24 }).map((_, i) => {
                  const angle = (i * 360) / 24;
                  const rad = (angle * Math.PI) / 180;
                  const x1 = 50 + 30 * Math.cos(rad);
                  const y1 = 50 + 30 * Math.sin(rad);
                  const x2 = 50 + 45 * Math.cos(rad);
                  const y2 = 50 + 45 * Math.sin(rad);
                  return (
                    <line
                      key={i}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke="#D56B14"
                      strokeWidth="1.5"
                      opacity={i % 3 === 0 ? 1 : 0.4}
                    />
                  );
                })}
                <circle cx="50" cy="50" r="6" fill="#1A2332" />
              </svg>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 mb-4">
            <CurrentIcon className="w-5 h-5 text-saffron animate-pulse flex-shrink-0" strokeWidth={2} />
            <div className="text-center">
              <div className="text-sm font-bold text-navy">
                {currentFileName ? `"${currentFileName}" से डेटा निकाल रहा है...` : genericStatusMessages[statusIndex].textHi}
              </div>
              <div className="text-xs text-muted-text font-medium">
                {currentFileName ? `Extracting from ${currentFileName}` : genericStatusMessages[statusIndex].textEn}
              </div>
            </div>
          </div>

          {fileList.length > 0 && (
            <div className="mb-4 space-y-1.5 bg-slate-50 rounded-lg p-3">
              {fileList.map((f: File, i: number) => (
                <div
                  key={f.name + i}
                  className={`flex items-center gap-2 text-xs ${
                    i === currentFileIndex ? 'text-saffron font-semibold' : 'text-slate'
                  } transition-colors duration-300`}
                >
                  <FileText className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2} />
                  <span className="truncate">{f.name}</span>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2">
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-saffron to-saffron-deep rounded-full animate-pulse transition-all duration-500"
                style={{ width: `${Math.min(90, 30 + statusIndex * 30)}%` }}
              />
            </div>
            <p className="text-[10px] text-muted-text text-center font-medium">AI extraction in progress &mdash; this may take a moment</p>
          </div>
        </div>
      </div>
    </div>
  );
}
