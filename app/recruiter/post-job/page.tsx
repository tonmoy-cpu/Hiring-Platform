import Navbar from "@/components/navbar"

export default function PostJob() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar userType="recruiter" />
      <main className="flex-1 p-4">
        <div className="bg-[#313131] p-6 rounded-md mb-8">
          <h1 className="text-2xl font-bold text-center uppercase">POST</h1>
        </div>

        <div className="bg-[#d9d9d9] p-6 rounded-md">
          <form className="space-y-6">
            <div>
              <label className="block text-[#313131] font-bold mb-2">JOB NAME:</label>
              <input type="text" className="w-full border-b border-[#313131] bg-transparent" />
            </div>

            <div>
              <label className="block text-[#313131] font-bold mb-2">DETAILS:</label>
              <input type="text" className="w-full border-b border-[#313131] bg-transparent" />
            </div>

            <div>
              <label className="block text-[#313131] font-bold mb-2">SKILLS:</label>
              <input type="text" className="w-full border-b border-[#313131] bg-transparent" />
            </div>

            <div>
              <label className="block text-[#313131] font-bold mb-2">SALARY:</label>
              <input type="text" className="w-full border-b border-[#313131] bg-transparent" />
            </div>

            <div className="flex justify-end">
              <button className="bg-[#b2b2b2] text-[#313131] px-4 py-1 rounded text-sm">SUBMIT</button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}

