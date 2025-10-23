# Testing de API con Postman/Thunder Client

## Colección de Requests para Testing

### 1. GET - Obtener todas las actividades

```
GET http://localhost:3000/api/activity-logs
```

**Headers:**
```
Content-Type: application/json
```

**Respuesta esperada:** 200 OK
```json
[
  {
    "id": "uuid",
    "activityType": "riego",
    "description": "Riego por goteo en sector norte",
    "executionDate": "2025-10-23T06:00:00.000Z",
    "createdAt": "2025-10-20T10:30:00.000Z",
    "updatedAt": "2025-10-20T10:30:00.000Z",
    "plotId": "plot-1",
    "createdByUserId": "user-1",
    "status": "pendiente"
  }
]
```

---

### 2. POST - Crear nueva actividad

```
POST http://localhost:3000/api/activity-logs
```

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "activityType": "riego",
  "description": "Test de riego automatizado",
  "executionDate": "2025-10-25T08:00:00.000Z",
  "plotId": "plot-test-123",
  "status": "pendiente",
  "updatedAt": "2025-10-23T00:00:00.000Z",
  "createdByUserId": "test-user"
}
```

**Respuesta esperada:** 201 Created
```json
{
  "id": "nuevo-uuid",
  "activityType": "riego",
  "description": "Test de riego automatizado",
  "executionDate": "2025-10-25T08:00:00.000Z",
  "createdAt": "2025-10-23T12:00:00.000Z",
  "updatedAt": "2025-10-23T00:00:00.000Z",
  "plotId": "plot-test-123",
  "createdByUserId": "test-user",
  "status": "pendiente"
}
```

---

### 3. PATCH - Actualizar actividad existente

```
PATCH http://localhost:3000/api/activity-logs/{id}
```

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "description": "Descripción actualizada",
  "status": "completada"
}
```

**Respuesta esperada:** 200 OK
```json
{
  "id": "uuid",
  "activityType": "riego",
  "description": "Descripción actualizada",
  "executionDate": "2025-10-25T08:00:00.000Z",
  "createdAt": "2025-10-23T12:00:00.000Z",
  "updatedAt": "2025-10-23T14:00:00.000Z",
  "plotId": "plot-test-123",
  "createdByUserId": "test-user",
  "status": "completada"
}
```

---

### 4. DELETE - Eliminar actividad

```
DELETE http://localhost:3000/api/activity-logs/{id}
```

**Respuesta esperada:** 204 No Content

---

## Casos de Prueba

### Caso 1: Validación de campos requeridos

**Request:**
```
POST http://localhost:3000/api/activity-logs
```

**Body (incompleto):**
```json
{
  "activityType": "riego"
}
```

**Respuesta esperada:** 400 Bad Request
```json
{
  "error": "Validation failed",
  "details": ["description is required", "plotId is required"]
}
```

---

### Caso 2: Tipo de actividad inválido

**Body:**
```json
{
  "activityType": "tipo-invalido",
  "description": "Test",
  "executionDate": "2025-10-25T08:00:00.000Z",
  "plotId": "plot-1",
  "status": "pendiente",
  "updatedAt": "2025-10-23T00:00:00.000Z",
  "createdByUserId": "user-1"
}
```

**Respuesta esperada:** 400 Bad Request
```json
{
  "error": "Invalid activity type",
  "validTypes": ["poda", "riego", "aplicacion", "cosecha", "otro"]
}
```

---

### Caso 3: Actualizar actividad inexistente

**Request:**
```
PATCH http://localhost:3000/api/activity-logs/id-inexistente
```

**Respuesta esperada:** 404 Not Found
```json
{
  "error": "Activity not found"
}
```

---

## Script de Pruebas Automatizadas (Node.js)

Crear `tests/api-test.js`:

```javascript
const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3000/api/activity-logs';

async function testGetActivities() {
  console.log('Testing GET /api/activity-logs...');
  const response = await fetch(API_BASE);
  const data = await response.json();
  
  console.assert(response.status === 200, 'Status should be 200');
  console.assert(Array.isArray(data), 'Response should be an array');
  console.log('✓ GET test passed');
  
  return data;
}

async function testCreateActivity() {
  console.log('Testing POST /api/activity-logs...');
  
  const newActivity = {
    activityType: 'riego',
    description: 'Test automated',
    executionDate: new Date().toISOString(),
    plotId: 'test-plot',
    status: 'pendiente',
    updatedAt: new Date().toISOString(),
    createdByUserId: 'test-user'
  };
  
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newActivity)
  });
  
  const data = await response.json();
  
  console.assert(response.status === 201, 'Status should be 201');
  console.assert(data.id, 'Response should have an id');
  console.assert(data.description === newActivity.description, 'Description should match');
  console.log('✓ POST test passed');
  
  return data;
}

async function testUpdateActivity(id) {
  console.log(`Testing PATCH /api/activity-logs/${id}...`);
  
  const updates = {
    description: 'Updated description',
    status: 'completada'
  };
  
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  
  const data = await response.json();
  
  console.assert(response.status === 200, 'Status should be 200');
  console.assert(data.description === updates.description, 'Description should be updated');
  console.assert(data.status === updates.status, 'Status should be updated');
  console.log('✓ PATCH test passed');
  
  return data;
}

async function testDeleteActivity(id) {
  console.log(`Testing DELETE /api/activity-logs/${id}...`);
  
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE'
  });
  
  console.assert(response.status === 204, 'Status should be 204');
  console.log('✓ DELETE test passed');
}

async function runAllTests() {
  try {
    console.log('=== Starting API Tests ===\n');
    
    // 1. Test GET
    await testGetActivities();
    
    // 2. Test POST
    const newActivity = await testCreateActivity();
    
    // 3. Test PATCH
    await testUpdateActivity(newActivity.id);
    
    // 4. Test DELETE
    await testDeleteActivity(newActivity.id);
    
    console.log('\n=== All tests passed! ===');
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

runAllTests();
```

**Ejecutar:**
```bash
node tests/api-test.js
```
