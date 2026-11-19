import "./Join.css";
import { useContext, useState } from "react";
import { Controller, useForm } from "react-hook-form";
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
import { createUser, isUsernameTaken } from "../../services/users.service";
import { deleteAccount, registerUser } from "../../services/auth.service";
import { toast } from "react-toastify";
import PhoneField from "../../components/PhoneField/PhoneField";
import { DEFAULT_COUNTRY, formatPhone, phoneError } from "../../common/phone";
import { fieldsSx, LAVENDER, primaryButtonSx, TOAST_OPTIONS } from "../../common/formStyles";

const signUpErrorMessage = (err) => {
  const message = err?.message || "";
  if (message.includes("email-already-in-use")) return "Email is in use!";
  if (message.includes("invalid-email")) return "Please enter a valid email address!";
  if (message.includes("weak-password")) return "Please choose a stronger password!";
  // The database rules reject a profile write when the username was taken in the meantime.
  if (message.toLowerCase().includes("permission")) return "Username is in use!";
  return "Sign-up failed. Please try again.";
};

const Join = ({ close, switchTo }) => {
  const { setContext } = useContext(AppContext);
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { phoneCountry: DEFAULT_COUNTRY, phoneNumber: "" },
  });

  // MUI forwards `ref` to the wrapper, so give react-hook-form the real <input>.
  const field = (name, rules) => {
    const { ref, ...rest } = register(name, rules);
    return { inputRef: ref, ...rest, error: !!errors[name], helperText: errors[name]?.message || " " };
  };

  const phoneCountry = watch("phoneCountry");

  const onSubmit = (data) =>
    isUsernameTaken(data.username)
      .then((taken) => {
        if (taken) {
          return toast.error("Username is in use!", TOAST_OPTIONS);
        }

        return registerUser(data.email, data.password).then(({ user }) =>
          createUser({
            firstName: data.firstName.trim(),
            lastName: data.lastName.trim(),
            username: data.username,
            uid: user.uid,
            email: data.email,
            phoneNumber: formatPhone(data.phoneCountry, data.phoneNumber),
            phoneCountry: data.phoneCountry,
          })
            .catch((err) =>
              // Don't leave a login behind that has no profile to go with it.
              deleteAccount(user)
                .catch(() => {})
                .then(() => {
                  throw err;
                })
            )
            .then((userData) => {
              // App's own profile lookup can run before this write lands, so set it here.
              setContext({ user, userData });
              close();
              toast.success("Welcome to MeYogi!", TOAST_OPTIONS);
            })
        );
      })
      .catch((err) => toast.error(signUpErrorMessage(err), TOAST_OPTIONS));

  return (
    <Box className="join-form" sx={fieldsSx}>
      <Typography className="form-intro">
        Create your free account to log practices, set goals and keep your streak.
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="yogi-form">
        <Box className="form-row">
          <TextField
            label="First name"
            required
            fullWidth
            autoComplete="given-name"
            {...field("firstName", {
              required: "First name is required",
              validate: (v) => !!v.trim() || "First name is required",
            })}
          />
          <TextField
            label="Last name"
            required
            fullWidth
            autoComplete="family-name"
            {...field("lastName", {
              required: "Last name is required",
              validate: (v) => !!v.trim() || "Last name is required",
            })}
          />
        </Box>

        <TextField
          label="Username"
          required
          fullWidth
          autoComplete="username"
          InputProps={{ startAdornment: <InputAdornment position="start">@</InputAdornment> }}
          {...field("username", {
            required: "Username is required",
            minLength: { value: 2, message: "Use 2 to 20 characters" },
            maxLength: { value: 20, message: "Use 2 to 20 characters" },
            pattern: {
              value: /^[A-Za-z0-9_-]+$/,
              message: "Letters, numbers, _ and - only",
            },
          })}
        />

        <TextField
          label="Email"
          type="email"
          required
          fullWidth
          autoComplete="email"
          {...field("email", {
            required: "Email is required",
            pattern: { value: /^\S+@\S+\.\S+$/, message: "Please enter a valid email" },
          })}
        />

        <TextField
          label="Password"
          type={showPassword ? "text" : "password"}
          required
          fullWidth
          autoComplete="new-password"
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
          {...field("password", {
            required: "Password is required",
            minLength: { value: 8, message: "Use at least 8 characters" },
            maxLength: { value: 64, message: "Use at most 64 characters" },
          })}
          helperText={errors.password?.message || "At least 8 characters"}
        />

        <Controller
          name="phoneNumber"
          control={control}
          rules={{
            required: "Phone number is required",
            validate: (value) => phoneError(value, phoneCountry) || true,
          }}
          render={({ field: { ref, value, onChange, onBlur, name } }) => (
            <PhoneField
              name={name}
              required
              country={phoneCountry}
              onCountryChange={(iso) =>
                setValue("phoneCountry", iso, { shouldValidate: false })
              }
              national={value}
              onNationalChange={onChange}
              onBlur={onBlur}
              inputRef={ref}
              error={errors.phoneNumber?.message}
            />
          )}
        />

        <Button type="submit" variant="contained" fullWidth disabled={isSubmitting} sx={primaryButtonSx}>
          {isSubmitting ? "Creating account..." : "Create account"}
        </Button>

        {switchTo ? (
          <Typography className="form-switch">
            Already a member?{" "}
            <Link component="button" type="button" onClick={() => switchTo("login")} sx={{ color: LAVENDER, fontWeight: 700 }}>
              Log in
            </Link>
          </Typography>
        ) : null}
      </form>
    </Box>
  );
};

export default Join;
