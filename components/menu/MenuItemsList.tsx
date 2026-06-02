/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Image from "next/image";
import { MenuCategory } from "@/types/menu";
import { ThemeConfig }  from "@/lib/themeConfig";
import { useCart }      from "@/context/CartContext";
import { Plus, Minus }  from "lucide-react";

interface MenuItemsListProps {
  section:      MenuCategory;
  theme:        ThemeConfig;
  searchQuery?: string;
}

function Highlight({ text, query, hex }: { text: string; query: string; hex: string }) {
  if (!query.trim()) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark style={{ background: `${hex}55`, color: "inherit", borderRadius: "2px", padding: "0 2px" }}>
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

export default function MenuItemsList({ section, theme, searchQuery = "" }: MenuItemsListProps) {
  const { addItem, removeItem, items } = useCart();
  const q = searchQuery.trim().toLowerCase();

  const filtered = section.items.filter((item) =>
    !q ||
    item.name.toLowerCase().includes(q) ||
    (item.description?.toLowerCase().includes(q) ?? false)
  );

  if (filtered.length === 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="font-cormorant text-[15px] italic" style={{ color: `${theme.accentHex}70` }}>
          No dishes found{q ? ` for "${searchQuery}"` : ""}.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-3">
      {filtered.map((item) => {
        const cartItem = items.find((c: any) => c.name === item.name);
        const qty      = cartItem?.quantity ?? 0;

        return (
          <div
            key={item.name}
            className="bg-[#fdfbf7] border border-[#e9d087]/60 shadow-md hover:shadow-lg transition-all duration-300 max-w-[500px] w-full p-5 rounded-2xl flex gap-4 relative overflow-hidden group m-2"
          >
            {/* Veg/Non-Veg Indicator (Pinned to relative card container) */}
            <span 
              className={`absolute top-4 left-4 z-10 h-2 w-2 rounded-full outline outline-2 outline-offset-2 ${
                item.isVeg ? "bg-green-600 outline-green-600" : "bg-red-500 outline-red-500"
              }`}
            />
            
            {/* Image Container */}
            {/* {item.image ? (
              <div className="h-24 w-24 min-w-[96px] rounded-xl overflow-hidden shadow-inner bg-amber-50 relative">
                <Image
                  src={item.image}
                  alt={item.name}
                  height={96}
                  width={96}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            ) : ( */}
               {/* Premium Fallback Placeholder if image missing  */}
              <div
                className="h-24 w-24 min-w-[96px] rounded-xl flex items-center justify-center shadow-inner"
                style={{ background: `${theme.accentHex}12`, border: `1px solid ${theme.accentHex}20` }}
              >
                <span className="text-2xl opacity-30 text-[#95773a]">◈</span>
              </div>
             {/* )} */}

            {/* Item Details Column */}
            <div className="flex flex-col flex-1 min-w-0 justify-center">
              <h3 className="font-cormorant text-2xl font-bold text-gray-800 leading-snug truncate">
                <Highlight text={item.name} query={searchQuery} hex={theme.accentHex} />
              </h3>
              
              {item.description && (
                <p className="font-cormorant text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">
                  <Highlight text={item.description} query={searchQuery} hex={theme.accentHex} />
                </p>
              )}
            </div>

            {/* Action / Price Column */}
            <div className="flex flex-col justify-between items-end min-w-[95px]">
              <span className="font-dm-serif text-xl font-semibold text-[#AA771C]">
                ₹{item.price}/-
              </span>
              
              {/* Stepper Logic Switcher */}
              {qty === 0 ? (
                <button
                  onClick={() => addItem({ name: item.name, description: item.description ?? "", price: item.price, isVeg: item.isVeg })}
                  className="flex items-center justify-center gap-1 px-3 py-1.5 border border-[#e9d087] rounded-lg bg-white text-gray-700 hover:bg-amber-50/50 active:scale-95 transition-all text-xs font-sans font-bold shadow-sm"
                >
                  <Plus size={12} className="text-[#AA771C]" />
                  ADD
                </button>
              ) : (
                <div className="flex items-center border border-[#e9d087] rounded-lg overflow-hidden bg-white shadow-sm text-sm">
                  <button 
                    onClick={() => removeItem(item.name)}
                    className="px-2.5 py-1 text-gray-400 hover:bg-amber-50 active:bg-amber-100 transition-colors font-semibold"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="px-2.5 py-1 font-sans font-bold text-green-700 bg-amber-50/50">
                    {qty}
                  </span>
                  <button 
                    onClick={() => addItem({ name: item.name, description: item.description ?? "", price: item.price, isVeg: item.isVeg })}
                    className="px-2.5 py-1 text-gray-400 hover:bg-amber-50 active:bg-amber-100 transition-colors font-semibold"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              )}
            </div>

          </div>
        );
      })}
    </div>
  );
}
