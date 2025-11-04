export interface Variety {
  id: string;
  name: string;
  description?: string;
}

export interface CreateVarietyDto {
  name: string;
  description?: string;
}

export type UpdateVarietyDto = Partial<CreateVarietyDto>;
