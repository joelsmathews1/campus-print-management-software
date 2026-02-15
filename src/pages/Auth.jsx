import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function Auth({ setUser }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");

  const handleSignup = async () => {
    const { data, error } = await supabase
      .from("users")
      .insert([
        {
          email,
          password,
          is_staff: role === "staff",
        },
      ])
      .select();

    if (error) {
      alert(error.message);
      return;
    }

    alert("Signup successful!");
    setIsLogin(true);
  };

  const handleLogin = async () => {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .eq("password", password)
      .single();

    if (error || !data) {
      alert("Invalid credentials");
      return;
    }

    setUser(data);
  };

  return (
    <div style={{ padding: "40px" }}>
      <h2>{isLogin ? "Login" : "Signup"}</h2>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <br /><br />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <br /><br />

      {!isLogin && (
        <>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="student">Student</option>
            <option value="staff">Staff</option>
          </select>
          <br /><br />
        </>
      )}

      <button onClick={isLogin ? handleLogin : handleSignup}>
        {isLogin ? "Login" : "Signup"}
      </button>

      <br /><br />

      <button onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? "Switch to Signup" : "Switch to Login"}
      </button>
    </div>
  );
}
