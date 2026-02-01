import { useState } from "react";
import { HiChevronDown, HiChevronUp } from "react-icons/hi2";

const faqItems = [
  {
    id: 0,
    question: "What types of motorbike services do you offer?",
    answer:
      "We provide full servicing, engine diagnostics, oil changes, brake repairs, tire replacements, battery checks, and more. Whether it's routine maintenance or major repairs, we've got you covered!",
  },
  {
    id: 1,
    question: "Do I need an appointment, or can I walk in?",
    answer:
      "We recommend booking an appointment to ensure we can serve you promptly, but walk-ins are welcome subject to availability. You can call us or book online through our website.",
  },
  {
    id: 2,
    question: "Do you use original spare parts?",
    answer:
      "Yes, we use genuine and high-quality spare parts for all repairs and replacements. We can also source OEM parts for your specific make and model to ensure the best performance and longevity.",
  },
];

const Faq = () => {
  const [openId, setOpenId] = useState<number | null>(null);

  const toggle = (id: number) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="w-full py-12 sm:py-16 bg-white overflow-hidden">
      <h2 className="text-center text-primary text-2xl sm:text-3xl font-sec font-bold tracking-[4px] uppercase mb-10 sm:mb-12">
        FAQ
      </h2>

      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        <div className="flex flex-col gap-5 sm:gap-6">
          {faqItems.map((item) => {
            const isOpen = openId === item.id;
            return (
              <div
                key={item.id}
                className="rounded-xl border-2 border-gray-200 bg-white overflow-hidden transition-colors hover:border-gray-300"
              >
                <button
                  type="button"
                  onClick={() => toggle(item.id)}
                  className="w-full flex items-center justify-between gap-4 py-4 sm:py-5 px-5 sm:px-8 text-left cursor-pointer"
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${item.id}`}
                  id={`faq-question-${item.id}`}
                >
                  <span className="text-black font-bold text-base sm:text-lg pr-2">
                    {item.question}
                  </span>
                  <span className="shrink-0 text-black">
                    {isOpen ? (
                      <HiChevronUp className="w-5 h-5 sm:w-6 sm:h-6" />
                    ) : (
                      <HiChevronDown className="w-5 h-5 sm:w-6 sm:h-6" />
                    )}
                  </span>
                </button>
                <div
                  id={`faq-answer-${item.id}`}
                  role="region"
                  aria-labelledby={`faq-question-${item.id}`}
                  className={`overflow-hidden transition-all duration-300 ${
                    isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <p className="text-black text-sm sm:text-base leading-relaxed pt-3 pb-4 sm:pb-5 px-5 sm:px-8 border-t border-gray-100">
                    {item.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Faq;
