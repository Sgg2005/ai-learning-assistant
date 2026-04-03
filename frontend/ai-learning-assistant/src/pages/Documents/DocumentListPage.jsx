import React, { useState, useEffect } from "react";
import { Plus, Upload, FileText, X, Trash2, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";

import documentService from "../../services/documentServices";
import Spinner from "../../components/common/Spinner";
import DocumentCard from "../../components/documents/DocumentCard";

const DocumentListPage = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  // state for upload modal
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploading, setUploading] = useState(false);

  // state for delete confirmation modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);

  const fetchDocuments = async () => {
    try {
      const data = await documentService.getDocuments();
      console.log("Documents data:", data);
      setDocuments(data || []);
    } catch (error) {
      toast.error("Failed to fetch documents.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFile(file);
      setUploadTitle(file.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!uploadFile || !uploadTitle.trim()) {
      toast.error("Please select a file and enter a title.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", uploadFile);
    formData.append("title", uploadTitle.trim());

    try {
      const res = await documentService.uploadDocument(formData);
      console.log("UPLOAD_RES", res);
      toast.success("Document uploaded successfully.");

      setIsUploadModalOpen(false);
      setUploadFile(null);
      setUploadTitle("");

      setLoading(true);
      await fetchDocuments();
    } catch (error) {
      console.log("UPLOAD_ERR_FULL", error);
      toast.error(error?.error || error?.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const openDeleteModal = (doc) => {
    setSelectedDoc(doc);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    if (deleting) return;
    setIsDeleteModalOpen(false);
    setSelectedDoc(null);
  };

  const handleConfirmDelete = async () => {
    if (!selectedDoc?._id) return;

    setDeleting(true);
    try {
      await documentService.deleteDocument(selectedDoc._id);
      toast.success(`'${selectedDoc.title}' deleted.`);

      setDocuments((prev) => prev.filter((d) => d._id !== selectedDoc._id));
      setIsDeleteModalOpen(false);
      setSelectedDoc(null);
    } catch (error) {
      toast.error(error?.error || error?.message || "Failed to delete document.");
    } finally {
      setDeleting(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-20">
          <Spinner />
        </div>
      );
    }

    if (documents.length === 0) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-orange-50 border border-orange-100 mb-4">
              <FileText className="w-8 h-8 text-orange-400" strokeWidth={1.5} />
            </div>
            <h3 className="text-slate-900 font-semibold text-lg mb-2">No Documents Yet</h3>
            <p className="text-slate-500 text-sm mb-6">
              Get started by uploading your first document to begin learning.
            </p>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/25 transition-all duration-200 mx-auto"
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              Upload Document
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {documents.map((doc) => (
          <DocumentCard
            key={doc._id}
            document={doc}
            onDelete={openDeleteModal}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-30" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">My Documents</h1>
            <p className="text-slate-500 text-sm mt-1">
              Manage and organize your learning materials in one place.
            </p>
          </div>

          {documents.length > 0 && (
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/25 transition-all duration-200"
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              Upload Document
            </button>
          )}
        </div>

        {renderContent()}
      </div>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-8 relative">
            <button
              onClick={() => setIsUploadModalOpen(false)}
              disabled={uploading}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors duration-200 disabled:opacity-60"
            >
              <X className="w-5 h-5" strokeWidth={2} />
            </button>

            <div className="mb-6">
              <h2 className="text-lg font-semibold text-slate-900">Upload Document</h2>
              <p className="text-slate-500 text-sm mt-1">Select File you want to add to your library</p>
            </div>

            <form onSubmit={handleUpload} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">
                  Document Title
                </label>
                <input
                  type="text"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  required
                  className="w-full h-12 px-4 border-2 border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 placeholder-slate-400 text-sm font-medium transition-all duration-200 focus:outline-none focus:border-orange-400 focus:bg-white"
                  placeholder="e.g., React Interview Prep"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">
                  PDF File
                </label>
                <div className="relative">
                  <input
                    id="file-upload"
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    onChange={handleFileChange}
                    accept=".pdf"
                  />
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-orange-400 transition-colors duration-200">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-orange-50 mb-3">
                      <Upload className="w-5 h-5 text-orange-400" strokeWidth={2} />
                    </div>
                    <p className="text-sm text-slate-500">
                      {uploadFile ? (
                        <span className="text-orange-500 font-medium">{uploadFile.name}</span>
                      ) : (
                        <>
                          <span className="text-orange-500 font-semibold">Click to Upload</span> or drag and drop
                        </>
                      )}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">PDF up to 10MB</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  disabled={uploading}
                  className="flex-1 h-11 border-2 border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors duration-200 disabled:opacity-60"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 h-11 bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/25 transition-all duration-200 disabled:opacity-60"
                >
                  {uploading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Uploading...
                    </span>
                  ) : (
                    "Upload"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-8 relative">
              {/* Close */}
              <button
                onClick={() => !deleting && setIsDeleteModalOpen(false)}
                disabled={deleting}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors duration-200 disabled:opacity-60"
              >
                <X className="w-5 h-5" strokeWidth={2} />
              </button>

              {/* Icon */}
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-50 mb-5">
                <Trash2 className="w-6 h-6 text-red-500" strokeWidth={2} />
              </div>

              {/* Title + message */}
              <h2 className="text-3xl font-semibold text-slate-900 tracking-tight mb-4">
                Confirm Deletion
              </h2>
              <p className="text-slate-600 text-base leading-relaxed mb-8">
                Are you sure you want to delete the document:{" "}
                <span className="font-semibold text-slate-900">{selectedDoc?.title}</span>?{" "}
                This action cannot be undone.
              </p>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  disabled={deleting}
                  className="flex-1 h-12 border-2 border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors duration-200 disabled:opacity-60"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={deleting}
                  className="flex-1 h-12 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl shadow-lg shadow-red-500/25 transition-all duration-200 disabled:opacity-60"
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
         )}
    </div>
  );
};

export default DocumentListPage;