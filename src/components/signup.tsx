import { useState, useContext, ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import Nav from "./nav";

interface SignupProps {
  toggleTheme: () => void;
}

interface SignupData {
  name: string;
  userName: string;
  password: string;
  qrData: any[];
}

const Signup: React.FC<SignupProps> = ({ toggleTheme }) => {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("UserContext must be used within a UserProvider");
  }

  const { signupUser } = context;
  const navigate = useNavigate();

  const [signupData, setSignupData] = useState<SignupData>({
    name: "",
    userName: "",
    password: "",
    qrData: [],
  });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSignupData({
      ...signupData,
      [name]: value,
    });
  };

  const handleSignup = (e: FormEvent) => {
    e.preventDefault();
    signupUser(signupData);
    navigate("/");
  };

  return (
    <div className="">
      <div className="text-center p-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
        <Nav toggleTheme={toggleTheme} />
      </div>
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>
          <form onSubmit={handleSignup} className="space-y-6">
            <div className="flex flex-col">
              <label htmlFor="name" className="mb-2 text-sm font-medium">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={signupData.name}
                onChange={handleInputChange}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your name"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="userName" className="mb-2 text-sm font-medium">
                Username
              </label>
              <input
                type="text"
                name="userName"
                value={signupData.userName}
                onChange={handleInputChange}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your username"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="password" className="mb-2 text-sm font-medium">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={signupData.password}
                onChange={handleInputChange}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your password"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors"
            >
              Sign Up
            </button>
            <div className="text-center text-sm">
              <a href="/" className="text-blue-500 hover:underline">
                Already have an account? Log in
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
