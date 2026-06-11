/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { ThemeConfig } from "@/lib/themeConfig";
import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";

interface CartDrawerProps {
  open:    boolean;
  onClose: () => void;
  theme:   ThemeConfig;
  inline?: boolean;
}

export default function CartDrawer({ open, onClose, theme, inline }: CartDrawerProps) {
  const { items, addItem, removeItem, clearCart } = useCart();
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [open]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  // ── Inline / desktop split mode ──
  if (inline) {
    if (!open) return null;
    return (
      <div
        className="flex flex-col h-full w-full"
        style={{
          background: "rgba(10, 8, 4, 0.97)",
          borderLeft: `1px solid ${theme.accentHex}30`,
        }}
      >
        <DrawerContents
          items={items}
          total={total}
          theme={theme}
          onClose={onClose}
          addItem={addItem}
          removeItem={removeItem}
          clearCart={clearCart}
        />
      </div>
    );
  }

  // ── Mobile fixed overlay ──
  if (!open && !visible) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md transition-opacity duration-300"
        style={{ opacity: visible ? 1 : 0 }}
        onClick={handleClose}
      />
      <div
        className="fixed top-0 right-0 z-50 h-full w-full max-w-[360px] flex flex-col shadow-2xl transition-transform duration-300 ease-out"
        style={{
          background: "rgba(10, 8, 4, 0.99)",
          borderLeft: `1px solid ${theme.accentHex}30`,
          transform:  visible ? "translateX(0)" : "translateX(100%)",
        }}
      >
        <DrawerContents
          items={items}
          total={total}
          theme={theme}
          onClose={handleClose}
          addItem={addItem}
          removeItem={removeItem}
          clearCart={clearCart}
        />
      </div>
    </>
  );
}

function DrawerContents({ items, total, theme, onClose, addItem, removeItem, clearCart }: {
  items:      any[];
  total:      number;
  theme:      ThemeConfig;
  onClose:    () => void;
  addItem:    (item: any) => void;
  removeItem: (name: string) => void;
  clearCart:  () => void;
}) {
  return (
    <>
      {/* Header */}
      <div
        className="flex items-center justify-between px-6 py-5 border-b flex-shrink-0"
        style={{ borderColor: `${theme.accentHex}20` }}
      >
        <div className="flex items-center gap-3">
          <ShoppingBag size={18} style={{ color: theme.accentHex }} />
          <span
            className="font-cinzel text-[14px] tracking-[0.12em] uppercase"
            style={{ color: theme.accentHex }}
          >
            Your Selection
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-white/40 hover:text-white/80 transition-colors cursor-pointer p-1"
        >
          <X size={20} />
        </button>
      </div>

      {/* Items List */}
      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3 custom-scrollbar">
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center py-12">
            <ShoppingBag size={32} className="opacity-20" style={{ color: theme.accentHex }} />
            <p className="font-cormorant text-[15px] italic text-white/30">
              No items selected yet.<br />Tap any dish to add it.
            </p>
          </div>
        ) : (
          items.map((item: any) => (
            <div
              key={item.name}
              className="flex items-start gap-3 rounded-[12px] p-3"
              style={{
                background: `${theme.accentHex}08`,
                border:     `1px solid ${theme.accentHex}18`,
              }}
            >
              <div
                className={`mt-0.5 w-[10px] h-[10px] rounded-[2px] border flex-shrink-0 flex items-center justify-center ${
                  item.isVeg ? "border-green-600" : "border-red-600"
                }`}
              >
                <div className={`w-[4px] h-[4px] rounded-full ${item.isVeg ? "bg-green-600" : "bg-red-600"}`} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-cormorant text-[15px] text-white/90">{item.name}</p>
                {item.description && (
                  <p className="font-cormorant text-[12px] text-white/55 truncate mt-0.5">
                    {item.description}
                  </p>
                )}
                <p className="font-yatra text-[13px] mt-1" style={{ color: theme.accentHex }}>
                  ₹{(item.price * item.quantity).toLocaleString()}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => removeItem(item.name)}
                  className="w-6 h-6 rounded-full border flex items-center justify-center cursor-pointer"
                  style={{ borderColor: `${theme.accentHex}40`, color: theme.accentHex }}
                >
                  <Minus size={10} />
                </button>
                <span className="font-dm-serif text-[13px] text-white/80 w-4 text-center">
                  {item.quantity}
                </span>
                <button
                  onClick={() => addItem({
                    name:        item.name,
                    description: item.description,
                    price:       item.price,
                    isVeg:       item.isVeg,
                  })}
                  className="w-6 h-6 rounded-full border flex items-center justify-center cursor-pointer"
                  style={{ borderColor: `${theme.accentHex}40` }}
                >
                  <Plus size={10} style={{ color: theme.accentHex }} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {items.length > 0 && (
        <div
          className="px-5 py-5 border-t flex flex-col gap-3 flex-shrink-0"
          style={{ borderColor: `${theme.accentHex}20` }}
        >
          <div className="flex items-center justify-between">
            <span className="font-cinzel text-[11px] tracking-[0.12em] text-white/40 uppercase">
              Total
            </span>
            <span className="font-yatra text-[22px]" style={{ color: theme.accentHex }}>
              ₹{total.toLocaleString()}
            </span>
          </div>

          <div
            className="rounded-[12px] p-4 text-center"
            style={{
              background: `${theme.accentHex}12`,
              border:     `1px solid ${theme.accentHex}30`,
            }}
          >
            <p className="font-cinzel text-[10px] tracking-[0.1em] text-white/50 uppercase mb-1">
              Show this to your server
            </p>
            <div className="flex flex-col gap-1.5 mt-2">
              {items.map((item: any) => (
                <p key={item.name} className="font-mono text-[13px] text-white/70">
                  {item.quantity}× {item.name}
                  <span className="text-white/35"> — ₹{(item.price * item.quantity).toLocaleString()}</span>
                </p>
              ))}
            </div>
          </div>

          <button
            onClick={clearCart}
            className="flex items-center justify-center gap-2 text-[12px] text-white/25 hover:text-red-400/70 transition-colors cursor-pointer py-1"
          >
            <Trash2 size={12} /> Clear selection
          </button>
        </div>
      )}
    </>
  );
}