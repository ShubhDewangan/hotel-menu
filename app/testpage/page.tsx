import LanguageButton from '@/components/ui/LanguageButton'
import Image from 'next/image'


const page = () => {
  return (
    <div className='h-screen w-screen overflow-hidden flex flex-col'>

      {/* bg Image */}
      <Image
        src='/bg-restaurant-green.png'
        alt='bg'
        height={2000}
        width={2000}
        loading='eager'
        className='absolute h-full w-full object-cover -z-10 brightness-50'
      />

      <div className='w-full flex items-center justify-between px-20 py-5'>
        <Image
          src='/english-logo.png'
          alt='logo'
          height={50}
          width={50}
          className='h-20 w-fit brightness-150'
        />

        <div className="flex items-center w-full max-w-[600px] border border-[#e9d087]/50 bg-[#eee0b5d0] rounded-full px-4 py-1 shadow-sm focus-within:border-[#AA771C] focus-within:shadow-md transition-all duration-300 mx-auto">
        {/* Search Glass Visual Anchor */}
        <svg xmlns="http://w3.org" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#AA771C" className="w-5 h-5 mr-3 flex-shrink-0 opacity-70">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>

        {/* Search Input Field */}
        <input 
          type="text" 
          className="bg-transparent w-full font-cormorant text-lg text-gray-950 placeholder-gray-700 focus:outline-none" 
          placeholder="Search what you are craving for..." 
        />
      </div>

        <LanguageButton/>

      </div>

      {/* this will be like the menucards we made that will scroll sideways and lock and the middle one will look bigger */}
      <div className='flex w-full gap-5 justify-center'>
        <div className='rounded-2xl border bg-amber-100/70 border-[#e9d087] text-5xl font-yatra min-w-[450px] text-center py-10 text-transparent bg-clip-text bg-gradient-to-r from-[#B38728] via-[#FBF5B7] to-[#AA771C] font-bold'>
          Starters
        </div>
        <div className='rounded-2xl border bg-amber-100/70 border-[#e9d087] text-5xl font-yatra min-w-[450px] text-center py-10 text-transparent bg-clip-text bg-gradient-to-r from-[#B38728] via-[#FBF5B7] to-[#AA771C] font-bold'>
          Appetizers
        </div>

        {/* <div className='rounded-2xl border bg-amber-100/80 border-[#e9d087] text-5xl text-[#977319] font-yatra min-w-[450px] text-center py-10'>
          Main Course
        </div> */}
        <div className='rounded-2xl border bg-amber-100/70 border-[#e9d087] text-5xl font-yatra min-w-[450px] text-center py-10 text-transparent bg-clip-text bg-gradient-to-r from-[#B38728] via-[#FBF5B7] to-[#AA771C] font-bold'>
          Main Course
        </div>
        <div className='rounded-2xl border bg-amber-100/70 border-[#e9d087] text-5xl font-yatra min-w-[450px] text-center py-10 text-transparent bg-clip-text bg-gradient-to-r from-[#B38728] via-[#FBF5B7] to-[#AA771C] font-bold'>
          Deserts
        </div>
        <div className='rounded-2xl border bg-amber-100/70 border-[#e9d087] text-5xl font-yatra min-w-[450px] text-center py-10 text-transparent bg-clip-text bg-gradient-to-r from-[#B38728] via-[#FBF5B7] to-[#AA771C] font-bold'>
          Breakfast
        </div>
      </div>

      {/* Section wise menu container , the menu of the selected section like starter main course will load here also the menu item design*/}
      <div className='bg-[#eee0b5d0] border-2 border-[#e9d087] flex-1 m-5 rounded-2xl p-5'>
        <div className="bg-[#fdfbf7] border border-[#e9d087]/60 shadow-md hover:shadow-lg transition-all duration-300 max-w-[500px] p-5 rounded-2xl flex gap-4 relative overflow-hidden group m-2">
  {/* Veg/Non-Veg Indicator (Re-positioned relative to the card container) */}
  <span className="absolute top-4 left-4 z-10 h-2 w-2 rounded-full bg-green-600 outline outline-2 outline-green-600 outline-offset-2"></span>
  
  {/* Image Container */}
  <div className="h-24 w-24 min-w-[96px] rounded-xl overflow-hidden shadow-inner bg-amber-50">
    <Image
      src="/paneer-butter-masala.jpg"
      alt="Paneer Butter Masala"
      height={96}
      width={96}
      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
    />
  </div>

  {/* Item Details */}
  <div className="flex flex-col flex-1 min-w-0 justify-center">
    <h3 className="font-cormorant text-2xl font-bold text-gray-800 leading-snug truncate">
      Paneer Butter Masala
    </h3>
    <p className="font-cormorant text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">
      Soft paneer cubes simmered in a smooth, mildly sweet, and spiced tomato-onion gravy loaded with butter and cream.
    </p>
  </div>

  {/* Action / Price Column */}
  <div className="flex flex-col justify-between items-end min-w-[90px]">
    <span className="font-dm-serif text-xl font-semibold text-[#AA771C]">
      450/-
    </span>
    
    {/* Elegant Stepper Counter */}
    <div className="flex items-center border border-[#e9d087] rounded-lg overflow-hidden bg-white shadow-sm text-sm">
      <button className="px-2.5 py-1 text-gray-400 hover:bg-amber-50 active:bg-amber-100 transition-colors font-semibold">-</button>
      <span className="px-2.5 py-1 font-sans font-bold text-green-700 bg-amber-50/50">2</span>
      <button className="px-2.5 py-1 text-gray-400 hover:bg-amber-50 active:bg-amber-100 transition-colors font-semibold">+</button>
    </div>
  </div>
</div>

      </div>
    </div>
  )
}

export default page
