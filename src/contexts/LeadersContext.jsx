import { createContext, useState } from "react";

export const LeadersContext = createContext();

export function LeadersProvider({ children }) {
  const [leaders, setLeaders] = useState([]);

  return <LeadersContext.Provider value={{ leaders, setLeaders }}>{children}</LeadersContext.Provider>;
}
