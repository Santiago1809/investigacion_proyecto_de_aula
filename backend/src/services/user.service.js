import { listActiveAgents } from '../repositories/user.repository.js'

export async function getActiveAgents() {
  const agents = await listActiveAgents()
  return { status: 200, data: agents }
}
