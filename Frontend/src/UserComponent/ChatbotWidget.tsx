import { HiOutlineChatBubbleBottomCenterText } from 'react-icons/hi2'

const ChatbotWidget = () => {
  return (
    <div
      style={{
        position: 'fixed',
        right: '24px',
        bottom: '24px',
        width: '56px',
        height: '56px',
        borderRadius: '999px',
        backgroundColor: '#b91c1c',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 10px 24px rgba(185, 28, 28, 0.35)',
        zIndex: 70,
      }}
      aria-hidden
    >
      <HiOutlineChatBubbleBottomCenterText size={24} />
    </div>
  )
}

export default ChatbotWidget
