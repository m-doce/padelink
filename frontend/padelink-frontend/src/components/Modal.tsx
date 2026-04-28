"use client";

import React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "primary" | "success";
}

export default function Modal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  variant = "primary",
}: ModalProps) {
  if (!isOpen) return null;

  const variantClasses = {
    danger: "bg-red-600 hover:bg-red-700 shadow-red-500/20",
    primary: "bg-zinc-900 dark:bg-lime-500 dark:text-zinc-900 hover:opacity-90 shadow-zinc-500/20",
    success: "bg-lime-500 hover:bg-lime-600 shadow-lime-500/20",
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-2xl shadow-2xl p-6 border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
            {title}
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8 leading-relaxed">
            {description}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`w-full py-3 rounded-xl text-white font-bold transition-all shadow-lg ${variantClasses[variant]}`}
          >
            {confirmLabel}
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl text-zinc-600 dark:text-zinc-400 font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
