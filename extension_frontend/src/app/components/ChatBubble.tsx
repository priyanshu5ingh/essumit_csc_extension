import { Bot, User } from 'lucide-react';

export interface ChatBubbleProps {
  type: 'bot' | 'user';
  titleHi?: string;
  titleEn?: string;
  content?: string;
  hasRedBorder?: boolean;
}

export default function ChatBubble({ type, titleHi, titleEn, content, hasRedBorder }: ChatBubbleProps) {
  if (type === 'bot') {
    return (
      <div className="px-4 mb-4 animate-slideUp">
        <div className={`flex items-start gap-2.5 ${
          hasRedBorder
            ? 'bg-gradient-to-r from-red-50 to-red-50/50 border border-red-200'
            : 'bg-gradient-to-r from-saffron-light to-amber-50 border border-saffron/10'
        } rounded-xl p-3.5 shadow-sm`}>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
            hasRedBorder ? 'bg-red-100' : 'bg-saffron/10'
          }`}>
            <Bot className={`w-4 h-4 ${hasRedBorder ? 'text-red-500' : 'text-saffron'}`} strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            {titleHi && (
              <div className={`text-sm font-semibold mb-0.5 ${hasRedBorder ? 'text-red-700' : 'text-navy'}`}>
                {titleHi}
              </div>
            )}
            {titleEn && (
              <div className="text-xs text-muted-text font-medium">
                {titleEn}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 mb-4 flex justify-end animate-slideUp">
      <div className="flex items-end gap-2 max-w-[85%]">
        <div className="bg-gradient-to-br from-saffron to-saffron-deep text-white rounded-2xl rounded-br-md px-4 py-2.5 shadow-md shadow-saffron/20">
          <div className="text-sm font-medium leading-relaxed">{content}</div>
        </div>
        <div className="w-7 h-7 rounded-full bg-saffron/20 flex items-center justify-center flex-shrink-0 mb-0.5">
          <User className="w-3.5 h-3.5 text-saffron" strokeWidth={2.5} />
        </div>
      </div>
    </div>
  );
}
