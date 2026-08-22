const ODOO_URL = 'http://localhost:8069'
const EXISTING_DB = 'dailyFlow.db'
const TARGET_DB = 'dayflow'

async function jsonRpc(url, service, method, args = [], kwargs = {}, db = null) {
  const payload = {
    jsonrpc: '2.0',
    method: 'call',
    params: { service, method, args, kwargs },
    id: Math.floor(Math.random() * 1e6),
  }
  const res = await fetch(`${url}/jsonrpc`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    credentials: 'include',
  })
  const text = await res.text()
  try { return JSON.parse(text).result } catch { throw new Error(text.substring(0, 300)) }
}

async function auth(db, login, password) {
  try {
    const payload = {
      jsonrpc: '2.0',
      method: 'call',
      params: {
        service: 'common',
        method: 'authenticate',
        args: [db, login, password, {}],
      },
      id: 1,
    }
    const res = await fetch(`${ODOO_URL}/jsonrpc`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    if (data.error) return { success: false, error: data.error.data?.message || data.error.message }
    return { success: true, uid: data.result }
  } catch (e) { return { success: false, error: e.message } }
}

async function main() {
  const credentials = [
    ['admin@dayflow.com', 'admin123'],
    ['admin', 'admin'],
    ['admin', 'admin123'],
    ['odoo', 'odoo'],
    ['admin', 'dayflow'],
  ]

  console.log(`Trying to authenticate against existing DB '${EXISTING_DB}':`)
  for (const [login, pwd] of credentials) {
    process.stdout.write(`   ${login}:${pwd} ... `)
    const r = await auth(EXISTING_DB, login, pwd)
    if (r.success) {
      console.log(`OK (uid=${r.uid})`)
      console.log(`\n--> Action: Update frontend to use DB name '${EXISTING_DB}' instead of 'dayflow'`)
      process.exit(0)
    } else {
      console.log('FAIL -', r.error?.substring(0, 60))
    }
  }

  console.log(`\nTrying to authenticate against DB '${TARGET_DB}':`)
  for (const [login, pwd] of credentials) {
    process.stdout.write(`   ${login}:${pwd} ... `)
    const r = await auth(TARGET_DB, login, pwd)
    if (r.success) {
      console.log(`OK (uid=${r.uid})`)
      process.exit(0)
    } else {
      console.log('FAIL -', r.error?.substring(0, 60))
    }
  }

  console.log('\n---')
  console.log('Cannot authenticate automatically.')
  console.log('Manual steps needed:')
  console.log('  1. Open http://localhost:8069/web/database/selector')
  console.log('  2. Check if you can log in to dailyFlow.db')
  console.log('  3. OR create a new database named: dayflow')
  console.log('  4. Install app "dayflow_hrms" from Apps menu')
}

main().catch(e => console.error(e))
