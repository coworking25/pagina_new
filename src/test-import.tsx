// Test para verificar que AdminClients se importa correctamente
import AdminClients from './pages/AdminClients';

console.log('AdminClients type:', typeof AdminClients);
console.log('AdminClients:', AdminClients);
console.log('Is function?:', typeof AdminClients === 'function');

export default function Test() {
  return <div>Test</div>;
}
