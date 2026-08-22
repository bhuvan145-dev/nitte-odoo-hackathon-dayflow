const ODOO_BASE = import.meta.env.VITE_ODOO_URL || '/odoo'
const ODOO_DB = import.meta.env.VITE_ODOO_DB || 'dayflow'

let sessionId = localStorage.getItem('odoo_session_id') || null

const setSession = (sid) => {
  sessionId = sid
  if (sid) localStorage.setItem('odoo_session_id', sid)
  else localStorage.removeItem('odoo_session_id')
}

const jsonRpc = async (service, method, args = [], kwargs = {}) => {
  const payload = {
    jsonrpc: '2.0',
    method: 'call',
    params: { service, method, args, kwargs },
    id: Math.floor(Math.random() * 1e6)
  }
  const headers = { 'Content-Type': 'application/json' }
  if (sessionId) headers['Cookie'] = `session_id=${sessionId}`

  const res = await fetch(`${ODOO_BASE}/jsonrpc`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
    credentials: 'include'
  })

  const setCookie = res.headers.get('Set-Cookie') || res.headers.get('set-cookie')
  if (setCookie) {
    const m = setCookie.match(/session_id=([^;]+)/)
    if (m) setSession(m[1])
  }

  const data = await res.json()
  if (data.error) {
    const msg = data.error?.data?.message || data.error?.message || 'Odoo API Error'
    throw new Error(msg)
  }
  return data.result
}

export const odooCommon = {
  version: () => jsonRpc('common', 'version'),
  authenticate: (login, password) =>
    jsonRpc('common', 'authenticate', [ODOO_DB, login, password, {}])
}

export const odooModels = (uid, password) => ({
  searchRead: async (model, domain = [], fields = [], limit = 100, offset = 0, order = '') => {
    const kwargs = { fields, offset, limit }
    if (order) kwargs.order = order
    return jsonRpc('object', 'execute_kw', [ODOO_DB, uid, password, model, 'search_read', [domain], kwargs])
  },
  create: async (model, vals) =>
    jsonRpc('object', 'execute_kw', [ODOO_DB, uid, password, model, 'create', [vals]]),
  write: async (model, ids, vals) =>
    jsonRpc('object', 'execute_kw', [ODOO_DB, uid, password, model, 'write', [ids, vals]]),
  unlink: async (model, ids) =>
    jsonRpc('object', 'execute_kw', [ODOO_DB, uid, password, model, 'unlink', [ids]]),
  call: async (model, methodName, args = [], kwargs = {}) =>
    jsonRpc('object', 'execute_kw', [ODOO_DB, uid, password, model, methodName, args, kwargs]),
})

export const callButtonMethod = async (uid, password, model, method, ids) =>
  jsonRpc('object', 'execute_kw', [ODOO_DB, uid, password, model, method, [ids]])

export default {
  get sessionId() { return sessionId },
  setSession,
  ODOO_BASE,
  ODOO_DB,
}
