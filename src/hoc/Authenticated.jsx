import { useContext } from "react";
import AppContext from "../providers/AppContext";
import { Navigate } from "react-router";
import Loader from "../components/Loader/Loader";

export default function Authenticated({ children }) {
  const { user, authPending } = useContext(AppContext);

  // On a page reload Firebase needs a moment to restore the session;
  // redirecting before then would bounce signed-in users to /home.
  if (authPending) {
    return <Loader />;
  }

  if (!user) {
    return <Navigate to="/home" />;
  }

  return children;
}
