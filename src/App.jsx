import { useState } from "react";
import Auth from "./pages/Auth";
import StudentDash from "./pages/StudentDash";
import StaffDash from "./pages/StaffDash";

function App() {
  const [user, setUser] = useState(null);

  if (!user) {
    return <Auth setUser={setUser} />;
  }

  return user.is_staff
    ? <StaffDash />
    : <StudentDash user={user} />;
}

export default App;
