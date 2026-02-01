import { NavLink } from "react-router-dom";
import { HiOutlinePhone, HiOutlineEnvelope, HiOutlineMapPin } from "react-icons/hi2";
import { FaFacebook, FaInstagram, FaTiktok, FaLinkedin } from "react-icons/fa";

import GMWlogoWhite from "../assets/GMWlogowhite.png";

const quickLinks = [
  { to: "/", label: "Home" },
  { to: "/about-us", label: "About us" },
  { to: "/services", label: "Services" },
  { to: "/products", label: "Products" },
  { to: "/contactus", label: "Contact Us" },
];

const Footer = () => {
  return (
    <footer className="bg-[#1e1e1f] text-white font-sans py-2 overflow-hidden [&_a]:no-underline [&_*]:outline-none [&_*]:ring-0">
      <div className="mx-[80px]">
        <div className="flex flex-wrap justify-between py-10">
          {/* Logo Section  */}
          <div className="flex-shrink-0 basis-[250px] max-w-[300px]">
            <img src={GMWlogoWhite} alt="GMW" className="w-[120px] mb-2.5 border-0" />
            <p className="text-sm my-2.5">
              Every service is rigorously screened and constantly rated to
              ensure you get the best service.
            </p>
            <h4 className="my-5 text-base font-bold">Follow our Socials</h4>
            <div className="flex gap-3">
              <a href="#" className="text-white hover:opacity-80 transition-opacity no-underline outline-none focus:outline-none focus:ring-0" aria-label="Facebook">
                <FaFacebook className="w-6 h-6" />
              </a>
              <a href="#" className="text-white hover:opacity-80 transition-opacity no-underline outline-none focus:outline-none focus:ring-0" aria-label="Instagram">
                <FaInstagram className="w-6 h-6" />
              </a>
              <a href="#" className="text-white hover:opacity-80 transition-opacity no-underline outline-none focus:outline-none focus:ring-0" aria-label="TikTok">
                <FaTiktok className="w-6 h-6" />
              </a>
              <a href="#" className="text-white hover:opacity-80 transition-opacity no-underline outline-none focus:outline-none focus:ring-0" aria-label="LinkedIn">
                <FaLinkedin className="w-6 h-6" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex-shrink-0 basis-[200px] my-5">
            <h4 className="text-base mb-4 font-bold">Quick links</h4>
            <ul className="list-none p-0 border-0 outline-none">
              {quickLinks.map(({ to, label }) => (
                <li key={to} className="mb-2.5 text-sm">
                  <NavLink
                    to={to}
                    className={({ isActive }) =>
                      `text-white hover:opacity-80 transition-opacity ${
                        isActive ? "opacity-100 font-semibold" : "opacity-90"
                      }`
                    }
                  >
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular Services */}
          <div className="flex-shrink-0 basis-[200px] my-5">
            <h4 className="text-base mb-4 font-bold">Popular Services</h4>
            <ul className="list-none p-0 text-sm border-0 outline-none">
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
