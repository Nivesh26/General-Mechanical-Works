import { HiOutlineChatBubbleBottomCenterText } from 'react-icons/hi2'

const ChatbotWidget = () => {
  return (
    <div
      className="fixed right-4 bottom-4 sm:right-6 sm:bottom-6 z-[70] w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-red-900/30"
      aria-hidden
    >
      <HiOutlineChatBubbleBottomCenterText className="w-6 h-6 sm:w-7 sm:h-7" />
    </div>
  )
}

export default ChatbotWidget
