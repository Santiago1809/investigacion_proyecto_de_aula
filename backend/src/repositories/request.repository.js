import { pool } from '../config/database.js'

// Filtros combinables del listado. Cada criterio se agrega al WHERE solo si
// viene en el query y todos se combinan con AND, así la combinación es
// consistente entre los dos listados. Los valores viajan siempre
// parametrizados: el placeholder se calcula con el índice que le toca en el
// array de parámetros, nunca se interpola el valor.
export const REQUEST_FILTER_KEYS = ['q', 'status', 'priority', 'category_id']

const FILTER_PREDICATES = {
  // El patrón %q% se arma acá, como ya se hacía. title/description son texto,
  // por eso el parámetro no lleva cast.
  q: (filters, values) => {
    values.push(`%${filters.q}%`)
    return `(r.title ilike $${values.length} or r.description ilike $${values.length})`
  },
  // status/priority son ENUM y category_id SMALLINT: la comparación con el
  // placeholder sin cast deja que PostgreSQL infiera el tipo de la columna.
  status: (filters, values) => {
    values.push(filters.status)
    return `r.status = $${values.length}`
  },
  priority: (filters, values) => {
    values.push(filters.priority)
    return `r.priority = $${values.length}`
  },
  category_id: (filters, values) => {
    values.push(filters.category_id)
    return `r.category_id = $${values.length}`
  }
}

function buildFilterPredicates(filters, values) {
  return REQUEST_FILTER_KEYS.filter(
    (key) => filters[key] !== undefined
  ).map((key) => FILTER_PREDICATES[key](filters, values))
}

export async function getUserRequests(user_id, limit, offset, filters = {}) {
  const values = [user_id]
  // El alcance por rol no cambia: el solicitante solo ve las suyas.
  const conditions = ['r.requester_id = $1', ...buildFilterPredicates(filters, values)]
  values.push(limit, offset)
  const { rows } = await pool.query(
    `select
        r.id,
        r.title,
        r.description,
        c."name" as category,
        r.priority,
        r.status,
        count(*) over() as total_items
      from
        requests r
      inner join categories c
      on r.category_id = c.id
      where ${conditions.join(' and ')}
      order by r.created_at desc
      limit $${values.length - 1} offset $${values.length};`,
    values
  )
  return rows
}

export async function createUserRequest(
  title,
  description,
  category_id,
  priority,
  user_id
) {
  const { rows } = await pool.query(
    `
    INSERT INTO requests (title, description, category_id, priority, requester_id)  VALUES ($1,$2,$3,$4,$5)  RETURNING *
    `,
    [title, description, category_id, priority, user_id]
  )

  return rows
}
// ORDER BY no acepta parámetros ($1), por eso solo se permiten estas columnas
const SORT_COLUMNS = {
  priority: 'r.priority',
  status: 'r.status',
  created_at: 'r.created_at'
}

export async function getAllRequests(sortBy, order, limit, offset, filters = {}) {
  const column = SORT_COLUMNS[sortBy] ?? SORT_COLUMNS.created_at
  const direction = order === 'asc' ? 'asc' : 'desc'
  const values = []
  const conditions = buildFilterPredicates(filters, values)
  values.push(limit, offset)
  // Sin filtros no hay WHERE: el listado global sigue mostrando todo.
  const where = conditions.length ? `where ${conditions.join(' and ')}` : ''
  const { rows } = await pool.query(
    `select
        r.id,
        r.title,
        r.description,
        c."name" as category,
        r.priority,
        r.status,
        r.created_at,
        u.full_name as requester,
        ua.full_name as agent,
        count(*) over() as total_items
      from
        requests r
      inner join categories c
        on r.category_id = c.id
      inner join users u
        on r.requester_id = u.id
      left join request_assignments ra
        on ra.request_id = r.id and ra.unassigned_at is null
      left join users ua on ua.id = ra.agent_id
      ${where}
      order by ${column} ${direction}, r.created_at desc, r.id
      limit $${values.length - 1} offset $${values.length};`,
    values
  )
  return rows
}

