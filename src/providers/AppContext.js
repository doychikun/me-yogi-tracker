import { createContext } from "react";

const AppContext = createContext({
  user: null,
  userData: null,
  // true while Firebase restores the session or the profile is still loading
  authPending: false,
  setContext() {
    // real implementation comes from App.jsx
  },
});

export default AppContext;
