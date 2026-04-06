import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import UserPage from "./pages/UserPage";
import AdminLogin from "./pages/AdminLogin";
import AdminPage from "./pages/AdminPage";

function App() {
  // The Master Token: Stored only in memory (clears on refresh)
  const [adminToken, setAdminToken] = useState(null);

  const handleLogin = (token) => {
    setAdminToken(token);
  };

  const handleLogout = () => {
    setAdminToken(null);
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Client Route */}
        <Route path="/" element={<UserPage />} />

        {/* Admin Route: Protected by a ternary check */}
        <Route 
          path="/admin" 
          element={
            adminToken ? (
              <AdminPage token={adminToken} onLogout={handleLogout} />
            ) : (
              <AdminLogin onLogin={handleLogin} />
            )
          } 
        />

        {/* Redirect everything else back to the Client page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;