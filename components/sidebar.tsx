"use client"
import Link from "next/link"

type SidebarProps = {
  isOpen: boolean
  onClose: () => void
  userType?: "recruiter" | "candidate"
}

export default function Sidebar({ isOpen, onClose, userType = "candidate" }: SidebarProps) {
  return (
    <>
      {/* Left sliding sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-48 bg-[#313131] shadow-lg transform transition-transform duration-300 ease-in-out z-20 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 space-y-2">
          <div className="py-2 px-4 hover:bg-[#4a4a4a] cursor-pointer rounded">
            <Link href={userType === "recruiter" ? "/recruiter/dashboard" : "/dashboard"}>Home</Link>
          </div>

          {userType === "candidate" ? (
            <>
              <div className="py-2 px-4 hover:bg-[#4a4a4a] cursor-pointer rounded">
                <Link href="/jobs">Jobs</Link>
              </div>
              <div className="py-2 px-4 hover:bg-[#4a4a4a] cursor-pointer rounded">
                <Link href="/resume-extraction">Resume Extraction</Link>
              </div>
              <div className="py-2 px-4 hover:bg-[#4a4a4a] cursor-pointer rounded">
                <Link href="/track-applications">Track Applications</Link>
              </div>
            </>
          ) : (
            <>
              <div className="py-2 px-4 hover:bg-[#4a4a4a] cursor-pointer rounded">
                <Link href="/recruiter/post-job">Post Job</Link>
              </div>
              <div className="py-2 px-4 hover:bg-[#4a4a4a] cursor-pointer rounded">
                <Link href="/recruiter/track-applicants">Track Applicants</Link>
              </div>
              <div className="py-2 px-4 hover:bg-[#4a4a4a] cursor-pointer rounded">
                <Link href="/recruiter/analytics">Analytics</Link>
              </div>
            </>
          )}

          <div className="py-2 px-4 hover:bg-[#4a4a4a] cursor-pointer rounded">
            <Link href="/about">About</Link>
          </div>
          <div className="py-2 px-4 hover:bg-[#4a4a4a] cursor-pointer rounded">
            <Link href="/contact">Contact Us</Link>
          </div>
        </div>
      </div>

      {/* Overlay to close sidebar when clicking outside */}
      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-10" onClick={onClose} />}
    </>
  )
}

