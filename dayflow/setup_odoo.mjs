const ODOO_URL = 'http://localhost:8069'
const DB_NAME = 'dayflow'
const ADMIN_PASSWORD = 'admin'

async function jsonRpc(service, method, args = [], kwargs = {}) {
  const payload = {
    jsonrpc: '2.0',
    method: 'call',
    params: { service, method, args, kwargs },
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

async function main() {
  console.log('1. Checking Odoo version...')
  try {
    const ver = await jsonRpc('common', 'version')
    console.log('   Odoo version:', ver.server_version, 'protocol:', ver.protocol_version)
  } catch (e) {
    console.log('   Version check error:', e.message)
  }

  console.log('\n2. Listing existing databases...')
  try {
    const dbs = await jsonRpc('db', 'list')
    console.log('   Databases:', dbs.join(', ') || '(none)')
    if (dbs.includes(DB_NAME)) {
      console.log(`   Database '${DB_NAME}' already exists!`)
    }
  } catch (e) {
    console.log('   db.list error (maybe db service restricted):', e.message)
  }

  console.log('\n3. Trying to create dayflow database via Odoo...')
  let dbExists = false
  try {
    const dbs = await jsonRpc('db', 'list')
    if (dbs.includes(DB_NAME)) {
      dbExists = true
    }
  } catch(_) {}

  if (!dbExists) {
    const passwordsToTry = ['admin', ADMIN_PASSWORD, 'odoo', 'dayflow', '']
    for (const pwd of passwordsToTry) {
      process.stdout.write(`   master_password='${pwd}' ... `)
      try {
        await jsonRpc('db', 'create_database', [pwd, DB_NAME, false, 'en_US', ADMIN_PASSWORD])
        console.log(`OK - created '${DB_NAME}' with admin password '${ADMIN_PASSWORD}'`)
        dbExists = true
        break
      } catch (e) {
        const msg = e.message.toLowerCase()
        if (msg.includes('already exists')) {
          console.log('DB already exists')
          dbExists = true
          break
        }
        if (msg.includes('access denied') || msg.includes('master') || msg.includes('wrong') || msg.includes('security')) {
          console.log('wrong master pw')
        } else {
          console.log('error:', e.message.substring(0, 80))
        }
      }
    }
  }

  if (!dbExists) {
    console.log('\nWARNING: Could not create database via Odoo db service.')
    console.log('Possible solutions:')
    console.log('  1. Visit http://localhost:8069/web/database/manager to create DB manually')
    console.log('  2. Master password is stored in Odoo config (odoo.conf) as admin_passwd')
  } else {
    console.log(`\n4. Database '${DB_NAME}' confirmed available.`)
    console.log('   Next: Install dayflow_hrms module via Odoo Apps UI (http://localhost:8069)')
  }
}

main().catch(e => { console.error('Fatal:', e); process.exit(1) })
