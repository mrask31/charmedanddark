'use client'

import { useState } from 'react'

export default function TheMirror() {
  const [mode, setMode] = useState('self')
  const [input, setInput] = useState('')
  const [reading, setReading] = useState(null)
  const [loading, setLoading] = useState(false)

  const placeholder = mode === 'self'
    ? 'Your mood, in a few words...'
    : 'Describe your friend...'

  const buttonLabel = mode === 'self' ? 'Receive Reading' : 'Find Their Gift'

  const handleReading = async () => {
    if (!input.trim() || loading) return
    setLoading(true)
    setReading(null)
    try {
      const res = await fetch('/api/mirror', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood: input, mode }),
      })
      const data = await res.json()
      setReading(data)
    } catch (err) {
      setReading({
        validation: 'The mirror is quiet tonight.',
        prescription: 'Return when the mood finds words.',
        products: [],
      })
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleReading()
  }

  return (
    <section className="bg-black px-8 py-32 lg:px-16">
      <div className="mx-auto max-w-2xl border border-zinc-800 p-12 text-center lg:p-16">

        <div style={{ display: 'flex', justifyContent: 'center', gap: '0', marginBottom: '2rem' }}>
          <button
            onClick={() => { setMode('self'); setReading(null); setInput('') }}
            style={{
              padding: '8px 20px',
              fontSize: '11px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              fontFamily: 'Inter, sans-serif',
              cursor: 'pointer',
              border: '1px solid',
              borderColor: mode === 'self' ? '#c9a96e' : 'rgba(255,255,255,0.15)',
              background: mode === 'self' ? 'rgba(201,169,110,0.1)' : 'transparent',
              color: mode === 'self' ? '#c9a96e' : 'rgba(255,255,255,0.4)',
              transition: 'all 0.2s',
            }}
          >
            For Yourself
          </button>
          <button
            onClick={() => { setMode('gift'); setReading(null); setInput('') }}
            style={{
              padding: '8px 20px',
              fontSize: '11px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              fontFamily: 'Inter, sans-serif',
              cursor: 'pointer',
              border: '1px solid',
              borderLeft: 'none',
              borderColor: mode === 'gift' ? '#c9a96e' : 'rgba(255,255,255,0.15)',
              background: mode === 'gift' ? 'rgba(201,169,110,0.1)' : 'transparent',
              color: mode === 'gift' ? '#c9a96e' : 'rgba(255,255,255,0.4)',
              transition: 'all 0.2s',
            }}
          >
            For a Friend
          </button>
        </div>

        <span className="text-xs uppercase tracking-widest text-[#B89C6D]">
          The Mirror
        </span>

        <p className="mt-6 text-sm text-zinc-400">
          {mode === 'self'
            ? 'A quiet reading: one validation, one prescription.'
            : 'Describe someone dark. We\'ll find what suits them.'}
        </p>

        <div className="mt-10">
          <input
            type="text"
            placeholder={placeholder}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            className="w-full border-b border-zinc-800 bg-transparent px-4 py-4 text-center text-sm text-white placeholder:text-zinc-600 focus:border-[#B89C6D] focus:outline-none transition-colors duration-160"
          />
        </div>

        <button
          onClick={handleReading}
          disabled={loading || !input.trim()}
          className="mt-10 bg-[#B89C6D] px-8 py-4 text-xs uppercase tracking-widest text-black transition-opacity duration-160 hover:opacity-90 disabled:opacity-40"
        >
          {loading ? 'Reading...' : buttonLabel}
        </button>

        {reading && (
          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', marginBottom: '1.5rem' }} />

            <p style={{
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              fontSize: '18px',
              fontStyle: 'italic',
              color: '#e8e4dc',
              lineHeight: 1.7,
              marginBottom: '0.75rem',
            }}>
              {reading.validation}
            </p>

            <p style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '12px',
              color: 'rgba(232,228,220,0.55)',
              letterSpacing: '0.05em',
              marginBottom: '1.5rem',
            }}>
              {reading.prescription}
            </p>

            {reading.products && reading.products.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
                <p style={{
                  fontSize: '10px',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: '#c9a96e',
                  marginBottom: '4px',
                  fontFamily: 'Inter, sans-serif',
                }}>
                  {reading.mode === 'gift' ? 'For them' : 'The prescription'}
                </p>
                {reading.products.map((product, i) => (
                  <a
                    key={i}
                    href={`/shop/${product.handle}`}
                    style={{
                      display: 'block',
                      width: '100%',
                      maxWidth: '400px',
                      padding: '14px 20px',
                      border: '1px solid rgba(201,169,110,0.3)',
                      textDecoration: 'none',
                      transition: 'border-color 0.2s',
                      textAlign: 'left',
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#c9a96e'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(201,169,110,0.3)'}
                  >
                    <div style={{
                      fontFamily: 'Cormorant Garamond, Georgia, serif',
                      fontSize: '15px',
                      color: '#e8e4dc',
                      marginBottom: '4px',
                    }}>
                      {product.title}
                    </div>
                    {product.reason && (
                      <div style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '11px',
                        color: 'rgba(232,228,220,0.45)',
                        lineHeight: 1.5,
                        marginBottom: '6px',
                      }}>
                        {product.reason}
                      </div>
                    )}
                    <div style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '11px',
                      color: '#c9a96e',
                      letterSpacing: '0.05em',
                    }}>
                      ${parseFloat(product.price).toFixed(2)} — View →
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
