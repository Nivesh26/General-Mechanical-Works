import { useState } from "react";
import { HiOutlinePhone, HiOutlineEnvelope, HiOutlineMapPin } from "react-icons/hi2";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FieldKey = "name" | "phone" | "email" | "message";

const Contactform = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [sentOk, setSentOk] = useState(false);

  const validate = (): boolean => {
    const next: Partial<Record<FieldKey, string>> = {};
    const n = name.trim();
    const p = phone.trim();
    const em = email.trim();
    const msg = message.trim();

    if (!n) next.name = "Full name is required.";
    else if (n.length < 2) next.name = "Please enter at least 2 characters.";
    else if (n.length > 120) next.name = "Name is too long.";

    const digits = p.replace(/\D/g, "");
    if (!p) next.phone = "Phone number is required.";
    else if (digits.length < 8) next.phone = "Enter a valid phone number.";

    if (!em) next.email = "Email is required.";
    else if (!emailRegex.test(em)) next.email = "Enter a valid email address.";

    if (!msg) next.message = "Message is required.";
    else if (msg.length < 10) next.message = "Please write at least 10 characters.";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    // TODO: wire to contact API
    setErrors({});
    setName("");
    setPhone("");
    setEmail("");
    setMessage("");
    setSentOk(true);
    window.setTimeout(() => setSentOk(false), 5000);
  };

  const inputBorder = (hasError: boolean) =>
    `w-full bg-transparent border-0 border-b py-2.5 px-0 text-[#1a1a1a] placeholder:text-[#9ca3af] focus:outline-none transition-colors text-[15px] ${
      hasError ? "border-red-500 focus:border-red-500" : "border-[#d1d5db] focus:border-[#1a1a1a]"
    }`;

  const clearError = (key: FieldKey) => {
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  };

  return (
    <section className="bg-white px-5 sm:px-8 py-12 sm:py-16 max-w-6xl mx-auto">
      <div className="rounded-[28px] p-8 sm:p-10 lg:p-12 shadow-[0_4px_32px_rgba(0,0,0,0.06)]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
        {/* Left: Contact Us */}
        <div className="font-sans">
          <h2 className="text-[28px] sm:text-[32px] font-bold text-[#1a1a1a] mb-10">
            Contact Us
          </h2>

          <div className="space-y-8">
            <div className="flex gap-4">
              <HiOutlinePhone className="w-6 h-6 text-[#1a1a1a] shrink-0 mt-0.5" />
              <div>
                <p className="text-[#1a1a1a] font-medium text-[15px] sm:text-base">
                  +977 9876543212, 01 - 1234567
                </p>
                <p className="text-[#6b7280] text-sm mt-1">Contact Us Anytime</p>
              </div>
            </div>

            <div className="flex gap-4">
              <HiOutlineEnvelope className="w-6 h-6 text-[#1a1a1a] shrink-0 mt-0.5" />
              <div>
                <p className="text-[#1a1a1a] font-medium text-[15px] sm:text-base">
                  generalmechanicalworks46@gmail.com
                </p>
                <p className="text-[#6b7280] text-sm mt-1">Send us your Query Anytime</p>
              </div>
            </div>

            <div className="flex gap-4">
              <HiOutlineMapPin className="w-6 h-6 text-[#1a1a1a] shrink-0 mt-0.5" />
              <div>
                <p className="text-[#1a1a1a] font-medium text-[15px] sm:text-base">
                  Pulchowk, Lalitpur
                </p>
                <p className="text-[#6b7280] text-sm mt-1">Visit us Anytime</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Get in Touch form */}
        <div className="font-sans">
          <h2 className="text-[28px] sm:text-[32px] font-bold text-[#1a1a1a] mb-8">
            Get in Touch
          </h2>

          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <input
                  type="text"
                  name="name"
                  autoComplete="name"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    clearError("name");
                  }}
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? "contact-name-error" : undefined}
                  className={inputBorder(Boolean(errors.name))}
                />
                {errors.name && (
                  <p id="contact-name-error" className="mt-1 text-sm text-red-600" role="alert">
                    {errors.name}
                  </p>
                )}
              </div>
              <div>
                <input
                  type="tel"
                  name="phone"
                  autoComplete="tel"
                  placeholder="Phone"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    clearError("phone");
                  }}
                  aria-invalid={Boolean(errors.phone)}
                  aria-describedby={errors.phone ? "contact-phone-error" : undefined}
                  className={inputBorder(Boolean(errors.phone))}
                />
                {errors.phone && (
                  <p id="contact-phone-error" className="mt-1 text-sm text-red-600" role="alert">
                    {errors.phone}
                  </p>
                )}
              </div>
            </div>

            <div>
              <input
                type="email"
                name="email"
                autoComplete="email"
                placeholder="Email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearError("email");
                }}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "contact-email-error" : undefined}
                className={inputBorder(Boolean(errors.email))}
              />
              {errors.email && (
                <p id="contact-email-error" className="mt-1 text-sm text-red-600" role="alert">
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <textarea
                name="message"
                rows={1}
                placeholder="Send Message"
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  clearError("message");
                }}
                aria-invalid={Boolean(errors.message)}
                aria-describedby={errors.message ? "contact-message-error" : undefined}
                className={`${inputBorder(Boolean(errors.message))} resize-none min-h-10`}
              />
              {errors.message && (
                <p id="contact-message-error" className="mt-1 text-sm text-red-600" role="alert">
                  {errors.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-primary text-white font-bold text-[15px] shadow-md hover:opacity-95 transition-opacity"
            >
              Send Message
            </button>
            {sentOk && (
              <p className="text-sm text-green-700 font-medium" role="status">
                Thank you — we&apos;ll be in touch soon.
              </p>
            )}
          </form>
        </div>
        </div>
      </div>
    </section>
  );
};

export default Contactform;
