import { get, ref, query, set, update, orderByChild, equalTo } from "firebase/database";
import { db } from "../config/firebase-config";

/**
 * Get all users
 */
export const getAllUsers = () => {
  return get(query(ref(db, "users")));
};

export const getUserByUsername = (username) => {
  return get(ref(db, `users/${username}`));
};

// Only the uid is publicly readable (see database.rules.json), so sign-up can
// check whether a username is taken before the account exists.
export const isUsernameTaken = (username) => {
  return get(ref(db, `users/${username}/uid`)).then((snapshot) => snapshot.exists());
};

// Passwords are handled by Firebase Authentication and never stored here.
export const createUser = (firstName, lastName, username, uid, email, gender, phoneNumber) => {
  return set(ref(db, `users/${username}`), {
    firstName,
    lastName,
    username,
    uid,
    email,
    gender,
    phoneNumber,
  });
};

export const getUserData = (uid) => {
  return get(query(ref(db, "users"), orderByChild("uid"), equalTo(uid)));
}

export const updateUserProfilePicture = (username, url) => {
  return update(ref(db), {
    [`users/${username}/avatarUrl`]: url,
  });
};

export const updateUserData = (uid, updates) => {
  return update(ref(db, `users/${uid}`), updates);
};
