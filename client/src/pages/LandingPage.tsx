import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { motion, useScroll } from "framer-motion";
import { NetworkAnimation } from "@/components/NetworkAnimation";
import { Bot, Filter, Bell } from "lucide-react";
import { useSwipeable } from "react-swipeable";

export default function LandingPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [formData, setFormData] = useState({ email: "", message: "" });
  const [status, setStatus] = useState(null);
  const [activeSection, setActiveSection] = useState(0);
  const sections = ["hero", "info", "bot", "telegram", "contact"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      console.log(formData);
      setStatus("ההודעה נשלחה בהצלחה!");
      setFormData({ email: "", message: "" });
    } catch (error) {
      console.error(error);
      setStatus("ארעה שגיאה. אנא נסה שוב מאוחר יותר.");
    }
  };

  // Scroll handling with Intersection Observer
  useEffect(() => {
    const observers = sections.map((section, index) => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveSection(index);
            }
          });
        },
        {
          threshold: 0.5, // Trigger when 50% of the section is visible
          rootMargin: "0px",
        },
      );

      const element = document.getElementById(section);
      if (element) observer.observe(element);

      return observer;
    });

    // Cleanup
    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, []);

  // Swipe handling
  const handlers = useSwipeable({
    onSwipedUp: () => {
      if (activeSection < sections.length - 1) {
        const nextSection = document.getElementById(
          sections[activeSection + 1],
        );
        nextSection?.scrollIntoView({ behavior: "smooth" });
      }
    },
    onSwipedDown: () => {
      if (activeSection > 0) {
        const prevSection = document.getElementById(
          sections[activeSection - 1],
        );
        prevSection?.scrollIntoView({ behavior: "smooth" });
      }
    },
    preventDefaultTouchmoveEvent: true,
    trackMouse: false,
  });

  const handleDotClick = (index: number) => {
    const section = document.getElementById(sections[index]);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
      setActiveSection(index);
    }
  };

  // Common section wrapper class
  const sectionClass =
    "h-screen snap-start snap-always flex items-center relative overflow-y-hidden";
  const containerClass = "container mx-auto px-4 py-8 md:py-0"; // Added padding for mobile
  const contentWrapperClass =
    "max-w-4xl mx-auto space-y-8 flex flex-col h-full justify-center"; // Added flex and height control

  return (
    <div
      {...handlers}
      className="h-screen snap-y snap-mandatory overflow-y-scroll scroll-smooth relative"
      style={{
        scrollbarWidth: "none", // Firefox
        msOverflowStyle: "none", // IE and Edge
        WebkitOverflowScrolling: "touch",
      }}
    >
      {/* Hide scrollbar for Chrome, Safari and Opera */}
      <style jsx global>{`
        .snap-y::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* Scroll Indicators */}
      <div className="fixed right-4 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3">
        {sections.map((section, index) => (
          <motion.div
            key={section}
            className="cursor-pointer"
            onClick={() => handleDotClick(index)}
            initial={{ scale: 1 }}
            animate={{
              scale: activeSection === index ? 1.2 : 1,
              opacity: activeSection === index ? 1 : 0.5,
            }}
            whileHover={{ scale: 1.2 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                activeSection === index
                  ? "bg-primary shadow-[0_0_10px_rgba(var(--primary))]"
                  : "bg-muted-foreground hover:bg-primary/50"
              }`}
            />
          </motion.div>
        ))}
      </div>

      {/* Hero Section */}
      <section
        id="hero"
        className="h-screen snap-start snap-always flex items-center relative"
      >
        <NetworkAnimation
          desktopHouses={6}
          desktopPeople={5}
          mobileHouses={4}
          mobilePeople={3}
        />
        <div className="container mx-auto px-4 max-w-[1280px] w-[95%] pt-20 md:pt-0">
          <motion.div
            className="py-24 md:py-32 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.h1
              className="text-5xl md:text-6xl font-bold mb-14 mt-20 md:mt-44 bg-gradient-to-r from-primary via-primary/60 to-primary bg-clip-text text-transparent"
              animate={{ backgroundPosition: ["0%", "100%", "0%"] }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            >
              מוצאים לכם דירות להשכרה{" "}
            </motion.h1>

            <motion.p
              className="text-xl md:text-2xl text-muted-foreground mb-20 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              העזרו בבוט האישי לקבלת התראות על דירות המותאמות ספציפית אליכם
            </motion.p>

            <motion.div
              className="flex gap-4 justify-center mb-72"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Button
                size="lg"
                className="relative group bg-primary hover:bg-primary/90 text-xl px-10 py-7 rounded-full overflow-hidden"
                asChild
              >
                <a
                  href="https://t.me/The_Underdog_bot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative z-10 flex items-center gap-3"
                >
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Bot className="w-7 h-7" />
                  </motion.div>
                  <span>התחל עכשיו עם הסוכן האישי ✨</span>
                  <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary via-purple-500 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </a>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Info Section */}
      <section
        id="info"
        className="h-screen snap-start snap-always flex items-start pt-14 md:pt-44 relative"
      >
        <div className="container mx-auto px-4 max-w-[1280px] w-[95%] pt-20 md:pt-0">
          <motion.div
            className="max-w-4xl mx-auto space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <motion.h2
              className="text-2xl md:text-4xl font-bold mb-4 md:mb-14 text-center bg-gradient-to-r from-primary via-primary/60 to-primary bg-clip-text text-transparent"
              animate={{ backgroundPosition: ["0%", "100%", "0%"] }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            >
              חיפוש חכם, תוצאה מדויקת{" "}
            </motion.h2>

            <motion.div
              className="bg-card/5 backdrop-blur-[2px] border rounded-2xl p-4 md:p-6 mb-4 space-y-4 hover:bg-card/10 transition-all duration-300"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <motion.p
                className="text-base md:text-lg text-muted-foreground mb-6 max-w-3xl mx-auto text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                הסוכנים החכמים שלנו סורקים באופן רציף את כל המודעות החדשות
                ומתריעים בכל פעם שיש דירה חדשה בשוק
              </motion.p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  {
                    icon: "🔍",
                    text: "חיפוש מהיר",
                    description: "מנוע חיפוש חכם",
                  },
                  {
                    icon: "⚡",
                    text: "עדכונים בזמן אמת",
                    description: "התראות מיידיות",
                  },
                  {
                    icon: "🎯",
                    text: "תוצאות מדויקות",
                    description: "התאמה מושלמת",
                  },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    className="group bg-background/5 backdrop-blur-[2px] rounded-xl p-3 md:p-4 flex flex-row sm:flex-col items-center justify-center gap-3 sm:gap-2 border border-primary/10 hover:border-primary/30 hover:bg-background/10 transition-all duration-300"
                    whileHover={{ y: -5, scale: 1.02 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 + 0.5, duration: 0.4 }}
                  >
                    <motion.div
                      className="relative"
                      initial={{ rotate: 0 }}
                      whileHover={{ rotate: 360 }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 10,
                        duration: 0.6,
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <span className="text-2xl md:text-3xl transform inline-block">
                        {item.icon}
                      </span>
                    </motion.div>
                    <div className="flex flex-col items-center">
                      <span className="text-sm md:text-base font-medium text-center">
                        {item.text}
                      </span>
                      <span className="text-xs text-muted-foreground text-center">
                        {item.description}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              className="flex gap-4 justify-center"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Button
                size="lg"
                className="relative group bg-primary hover:bg-primary/90 text-base md:text-lg px-8 py-6 rounded-full overflow-hidden"
                asChild
              >
                <a
                  href="/SearchPage"
                  className="relative z-10 flex items-center gap-3"
                >
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Bot className="w-6 h-6" />
                  </motion.div>
                  <span>חפשו דירות</span>
                  <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary via-purple-500 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </a>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Personal Bot Section */}
      <section
        id="bot"
        className="h-screen snap-start snap-always flex items-start pt-14 md:pt-44 relative"
      >
        <div className="container mx-auto px-4 max-w-[1280px] w-[95%] pt-20 md:pt-0">
          <motion.div
            className="max-w-4xl mx-auto space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <motion.h2
              className="text-2xl md:text-4xl font-bold mb-4 md:mb-14 text-center bg-gradient-to-r from-primary via-primary/60 to-primary bg-clip-text text-transparent"
              animate={{ backgroundPosition: ["0%", "100%", "0%"] }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            >
              <div className="flex items-center justify-center gap-2">
                <Bot className="w-6 h-6 md:w-7 md:h-7" />
                בוט אישי שעובד בשבילכם 24/7
              </div>
            </motion.h2>

            <motion.div
              className="bg-card/5 backdrop-blur-[2px] border rounded-2xl p-4 md:p-6 mb-4 space-y-4 hover:bg-card/10 transition-all duration-300"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <motion.p
                className="text-base md:text-lg text-muted-foreground mb-6 max-w-3xl mx-auto text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                הגדירו את הפילטרים המדויקים שלכם וקבלו התראות מיידיות על דירות
                חדשות שמתאימות בדיוק לדרישות שלכם
              </motion.p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  {
                    icon: "🔍",
                    text: "פילטרים מותאמים אישית",
                    description: "הגדירו בדיוק מה אתם מחפשים",
                  },
                  {
                    icon: "⚡",
                    text: "התראות בזמן אמת",
                    description: "קבלו עדכונים מיידיים על דירות חדשות",
                  },
                  {
                    icon: "🎯",
                    text: "חיפוש אוטומטי 24/7",
                    description: "הבוט עובד בשבילכם ללא הפסקה",
                  },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    className="group bg-background/5 backdrop-blur-[2px] rounded-xl p-3 md:p-4 flex flex-row sm:flex-col items-center justify-center gap-3 sm:gap-2 border border-primary/10 hover:border-primary/30 hover:bg-background/10 transition-all duration-300"
                    whileHover={{ y: -5, scale: 1.02 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 + 0.5, duration: 0.4 }}
                  >
                    <motion.div
                      className="relative"
                      initial={{ rotate: 0 }}
                      whileHover={{ rotate: 360 }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 10,
                        duration: 0.6,
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <span className="text-2xl md:text-3xl transform inline-block">
                        {item.icon}
                      </span>
                    </motion.div>
                    <div className="flex flex-col items-center">
                      <span className="text-sm md:text-base font-medium text-center">
                        {item.text}
                      </span>
                      <span className="text-xs text-muted-foreground text-center">
                        {item.description}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              className="flex gap-4 justify-center"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Button
                size="lg"
                className="relative group bg-primary hover:bg-primary/90 text-base md:text-lg px-8 py-6 rounded-full overflow-hidden"
                asChild
              >
                <a
                  href="https://t.me/The_Underdog_bot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative z-10 flex items-center gap-3"
                >
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Bot className="w-6 h-6" />
                  </motion.div>
                  <span>התחל עכשיו עם הסוכן האישי ✨</span>
                  <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary via-purple-500 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </a>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Telegram Groups Section */}
      <section
        id="telegram"
        className="h-screen snap-start snap-always flex items-center relative overflow-y-hidden"
      >
        <div className="container mx-auto px-4 py-8 md:pt-20">
          <motion.div
            className="max-w-4xl mx-auto space-y-6 md:space-y-8 flex flex-col h-full justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <motion.h2
              className="text-2xl md:text-5xl font-bold mb-4 md:mb-8 text-center bg-gradient-to-r from-primary via-primary/60 to-primary bg-clip-text text-transparent"
              animate={{ backgroundPosition: ["0%", "100%", "0%"] }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            >
              <div className="flex items-center justify-center gap-2 md:gap-3">
                <Bell className="w-6 h-6 md:w-8 md:h-8" />
                קבוצות טלגרם לפי שכונה
              </div>
            </motion.h2>

            <motion.div
              className="bg-card/5 backdrop-blur-[2px] border rounded-2xl p-4 md:p-8 space-y-4 md:space-y-8 hover:bg-card/10 transition-all duration-300 flex-grow overflow-y-auto"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <motion.p
                className="text-base md:text-xl text-muted-foreground mb-4 md:mb-8 max-w-3xl mx-auto text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                הצטרפו לקבוצות הטלגרם השכונתיות שלנו וקבלו עדכונים על דירות
                חדשות ישירות לנייד
              </motion.p>

              <div className="grid grid-cols-2 gap-2 md:gap-4">
                {[
                  {
                    name: "כרם התימנים נווה צדק מונטיפיורי",
                    link: "https://t.me/+PtPRCeETJGcxMTNk",
                  },
                  {
                    name: "הצפון החדש",
                    link: "https://t.me/+Wgaiil3L2F9jNzY0",
                  },
                  {
                    name: "הצפון הישן",
                    link: "https://t.me/+e-QO_NDnytBhMDBk",
                  },
                  { name: "פלורנטיין", link: "https://t.me/+Mu5-w5wxb5RmMzY0" },
                  {
                    name: "לב תל אביב",
                    link: "https://t.me/+s5nz49QGAURkY2Rk",
                  },
                ].map((group, index) => (
                  <motion.a
                    key={group.name}
                    href={group.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group bg-background/5 backdrop-blur-[2px] rounded-xl p-3 md:p-6 flex flex-col md:flex-row items-center md:items-center justify-between border border-primary/10 hover:border-primary/30 hover:bg-background/10 transition-all duration-300"
                    whileHover={{ y: -5, scale: 1.02 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 + 0.5, duration: 0.4 }}
                  >
                    <div className="flex flex-col md:flex-row items-center md:items-center gap-2 md:gap-4 text-center md:text-left">
                      <motion.div
                        className="relative"
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                      >
                        <Bell className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                      </motion.div>
                      <span className="text-sm md:text-lg font-medium">
                        {group.name}
                      </span>
                    </div>
                    <motion.div
                      className="text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 hidden md:block"
                      initial={{ x: -10 }}
                      whileHover={{ x: 0 }}
                    >
                      →
                    </motion.div>
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section
        id="contact"
        className="h-screen snap-start snap-always flex items-center relative"
      >
        <div className="container mx-auto px-4">
          <motion.section
            className="py-24"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <div className="max-w-xl mx-auto">
              <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-primary via-primary/60 to-primary bg-clip-text text-transparent">
                צור קשר
              </h2>
              <motion.form
                onSubmit={handleSubmit}
                className="bg-background/40 backdrop-blur-xl p-8 rounded-2xl border border-primary/10"
                initial={{ y: 20 }}
                whileInView={{ y: 0 }}
                viewport={{ once: true }}
              >
                <div className="space-y-6">
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-foreground mb-2"
                    >
                      המייל שלך
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 bg-background/50 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="your@example.com"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium text-foreground mb-2"
                    >
                      הודעתך
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={4}
                      className="w-full px-4 py-2 bg-background/50 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="כתוב את ההודעה שלך כאן..."
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    שלח
                  </Button>
                </div>
                {status && (
                  <p className="text-center text-sm text-muted-foreground mt-4">
                    {status}
                  </p>
                )}
              </motion.form>
            </div>
          </motion.section>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background/40 backdrop-blur-sm border-t border-primary/10 py-8 text-center">
        <div className="container mx-auto">
          <p className="text-muted-foreground">&copy; 2025 כל הזכויות שמורות</p>
        </div>
      </footer>
    </div>
  );
}
