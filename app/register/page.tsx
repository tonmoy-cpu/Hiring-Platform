import Link from "next/link"

export default function Register() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-8 form-card rounded-md">
        <h1 className="text-2xl font-bold text-center mb-8">REGISTER</h1>
        <form className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="user" className="block uppercase text-sm">
              USER
            </label>
            <input type="text" id="user" className="input-field" />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="block uppercase text-sm">
              PASSWORD
            </label>
            <input type="password" id="password" className="input-field" />
          </div>
          <div className="space-y-2">
            <label htmlFor="confirm-password" className="block uppercase text-sm">
              CONFIRM PASSWORD
            </label>
            <input type="password" id="confirm-password" className="input-field" />
          </div>

          <div className="flex justify-center space-x-4 mt-4">
            <label className="flex items-center space-x-2">
              <input type="radio" name="userType" value="recruiter" className="hidden" />
              <span className="px-3 py-1 rounded bg-[#4a4a4a] cursor-pointer hover:bg-[#5a5a5a]">Recruiter</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="radio" name="userType" value="candidate" className="hidden" />
              <span className="px-3 py-1 rounded bg-[#4a4a4a] cursor-pointer hover:bg-[#5a5a5a]">Candidate</span>
            </label>
          </div>

          <div className="text-center text-sm mt-4">
            <Link href="/" className="hover:underline">
              New user? Register here
            </Link>
          </div>
        </form>
        <div className="flex justify-center mt-8">
          <Link href="/dashboard">
            <button className="submit-button">SUBMIT</button>
          </Link>
        </div>
      </div>
    </main>
  )
}

