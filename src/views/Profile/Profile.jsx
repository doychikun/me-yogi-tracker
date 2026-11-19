import "./Profile.css";
import { useContext, useEffect, useState } from "react";
import AppContext from "../../providers/AppContext";
import ProfileInfo from "../../components/ProfileInfo/ProfileInfo";
import ProfileEdit from "../../components/ProfileEdit/ProfileEdit";
import { getUserSessions } from "../../services/sessions";
import { currentStreak, weeklyMinutesByStyle } from "../../common/sessionStats";

export const practiceStats = (sessions, today = new Date()) => ({
  sessions: sessions.length,
  minutes: sessions.reduce((sum, session) => sum + Number(session.minutes || 0), 0),
  weekMinutes: weeklyMinutesByStyle(sessions, today).reduce((sum, style) => sum + style.minutes, 0),
  streak: currentStreak(sessions, today),
});

const Profile = ({ close }) => {
  const { userData } = useContext(AppContext);
  const [editProfileMode, setEditProfileMode] = useState(false);
  const [stats, setStats] = useState(null);
  const username = userData?.username;

  useEffect(() => {
    if (!username) return;
    let cancelled = false;
    getUserSessions({ owner: username })
      .then((sessions) => !cancelled && setStats(practiceStats(sessions)))
      .catch(() => !cancelled && setStats(null));
    return () => {
      cancelled = true;
    };
  }, [username]);

  const editModeOnClick = (event) => {
    event?.preventDefault();
    setEditProfileMode(true);
  };

  const cancelEditModeOnClick = (event) => {
    event?.preventDefault();
    setEditProfileMode(false);
  };

  return (
    <div className="profile">
      {editProfileMode ? (
        <ProfileEdit cancelEditMode={cancelEditModeOnClick} />
      ) : (
        <ProfileInfo enterEditMode={editModeOnClick} stats={stats} close={close} />
      )}
    </div>
  );
};

export default Profile;
