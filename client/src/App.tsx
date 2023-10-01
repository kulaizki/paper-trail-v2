import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import './App.css';
import { AuthProvider } from './context/AuthContext';
import RegisterPage from './pages/register';
import LoginPage from './pages/login';
import DocumentCreatePage from './pages/document/create';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/document/create" element={<DocumentCreatePage />} />
          <Route path="/" element={<Navigate replace to="/document/create" />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
