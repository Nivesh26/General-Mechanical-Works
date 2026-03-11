import { HiOutlineChatBubbleBottomCenterText } from 'react-icons/hi2'

const ChatbotIcon = () => {
  return (
    <div
      className="fixed bottom-12 right-16 z-50 w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center shadow-lg cursor-default"
      aria-hidden
    >
      <HiOutlineChatBubbleBottomCenterText className="w-7 h-7" />
    </div>
  )
}

export default ChatbotIcon
