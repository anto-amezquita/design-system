import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ease } from '@/lib/motion'

export function useButtonWipe<T extends HTMLElement>(fillColor = 'var(--button-primary-background-hover)') {
  const ref = useRef<T>(null)

  useEffect(() => {
    if (!ref.current) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (window.matchMedia('(hover: none)').matches) return
    const container: T = ref.current

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('aria-hidden', 'true')
    svg.setAttribute('viewBox', '0 0 100 100')
    svg.setAttribute('preserveAspectRatio', 'none')
    svg.classList.add('button__wipe')
    Object.assign(svg.style, {
      position: 'absolute',
      inset: '0',
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: '-1',
      overflow: 'visible',
    })

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    path.style.fill = fillColor
    svg.appendChild(path)

    const glow = document.createElement('span')
    glow.setAttribute('aria-hidden', 'true')
    Object.assign(glow.style, {
      position: 'absolute',
      width: '52px',
      height: '52px',
      borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(255,255,255,0.45) 0%, transparent 70%)',
      transform: 'translate(-50%, -50%)',
      pointerEvents: 'none',
      zIndex: '-1',
      opacity: '0',
    })

    container.appendChild(svg)
    container.appendChild(glow)

    const state = { topY: 105, curveAmp: 0, curveX: 50 }
    let buttonRect = container.getBoundingClientRect()

    function drawPath() {
      const { topY, curveX, curveAmp } = state
      path.setAttribute('d', `M 0 ${topY} Q ${curveX} ${topY - curveAmp} 100 ${topY} L 100 105 L 0 105 Z`)
      const peakX = curveX / 2 + 25
      const peakY = topY - curveAmp
      glow.style.left = `${(peakX / 100) * buttonRect.width}px`
      glow.style.top = `${(peakY / 100) * buttonRect.height}px`
      glow.style.opacity = String(curveAmp / 40)
    }

    drawPath()

    let tl: gsap.core.Timeline | null = null

    function onEnter(e: MouseEvent) {
      if (tl) tl.kill()
      buttonRect = container.getBoundingClientRect()
      state.curveX = ((e.clientX - buttonRect.left) / buttonRect.width) * 100

      container.classList.add('button--hovering')

      tl = gsap.timeline({ onUpdate: drawPath, onComplete: drawPath })
        .to(state, { topY: -5, duration: 0.55, ease: ease.out }, 0)
        .to(state, { curveAmp: 40, duration: 0.22, ease: ease.expand }, 0)
        .to(state, { curveAmp: 0, duration: 0.22, ease: ease.out }, 0.22)
    }

    function onLeave() {
      if (tl) tl.kill()
      container.classList.remove('button--hovering')
      drawPath()

      tl = gsap.timeline({ onUpdate: drawPath, onComplete: drawPath })
        .to(state, { topY: 105, duration: 0.4, ease: ease.in }, 0)
        .to(state, { curveAmp: 28, duration: 0.18, ease: ease.expand }, 0)
        .to(state, { curveAmp: 0, duration: 0.18, ease: ease.out }, 0.18)
    }

    container.addEventListener('mouseenter', onEnter)
    container.addEventListener('mouseleave', onLeave)

    return () => {
      container.removeEventListener('mouseenter', onEnter)
      container.removeEventListener('mouseleave', onLeave)
      if (tl) tl.kill()
      svg.remove()
      glow.remove()
    }
  }, [])

  return ref
}
