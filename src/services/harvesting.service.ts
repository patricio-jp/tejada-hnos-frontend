import apiClient from '@/lib/api-client'

const HARVEST_LOTS_PATH = '/harvest-lots'

export type Caliber = 'SMALL' | 'MEDIUM' | 'LARGE'
export type HarvestLotStatus = 'PENDIENTE_PROCESO' | 'EN_STOCK' | 'AGOTADO'

export type HarvestLot = {
  id: string
  plotId?: string | null
  parcelId?: string | null
  plotName?: string | null
  parcelName?: string | null
  grossWeight: number
  netWeight?: number | null
  caliber?: Caliber | null
  status: HarvestLotStatus
  createdAt?: string
  updatedAt?: string
}

export type CreateHarvestLotPayload = {
  plotId: string
  grossWeight: number
}

export type ProcessHarvestLotPayload = {
  netWeight: number
  caliber: Caliber
}

export async function getHarvestLots(signal?: AbortSignal) {
  return apiClient.get<HarvestLot[]>(HARVEST_LOTS_PATH, { signal })
}

export async function createHarvestLot(payload: CreateHarvestLotPayload) {
  return apiClient.post<HarvestLot>(HARVEST_LOTS_PATH, payload)
}

export async function processHarvestLot(lotId: string, payload: ProcessHarvestLotPayload) {
  return apiClient.post<HarvestLot>(`${HARVEST_LOTS_PATH}/${lotId}/process`, payload)
}
