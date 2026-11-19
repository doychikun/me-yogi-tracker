import { get, ref, query, set, update, orderByChild, equalTo } from "firebase/database";
import { db } from "../config/firebase-config";

// Each user can read only their own record (see database.rules.json).
export const getUserByUsername = (username) => {
  return get(ref(db, `users/${username}`));
};

// Only the uid is publicly readable (see database.rules.json), so sign-up can
// check whether a username is taken before the account exists.
export const isUsernameTaken = (username) => {
  return get(ref(db, `users/${username}/uid`)).then((snapshot) => snapshot.exists());
};

// Passwords are handled by Firebase Authentication and never stored here.
// phoneNumber is stored with its country code, e.g. "+359 888123456".
// Resolves to the stored profile.
export const createUser = ({ firstName, lastName, username, uid, email, phoneNumber, phoneCountry }) => {
  const userData = {
    firstName,
    lastName,
    username,
    uid,
    email,
    phoneNumber,
    phoneCountry,
    createdOn: Date.now(),
  };

  return set(ref(db, `users/${username}`), userData).then(() => userData);
};

// The rules only allow this exact query (uid equal to your own), so a user
// can find their own record without being able to list everyone else's.
export const getUserData = (uid) => {
  return get(query(ref(db, "users"), orderByChild("uid"), equalTo(uid)));
}

export const updateUserProfilePicture = (username, url) => {
  return update(ref(db), {
    [`users/${username}/avatarUrl`]: url,
  });
};

export const updateUserData = (username, updates) => {
  return update(ref(db, `users/${username}`), updates);
};
