import "./App.css";
import React from "react";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./config/firebase-config";
import { getUserData } from "./services/users.service";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { createTheme, ThemeProvider } from "@mui/material";
import Loader from "./components/Loader/Loader";
import Authenticated from "./hoc/Authenticated";
import AppContext from "./providers/AppContext";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import Home from "./views/Home/Home";
import Join from "./views/Join/Join";
import Login from "./views/Login/Login";
import Profile from "./views/Profile/Profile";
import AboutUs from "./views/AboutUs/AboutUs";
import YogiGoals from "./views/Yogi Goals/YogiGoals";
import YogiPractices from "./views/Yogi Practices/YogiPractices";
import Poses from "./views/Poses/Poses";
import FlowPlayer from "./views/Poses/FlowPlayer";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const theme = createTheme({
    typography: {
      fontFamily: ["Sora", "sans-serif"].join(","),
    },
  });

  const [appState, setAppState] = useState({
    user: null,
    userData: null,
  });

  const [user, loading] = useAuthState(auth);
  // uid whose profile lookup has finished, so protected pages know when to decide
  const [checkedUid, setCheckedUid] = useState(null);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    getUserData(user.uid)
      .then((snapshot) => {
        // No profile yet means sign-up is still saving it; Join sets the context itself.
        if (cancelled || !snapshot.exists()) return;

        setAppState({
          user,
          userData: Object.values(snapshot.val())[0],
        });
      })
      .catch((e) => toast.error(e.message))
      .finally(() => {
        if (!cancelled) setCheckedUid(user.uid);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  const authPending = loading || (!!user && checkedUid !== user.uid && !appState.user);

  return (
    <>
      <BrowserRouter>
        <AppContext.Provider value={{ ...appState, authPending, setContext: setAppState }}>
          <ThemeProvider theme={theme}>
            <div className="App">
              {loading ? <Loader /> : <Header />}
              <div className="Content">
                <Routes>
                  <Route index element={<Home />} />
                  <Route path="/home" element={<Home />} />
                  <Route path="/join" element={<Join />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/about-us" element={<AboutUs />} />
                  <Route path="/yogi-practices" element={<YogiPractices />} />
                  <Route path="/poses" element={<Poses />} />
                  <Route path="/flows/:flowId" element={<FlowPlayer />} />
                  <Route
                    path="/yogi-goals"
                    element={
                      <Authenticated>
                        <YogiGoals />
                      </Authenticated>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <Authenticated>
                        <Profile />
                      </Authenticated>
                    }
                  />
                </Routes>
              </div>
              <Footer />
            </div>
          </ThemeProvider>
        </AppContext.Provider>
      </BrowserRouter>
      <ToastContainer />
    </>
  );
}

export default App;
