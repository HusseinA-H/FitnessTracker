import { useState } from "react";

import { useAuth } from "@features/auth";
import { useToast } from "@shared/components/Toast";

export default function Settings() {
  const { user, updateUserName, changePassword } = useAuth();
  const toast = useToast();

  const [name, setName] = useState(() => user?.displayName || "");
  const [password, setPassword] = useState("");

  const saveName = async () => {
    if (!name.trim()) return;
    try {
      await updateUserName(name.trim());
      toast.success("Name updated successfully!");
    } catch (err) {
      toast.error(err?.message || "Failed to update displays name.");
    }
  };

  const handlePassword = async () => {
    if (!password) return;
    try {
      await changePassword(password);
      toast.success("Password updated successfully!");
      setPassword("");
    } catch (err) {
      toast.error(err?.message || "Failed to change account password.");
    }
  };

  return (
    <div className="min-h-[80vh] flex justify-center items-center">
      <div className="bg-[#111] border border-gray-700 rounded-3xl p-10 w-[500px] space-y-8 shadow-2xl">
        <h2 className="text-2xl font-bold text-center">Account Settings</h2>

        {/* NAME SECTION */}
        <div className="space-y-3">
          <label htmlFor="displayName" className="text-gray-400">
            Display Name
          </label>

          <input
            id="displayName"
            className="w-full p-3 bg-black border border-gray-700 rounded-xl focus:border-orange-500 transition"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <button
            onClick={saveName}
            className="w-full py-3 bg-orange-500 text-black rounded-xl hover:bg-orange-400 transition"
          >
            Save Name
          </button>
        </div>

        {/* PASSWORD SECTION */}
        <div className="space-y-3">
          <label htmlFor="newPassword" className="text-gray-400">
            Change Password
          </label>

          <input
            id="newPassword"
            type="password"
            placeholder="New Password"
            className="w-full p-3 bg-black border border-gray-700 rounded-xl focus:border-orange-500 transition"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            onClick={handlePassword}
            className="w-full py-3 bg-orange-500 text-black rounded-xl hover:bg-orange-400 transition"
          >
            Update Password
          </button>
        </div>
      </div>
    </div>
  );
}
