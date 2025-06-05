import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Bot, 
  TrendingUp, 
  Target, 
  Lightbulb, 
  DollarSign, 
  BarChart3, 
  MessageCircle, 
  Sparkles,
  ShoppingCart,
  Users,
  Star,
  Zap,
  Brain,
  ArrowRight
} from "lucide-react";

interface AIResponse {
  insights?: string[];
  recommendations?: string[];
  strategies?: string[];
  tips?: string[];
  analysis?: string;
  response?: string;
}

export const ECommerceAIAssistant = () => {
  const [activeSection, setActiveSection] = useState<string>('overview');
  const [question, setQuestion] = useState('');
  const [productName, setProductName] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [marketingBudget, setMarketingBudget] = useState('');
  const [businessGoal, setBusinessGoal] = useState('');
  
  const [businessInsights, setBusinessInsights] = useState<AIResponse | null>(null);
  const [productAnalysis, setProductAnalysis] = useState<AIResponse | null>(null);
  const [marketingStrategy, setMarketingStrategy] = useState<AIResponse | null>(null);
  const [customerAdvice, setCustomerAdvice] = useState<AIResponse | null>(null);
  const [generalResponse, setGeneralResponse] = useState<AIResponse | null>(null);

  const { toast } = useToast();

  // تحليل الأعمال الشامل
  const businessAnalysisMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/ai/business-analysis', {
        goal: businessGoal
      });
      return await response.json();
    },
    onSuccess: (data: AIResponse) => {
      setBusinessInsights(data);
      toast({
        title: "تم التحليل",
        description: "تم إجراء التحليل الشامل لأعمالك بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في تحليل الأعمال",
        variant: "destructive",
      });
    }
  });

  // تحليل المنتجات الرابحة
  const productAnalysisMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/ai/product-analysis', {
        productName,
        category: productCategory
      });
      return await response.json();
    },
    onSuccess: (data: AIResponse) => {
      setProductAnalysis(data);
      toast({
        title: "تم التحليل",
        description: "تم تحليل المنتج وتحديد إمكانياته الربحية",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في تحليل المنتج",
        variant: "destructive",
      });
    }
  });

  // استراتيجيات التسويق والإعلان
  const marketingStrategyMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/ai/marketing-strategy', {
        budget: marketingBudget,
        goal: businessGoal
      });
      return await response.json();
    },
    onSuccess: (data: AIResponse) => {
      setMarketingStrategy(data);
      toast({
        title: "تم التحليل",
        description: "تم إنشاء استراتيجية التسويق المخصصة",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في إنشاء استراتيجية التسويق",
        variant: "destructive",
      });
    }
  });

  // مساعد عام للتجارة الإلكترونية مع Gemini AI
  const generalAssistantMutation = useMutation({
    mutationFn: async () => {
      const userId = `user_${Date.now()}`;
      const response = await apiRequest('POST', '/api/ai/ask', {
        question,
        userId
      });
      const data = await response.json();
      return data;
    },
    onSuccess: (data: any) => {
      console.log('Response received:', data);
      if (data && data.reply) {
        setGeneralResponse({ response: data.reply });
        toast({
          title: "تم الرد",
          description: "حصلت على إجابة شاملة من المساعد الذكي",
        });
      } else {
        throw new Error('Invalid response format');
      }
    },
    onError: (error: any) => {
      console.error('Error in general assistant:', error);
      toast({
        title: "خطأ", 
        description: "فشل في الحصول على إجابة",
        variant: "destructive",
      });
    }
  });

  const sections = [
    {
      id: 'overview',
      title: 'نظرة عامة',
      icon: Brain,
      color: 'bg-blue-500'
    },
    {
      id: 'business',
      title: 'تحليل الأعمال',
      icon: BarChart3,
      color: 'bg-green-500'
    },
    {
      id: 'products',
      title: 'المنتجات الرابحة',
      icon: TrendingUp,
      color: 'bg-yellow-500'
    },
    {
      id: 'marketing',
      title: 'التسويق والإعلان',
      icon: Target,
      color: 'bg-red-500'
    },
    {
      id: 'assistant',
      title: 'المساعد العام',
      icon: MessageCircle,
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="space-y-6" dir="rtl">
      {/* العنوان الرئيسي */}
      <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl">
            <Bot className="w-6 h-6" />
            مساعد التجارة الإلكترونية الذكي
            <Sparkles className="w-5 h-5" />
          </CardTitle>
          <p className="text-purple-100">
            مساعدك الشخصي لنجاح أعمالك التجارية - تحليلات ذكية واستراتيجيات مخصصة
          </p>
        </CardHeader>
      </Card>

      {/* أقسام المساعد */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {sections.map((section) => {
          const IconComponent = section.icon;
          return (
            <Button
              key={section.id}
              variant={activeSection === section.id ? "default" : "outline"}
              className={`flex flex-col items-center gap-2 h-auto py-4 ${
                activeSection === section.id ? section.color : ''
              }`}
              onClick={() => setActiveSection(section.id)}
            >
              <IconComponent className="w-5 h-5" />
              <span className="text-xs font-medium">{section.title}</span>
            </Button>
          );
        })}
      </div>

      {/* محتوى القسم النشط */}
      {activeSection === 'overview' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-600" />
              مساعد التجارة الإلكترونية الشامل
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  تحليل الأعمال
                </h4>
                <p className="text-sm text-blue-600">
                  احصل على تحليل شامل لأداء أعمالك مع توصيات مخصصة لتحسين الأرباح والنمو
                </p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  المنتجات الرابحة
                </h4>
                <p className="text-sm text-green-600">
                  اكتشف المنتجات الأكثر ربحية وتعلم كيفية اختيار المنتجات المناسبة لمتجرك
                </p>
              </div>
              
              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  التسويق والإعلان
                </h4>
                <p className="text-sm text-red-600">
                  استراتيجيات تسويق مخصصة وطرق إنشاء إعلانات فعالة لزيادة المبيعات
                </p>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-800 mb-2 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  مساعد شامل
                </h4>
                <p className="text-sm text-purple-600">
                  اسأل أي سؤال حول التجارة الإلكترونية واحصل على إجابات خبير فورية
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeSection === 'business' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-green-600" />
              تحليل الأعمال الشامل
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">ما هو هدفك التجاري الحالي؟</label>
              <Textarea
                placeholder="مثال: زيادة المبيعات، توسيع قاعدة العملاء، تحسين الأرباح..."
                value={businessGoal}
                onChange={(e) => setBusinessGoal(e.target.value)}
                className="min-h-[80px]"
              />
            </div>
            
            <Button 
              onClick={() => businessAnalysisMutation.mutate()}
              disabled={businessAnalysisMutation.isPending || !businessGoal}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {businessAnalysisMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  جاري التحليل...
                </div>
              ) : (
                <>
                  <BarChart3 className="w-4 h-4 ml-2" />
                  تحليل أعمالي الآن
                </>
              )}
            </Button>

            {businessInsights && (
              <div className="bg-green-50 p-4 rounded-lg space-y-3">
                <h4 className="font-semibold text-green-800">نتائج التحليل:</h4>
                
                {businessInsights.insights && (
                  <div>
                    <h5 className="font-medium text-green-700 mb-2">الرؤى والملاحظات:</h5>
                    <div className="space-y-1">
                      {businessInsights.insights.map((insight, index) => (
                        <p key={index} className="text-sm text-green-600 flex items-start gap-2">
                          <Lightbulb className="w-3 h-3 mt-1 flex-shrink-0" />
                          {insight}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {businessInsights.recommendations && (
                  <div>
                    <h5 className="font-medium text-green-700 mb-2">التوصيات:</h5>
                    <div className="space-y-1">
                      {businessInsights.recommendations.map((rec, index) => (
                        <p key={index} className="text-sm text-green-600 flex items-start gap-2">
                          <ArrowRight className="w-3 h-3 mt-1 flex-shrink-0" />
                          {rec}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeSection === 'products' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-yellow-600" />
              تحليل المنتجات الرابحة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">اسم المنتج</label>
                <Input
                  placeholder="مثال: سماعات لاسلكية"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">فئة المنتج</label>
                <Input
                  placeholder="مثال: إلكترونيات، موضة، منزل..."
                  value={productCategory}
                  onChange={(e) => setProductCategory(e.target.value)}
                />
              </div>
            </div>
            
            <Button 
              onClick={() => productAnalysisMutation.mutate()}
              disabled={productAnalysisMutation.isPending || !productName}
              className="w-full bg-yellow-600 hover:bg-yellow-700"
            >
              {productAnalysisMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  جاري التحليل...
                </div>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4 ml-2" />
                  تحليل ربحية المنتج
                </>
              )}
            </Button>

            {productAnalysis && (
              <div className="bg-yellow-50 p-4 rounded-lg space-y-3">
                <h4 className="font-semibold text-yellow-800">تحليل المنتج:</h4>
                
                {productAnalysis.insights && (
                  <div>
                    <h5 className="font-medium text-yellow-700 mb-2">تحليل الربحية:</h5>
                    <div className="space-y-1">
                      {productAnalysis.insights.map((insight, index) => (
                        <p key={index} className="text-sm text-yellow-600 flex items-start gap-2">
                          <DollarSign className="w-3 h-3 mt-1 flex-shrink-0" />
                          {insight}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {productAnalysis.tips && (
                  <div>
                    <h5 className="font-medium text-yellow-700 mb-2">نصائح للنجاح:</h5>
                    <div className="space-y-1">
                      {productAnalysis.tips.map((tip, index) => (
                        <p key={index} className="text-sm text-yellow-600 flex items-start gap-2">
                          <Star className="w-3 h-3 mt-1 flex-shrink-0" />
                          {tip}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeSection === 'marketing' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-red-600" />
              استراتيجيات التسويق والإعلان
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">الميزانية المتاحة للتسويق</label>
              <Input
                placeholder="مثال: 500 دولار شهرياً"
                value={marketingBudget}
                onChange={(e) => setMarketingBudget(e.target.value)}
              />
            </div>
            
            <Button 
              onClick={() => marketingStrategyMutation.mutate()}
              disabled={marketingStrategyMutation.isPending}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              {marketingStrategyMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  جاري إنشاء الاستراتيجية...
                </div>
              ) : (
                <>
                  <Target className="w-4 h-4 ml-2" />
                  إنشاء استراتيجية تسويق
                </>
              )}
            </Button>

            {marketingStrategy && (
              <div className="bg-red-50 p-4 rounded-lg space-y-3">
                <h4 className="font-semibold text-red-800">استراتيجية التسويق:</h4>
                
                {marketingStrategy.strategies && (
                  <div>
                    <h5 className="font-medium text-red-700 mb-2">الاستراتيجيات المقترحة:</h5>
                    <div className="space-y-1">
                      {marketingStrategy.strategies.map((strategy, index) => (
                        <p key={index} className="text-sm text-red-600 flex items-start gap-2">
                          <Zap className="w-3 h-3 mt-1 flex-shrink-0" />
                          {strategy}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {marketingStrategy.tips && (
                  <div>
                    <h5 className="font-medium text-red-700 mb-2">نصائح الإعلان:</h5>
                    <div className="space-y-1">
                      {marketingStrategy.tips.map((tip, index) => (
                        <p key={index} className="text-sm text-red-600 flex items-start gap-2">
                          <Target className="w-3 h-3 mt-1 flex-shrink-0" />
                          {tip}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeSection === 'assistant' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-purple-600" />
              المساعد الذكي المتقدم - Gemini AI
              <Sparkles className="w-4 h-4 text-yellow-500" />
            </CardTitle>
            <p className="text-sm text-gray-600 mt-2">
              مدعوم بتقنية Gemini من Google - تحليل عميق وإجابات شاملة بدون قيود
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200">
              <h4 className="font-semibold text-purple-800 mb-2 flex items-center gap-2">
                <Brain className="w-4 h-4" />
                ميزات الذكاء الاصطناعي المتقدم
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2 text-purple-700">
                  <Zap className="w-3 h-3" />
                  تحليل عميق ومفصل
                </div>
                <div className="flex items-center gap-2 text-purple-700">
                  <Target className="w-3 h-3" />
                  إجابات مخصصة لحالتك
                </div>
                <div className="flex items-center gap-2 text-purple-700">
                  <TrendingUp className="w-3 h-3" />
                  توصيات قابلة للتطبيق
                </div>
                <div className="flex items-center gap-2 text-purple-700">
                  <Lightbulb className="w-3 h-3" />
                  أفكار إبداعية ومبتكرة
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">اسأل أي سؤال - بدون قيود أو حدود</label>
              <Textarea
                placeholder="اسأل أي شيء عن التجارة الإلكترونية، التسويق، الأعمال، الربح، التطوير... المساعد الذكي سيحلل سؤالك بعمق ويقدم إجابة شاملة ومفصلة تساعدك على النجاح."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="min-h-[120px] text-right"
                dir="rtl"
              />
              <div className="text-xs text-gray-500 mt-1 text-right">
                💡 نصيحة: كن محدداً في سؤالك للحصول على إجابة أكثر دقة وفائدة
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuestion("كيف أضاعف أرباح متجري الإلكتروني خلال 3 أشهر؟")}
                className="text-xs"
              >
                مضاعفة الأرباح
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuestion("ما هي أفضل استراتيجيات التسويق الرقمي لعام 2024؟")}
                className="text-xs"
              >
                التسويق الرقمي
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuestion("كيف أختار المنتجات الرابحة وأتجنب الخسائر؟")}
                className="text-xs"
              >
                اختيار المنتجات
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuestion("كيف أبني علامة تجارية قوية ومميزة؟")}
                className="text-xs"
              >
                بناء العلامة التجارية
              </Button>
            </div>
            
            <Button 
              onClick={() => generalAssistantMutation.mutate()}
              disabled={generalAssistantMutation.isPending || !question}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-3"
            >
              {generalAssistantMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  جاري التحليل العميق مع Gemini AI...
                </div>
              ) : (
                <>
                  <Brain className="w-4 h-4 ml-2" />
                  تحليل مع الذكاء الاصطناعي المتقدم
                  <Sparkles className="w-4 h-4 mr-2" />
                </>
              )}
            </Button>

            {generalResponse && (
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-lg border border-purple-200 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Bot className="w-5 h-5 text-purple-600" />
                  <h4 className="font-semibold text-purple-800">تحليل الذكاء الاصطناعي المتقدم</h4>
                  <Sparkles className="w-4 h-4 text-yellow-500" />
                </div>
                <div className="bg-white p-4 rounded-lg border border-purple-100">
                  <div className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {generalResponse.response || generalResponse.analysis}
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs text-purple-600">
                  <Zap className="w-3 h-3" />
                  مدعوم بتقنية Gemini AI من Google
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};