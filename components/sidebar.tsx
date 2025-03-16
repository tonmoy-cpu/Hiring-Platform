"use client";
import Link from "next/link";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  userType?: "candidate" | "recruiter";
};

export default function Sidebar({ isOpen, onClose, userType = "candidate" }: SidebarProps) {
  return (
    <>
      <div
        className={`fixed top-0 left-0 h-full w-48 bg-[#313131] shadow-lg transform transition-transform duration-300 ease-in-out z-20 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 space-y-2">
          <div className="py-2 px-4 hover:bg-[#4a4a4a] cursor-pointer rounded">
            <Link href={userType === "recruiter" ? "/recruiter/dashboard" : "/dashboard"} onClick={onClose}>
              <span className="text-white">Home</span>
            </Link>
          </div>

          {userType === "candidate" ? (
            <>
              <div className="py-2 px-4 hover:bg-[#4a4a4a] cursor-pointer rounded">
                <Link href="/jobs" onClick={onClose}>
                  <span className="text-white">All Jobs</span>
                </Link>
              </div>
              <div className="py-2 px-4 hover:bg-[#4a4a4a] cursor-pointer rounded">
                <Link href="/resume-extraction" onClick={onClose}>
                  <span className="text-white">Resume Extraction</span>
                </Link>
              </div>
              <div className="py-2 px-4 hover:bg-[#4a4a4a] cursor-pointer rounded">
                <Link href="/track-applications" onClick={onClose}>
                  <span className="text-white">Track Applications</span>
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="py-2 px-4 hover:bg-[#4a4a4a] cursor-pointer rounded">
                <Link href="/recruiter/post-job" onClick={onClose}>
                  <span className="text-white">Post Job</span>
                </Link>
              </div>
              <div className="py-2 px-4 hover:bg-[#4a4a4a] cursor-pointer rounded">
                <Link href="/recruiter/track-applicants" onClick={onClose}>
                  <span className="text-white">Track Applicants</span>
                </Link>
              </div>
              <div className="py-2 px-4 hover:bg-[#4a4a4a] cursor-pointer rounded">
                <Link href="/recruiter/analytics" onClick={onClose}>
                  <span className="text-white">Analytics</span>
                </Link>
              </div>
            </>
          )}

          <div className="py-2 px-4 hover:bg-[#4a4a4a] cursor-pointer rounded">
            <Link href="/about" onClick={onClose}>
              <span className="text-white">About</span>
            </Link>
          </div>
          <div className="py-2 px-4 hover:bg-[#4a4a4a] cursor-pointer rounded">
            <Link href="/contact" onClick={onClose}>
              <span className="text-white">Contact Us</span>
            </Link>
          </div>
        </div>
      </div>

      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-10" onClick={onClose} />}
    </>
  );
}