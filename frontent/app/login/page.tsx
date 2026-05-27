"use client";
import React, { useEffect } from "react";
import axios from "axios";
import { useAppData, user_service } from "../../components/context/AppContext";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { useGoogleLogin, CodeResponse } from "@react-oauth/google";
import { useRouter } from "next/navigation";
import Loading from "@/components/loading";
import { BookOpen } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface LoginApiResponse {
  token: string;
  message: string;
  user: {
    _id: string;
    name: string;
    email: string;
    image: string;
    instagram: string;
    facebook: string;
    linkedin: string;
    bio: string;
  };
}

// ── Component ─────────────────────────────────────────────────────────────────

const LoginPage = () => {
  const { isAuth, setIsAuth, loading, setLoading, setUser } = useAppData();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuth) router.replace("/blogs");
  }, [isAuth, router]);

  const responseGoogle = async (authResult: CodeResponse) => {
    setLoading(true);
    try {
      const { data } = await axios.post<LoginApiResponse>(
        `${user_service}/api/v1/login`,
        { code: authResult.code }
      );
      Cookies.set("token", data.token, {
        expires: 5,
        secure: true,
        path: "/",
      });
      toast.success(data.message);
      setIsAuth(true);
      setUser(data.user);
      router.replace("/blogs");
    } catch {
      toast.error("Problem while logging you in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: responseGoogle,
    onError: () => toast.error("Google login failed. Please try again."),
    flow: "auth-code",
  });

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo / Brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-violet-600 flex items-center justify-center mb-4 shadow-lg shadow-violet-200 dark:shadow-violet-900/30">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            The Reading Retreat
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Your go-to blog destination
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-8 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-1">
            Welcome back
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Sign in to continue reading and saving blogs.
          </p>

          {/* Google Login Button */}
          <button
            onClick={() => googleLogin()}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 shadow-sm"
          >
            <img
              src="/google.png"
              className="w-5 h-5 flex-shrink-0"
              alt="Google"
            />
            Continue with Google
          </button>

          <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-5">
            By signing in, you agree to our{" "}
            <span className="text-violet-600 dark:text-violet-400 cursor-pointer hover:underline">
              Terms
            </span>{" "}
            &{" "}
            <span className="text-violet-600 dark:text-violet-400 cursor-pointer hover:underline">
              Privacy Policy
            </span>
          </p>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;