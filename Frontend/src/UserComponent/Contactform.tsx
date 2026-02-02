import { HiOutlinePhone, HiOutlineEnvelope, HiOutlineMapPin } from "react-icons/hi2";

const Contactform = () => {
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

          <form className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <input
                  type="text"
                  placeholder="Full Name"
                  className="w-full bg-transparent border-0 border-b border-[#d1d5db] py-2.5 px-0 text-[#1a1a1a] placeholder:text-[#9ca3af] focus:outline-none focus:border-[#1a1a1a] transition-colors text-[15px]"
                />
              </div>
              <div>
                <input
                  type="tel"
                  placeholder="Phone"
                  className="w-full bg-transparent border-0 border-b border-[#d1d5db] py-2.5 px-0 text-[#1a1a1a] placeholder:text-[#9ca3af] focus:outline-none focus:border-[#1a1a1a] transition-colors text-[15px]"
                />
              </div>
            </div>

            <div>
              <input
                type="email"
                placeholder="Email"
                className="w-full bg-transparent border-0 border-b border-[#d1d5db] py-2.5 px-0 text-[#1a1a1a] placeholder:text-[#9ca3af] focus:outline-none focus:border-[#1a1a1a] transition-colors text-[15px]"
              />
            </div>

            <div>
              <textarea
                rows={1}
                placeholder="Send Message"
                className="w-full bg-transparent border-0 border-b border-[#d1d5db] py-2.5 px-0 text-[#1a1a1a] placeholder:text-[#9ca3af] focus:outline-none focus:border-[#1a1a1a] transition-colors text-[15px] resize-none min-h-[2.5rem]"
              />
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-primary text-white font-bold text-[15px] shadow-md hover:opacity-95 transition-opacity"
            >
              Send Message
            </button>
          </form>
        </div>
        </div>
      </div>
    </section>
  );
};

export default Contactform;
