import Navbar from "@/components/navbar"
import { CircleUser, FileText, MoreHorizontal } from "lucide-react"

export default function TrackApplicants() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 p-4">
        <div className="bg-[#313131] p-6 rounded-md mb-8">
          <h1 className="text-2xl font-bold text-center uppercase">TRACK APPLICANTS</h1>
        </div>

        <div className="space-y-4">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="bg-[#d9d9d9] p-3 rounded-md flex items-center">
              <div className="mr-3">
                <CircleUser className="h-10 w-10 text-[#313131]" />
              </div>
              <div className="flex-1 text-[#313131]">
                <p className="font-bold">NAME</p>
                <p className="text-xs">all the details of the cover letter</p>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-1 rounded-full bg-[#313131]">
                  <FileText className="h-4 w-4 text-white" />
                </button>
                <button className="p-1 rounded-full bg-[#313131]">
                  <MoreHorizontal className="h-4 w-4 text-white" />
                </button>
                <button className="bg-[#313131] text-white text-xs px-3 py-1 rounded">SELECT</button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

