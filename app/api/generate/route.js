import { NextResponse } from 'next/server'
export async function POST(request) {
  try {
    const body = await request.json()
    const { url, company_name, monitor_type, userId } = body
    if (!url || !company_name) return NextResponse.json({ error: 'URL and company name required' }, { status: 400 })
    let pageContent = ''
    try {
      const pageRes = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(10000) })
      const html = await pageRes.text()
      pageContent = html.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim().slice(0,3000)
    } catch(e) { pageContent = 'Could not fetch page content' }
    const aiRes = await fetch(`${process.env.AI_API_URL}/api/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.AI_API_KEY}` },
      body: JSON.stringify({ task: 'summarise_changes', inputs: { url, company_name, old_content: 'No previous data', new_content: pageContent, monitor_type: 'pricing' } })
    })
    const aiData = await aiRes.json()
    if (!aiRes.ok) throw new Error(aiData.error || 'AI failed')
    return NextResponse.json({ result: aiData.data })
  } catch(err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
