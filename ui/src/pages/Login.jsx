import React, { useState } from 'react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tenant, setTenant] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (email && password && tenant) {
      localStorage.setItem('JWT', 'fake-jwt-token');
      localStorage.setItem('TENANT_ID', tenant);
      window.location.href = '/';
    } else {
      alert('Please fill in all fields');
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-zinc-950 text-zinc-200">
      <form
        onSubmit={handleSubmit}
        className="bg-zinc-900 p-8 rounded-2xl shadow-card w-96 space-y-4"
      >
        <h1 className="text-2xl font-semibold text-center">Login</h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 rounded-xl bg-zinc-800 text-zinc-200 focus:outline-none"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 rounded-xl bg-zinc-800 text-zinc-200 focus:outline-none"
        />
        <input
          type="text"
          placeholder="Tenant"
          value={tenant}
          onChange={(e) => setTenant(e.target.value)}
          className="w-full p-3 rounded-xl bg-zinc-800 text-zinc-200 focus:outline-none"
        />
        <button
          type="submit"
          className="w-full bg-teal-500 text-white p-3 rounded-xl hover:bg-teal-600"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
