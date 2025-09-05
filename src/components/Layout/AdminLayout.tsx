import React from 'react';
import { Outlet } from 'react-router-dom';

function AdminLayout() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4">
          <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 px-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default AdminLayout;
