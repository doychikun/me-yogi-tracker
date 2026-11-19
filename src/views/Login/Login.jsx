import "./Login.css";
import "../Join/Join.css";
import { useForm } from "react-hook-form";
import { useContext, useState } from "react";
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  Link,
  TextField,
  Typography,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import AppContext from "../../providers/AppContext";
import { loginUser } from "../../services/auth.service";
import { getUserData } from "../../services/users.service";
import { toast } from "react-toastify";
import { fieldsSx, LAVENDER, primaryButtonSx, TOAST_OPTIONS } from "../../common/formStyles";

const loginErrorMessage = (err) => {
  const message = err?.message || "";
  if (message.includes("invalid-email")) return "Please enter a valid email address!";
  if (message.includes("user-not-found")) return "User not found!";
  if (message.includes("too-many-requests")) return "Too many attempts. Please try again later.";
  return "Wrong email or password.";
};

const Login = ({ close, switchTo }) => {
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();
  const { setContext } = useContext(AppContext);

  const field = (name, rules) => {
    const { ref, ...rest } = register(name, rules);
    return { inputRef: ref, ...rest, error: !!errors[name], helperText: errors[name]?.message || " " };
  };

  const onSubmit = (data) =>
    loginUser(data.email, data.password)
      .then((userCredential) =>
        getUserData(userCredential.user.uid).then((snapshot) => {
          if (snapshot.exists()) {
            setContext({
              user: userCredential.user,
              userData: snapshot.val()[Object.keys(snapshot.val())[0]],
            });
            close();
            toast.success("Welcome back!", TOAST_OPTIONS);
          }
        })
      )
      .catch((err) => toast.error(loginErrorMessage(err), TOAST_OPTIONS));

  return (
    <Box className="join-form login-form" sx={fieldsSx}>
      <Typography className="form-intro">Welcome back. Your mat is waiting.</Typography>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="yogi-form">
        <TextField
          label="Email"
          type="email"
          required
          fullWidth
          autoComplete="email"
          {...field("email", { required: "Email is required" })}
        />
        <TextField
          label="Password"
          type={showPassword ? "text" : "password"}
          required
          fullWidth
          autoComplete="current-password"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((shown) => !shown)}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          {...field("password", { required: "Password is required" })}
        />
        <Button type="submit" variant="contained" fullWidth disabled={isSubmitting} sx={primaryButtonSx}>
          {isSubmitting ? "Logging in..." : "Log in"}
        </Button>
        {switchTo ? (
          <Typography className="form-switch">
            New here?{" "}
            <Link component="button" type="button" onClick={() => switchTo("join")} sx={{ color: LAVENDER, fontWeight: 700 }}>
              Create an account
            </Link>
          </Typography>
        ) : null}
      </form>
    </Box>
  );
};

export default Login;
