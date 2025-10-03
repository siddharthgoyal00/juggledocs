'use client'
import { Upload } from 'lucide-react';
import * as React from 'react'

const FileUploadComponent = ()=>{
    const handleFileUploadButtonClick = async (e:React.ChangeEvent<HTMLInputElement>)=>{
       const file = e.target.files?.[0]; 
       if (file ){
          // need to send the file to the backend 
          const formData = new FormData() 
          formData.append('pdf', file);
          await fetch('http://localhost:8000/upload/pdf', {
            method : 'POST',
            body: formData
          })
          console.log('file uploaded')
       }
    } 

    return (
        <div className="bg-slate-900 text-white shadow-2xl flex justify-center rounded-lg border-2 items-center p-4">
      {/* Label triggers hidden input automatically */}
      <label className="flex justify-center items-center flex-col cursor-pointer">
        <h3>Upload PDF File</h3>
        <Upload />
        <input
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handleFileUploadButtonClick}
        />
      </label>
    </div>
    )
}; 

export default FileUploadComponent