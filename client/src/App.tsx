import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Landing from './pages/landing';
import RegisterPage from './pages/register';
import LoginPage from './pages/login';
import ProtectedRoute from './components/ProtectedRoute';
import { ToastProvider } from './context/ToastContext';
import { DocumentProvider } from './context/DocumentContext';
import DocumentPage from './pages/document';
import { EditorProvider } from './context/EditorContext';
import HomePage from './pages/home';
import { SocketProvider } from './context/SocketContext';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <SocketProvider>
            <Routes>
              <Route path="/landing" element={<Landing />} />
              <Route path="/" element={<Navigate replace to="/home" />} />
              <Route
                path="/document/:id"
                element={
                  <ProtectedRoute
                    element={
                      <DocumentProvider>
                        <EditorProvider>
                          <DocumentPage />
                        </EditorProvider>
                      </DocumentProvider>
                    }
                  />
                }
              />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/home" element={<ProtectedRoute element={<HomePage />} />} />
            </Routes>
          </SocketProvider>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
