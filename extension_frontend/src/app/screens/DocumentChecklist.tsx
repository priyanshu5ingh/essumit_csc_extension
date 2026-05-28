import { useState, useRef, useMemo, useEffect, ChangeEvent } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { FileText, Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import ChatBubble from '../components/ChatBubble';
import NavigationButtons from '../components/NavigationButtons';
import { getServiceById } from '../config/services';
import { getServiceConfig } from '../config/serviceConfig';
import { getFormFieldsForExtraction } from '../api/formScanApi';
import { getBackendServiceId } from '../config/serviceConfig';
import { setAssistantContext } from '../context/assistantContext';

interface Document {
  id: string;
  nameHi: string;
  nameEn: string;
  mandatory: boolean;
  uploaded: boolean;
  checked: boolean;
  fileName?: string;
  fileSize?: string;
}

export default function DocumentChecklist() {
  const navigate = useNavigate();
  const location = useLocation();
  const { name, mobile, serviceId } = location.state || {};
  const service = serviceId ? getServiceById(serviceId) : null;
  const serviceConfig = serviceId ? getServiceConfig(serviceId) : null;

  const baseDocuments = useMemo(() => {
    if (!serviceConfig?.requiredDocuments) {
      return [
        { id: 'aadhaar', nameHi: 'आधार कार्ड', nameEn: 'Aadhaar card', mandatory: true, uploaded: false, checked: false },
        { id: 'address_proof', nameHi: 'पता प्रमाण', nameEn: 'Address proof', mandatory: true, uploaded: false, checked: false },
      ];
    }
    return serviceConfig.requiredDocuments.map(d => ({
      id: d.id,
      nameHi: d.nameHindi,
      nameEn: d.name,
      mandatory: d.mandatory,
      uploaded: false,
      checked: false,
    }));
  }, [serviceConfig]);

  const [documents, setDocuments] = useState<Document[]>(() =>
    baseDocuments.map(d => ({ ...d, uploaded: false, checked: false }))
  );
  const [filesById, setFilesById] = useState<Record<string, File>>({});
  const [formFieldsCache, setFormFieldsCache] = useState<{
    fieldKeys: string[];
    scannedFields: Array<{ fieldKey: string; label: string; labelHi: string; selector?: string; semanticKey?: string }>;
    formTabId: number | null;
  } | null>(null);

  useEffect(() => {
    getFormFieldsForExtraction().then(({ fieldKeys, scannedFields, formTabId }) => {
      if (fieldKeys.length > 0) {
        setFormFieldsCache({ fieldKeys, scannedFields, formTabId });
      }
    });
  }, [serviceId]);

  useEffect(() => {
    setDocuments(baseDocuments.map(d => ({ ...d, uploaded: false, checked: false })));
    setFilesById({});
    setFormFieldsCache(null);
  }, [serviceId]);

  useEffect(() => {
    if (serviceId) {
      setAssistantContext({
        serviceId: getBackendServiceId(serviceId) || serviceId,
        citizenName: name,
        citizenPhone: mobile,
      });
    }
  }, [serviceId, name, mobile]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [pendingDocId, setPendingDocId] = useState<string | null>(null);

  const handleUploadClick = (docId: string) => {
    setPendingDocId(docId);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const [uploadError, setUploadError] = useState<string | null>(null);
  const MAX_FILE_SIZE = 16 * 1024 * 1024; // 16MB
  const ALLOWED_EXTENSIONS = ['pdf', 'png', 'jpg', 'jpeg', 'tiff', 'bmp'];

  const handleFileSelected = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !pendingDocId) return;

    // Validate file type
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
      setUploadError(`Invalid file type: .${ext}. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`);
      event.target.value = '';
      setPendingDocId(null);
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setUploadError(`File size exceeds 16MB limit (${Math.round(file.size / (1024 * 1024))}MB). Please select a smaller file.`);
      event.target.value = '';
      setPendingDocId(null);
      return;
    }

    const sizeKB = Math.max(1, Math.round(file.size / 1024));
    const displaySize = `${sizeKB} KB`;

    setDocuments(docs =>
      docs.map(doc =>
        doc.id === pendingDocId
          ? { ...doc, uploaded: true, checked: true, fileName: file.name, fileSize: displaySize }
          : doc
      )
    );

    setFilesById(prev => ({ ...prev, [pendingDocId]: file }));
    event.target.value = '';
    setPendingDocId(null);
    setUploadError(null);
  };

  const mandatoryCount = documents.filter(d => d.mandatory).length;
  const completedMandatoryCount = documents.filter(d => d.mandatory && (d.uploaded || d.checked)).length;
  const allMandatoryComplete = mandatoryCount === 0 || completedMandatoryCount === mandatoryCount;
  const progressPercent = mandatoryCount ? (completedMandatoryCount / mandatoryCount) * 100 : 100;

  const handleToggleChecked = (docId: string) => {
    setDocuments(docs =>
      docs.map(doc =>
        doc.id === docId ? { ...doc, checked: !doc.checked } : doc
      )
    );
  };

  const handleContinue = () => {
    if (allMandatoryComplete) {
      const files = Object.values(filesById);
      navigate('/ai-extraction', {
        state: {
          name, mobile, serviceId, files,
          formFieldKeys: formFieldsCache?.fieldKeys,
          formScannedFields: formFieldsCache?.scannedFields,
          formTabId: formFieldsCache?.formTabId ?? null,
        },
      });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto py-6">
        <ChatBubble 
          type="user"
          content={service?.nameHi || 'जन्म प्रमाण पत्र'}
        />

        <ChatBubble 
          type="bot"
          titleHi="इन दस्तावेज़ों की ज़रूरत है"
          titleEn="These documents are required"
        />

        {formFieldsCache && formFieldsCache.fieldKeys.length > 0 && (
          <div className="px-4 mb-3 animate-slideUp">
            <div className="flex items-center gap-2 text-xs text-green bg-gradient-to-r from-green-light to-green-light/50 border border-green/20 rounded-lg px-3 py-2.5">
              <CheckCircle2 className="w-4 h-4 text-green flex-shrink-0" strokeWidth={2} />
              <span className="font-medium">पोर्टल फॉर्म से {formFieldsCache.fieldKeys.length} फ़ील्ड मिले &mdash; इन्हीं से डेटा निकाला जाएगा</span>
            </div>
          </div>
        )}

        <div className="px-4 mb-4">
          <div className="bg-surface rounded-xl overflow-hidden border border-border-custom shadow-card">
            <div className="px-4 py-3.5 bg-gradient-to-r from-navy to-navy-light flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-white" strokeWidth={2} />
                <span className="text-white font-bold text-sm">दस्तावेज़ सूची</span>
              </div>
              <div className="px-2.5 py-1 rounded-lg bg-white/10 backdrop-blur-sm text-white text-[10px] font-mono font-semibold">
                {completedMandatoryCount}/{mandatoryCount} अनिवार्य
              </div>
            </div>

            <div>
              {documents.map((doc, index) => (
                <div 
                  key={doc.id}
                  className={`px-4 py-3.5 transition-colors duration-150 ${index !== documents.length - 1 ? 'border-b border-border-custom' : ''} ${doc.checked ? 'bg-green-light/20' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => handleToggleChecked(doc.id)}
                      className={`w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 border-2 transition-all duration-200 cursor-pointer hover:border-saffron ${
                        doc.uploaded || doc.checked
                          ? 'bg-green border-green scale-100'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {(doc.uploaded || doc.checked) && <CheckCircle2 className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-sm font-bold text-navy">{doc.nameHi}</span>
                        {doc.mandatory && <AlertCircle className="w-3.5 h-3.5 text-risk-red" />}
                      </div>
                      <div className="text-xs text-muted-text font-medium">{doc.nameEn}</div>

                      {doc.uploaded && (
                        <div className="mt-2 flex items-center gap-2 p-2 rounded-lg bg-gradient-to-r from-green-light to-green-light/50 border border-green/20">
                          <div className="w-8 h-8 rounded-lg bg-green/10 flex items-center justify-center">
                            <FileText className="w-4 h-4 text-green" strokeWidth={2} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs text-navy font-medium truncate">{doc.fileName}</div>
                            <div className="text-[10px] text-muted-text">{doc.fileSize}</div>
                          </div>
                          <div className="px-2 py-0.5 rounded-md bg-green/10 text-green text-[10px] font-bold">
                            Uploaded
                          </div>
                        </div>
                      )}
                      {doc.checked && !doc.uploaded && (
                        <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-medium">
                          <CheckCircle2 className="w-3 h-3" strokeWidth={2.5} />
                          दस्तावेज़ प्राप्त
                        </div>
                      )}
                    </div>

                    {!doc.uploaded && (
                      <button
                        onClick={() => handleUploadClick(doc.id)}
                        className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-saffron to-saffron-deep hover:from-saffron-hover hover:to-saffron-deep text-white text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 shadow-sm shadow-saffron/20"
                      >
                        <Upload className="w-3.5 h-3.5" strokeWidth={2} />
                        <span>Upload</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="px-4 py-4 bg-gradient-to-b from-slate-50 to-white border-t border-border-custom">
              <div className="mb-2">
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green to-green-deep rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="text-right text-[10px] text-muted-text mt-1 font-medium">
                  {completedMandatoryCount} / {mandatoryCount} दस्तावेज़ पूर्ण
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <NavigationButtons
        onNext={handleContinue}
        nextDisabled={!allMandatoryComplete}
        nextLabel={allMandatoryComplete ? 'आगे बढ़ें' : `${mandatoryCount - completedMandatoryCount} दस्तावेज़ शेष`}
      />

      {uploadError && (
        <div className="px-4 mb-2 animate-slideUp">
          <div className="bg-red-50 border border-risk-red/30 rounded-xl p-3 text-xs text-risk-red flex items-center justify-between shadow-sm">
            <span className="font-medium">{uploadError}</span>
            <button
              className="ml-3 px-3 py-1 bg-navy text-white rounded-lg text-xs font-semibold hover:bg-navy-light transition-colors"
              onClick={() => setUploadError(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".pdf,.png,.jpg,.jpeg,.tiff,.bmp"
        onChange={handleFileSelected}
      />
    </div>
  );
}
