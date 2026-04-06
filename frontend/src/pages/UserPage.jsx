import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { unlockFolder, getFolderImages, getDownloadUrl } from "../api/userApi";
import PasswordPrompt from "../components/PasswordPrompt";

const UserPage = () => {
  const [folderId, setFolderId] = useState(null);
  const [folderName, setFolderName] = useState(null);
  const [images, setImages] = useState([]);
  const [displayUrls, setDisplayUrls] = useState({}); // Stores { imageId: signedUrl }
  const [loadingImages, setLoadingImages] = useState(false);

  const handleUnlock = async (password) => {
    const data = await unlockFolder(password);
    setFolderId(data.folderId);
    setFolderName(data.folderName);
  };

  useEffect(() => {
    if (!folderId) return;

    const fetchImagesAndUrls = async () => {
      setLoadingImages(true);
      try {
        // 1. Get metadata for all images
        const imageData = await getFolderImages(folderId);
        setImages(imageData);

        // 2. Fetch signed URLs for EVERY image to display them
        // We run these in parallel for speed
        const urlEntries = await Promise.all(
          imageData.map(async (img) => {
            const { url } = await getDownloadUrl(img.id);
            return [img.id, url];
          })
        );
        
        setDisplayUrls(Object.fromEntries(urlEntries));
      } catch (err) {
        console.error("Failed to load gallery", err);
      } finally {
        setLoadingImages(false);
      }
    };

    fetchImagesAndUrls();
  }, [folderId]);

  const handleDownload = async (imageId, fileName) => {
    try {
      // 1. Get a fresh signed URL (for the highest speed/reliability)
      const { url } = await getDownloadUrl(imageId);
      
      // 2. ISSUE 2 FIX: Fetch the file as a Blob to bypass cross-origin restrictions
      const response = await fetch(url);
      const blob = await response.blob();
      
      // 3. Create a local temporary URL for the browser
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = blobUrl;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      
      // 4. Cleanup memory
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      alert("Download failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <main className="flex-grow flex flex-col">
        {!folderId ? (
          <div className="flex-grow flex flex-col items-center justify-center p-4 bg-slate-50">
            <h1 className="text-4xl font-black text-slate-900 mb-8 tracking-tighter">StudioVault</h1>
            <PasswordPrompt onUnlock={handleUnlock} />
          </div>
        ) : (
          <div className="p-6 md:p-12">
            <header className="max-w-7xl mx-auto mb-12 flex justify-between items-end border-b border-slate-100 pb-8">
              <div>
                <p className="text-blue-600 font-bold uppercase tracking-widest text-xs mb-1">Secure Client Gallery</p>
                <h1 className="text-4xl font-extrabold text-slate-900">{folderName}</h1>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
              >
                Close Vault
              </button>
            </header>

            {loadingImages ? (
              <div className="flex flex-col items-center justify-center mt-32">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-600 mb-4"></div>
                <p className="text-slate-500 font-medium">Decrypting your photos...</p>
              </div>
            ) : (
              <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {images.map((img) => (
                  <div key={img.id} className="group relative bg-slate-100 rounded-2xl overflow-hidden shadow-sm transition-all hover:shadow-xl">
                    {/* ISSUE 1 FIX: Use the signed URL from our displayUrls state */}
                    {displayUrls[img.id] ? (
                      <img 
                        src={displayUrls[img.id]} 
                        alt={img.fileName} 
                        className="w-full h-80 object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-80 bg-slate-200 animate-pulse flex items-center justify-center">
                        <span className="text-slate-400 text-xs">Loading...</span>
                      </div>
                    )}
                    
                    {/* Overlay with filename and download button */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                      <p className="text-white text-sm font-medium mb-3 truncate">{img.fileName}</p>
                      <button
                        onClick={() => handleDownload(img.id, img.fileName)}
                        className="w-full bg-white text-slate-900 py-3 rounded-xl font-bold text-sm hover:bg-blue-600 hover:text-white transition-colors cursor-pointer"
                      >
                        Download High-Res
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loadingImages && images.length === 0 && (
              <div className="text-center py-40 text-slate-400 italic">No images found in this vault.</div>
            )}
          </div>
        )}
      </main>

      {!folderId && (
        <footer className="p-8 border-t border-slate-100 bg-slate-50">
          <div className="max-w-7xl mx-auto flex justify-between items-center text-slate-400">
            <p className="text-xs font-medium">© 2026 StudioVault Photography</p>
            <Link to="/admin" className="text-xs font-bold uppercase tracking-widest hover:text-blue-600 transition-colors">
              Admin Login
            </Link>
          </div>
        </footer>
      )}
    </div>
  );
};

export default UserPage;