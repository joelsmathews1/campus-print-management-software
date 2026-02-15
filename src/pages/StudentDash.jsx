import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function StudentDash({ user }) {
  const [fileUrl, setFileUrl] = useState("");
  const [copies, setCopies] = useState(1);

  const submitJob = async () => {
    const { error } = await supabase.from("print_job").insert([
      {
        user_id: user.id,
        file_url: fileUrl,
        copies,
      },
    ]);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Print job submitted!");
    setFileUrl("");
    setCopies(1);
  };

  return (
    <div style={{ padding: "40px" }}>
      <h2>Student Dashboard</h2>

      <input
        type="text"
        placeholder="File URL"
        value={fileUrl}
        onChange={(e) => setFileUrl(e.target.value)}
      />
      <br /><br />

      <input
        type="number"
        min="1"
        value={copies}
        onChange={(e) => setCopies(e.target.value)}
      />
      <br /><br />

      <button onClick={submitJob}>Submit Print Job</button>
    </div>
  );
}
