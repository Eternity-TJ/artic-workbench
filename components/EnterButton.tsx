"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ApiKeyModal from "./ApiKeyModal";

export default function EnterButton() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [checking, setChecking] = useState(true);

  // 页面加载时验证已存储的 Key
  useEffect(() => {
    const savedKey = localStorage.getItem("artic-api-key");
    if (!savedKey) {
      setChecking(false);
      return;
    }
    fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${savedKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        max_tokens: 1,
        messages: [{ role: "user", content: "hi" }],
      }),
    }).then(res => {
      if (res.ok) {
        router.push("/dashboard");
      } else {
        localStorage.removeItem("artic-api-key");
        setChecking(false);
      }
    }).catch(() => {
      // 网络错误时允许使用已保存的 Key
      router.push("/dashboard");
    });
  }, [router]);

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
        disabled={checking}
        className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-white font-semibold text-base shadow-lg hover:shadow-xl hover:scale-105 active:scale-[0.98] transition-all disabled:opacity-50"
        style={{ background: "var(--primary)", boxShadow: "0 8px 24px color-mix(in srgb, var(--primary) 35%, transparent)" }}>
        {checking ? "验证中..." : "进入工作台"}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </button>
      <ApiKeyModal open={showModal} onConfirm={handleConfirm} onCancel={() => setShowModal(false)} />
    </>
  );
}
