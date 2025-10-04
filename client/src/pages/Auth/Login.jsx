import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useAuth from "../../hooks/useAuth";
import CustomButton from "../../components/Common/CustomButton";
import InputField from "../../components/Common/InputField";
import AppLogo from "../../components/Branding/AppLogo";

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
        console.log("Navigating to /admin"); // Debug log
        navigate("/admin");
      } else if (user.role === "municipality") {
        console.log("Navigating to /admin"); // Debug log
        navigate("/admin");
      } else if (user.role === "rescuer") {
        console.log("Navigating to /admin"); // Debug log
        navigate("/admin");
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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-white dark:bg-slate-950">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-sky-600 via-blue-700 to-indigo-800 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900" />
      <div
        className="absolute inset-0 -z-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.35), transparent 60%)",
        }}
      />
      <div
        className="absolute -z-0 pointer-events-none inset-0 mix-blend-overlay"
        style={{
          backgroundImage:
            "linear-gradient(115deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 50%, rgba(255,255,255,0.05) 100%)",
        }}
      />
      <div className="w-full max-w-md mx-auto px-6">
        <div className="bg-white/90 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/40 dark:border-slate-800 p-8 mt-10">
          <div className="flex flex-col items-center mb-6">
            <AppLogo size={52} />
            <h1 className="mt-4 text-2xl font-semibold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400">
              Welcome back
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Sign in to access your dashboard
            </p>
          </div>
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <InputField
              id="email"
              name="email"
              type="email"
              label="Email"
              placeholder="you@example.com"
              register={register}
              errors={errors}
            />
            <InputField
              id="password"
              name="password"
              type="password"
              label="Password"
              placeholder="••••••••"
              register={register}
              errors={errors}
            />
            <div className="flex items-center justify-between text-sm">
              <Link
                to="/forgot-password"
                className="font-medium text-sky-600 hover:text-sky-500"
              >
                Forgot password?
              </Link>
            </div>
            <CustomButton type="submit" fullWidth>
              Sign In
            </CustomButton>
          </form>
          <div className="text-center text-sm text-slate-600 dark:text-slate-400 mt-6">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-medium text-sky-600 hover:text-sky-500"
            >
              Register
            </Link>
          </div>
        </div>
        <p className="mt-8 text-center text-xs text-slate-300 dark:text-slate-600">
          &copy; {new Date().getFullYear()} Aqua Assists
        </p>
      </div>
    </div>
  );
};

export default Login;
