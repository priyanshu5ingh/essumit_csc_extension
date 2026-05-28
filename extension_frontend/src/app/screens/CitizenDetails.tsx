import { useState } from 'react';
import { useNavigate } from 'react-router';
import { User, Phone, Info } from 'lucide-react';
import ChatBubble from '../components/ChatBubble';
import NavigationButtons from '../components/NavigationButtons';

export default function CitizenDetails() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && mobile) {
      navigate('/service-selection', { state: { name, mobile } });
    }
  };

  const handleNext = () => {
    if (name && mobile) {
      navigate('/service-selection', { state: { name, mobile } });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto py-6">
        <ChatBubble 
          type="bot"
          titleHi="नागरिक की जानकारी दें"
          titleEn="Enter citizen details"
        />

        <div className="px-4 animate-slideUp">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-surface rounded-xl p-4 border border-border-custom shadow-card space-y-4">
              <div>
                <label className="block text-xs font-semibold text-navy mb-1.5">
                  नाम / Name <span className="text-risk-red">*</span>
                </label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-text group-focus-within:text-saffron transition-colors duration-200" strokeWidth={2} />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="पूरा नाम लिखें / Enter full name"
                    className="w-full h-11 pl-10 pr-4 rounded-lg border border-border-custom bg-white text-sm text-navy placeholder:text-muted-text focus:outline-none focus:ring-2 focus:ring-saffron/30 focus:border-saffron transition-all duration-200"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy mb-1.5">
                  मोबाइल / Mobile <span className="text-risk-red">*</span>
                </label>
                <div className="relative group">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-text group-focus-within:text-saffron transition-colors duration-200" strokeWidth={2} />
                  <div className="absolute left-10 top-1/2 -translate-y-1/2 text-sm text-muted-text font-medium border-r border-border-custom pr-2">
                    +91
                  </div>
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="10 अंकों का नंबर"
                    className="w-full h-11 pl-[76px] pr-4 rounded-lg border border-border-custom bg-white text-sm text-navy placeholder:text-muted-text focus:outline-none focus:ring-2 focus:ring-saffron/30 focus:border-saffron transition-all duration-200"
                    required
                    maxLength={10}
                  />
                </div>
                {mobile && mobile.length === 10 && (
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green"></div>
                    <span className="text-[10px] text-green font-semibold">Valid number</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-blue-50/80 border border-blue-200/60 rounded-xl p-3.5 flex gap-2.5">
              <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" strokeWidth={2} />
              <div className="text-xs text-navy leading-relaxed">
                <span className="font-semibold">ध्यान दें:</span> इस मोबाइल नंबर पर SMS आएगा।
                <br />
                <span className="text-[10px] text-muted-text font-medium">SMS updates will be sent to this number.</span>
              </div>
            </div>
          </form>
        </div>
      </div>

      <NavigationButtons
        onBack={() => navigate('/welcome')}
        onNext={handleNext}
        nextDisabled={!name || !mobile || mobile.length !== 10}
      />
    </div>
  );
}
