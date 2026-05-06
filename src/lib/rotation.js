// Nova sequência baseada no desenho:
// Esquerda e Direita alternando, 3 fileiras (Superior/Meio/Inferior)
// Cada fileira tem 2 círculos (A e B = primeiro e segundo uso)
// Dia 1→6: primeira passagem | Dia 7→12: segunda passagem
export const ROTATION_SEQUENCE = [
  'ES1', 'DS1',  // Superior: Esq A, Dir A
  'EM1', 'DM1',  // Meio:     Esq A, Dir A
  'EI1', 'DI1',  // Inferior: Esq A, Dir A
  'ES2', 'DS2',  // Superior: Esq B, Dir B
  'EM2', 'DM2',  // Meio:     Esq B, Dir B
  'EI2', 'DI2',  // Inferior: Esq B, Dir B
]

// Número do dia no ciclo (1-12)
export const POSITION_DAY = {
  ES1: 1,  DS1: 2,
  EM1: 3,  DM1: 4,
  EI1: 5,  DI1: 6,
  ES2: 7,  DS2: 8,
  EM2: 9,  DM2: 10,
  EI2: 11, DI2: 12,
}

export const POSITION_LABELS = {
  ES1: { label: 'Esquerda Superior',  region: 'ES', pass: 1 },
  DS1: { label: 'Direita Superior',   region: 'DS', pass: 1 },
  EM1: { label: 'Esquerda Meio',      region: 'EM', pass: 1 },
  DM1: { label: 'Direita Meio',       region: 'DM', pass: 1 },
  EI1: { label: 'Esquerda Inferior',  region: 'EI', pass: 1 },
  DI1: { label: 'Direita Inferior',   region: 'DI', pass: 1 },
  ES2: { label: 'Esquerda Superior',  region: 'ES', pass: 2 },
  DS2: { label: 'Direita Superior',   region: 'DS', pass: 2 },
  EM2: { label: 'Esquerda Meio',      region: 'EM', pass: 2 },
  DM2: { label: 'Direita Meio',       region: 'DM', pass: 2 },
  EI2: { label: 'Esquerda Inferior',  region: 'EI', pass: 2 },
  DI2: { label: 'Direita Inferior',   region: 'DI', pass: 2 },
}

export function getNextPosition(lastPosition) {
  if (!lastPosition) return ROTATION_SEQUENCE[0]
  const idx = ROTATION_SEQUENCE.indexOf(lastPosition)
  if (idx === -1) return ROTATION_SEQUENCE[0]
  return ROTATION_SEQUENCE[(idx + 1) % ROTATION_SEQUENCE.length]
}
