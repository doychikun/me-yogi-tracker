import { Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

// Full-page version of the Join / Login dialogs, used by the /join and /login
// routes (e.g. the landing page's "Join us now" button).
const AuthPage = ({ title, Form }) => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        maxWidth: 520,
        mx: "auto",
        my: { xs: 4, md: 8 },
        p: { xs: 3, sm: 4 },
        borderRadius: "24px",
        backgroundColor: "#FCFCF8",
        boxShadow: "0 10px 40px rgba(148, 148, 182, 0.18)",
      }}
    >
      <Typography sx={{ fontWeight: 700, fontSize: 28, mb: 1 }}>{title}</Typography>
      <Form
        close={() => navigate("/home")}
        switchTo={(page) => navigate(`/${page}`)}
      />
    </Box>
  );
};

export default AuthPage;
