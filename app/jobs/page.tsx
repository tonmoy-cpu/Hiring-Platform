import Navbar from "@/components/navbar"

export default function Jobs() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 p-4">
        <div className="bg-[#313131] p-6 rounded-md mb-8">
          <h1 className="text-2xl font-bold text-center uppercase">JOBS</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((company) => (
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
                <button className="bg-[#313131] text-white text-xs px-3 py-1 rounded">APPLY</button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

