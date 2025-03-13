import Navbar from "@/components/navbar"
import Link from "next/link"

export default function RecruiterDashboard() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar userType="recruiter" />
      <main className="flex-1 p-4">
        <div className="bg-[#313131] p-6 rounded-md mb-8">
          <h1 className="text-2xl font-bold text-center uppercase">GET YOUR JOB IN ONE TAP</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((company) => (
            <div key={company} className="job-card p-4 rounded-md">
              <div className="mb-4">
                <h3 className="font-bold">COMPANY-{company}</h3>
              </div>
              <div className="text-xs">
                <p>ALL DETAILS</p>
                <p>ABOUT</p>
                <p>THE COMPANY</p>
              </div>
              <div className="mt-4 flex justify-end">
                <button className="bg-[#313131] text-white text-xs px-3 py-1 rounded">EDIT</button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-around">
          <Link href="/recruiter/post-job">
            <div className="bg-[#313131] p-2 rounded-md text-center">
              <span className="text-white">POST JOB</span>
            </div>
          </Link>
          <Link href="/recruiter/track-applicants">
            <div className="bg-[#313131] p-2 rounded-md text-center">
              <span className="text-white">TRACK APPLICANTS</span>
            </div>
          </Link>
          <Link href="/recruiter/analytics">
            <div className="bg-[#313131] p-2 rounded-md text-center">
              <span className="text-white">AI ANALYTICS</span>
            </div>
          </Link>
        </div>
      </main>
    </div>
  )
}

