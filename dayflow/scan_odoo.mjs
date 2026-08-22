const ODOO_URL = 'http://localhost:8069'

async function jsonRpc(service, method, args = []) {
  const payload = {
    jsonrpc: '2.0',
    method: 'call',
    params: { service, method, args },
    id: Math.floor(Math.random() * 1e6),
  }
  const res = await fetch(`${ODOO_URL}/jsonrpc`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await res.json()
  if (data.error) throw new Error(data.error.data?.message || data.error.message || JSON.stringify(data.error))
  return data.result
}

async function authenticate(db, login, password) {
  try {
    return await jsonRpc('common', 'authenticate', [db, login, password, {}])
  } catch (e) { return -1 }
}

async function execute_kw(db, uid, pwd, model, method, args, kwargs = {}) {
  return jsonRpc('object', 'execute_kw', [db, uid, pwd, model, method, args, kwargs])
}

const dbs = ['dailyFlow.db', 'dayflow', 'postgres', 'dailyflow']

const creds = [
  ['admin', 'admin'],
  ['admin', 'admin123'],
  ['admin', 'dayflow'],
  ['admin@dayflow.com', 'admin123'],
  ['admin@dayflow.com', 'admin'],
  ['employee@dayflow.com', 'employee123'],
  ['odoo', 'odoo'],
]

async function main() {
  console.log('--- Scanning databases + credentials ---\n')
  for (const db of dbs) {
    for (const [login, pwd] of creds) {
      process.stdout.write(`  ${db} | ${login}:${pwd} ... `)
      const uid = await authenticate(db, login, pwd)
      if (uid && typeof uid === 'number' && uid > 0) {
        console.log(`OK uid=${uid}`)
        console.log(`\n--> WORKING: DB='${db}', login='${login}', pwd='${pwd}', uid=${uid}`)

        try {
          const modules = await execute_kw(db, uid, pwd, 'ir.module.module', 'search_read',
            [[['name', 'like', 'dayflow']]], ['name', 'state'])
          console.log('    dayflow modules:', modules.length ? modules.map(m => `${m.name}=${m.state}`).join(',') : '(none)')
        } catch (e) { console.log('    module search error:', e.message.substring(0, 80)) }

        try {
          const users = await execute_kw(db, uid, pwd, 'res.users', 'search_read',
            [[]], ['login', 'name', 'email'], 0, 10)
          console.log('    users sample:', users.map(u => `${u.login} (${u.name})`).join(', '))
        } catch (e) { console.log('    user search error:', e.message.substring(0, 80)) }

        process.exit(0)
      } else {
        console.log(uid === -1 ? 'CONNERR' : 'WRONG (uid=false)')
      }
    }
  }
  console.log('\nNo working credentials found.')
}

main().catch(e => console.error(e))
