// src/modules/Fields/pages/FieldsPage.tsx
import { useCallback, useState } from "react";
import type { Field } from "@/lib/map-types";
import { MOCK_FIELDS, overwriteMockFields } from "@/lib/mock-data";
import { FieldsEditor } from "../components/FieldsEditor";
import { ensureFieldColors } from "../utils/colors";

const cloneInitialFields = (): Field[] => JSON.parse(JSON.stringify(MOCK_FIELDS)) as Field[];

export default function CamposPage() {
  const [fields, setFields] = useState<Field[]>(() => ensureFieldColors(cloneInitialFields()));

  const handleFieldsChange = useCallback((updater: (current: Field[]) => Field[]) => {
    setFields((current) => {
      const next = ensureFieldColors(updater(current));
      overwriteMockFields(next);
      return next;
    });
  }, []);

  return (
    <div className="container mx-auto py-4">
      <h1 className="text-3xl font-bold mb-4">Gestión de Campos</h1>
      <FieldsEditor fields={fields} onFieldsChange={handleFieldsChange} />
    </div>
  );
}
