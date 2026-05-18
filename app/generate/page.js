'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function GeneratePage() {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [result, setResult]   = useState(null)
  const [form, setForm]       = useState({ url:'', company_name:'', monitor_type:'pricing' })

  useEffect(() => {
    try {
      const cookieKey = document.cookie.includes('not_user') ? 'not_user' : 'pri_user'
      const match = document.cookie.match(new RegExp(cookieKey + '=([^;]+)'))
      if (match) setUser(JSON.parse(decodeURIComponent(match[1])))
    } catch(e) {}
  }, [])

  const handleSubmit = async () => {
    if (!form.url || !form.company_name) return setError('URL and company name are required.')
    setLoading(true); setError(''); setResult(null)
    try {
      const tokenKey = document.cookie.includes('not_token') ? 'not_token' : 'pri_token'
      const token = document.cookie.match(new RegExp(tokenKey + '=([^;]+)'))?.[1] || ''
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ...form, userId: user?.id })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setResult(data.result)
    } catch(e) { setError(e.message) }
    setLoading(false)
  }

  const inputStyle = { width:'100%', padding:'10px 12px', border:'1px solid #e2e8f0', borderRadius:8, fontSize:14, color:'#0f172a', background:'#fff', outline:'none', fontFamily:'Inter,sans-serif', boxSizing:'border-box' }
  const labelStyle = { fontSize:11, fontWeight:600, color:'#475569', textTransform:'uppercase', letterSpacing:'0.05em', display:'block', marginBottom:5 }
  const color = '#ea580c'

  if (result) return (
    <div style={{minHeight:'100vh',background:'#f8fafc',fontFamily:'Inter,sans-serif'}}>
      <nav style={{background:'#fff',borderBottom:'1px solid #e2e8f0',height:56,display:'flex',alignItems:'center',padding:'0 24px',gap:16}}>
        <Link href="/" style={{display:'flex',alignItems:'center',gap:8,textDecoration:'none'}}>
          <div style={{width:28,height:28,borderRadius:7,background:color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:800,color:'#fff'}}>N</div>
          <span style={{fontWeight:700,color:'#0f172a',fontSize:15}}>Monitor</span>
        </Link>
        <div style={{flex:1}}/>
      </nav>
      <div style={{maxWidth:720,margin:'0 auto',padding:'32px 24px',display:'flex',flexDirection:'column',gap:14}}>
        <div style={{background:'#fff7ed',border:'1px solid #fed7aa',borderRadius:12,padding:20}}>
          <p style={{fontSize:11,fontWeight:700,color:color,textTransform:'uppercase',marginBottom:4}}>✅ Analysis Complete</p>
          <p style={{fontSize:18,fontWeight:800,color:'#0f172a'}}>{form.company_name}</p>
          <p style={{fontSize:13,color:'#64748b'}}>{form.url}</p>
        </div>
        {result.summary && <div style={{background:'#fff',border:'1px solid #e2e8f0',borderRadius:12,padding:20}}>
          <p style={{fontSize:11,fontWeight:700,color:'#475569',textTransform:'uppercase',marginBottom:8}}>📊 Summary</p>
          <p style={{fontSize:14,color:'#374151',lineHeight:1.7}}>{result.summary}</p>
        </div>}
        {result.changes && <div style={{background:'#fff7ed',border:'1px solid #fed7aa',borderRadius:12,padding:20}}>
          <p style={{fontSize:11,fontWeight:700,color:color,textTransform:'uppercase',marginBottom:10}}>🔄 Changes Detected</p>
          {Array.isArray(result.changes) ? result.changes.map((c,i) => (
            <div key={i} style={{display:'flex',gap:8,marginBottom:8}}>
              <span style={{color:color,fontSize:12,marginTop:2}}>•</span>
              <p style={{fontSize:13,color:'#374151',lineHeight:1.6}}>{typeof c === 'string' ? c : JSON.stringify(c)}</p>
            </div>
          )) : <p style={{fontSize:13,color:'#374151'}}>{result.changes}</p>}
        </div>}
        <div style={{display:'flex',gap:10}}>
          <button onClick={() => { setResult(null); setForm({url:'',company_name:'',monitor_type:'pricing'}) }}
            style={{flex:1,padding:'10px',borderRadius:8,border:'1px solid #e2e8f0',background:'#fff',fontSize:13,fontWeight:600,color:'#475569',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>
            Monitor another
          </button>
          {user ? <Link href="/dashboard" style={{flex:1,padding:'10px',borderRadius:8,border:'none',background:color,color:'#fff',fontSize:13,fontWeight:700,textDecoration:'none',textAlign:'center',display:'flex',alignItems:'center',justifyContent:'center'}}>Dashboard →</Link>
                : <Link href="/login" style={{flex:1,padding:'10px',borderRadius:8,border:'none',background:color,color:'#fff',fontSize:13,fontWeight:700,textDecoration:'none',textAlign:'center',display:'flex',alignItems:'center',justifyContent:'center'}}>Save monitors →</Link>}
        </div>
      </div>
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:'#f8fafc',fontFamily:'Inter,sans-serif'}}>
      <nav style={{background:'#fff',borderBottom:'1px solid #e2e8f0',height:56,display:'flex',alignItems:'center',padding:'0 24px',gap:16}}>
        <Link href="/" style={{display:'flex',alignItems:'center',gap:8,textDecoration:'none'}}>
          <div style={{width:28,height:28,borderRadius:7,background:color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:800,color:'#fff'}}>N</div>
          <span style={{fontWeight:700,color:'#0f172a',fontSize:15}}>Monitor</span>
        </Link>
        <div style={{flex:1}}/>
        {user ? <Link href="/dashboard" style={{fontSize:13,color:'#64748b',textDecoration:'none'}}>Dashboard</Link>
               : <Link href="/login" style={{fontSize:13,color:color,fontWeight:600,textDecoration:'none'}}>Sign in</Link>}
      </nav>
      <div style={{maxWidth:580,margin:'0 auto',padding:'40px 24px'}}>
        <h1 style={{fontSize:26,fontWeight:800,color:'#0f172a',marginBottom:6}}>Monitor a webpage</h1>
        <p style={{fontSize:14,color:'#64748b',marginBottom:28}}>Enter a URL and company name to analyse and monitor for changes.</p>
        {error && <div style={{background:'#fef2f2',border:'1px solid #fecaca',borderRadius:10,padding:'12px 16px',fontSize:13,color:'#dc2626',marginBottom:20}}>{error}</div>}
        <div style={{background:'#fff',border:'1px solid #e2e8f0',borderRadius:14,padding:28}}>
          <div style={{marginBottom:14}}>
            <label style={labelStyle}>URL to monitor *</label>
            <input value={form.url} onChange={e => setForm({...form,url:e.target.value})} placeholder="https://competitor.com/pricing" style={inputStyle}/>
          </div>
          <div style={{marginBottom:14}}>
            <label style={labelStyle}>Company name *</label>
            <input value={form.company_name} onChange={e => setForm({...form,company_name:e.target.value})} placeholder="e.g. Competitor Inc" style={inputStyle}/>
          </div>
          <div style={{marginBottom:24}}>
            <label style={labelStyle}>Monitor type</label>
            <select value={form.monitor_type} onChange={e => setForm({...form,monitor_type:e.target.value})} style={{...inputStyle,background:'#fff'}}>
              {['pricing','content','product','news','general'].map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
            </select>
          </div>
          <button onClick={handleSubmit} disabled={loading}
            style={{width:'100%',padding:'13px',borderRadius:10,border:'none',background:loading?'#fdba74':color,color:'#fff',fontSize:15,fontWeight:700,cursor:loading?'not-allowed':'pointer',fontFamily:'Inter,sans-serif'}}>
            {loading ? '🔍 Analysing...' : 'Analyse page →'}
          </button>
        </div>
      </div>
    </div>
  )
}
