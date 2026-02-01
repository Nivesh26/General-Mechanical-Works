import { useState } from "react";
import { HiStar } from "react-icons/hi2";
import NiveshImg from "../assets/Nivesh.png";
import AalokaImg from "../assets/aalokapoudel.jpg";
import BabuRajImg from "../assets/baburaja.jpg";

const reviews = [
  {
    id: 0,
    name: "Nivesh Shrestha",
    image: NiveshImg,
    text: "Absolutely love my new bike from GMW! The ordering process was smooth, and the customer service team was incredibly helpful in guiding me through my options. The bike arrived on time and in perfect condition. Rides like a dream smooth acceleration, great handling, and powerful engine. Highly recommend this site for any motorcycle enthusiast!",
    stars: 4,
  },
  {
    id: 1,
    name: "Aaloka Poudel",
    image: AalokaImg,
    text: "Great selection of bikes at competitive prices! I purchased my latest touring motorcycle here, and overall, I'm very satisfied. The only reason I'm giving 4 stars instead of 5 is that shipping took a little longer than expected. But the bike itself is fantastic, and customer service kept me updated throughout the process. Would definitely buy from them again!",
    stars: 5,
  },
  {
    id: 2,
    name: "BabuRaj Shrestha",
    image: BabuRajImg,
    text: "Decent experience, but there's room for improvement. The website has a good range of motorcycles, but I found the navigation a bit confusing. It took longer than I expected to finalize my purchase. The bike is solid and performs well, but I had some minor issues with the delivery process. Customer support was responsive, though, which helped resolve my concerns.",
    stars: 5,
  },
];

const ReviewCard = ({
  name,
  image,
  text,
  stars,
}: {
  name: string;
  image: string;
  text: string;
  stars: number;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative rounded-3xl flex flex-col items-center pt-12 sm:pt-14 pb-4 sm:pb-6 px-5 sm:px-6 shadow-xl transition-colors duration-300 cursor-pointer overflow-visible ${
        isHovered ? "bg-primary" : "bg-white border border-gray-100"
      }`}
    >
      {/* Profile image overlapping top of card */}
      <div className="absolute -top-10 sm:-top-11 left-1/2 -translate-x-1/2">
        <img
          src={image}
          alt={name}
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover ring-4 ring-white shadow-lg"
        />
      </div>

      <h3
        className={`font-bold text-base sm:text-lg mb-2 text-center ${
          isHovered ? "text-white" : "text-gray-900"
        }`}
      >
        {name}
      </h3>

      <p
        className={`text-sm leading-snug mb-3 flex-1 text-left max-w-md ${
          isHovered ? "text-white/95" : "text-gray-700"
        }`}
      >
        &ldquo;{text}&rdquo;
      </p>

      <div className="flex gap-0.5 justify-center">
        {Array.from({ length: stars }, (_, i) => (
          <HiStar
            key={i}
            className={`w-5 h-5 sm:w-6 sm:h-6 ${
              isHovered ? "text-amber-300" : "text-amber-400"
            }`}
            fill="currentColor"
          />
        ))}
      </div>
    </div>
  );
};

const Review = () => {
  return (
    <section className="w-full py-12 sm:py-16 bg-white overflow-hidden">
      <h2 className="text-center text-primary text-2xl sm:text-3xl font-sec font-bold tracking-[4px] uppercase mb-14 sm:mb-16">
        Customer Reviews
      </h2>

      <div className="max-w-6xl mx-auto px-4 sm:px-8 overflow-visible">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 pt-8 sm:pt-10">
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              name={review.name}
              image={review.image}
              text={review.text}
              stars={review.stars}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Review;
