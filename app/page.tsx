"use client";

import { useState, useEffect } from "react";
import { FileUpload } from "@/components/file-upload";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface DashboardStats {
  totalExcelA: number;
  distinctCustomers: number;
  totalExcelB: number;
  totalReviewed: number;
}

export default function Home() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/getDashboardStats");
      if (!response.ok) throw new Error("Failed to fetch stats");
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleClearData = async () => {
    try {
      const response = await fetch("/api/clearDatabase", {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to clear database");
      }

      // Refresh stats after clearing
      await fetchStats();
    } catch (error) {
      console.error("Error clearing database:", error);
      alert("Failed to clear database");
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted">
      <div className="container mx-auto py-12 px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-green-600">
            Customer Data Matching
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Seamlessly match and merge customer records between FitnessEMS and
            NetSuite systems. Upload your data files to get started.
          </p>
        </div>

        {stats && stats.totalExcelA > 0 ? (
          <div className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6 border-2 border-blue-100 dark:border-blue-900 hover:border-blue-200 dark:hover:border-blue-800 transition-colors">
                <div className="flex flex-col items-center text-center">
                  <div className="bg-blue-50 dark:bg-blue-900/50 p-3 rounded-full mb-4">
                    <svg
                      className="w-6 h-6 text-blue-600 dark:text-blue-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">
                    Records from Fitness EMS
                  </h3>
                  <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                    {stats.totalExcelA}
                  </p>
                </div>
              </Card>
              <Card className="p-6 border-2 border-green-100 dark:border-green-900 hover:border-green-200 dark:hover:border-green-800 transition-colors">
                <div className="flex flex-col items-center text-center">
                  <div className="bg-green-50 dark:bg-green-900/50 p-3 rounded-full mb-4">
                    <svg
                      className="w-6 h-6 text-green-600 dark:text-green-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">
                    Unique Customers
                  </h3>
                  <p className="text-4xl font-bold text-green-600 dark:text-green-400">
                    {stats.distinctCustomers}
                  </p>
                </div>
              </Card>
              <Card className="p-6 border-2 border-purple-100 dark:border-purple-900 hover:border-purple-200 dark:hover:border-purple-800 transition-colors">
                <div className="flex flex-col items-center text-center">
                  <div className="bg-purple-50 dark:bg-purple-900/50 p-3 rounded-full mb-4">
                    <svg
                      className="w-6 h-6 text-purple-600 dark:text-purple-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
                      />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">
                    Records from NetSuite
                  </h3>
                  <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">
                    {stats.totalExcelB}
                  </p>
                </div>
              </Card>
              <Card className="p-6 border-2 border-orange-100 dark:border-orange-900 hover:border-orange-200 dark:hover:border-orange-800 transition-colors">
                <div className="flex flex-col items-center text-center">
                  <div className="bg-orange-50 dark:bg-orange-900/50 p-3 rounded-full mb-4">
                    <svg
                      className="w-6 h-6 text-orange-600 dark:text-orange-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                      />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">
                    Records Reviewed
                  </h3>
                  <p className="text-4xl font-bold text-orange-600 dark:text-orange-400">
                    {stats.totalReviewed}
                  </p>
                </div>
              </Card>
            </div>

            <div className="flex justify-between items-center max-w-4xl mx-auto">
              <Button
                variant="outline"
                onClick={() => (window.location.href = "/results")}
                className="text-lg px-8 py-6 h-auto hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                Continue Review
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="text-lg px-8 py-6 h-auto hover:bg-red-600/90"
                  >
                    Clear Data
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will delete all the records from the database
                      including the records that you have reviewed.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClearData}>
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <FileUpload />
          </div>
        )}
      </div>
    </main>
  );
}
