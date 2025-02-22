"use client";

import { useState } from "react";
import { Upload, FileSpreadsheet, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation";
import { useMatchStore } from "@/lib/store";
import { processFiles } from "@/lib/process-files";

export function FileUpload() {
  const router = useRouter();
  const setData = useMatchStore((state) => state.setData);
  const [files, setFiles] = useState<{
    excelA?: File;
    excelB?: File;
  }>({});
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "excelA" | "excelB"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith(".xlsx")) {
        setError("Please upload an Excel (.xlsx) file");
        return;
      }
      setFiles((prev) => ({ ...prev, [type]: file }));
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!files.excelA || !files.excelB) {
      setError("Please upload both Excel files");
      return;
    }

    setProcessing(true);
    setProgress(0);

    try {
      const data = await processFiles(files.excelA, files.excelB, (progress) =>
        setProgress(progress)
      );

      setData(data);
      router.push("/results");
    } catch (err) {
      console.error("Upload error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Error processing files. Please try again."
      );
    } finally {
      setProcessing(false);
      setProgress(100);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <span className="ml-2">{error}</span>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <div className="flex flex-col items-center gap-4">
            <FileSpreadsheet className="h-12 w-12 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Old System (Excel A)</h2>
            <input
              type="file"
              accept=".xlsx"
              onChange={(e) => handleFileChange(e, "excelA")}
              className="hidden"
              id="excelA"
            />
            <Button
              variant="outline"
              className="w-full"
              onClick={() => document.getElementById("excelA")?.click()}
            >
              {files.excelA ? files.excelA.name : "Choose File"}
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex flex-col items-center gap-4">
            <FileSpreadsheet className="h-12 w-12 text-muted-foreground" />
            <h2 className="text-lg font-semibold">NetSuite (Excel B)</h2>
            <input
              type="file"
              accept=".xlsx"
              onChange={(e) => handleFileChange(e, "excelB")}
              className="hidden"
              id="excelB"
            />
            <Button
              variant="outline"
              className="w-full"
              onClick={() => document.getElementById("excelB")?.click()}
            >
              {files.excelB ? files.excelB.name : "Choose File"}
            </Button>
          </div>
        </Card>
      </div>

      {(files.excelA || files.excelB) && (
        <div className="flex flex-col gap-4">
          {processing && (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-sm text-muted-foreground text-center">
                Processing files... {progress}%
              </p>
            </div>
          )}

          <Button
            className="w-full"
            size="lg"
            onClick={handleUpload}
            disabled={!files.excelA || !files.excelB || processing}
          >
            <Upload className="mr-2 h-4 w-4" />
            Process Files
          </Button>
        </div>
      )}
    </div>
  );
}
