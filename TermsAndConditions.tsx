import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronRight } from "lucide-react";

interface TermsAndConditionsProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  required?: boolean;
}

export function TermsAndConditions({ checked, onCheckedChange, required = true }: TermsAndConditionsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const termsContent = {
    title: "الشروط والأحكام",
    contact: {
      location: "اربيل،عينكاوة",
      phone: "+9647801258110",
      company: "للخدمات العامة والاستثمارات والصيانة العامة"
    },
    sections: [
      {
        title: "القبول بشروط الاستخدام",
        content: [
          "مرحباً بك في منصة تاجر. يُعد دخولك إلى المنصة واستخدامك لها، سواء كمستخدم مسجل أو زائر، موافقة صريحة منك على جميع الشروط والأحكام",
          "بمجرد استخدامك لمنصة تاجر، فإنك تقر بتحملك الكامل للمسؤولية القانونية عن أي استخدام غير قانوني أو مخالف",
          "تشمل كلمة 'المنصة' أو 'تاجر' في هذا السياق تطبيق تاجر وجميع الخدمات الرقمية التابعة له"
        ]
      },
      {
        title: "استخدام المنصة",
        content: [
          "تمنحك منصة تاجر ترخيصاً محدوداً باستخدامها وفقاً للشروط القانونية المنصوص عليها",
          "يشمل هذا الترخيص إدارة متجر إلكتروني، بيع المنتجات، عرضها، مشاركتها، ومعالجة الطلبات عبر الإنترنت",
          "يجب أن يكون عمرك 18 عاماً أو أكثر، أو أن تستخدم المنصة تحت إشراف أحد الوالدين أو وصي قانوني",
          "استخدامك شخصي وغير تجاري إلا لما هو مصرح به",
          "أنت مسؤول قانونياً عن أي نشاط يتم من خلال حسابك"
        ]
      },
      {
        title: "الاشتراك ومسؤوليات المستخدم",
        content: [
          "عند الاشتراك يجب تقديم معلومات دقيقة وصحيحة ومحدثة",
          "عدم امتلاك أكثر من حساب واحد",
          "الحفاظ على سرية كلمة المرور وأدوات الدخول",
          "أنت المسؤول الأول عن الأنشطة التي تتم من خلال حسابك",
          "في حال علمت باستخدام غير مصرح به لحسابك، يجب إخطار المنصة فوراً"
        ]
      },
      {
        title: "دور التطبيق والمسؤوليات",
        content: [
          "التطبيق يوفر منصة لعرض المنتجات وإدارة الطلبات فقط",
          "التطبيق يقوم بتوصيل الطلبات وتحويل الأرباح للتجار",
          "التطبيق ليس له علاقة بالتواصل المباشر بين التاجر والزبون",
          "التاجر مسؤول بالكامل عن التواصل مع عملائه",
          "التاجر مسؤول عن جودة المنتجات ووصفها الصحيح",
          "التطبيق غير مسؤول عن النزاعات بين التجار والعملاء",
          "لا تتحمل المنصة مسؤولية أي ترويج تقوم به باسمها"
        ]
      },
      {
        title: "الدفع والتوصيل",
        content: [
          "أسعار التوصيل: 4000 د.ع لبغداد، 5000 د.ع للمحافظات",
          "الدفع عند الاستلام هو الطريقة المعتمدة",
          "التطبيق يحتفظ بنسبة من كل عملية بيع كعمولة",
          "تحويل الأرباح للتجار يتم وفق الجدول المحدد",
          "رسوم التوصيل غير قابلة للاسترداد"
        ]
      },
      {
        title: "سياسة الاستبدال",
        content: [
          "لا يوجد استرجاع للمنتجات - فقط استبدال",
          "فترة الاستبدال: خلال أسبوع من تاريخ الاستلام",
          "يجب فحص المنتج أثناء تواجد المندوب للحد من الأخطاء",
          "المنتج يجب أن يكون في حالته الأصلية مع العبوة",
          "استبدال المنتجات التالفة أو غير المطابقة للوصف فقط"
        ]
      },
      {
        title: "المحتوى الممنوع",
        content: [
          "يُمنع استخدام المنصة لترويج أو بيع المواد الخاضعة للرقابة أو الممنوعة قانونياً",
          "الأسلحة، المخدرات، التبغ، الخمور",
          "المحتوى الإباحي أو العُري",
          "الخدمات الجنسية أو التعليمية حول صناعة الأسلحة أو الأذى",
          "المواد التي تنتهك الملكية الفكرية أو حقوق الغير"
        ]
      },
      {
        title: "الخصوصية وحقوق الملكية الفكرية",
        content: [
          "نلتزم بحماية خصوصيتك وفقاً لسياسة الخصوصية الخاصة بنا",
          "البيانات تستخدم فقط لتحسين الخدمة",
          "لا نشارك بياناتك مع أطراف ثالثة",
          "جميع المحتويات المنشورة على تاجر من نصوص وتصاميم وعلامات تجارية هي ملك للمنصة",
          "لا يجوز نسخها أو استخدامها دون إذن خطي مسبق"
        ]
      },
      {
        title: "حدود المسؤولية والصلاحيات الإدارية",
        content: [
          "منصة تاجر غير مسؤولة عن أي أضرار مباشرة أو غير مباشرة ناتجة عن استخدامك",
          "فقدان الأرباح أو البيانات أو السمعة التجارية",
          "فيروسات أو أعطال تقنية ناتجة عن استخدام المنصة",
          "يحق لإدارة تاجر تعطيل المنصة مؤقتاً أو دائماً لأي سبب",
          "تعديل المحتوى أو حذف الحسابات عند الضرورة",
          "رفض أو قبول أي محتوى يتم رفعه من المستخدمين"
        ]
      },
      {
        title: "التعديلات والإلغاء",
        content: [
          "تحتفظ منصة تاجر بالحق في تعديل هذه الشروط دون إشعار مسبق",
          "سيتم تفعيل التعديلات فور نشرها، ويُعتبر استمرارك في الاستخدام موافقة ضمنية",
          "يجوز للمنصة إلغاء حسابك أو حقوق استخدامك في أي وقت دون إشعار مسبق",
          "هذا الإلغاء لا يعفيك من الالتزامات السابقة"
        ]
      },
      {
        title: "القانون والاختصاص القضائي",
        content: [
          "تخضع هذه الاتفاقية لقوانين جمهورية العراق",
          "تكون المحاكم العراقية هي الجهة الوحيدة المختصة بالنظر في أي نزاع",
          "جهة الاتصال: للخدمات العامة والاستثمارات والصيانة العامة",
          "الموقع: بغداد، الكرادة خارج - الهاتف: +9647801258110"
        ]
      }
    ]
  };

  return (
    <div className="flex items-center space-x-2 space-x-reverse">
      <Checkbox
        id="terms"
        checked={checked}
        onCheckedChange={onCheckedChange}
        required={required}
        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
      />
      <div className="flex items-center space-x-1 space-x-reverse">
        <label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer">
          أوافق على
        </label>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              variant="link"
              className="p-0 h-auto text-sm text-primary underline"
              type="button"
            >
              الشروط والأحكام
              <ChevronRight className="w-4 h-4 mr-1" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-center">
                {termsContent.title}
              </DialogTitle>
            </DialogHeader>
            <ScrollArea className="mt-4 max-h-[60vh]">
              <div className="space-y-6 p-4">
                {termsContent.sections.map((section, index) => (
                  <div key={index} className="space-y-3">
                    <h3 className="text-lg font-semibold text-primary">
                      {section.title}
                    </h3>
                    <ul className="space-y-2">
                      {section.content.map((item, itemIndex) => (
                        <li key={itemIndex} className="text-sm text-gray-700 flex items-start">
                          <span className="text-primary mr-2">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                
                <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">
                    معلومات التواصل
                  </h4>
                  <div className="text-sm text-blue-700 space-y-1">
                    <p><strong>الشركة:</strong> {termsContent.contact.company}</p>
                    <p><strong>الموقع:</strong> {termsContent.contact.location}</p>
                    <p><strong>الهاتف:</strong> {termsContent.contact.phone}</p>
                  </div>
                  <p className="text-sm text-blue-700 mt-3">
                    تم تطوير هذا التطبيق بالكامل من قبل <strong>صلاح مهدي</strong>، 
                    وهو مخصص لتسهيل التجارة الإلكترونية في العراق مع ضمان حقوق جميع الأطراف.
                  </p>
                </div>
              </div>
            </ScrollArea>
            <div className="flex justify-end mt-4">
              <Button onClick={() => setIsOpen(false)}>
                فهمت
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}