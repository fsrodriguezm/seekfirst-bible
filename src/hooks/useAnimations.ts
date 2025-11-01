import { useEffect, useRef, useCallback } from 'react'

// Custom hook for scroll-triggered animations
export const useScrollAnimation = (threshold = 0.1) => {
  const elementRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed')
          }
        })
      },
      {
        threshold,
        rootMargin: '0px 0px -50px 0px',
      }
    )

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [threshold])

  return elementRef
}

// Custom hook for staggered animations
export const useStaggeredAnimation = (itemsCount: number, delay = 100) => {
  const containerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const container = containerRef.current
    if (!container) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const items = entry.target.querySelectorAll<HTMLElement>('.stagger-item')
            items.forEach((item, index) => {
              window.setTimeout(() => {
                item.classList.add('revealed')
              }, index * delay)
            })
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }
    )

    observer.observe(container)

    return () => {
      observer.unobserve(container)
    }
  }, [itemsCount, delay])

  return containerRef
}

// Custom hook for parallax effect
export const useParallax = (speed = 0.5) => {
  const elementRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const element = elementRef.current
    if (!element) return

    const handleScroll = () => {
      const scrolled = window.pageYOffset
      const parallax = scrolled * speed
      element.style.transform = `translate3d(0, ${parallax}px, 0)`
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [speed])

  return elementRef
}

// Custom hook for typing animation
export const useTypingAnimation = (text: string, speed = 50, autoStart = true) => {
  const elementRef = useRef<HTMLElement | null>(null)
  const timerRef = useRef<number | null>(null)

  const startAnimation = useCallback(() => {
    if (typeof window === 'undefined') return

    const element = elementRef.current
    if (!element) return

    element.textContent = ''
    let i = 0

    timerRef.current = window.setInterval(() => {
      if (i < text.length) {
        element.textContent += text.charAt(i)
        i += 1
      } else if (timerRef.current) {
        window.clearInterval(timerRef.current)
        timerRef.current = null
      }
    }, speed)
  }, [text, speed])

  useEffect(() => {
    if (autoStart) {
      startAnimation()
    }

    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [text, speed, autoStart, startAnimation])

  return { elementRef, startAnimation }
}
