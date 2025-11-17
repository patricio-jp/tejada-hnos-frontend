// src/modules/Fields/pages/FieldsTestPage.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useFields } from '../hooks/useFields';
import { useCapataces } from '../hooks/useUsers';
import { fieldApi } from '../utils/field-api';
import { plotApi } from '../../Plots/utils/plot-api';
import { AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';

type TestStatus = 'pending' | 'running' | 'success' | 'error';

interface TestResult {
  name: string;
  status: TestStatus;
  message: string;
  duration?: number;
  data?: any;
}

export default function FieldsTestPage() {
  const { fields, loading: loadingFields } = useFields();
  const [plots, setPlots] = useState<any[]>([]);
  const { capataces, loading: loadingCapataces } = useCapataces();
  
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const updateTestResult = (testName: string, status: TestStatus, message: string, duration?: number, data?: any) => {
    setTestResults(prev => {
      const index = prev.findIndex(t => t.name === testName);
      const newResult = { name: testName, status, message, duration, data };
      
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = newResult;
        return updated;
      }
      return [...prev, newResult];
    });
  };

  // Test individual con medición de tiempo
  const runTest = async (
    name: string,
    description: string,
    testFn: () => Promise<any>
  ): Promise<boolean> => {
    addLog(`🔄 ${description}`);
    updateTestResult(name, 'running', 'Ejecutando...');
    
    const startTime = Date.now();
    
    try {
      const result = await testFn();
      const duration = Date.now() - startTime;
      
      updateTestResult(name, 'success', `✅ OK (${duration}ms)`, duration, result);
      addLog(`✅ ${description} - OK (${duration}ms)`);
      
      return true;
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      updateTestResult(name, 'error', `❌ ${errorMessage}`, duration);
      addLog(`❌ ${description} - ERROR: ${errorMessage}`);
      
      return false;
    }
  };

  // Suite completa de tests
  const runAllTests = async () => {
    setIsRunningTests(true);
    setTestResults([]);
    setLogs([]);
    addLog('🚀 Iniciando suite completa de pruebas...');
    
    let passedTests = 0;
    let totalTests = 0;

    // ========== TESTS DE FIELDS ==========
    addLog('\n📂 === TESTS DE FIELDS ===');
    
    // Test 1: GET /fields
    totalTests++;
    if (await runTest(
      'get-fields',
      'GET /fields - Obtener todos los campos',
      async () => {
        const data = await fieldApi.getAll();
        addLog(`   📊 Campos encontrados: ${data.length}`);
        if (data.length > 0) {
          addLog(`   📝 Primer campo: ${data[0].name} (${data[0].area} ha)`);
        }
        return data;
      }
    )) passedTests++;

    // Test 2: GET /fields con filtros
    totalTests++;
    if (await runTest(
      'get-fields-filtered',
      'GET /fields?minArea=10 - Filtrar por área mínima',
      async () => {
        const data = await fieldApi.getAll({ minArea: 10 });
        addLog(`   📊 Campos con área >= 10: ${data.length}`);
        return data;
      }
    )) passedTests++;

    // Test 3: GET /fields/:id (si hay campos)
    if (fields.length > 0) {
      totalTests++;
      if (await runTest(
        'get-field-by-id',
        `GET /fields/${fields[0].id} - Obtener campo específico`,
        async () => {
          const data = await fieldApi.getById(fields[0].id);
          addLog(`   📝 Campo: ${data.name}`);
          addLog(`   👤 Manager: ${data.manager ? `${data.manager.name} ${data.manager.lastName}` : 'Sin asignar'}`);
          return data;
        }
      )) passedTests++;
    }

    // ========== TESTS DE PLOTS ==========
    addLog('\n🌱 === TESTS DE PLOTS ===');
    
    // Test 4: GET /plots by field
    if (fields.length > 0) {
      totalTests++;
      if (await runTest(
        'get-plots-all',
        `GET /fields/${fields[0].id}/plots - Obtener parcelas del primer campo`,
        async () => {
          const data = await plotApi.getAllByField(fields[0].id);
          addLog(`   📊 Parcelas encontradas: ${data.length}`);
          if (data.length > 0) {
            addLog(`   📝 Primera parcela: ${data[0].name} (${data[0].area} ha)`);
            setPlots(data);
          }
          return data;
        }
      )) passedTests++;
    }

    // Test 5: GET /plots/:id (si hay plots)
    if (plots.length > 0 && fields.length > 0) {
      totalTests++;
      if (await runTest(
        'get-plot-by-id',
        `GET /plots/${plots[0].id} - Obtener parcela específica`,
        async () => {
          const data = await plotApi.getById(plots[0].id);
          addLog(`   📝 Parcela: ${data.name}`);
          addLog(`   📍 Área: ${data.area}`);
          return data;
        }
      )) passedTests++;
    }

    // ========== TESTS DE USUARIOS ==========
    addLog('\n👥 === TESTS DE USUARIOS ===');
    
    // Test 7: GET /users (Capataces)
    totalTests++;
    if (await runTest(
      'get-capataces',
      'GET /users - Obtener capataces',
      async () => {
        addLog(`   📊 Capataces encontrados: ${capataces.length}`);
        capataces.forEach(cap => {
          addLog(`   👤 ${cap.name} ${cap.lastName} - ${cap.email}`);
        });
        return capataces;
      }
    )) passedTests++;

    // ========== RESUMEN ==========
    addLog('\n📊 === RESUMEN DE PRUEBAS ===');
    addLog(`✅ Tests exitosos: ${passedTests}/${totalTests}`);
    addLog(`❌ Tests fallidos: ${totalTests - passedTests}/${totalTests}`);
    addLog(`📈 Tasa de éxito: ${((passedTests/totalTests)*100).toFixed(1)}%`);
    
    if (passedTests === totalTests) {
      addLog('🎉 ¡Todos los tests pasaron correctamente!');
    } else {
      addLog('⚠️ Algunos tests fallaron. Revisa los errores arriba.');
    }

    setIsRunningTests(false);
  };

  const handleClearLogs = () => {
    setLogs([]);
    setTestResults([]);
  };

  const getStatusIcon = (status: TestStatus) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-gray-400" />;
      case 'running': return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusBadge = (status: TestStatus) => {
    const variants: Record<TestStatus, "default" | "secondary" | "destructive" | "outline"> = {
      pending: 'secondary',
      running: 'default',
      success: 'default',
      error: 'destructive',
    };
    
    const labels: Record<TestStatus, string> = {
      pending: 'Pendiente',
      running: 'Ejecutando...',
      success: 'Exitoso',
      error: 'Error',
    };

    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  // Estadísticas
  const stats = {
    total: testResults.length,
    success: testResults.filter(t => t.status === 'success').length,
    error: testResults.filter(t => t.status === 'error').length,
    running: testResults.filter(t => t.status === 'running').length,
  };

  return (
    <div className="container mx-auto py-8 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">🧪 Suite de Pruebas - API Backend</h1>
        <p className="text-muted-foreground">
          Verificación completa de endpoints de Fields, Plots y Users
        </p>
      </div>

      {/* Panel de Control */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Fields</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fields.length}</div>
            <p className="text-xs text-muted-foreground">
              {loadingFields ? 'Cargando...' : 'Campos encontrados'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Plots</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{plots.length}</div>
            <p className="text-xs text-muted-foreground">
              Parcelas encontradas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Capataces</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{capataces.length}</div>
            <p className="text-xs text-muted-foreground">
              {loadingCapataces ? 'Cargando...' : 'Usuarios CAPATAZ'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.success}/{stats.total}
            </div>
            <p className="text-xs text-muted-foreground">Exitosos</p>
          </CardContent>
        </Card>
      </div>

      {/* Botones de Acción */}
      <div className="flex gap-4 mb-6">
        <Button 
          onClick={runAllTests} 
          disabled={isRunningTests}
          className="flex-1"
        >
          {isRunningTests ? '⏳ Ejecutando Tests...' : '▶️ Ejecutar Todos los Tests'}
        </Button>
        <Button 
          onClick={handleClearLogs} 
          variant="outline"
          disabled={isRunningTests}
        >
          🗑️ Limpiar
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel de Resultados */}
        <Card>
          <CardHeader>
            <CardTitle>📋 Resultados de Tests</CardTitle>
            <CardDescription>
              {stats.total > 0 ? `${stats.success} exitosos, ${stats.error} fallidos` : 'No se han ejecutado tests'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {testResults.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Presiona "Ejecutar Todos los Tests" para comenzar</p>
                </div>
              ) : (
                testResults.map((result, index) => (
                  <div 
                    key={index} 
                    className="p-3 border rounded-lg flex items-start gap-3"
                  >
                    {getStatusIcon(result.status)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="font-medium text-sm truncate">{result.name}</p>
                        {getStatusBadge(result.status)}
                      </div>
                      <p className="text-xs text-muted-foreground">{result.message}</p>
                      {result.duration && (
                        <p className="text-xs text-muted-foreground mt-1">
                          ⏱️ {result.duration}ms
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Console de Logs */}
        <Card>
          <CardHeader>
            <CardTitle>📝 Console Log</CardTitle>
            <CardDescription>{logs.length} mensajes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-950 text-green-400 font-mono text-xs p-4 rounded-lg max-h-[600px] overflow-y-auto">
              {logs.length === 0 ? (
                <p className="text-slate-500">Esperando ejecución de tests...</p>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="whitespace-pre-wrap break-words">
                    {log}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
