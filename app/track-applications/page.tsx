import Navbar from "@/components/navbar";
import { CircleUser, FileText } from "lucide-react";

export default function TrackApplications() {
  const applications = [
    { id: 1, company: "COMPANY-1", details: "Software Engineer", status: "Applied", feedback: "Add 'TypeScript' to skills." },
    { id: 2, company: "COMPANY-2", details: "Product Manager", status: "Under Review", feedback: "Highlight Agile experience." },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 p-6">
        <div className="bg-[#313131] p-6 rounded-lg mb-8 shadow-md">
          <h1 className="text-3xl font-bold text-center uppercase text-white">Track Applications</h1>
        </div>

        <div className="space-y-6">
          {applications.map((app) => (
            <div key={app.id} className="bg-[#d9d9d9] p-4 rounded-lg flex items-center shadow-md">
              <CircleUser className="h-10 w-10 text-[#313131] mr-4" />
              <div className="flex-1 text-[#313131]">
                <p className="font-bold text-lg">{app.company}</p>
                <p className="text-sm">{app.details}</p>
                <p className="text-xs mt-1">Status: {app.status}</p>
                <p className="text-xs text-gray-600 mt-1">Feedback: {app.feedback}</p>
              </div>
              <button className="p-2 rounded-full bg-[#313131] hover:bg-[#4a4a4a] transition">
                <FileText className="h-5 w-5 text-white" />
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}