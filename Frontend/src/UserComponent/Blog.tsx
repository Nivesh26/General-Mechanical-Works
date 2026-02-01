import { HiOutlineArrowRight } from "react-icons/hi2";
import Blog1Img from "../assets/Blog1.png";
import Blog2Img from "../assets/Blog2.png";
import Blog3Img from "../assets/Blog3.png";

const blogPosts = [
  {
    id: 1,
    date: "January 22, 2025",
    title: "R15 V4 RACING INSTINCT - PASSING ON THE \"R SERIES\" DNA.",
    image: Blog1Img,
    description:
      "The all new R15 V4 is the 4th generation of legendry R15 which shares the same DNA with super sports YZF R1. The R15 V4 is equipped with a Traction Control System in all models and a Quick Shifter in Racing Blue. The Racing Blue variant is priced at Rs. 5,99,900.",
  },
  {
    id: 2,
    date: "March 1, 2025",
    title: "The ALL NEW CLASSIC 350 REBORN",
    image: Blog2Img,
    description:
      "After increasing the prices of its entire range a few months back, Royal Enfield has now slashed the price of the Meteor 350 and the Classic 350.",
  },
  {
    id: 3,
    date: "April 2, 2025",
    title: "YATRI OFFICIALLY LAUNCH IN NEPAL",
    image: Blog3Img,
    description:
      "Coming out as the Nepali prodigy of bikes, Yatri Motorcycles started its journey in 2017, with founder Ashim Pandey and his cousin/business partner Batshal Pandey.",
  },
];

const Blog = () => {
  return (
    <section className="w-full py-12 sm:py-16 bg-white overflow-hidden">
      <h2 className="text-center text-primary text-2xl sm:text-3xl font-sec font-bold tracking-[4px] uppercase mb-10 sm:mb-12">
        Latest News / Blogs
      </h2>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-8">
        {/* Left arrow - same as Customer Reviews */}
        <button
          type="button"
          className="absolute -left-9 sm:-left-11 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white border-2 border-gray-300 shadow-md flex items-center justify-center hover:bg-gray-50 hover:border-gray-400 transition-colors cursor-pointer"
          aria-label="Previous blog"
        >
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Right arrow - same as Customer Reviews */}
        <button
          type="button"
          className="absolute -right-9 sm:-right-11 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white border-2 border-gray-300 shadow-md flex items-center justify-center hover:bg-gray-50 hover:border-gray-400 transition-colors cursor-pointer"
          aria-label="Next blog"
        >
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {blogPosts.map((post) => (
            <article
              key={post.id}
              className="rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-lg flex flex-col"
            >
              <p className="text-gray-500 text-sm px-4 pt-4 pb-1">{post.date}</p>
              <h3 className="text-primary font-bold text-sm sm:text-base uppercase px-4 pb-3 leading-tight">
                {post.title}
              </h3>
              <div className="px-4 cursor-pointer">
                <img
                  src={post.image}
                  alt=""
                  className="w-full h-48 sm:h-52 object-cover rounded-xl"
                />
              </div>
              <p className="text-black text-sm leading-relaxed px-4 pt-4 pb-4 flex-1 cursor-pointer">
                {post.description}
              </p>
              <div className="px-4 pb-4">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 text-black font-medium text-sm hover:opacity-90 transition-opacity cursor-pointer"
                >
                  <span className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <HiOutlineArrowRight className="w-4 h-4 text-white" />
                  </span>
                  Read More
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Blog;
