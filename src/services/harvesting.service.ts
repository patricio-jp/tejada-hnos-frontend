const HARVEST_BASE_URL = '/api/harvest-lots'

export type HarvestLotStatus = 'PENDIENTE_PROCESO' | 'EN_STOCK' | 'AGOTADO'
export type Caliber = 'SMALL' | 'MEDIUM' | 'LARGE'

export type HarvestLot = {
  id: string
  plotId: string
  plotName?: string
  status: HarvestLotStatus
  grossWeight: number
  netWeight?: number
  caliber?: Caliber
  createdAt?: string
}

export type CreateHarvestLotInput = {
  plotId: string
  grossWeight: number
}

export type ProcessHarvestLotInput = {
  netWeight: number
  caliber: Caliber
}

function getAccessToken(): string | null {
  try {
    return typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
  } catch {
    return null
  }
}

function buildAuthHeaders(contentType?: string): HeadersInit {
  const token = getAccessToken()
  if (!token) {
    throw new Error('No se encontró el token de autenticación. Iniciá sesión nuevamente.')
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  }

  if (contentType) headers['Content-Type'] = contentType
  return headers
}

async function handleResponse<T>(response: Response): Promise<T> {
  let payload: any = null
  try {
    payload = await response.json()
  } catch {
    payload = null
  }

  if (!response.ok) {
    const message = payload?.message ?? 'Error al comunicarse con el servidor.'
    throw new Error(message)
  }

  if (payload && typeof payload === 'object' && 'data' in payload) {
    return payload.data as T
  }

  return (payload ?? null) as T
}

export async function getHarvestLots(): Promise<HarvestLot[]> {
  const response = await fetch(HARVEST_BASE_URL, {
    headers: buildAuthHeaders(),
  })
  return handleResponse<HarvestLot[]>(response)
}

export async function createHarvestLot(data: CreateHarvestLotInput): Promise<HarvestLot> {
  const response = await fetch(HARVEST_BASE_URL, {
    method: 'POST',
    headers: buildAuthHeaders('application/json'),
    body: JSON.stringify(data),
  })
  return handleResponse<HarvestLot>(response)
}

export async function processHarvestLot(id: string, data: ProcessHarvestLotInput): Promise<HarvestLot> {
  const response = await fetch(`${HARVEST_BASE_URL}/${id}/process`, {
    method: 'PUT',
    headers: buildAuthHeaders('application/json'),
    body: JSON.stringify(data),
  })
  return handleResponse<HarvestLot>(response)
}
