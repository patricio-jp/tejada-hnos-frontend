// src/modules/Purchases/components/DebugAuth.tsx
import useAuth from '@/modules/Auth/hooks/useAuth';

export function DebugAuth() {
  const auth = useAuth();
  
  console.log('DebugAuth - Full auth object:', auth);
  console.log('DebugAuth - accessToken:', auth.accessToken);
  console.log('DebugAuth - isAuthenticated:', auth.isAuthenticated);
  
  return (
    <div className="p-4 border rounded-md bg-muted">
      <h3 className="font-bold mb-2">Debug Auth Info</h3>
      <p>isAuthenticated: {auth.isAuthenticated ? 'YES' : 'NO'}</p>
      <p>accessToken: {auth.accessToken ? `EXISTS (${auth.accessToken.substring(0, 20)}...)` : 'NULL'}</p>
      <p>Check console for full details</p>
    </div>
  );
}
