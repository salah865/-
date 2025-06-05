import { Button } from "@/components/ui/button";
import { Globe, Languages } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface AdminLanguageToggleProps {
  className?: string;
}

export const AdminLanguageToggle = ({ className = "" }: AdminLanguageToggleProps) => {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
      className={`flex items-center gap-2 ${className}`}
      title={language === 'ar' ? 'تبديل إلى الإنجليزية' : 'Switch to Arabic'}
    >
      <Globe className="h-4 w-4" />
      <span className="hidden sm:inline">
        {language === 'ar' ? 'EN' : 'عر'}
      </span>
    </Button>
  );
};