import "./ProfileInfo.css";
import { useContext, useRef, useState } from "react";
import { Avatar, Box, Button, CircularProgress, IconButton, Tooltip, Typography } from "@mui/material";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import MailOutline from "@mui/icons-material/MailOutline";
import PhoneOutlined from "@mui/icons-material/PhoneOutlined";
import EventOutlined from "@mui/icons-material/EventOutlined";
import Edit from "@mui/icons-material/Edit";
import { Link as RouterLink } from "react-router-dom";
import { format } from "date-fns";
import AppContext from "../../providers/AppContext";
import { fileToAvatarDataUrl } from "../../services/avatar";
import { updateUserProfilePicture } from "../../services/users.service";
import { toast } from "react-toastify";
import { primaryButtonSx, secondaryButtonSx, TOAST_OPTIONS } from "../../common/formStyles";

const initials = (userData) =>
  `${userData.firstName?.[0] || ""}${userData.lastName?.[0] || ""}`.toUpperCase() ||
  userData.username?.[0]?.toUpperCase();

const Stat = ({ value, label }) => (
  <div className="profile-stat">
    <span className="profile-stat-value">{value}</span>
    <span className="profile-stat-label">{label}</span>
  </div>
);

const Detail = ({ icon, label, children }) => (
  <div className="profile-detail">
    <span className="profile-detail-icon">{icon}</span>
    <div>
      <span className="profile-detail-label">{label}</span>
      <span className="profile-detail-value">{children}</span>
    </div>
  </div>
);

const ProfileInfo = ({ enterEditMode, stats, close }) => {
  const { user, userData, setContext } = useContext(AppContext);
  const username = userData.username;
  const fileInput = useRef(null);
  const [uploading, setUploading] = useState(false);

  const uploadPicture = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploading(true);
    fileToAvatarDataUrl(file)
      .then((url) =>
        updateUserProfilePicture(username, url).then(() => {
          setContext({ user, userData: { ...userData, avatarUrl: url } });
          toast.success("Profile picture updated!", TOAST_OPTIONS);
        })
      )
      .catch((error) => toast.error(error.message || "Something went wrong!", TOAST_OPTIONS))
      .finally(() => setUploading(false));
  };

  const memberSince = userData.createdOn ? format(new Date(userData.createdOn), "MMMM yyyy") : null;

  return (
    <div className="profile-card">
      <div className="profile-banner" />

      <div className="profile-avatar">
        <Avatar
          src={userData.avatarUrl || undefined}
          alt={`${userData.firstName} ${userData.lastName}`}
          sx={{ width: 112, height: 112, fontSize: 40, fontWeight: 700, bgcolor: "#9494B6" }}
        >
          {initials(userData)}
        </Avatar>
        <Tooltip title={userData.avatarUrl ? "Change photo" : "Add a photo"}>
          <IconButton
            className="profile-avatar-btn"
            aria-label="Change profile picture"
            onClick={() => fileInput.current?.click()}
            disabled={uploading}
            size="small"
          >
            {uploading ? <CircularProgress size={18} /> : <PhotoCamera fontSize="small" />}
          </IconButton>
        </Tooltip>
        <input ref={fileInput} type="file" accept="image/*" hidden onChange={uploadPicture} />
      </div>

      <Typography className="profile-name">
        {userData.firstName} {userData.lastName}
      </Typography>
      <Typography className="profile-username">@{username}</Typography>

      <div className="profile-stats">
        <Stat value={stats ? stats.streak : "–"} label="day streak" />
        <Stat value={stats ? stats.weekMinutes : "–"} label="min this week" />
        <Stat value={stats ? stats.sessions : "–"} label="sessions" />
      </div>

      <div className="profile-details">
        <Detail icon={<MailOutline fontSize="small" />} label="Email">
          {userData.email}
        </Detail>
        <Detail icon={<PhoneOutlined fontSize="small" />} label="Phone">
          {userData.phoneNumber || "Not added yet"}
        </Detail>
        {memberSince ? (
          <Detail icon={<EventOutlined fontSize="small" />} label="Member since">
            {memberSince}
          </Detail>
        ) : null}
      </div>

      <Box className="profile-actions">
        <Button variant="contained" startIcon={<Edit />} onClick={enterEditMode} sx={primaryButtonSx}>
          Edit profile
        </Button>
        <Button variant="outlined" component={RouterLink} to="/yogi-goals" onClick={() => close?.()} sx={secondaryButtonSx}>
          Log a practice
        </Button>
      </Box>
    </div>
  );
};

export default ProfileInfo;
