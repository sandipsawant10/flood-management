import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useAuth from "../../hooks/useAuth";
import CustomButton from "../../components/Common/CustomButton";
import InputField from "../../components/Common/InputField";

const Login = () => {
  const navigate = useNavigate();
  const { login, user } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (user) {
      console.log("User found, redirecting based on role:", user.role); // Debug log
      if (user.role === "user" || user.role === "citizen") {
        console.log("Navigating to /dashboard"); // Debug log
        navigate("/dashboard");
      } else if (user.role === "admin") {
        console.log("Navigating to /admin/dashboard"); // Debug log
        navigate("/admin/dashboard");
      } else if (user.role === "municipality") {
        console.log("Navigating to /municipality/dashboard"); // Debug log
        navigate("/municipality/dashboard");
      } else {
        // Default fallback for any other roles
        console.log("Navigating to /dashboard (fallback)"); // Debug log
        navigate("/dashboard");
      }
    }
  }, [user, navigate]);

  const onSubmit = async (data) => {
    try {
      const success = await login(data.email, data.password);
      if (success) {
        toast.success("Logged in successfully!");
        // Redirection handled by useEffect based on user.role
      } else {
        toast.error("Login failed");
      }
    } catch (error) {
      toast.error(error.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <InputField
            id="email"
            name="email"
            type="email"
            label="Email address"
            placeholder="Email address"
            register={register}
            errors={errors}
          />

          <InputField
            id="password"
            name="password"
            type="password"
            label="Password"
            placeholder="Password"
            register={register}
            errors={errors}
          />

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link
                to="/forgot-password"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <CustomButton type="submit" fullWidth>
              Sign in
            </CustomButton>
          </div>
        </form>
        <div className="text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
