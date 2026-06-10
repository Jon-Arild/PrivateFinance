import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import { supabase } from './lib/supabase'
import { signOut } from './lib/auth'
import { useTransaksjoner } from './hooks/useTransaksjoner'
import Login       from './pages/Login'
import Hjem        from './pages/Hjem'
import Eiendommer  from './pages/Eiendommer'
import Omrader     from './pages/Omrader'
import Inntekter   from './pages/Inntekter'
import Maaneder    from './pages/Maaneder'

const NAV = [
  { to:'/',            label:'Hjem' },
  { to:'/eiendommer',  label:'Eiendommer' },
  { to:'/omrader',     label:'Områder' },
  { to:'/inntekter',   label:'Inntekter' },
  { to:'/maaneder',    label:'Per måned' },
]

function AppShell() {
  const { data, loading, error } = useTransaksjoner()

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center',
      height:'100vh', color:'#888780', fontSize:14 }}>
      Laster transaksjoner…
    </div>
  )
  if (error) return (
    <div style={{ padding:24, color:'#A32D2D' }}>Feil: {error}</div>
  )

  return (
    <>
      <header style={{ background:'#fff', borderBottom:'.5px solid #d3d1c7',
        padding:'12px 20px', position:'sticky', top:0, zIndex:20,
        display:'flex', alignItems:'center', gap:14 }}>
        <span style={{ fontWeight:500, fontSize:15 }}>Privatøkonomi 2026</span>
        <span style={{ marginLeft:'auto', fontSize:12, color:'#888780',
          background:'#f1efe8', padding:'3px 10px', borderRadius:6 }}>
          {data.length} transaksjoner
        </span>
        <button onClick={signOut}
          style={{ fontSize:12, padding:'4px 12px', borderRadius:6,
            border:'.5px solid #d3d1c7', background:'transparent',
            color:'#5f5e5a', cursor:'pointer' }}>
          Logg ut
        </button>
      </header>
      <nav style={{ background:'#fff', borderBottom:'.5px solid #d3d1c7',
        padding:'8px 20px 0', display:'flex', gap:4, flexWrap:'wrap' }}>
        {NAV.map(({ to, label }) => (
          <NavLink key={to} to={to} end={to==='/'} style={({ isActive }) => ({
            padding:'6px 14px', borderRadius:'8px 8px 0 0',
            border:'.5px solid #d3d1c7', borderBottom:'none',
            background: isActive ? '#f8f7f4' : 'transparent',
            color: isActive ? '#1a1a1a' : '#5f5e5a',
            fontWeight: isActive ? 500 : 400,
            fontSize:13
          })}>
            {label}
          </NavLink>
        ))}
      </nav>
      <main style={{ padding:'18px 20px', maxWidth:980, margin:'0 auto' }}>
        <Routes>
          <Route path="/"           element={<Hjem       tx={data} />} />
          <Route path="/eiendommer" element={<Eiendommer tx={data} />} />
          <Route path="/omrader"    element={<Omrader    tx={data} />} />
          <Route path="/inntekter"  element={<Inntekter  tx={data} />} />
          <Route path="/maaneder"   element={<Maaneder   tx={data} />} />
        </Routes>
      </main>
    </>
  )
}

export default function App() {
  const [session, setSession] = useState(undefined) // undefined = sjekker

  useEffect(() => {
    // Sjekk eksisterende sesjon
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })
    // Lytt på auth-endringer
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  // Laster
  if (session === undefined) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center',
      height:'100vh', color:'#888780', fontSize:14 }}>
      …
    </div>
  )

  // Ikke innlogget
  if (!session) return <Login onLogin={() => {}} />

  // Innlogget
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  )
}
