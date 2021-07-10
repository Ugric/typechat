import { createContext, useContext } from "react";

const data = createContext<any>(undefined);
const useData = () => useContext(data);
export { data, useData };
