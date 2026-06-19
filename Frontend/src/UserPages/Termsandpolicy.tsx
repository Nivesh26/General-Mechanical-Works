import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Header from '../UserComponent/Header'
import Footer from '../UserComponent/Footer'
import Copyright from '../UserComponent/Copyright'
import { PAGE_GUTTER } from '../lib/layoutClasses'

function scrollToHash(hash: string) {
  if (!hash) return
  const id = hash.replace('#', '')
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

const Termsandpolicy = () => {
  const { hash } = useLocation()

  useEffect(() => {
    if (hash) {
      const timer = window.setTimeout(() => scrollToHash(hash), 100)
      return () => window.clearTimeout(timer)
    }
  }, [hash])

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className={`flex-1 ${PAGE_GUTTER} py-10 sm:py-14`}>
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary font-sec tracking-[4px] uppercase text-center">
            Legal
          </h1>

          <article
            id="privacy"
            className="mt-8 scroll-mt-24 rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm"
          >
            <h2 className="text-xl font-bold text-gray-900">Privacy Policy</h2>
            <p className="mt-4 text-gray-600 leading-relaxed">
              General Mechanical Works (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) respects your privacy.
              This policy explains how we collect, use, and protect your information when you use our website,
              place orders, book services, or contact us.
            </p>

            <h3 className="mt-6 text-base font-semibold text-gray-900">Information we collect</h3>
            <ul className="mt-2 list-disc pl-5 space-y-2 text-gray-600 leading-relaxed">
              <li>
                Account details such as name, email address, phone number, and delivery location when you
                register or update your profile.
              </li>
              <li>
                Order and transaction information, including items purchased, payment method (COD, eSewa,
                Khalti), and order status.
              </li>
              <li>
                Vehicle information you choose to save for service and parts recommendations.
              </li>
              <li>
                Messages sent through our contact form, chat, or support channels.
              </li>
              <li>
                Basic technical data such as browser type and device information to keep the site secure
                and working properly.
              </li>
            </ul>

            <h3 className="mt-6 text-base font-semibold text-gray-900">How we use your information</h3>
            <ul className="mt-2 list-disc pl-5 space-y-2 text-gray-600 leading-relaxed">
              <li>To process orders, deliveries, appointments, and customer support requests.</li>
              <li>To verify payments and prevent fraud when you pay online.</li>
              <li>To send order updates, service reminders, and important account notices.</li>
              <li>To improve our products, services, and website experience.</li>
            </ul>

            <h3 className="mt-6 text-base font-semibold text-gray-900">Sharing of information</h3>
            <p className="mt-2 text-gray-600 leading-relaxed">
              We do not sell your personal data. We may share limited information with trusted payment
              partners (eSewa, Khalti) only to complete transactions you initiate, and with delivery or
              service providers when needed to fulfil your order or booking.
            </p>

            <h3 className="mt-6 text-base font-semibold text-gray-900">Data security & retention</h3>
            <p className="mt-2 text-gray-600 leading-relaxed">
              We use reasonable technical and organisational measures to protect your data. We retain
              information only as long as needed for orders, legal obligations, and legitimate business
              purposes.
            </p>

            <h3 className="mt-6 text-base font-semibold text-gray-900">Your choices</h3>
            <p className="mt-2 text-gray-600 leading-relaxed">
              You may update profile details from your account settings. To request access, correction, or
              deletion of your data, contact us using the details on our{' '}
              <Link to="/contactus" className="text-primary font-medium hover:underline">
                Contact
              </Link>{' '}
              page.
            </p>
          </article>

          <article
            id="terms"
            className="mt-8 scroll-mt-24 rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm"
          >
            <h2 className="text-xl font-bold text-gray-900">Terms of Service</h2>
            <p className="mt-4 text-gray-600 leading-relaxed">
              By accessing or using the General Mechanical Works website and services, you agree to these
              Terms of Service. If you do not agree, please do not use our platform.
            </p>

            <h3 className="mt-6 text-base font-semibold text-gray-900">Use of our services</h3>
            <p className="mt-2 text-gray-600 leading-relaxed">
              You must provide accurate information when creating an account, placing orders, or booking
              services. You are responsible for keeping your login credentials secure and for activity
              under your account.
            </p>

            <h3 className="mt-6 text-base font-semibold text-gray-900">Orders & payments</h3>
            <ul className="mt-2 list-disc pl-5 space-y-2 text-gray-600 leading-relaxed">
              <li>
                Product availability, pricing, and descriptions may change without notice. We reserve the
                right to cancel orders affected by errors or stock issues.
              </li>
              <li>
                Online payments through eSewa or Khalti must be completed successfully before an order is
                confirmed. Cash on Delivery (COD) orders are confirmed subject to verification at delivery.
              </li>
              <li>
                Delivery requires a valid delivery location in your profile. You agree to accept delivery
                at the address provided.
              </li>
            </ul>

            <h3 className="mt-6 text-base font-semibold text-gray-900">Cancellations & returns</h3>
            <p className="mt-2 text-gray-600 leading-relaxed">
              Order line cancellations may be available from Order Tracking while the order is pending or
              confirmed, subject to our policies. Returns and refunds for defective or incorrect items will
              be handled case by case in line with applicable consumer protection laws in Nepal.
            </p>

            <h3 className="mt-6 text-base font-semibold text-gray-900">Intellectual property</h3>
            <p className="mt-2 text-gray-600 leading-relaxed">
              All content on this website—including text, logos, images, and design—is owned by General
              Mechanical Works or its licensors and may not be copied or reused without permission.
            </p>

            <h3 className="mt-6 text-base font-semibold text-gray-900">Limitation of liability</h3>
            <p className="mt-2 text-gray-600 leading-relaxed">
              We strive to provide accurate information and reliable service. To the fullest extent
              permitted by law, General Mechanical Works is not liable for indirect, incidental, or
              consequential damages arising from use of the website or products, except where liability
              cannot be excluded by law.
            </p>

            <h3 className="mt-6 text-base font-semibold text-gray-900">Changes to these terms</h3>
            <p className="mt-2 text-gray-600 leading-relaxed">
              We may update this page from time to time. Continued use of the site after changes are
              posted constitutes acceptance of the revised terms.
            </p>

            <h3 className="mt-6 text-base font-semibold text-gray-900">Contact</h3>
            <p className="mt-2 text-gray-600 leading-relaxed">
              Questions about these policies? Reach us through our{' '}
              <Link to="/contactus" className="text-primary font-medium hover:underline">
                Contact
              </Link>{' '}
              page.
            </p>
          </article>
        </div>
      </main>
      <Footer />
      <Copyright />
    </div>
  )
}

export default Termsandpolicy
