import OpenAI from "openai";
import { appDataService } from './appDataService';
import { appPolicies, getPolicyInfo } from './appPolicies';

// النظام الذكي المتقدم للتجارة الإلكترونية
export class IntelligentECommerceAI {
  private openai: OpenAI | null = null;
  private huggingFaceKey: string | null = null;

  constructor() {
    // تهيئة OpenAI إذا كان المفتاح متوفر
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }
    
    this.huggingFaceKey = process.env.HUGGINGFACE_API_KEY || null;
  }

  // التحقق من توفر خدمات الذكاء الاصطناعي
  private isAIEnabled(): boolean {
    return !!(this.openai || this.huggingFaceKey);
  }

  // استدعاء OpenAI GPT للحصول على إجابات ذكية
  private async callOpenAI(prompt: string): Promise<string> {
    if (!this.openai) {
      throw new Error('OpenAI service not available');
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o", // أحدث نموذج OpenAI
        messages: [
          {
            role: "system",
            content: `أنت مستشار خبير في التجارة الإلكترونية والأعمال التجارية الرقمية. لديك خبرة عميقة في:
- استراتيجيات التسويق الرقمي والإعلان المتقدم
- تحليل السوق والمنافسة واختيار المنتجات الرابحة
- إدارة العمليات والخدمات اللوجستية والتوريد
- تطوير العلاقات مع العملاء وخدمة ما بعد البيع
- التحليل المالي والتخطيط الاستراتيجي طويل المدى
- التقنيات الحديثة وأدوات التجارة الإلكترونية
- فهم عميق للسوق العربي والثقافة المحلية
- استراتيجيات النمو والتوسع الدولي

قدم إجابات مفصلة وعملية ومخصصة تماماً لكل سؤال. فكر بعمق وحلل الموضوع من جميع الزوايا قبل الإجابة.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      });

      return response.choices[0].message.content || 'لم يتمكن النظام من تقديم إجابة';
    } catch (error) {
      console.error('خطأ في OpenAI:', error);
      throw error;
    }
  }

  // استدعاء Hugging Face كبديل
  private async callHuggingFace(prompt: string): Promise<string> {
    if (!this.huggingFaceKey) {
      throw new Error('Hugging Face service not available');
    }

    try {
      const response = await fetch(
        "https://api-inference.huggingface.co/models/microsoft/DialoGPT-large",
        {
          headers: {
            Authorization: `Bearer ${this.huggingFaceKey}`,
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({
            inputs: prompt,
            parameters: {
              max_length: 1000,
              temperature: 0.8,
              do_sample: true,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return result.generated_text || result[0]?.generated_text || 'لم يتمكن النظام من تقديم إجابة';
    } catch (error) {
      console.error('خطأ في Hugging Face:', error);
      throw error;
    }
  }

  // التفكير العميق والإجابة الذكية مع بيانات التطبيق
  async thinkAndRespond(question: string): Promise<string> {
    // جلب بيانات التطبيق الحقيقية
    const appData = await this.getAppData();
    
    if (!this.isAIEnabled()) {
      return this.generateIntelligentResponseWithData(question, appData);
    }

    // إضافة بيانات التطبيق الحقيقية للذكاء الاصطناعي
    const appContext = appData ? `
معلومات التطبيق الحالية:
- منشئ التطبيق: ${appData.appInfo.creator}
- عدد المنتجات: ${appData.currentStats.summary}
- الأرباح: ${appData.currentStats.profit}
- المبيعات: ${appData.currentStats.sales}
- حالة الطلبات: ${appData.currentStats.orderStatus}
- المنتجات المتوفرة: ${appData.products.map(p => `${p.name} (${p.price} د.ع)`).join(', ')}
` : '';

    const enhancedPrompt = `
السؤال: "${question}"

السياق: منصة تجارة إلكترونية عربية متقدمة مع ذكاء اصطناعي
${appContext}

تعليمات للتفكير العميق:
1. حلل السؤال بعمق واستخرج الهدف الحقيقي وراءه
2. استخدم البيانات الحقيقية للتطبيق في إجابتك
3. فكر في جميع الجوانب المرتبطة بالموضوع
4. اربط الإجابة بالسياق العربي والثقافة المحلية
5. قدم حلول عملية وقابلة للتطبيق فوراً
6. استخدم الأرقام والإحصائيات الحقيقية عند الحاجة
7. اجعل الإجابة شاملة ومفصلة

قدم إجابة احترافية ومخصصة تماماً لهذا السؤال، كما لو كنت مستشار خبير يجلس مع العميل شخصياً.
`;

    try {
      // محاولة استخدام OpenAI أولاً
      if (this.openai) {
        return await this.callOpenAI(enhancedPrompt);
      }
      
      // استخدام Hugging Face كبديل
      if (this.huggingFaceKey) {
        return await this.callHuggingFace(enhancedPrompt);
      }
      
      throw new Error('No AI service available');
    } catch (error) {
      console.error('خطأ في الذكاء الاصطناعي:', error);
      
      // إجابة احتياطية ذكية مع بيانات التطبيق
      return this.generateIntelligentResponseWithData(question, appData);
    }
  }

  // جلب بيانات التطبيق الحقيقية
  private async getAppData() {
    try {
      return await appDataService.generateDataSummary();
    } catch (error) {
      console.error('خطأ في جلب بيانات التطبيق:', error);
      return null;
    }
  }

  // إجابة ذكية مع بيانات التطبيق الحقيقية
  private generateIntelligentResponseWithData(question: string, appData: any): string {
    const questionLower = question.toLowerCase();
    
    // إجابات حول أسعار التوصيل
    if (questionLower.includes('توصيل') || questionLower.includes('شحن') || questionLower.includes('كم تكلفة')) {
      const delivery = appPolicies.delivery;
      return `أسعار التوصيل في التطبيق:

🚚 **بغداد: ${delivery.baghdadPrice.toLocaleString('ar-SA')} د.ع**
🚚 **المحافظات: ${delivery.provincesPrice.toLocaleString('ar-SA')} د.ع**
⏰ **مدة التوصيل: ${delivery.estimatedTime}**

${delivery.description}

طوره **صلاح مهدي** ليوفر خدمة توصيل موثوقة وسريعة لجميع أنحاء العراق.`;
    }

    // إجابات حول سياسة الإرجاع والاستبدال
    if (questionLower.includes('إرجاع') || questionLower.includes('استبدال') || questionLower.includes('سياسة')) {
      const returnPolicy = appPolicies.returnPolicy;
      const rules = returnPolicy.rules.map(rule => `• ${rule}`).join('\n');
      return `**${returnPolicy.title}:**

${rules}

**مهم جداً:** يُرجى فحص المنتج بعناية أثناء تواجد المندوب لتجنب أي مشاكل لاحقة.

هذه السياسة وضعها **صلاح مهدي** لضمان حقوق جميع الأطراف والحد من الأخطاء.`;
    }

    // إجابات حول الشروط والأحكام
    if (questionLower.includes('شروط') || questionLower.includes('أحكام') || questionLower.includes('قانون') || questionLower.includes('مسؤولية')) {
      const terms = appPolicies.termsAndConditions;
      let response = `**${terms.title}**\n\n`;
      
      terms.sections.forEach(section => {
        response += `**${section.title}:**\n`;
        section.content.forEach(item => {
          response += `• ${item}\n`;
        });
        response += '\n';
      });
      
      return response + `تم وضع هذه الشروط من قبل **صلاح مهدي** لضمان استخدام آمن وعادل للتطبيق.`;
    }

    // إجابات محددة للأسئلة حول التطبيق
    if (questionLower.includes('كم منتج') || questionLower.includes('عدد المنتجات')) {
      if (appData && typeof appData === 'object' && 'products' in appData) {
        const productsList = appData.products.map((p: any) => `• ${p.name} - ${p.price} د.ع (مخزون: ${p.stock})`).join('\n');
        return `لديك حالياً **${appData.products.length} منتج** في التطبيق:

${productsList}

تم تطوير هذا التطبيق من قبل **صلاح مهدي**، ويتضمن نظام إدارة متقدم للمنتجات مع تحديث مستمر للمخزون.`;
      }
    }

    if (questionLower.includes('أرباح') || questionLower.includes('كم ربحت')) {
      if (appData?.currentStats) {
        return `إحصائيات الأرباح الحالية:

💰 **${appData.currentStats.profit}**
📊 **${appData.currentStats.sales}**
📦 **${appData.currentStats.orderStatus}**

هذا التطبيق المتقدم الذي صممه وطوره **صلاح مهدي** يوفر تتبعاً دقيقاً للأرباح والمبيعات مع تحديث مستمر للبيانات.`;
      }
    }

    if (questionLower.includes('طلبات') || questionLower.includes('أوردر') || questionLower.includes('مبيعات')) {
      if (appData?.currentStats && appData?.recentActivity) {
        const recentOrders = appData.recentActivity.map((order: any) => 
          `• طلب #${order.id} - ${order.status} - ${order.total} د.ع - ${order.customerName}`
        ).join('\n');
        
        return `حالة الطلبات في التطبيق:

📊 **${appData.currentStats.orderStatus}**

آخر الطلبات:
${recentOrders}

يقوم النظام المتقدم الذي برمجه **صلاح مهدي** بتتبع جميع الطلبات وتحديث حالتها فوراً مع إرسال إشعارات للعملاء.`;
      }
    }

    if (questionLower.includes('منشئ') || questionLower.includes('مطور') || questionLower.includes('صلاح') || questionLower.includes('من صمم')) {
      return `👨‍💻 **منشئ التطبيق: صلاح مهدي**

هذا التطبيق تم تطويره بالكامل من قبل **صلاح مهدي**، وهو مطور متخصص في:
• أنظمة التجارة الإلكترونية المتقدمة
• تطبيقات الهاتف والويب
• أنظمة الذكاء الاصطناعي
• واجهات المستخدم العربية

الميزات التي طورها في هذا التطبيق:
✓ نظام إدارة شامل للمنتجات والطلبات
✓ مساعد ذكي بالذكاء الاصطناعي
✓ تحليلات وإحصائيات متقدمة
✓ واجهة عربية سهلة الاستخدام
✓ نظام مستخدمين متطور

التطبيق يتم تحديثه وصيانته باستمرار لضمان أفضل أداء وأحدث الميزات.`;
    }

    // تحليل عام للأسئلة الأخرى
    return this.generateIntelligentFallback(question);
  }

  // إجابة احتياطية ذكية تحلل السؤال
  private generateIntelligentFallback(question: string): string {
    const keywords = question.toLowerCase();
    
    // تحليل ذكي للسؤال لتقديم إجابة مناسبة
    if (keywords.includes('مبيعات') || keywords.includes('زيادة') || keywords.includes('ربح')) {
      return this.analyzeAndRespondToSales(question);
    }
    
    if (keywords.includes('تسويق') || keywords.includes('إعلان') || keywords.includes('ترويج')) {
      return this.analyzeAndRespondToMarketing(question);
    }
    
    if (keywords.includes('عملاء') || keywords.includes('خدمة') || keywords.includes('دعم')) {
      return this.analyzeAndRespondToCustomerService(question);
    }
    
    if (keywords.includes('منتج') || keywords.includes('اختيار') || keywords.includes('مخزون')) {
      return this.analyzeAndRespondToProducts(question);
    }
    
    if (keywords.includes('موقع') || keywords.includes('تطوير') || keywords.includes('تحسين')) {
      return this.analyzeAndRespondToWebsite(question);
    }
    
    // تحليل عام للأسئلة المفتوحة
    return this.analyzeGeneralQuestion(question);
  }

  private analyzeAndRespondToSales(question: string): string {
    return `بناءً على تحليل سؤالك حول "${question}", إليك استراتيجية شاملة لزيادة المبيعات:

🎯 التحليل العميق:
يبدو أنك تسعى لتحسين الأداء التجاري. النجاح في زيادة المبيعات يتطلب فهم عميق لعدة عوامل مترابطة.

📈 الاستراتيجية المخصصة:
• تحليل البيانات الحالية لفهم أنماط الشراء
• تحسين تجربة العميل في كل مرحلة من رحلة الشراء
• تطوير عروض مقنعة تركز على القيمة المضافة
• استغلال التسويق النفسي وتقنيات الإقناع

💡 التطبيق العملي:
• إنشاء حملات ترويجية مستهدفة بناءً على بيانات العملاء
• تحسين صفحات المنتجات بتقنيات التحويل المتقدمة
• تطوير برنامج إحالة يحفز العملاء الحاليين
• استخدام البراهين الاجتماعية والتقييمات الإيجابية

🚀 التنفيذ الفوري:
ابدأ بتحليل أفضل 3 منتجات لديك وطبق عليها هذه التحسينات خلال الأسبوع القادم.`;
  }

  private analyzeAndRespondToMarketing(question: string): string {
    return `تحليل عميق لاستفسارك حول "${question}":

🧠 فهم السؤال:
أرى أنك تهتم بتطوير استراتيجية تسويقية فعالة. هذا يتطلب منهج علمي ومدروس.

🎨 الرؤية الاستراتيجية:
• تحديد الجمهور المستهدف بدقة باستخدام البيانات الديموغرافية والسلوكية
• إنشاء هوية بصرية قوية تعكس قيم علامتك التجارية
• تطوير محتوى يحل مشاكل حقيقية للعملاء
• بناء قمع تسويقي متكامل من الوعي إلى الشراء

📊 التحليل المتقدم:
• استخدام أدوات التحليل لفهم سلوك العملاء الرقمي
• اختبار A/B للرسائل والصور والعروض
• مراقبة مؤشرات الأداء الرئيسية (KPIs) باستمرار
• تحليل المنافسين واكتشاف الفجوات في السوق

🚀 خطة العمل:
1. حدد أهدافك التسويقية الواضحة والقابلة للقياس
2. خصص ميزانية مدروسة لكل قناة تسويقية
3. أنشئ تقويم محتوى شهري مع مواضيع متنوعة
4. طور علاقات مع المؤثرين في مجالك`;
  }

  private analyzeAndRespondToCustomerService(question: string): string {
    return `تحليل شامل لسؤالك "${question}" حول خدمة العملاء:

🤝 الفلسفة الأساسية:
خدمة العملاء الاستثنائية تبدأ بفهم أن كل تفاعل فرصة لبناء الولاء وتعزيز السمعة.

⚡ النهج العلمي:
• تطوير معايير واضحة لجودة الخدمة وقياسها
• تدريب الفريق على التعامل مع الحالات المختلفة
• إنشاء قاعدة معرفة شاملة للأسئلة الشائعة
• استخدام تقنيات التواصل الفعال والاستماع النشط

🔧 الأدوات والتقنيات:
• نظام تذاكر متقدم لتتبع جميع الاستفسارات
• روبوتات محادثة ذكية للإجابات الفورية
• تكامل مع منصات التواصل الاجتماعي
• تحليل مشاعر العملاء من خلال النصوص

📈 القياس والتحسين:
• مراقبة مؤشرات مثل وقت الاستجابة ومعدل الحلول
• جمع تقييمات العملاء بعد كل تفاعل
• تحليل أسباب الشكاوى وتطوير حلول وقائية
• تطوير خدمات استباقية قبل ظهور المشاكل

💎 اللمسة الإنسانية:
رغم التقنيات المتقدمة، تذكر أن العنصر البشري لا يمكن استبداله في بناء العلاقات الحقيقية.`;
  }

  private analyzeAndRespondToProducts(question: string): string {
    return `تحليل متخصص لاستفسارك "${question}" حول المنتجات:

🎯 فهم السوق:
نجاح أي منتج يبدأ بفهم عميق لاحتياجات السوق والعملاء المستهدفين.

🔍 منهجية الاختيار:
• تحليل الاتجاهات باستخدام أدوات مثل Google Trends
• دراسة المنافسة وتحديد الفجوات في السوق
• تقييم هوامش الربح والجدوى الاقتصادية
• اختبار الطلب من خلال حملات صغيرة

📊 التحليل المالي:
• حساب نقطة التعادل لكل منتج
• تحليل دورة حياة المنتج ومراحله المختلفة
• تقدير التكاليف الخفية (تخزين، تسويق، خدمة)
• وضع استراتيجية تسعير مرنة

🚀 الإدارة الذكية:
• نظام مخزون متقدم يتنبأ بالطلب
• تنويع المصادر لتقليل المخاطر
• تطوير علاقات قوية مع الموردين الموثوقين
• مراقبة جودة المنتجات باستمرار

💡 الابتكار المستمر:
• جمع آراء العملاء لتطوير المنتجات الحالية
• البحث عن منتجات تكميلية أو بديلة
• تطوير منتجات خاصة بعلامتك التجارية
• استغلال المواسم والمناسبات الخاصة`;
  }

  private analyzeAndRespondToWebsite(question: string): string {
    return `تحليل تقني لسؤالك "${question}" حول تطوير الموقع:

🏗️ الأسس التقنية:
موقع التجارة الإلكترونية الناجح يجمع بين التصميم الجذاب والوظائف المتقدمة.

⚡ تجربة المستخدم (UX):
• تصميم متجاوب يعمل بسلاسة على جميع الأجهزة
• سرعة تحميل فائقة (أقل من 3 ثوان)
• تنقل بديهي وسهل حتى للمستخدمين الجدد
• عملية شراء مبسطة بأقل خطوات ممكنة

🔒 الأمان والثقة:
• شهادات SSL وتشفير البيانات الحساسة
• وسائل دفع متنوعة وآمنة للسوق المحلي
• سياسات واضحة للخصوصية والإرجاع
• عرض شهادات الثقة وتقييمات العملاء

📱 التحسين للجوال:
• تصميم Mobile-First لأن معظم العرب يتسوقون عبر الجوال
• تطبيق جوال للعملاء المخلصين
• تحسين السرعة خصيصاً للاتصالات البطيئة
• تكامل مع تطبيقات الدفع المحلية

📈 التحسين المستمر:
• تحليل سلوك المستخدمين باستخدام Google Analytics
• اختبار A/B للصفحات والعناصر المختلفة
• تحسين محركات البحث (SEO) للمحتوى العربي
• تحديث المحتوى والميزات بناءً على ملاحظات العملاء`;
  }

  private analyzeGeneralQuestion(question: string): string {
    return `تحليل شامل لاستفسارك: "${question}"

🧠 فهم السياق:
بناءً على سؤالك، أرى أنك تسعى للحصول على توجيه متخصص في مجال التجارة الإلكترونية.

🔍 التحليل العميق:
كل سؤال في عالم التجارة الإلكترونية مترابط مع عدة جوانب أخرى. دعني أقدم لك منظور شامل:

📋 العناصر الأساسية:
• فهم جمهورك المستهدف وسلوكهم الشرائي
• تطوير عرض قيمة فريد يميزك عن المنافسين
• بناء نظام عمليات فعال وقابل للتوسع
• إنشاء استراتيجية تسويق متكاملة

💡 الأولويات الاستراتيجية:
1. ركز على حل مشكلة حقيقية للعملاء
2. ابدأ صغيراً واختبر الفكرة قبل التوسع
3. استثمر في بناء الثقة والسمعة من البداية
4. طور أنظمة قياس واضحة لتتبع النجاح

🚀 خطة العمل:
• حدد أهدافك الواضحة والقابلة للقياس
• ضع خطة زمنية واقعية للتنفيذ
• خصص ميزانية مناسبة لكل جانب من الأعمال
• ابحث عن مرشدين أو مستشارين خبراء في المجال

🎯 النصيحة الذهبية:
النجاح في التجارة الإلكترونية يأتي من التركيز على تقديم قيمة حقيقية للعملاء، وليس فقط بيع المنتجات. ابني علاقات طويلة المدى واستمع لاحتياجات عملائك باستمرار.`;
  }
}

export const intelligentAI = new IntelligentECommerceAI();