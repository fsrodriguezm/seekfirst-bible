import { useEffect, type MutableRefObject } from 'react'
import { addRippleEffect } from '../utils/animations'

export const useButtonRipples = (
  buttonRefs: MutableRefObject<Array<HTMLElement | null>>,
): void => {
  useEffect(() => {
    buttonRefs.current.forEach((button) => {
      if (button) {
        addRippleEffect(button)
      }
    })
  }, [buttonRefs])
}
