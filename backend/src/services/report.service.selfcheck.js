// Self-check del escapado CSV. Sin framework: `node
// src/services/report.service.selfcheck.js`.
//
// Falla si el escapado RFC 4180 o el guardia de fórmula se rompen. El guardia
// importa más de lo que parece: un title libre que empiece con '=' se ejecuta
// como fórmula al abrir el archivo en Excel.
import assert from 'node:assert/strict'

// El servicio importa el repositorio, que levanta el Pool de pg y valida el
// env al importarse. Se fijan valores falsos ANTES del import dinámico para
// que el check corra sin .env y sin abrir ninguna conexión (Pool es lazy).
process.env.DB_HOST ??= 'localhost'
process.env.DB_NAME ??= 'selfcheck'
process.env.DB_USER ??= 'selfcheck'
process.env.DB_PASSWORD ??= 'selfcheck'
process.env.JWT_SECRET ??= 'selfcheck-secret-que-no-sirve-32-chars'

const { toCsv, toCsvCell } = await import('./report.service.js')

// --- Escapado RFC 4180 -----------------------------------------------------
assert.equal(toCsvCell('Impresora'), 'Impresora')
assert.equal(toCsvCell('Red, blanco'), '"Red, blanco"')
assert.equal(toCsvCell('Linea 1\nLinea 2'), '"Linea 1\nLinea 2"')
assert.equal(toCsvCell('Linea 1\r\nLinea 2'), '"Linea 1\r\nLinea 2"')
assert.equal(toCsvCell(' dijo "hola" '), '" dijo ""hola"" "')

// --- Guardia de fórmula ----------------------------------------------------
assert.equal(toCsvCell('=1+1'), "'=1+1")
assert.equal(toCsvCell('+CMD()'), "'+CMD()")
assert.equal(toCsvCell('-2+3'), "'-2+3")
assert.equal(toCsvCell('@SUM(A1)'), "'@SUM(A1)")
// El tabulador dispara el guardia pero NO las comillas: el apóstrofo queda
// primero, así que la celda sigue siendo texto plano para la planilla.
assert.equal(toCsvCell('\t=1+1'), "'\t=1+1")
assert.equal(toCsvCell('\r=1+1'), '"\'\r=1+1"')
// Una celda con comillas que además dispara fórmula sale con apóstrofo Y
// entrecomillada, con las comillas internas duplicadas.
assert.equal(
  toCsvCell('=IMPORTXML("a","b")'),
  `"'=IMPORTXML(""a"",""b"")"`
)
// El guardia no toca valores que empiezan por algo inofensivo.
assert.equal(toCsvCell('RESUELTO'), 'RESUELTO')
assert.equal(toCsvCell('-'), "'-")
assert.equal(toCsvCell('MEDIA'), 'MEDIA')

// --- Nulos, números y fechas ------------------------------------------------
assert.equal(toCsvCell(null), '')
assert.equal(toCsvCell(undefined), '')
assert.equal(toCsvCell(7), '7')
assert.equal(
  toCsvCell(new Date('2026-09-27T14:05:09.000Z')),
  '2026-09-27 14:05:09'
)

// --- Documento completo -----------------------------------------------------
const csv = toCsv([
  {
    id: 'uuid-1',
    titulo: 'Impresora del segundo piso',
    categoria: 'Hardware',
    estado: 'RESUELTO',
    prioridad: 'ALTA',
    solicitante: 'Ana Ruiz',
    agente: 'Luis Pérez',
    creada: new Date('2026-09-01T10:00:00.000Z'),
    resuelta: new Date('2026-09-05T12:30:00.000Z'),
    cerrada: null
  },
  {
    id: 'uuid-2',
    titulo: '=HYPERLINK("http://x","clic")',
    categoria: 'Software',
    estado: 'NUEVO',
    prioridad: 'BAJA',
    solicitante: 'Juan Díaz',
    agente: null,
    creada: new Date('2026-09-20T08:00:00.000Z'),
    resuelta: null,
    cerrada: null
  }
])

assert.ok(csv.startsWith('\uFEFF'), 'falta el BOM UTF-8')
assert.equal(
  csv,
  '\uFEFF' +
    'id,titulo,categoria,estado,prioridad,solicitante,agente,creada,resuelta,cerrada\r\n' +
    'uuid-1,Impresora del segundo piso,Hardware,RESUELTO,ALTA,Ana Ruiz,Luis Pérez,2026-09-01 10:00:00,2026-09-05 12:30:00,\r\n' +
    'uuid-2,"\'=HYPERLINK(""http://x"",""clic"")",Software,NUEVO,BAJA,Juan Díaz,,2026-09-20 08:00:00,,\r\n'
)

// Ninguna celda puede empezar por un carácter de fórmula en el archivo final.
for (const line of csv.split('\r\n').slice(1)) {
  for (const cell of line.split(',')) {
    assert.ok(
      !/^[=+\-@\t\r]/.test(cell),
      `celda sin guardia de fórmula: ${JSON.stringify(cell)}`
    )
  }
}

console.log('report.service.selfcheck: OK (todas las aserciones pasaron)')
