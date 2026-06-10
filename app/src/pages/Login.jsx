import { useState } from 'react'
import { signIn } from '../lib/auth'

export default function Login({ onLogin }) {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState(null)
  const [loading,  setLoading]  = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await signIn(email, password)
    if (error) {
      setError('Feil epost eller passord')
      setLoading(false)
    } else {
      onLogin()
    }
  }

  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center',
      minHeight:'100vh', background:'#f8f7f4' }}>
      <div style={{ background:'#fff', border:'.5px solid #d3d1c7', borderRadius:16,
        padding:'40px 36px', width:'100%', maxWidth:380 }}>

        <div style={{ marginBottom:28, textAlign:'center' }}>
          <div style={{ fontSize:28, marginBottom:8 }}>💰</div>
          <h1 style={{ fontSize:20, fontWeight:500, marginBottom:4 }}>Privatøkonomi 2026</h1>
          <p style={{ fontSize:13, color:'#888780' }}>Logg inn for å fortsette</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom:14 }}>
            <label style={{ display:'block', fontSize:12, color:'#5f5e5a',
              marginBottom:5, fontWeight:500 }}>Epost</label>
            <input
              type='email'
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
              style={{ width:'100%', padding:'9px 12px', fontSize:14,
                border:'.5px solid #d3d1c7', borderRadius:8, outline:'none',
                background:'#fff' }}
            />
          </div>

          <div style={{ marginBottom:20 }}>
            <label style={{ display:'block', fontSize:12, color:'#5f5e5a',
              marginBottom:5, fontWeight:500 }}>Passord</label>
            <input
              type='password'
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{ width:'100%', padding:'9px 12px', fontSize:14,
                border:'.5px solid #d3d1c7', borderRadius:8, outline:'none',
                background:'#fff' }}
            />
          </div>

          {error && (
            <div style={{ marginBottom:14, padding:'8px 12px', background:'#FEF2F2',
              border:'.5px solid #FECACA', borderRadius:8, fontSize:13, color:'#A32D2D' }}>
              {error}
            </div>
          )}

          <button type='submit' disabled={loading}
            style={{ width:'100%', padding:'10px', fontSize:14, fontWeight:500,
              background: loading ? '#d3d1c7' : '#185FA5', color:'#fff',
              border:'none', borderRadius:8, cursor: loading ? 'default' : 'pointer' }}>
            {loading ? 'Logger inn…' : 'Logg inn'}
          </button>
        </form>
      </div>
    </div>
  )
}
