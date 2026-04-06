import { useState, useEffect, useCallback, useRef } from "react"; // Added useRef
import * as adminApi from "../api/adminApi";
import { getFolderImages, getDownloadUrl } from "../api/userApi";

const AdminPage = ({ token, onLogout }) => {
  const [folders, setFolders] = useState([]);
  const [displayUrls, setDisplayUrls] = useState({});
  const [loading, setLoading] = useState(false);
  const [uploadingFolders, setUploadingFolders] = useState({});
  
  const [newFolder, setNewFolder] = useState({ name: "", pass: "" });
  const [deletingId, setDeletingId] = useState(null);
  const [updatingPass, setUpdatingPass] = useState({ id: null, value: "" });
  const [stagedFiles, setStagedFiles] = useState({});

  // THE FIX: Create a reference to the file input elements
  const fileInputRef = useRef({});

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const folderData = await adminApi.getFolders(token);
      const foldersWithImages = await Promise.all(
        folderData.map(async (f) => {
          const imgs = await getFolderImages(f.id);
          const urlEntries = await Promise.all(
            imgs.map(async (img) => {
              try {
                const { url } = await getDownloadUrl(img.id);
                return [img.id, url];
              } catch { return [img.id, null]; }
            })
          );
          setDisplayUrls(prev => ({ ...prev, ...Object.fromEntries(urlEntries) }));
          return { ...f, images: imgs };
        })
      );
      setFolders(foldersWithImages);
    } catch (err) {
      alert("Failed to sync with server.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchAllData(); }, [fetchAllData]);

  const handleUpload = async (folderId) => {
    const files = stagedFiles[folderId];
    // Safety check: don't proceed if no files
    if (!files || files.length === 0) return;

    setUploadingFolders(prev => ({ ...prev, [folderId]: true }));
    try {
      await adminApi.uploadImages(token, folderId, files);
      
      // THE FIX: 1. Clear the React State
      setStagedFiles(prev => ({ ...prev, [folderId]: null }));
      
      // THE FIX: 2. Reset the actual HTML input to show "No file chosen"
      if (fileInputRef.current[folderId]) {
        fileInputRef.current[folderId].value = "";
      }

      await fetchAllData();
    } catch (err) {
      alert("Upload failed.");
    } finally {
      setUploadingFolders(prev => ({ ...prev, [folderId]: false }));
    }
  };

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    try {
      await adminApi.createFolder(token, newFolder.name, newFolder.pass);
      setNewFolder({ name: "", pass: "" });
      await fetchAllData();
    } catch (err) { alert("Could not create folder."); }
  };

  const handleUpdatePassword = async (folderId, newPassword) => {
    try {
      await adminApi.updateFolderPassword(token, folderId, newPassword);
      setUpdatingPass({ id: null, value: "" });
    } catch (err) { alert("Update failed."); }
  };

  const handleDeleteFolder = async (folderId) => {
    try {
      await adminApi.deleteFolder(token, folderId);
      setDeletingId(null);
      await fetchAllData();
    } catch (err) { alert("Delete failed."); }
  };

  const handleDeleteImage = async (imageId) => {
    try {
      await adminApi.deleteImage(token, imageId);
      await fetchAllData();
    } catch (err) { alert("Delete failed."); }
  };

  // Combined all cursor and transition logic into one base class
  const btnBase = "transition-all active:scale-95 duration-150 cursor-pointer disabled:cursor-not-allowed";

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">StudioVault <span className="text-blue-600">Admin</span></h1>
          <button onClick={onLogout} className={`${btnBase} text-sm font-bold text-slate-400 hover:text-slate-900 uppercase tracking-widest`}>Sign Out</button>
        </header>

        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-10">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">Create New Vault</h2>
          <form onSubmit={handleCreateFolder} className="flex flex-wrap gap-4">
            <input className="flex-1 min-w-[200px] p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="Folder Name" value={newFolder.name} onChange={e => setNewFolder({...newFolder, name: e.target.value})} required />
            <input className="flex-1 min-w-[200px] p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" type="password" placeholder="Set Password" value={newFolder.pass} onChange={e => setNewFolder({...newFolder, pass: e.target.value})} required />
            <button type="submit" className={`${btnBase} bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-600`}>Create Vault</button>
          </form>
        </section>

        {loading && folders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-600 mb-4"></div>
            <p className="text-slate-500 font-medium">Syncing files...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {folders.map(folder => (
              <div key={folder.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex flex-wrap justify-between items-center gap-4 bg-slate-50/30">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">{folder.name}</h3>
                    <code className="text-[10px] bg-slate-200 px-2 py-0.5 rounded text-slate-600 font-bold uppercase tracking-tighter">ID: {folder.id}</code>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {updatingPass.id === folder.id ? (
                      <div className="flex gap-2">
                        <input autoFocus className="p-1.5 border rounded-lg text-sm outline-none" placeholder="New Password" value={updatingPass.value} onChange={e => setUpdatingPass({...updatingPass, value: e.target.value})} />
                        <button onClick={() => handleUpdatePassword(folder.id, updatingPass.value)} className={`${btnBase} bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold`}>Save</button>
                        <button onClick={() => setUpdatingPass({ id: null, value: "" })} className="text-slate-400 text-xs font-bold cursor-pointer">Cancel</button>
                      </div>
                    ) : (
                      <button onClick={() => setUpdatingPass({ id: folder.id, value: "" })} className={`${btnBase} text-xs font-bold text-slate-500 hover:text-blue-600`}>Change Password</button>
                    )}

                    {deletingId === folder.id ? (
                      <div className="flex items-center gap-2 bg-red-50 p-1.5 rounded-lg border border-red-100">
                        <button onClick={() => handleDeleteFolder(folder.id)} className={`${btnBase} bg-red-600 text-white px-3 py-1 rounded-md text-xs font-bold`}>Confirm Delete</button>
                        <button onClick={() => setDeletingId(null)} className="text-slate-400 text-xs font-bold px-2 cursor-pointer">Cancel</button>
                      </div>
                    ) : (
                      <button onClick={() => setDeletingId(folder.id)} className={`${btnBase} text-xs font-bold text-red-400 hover:text-red-600`}>Delete Folder</button>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-4 mb-8 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <input 
                      type="file" 
                      multiple 
                      // THE FIX: Assign this specific input to the ref map
                      ref={el => fileInputRef.current[folder.id] = el}
                      onChange={(e) => setStagedFiles(prev => ({ ...prev, [folder.id]: e.target.files }))} 
                      className="text-xs text-slate-500 cursor-pointer file:cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200" 
                    />
                    
                    {/* THE FIX: Check for .length > 0 so the (0) button never appears */}
                    {stagedFiles[folder.id] && stagedFiles[folder.id].length > 0 && (
                      <button 
                        disabled={uploadingFolders[folder.id]}
                        onClick={() => handleUpload(folder.id)} 
                        className={`${btnBase} bg-blue-600 text-white px-6 py-2 rounded-full text-xs font-bold shadow-lg disabled:bg-slate-400`}
                      >
                        {uploadingFolders[folder.id] ? "Uploading..." : `Confirm Upload (${stagedFiles[folder.id].length})`}
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-3">
                    {folder.images?.map(img => (
                      <div key={img.id} className="relative aspect-square bg-slate-100 border border-slate-200 rounded-lg overflow-hidden group">
                        {displayUrls[img.id] ? (
                          <img src={displayUrls[img.id]} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-200 animate-pulse" />
                        )}
                        <button onClick={() => handleDeleteImage(img.id)} className={`${btnBase} absolute inset-0 bg-red-500/90 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center font-bold text-[10px]`}>Delete</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;