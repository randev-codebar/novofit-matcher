"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CustomerRecord, ProcessedData } from "@/lib/types";
import { useMatchStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { matchCustomers } from "@/lib/matching";

export default function ResultsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState<string>("review");
  const [selectedRecords, setSelectedRecords] = useState<CustomerRecord[]>([]);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [matches, setMatches] = useState<ProcessedData["matches"]>({
    review: [],
    requiresAction: [],
    unmatched: [],
  });
  const [loading, setLoading] = useState(true);
  const data = useMatchStore((state) => state.data);
  const { confirmMatch, rejectMatch, bulkConfirm, bulkReject, exportResults } =
    useMatchStore();
  const [excelBData, setExcelBData] = useState<CustomerRecord[]>([]);

  const handleClearData = async () => {
    try {
      const response = await fetch("/api/clearDatabase", {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to clear database");
      }

      alert("Database cleared successfully");
      router.push("/");
    } catch (error) {
      console.error(error);
      alert("Error clearing database");
    }
  };

  const renderPagination = (totalItems: number) => {
    const totalPages = Math.ceil(totalItems / pageSize);
    return (
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Showing {Math.min(pageSize * (currentPage - 1) + 1, totalItems)} to{" "}
            {Math.min(pageSize * currentPage, totalItems)} of {totalItems}{" "}
            entries
          </span>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => {
              setPageSize(Number(value));
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
            }
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    );
  };

  const renderMatchPair = (
    recordA: CustomerRecord,
    recordB: CustomerRecord,
    isSelected: boolean,
    onSelect: (record: CustomerRecord) => void
  ) => (
    <Card className="p-4 mb-4">
      <div className="flex items-start gap-4">
        <div className="flex items-start">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onSelect(recordA)}
            className="mt-2"
          />
        </div>
        <div className="flex-1 flex flex-col">
          <div className="flex items-stretch gap-6">
            <div className="flex-1 min-w-[300px] bg-blue-50 dark:bg-blue-950 p-3 rounded-lg border border-blue-100 dark:border-blue-900">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-blue-700 dark:text-blue-300">
                  FitnessEMS Record
                </h3>
              </div>
              <p className="font-semibold text-lg mb-1">
                {recordA.customerName}
              </p>
              <p className="text-sm text-muted-foreground mb-2">
                ID: {recordA.locationId}
              </p>
              {recordA.locationId && (
                <a
                  href={`https://connect.fitnessems.com/service-providers/add-customer/62/${recordB.locationId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                >
                  View in FitnessEMS
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              )}
            </div>

            <div className="flex items-center">
              <svg
                className="w-6 h-6 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </div>

            <div className="flex-1 min-w-[300px] bg-green-50 dark:bg-green-950 p-3 rounded-lg border border-green-100 dark:border-green-900">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-green-700 dark:text-green-300">
                  NetSuite Record
                </h3>
              </div>
              <p className="font-semibold text-lg mb-1">{recordB.name}</p>
              <p className="text-sm text-muted-foreground">
                ID: {recordB.internalId || ""}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                size="default"
                className="w-[100px] text-green-600 hover:bg-green-50 dark:hover:bg-green-950 border-green-200"
                onClick={() => confirmMatch(recordA, recordB)}
              >
                <CheckCircle2 className="h-5 w-5 mr-2" />
                Accept
              </Button>
              <Button
                variant="outline"
                size="default"
                className="w-[100px] text-red-600 hover:bg-red-50 dark:hover:bg-red-950 border-red-200"
                onClick={() => rejectMatch(recordA)}
              >
                <XCircle className="h-5 w-5 mr-2" />
                Reject
              </Button>
            </div>
          </div>
          {recordA.matchConfidence && (
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onSelect(recordA)}
            >
              <p className="text-sm text-muted-foreground mt-2">
                Match Confidence: {recordA.matchConfidence.toFixed(1)}%
              </p>
            </Checkbox>
          )}
        </div>
      </div>
    </Card>
  );

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/getData?page=${currentPage}&limit=${pageSize}`
        );

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const { items, total, excelB } = await response.json();

        // Set ExcelB data only once
        if (excelBData.length === 0) {
          setExcelBData(excelB);
        }

        // Run matching for current batch
        const batchResults = matchCustomers(items, excelBData);

        // Replace matches instead of accumulating them
        setMatches({
          review: batchResults.review,
          requiresAction: batchResults.requiresAction,
          unmatched: batchResults.unmatched,
        });

        setTotalItems(total);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage, pageSize, excelBData]); // Add pageSize to dependencies

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Match Results</h1>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search customers..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={exportResults}>Export Results</Button>
          <Button variant="destructive" onClick={handleClearData}>
            Clear Data
          </Button>
        </div>
      </div>

      <div className="mb-8">{renderPagination(totalItems)}</div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          {selectedRecords.length > 0 && (
            <div className="bg-muted p-4 rounded-lg mb-4 flex items-center justify-between">
              <p className="text-sm">
                {selectedRecords.length} records selected
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const matches = selectedRecords.map((record) => {
                      const match =
                        data?.matches.review.find(
                          ([a]) => a.id === record.id
                        )?.[1] ||
                        data?.matches.requiresAction.find(
                          ([a]) => a.id === record.id
                        )?.[1];
                      return [record, match!] as [
                        CustomerRecord,
                        CustomerRecord
                      ];
                    });
                    bulkConfirm(matches);
                    setSelectedRecords([]);
                  }}
                >
                  Confirm Selected
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    bulkReject(selectedRecords);
                    setSelectedRecords([]);
                  }}
                >
                  Reject Selected
                </Button>
              </div>
            </div>
          )}

          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-3 mb-8 bg-muted/50 p-1">
              <TabsTrigger
                value="review"
                className="flex gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-secondary data-[state=active]:text-primary data-[state=active]:shadow-sm"
              >
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Review
                <span className="ml-2 bg-primary/10 px-2 py-0.5 rounded-full text-xs">
                  {matches.review.length}
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="requires_action"
                className="flex gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-secondary data-[state=active]:text-primary data-[state=active]:shadow-sm"
              >
                <AlertCircle className="h-4 w-4 text-orange-500" />
                Requires Action
                {matches.requiresAction.length && (
                  <span className="ml-2 bg-primary/10 px-2 py-0.5 rounded-full text-xs">
                    {matches.requiresAction.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="unmatched"
                className="flex gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-secondary data-[state=active]:text-primary data-[state=active]:shadow-sm"
              >
                <XCircle className="h-4 w-4 text-red-500" />
                Unmatched
                {matches.unmatched.length && (
                  <span className="ml-2 bg-primary/10 px-2 py-0.5 rounded-full text-xs">
                    {matches.unmatched.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="review" className="space-y-4">
              <div>
                <h2>Review ({matches.review.length})</h2>
                {matches.review.length > 0 ? (
                  matches.review.map(([recordA, recordB], index) => (
                    <div key={`match-${recordA.id}-${recordB.id}-${index}`}>
                      {renderMatchPair(
                        recordA,
                        recordB,
                        selectedRecords.includes(recordA),
                        (record) => {
                          setSelectedRecords((prev) =>
                            prev.includes(record)
                              ? prev.filter((r) => r.id !== record.id)
                              : [...prev, record]
                          );
                        }
                      )}
                    </div>
                  ))
                ) : (
                  <p>No review matches found.</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="requires_action" className="space-y-4">
              <div>
                <h2>Requires Action ({matches.requiresAction.length})</h2>
                {matches.requiresAction.length > 0 ? (
                  matches.requiresAction.map(([recordA, recordB], index) => (
                    <div key={`action-${recordA.id}-${recordB.id}-${index}`}>
                      {renderMatchPair(
                        recordA,
                        recordB,
                        selectedRecords.includes(recordA),
                        (record) => {
                          setSelectedRecords((prev) =>
                            prev.includes(record)
                              ? prev.filter((r) => r.id !== record.id)
                              : [...prev, record]
                          );
                        }
                      )}
                    </div>
                  ))
                ) : (
                  <p>No records require action.</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="unmatched" className="space-y-4">
              <div>
                <h2>Unmatched ({matches.unmatched.length})</h2>
                {matches && matches.unmatched.length > 0 ? (
                  matches.unmatched.map((record, index) => (
                    <div key={`unmatched-${record.customerId}-${index}`}>
                      <Card className="p-4">
                        <div className="flex items-center gap-4">
                          <Checkbox
                            checked={selectedRecords.includes(record)}
                            onCheckedChange={() => {
                              setSelectedRecords((prev) =>
                                prev.includes(record)
                                  ? prev.filter((r) => r.id !== record.id)
                                  : [...prev, record]
                              );
                            }}
                            className="mr-2"
                          />
                          <div>
                            <h3 className="font-semibold">
                              {record.customerName}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              ID: {record.locationId}
                            </p>
                          </div>
                        </div>
                      </Card>
                    </div>
                  ))
                ) : (
                  <p>No unmatched records found.</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
