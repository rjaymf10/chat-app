import React, { useState } from 'react';

const FileUploader = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadStatus('Please select a file first.');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      setUploadStatus('Uploading...');
      const response = await fetch('http://localhost:3000/api/upload', {
        method: 'POST',
        body: formData,
        // You might need to add headers here depending on your API
      });

      if (response.ok) {
        setUploadStatus('Upload successful!');
        // Handle successful upload (e.g., display a success message)
      } else {
        setUploadStatus('Upload failed.');
        // Handle failed upload (e.g., display an error message)
      }
    } catch (error) {
      setUploadStatus(`Error: ${error.message}`);
      // Handle network errors or other exceptions
    }
  };

  return (
    <div>
      <h3>Upload File</h3>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={!selectedFile || uploadStatus === 'Uploading...'}>
        Upload
      </button>
      {uploadStatus && <p>{uploadStatus}</p>}
      {/* You can add progress bar here using uploadProgress state */}
    </div>
  );
};

export default FileUploader;