import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  Send, 
  Phone, 
  Mail, 
  Clock,
  User,
  Bot,
  X,
  Minimize2,
  Maximize2
} from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'support';
  timestamp: Date;
  status?: 'sent' | 'delivered' | 'read';
}

export const SupportChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasReceivedWelcome, setHasReceivedWelcome] = useState(false);
  const [hasNewMessages, setHasNewMessages] = useState(false);

  const quickReplies = [
    'استفسار عن منتج',
    'مشكلة في الدفع',
    'طلب إرجاع أو استبدال',
    'شكوى أو اقتراح'
  ];

  // استخدام البيانات الافتراضية المحدثة
  const contactSettings = {
    supportPhone: '+9647801258110',
    supportEmail: 'Tajer',
    companyName: 'تاجر'
  };

  const supportInfo = {
    phone: contactSettings?.supportPhone || '+9647801258110',
    email: contactSettings?.supportEmail || 'Tajer',
    workingHours: 'السبت - الخميس: 9:00 - 18:00'
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: 'user',
      timestamp: new Date(),
      status: 'sent'
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = newMessage;
    setNewMessage('');
    setIsTyping(true);

    // إرسال الرسالة إلى Firebase
    try {
      const response = await fetch('/api/support-messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          customerPhone: '07801258110',
          customerName: 'عميل تاجر',
          message: currentMessage,
          isAdminReply: false
        })
      });
      
      if (response.ok) {
        console.log('✅ تم إرسال الرسالة إلى Firebase');
      } else {
        console.error('❌ فشل في إرسال الرسالة');
      }
    } catch (error) {
      console.error('❌ خطأ في إرسال الرسالة:', error);
    }

    // إرسال رد ترحيبي فقط في أول رسالة
    setTimeout(() => {
      if (!hasReceivedWelcome) {
        const welcomeMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: 'مرحباً! أهلاً بك في دعم تاجر. تم استلام رسالتك وسيتم الرد عليك في أقرب وقت ممكن. للمساعدة الفورية، يمكنك الاتصال بنا أو إرسال بريد إلكتروني.',
          sender: 'support',
          timestamp: new Date(),
          status: 'delivered'
        };
        setMessages(prev => [...prev, welcomeMessage]);
        setHasReceivedWelcome(true);
      }
      setIsTyping(false);
      
      // إشعار برسالة جديدة إذا كانت النافذة مغلقة أو مصغرة
      if (!isOpen || isMinimized) {
        setHasNewMessages(true);
      }
    }, 2000);
  };

  const closeChat = () => {
    setIsMinimized(true);
  };

  const openChat = () => {
    setIsOpen(true);
    setHasNewMessages(false);
  };



  const sendQuickReply = (reply: string) => {
    setNewMessage(reply);
    sendMessage();
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div className="relative">
          <Button
            onClick={openChat}
            className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-105"
          >
            <MessageCircle className="w-7 h-7 text-white" />
          </Button>
          {hasNewMessages && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
              <div className="w-3 h-3 bg-red-400 rounded-full animate-ping"></div>
            </div>
          )}
          <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
        </div>
        
        {/* تلميح صغير */}
        <div className="absolute bottom-20 right-2 bg-white rounded-lg shadow-lg p-3 max-w-xs opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <p className="text-sm text-slate-700 font-medium">💬 هل تحتاج مساعدة؟</p>
          <p className="text-xs text-slate-500">اضغط للتحدث مع فريق الدعم</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-w-[calc(100vw-2rem)]">
      <Card className="shadow-2xl border-purple-200 bg-white rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold">دعم تاجر</CardTitle>
                <div className="flex items-center gap-2 text-purple-100">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm">متاح الآن</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-white hover:bg-purple-500 h-8 w-8 p-0"
                title={isMinimized ? 'توسيع' : 'تصغير'}
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeChat}
                className="text-white hover:bg-purple-500 h-8 w-8 p-0"
                title="إغلاق"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0">
            {/* منطقة الرسائل */}
            <div className="h-80 overflow-y-auto p-4 space-y-4 bg-slate-50">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      message.sender === 'user'
                        ? 'bg-purple-600 text-white'
                        : 'bg-white text-slate-900 border'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {message.sender === 'support' ? (
                        <Bot className="w-4 h-4 text-purple-600" />
                      ) : (
                        <User className="w-4 h-4" />
                      )}
                      <span className="text-xs opacity-75">
                        {message.timestamp.toLocaleTimeString('ar-IQ', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <p className="text-sm">{message.text}</p>
                    {message.sender === 'user' && (
                      <div className="mt-1 text-xs opacity-75">
                        {message.status === 'sent' && '✓'}
                        {message.status === 'delivered' && '✓✓'}
                        {message.status === 'read' && '✓✓ مقروءة'}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border rounded-lg px-4 py-2 max-w-xs">
                    <div className="flex items-center gap-2">
                      <Bot className="w-4 h-4 text-purple-600" />
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* الردود السريعة */}
            <div className="p-4 border-t bg-white">
              <p className="text-sm text-slate-600 mb-2">ردود سريعة:</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {quickReplies.map((reply, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="cursor-pointer hover:bg-purple-100 text-xs"
                    onClick={() => sendQuickReply(reply)}
                  >
                    {reply}
                  </Badge>
                ))}
              </div>
            </div>

            {/* حقل إدخال الرسالة */}
            <div className="p-4 border-t bg-white">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="اكتب رسالتك..."
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  className="flex-1"
                />
                <Button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* معلومات الاتصال */}
            <div className="p-4 border-t bg-gradient-to-r from-slate-50 to-purple-50">
              <p className="text-sm font-medium text-slate-900 mb-3 flex items-center gap-2">
                <Phone className="w-4 h-4 text-purple-600" />
                طرق التواصل الأخرى
              </p>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3 p-2 bg-white rounded-lg shadow-sm">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Phone className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-slate-700 font-medium">{supportInfo.phone}</span>
                </div>
                <div className="flex items-center gap-3 p-2 bg-white rounded-lg shadow-sm">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Mail className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-slate-700 font-medium">{supportInfo.email}</span>
                </div>
                <div className="flex items-center gap-3 p-2 bg-white rounded-lg shadow-sm">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <Clock className="w-4 h-4 text-orange-600" />
                  </div>
                  <span className="text-slate-700 font-medium">{supportInfo.workingHours}</span>
                </div>
              </div>
              

            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};