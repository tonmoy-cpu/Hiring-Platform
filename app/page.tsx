"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const router = useRouter();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.token) {
        localStorage.setItem("token", data.token);
        router.push(data.user.userType === "recruiter" ? "/recruiter/dashboard" : "/dashboard");
      } else {
        setError(data.msg);
      }
    } catch (err) {
      setError("Server error");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#373737]">
      <div className="w-full max-w-md p-8 form-card rounded-md shadow-lg">
        <h1 className="text-3xl font-bold text-center mb-8 text-white">Login</h1>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block uppercase text-sm text-white">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block uppercase text-sm text-white">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="text-center text-sm mt-4">
            <Link href="/register" className="text-white hover:underline">New user? Register here</Link>
          </div>
          <div className="flex justify-center mt-8">
            <button type="submit" className="submit-button">Login</button>
          </div>
        </form>
      </div>
    </main>
  );
}