// Listado del agente. El alcance va en el JOIN y no en un WHERE: el id del
// agente es $1 y uq_active_request_assignment garantiza como máximo una
// asignación vigente por solicitud, así que el join no duplica filas y
// count(*) over() cuenta solicitudes, no asignaciones.
export async function getAssignedRequests(
  agent_id,
  limit,
  offset,
  filters = {}
) {
  const values = [agent_id]
  const conditions = buildFilterPredicates(filters, values)
  values.push(limit, offset)
  // El alcance ya está en el join, así que sin filtros no hay WHERE: el
  // listado muestra todas las solicitudes con asignación vigente del agente.
  const where = conditions.length ? `where ${conditions.join(' and ')}` : ''
  const { rows } = await pool.query(
    `select
        r.id,
        r.title,
        r.description,
        c."name" as category,
        r.priority,
        r.status,
        r.created_at,
        u.full_name as requester,
        ua.full_name as agent,
        count(*) over() as total_items
      from
        requests r
      inner join categories c
        on r.category_id = c.id
      inner join users u
        on r.requester_id = u.id
      inner join request_assignments ra
        on ra.request_id = r.id and ra.unassigned_at is null and ra.agent_id = $1
      inner join users ua on ua.id = ra.agent_id
      ${where}
      order by r.created_at desc, r.id
      limit $${values.length - 1} offset $${values.length};`,
    values
  )
  return rows
}

export async function getRequestById(request_id) {
  const { rows } = await pool.query(
    `select
        r.id,
        r.title,
        r.description,
        r.priority,
        r.status,
        r.created_at,
        r.updated_at,
        r.resolved_at,
        r.closed_at,
        c."name" as category,
        u.id as requester_id,
        u.full_name as requester,
        ra.agent_id,
        ua.full_name as agent,
        rb.full_name as assigned_by_name,
        ra.assigned_at
      from requests r
      inner join categories c on c.id = r.category_id
      inner join users u on u.id = r.requester_id
      left join request_assignments ra
        on ra.request_id = r.id and ra.unassigned_at is null
      left join users ua on ua.id = ra.agent_id
      left join users rb on rb.id = ra.assigned_by
      where r.id = $1;`,
    [request_id]
  )
  return rows[0] ?? null
}

export async function assignRequestToAgent(request_id, agent_id, assigned_by) {
  // Los triggers trg_validate_assignment / uq_active_request_assignment /
  // trg_validate_status_transition validan toda la regla de negocio y
  // trg_assignment_effects registra auditoría + notificación. Todo debe ir
  // en la misma transacción y con app.current_user_id seteado.
  const client = await pool.connect()
  try {
    await client.query('begin')
    await client.query("select set_config('app.current_user_id', $1, true)", [
      assigned_by
    ])
    const { rows } = await client.query(
      `insert into request_assignments (request_id, agent_id, assigned_by)
        values ($1, $2, $3)
        returning id, request_id, agent_id, assigned_by, assigned_at;`,
      [request_id, agent_id, assigned_by]
    )
    await client.query(
      `update requests set status = 'ASIGNADO' where id = $1;`,
      [request_id]
    )
    await client.query('commit')
    return rows[0]
  } catch (error) {
    await client.query('rollback')
    throw error
  } finally {
    client.release()
  }
}

// Misma matriz que el trigger trg_validate_status_transition de la BD.
const ALLOWED_TRANSITIONS = {
  NUEVO: ['ASIGNADO'],
  ASIGNADO: ['EN_PROGRESO'],
  EN_PROGRESO: ['RESUELTO'],
  RESUELTO: ['CERRADO', 'EN_PROGRESO']
}

