import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { NetworkAnimation } from "@/components/NetworkAnimation";


export default function LandingPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [formData, setFormData] = useState({ email: "", message: "" });
  const [status, setStatus] = useState(null);

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

  return (
    <div className="relative min-h-screen overflow-hidden">
      <NetworkAnimation 
        desktopHouses={10}
        desktopPeople={10}
        mobileHouses={7}
        mobilePeople={7}
      />

      <main className="container mx-auto px-4 relative">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="py-32 text-center"
        >
          <motion.h1 
            className="text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent"
            animate={{ backgroundPosition: ["0%", "100%", "0%"] }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          >
            מוצאים לכם דירות להשכרה בצורה חכמה
          </motion.h1>
          <motion.p 
            className="text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            אנו סורקים את שוק הדירות ומביאים לכם את כל המודעות המעודכנות, בזמן אמת
          </motion.p>
          <motion.div 
            className="flex gap-4 justify-center"
            whileHover={{ scale: 1.05 }}
          >
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-xl px-8 py-6 rounded-full shadow-[0_0_15px_rgba(var(--primary),0.5)] hover:shadow-[0_0_25px_rgba(var(--primary),0.8)] transition-all duration-300"
              asChild
            >
              <a href="https://t.me/The_Underdog_bot" target="_blank" rel="noopener noreferrer">
                התחל עכשיו עם הבוט ✨
              </a>
            </Button>
          </motion.div>
        </motion.div>

        {/* Features Section */}
        <motion.section 
          className="py-24"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "🔍",
                title: "חיפוש חכם",
                desc: "סריקה מתמדת של כל המודעות החדשות בשוק"
              },
              {
                icon: "⚡",
                title: "התראות בזמן אמת",
                desc: "קבלו עדכונים מיידים על דירות חדשות"
              },
              {
                icon: "🎯",
                title: "התאמה אישית",
                desc: "סינון לפי הקריטריונים החשובים לכם"
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
                className="group"
              >
                <div className="relative bg-background/40 backdrop-blur-xl p-8 rounded-2xl border border-primary/10 hover:border-primary/30 transition-all duration-300">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative">
                    <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform">{feature.icon}</div>
                    <h3 className="text-2xl font-semibold mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Telegram Groups */}
        <motion.section 
          className="py-24"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
            קבוצות טלגרם לפי שכונה
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[
              { name: "כרם התימנים נווה צדק מונטיפיורי", link: "https://t.me/+PtPRCeETJGcxMTNk" },
              { name: "הצפון החדש", link: "https://t.me/+Wgaiil3L2F9jNzY0" },
              { name: "הצפון הישן", link: "https://t.me/+e-QO_NDnytBhMDBk" },
              { name: "פלורנטיין", link: "https://t.me/+Mu5-w5wxb5RmMzY0" },
              { name: "לב תל אביב", link: "https://t.me/+s5nz49QGAURkY2Rk" },
            ].map((group, index) => (
              <motion.a
                key={group.name}
                href={group.link}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.03 }}
                className="group bg-background/40 backdrop-blur-xl p-6 rounded-xl border border-primary/10 hover:border-primary/30 transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg font-medium">{group.name}</span>
                  <span className="text-primary opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-2">
                    →
                  </span>
                </div>
              </motion.a>
            ))}
          </div>
        </motion.section>

        {/* Contact Form */}
        <motion.section 
          className="py-24"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="max-w-xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
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
                  <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
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
                  <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
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
                <p className="text-center text-sm text-muted-foreground mt-4">{status}</p>
              )}
            </motion.form>
          </div>
        </motion.section>
      </main>

      <footer className="bg-background/40 backdrop-blur-sm border-t border-primary/10 py-8 text-center">
        <div className="container mx-auto">
          <p className="text-muted-foreground">&copy; 2025 כל הזכויות שמורות</p>
        </div>
      </footer>
    </div>
  );
}
