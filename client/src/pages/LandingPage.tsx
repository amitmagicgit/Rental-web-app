import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
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
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-20">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">
            מוצאים לכם דירות להשכרה בצורה חכמה
          </h1>
          <p className="text-lg mb-16">
            אנו סורקים את שוק הדירות ומביאים לכם את כל המודעות המעודכנות, גם דרך
            הבוט בטלגרם. הצטרפו לקבוצות הטלגרם שלנו או פתחו שיחה פרטית לקבלת
            התראות מותאמות אישית.
          </p>
        </div>
        {/* Private Chat Button */}
        <section className="text-center mb-16">
          <h2 className="text-2xl font-semibold mb-4">
            קבל התראות מותאמות אישית
          </h2>
          <Button asChild>
            <a
              href="https://t.me/The_Underdog_bot"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3"
            >
              פתח שיחה פרטית עם הבוט
            </a>
          </Button>
        </section>

        {/* Telegram Groups */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-center">
            קבוצות טלגרם לפי שכונה
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <a
              href="https://t.me/+PtPRCeETJGcxMTNk"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white p-4 rounded shadow hover:bg-gray-50 text-center"
            >
              כרם התימנים נווה צדק מונטיפיורי
            </a>
            <a
              href="https://t.me/+Wgaiil3L2F9jNzY0"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white p-4 rounded shadow hover:bg-gray-50 text-center"
            >
              הצפון החדש
            </a>
            <a
              href="https://t.me/+e-QO_NDnytBhMDBk"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white p-4 rounded shadow hover:bg-gray-50 text-center"
            >
              הצפון הישן
            </a>
            <a
              href="https://t.me/+Mu5-w5wxb5RmMzY0"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white p-4 rounded shadow hover:bg-gray-50 text-center"
            >
              פלורנטיין
            </a>
            <a
              href="https://t.me/+s5nz49QGAURkY2Rk"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white p-4 rounded shadow hover:bg-gray-50 text-center"
            >
              לב תל אביב
            </a>
          </div>
        </section>

        {/* Contact Form Section */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold mb-4 text-center">צור קשר</h2>
          <p className="text-center mb-4">
            ניתן לשלוח הודעה ישירות לכתובת:{" "}
            <a
              href="mailto:ilthefinder@gmail.com"
              className="text-blue-600 underline"
            >
              ilthefinder@gmail.com
            </a>
          </p>
          <form
            onSubmit={handleSubmit}
            className="max-w-md mx-auto bg-white p-6 rounded shadow"
          >
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
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
                className="mt-1 block w-full border border-gray-300 rounded p-2"
                placeholder="your@example.com"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="message"
                className="block text-sm font-medium text-gray-700"
              >
                הודעתך
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows="4"
                className="mt-1 block w-full border border-gray-300 rounded p-2"
                placeholder="כתוב את ההודעה שלך כאן..."
              ></textarea>
            </div>
            <Button type="submit">שלח</Button>
            {status && <p className="mt-4 text-center">{status}</p>}
          </form>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-200 text-gray-700 py-4 text-center">
        &copy; 2025 כל הזכויות שמורות
      </footer>
    </div>
  );
}
