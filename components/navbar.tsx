"use client"

import Link from "next/link"
import { useState } from "react"
import Sidebar from "./sidebar"

type NavbarProps = {
  userType?: "recruiter" | "candidate"
}

export default function Navbar({ userType = "candidate" }: NavbarProps) {
  const [showSidebar, setShowSidebar] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

  return (
    <>
      <header className="bg-[#313131] p-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button onClick={() => setShowSidebar(!showSidebar)} className="flex flex-col space-y-1">
            <span className="block w-6 h-0.5 bg-white"></span>
            <span className="block w-6 h-0.5 bg-white"></span>
            <span className="block w-6 h-0.5 bg-white"></span>
          </button>
          <Link href={userType === "recruiter" ? "/recruiter/dashboard" : "/dashboard"} className="nav-link">
            HOME
          </Link>
          <Link href="/about" className="nav-link">
            ABOUT
          </Link>
          <Link href="/contact" className="nav-link">
            CONTACT US
          </Link>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-8 h-8 bg-black rounded-full flex items-center justify-center"
          >
            <span className="text-white">•</span>
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-40 dropdown-menu z-30">
              <div className="dropdown-item">Profile Details</div>
              <div className="dropdown-item">Logout</div>
            </div>
          )}
        </div>
      </header>

      <Sidebar isOpen={showSidebar} onClose={() => setShowSidebar(false)} userType={userType} />
    </>
  )
}

