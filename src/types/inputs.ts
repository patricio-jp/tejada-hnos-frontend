/**
 * Tipos e interfaces para Inputs (Insumos)
 */

/**
 * Unidades de medida para insumos (debe coincidir con backend)
 */
export const InputUnit = {
  KG: "KG",
  LITRO: "LITRO",
  UNIDAD: "UNIDAD",
} as const;

export type InputUnit = typeof InputUnit[keyof typeof InputUnit];

/**
 * Etiquetas legibles para las unidades
 */
export const InputUnitLabels: Record<InputUnit, string> = {
  [InputUnit.KG]: "Kilogramos",
  [InputUnit.LITRO]: "Litros",
  [InputUnit.UNIDAD]: "Unidades",
};

/**
 * Insumo
 */
export interface Input {
  id: string; // UUID v4
  name: string;
  unit: InputUnit; // Unidad de medida (KG, LITRO, UNIDAD)
  stock?: number;
  costPerUnit?: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Uso de insumo en una actividad
 */
export interface InputUsage {
  id: string;
  quantityUsed: number;
  activityId: string;
  inputId: string;
  input?: Input;
}

/**
 * DTOs para crear / actualizar insumos desde el frontend
 */
export interface CreateInputDto {
  name: string;
  unit: InputUnit;
}

export type UpdateInputDto = Partial<CreateInputDto>;
