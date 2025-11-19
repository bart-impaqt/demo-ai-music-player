"use client";

import { motion } from "framer-motion";

export default function LoadingScreen() {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center relative bg-white">
      {/* Subtle blurred background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1C5ADF] to-[#ffffff] opacity-50" />

      {/* Logo */}
      <motion.img
        src="/logo.png"
        alt="Logo"
        className="w-72 h-fit object-contain z-10"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      />

      {/* Loader */}
      <motion.div
        className="mt-10 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <div className="flex gap-2">
          <div className="w-3 h-3 bg-[#1C5ADF] rounded-full animate-bounce" />
          <div className="w-3 h-3 bg-[#1C5ADF] rounded-full animate-bounce delay-150" />
          <div className="w-3 h-3 bg-[#1C5ADF] rounded-full animate-bounce delay-300" />
        </div>
      </motion.div>

      {/* Optional text */}
      <motion.p
        className="text-[#1C5ADF] mt-2 z-10 text-lg font-semibold"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        Loading your station
      </motion.p>
    </div>
  );
}
