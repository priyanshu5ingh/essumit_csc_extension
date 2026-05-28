import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Check } from 'lucide-react';
import ChatBubble from '../components/ChatBubble';
import NavigationButtons from '../components/NavigationButtons';
import { services } from '../config/services';

export default function ServiceSelection() {
  const navigate = useNavigate();
  const location = useLocation();
  const { name, mobile } = location.state || {};
  const [selectedService, setSelectedService] = useState<string | null>(null);

  const handleContinue = () => {
    if (selectedService) {
      navigate('/documents', { state: { name, mobile, serviceId: selectedService } });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto py-6">
        <ChatBubble 
          type="user"
          content={`${name} • +91 ${mobile}`}
        />

        <ChatBubble 
          type="bot"
          titleHi="कौन सी सेवा चाहिए?"
          titleEn="Which service is needed?"
        />

        <div className="px-4 mb-4">
          <div className="grid grid-cols-2 gap-3">
            {services.map((service) => {
              const Icon = service.icon;
              const isSelected = selectedService === service.id;
              
              return (
                <button
                  key={service.id}
                  onClick={() => setSelectedService(service.id)}
                  className={`relative p-4 rounded-xl border-2 transition-all duration-200 active:scale-[0.97] ${
                    isSelected
                      ? 'border-green bg-gradient-to-b from-green-light to-white shadow-md shadow-green/10'
                      : 'border-border-custom bg-surface hover:border-saffron/40 hover:shadow-card-hover shadow-card'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-green flex items-center justify-center shadow-sm animate-slideUp">
                      <Check className="w-3 h-3 text-white" strokeWidth={3} />
                    </div>
                  )}
                  
                  <div className={`w-10 h-10 rounded-xl mb-3 flex items-center justify-center mx-auto transition-all duration-200 ${
                    isSelected ? 'bg-green/10 scale-110' : 'bg-navy/5'
                  }`}>
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-green' : 'text-navy'}`} strokeWidth={2} />
                  </div>
                  
                  <div className={`text-xs font-bold text-center mb-0.5 ${isSelected ? 'text-green-deep' : 'text-navy'}`}>
                    {service.nameHi}
                  </div>
                  
                  <div className="text-[10px] text-muted-text text-center leading-tight font-medium">
                    {service.nameEn}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <NavigationButtons
        onNext={handleContinue}
        nextDisabled={!selectedService}
      />
    </div>
  );
}
