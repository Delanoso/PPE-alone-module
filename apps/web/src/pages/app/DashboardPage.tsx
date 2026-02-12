import { useQuery } from "@tanstack/react-query";
import { Alert, Box, Paper, Stack, Typography } from "@mui/material";
import { AppShell } from "@/components/layout/AppShell";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { apiClient } from "@/services/api";

type SummaryResponse = {
  activeWorkers: number;
  openIssues: number;
  pendingSignatures: number;
  lowStockItems: number;
};

export function DashboardPage() {
  const summaryQuery = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: async () => {
      const response = await apiClient.get<{ data: SummaryResponse }>("/dashboard/summary");
      return response.data.data;
    },
    retry: 1,
  });

  const summary = summaryQuery.data ?? {
    activeWorkers: 0,
    openIssues: 0,
    pendingSignatures: 0,
    lowStockItems: 0,
  };

  return (
    <AppShell>
      <Stack spacing={2.5}>
        <Typography variant="h4" fontWeight={700}>
          Safety Dashboard
        </Typography>
        <Typography color="text.secondary">
          Live overview of workforce PPE compliance for HFR Schafer Vervoer.
        </Typography>

        {summaryQuery.error ? (
          <Alert severity="warning">
            Unable to load live dashboard data. Check API configuration and login token.
          </Alert>
        ) : null}

        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              xl: "repeat(4, minmax(0, 1fr))",
            },
          }}
        >
          <KpiCard label="Active workers" value={summary.activeWorkers} />
          <KpiCard label="Open issues" value={summary.openIssues} />
          <KpiCard label="Pending signatures" value={summary.pendingSignatures} />
          <KpiCard label="Low stock items" value={summary.lowStockItems} />
        </Box>

        <Paper elevation={0} sx={{ p: 2.5, border: "1px solid", borderColor: "divider" }}>
          <Typography variant="h6" fontWeight={700} mb={1}>
            Launch Readiness
          </Typography>
          <Typography color="text.secondary">
            This app is configured for responsive usage on phone, tablet, and laptop with role-based routes,
            secure API access, and database-backed records.
          </Typography>
        </Paper>
      </Stack>
    </AppShell>
  );
}
