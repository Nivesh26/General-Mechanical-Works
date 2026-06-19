import { useEffect, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function isInViewport(el: Element, root: Element | null): boolean {
  const rect = el.getBoundingClientRect()
  if (root) {
    const rootRect = root.getBoundingClientRect()
    return rect.top < rootRect.bottom && rect.bottom > rootRect.top
  }
  return rect.top < window.innerHeight && rect.bottom > 0
}

function markScrollFadeItems(
  container: Element,
  selector: string,
  root: Element | null,
): Element[] {
  const items = Array.from(container.querySelectorAll(selector))
  items.forEach((el) => {
    el.classList.add('scroll-fade-item')
    if (isInViewport(el, root)) {
      el.classList.add('is-visible')
    } else {
      el.classList.remove('is-visible')
    }
  })
  return items
}

function collectFadeTargets(): { items: Element[]; root: Element | null }[] {
  const groups: { items: Element[]; root: Element | null }[] = []

  document.querySelectorAll('.admin-main-scroll').forEach((adminMain) => {
    const items = markScrollFadeItems(
      adminMain,
      ':scope > section, :scope > header, :scope > div',
      adminMain,
    )
    if (items.length > 0) {
      groups.push({ items, root: adminMain })
    }
  })

  const pageFade = document.querySelector('.page-route') ?? document.querySelector('.page-fade')
  const pageWrapper = pageFade?.firstElementChild
  if (pageWrapper) {
    const userItems = Array.from(pageWrapper.children).filter((el) => {
      const tag = el.tagName
      return tag !== 'HEADER'
    })
    userItems.forEach((el) => {
      el.classList.add('scroll-fade-item')
      if (isInViewport(el, null)) {
        el.classList.add('is-visible')
      } else {
        el.classList.remove('is-visible')
      }
    })
    if (userItems.length > 0) {
      groups.push({ items: userItems, root: null })
    }
  }

  return groups
}

function setupScrollReveal(): () => void {
  if (prefersReducedMotion()) {
    document.querySelectorAll('.scroll-fade-item').forEach((el) => {
      el.classList.add('is-visible')
    })
    return () => {}
  }

  const groups = collectFadeTargets()
  const observers: IntersectionObserver[] = []

  groups.forEach(({ items, root }) => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      {
        root,
        threshold: 0.05,
        rootMargin: '0px 0px -5% 0px',
      },
    )

    items.forEach((el) => observer.observe(el))
    observers.push(observer)
  })

  return () => observers.forEach((observer) => observer.disconnect())
}

export function ScrollReveal({ children }: { children: ReactNode }) {
  const location = useLocation()

  useEffect(() => {
    let cleanup = () => {}
    const frame = requestAnimationFrame(() => {
      cleanup = setupScrollReveal()
    })
    const timer = window.setTimeout(() => {
      cleanup()
      cleanup = setupScrollReveal()
    }, 40)

    return () => {
      cancelAnimationFrame(frame)
      window.clearTimeout(timer)
      cleanup()
    }
  }, [location.pathname, location.search])

  return <>{children}</>
}
