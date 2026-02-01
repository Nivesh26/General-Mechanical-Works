import { HiOutlinePhone, HiOutlineEnvelope, HiOutlineMapPin } from "react-icons/hi2";
import { FaFacebook, FaInstagram, FaTiktok, FaLinkedin } from "react-icons/fa";

import GMWlogoWhite from "../assets/GMWlogowhite.png";

const Footer = () => {
  return (
    <footer className="bg-[#1e1e1f] text-white font-sans py-2">
      <div className="mx-[80px]">
        <div className="flex flex-wrap justify-between py-10">
          {/* Logo Section  */}
          <div className="flex-shrink-0 basis-[250px] max-w-[300px]">
            <img src={GMWlogoWhite} className="w-[120px] mb-2.5" />
            <p className="text-sm my-2.5">
              Every service is rigorously screened and constantly rated to
              ensure you get the best service.
            </p>
            <h4 className="my-5 text-base font-bold">Follow our Socials</h4>
            <div className="flex gap-3">
              <a href="#" className="text-white hover:opacity-80 transition-opacity" aria-label="Facebook">
                <FaFacebook className="w-6 h-6" />
              </a>
              <a href="#" className="text-white hover:opacity-80 transition-opacity" aria-label="Instagram">
                <FaInstagram className="w-6 h-6" />
              </a>
              <a href="#" className="text-white hover:opacity-80 transition-opacity" aria-label="TikTok">
                <FaTiktok className="w-6 h-6" />
              </a>
              <a href="#" className="text-white hover:opacity-80 transition-opacity" aria-label="LinkedIn">
                <FaLinkedin className="w-6 h-6" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex-shrink-0 basis-[200px] my-5">
            <h4 className="text-base mb-4 font-bold">Quicks links</h4>
            <ul className="list-none p-0">
              <li className="mb-2.5 text-sm cursor-pointer">Home</li>
              <li className="mb-2.5 text-sm cursor-pointer">About us</li>
              <li className="mb-2.5 text-sm cursor-pointer">Services</li>

              <li className="mb-2.5 text-sm cursor-pointer">Products</li>
              <li className="mb-2.5 text-sm cursor-pointer">Contact Us</li>
            </ul>
          </div>

          {/* Popular Services */}
          <div className="flex-shrink-0 basis-[200px] my-5">
            <h4 className="text-base mb-4 font-bold">Popular Services</h4>
            <ul className="list-none p-0 text-sm">
              <li className="mb-2.5 cursor-pointer">Service Work</li>
              <li className="mb-2.5 cursor-pointer">Engine Repair</li>
              <li className="mb-2.5 cursor-pointer">Tyre Repair</li>
              <li className="mb-2.5 cursor-pointer">Bike Wash</li>
              <li className="mb-2.5 cursor-pointer">Dent Painting</li>
            </ul>
          </div>

          {/* Contact Us */}
          <div className="flex-shrink-0 basis-[220px] my-5">
            <h4 className="text-base mb-4 font-bold">Contact Us</h4>
            <div className="flex items-center gap-3 my-2.5 text-sm">
              <HiOutlinePhone className="w-5 h-5 flex-shrink-0" />
              <span>+977 9851050445, 01 - 1234567</span>
            </div>
            <div className="flex items-center gap-3 my-2.5 text-sm">
              <HiOutlineEnvelope className="w-5 h-5 flex-shrink-0" />
              <span>generalmechanicalworks46@gmail.com</span>
            </div>
            <div className="flex items-center gap-3 my-2.5 text-sm">
              <HiOutlineMapPin className="w-5 h-5 flex-shrink-0" />
              <span>Pulchowk, Lalitpur</span>
            </div>
          </div>
        </div>
      </div>

 
    </footer>
  );
};

export default Footer;
