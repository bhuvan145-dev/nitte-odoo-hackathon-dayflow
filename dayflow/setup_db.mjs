import { Client } from 'pg'

const credentialsToTry = [
  { user: 'odoo', password: 'odoo' },
  { user: 'postgres', password: 'postgres' },
  { user: 'postgres', password: '' },
  { user: 'postgres', password: 'admin' },
  { user: 'odoo', password: 'admin' },
  { user: 'admin', password: 'admin' },
]

async function tryConnect(creds) {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: creds.user,
    password: creds.password,
    database: 'postgres',
    connectionTimeoutMillis: 3000,
  })
  try {
    await client.connect()
    return client
  } catch (e) {
    try { await client.end() } catch(_) {}
    return null
  }
}

async function main() {
  let workingClient = null
  let workingCreds = null

  for (const creds of credentialsToTry) {
    process.stdout.write(`Trying ${creds.user}:${creds.password || '(empty)'} ... `)
    const c = await tryConnect(creds)
    if (c) {
      console.log('OK')
      workingClient = c
      workingCreds = creds
      break
    } else {
      console.log('FAIL')
    }
  }

  if (!workingClient) {
    console.error('\nERROR: Could not connect to PostgreSQL on localhost:5432.')
    console.error('Known credentials tried:', credentialsToTry.map(c => `${c.user}/${c.password || '(empty)'}`).join(', '))
    process.exit(1)
  }

  console.log(`\nConnected as ${workingCreds.user}. Checking databases...`)

  try {
    const res = await workingClient.query("SELECT datname FROM pg_database WHERE datname = 'dayflow'")
    if (res.rows.length > 0) {
      console.log("Database 'dayflow' already exists — skipping creation.")
    } else {
      console.log("Creating database 'dayflow'...")
      await workingClient.query('CREATE DATABASE dayflow')
      console.log("Database 'dayflow' created successfully.")
    }

    const credsOut = {
      DB_USER: workingCreds.user,
      DB_PASSWORD: workingCreds.password,
      DB_HOST: 'localhost',
      DB_PORT: 5432,
      DB_NAME: 'dayflow',
    }
    console.log('\n--- PostgreSQL Connection Info ---')
    console.log(JSON.stringify(credsOut, null, 2))
  } catch (e) {
    console.error('Error during DB setup:', e.message)
    process.exit(1)
  } finally {
    await workingClient.end()
  }
}

main().catch(e => { console.error(e); process.exit(1) })
