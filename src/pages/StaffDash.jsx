import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function StaffDash() {
  const [jobs, setJobs] = useState([]);

  const fetchJobs = async () => {
    const { data, error } = await supabase
      .from("print_job")
      .select("*");

    if (!error) setJobs(data);
  };

  const updateStatus = async (id, newStatus) => {
    await supabase
      .from("print_job")
      .update({ status: newStatus })
      .eq("id", id);

    fetchJobs();
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  return (
    <div style={{ padding: "40px" }}>
      <h2>Staff Dashboard</h2>

      {jobs.map((job) => (
        <div key={job.id} style={{ marginBottom: "20px" }}>
          <p>File: {job.file_url}</p>
          <p>Copies: {job.copies}</p>
          <p>Status: {job.status}</p>

          <button onClick={() => updateStatus(job.id, "printing")}>
            Mark Printing
          </button>

          <button onClick={() => updateStatus(job.id, "completed")}>
            Mark Completed
          </button>

          <hr />
        </div>
      ))}
    </div>
  );
}
