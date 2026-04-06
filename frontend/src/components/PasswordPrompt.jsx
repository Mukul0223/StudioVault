import { useState } from "react";

const PasswordPrompt = ({ onUnlock }) => {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!password) return
    
    setLoading(true)
    setError('')
    
    try {
      await onUnlock(password)
    } catch (err) {
      setError("Invalid password. Plese try again.")
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="max-w-md w-full mx-auto mt-20 p-8 bg-white rounded-2xl shadow-xl border border-slate-200">
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Private Folder</h2>
      <p className="text-slate-600 mb-6">Please enter the password provided by your photographer</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            placeholder="Enter password"
            className="w-full p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:text-slate-400"
          />
        </div>
        {error && (<p className="text-sm text-red-600 font-medium">{error}</p>)}
        <button
          type="submit"
          disabled={loading || !password}
          className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed cursor-pointer"
        >
         {loading ? "Unlocking...": "View Photos"} 
        </button>
      </form>
    </div>
  )
}

export default PasswordPrompt