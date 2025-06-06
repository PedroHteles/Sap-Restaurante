import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Main from './main/main'; // Seu componente principal
import AdminRoute from '@/app/routes/AdminRoute/AdminRoute';
import ProtectedRoute from '@/app/routes/ProtectedRoute/ProtectedRoute';
function MainRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <ProtectedRoute>
            <Main />
          </ProtectedRoute>} />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <h1> ola administrado</h1>
            </AdminRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default MainRouter;
