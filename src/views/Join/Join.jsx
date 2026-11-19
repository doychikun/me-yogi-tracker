import "./Join.css";
import { useContext } from "react";
import { useForm } from "react-hook-form";
import AppContext from "../../providers/AppContext";
import { createUser, isUsernameTaken } from "../../services/users.service";
import { deleteAccount, registerUser } from "../../services/auth.service";
import { toast } from "react-toastify";

const TOAST_OPTIONS = { position: toast.POSITION.TOP_CENTER, autoClose: 3000 };

const signUpErrorMessage = (err) => {
  const message = err?.message || "";
  if (message.includes("email-already-in-use")) return "Email is in use!";
  if (message.includes("invalid-email")) return "Please enter a valid email address!";
  if (message.includes("weak-password")) return "Please choose a stronger password!";
  // The database rules reject a profile write when the username was taken in the meantime.
  if (message.toLowerCase().includes("permission")) return "Username is in use!";
  return "Sign-up failed. Please try again.";
};

const Join = ({ close }) => {
  const { setContext } = useContext(AppContext);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    isUsernameTaken(data.username)
      .then((taken) => {
        if (taken) {
          return toast.error("Username is in use!", TOAST_OPTIONS);
        }

        return registerUser(data.email, data.password).then(({ user }) =>
          createUser(
            data.firstName,
            data.lastName,
            data.username,
            user.uid,
            data.email,
            data.gender,
            data.phoneNumber
          )
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
              toast.success("Welcome!", TOAST_OPTIONS);
            })
        );
      })
      .catch((err) => toast.error(signUpErrorMessage(err), TOAST_OPTIONS));
  };

  return (
    <div className="join-form">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <input
            type="text"
            placeholder="First Name*"
            {...register("firstName", { required: "First name is required!" })}
          />
          <div className="error">
            <p>{errors.firstName?.message}</p>
          </div>
        </div>

        <div>
          <input
            type="text"
            placeholder="Last Name*"
            {...register("lastName", { required: "Last Name is required!" })}
          />
          <div className="error">
            <p>{errors.lastName?.message}</p>
          </div>
        </div>

        <div>
          <input
            type="text"
            placeholder="Username*"
            {...register("username", {
              required: true,
              minLength: 2,
              maxLength: 20,
            })}
          />
          <div className="error">
            {errors.username?.type === "required" && <p>Username is required!</p>}
            {errors.username?.type === "minLength" && (
              <p>The username must be between 2 and 20 symbols</p>
            )}
            {errors.username?.type === "maxLength" && (
              <p>The username must be between 2 and 20 symbols</p>
            )}
          </div>
        </div>

        <div>
          <input
            type="email"
            placeholder="Email*"
            {...register("email", { required: "Email Address is required!" })}
          />
          <div className="error">
            <p>{errors.email?.message}</p>  
          </div>
        </div>

        <div>
          <input
            type="password"
            placeholder="Password*"
            {...register("password", {
              required: true,
              minLength: 8,
              maxLength: 12,
            })}
          />
          <div className="error">
            {errors.password?.type === "required" && <p>Password is required!</p>}
            {errors.password?.type === "minLength" && (
              <p>The password must be between 8 and 12 symbols!</p>
            )}
            {errors.password?.type === "maxLength" && (
              <p>The password must be between 8 and 12 symbols!</p>
            )}
          </div>
        </div>

        <div>
          <input
            type="number"
            placeholder="Phone Number*"
            {...register("phoneNumber", {
              required: true,
              minLength: 10,
              maxLength: 10,
            })}
          />
          <div className="error">
            {errors.phoneNumber?.type === "required" && (
              <p>Phone number is required!</p>
            )}
            {errors.phoneNumber?.type === "minLength" && (
              <p>The phone number must be 10 digits!</p>
            )}
            {errors.phoneNumber?.type === "maxLength" && (
              <p>The phone number must be 10 digits!</p>
            )}
          </div>
        </div>

        <div>
          <select {...register("gender")}>
            <option>Sex...</option>
            <option value="male">male</option>
            <option value="female">female</option>
            <option value="other">other</option>
          </select>
        </div>

        <div>
          <button type="submit">Submit</button>
        </div>
      </form>
    </div>
  );
};

export default Join;
