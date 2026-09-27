import { getActiveAgents } from '../services/user.service.js'

export async function listAgentsController(req, res) {
  const result = await getActiveAgents()
  return res.status(result.status).json(result)
}
