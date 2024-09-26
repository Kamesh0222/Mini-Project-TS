import React, { createContext, useState, useEffect, ReactNode } from "react";

interface QRData {
  id: string;
  type: string;
  date: string;
  qr: string;
}

interface User {
  userName: string;
  password: string;
  qrData?: QRData[];
}

interface LoginDetails {
  userName: string;
  password: string;
}

interface UserContextType {
  users: User[];
  currentUser: User | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
  qrData: QRData[];
  addQr: (newQr: QRData) => void;
  deleteQr: (id: string) => void;
  updateQr: (id: string, updatedQr: QRData) => void;
  signupUser: (newUser: User) => void;
  loginUser: (loginDetails: LoginDetails) => boolean;
  logoutUser: () => void;
}

export const UserContext = createContext<UserContextType | undefined>(
  undefined
);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    const savedUsers = localStorage.getItem("users");
    return savedUsers ? JSON.parse(savedUsers) : [];
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedCurrentUser = localStorage.getItem("currentUser");
    return savedCurrentUser ? JSON.parse(savedCurrentUser) : null;
  });

  const [qrData, setQrData] = useState<QRData[]>(() => {
    return currentUser ? currentUser.qrData || [] : [];
  });

  useEffect(() => {
    if (users) {
      localStorage.setItem("users", JSON.stringify(users));
    }
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
      setQrData(currentUser.qrData || []);
    }
  }, [currentUser]);

  const addQr = (newQr: QRData) => {
    const updatedQrData = [...qrData, newQr];
    setQrData(updatedQrData);
    updateUserQrData(updatedQrData);
  };

  const deleteQr = (id: string) => {
    const updatedQrData = qrData.filter((qr) => qr.id !== id);
    setQrData(updatedQrData);
    updateUserQrData(updatedQrData);
  };

  const updateQr = (id: string, updatedQr: QRData) => {
    const updatedQrData = qrData.map((qr) => (qr.id === id ? updatedQr : qr));
    setQrData(updatedQrData);
    updateUserQrData(updatedQrData);
  };

  const updateUserQrData = (updatedQrData: QRData[]) => {
    if (currentUser) {
      const updatedUser = { ...currentUser, qrData: updatedQrData };
      setCurrentUser(updatedUser);
      const updatedUsers = users.map((user) =>
        user.userName === currentUser.userName ? updatedUser : user
      );
      setUsers(updatedUsers);
    }
  };

  const signupUser = (newUser: User) => {
    const userExists = users.some((user) => user.userName === newUser.userName);
    if (!userExists) {
      setUsers([...users, newUser]);
    } else {
      alert("Username already exists.");
    }
  };

  const loginUser = (loginDetails: LoginDetails) => {
    const user = users.find(
      (user) =>
        user.userName === loginDetails.userName &&
        user.password === loginDetails.password
    );
    if (user) {
      setCurrentUser(user);
      return true;
    } else {
      return false;
    }
  };

  const logoutUser = () => {
    setCurrentUser(null);
    localStorage.removeItem("currentUser");
  };

  return (
    <UserContext.Provider
      value={{
        users,
        currentUser,
        setCurrentUser,
        qrData,
        addQr,
        deleteQr,
        updateQr,
        signupUser,
        loginUser,
        logoutUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
