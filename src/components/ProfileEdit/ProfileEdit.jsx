import "../../views/Join/Join.css";
import "./ProfileEdit.css";
import AppContext from "../../providers/AppContext";
import { getAuth, updateEmail } from "firebase/auth";
import { useContext, useState } from "react";
import { Box, Button, TextField, Typography } from "@mui/material";
import { updateUserData } from "../../services/users.service";
import { toast } from "react-toastify";
import PhoneField from "../PhoneField/PhoneField";
import { formatPhone, phoneError, splitPhone } from "../../common/phone";
import { fieldsSx, primaryButtonSx, secondaryButtonSx, TOAST_OPTIONS } from "../../common/formStyles";

const emailErrorMessage = (error) => {
  const message = error?.message || "";
  if (message.includes("invalid-email")) return "Please use a valid email!";
  if (message.includes("email-already-in-use")) return "That email is already in use.";
  if (message.includes("requires-recent-login")) {
    return "For security, log out and back in before changing your email.";
  }
  return "Failed to edit your profile!";
};

const ProfileEdit = ({ cancelEditMode }) => {
  const { user, userData, setContext } = useContext(AppContext);
  const username = userData.username;
  // Older profiles have a bare number with no country; splitPhone keeps it as typed.
  const initialPhone = splitPhone(userData.phoneNumber, userData.phoneCountry);

  const [form, setForm] = useState({
    firstName: userData.firstName || "",
    lastName: userData.lastName || "",
    email: userData.email || "",
    phoneCountry: initialPhone.iso,
    phoneNational: initialPhone.national,
  });
  const [saving, setSaving] = useState(false);
  const [touched, setTouched] = useState(false);

  const set = (prop) => (value) => setForm((current) => ({ ...current, [prop]: value }));

  const errors = {
    firstName: !form.firstName.trim() ? "First name is required" : null,
    lastName: !form.lastName.trim() ? "Last name is required" : null,
    email: !/^\S+@\S+\.\S+$/.test(form.email.trim()) ? "Please enter a valid email" : null,
    phone: phoneError(form.phoneNational, form.phoneCountry),
  };
  const hasErrors = Object.values(errors).some(Boolean);

  const updateUserProfile = (e) => {
    e.preventDefault();
    setTouched(true);
    if (hasErrors) return;

    const email = form.email.trim();
    const updates = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email,
      phoneNumber: formatPhone(form.phoneCountry, form.phoneNational),
      phoneCountry: form.phoneCountry,
    };

    setSaving(true);
    // Only touch the login email when it actually changed: Firebase asks for a
    // recent sign-in for that, which would otherwise block simple name edits.
    const auth = getAuth();
    const emailUpdate =
      email !== userData.email ? updateEmail(auth.currentUser, email) : Promise.resolve();

    emailUpdate
      .then(() =>
        updateUserData(username, updates).then(() => {
          setContext({ user: { ...user }, userData: { ...userData, ...updates } });
          toast.success("Profile updated!", TOAST_OPTIONS);
          cancelEditMode();
        })
      )
      .catch((error) => toast.error(emailErrorMessage(error), TOAST_OPTIONS))
      .finally(() => setSaving(false));
  };

  const shown = (name) => (touched ? errors[name] : null);

  return (
    <Box className="edit-form" sx={fieldsSx}>
      <Typography className="edit-title">Edit profile</Typography>
      <form onSubmit={updateUserProfile} noValidate className="yogi-form">
        <Box className="form-row">
          <TextField
            label="First name"
            fullWidth
            value={form.firstName}
            onChange={(e) => set("firstName")(e.target.value)}
            error={!!shown("firstName")}
            helperText={shown("firstName") || " "}
          />
          <TextField
            label="Last name"
            fullWidth
            value={form.lastName}
            onChange={(e) => set("lastName")(e.target.value)}
            error={!!shown("lastName")}
            helperText={shown("lastName") || " "}
          />
        </Box>
        <TextField
          label="Email"
          type="email"
          fullWidth
          value={form.email}
          onChange={(e) => set("email")(e.target.value)}
          error={!!shown("email")}
          helperText={shown("email") || " "}
        />
        <PhoneField
          country={form.phoneCountry}
          national={form.phoneNational}
          onCountryChange={set("phoneCountry")}
          onNationalChange={set("phoneNational")}
          error={errors.phone}
        />
        <Box className="edit-actions">
          <Button type="button" variant="outlined" onClick={cancelEditMode} sx={secondaryButtonSx}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={saving} sx={primaryButtonSx}>
            {saving ? "Saving..." : "Save changes"}
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default ProfileEdit;
