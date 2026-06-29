/** Scroll a chat message list to the newest message (bottom). */
export function scrollChatToBottom(container: HTMLElement | null) {
  if (!container) return
  const apply = () => {
    container.scrollTop = container.scrollHeight
  }
  apply()
  requestAnimationFrame(apply)
  window.setTimeout(apply, 0)
  window.setTimeout(apply, 120)
}
