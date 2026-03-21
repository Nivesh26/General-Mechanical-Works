import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { HiOutlineHandThumbUp } from 'react-icons/hi2'
import Header from '../UserComponent/Header'
import Footer from '../UserComponent/Footer'
import Copyright from '../UserComponent/Copyright'
import Blog1Img from '../assets/Blog1.png'

// Blog detail: use the clicked blogId from `location.state` (demo data for now).
const blogPosts = [
  {
    id: 1,
    date: 'January 22, 2025',
    title: 'R15 V4 RACING INSTINCT - PASSING ON THE "R SERIES" DNA.',
    image: Blog1Img,
    paragraphs: [
      'The all-new R15 V4 is the 4th generation of the legendary R15, and it continues the proud lineage by sharing the same core “R series” DNA with super sport YZF R1. From the moment you look at it, the stance feels purposeful—compact, planted, and instantly race-inspired. Every detail is designed to make the rider feel connected to the machine: sharp bodywork lines, an aggressive front profile, and a cockpit that feels built for quick decision-making. It is not just a style update; it is an engineering-first approach aimed at giving everyday riders a race-bred experience they can actually use every day.',
      'Power delivery and control are where the R15 V4 really stands out. Depending on the variant, it brings smarter electronics such as a Traction Control System to help manage grip during hard acceleration, plus performance-focused hardware like a Quick Shifter (highlighted for Racing Blue) that supports faster, smoother upshifts. The bike is tuned for confident roll-on response so that pulling away from a junction feels immediate, while higher-speed stability remains calm and predictable. In real-world conditions—wet patches, changing traffic speeds, or sudden overtakes—you feel the difference: the ride stays composed, and your confidence grows when you push a little harder.',
      'Whether you are commuting through city traffic or heading out for a spirited weekend ride, the R15 V4 is designed to feel fast, stable, and ready. Ergonomics and riding posture have been refined to help reduce fatigue while still keeping the “forward and engaged” sport feel. The suspension and braking package work together to maintain traction and control—so the bike reacts the way you expect, not how it chooses. Even on roads that are less than perfect, you get a smoother, more controlled ride that makes longer journeys more enjoyable rather than tiring.',
      'Just as important as speed is the quality of the riding experience. The R15 V4 keeps the tradition of sharp throttle response with a ride that communicates clearly through the bars and seat. Riders can expect a satisfying balance between daily comfort and race-inspired feedback, which means it stays enjoyable in stop-and-go traffic while still feeling aggressive when the road opens up. The electronic character of the bike helps smooth out the ride so you can focus on lines, braking points, and timing instead of worrying about sudden wheelspin or loss of composure.',
      'For many enthusiasts, the R series is more than numbers—it is an attitude and a promise of performance identity. The R15 V4 strengthens that identity with a technology-forward approach and design cues that look ready to attack the next corner. If you are looking for a sport bike that feels alive, confident, and modern without losing the soul of the R-line, the R15 V4 delivers exactly that. The Racing Blue variant, priced at Rs. 5,99,900, is one more statement of intent—built for riders who want the confidence of proven performance and the style of a true R-series machine.',
    ],
  },
  {
    id: 2,
    date: 'March 1, 2025',
    title: 'The ALL NEW CLASSIC 350 REBORN',
    image: Blog1Img,
    paragraphs: [
      'This update focuses on the new direction of the Classic 350—keeping the familiar charm while bringing a fresh feel to the lineup. The story is about clarity: what riders want day-to-day is comfort, confidence, and dependable performance. When brands refine their choices, the result is a machine that feels ready for both short city runs and longer highway cruising.',
      'Along with product changes, the brand experience also evolves—design lines, ride character, and the overall “ownability” that helps motorcycles become a daily companion rather than a seasonal toy. The goal is simple: deliver a ride that looks timeless, feels refined, and makes every start at the garage feel exciting.',
      'The news also reflects real market movement. When prices shift, riders get a moment to re-evaluate and pick up the model they have been considering. Whether you’re a new buyer or returning after years, the Classic 350 continues to offer a balanced blend of style and practicality.',
      'A motorcycle is never only mechanical; it is also emotional. The Classic 350 theme is built around heritage—while staying modern enough to match today’s riding needs. That balance is what keeps the platform relevant, and what brings riders back year after year.',
      'For now, consider this a preview of the Classic 350 reborn direction. In the coming updates, you can expect deeper details on features, variants, and what changed—so you can choose with confidence.',
    ],
  },
  {
    id: 3,
    date: 'April 2, 2025',
    title: 'YATRI OFFICIALLY LAUNCH IN NEPAL',
    image: Blog1Img,
    paragraphs: [
      'Yatri Motorcycles stepping into Nepal is a sign of how quickly the motorcycle market is expanding in South Asia. Launches like this are exciting because they don’t just bring new products—they bring new opportunities for service networks, parts availability, and long-term riding communities.',
      'Every new brand entering a region brings a fresh lineup philosophy. The real value for riders is understanding what the brand stands for: reliability expectations, performance character, and the day-to-day ownership experience from purchase to maintenance.',
      'From roads to rider habits, the local market shapes how motorcycles are presented. The goal is to make bikes that fit the lifestyle—comfortable for daily commute, strong enough for common road conditions, and supported with parts that are easy to find.',
      'The story of a launch is also the story of people—founders, engineers, and early supporters who believe in building a sustainable presence. When that confidence is backed by service and availability, riders feel the difference quickly.',
      'For now, this is the blog detail layout. Later, we can connect real backend content per blogId so the exact image and paragraph text appear for each post.',
    ],
  },
] as const

const Blogsdetail = () => {
  const location = useLocation()
  const blogId =
    (location.state as { blogId?: number } | undefined)?.blogId ?? 1

  const [liked, setLiked] = useState(false)
  const baseLikeCount = 12
  const likeCount = baseLikeCount + (liked ? 1 : 0)

  const toggleLike = () => {
    setLiked((prev) => !prev)
  }

  const post = blogPosts.find((p) => p.id === blogId) ?? blogPosts[0]

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 mx-[80px] py-10">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Link
              to="/blogs"
              className="inline-flex items-center text-sm text-primary hover:underline"
            >
              Back to blogs
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-4">
              {post.title}
            </h1>
            <p className="mt-2 text-sm text-gray-500">{post.date}</p>
          </div>

          <div className="rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm">
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-72 sm:h-[420px] object-cover"
            />
            <div className="p-5 sm:p-7 space-y-4">
              {post.paragraphs.map((p) => (
                <p key={p} className="text-gray-700 leading-relaxed">
                  {p}
                </p>
              ))}
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <button
              type="button"
              onClick={toggleLike}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                liked
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
              }`}
              aria-pressed={liked}
              aria-label={liked ? 'Unlike blog' : 'Like blog'}
            >
              <HiOutlineHandThumbUp
                className={`h-4 w-4 ${liked ? 'text-primary' : 'text-gray-500'}`}
              />
              {liked ? 'Liked' : 'Like'}
            </button>
            <p className="text-sm text-gray-500">
              {likeCount} like{likeCount === 1 ? '' : 's'}
            </p>
          </div>
        </div>
      </main>
      <Footer />
      <Copyright />
    </div>
  )
}

export default Blogsdetail