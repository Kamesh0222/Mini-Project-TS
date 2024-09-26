import React, { useContext, useState, ChangeEvent } from "react";
import { QRCodeSVG } from "qrcode.react";
import { UserContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import Nav from "./nav";
import axios from "axios";

interface MainProps {
  toggleTheme: () => void;
}

interface QRData {
  id: string;
  type: string;
  date: string;
  qr: string;
}

const Main: React.FC<MainProps> = ({ toggleTheme }) => {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("UserContext must be used within a UserProvider");
  }

  const { currentUser: user, qrData, addQr, deleteQr, logoutUser } = context;
  const [showModal, setShowModal] = useState(false);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selected, setSelected] = useState<string>("text");
  const [qrContent, setQrContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [viewedQR, setViewedQR] = useState<QRData | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const navigate = useNavigate();

  const handleGenerateQr = () => {
    setShowModal(true);
  };

  const username = user?.userName || "Guest";

  const handleCloseModal = () => {
    setShowModal(false);
    setQrContent("");
    setSelectedType("all");
    setViewedQR(null);
  };

  const handleUploadToCloudinary = async (file: File) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

    try {
      const response = await axios.post(import.meta.env.VITE_CLOUDINARY_URL, formData);
      const fileURL = response.data.secure_url;
      setQrContent(fileURL);
      setLoading(false);
      return fileURL;
    } catch (error) {
      console.error("Error uploading media:", error);
      setLoading(false);
    }
  };

  const handleGenerateButtonClick = async () => {
    if (selected !== "text" && !qrContent) {
      const fileInput = (document.getElementById("mediaFile") as HTMLInputElement)?.files?.[0];
      if (fileInput) {
        const uploadedUrl = await handleUploadToCloudinary(fileInput);
        if (uploadedUrl) {
          generateAndStoreQR(uploadedUrl);
        }
      }
    } else {
      generateAndStoreQR(qrContent);
    }
  };

  const generateAndStoreQR = (content: string) => {
    const newQr: QRData = {
      id: Date.now().toString(),
      type: selected,
      date: new Date().toISOString().split("T")[0],
      qr: content,
    };
    addQr(newQr);
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    deleteQr(id);
  };

  const handleViewQR = (qr: QRData) => {
    setViewedQR(qr);
  };

  const handleDownloadQR = (qrId: string) => {
    const svg = document.getElementById(`qrCode-${qrId}`) as unknown as SVGElement;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    img.onload = function () {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      const imgURI = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");

      const downloadLink = document.createElement("a");
      downloadLink.href = imgURI;
      downloadLink.download = "qr_code.png";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    };
    img.src = url;
  };

  const handleTypeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedType(e.target.value);
  };

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelected(e.target.value);
  };

  const handleLogout = () => {
    logoutUser();
    navigate("/");
  };

  const sortByDate = (a: QRData, b: QRData) => {
    if (sortOrder === "asc") return new Date(a.date).getTime() - new Date(b.date).getTime();
    if (sortOrder === "desc") return new Date(b.date).getTime() - new Date(a.date).getTime();
    return 0;
  };

  const toggleViewMode = (mode: "table" | "grid") => {
    setViewMode(mode);
  };

  const filteredQrData = qrData
    .filter((qr: QRData) => selectedType === "all" || qr.type === selectedType)
    .sort(sortByDate);

  return (
    <div className="min-h-screen flex flex-col items-center bg-white dark:bg-gray-900 text-black dark:text-white">
      <div className="text-center py-8 w-full">
        <Nav toggleTheme={toggleTheme} />
        <div className="flex justify-between mt-6 items-center max-w-5xl mx-auto w-full px-6">
          <h2 className="text-xl">Welcome, {username}</h2>
          <div>
            <button
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              onClick={handleGenerateQr}
            >
              Generate QR
            </button>
            {user && (
              <button
                className="ml-4 px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700"
                onClick={handleLogout}
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="w-full max-w-5xl mt-4 px-6 flex justify-between">
        <div>
          <label htmlFor="sortType" className="mr-2">
            Filter by Type:
          </label>
          <select
            id="sortType"
            value={selectedType}
            onChange={handleTypeChange}
            className="text-gray-900 px-3 py-2 rounded-md"
          >
            <option value="all">All</option>
            <option value="text">Text</option>
            <option value="image">Image</option>
            <option value="video">Video</option>
          </select>
        </div>
        <div>
          <label htmlFor="sortOrder" className="mr-2">
            Sort by Date:
          </label>
          <select
            id="sortOrder"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
            className="text-gray-900 px-3 py-2 rounded-md"
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
        <div>
          <label className="mr-2">View Mode:</label>
          <button
            className={`mr-2 px-4 py-2 ${viewMode === "table" ? "bg-blue-600" : "bg-gray-500"} text-white rounded-md`}
            onClick={() => toggleViewMode("table")}
          >
            Table
          </button>
          <button
            className={`px-4 py-2 ${viewMode === "grid" ? "bg-blue-600" : "bg-gray-500"} text-white rounded-md`}
            onClick={() => toggleViewMode("grid")}
          >
            Grid
          </button>
        </div>
      </div>

      {viewMode === "table" ? (
        <div className="w-full max-w-5xl mt-8">
          <div className="grid grid-cols-5 bg-gray-300 dark:bg-gray-700 font-bold text-center py-4 rounded-t-md">
            <div>S.No</div>
            <div>Type</div>
            <div>Date</div>
            <div>View QR</div>
            <div>Delete</div>
          </div>

          {filteredQrData.map((item, index) => (
            <div
              key={item.id}
              className="grid grid-cols-5 bg-gray-200 dark:bg-gray-800 border-b border-gray-700 py-4 text-center"
            >
              <div>{index + 1}</div>
              <div>{item.type}</div>
              <div>{item.date}</div>
              <div>
                <button
                  onClick={() => handleViewQR(item)}
                  className="text-blue-500 hover:underline"
                >
                  View
                </button>
              </div>
              <div>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-red-500 hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}

          {filteredQrData.length === 0 && (
            <div className="text-center mt-6 text-gray-600 dark:text-gray-400">No QR codes found for the selected type.</div>
          )}
        </div>
      ) : (
        <div className="w-full max-w-5xl mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredQrData.map((item) => (
            <div key={item.id} className="bg-gray-200 dark:bg-gray-800 p-4 rounded-lg shadow-md">
              <div className="flex justify-center">
                <QRCodeSVG
                  id={`qrCode-${item.id}`}
                  value={item.qr}
                  size={150}
                  onClick={() => handleViewQR(item)}
                  className="cursor-pointer"
                />
              </div>
              <div className="mt-4 text-center">
                <p className="text-gray-700 dark:text-gray-300">Type: {item.type}</p>
                <p className="text-gray-700 dark:text-gray-300">Date: {item.date}</p>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-red-500 hover:underline mt-2"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}

          {filteredQrData.length === 0 && (
            <div className="text-center mt-6 text-gray-600 dark:text-gray-400">No QR codes found for the selected type.</div>
          )}
        </div>
      )}

      {viewedQR && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center">
          <div className="bg-gray-200 dark:bg-gray-800 text-black dark:text-white p-8 rounded-lg shadow-lg relative">
            <h2 className="text-2xl mb-4">{viewMode === "grid" ? "QR Code Content" : "QR Code"}</h2>

            {viewMode === "table" ? (
              <QRCodeSVG id={`qrCode-${viewedQR.id}`} value={viewedQR.qr} size={256} />
            ) : (
              <div className="mt-4">
                <p>
                  <strong>Type:</strong> {viewedQR.type}
                </p>
                <p>
                  <strong>Date:</strong> {viewedQR.date}
                </p>
                {viewedQR.type === "text" && <p><strong>Text Content:</strong> {viewedQR.qr}</p>}
                {viewedQR.type === "image" && <img src={viewedQR.qr} alt="QR Code Content" className="mx-auto" />}
                {viewedQR.type === "video" && (
                  <video controls className="mx-auto">
                    <source src={viewedQR.qr} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>
            )}

            <div className="mt-4 flex justify-between">
              {viewMode === "table" && (
                <button
                  onClick={() => handleDownloadQR(viewedQR.id)}
                  className="px-4 py-2 bg-green-600 rounded-md hover:bg-green-700"
                >
                  Download QR
                </button>
              )}
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 bg-red-600 rounded-md hover:bg-red-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center">
          <div className="bg-gray-200 dark:bg-gray-800 text-black dark:text-white p-8 rounded-lg shadow-lg relative">
            <h2 className="text-2xl mb-4">Generate QR Code</h2>

            <div className="mb-4">
              <label className="block mb-2">Choose QR type:</label>
              <select className="text-gray-900 px-3 py-2 rounded-md w-full" value={selected} onChange={handleChange}>
                <option value="text">Text</option>
                <option value="image">Image</option>
                <option value="video">Video</option>
              </select>
            </div>

            {selected === "text" ? (
              <input
                type="text"
                placeholder="Enter text for QR"
                className="w-full px-4 py-2 mb-4 text-gray-900 rounded-md"
                value={qrContent}
                onChange={(e) => setQrContent(e.target.value)}
              />
            ) : (
              <input id="mediaFile" type="file" accept={selected === "image" ? "image/*" : "video/*"} className="mb-4" />
            )}

            {loading && <p className="text-center text-yellow-500">Uploading media...</p>}

            <div className="flex justify-between">
              <button onClick={handleGenerateButtonClick} className="px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-700">
                Generate QR
              </button>

              <button onClick={handleCloseModal} className="px-4 py-2 bg-red-600 rounded-md hover:bg-red-700">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Main;
