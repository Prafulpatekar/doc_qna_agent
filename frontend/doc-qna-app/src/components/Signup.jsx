import React, { useState } from 'react';

function Toast({ message, type, onClose }) {
    return (
        <div
            className={`fixed top-6 right-6 z-50 px-4 py-3 rounded shadow-lg flex items-center space-x-2
                ${type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}
        >
            <span>{message}</span>
            <button onClick={onClose} className="ml-2 text-xl font-bold leading-none">&times;</button>
        </div>
    );
}

export default function Signup() {
    const [form, setForm] = useState({
        email: '',
        password: '',
        apiKey: '',
    });
    const [toast, setToast] = useState(null);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setToast(null);
        try {
            const res = await fetch('http://localhost:8090/api/v1/auth/signup', {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: form.email,
                    password: form.password,
                    api_key: form.apiKey,
                }),
            });
            const data = await res.json();
            if (res.ok && data.status) {
                setToast({ message: data.message || 'Signup successful!', type: 'success' });
                setForm({ email: '', password: '', apiKey: '' });
            } else {
                setToast({ message: data.message || 'Signup failed.', type: 'error' });
            }
        } catch (err) {
            setToast({ message: 'Network error. Please try again.', type: 'error' });
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-200">
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
            <form
                onSubmit={handleSubmit}
                className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md space-y-6"
            >
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">Sign Up</h2>
                <div>
                    <label className="block text-gray-700 mb-1" htmlFor="email">
                        Email
                    </label>
                    <input
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        type="email"
                        id="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        placeholder="you@example.com"
                    />
                </div>
                <div>
                    <label className="block text-gray-700 mb-1" htmlFor="password">
                        Password
                    </label>
                    <input
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        type="password"
                        id="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        required
                        placeholder="Enter your password"
                    />
                </div>
                <div>
                    <label className="block text-gray-700 mb-1" htmlFor="apiKey">
                        Google Studio API Key
                    </label>
                    <input
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        type="text"
                        id="apiKey"
                        name="apiKey"
                        value={form.apiKey}
                        onChange={handleChange}
                        required
                        placeholder="Enter your API key"
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                    Sign Up
                </button>
            </form>
        </div>
    );
}
