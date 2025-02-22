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
import { PrismaClient } from "@prisma/client";
import { matchCustomers } from "@/lib/matching";

const ITEMS_PER_PAGE = 100;

export default function ResultsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("review");
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
  const [excelAData, setExcelAData] = useState<CustomerRecord[]>([]);
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

  // Pagination logic
  const getPaginatedData = (data: any[]) => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return data.slice(startIndex, endIndex);
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
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-4">
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onSelect(recordA)}
              className="mr-4"
            />
            <div className="grid grid-cols-2 gap-4 flex-1">
              <div>
                <h3 className="font-semibold">Old System Record</h3>
                <p className="text-sm text-muted-foreground">
                  ID: {recordA.id}
                </p>
                <p>{recordA.customerName}</p>
                {recordA.locationId && (
                  <a
                    href={`https://connect.fitnessems.com/service-providers/add-customer/62/${recordB.locationId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    View in FitnessEMS
                  </a>
                )}
              </div>
              <div>
                <h3 className="font-semibold">NetSuite Record</h3>
                <p className="text-sm text-muted-foreground">
                  ID: {recordB.id}
                </p>
                <p>{recordB.name}</p>
              </div>
            </div>
          </div>
          {recordA.matchConfidence && (
            <p className="text-sm text-muted-foreground mt-2">
              Match Confidence: {recordA.matchConfidence.toFixed(1)}%
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-green-600"
            onClick={() => confirmMatch(recordA, recordB)}
          >
            <CheckCircle2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-red-600"
            onClick={() => rejectMatch(recordA)}
          >
            <XCircle className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/getData?page=${currentPage}&limit=${ITEMS_PER_PAGE}`
        );

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const { items, total, excelB } = await response.json();

        console.log("Fetched items:", items);
        console.log("Total items:", total);
        console.log("Excel B data:", excelB);

        setExcelAData(items);
        setTotalItems(total);

        if (excelBData.length === 0) {
          setExcelBData(excelB);
        }

        const batchResults = matchCustomers(items, excelBData);
        setMatches((prev) => ({
          review: [...prev.review, ...batchResults.review],
          requiresAction: [
            ...prev.requiresAction,
            ...batchResults.requiresAction,
          ],
          unmatched: [...prev.unmatched, ...batchResults.unmatched],
        }));
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage, excelBData]);

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

      {selectedRecords.length > 0 && (
        <div className="bg-muted p-4 rounded-lg mb-4 flex items-center justify-between">
          <p className="text-sm">{selectedRecords.length} records selected</p>
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
                  return [record, match!] as [CustomerRecord, CustomerRecord];
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
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="review" className="flex gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Review
            {data?.matches.review.length && (
              <span className="ml-2 bg-primary/10 px-2 py-0.5 rounded-full text-xs">
                {data.matches.review.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="requires_action" className="flex gap-2">
            <AlertCircle className="h-4 w-4" />
            Requires Action
            {data?.matches.requiresAction.length && (
              <span className="ml-2 bg-primary/10 px-2 py-0.5 rounded-full text-xs">
                {data.matches.requiresAction.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="unmatched" className="flex gap-2">
            <XCircle className="h-4 w-4" />
            Unmatched
            {data?.matches.unmatched.length && (
              <span className="ml-2 bg-primary/10 px-2 py-0.5 rounded-full text-xs">
                {data.matches.unmatched.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="review" className="space-y-4">
          {loading && <div>Loading...</div>}

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

          {data?.matches.review && renderPagination(data.matches.review.length)}
        </TabsContent>

        <TabsContent value="requires_action" className="space-y-4">
          {loading && <div>Loading...</div>}

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

          {data?.matches.requiresAction &&
            renderPagination(data.matches.requiresAction.length)}
        </TabsContent>

        <TabsContent value="unmatched" className="space-y-4">
          {loading && <div>Loading...</div>}

          <div>
            <h2>Unmatched ({matches.unmatched.length})</h2>
            {matches.unmatched.length > 0 ? (
              matches.unmatched.map((record, index) => (
                <div key={`unmatched-${record.id}-${index}`}>
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
                        <h3 className="font-semibold">{record.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          ID: {record.id}
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

          {data?.matches.unmatched &&
            renderPagination(data.matches.unmatched.length)}
        </TabsContent>
      </Tabs>
    </div>
  );
}
