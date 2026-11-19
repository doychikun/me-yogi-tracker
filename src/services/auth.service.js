import { createUserWithEmailAndPassword, deleteUser, signInWithEmailAndPassword, signOut } from "firebase/auth"
import { auth } from "../config/firebase-config"

export const registerUser = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
};

export const loginUser = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
};

export const logoutUser = () => {
    return signOut(auth);
}

// Used to roll back a sign-up whose profile could not be saved.
export const deleteAccount = (user) => {
    return deleteUser(user);
}
