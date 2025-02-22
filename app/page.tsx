"use client";

import { FileUpload } from "@/components/file-upload";
import React from "react";
import { CustomerRecord } from "@/lib/types";

const HomePage = () => {
  const handleClearDatabase = async () => {
    try {
      const response = await fetch("/api/clearDatabase", {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to clear database");
      }

      alert("Database cleared successfully");
    } catch (error) {
      console.error(error);
      alert("Error clearing database");
    }
  };

  const handleUploadData = async (
    excelA: CustomerRecord[],
    excelB: CustomerRecord[]
  ) => {
    try {
      const response = await fetch("/api/uploadData", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ customersA: excelA, customersB: excelB }),
      });

      if (!response.ok) {
        throw new Error("Failed to upload data");
      }

      alert("Data uploaded successfully");
    } catch (error) {
      console.error(error);
      alert("Error uploading data");
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold mb-8 text-center">
        Customer Name Matching
      </h1>
      <div className="max-w-3xl mx-auto">
        <FileUpload />
      </div>
      <button onClick={handleClearDatabase}>Start Again</button>
    </div>
  );
};

export default HomePage;
