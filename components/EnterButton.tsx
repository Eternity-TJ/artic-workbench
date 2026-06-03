"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ApiKeyModal from "./ApiKeyModal";

export default function EnterButton() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  const handleEnter = () => {
    const savedKey = localStorage.getItem("artic-api-key");
    if (savedKey) {
      router.push("/dashboard");
    } else {
      setShowModal(true);
    }
  };

  const handleConfirm = (key: string) => {
    localStorage.setItem("artic-api-key", key);
    setShowModal(false);
    router.push("/dashboard");
  };

  return (
    <>
      <button
        onClick={handleEnter}
        className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-white font-semibold text-base shadow-lg hover:shadow-xl hover:scale-105 active:scale-[0.98] transition-all"
        style={{ background: "var(--primary)", boxShadow: "0 8px 24px color-mix(in srgb, var(--primary) 35%, transparent)" }}>
        进入工作台
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </button>
      <ApiKeyModal open={showModal} onConfirm={handleConfirm} onCancel={() => setShowModal(false)} />
    </>
  );
}