export async function changeRequestStatus(
  request_id,
  new_status,
  actor_id,
  has_coordinator
) {
  // Todo en un solo cliente/transacción: trg_audit_status_change lee
  // app.current_user_id y create_status_history debe correr ANTES del update
  // porque lee el estado anterior con FOR UPDATE.
  const client = await pool.connect()
  try {
    await client.query('begin')
    const { rows: found } = await client.query(
      `select id, status, requester_id from requests where id = $1 for update;`,
      [request_id]
    )
    const request = found[0]
    if (!request) {
      await client.query('rollback')
      return null
    }

    if (!has_coordinator) {
      const { rows: assignment } = await client.query(
        `select 1 from request_assignments
          where request_id = $1 and agent_id = $2 and unassigned_at is null;`,
        [request_id, actor_id]
      )
      if (assignment.length === 0) {
        await client.query('rollback')
        const error = new Error(
          'No tienes permisos para cambiar el estado de esta solicitud'
        )
        error.code = 'FORBIDDEN'
        throw error
      }
    }

    if (!ALLOWED_TRANSITIONS[request.status]?.includes(new_status)) {
      await client.query('rollback')
      const error = new Error(
        `Transición de estado no permitida: ${request.status} -> ${new_status}`
      )
      error.code = 'INVALID_TRANSITION'
      throw error
    }

    await client.query("select set_config('app.current_user_id', $1, true)", [
      actor_id
    ])
    await client.query('select create_status_history($1, $2, $3);', [
      request_id,
      new_status,
      actor_id
    ])
    const { rows } = await client.query(
      `update requests
        set status = $1
        where id = $2
        returning id, status, updated_at, resolved_at, closed_at;`,
      [new_status, request_id]
    )
    await client.query('commit')
    return rows[0]
  } catch (error) {
    await client.query('rollback')
    throw error
  } finally {
    client.release()
  }
}

export async function getRequestStatusHistory(request_id) {
  const { rows: found } = await pool.query(
    `select 1 from requests where id = $1;`,
    [request_id]
  )
  if (found.length === 0) {
    return null
  }
  const { rows } = await pool.query(
    `select
        h.id,
        h.request_id,
        h.previous_status,
        h.new_status,
        h.changed_by,
        u.full_name as changed_by_name,
        h.changed_at
      from request_status_history h
      join users u on u.id = h.changed_by
      where h.request_id = $1
      order by h.changed_at asc, h.id;`,
    [request_id]
  )
  return rows
}

export async function updateRequestPriority(request_id, priority, actor_id) {
  // El trigger trg_audit_priority_change lee app.current_user_id para registrar
  // quién hizo el cambio, así que todo debe ir en la misma transacción y cliente
  const client = await pool.connect()
  try {
    await client.query('begin')
    await client.query("select set_config('app.current_user_id', $1, true)", [
      actor_id
    ])
    const { rows } = await client.query(
      `update requests
        set priority = $1
        where id = $2
        returning id, priority, updated_at;`,
      [priority, request_id]
    )
    await client.query('commit')
    return rows[0] ?? null
  } catch (error) {
    await client.query('rollback')
    throw error
  } finally {
    client.release()
  }
}

export async function confirmRequestResolution(request_id, user_id) {
  // El solicitante confirma la solución: RESUELTO -> CERRADO. El trigger
  // trg_audit_status_change no cubre SOLUTION_CONFIRMED, así que el evento de
  // auditoría se inserta explícito, todo en la misma transacción y con
  // app.current_user_id seteado (trg_set_closed_at pone closed_at).
  const client = await pool.connect()
  try {
    await client.query('begin')
    const { rows: found } = await client.query(
      `select id, status, requester_id from requests where id = $1 for update;`,
      [request_id]
    )
    const request = found[0]
    if (!request) {
      await client.query('rollback')
      return null
    }
    if (request.requester_id !== user_id) {
      await client.query('rollback')
      const error = new Error('Solo el solicitante puede confirmar la solución')
      error.code = 'FORBIDDEN'
      throw error
    }
    if (request.status !== 'RESUELTO') {
      await client.query('rollback')
      const error = new Error('Solo una solicitud RESUELTA puede confirmarse')
      error.code = 'INVALID_TRANSITION'
      throw error
    }
    await client.query("select set_config('app.current_user_id', $1, true)", [
      user_id
    ])
    const { rows } = await client.query(
      `update requests set status = 'CERRADO' where id = $1
        returning id, status, closed_at, updated_at;`,
      [request_id]
    )
    await client.query(
      `insert into audit_events (request_id, actor_id, action, field_name, old_value, new_value)
        values ($1, $2, 'SOLUTION_CONFIRMED', 'status', 'RESUELTO', 'CERRADO');`,
      [request_id, user_id]
    )
    await client.query('commit')
    return rows[0]
  } catch (error) {
    await client.query('rollback')
    throw error
  } finally {
    client.release()
  }
}

