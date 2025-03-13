import Link from "next/link"

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-8 form-card rounded-md">
        <h1 className="text-2xl font-bold text-center mb-8">LOGIN</h1>
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
          <div className="text-center text-sm mt-4">
            <Link href="/register" className="hover:underline">
              Already a user? Login
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

