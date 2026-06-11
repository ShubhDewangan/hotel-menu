import { Search, X } from "lucide-react"


const Searchbar = ({ value, onChange }: {
    value: string
    onChange: (newValue: string) => void
}) => {

    

  return (
    <div
    className="flex-1  md:min-w-[600px] flex items-center gap-2 rounded-full px-4 py-2 transition-all duration-200 border-0.5 border-[#e9d187d4]"
    style={{
        background: "rgba(239,236,227,0.10)",
        // border:     "1px solid rgba(239,236,227,0.22)",
    }}
    >
    <Search size={14}
    //  style={{ color: theme.accentHex }} 
     className="flex-shrink-0" />
    <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search the dish you want to try…"
        className="flex-1 bg-transparent outline-none font-cormorant text-[14px] text-white/80 placeholder-white/30"
    />
    {value && (
        <button onClick={() => onChange("")} className="text-white/40 hover:text-white/70 cursor-pointer">
        <X size={14} />
        </button>
    )}
    </div>
  )
}

export default Searchbar
