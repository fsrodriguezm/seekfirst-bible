// Animation utilities for enhanced user experience

// Intersection Observer for scroll-triggered animations
export const createScrollAnimationObserver = (callback: IntersectionObserverCallback): IntersectionObserver => {
  const options: IntersectionObserverInit = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1,
  }

  return new IntersectionObserver(callback, options)
}

// Staggered animation for multiple elements
export const staggerElements = (elements: Element[], animationClass: string, delay = 100): void => {
  elements.forEach((element, index) => {
    window.setTimeout(() => {
      element.classList.add(animationClass)
    }, index * delay)
  })
}

// Smooth scroll to element with animation
export const smoothScrollToElement = (element: HTMLElement, offset = 0): void => {
  if (typeof window === 'undefined') return

  const elementPosition = element.offsetTop - offset

  window.scrollTo({
    top: elementPosition,
    behavior: 'smooth',
  })
}

// Add ripple effect to buttons
export const addRippleEffect = (button: HTMLElement | null): void => {
  if (!button) return

  button.addEventListener('click', function handleClick(this: HTMLElement, e: MouseEvent) {
    const ripple = document.createElement('span')
    const rect = this.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height)
    const x = e.clientX - rect.left - size / 2
    const y = e.clientY - rect.top - size / 2

    ripple.style.width = ripple.style.height = `${size}px`
    ripple.style.left = `${x}px`
    ripple.style.top = `${y}px`
    ripple.classList.add('ripple')

    this.appendChild(ripple)

    window.setTimeout(() => {
      ripple.remove()
    }, 600)
  })
}

// Animate verse selection with more sophisticated effects
export const animateVerseSelection = (verseElement: HTMLElement, isSelected: boolean): void => {
  if (isSelected) {
    verseElement.style.transform = 'translateX(12px) scale(1.02)'
    verseElement.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.2)'
    verseElement.style.animation = 'pulseSelection 0.6s ease-out'
  } else {
    verseElement.style.transform = 'translateX(0) scale(1)'
    verseElement.style.boxShadow = 'none'
    verseElement.style.animation = 'none'
  }
}

// Enhanced loading animation
export const createLoadingSpinner = (container: HTMLElement): HTMLElement => {
  const spinner = document.createElement('div')
  spinner.className = 'loading-container'
  spinner.innerHTML = `
    <div class="loading-spinner"></div>
    <div class="loading-text">Loading Scripture...</div>
  `
  container.appendChild(spinner)
  return spinner
}

// Remove loading spinner with fade out
export const removeLoadingSpinner = (spinner: HTMLElement): void => {
  spinner.style.opacity = '0'
  window.setTimeout(() => {
    spinner.remove()
  }, 300)
}

// Animate number changes (for verse counts, chapter numbers, etc.)
export const animateNumberChange = (element: HTMLElement, newValue: string | number): void => {
  element.style.transform = 'scale(1.2)'
  element.style.color = '#6366f1'

  window.setTimeout(() => {
    element.textContent = String(newValue)
    element.style.transform = 'scale(1)'
    element.style.color = ''
  }, 150)
}

// Add floating label animation to inputs
export const addFloatingLabelAnimation = (inputElement: HTMLInputElement, labelElement: HTMLElement): void => {
  const updateLabel = (): void => {
    if (inputElement.value || inputElement === document.activeElement) {
      labelElement.classList.add('floating')
    } else {
      labelElement.classList.remove('floating')
    }
  }

  inputElement.addEventListener('focus', updateLabel)
  inputElement.addEventListener('blur', updateLabel)
  inputElement.addEventListener('input', updateLabel)

  updateLabel()
}

// Page transition animations
export const pageTransitionIn = (element: HTMLElement): void => {
  element.style.opacity = '0'
  element.style.transform = 'translateY(30px)'

  window.setTimeout(() => {
    element.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
    element.style.opacity = '1'
    element.style.transform = 'translateY(0)'
  }, 50)
}

// Typewriter effect for text
export const typewriterEffect = (element: HTMLElement, text: string, speed = 50): number => {
  element.textContent = ''
  let i = 0

  const timer = window.setInterval(() => {
    if (i < text.length) {
      element.textContent += text.charAt(i)
      i += 1
    } else {
      window.clearInterval(timer)
    }
  }, speed)

  return timer
}