export async function reopenResolvedRequest(request_id, user_id, reason) {
  // El solicitante reabre su solicitud: RESUELTO -> EN_PROGRESO. El motivo se
  // registra como comentario (trg_comment_audit audita) y el evento
  // REQUEST_REOPENED se inserta explícito, todo en la misma transacción.
  const client = await pool.connect()
  try {
    await client.query('begin')
    const { rows: found } = await client.query(
      `select id, status, requester_id from requests where id = $1 for update;`,
      [request_id]
    )
    const request = found[0]
    if (!request) {
      await client.query('rollback')
      return null
    }
    if (request.requester_id !== user_id) {
      await client.query('rollback')
      const error = new Error('Solo el solicitante puede reabrir la solicitud')
      error.code = 'FORBIDDEN'
      throw error
    }
    if (request.status !== 'RESUELTO') {
      await client.query('rollback')
      const error = new Error('Solo una solicitud RESUELTA puede reabrirse')
      error.code = 'INVALID_TRANSITION'
      throw error
    }
    await client.query("select set_config('app.current_user_id', $1, true)", [
      user_id
    ])
    const { rows } = await client.query(
      `update requests set status = 'EN_PROGRESO' where id = $1
        returning id, status, updated_at, resolved_at, closed_at;`,
      [request_id]
    )
    await client.query(
      `insert into request_comments (request_id, author_id, content)
        values ($1, $2, $3);`,
      [request_id, user_id, reason]
    )
    await client.query(
      `insert into audit_events (request_id, actor_id, action, field_name, old_value, new_value)
        values ($1, $2, 'REQUEST_REOPENED', 'status', 'RESUELTO', 'EN_PROGRESO');`,
      [request_id, user_id]
    )
    await client.query('commit')
    return rows[0]
  } catch (error) {
    await client.query('rollback')
    throw error
  } finally {
    client.release()
  }
}

export async function createRequestComment(request_id, author_id, content) {
  const { rows } = await pool.query(
    `insert into request_comments (request_id, author_id, content)
      values ($1, $2, $3)
      returning id, request_id, author_id, content, created_at;`,
    [request_id, author_id, content]
  )
  return rows[0]
}

export async function canReadRequestComments(
  request_id,
  user_id,
  is_requester,
  is_agent,
  is_staff
) {
  const { rows } = await pool.query(
    `select r.id
      from requests r
      where r.id = $1
        and (
          $3
          or ($4 and r.requester_id = $2)
          or ($5 and exists (
            select 1
              from request_assignments a
              where a.request_id = r.id
                and a.agent_id = $2
                and a.unassigned_at is null
          ))
        );`,
    [request_id, user_id, is_staff, is_requester, is_agent]
  )
  return rows.length > 0
}

export async function listRequestComments(request_id) {
  const { rows } = await pool.query(
    `select
        rc.id,
        rc.request_id,
        rc.author_id,
        u.full_name as author,
        rc.content,
        rc.created_at
      from
        request_comments rc
      inner join users u
        on rc.author_id = u.id
      where rc.request_id = $1
      order by rc.created_at asc, rc.id;`,
    [request_id]
  )
  return rows
}
