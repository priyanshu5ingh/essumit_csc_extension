import { useState } from 'react';
import { useNavigate } from 'react-router';
import { User, IdCard, LogIn, Loader2 } from 'lucide-react';

const OPERATOR_STORAGE_KEY = 'csc_operator';

export interface OperatorInfo {
  username: string;
  operatorId: string;
}

export default function OperatorLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [operatorId, setOperatorId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const u = username.trim();
    const id = operatorId.trim();
    if (!u || !id) {
      setError('कृपया ऑपरेटर यूज़रनेम और ऑपरेटर ID भरें। / Please enter Operator Username and Operator ID.');
      return;
    }
    setError('');
    const info: OperatorInfo = { username: u, operatorId: id };
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.set({ [OPERATOR_STORAGE_KEY]: info });
    }
    setLoading(true);

    setTimeout(() => {
      navigate('/welcome');
    }, 800);
  };

  return (
    <div className="h-full flex items-center justify-center px-4 md:px-8 py-4 md:py-8">
      <div className="w-full max-w-sm md:max-w-md animate-slideUp">
        <div className="bg-surface rounded-xl p-6 border border-border-custom shadow-card">
          <div className="mb-6 text-center">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-saffron to-saffron-deep flex items-center justify-center mx-auto mb-4 shadow-lg shadow-saffron/20">
              <User className="w-7 h-7 text-white" strokeWidth={2} />
            </div>
            <h2 className="text-lg font-bold text-navy mb-1">ऑपरेटर लॉगिन</h2>
            <p className="text-sm text-muted-text">Operator Login</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-navy mb-1.5">
                यूज़रनेम / Username <span className="text-risk-red">*</span>
              </label>
              <div className="relative group">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-text group-focus-within:text-saffron transition-colors duration-200" strokeWidth={2} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="w-full min-h-[44px] md:h-10 pl-10 pr-3 rounded-lg border border-border-custom bg-white text-sm text-navy placeholder:text-muted-text focus:outline-none focus:ring-2 focus:ring-saffron/30 focus:border-saffron transition-all duration-200"
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy mb-1.5">
                ऑपरेटर ID <span className="text-risk-red">*</span>
              </label>
              <div className="relative group">
                <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-text group-focus-within:text-saffron transition-colors duration-200" strokeWidth={2} />
                <input
                  type="text"
                  value={operatorId}
                  onChange={(e) => setOperatorId(e.target.value)}
                  placeholder="Enter operator ID"
                  className="w-full h-10 pl-10 pr-3 rounded-lg border border-border-custom bg-white text-sm text-navy placeholder:text-muted-text focus:outline-none focus:ring-2 focus:ring-saffron/30 focus:border-saffron transition-all duration-200"
                  autoComplete="off"
                />
              </div>
            </div>

            {error && (
              <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2.5">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[44px] rounded-lg bg-gradient-to-r from-saffron to-saffron-deep hover:from-saffron-hover hover:to-saffron-deep active:scale-[0.98] text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 shadow-md shadow-saffron/20 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" strokeWidth={2} />
                  <span>प्रवेश करें / Continue</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-border-custom text-center">
            <p className="text-[10px] text-muted-text font-medium">
              v1.0.0 &mdash; CHIPS Chhattisgarh &mdash; Government of India
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
