import { NextResponse } from 'next/server'

const AI_API_URL = process.env.AI_API_URL
const AI_API_KEY = process.env.AI_API_KEY
const DB_API_URL = process.env.DB_API_URL
const DB_API_KEY = process.env.DB_API_KEY_PRICESIGNAL

export async function POST(request) {
  try {
    const body = await request.json()
    const { url, company_name, monitor_type, userId } = body

    if (!url || !company_name) {
      return NextResponse.json({ error: 'url and company_name are required' }, { status: 400 })
    }

    let pageContent = 'Could not fetch page content'
    try {
      const pageRes = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(10000)
      })
      const html = await pageRes.text()
      pageContent = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 3000)
    } catch(e) {
      console.error('Page fetch failed:', e.message)
    }

    const aiRes = await fetch(`${AI_API_URL}/api/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${AI_API_KEY}` },
      body: JSON.stringify({
        task: 'summarise_changes',
        inputs: {
          url,
          company_name,
          old_content: 'No previous data',
          new_content: pageContent,
          monitor_type: 'pricing'
        }
      })
    })

    const aiData = await aiRes.json()
    if (!aiRes.ok) throw new Error(aiData.error || 'AI generation failed')
    const result = aiData.data

    let itemId = null
    if (userId && DB_API_URL) {
      try {
        const dbRes = await fetch(`${DB_API_URL}/db/pricesignal/monitors`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${DB_API_KEY}` },
          body: JSON.stringify({
            user_id: userId,
            title: `${company_name} pricing`,
            url,
            company_name,
            result_data: result,
            status: 'complete'
          })
        })
        const dbData = await dbRes.json()
        itemId = dbData.data?.id || null
      } catch(e) { console.error('DB save failed:', e.message) }
    }

    return NextResponse.json({ itemId, result })
  } catch(err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
