import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Languages, Globe, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export const LanguageSettings = () => {
  const { language, setLanguage, t, dir } = useLanguage();
  const [selectedLanguage, setSelectedLanguage] = useState(language);

  const handleLanguageChange = (newLanguage: string) => {
    const lang = newLanguage as 'ar' | 'en';
    setSelectedLanguage(lang);
    setLanguage(lang);
  };

  return (
    <div className="space-y-6" dir={dir}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Languages className="h-5 w-5" />
            {t('settings.language')}
          </CardTitle>
          <CardDescription>
            {language === 'ar' 
              ? 'اختر لغة التطبيق المفضلة لديك. سيتم تطبيق التغيير على جميع أجزاء التطبيق فوراً.'
              : 'Choose your preferred application language. Changes will be applied immediately across the entire application.'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup 
            value={selectedLanguage} 
            onValueChange={handleLanguageChange}
            className="space-y-3"
          >
            {/* Arabic Option */}
            <div className="flex items-center space-x-3 space-x-reverse p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <RadioGroupItem value="ar" id="ar" />
              <Label htmlFor="ar" className="flex-1 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-6 bg-gradient-to-r from-red-500 via-white to-black rounded-sm flex items-center justify-center text-xs font-bold">
                      🇰🇼
                    </div>
                    <div>
                      <div className="font-medium">العربية</div>
                      <div className="text-sm text-gray-500">Arabic - اللغة الرسمية</div>
                    </div>
                  </div>
                  {selectedLanguage === 'ar' && (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  )}
                </div>
              </Label>
            </div>

            {/* English Option */}
            <div className="flex items-center space-x-3 space-x-reverse p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <RadioGroupItem value="en" id="en" />
              <Label htmlFor="en" className="flex-1 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-6 bg-gradient-to-r from-blue-600 via-white to-red-600 rounded-sm flex items-center justify-center text-xs font-bold">
                      🇺🇸
                    </div>
                    <div>
                      <div className="font-medium">English</div>
                      <div className="text-sm text-gray-500">English - International Language</div>
                    </div>
                  </div>
                  {selectedLanguage === 'en' && (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  )}
                </div>
              </Label>
            </div>
          </RadioGroup>

          {/* Language Preview */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                {language === 'ar' ? 'معاينة' : 'Preview'}
              </span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">{t('ecommerce.platform')}:</span>
                <span className="font-medium">{t('ecommerce.platform')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('products')}:</span>
                <span className="font-medium">{t('products')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('orders')}:</span>
                <span className="font-medium">{t('orders')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('settings')}:</span>
                <span className="font-medium">{t('settings')}</span>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">
              {language === 'ar' ? (
                <>
                  <strong>ملاحظة:</strong> عند تغيير اللغة، سيتم تحديث:
                  <ul className="mt-2 space-y-1 mr-4">
                    <li>• جميع النصوص في التطبيق</li>
                    <li>• اتجاه النص (من اليمين لليسار أو العكس)</li>
                    <li>• تنسيق التواريخ والأرقام</li>
                    <li>• رسائل النظام والإشعارات</li>
                  </ul>
                </>
              ) : (
                <>
                  <strong>Note:</strong> When changing language, the following will update:
                  <ul className="mt-2 space-y-1 ml-4">
                    <li>• All application text</li>
                    <li>• Text direction (right-to-left or left-to-right)</li>
                    <li>• Date and number formatting</li>
                    <li>• System messages and notifications</li>
                  </ul>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};