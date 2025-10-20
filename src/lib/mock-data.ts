// src/data/mock-data.ts

import type { Field } from "@/lib/map-types";

// Coordenadas en formato GeoJSON [Lng, Lat]
// Nota: Un polígono en GeoJSON tiene un array extra de anidamiento
const plot1GeomCoords: number[][][] = [
  [
    [-65.20, -26.83], // [Lng, Lat]
    [-65.19, -26.83],
    [-65.19, -26.82],
    [-65.20, -26.82],
    [-65.20, -26.83], // Cerrar el polígono
  ]
];

const plot2GeomCoords: number[][][] = [
  [
    [-65.21, -26.84],
    [-65.20, -26.84],
    [-65.20, -26.83],
    [-65.21, -26.83],
    [-65.21, -26.84],
  ]
];

const field1BoundaryCoords: number[][][] = [
  [
    [-65.22, -26.85],
    [-65.18, -26.85],
    [-65.18, -26.81],
    [-65.22, -26.81],
    [-65.22, -26.85],
  ]
];


export const MOCK_FIELDS: Field[] = [
  {
    id: "campo-1",
    // Límite del campo
    boundary: {
      type: "Feature",
      id: "campo-1", // ID del Feature
      geometry: {
        type: "Polygon",
        coordinates: field1BoundaryCoords,
      },
      properties: {
        name: "Campo \"La Esperanza\"",
      },
    },
    // Parcelas dentro del campo
    plots: [
      {
        type: "Feature",
        id: "p1", // ID del Feature
        geometry: {
          type: "Polygon",
          coordinates: plot1GeomCoords,
        },
        properties: {
          name: "Parcela A",
          variety: "Soja (DM-4800)",
          area: 120.5,
        },
      },
      {
        type: "Feature",
        id: "p2",
        geometry: {
          type: "Polygon",
          coordinates: plot2GeomCoords,
        },
        properties: {
          name: "Parcela B",
          variety: "Maíz (DK-7210)",
          area: 95.2,
        },
      },
    ],
  },
];
