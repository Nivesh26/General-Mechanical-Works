import { Link } from 'react-router-dom'

const Copyright = () => {
  return (
    <div className="bg-[#be1e2d] text-white px-4 py-3 sm:p-4 text-center text-xs sm:text-base">
    <p className="leading-relaxed">
      &copy; 2025 General Mechanical Works | All rights reserved | Designed
      by{" "}
      <a href="#" className="underline">
        Nivesh Shrestha
      </a>{" "}
      |{" "}
      <Link to="/termsandpolicy#privacy" className="underline hover:opacity-90">
        Privacy Policy
      </Link>{" "}
      |{" "}
      <Link to="/termsandpolicy#terms" className="underline hover:opacity-90">
        Terms of Service
      </Link>
    </p>
  </div>
  )
}

export default Copyright