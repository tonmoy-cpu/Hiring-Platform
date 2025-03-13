import Navbar from "@/components/navbar"

export default function ResumeExtraction() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 p-4">
        <div className="bg-[#313131] p-6 rounded-md mb-8">
          <h1 className="text-2xl font-bold text-center uppercase">RESUME EXTRACTION</h1>
        </div>

        <div className="bg-[#d9d9d9] p-8 rounded-md flex flex-col items-center justify-center h-64">
          <p className="text-[#313131] text-center mb-4">DROP OR UPLOAD YOUR RESUME</p>
          <button className="submit-button mt-4">EXTRACT</button>
        </div>
      </main>
    </div>
  )
}

