import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import RestaurantDashboard from './pages/RestaurantDashboard';
import UserDashboard from './pages/UserDashboard';
import DeliveryDashboard from './pages/DeliveryDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AuthPage from './pages/AuthPage';
import { ErrorBoundary } from 'react-error-boundary';

function Fallback({ error }) {
  return (
    <div className="p-10 font-mono flex flex-col gap-4 text-red-500 bg-red-50 min-h-screen">
      <h1 className="text-2xl font-black">CRASH DETECTED</h1>
      <p>Tell the AI this exact error:</p>
      <pre className="bg-red-900 border border-red-200 text-white p-4 rounded-xl font-bold whitespace-pre-wrap">{error.message}</pre>
      <pre className="bg-red-900/80 border border-red-200 text-white text-xs p-4 rounded-xl whitespace-pre-wrap">{error.stack}</pre>
    </div>
  );
}

const ProtectedRoute = ({ children, roleRequired }) => {
  const userStr = localStorage.getItem('user');
  const token = localStorage.getItem('token');

  if (!userStr || !token) {
    return <Navigate to={`/login?role=${roleRequired}`} replace />;
  }

  try {
    const user = JSON.parse(userStr);
    if (roleRequired && user.role !== roleRequired && user.role !== 'ADMIN') {
      return <Navigate to={`/login?role=${roleRequired}`} replace />;
    }
    return children;
  } catch {
    return <Navigate to={`/login?role=${roleRequired}`} replace />;
  }
};

function App() {
  return (
    <ErrorBoundary FallbackComponent={Fallback}>
      <Router>
        <Routes>
          <Route path="/" element={<UserDashboard />} />
          <Route path="/user" element={<UserDashboard />} />
          <Route path="/login" element={<AuthPage />} />

          <Route path="/restaurant" element={
            <ProtectedRoute roleRequired="RESTAURANT">
              <RestaurantDashboard />
            </ProtectedRoute>
          } />

          <Route path="/delivery" element={
            <ProtectedRoute roleRequired="DELIVERY">
              <DeliveryDashboard />
            </ProtectedRoute>
          } />

          <Route path="/admin" element={
            <ProtectedRoute roleRequired="ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
