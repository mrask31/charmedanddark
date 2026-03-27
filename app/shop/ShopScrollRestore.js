"use client";

import { useEffect } from "react";

export default function ShopScrollRestore() {
  // Save scroll on scroll
  useEffect(() => {
    const save = () => sessionStorage.setItem('shopScrollY', window.scrollY.toString())
    window.addEventListener('scroll', save, { passive: true })
    return () => window.removeEventListener('scroll', save)
  }, [])

  // Restore on mount using MutationObserver
  useEffect(() => {
    const saved = sessionStorage.getItem('shopScrollY')
    if (!saved || parseInt(saved) < 50) return
    const targetY = parseInt(saved)
    const observer = new MutationObserver(() => {
      if (document.body.scrollHeight > targetY) {
        window.scrollTo({ top: targetY, behavior: 'instant' })
        observer.disconnect()
      }
    })
    observer.observe(document.body, { childList: true, subtree: true })
    const fallback = setTimeout(() => {
      window.scrollTo({ top: targetY, behavior: 'instant' })
      observer.disconnect()
    }, 1000)
    return () => { observer.disconnect(); clearTimeout(fallback) }
  }, [])

  return null;
}
