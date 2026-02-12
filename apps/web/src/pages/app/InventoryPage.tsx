import { useMemo } from "react";
import {
  Alert,
  Box,
  Button,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { AppShell } from "@/components/layout/AppShell";
import { apiClient } from "@/services/api";

type Variant = {
  id: string;
  variantCode: string;
  sizeValue: string;
  ppeItem: {
    itemName: string;
  };
};

type Location = {
  id: string;
  locationName: string;
};

type StockBalance = {
  ppeVariantId: string;
  locationId: string;
  _sum: {
    quantity: string | number | null;
  };
};

type StockForm = {
  ppeVariantId: string;
  locationId: string;
  movementType: "receipt" | "adjustment" | "return" | "issue";
  quantity: number;
  reasonCode: string;
};

export function InventoryPage() {
  const queryClient = useQueryClient();

  const variantsQuery = useQuery({
    queryKey: ["ppe-variants"],
    queryFn: async () => {
      const response = await apiClient.get<{ data: Variant[] }>("/ppe/variants");
      return response.data.data;
    },
  });

  const locationsQuery = useQuery({
    queryKey: ["locations"],
    queryFn: async () => {
      const response = await apiClient.get<{ data: Location[] }>("/stock/locations");
      return response.data.data;
    },
  });

  const balancesQuery = useQuery({
    queryKey: ["stock-balances"],
    queryFn: async () => {
      const response = await apiClient.get<{ data: StockBalance[] }>("/stock/balances");
      return response.data.data;
    },
  });

  const form = useForm<StockForm>({
    defaultValues: {
      ppeVariantId: "",
      locationId: "",
      movementType: "receipt",
      quantity: 1,
      reasonCode: "MANUAL_CAPTURE",
    },
  });

  const createMovementMutation = useMutation({
    mutationFn: async (values: StockForm) => {
      const quantity = values.movementType === "issue" ? -Math.abs(values.quantity) : Math.abs(values.quantity);
      await apiClient.post("/stock/movements", {
        ...values,
        quantity,
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["stock-balances"] });
      form.reset({
        ppeVariantId: "",
        locationId: "",
        movementType: "receipt",
        quantity: 1,
        reasonCode: "MANUAL_CAPTURE",
      });
    },
  });

  const balances = useMemo(() => {
    const variants = variantsQuery.data ?? [];
    const index = new Map(variants.map((variant) => [variant.id, variant]));
    return (balancesQuery.data ?? []).map((row) => ({
      ...row,
      variant: index.get(row.ppeVariantId),
    }));
  }, [balancesQuery.data, variantsQuery.data]);

  return (
    <AppShell>
      <Stack spacing={2.5}>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            PPE Inventory
          </Typography>
          <Typography color="text.secondary">
            Capture stock receipts and adjustments, and monitor balances by PPE variant.
          </Typography>
        </Box>

        {locationsQuery.error ? <Alert severity="warning">Unable to load locations.</Alert> : null}

        <Paper elevation={0} sx={{ p: 2.5, border: "1px solid", borderColor: "divider" }}>
          <Typography variant="h6" fontWeight={700} mb={2}>
            Add stock movement
          </Typography>
          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
            }}
          >
            <Box>
              <TextField select label="PPE variant" fullWidth {...form.register("ppeVariantId")}>
                {(variantsQuery.data ?? []).map((variant) => (
                  <MenuItem key={variant.id} value={variant.id}>
                    {variant.ppeItem.itemName} - {variant.sizeValue} ({variant.variantCode})
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            <Box>
              <TextField select label="Location" fullWidth {...form.register("locationId")}>
                {(locationsQuery.data ?? []).map((location) => (
                  <MenuItem key={location.id} value={location.id}>
                    {location.locationName}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
          </Box>

          <Box
            sx={{
              display: "grid",
              gap: 2,
              mt: 2,
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", md: "repeat(3, minmax(0, 1fr))" },
            }}
          >
            <Box>
              <TextField select label="Movement type" fullWidth {...form.register("movementType")}>
                <MenuItem value="receipt">Receipt</MenuItem>
                <MenuItem value="adjustment">Adjustment</MenuItem>
                <MenuItem value="return">Return</MenuItem>
                <MenuItem value="issue">Issue</MenuItem>
              </TextField>
            </Box>
            <Box>
              <TextField label="Quantity" type="number" fullWidth {...form.register("quantity", { valueAsNumber: true })} />
            </Box>
            <Box>
              <TextField label="Reason code" fullWidth {...form.register("reasonCode")} />
            </Box>
          </Box>

          <Box mt={2}>
            <Button
              variant="contained"
              onClick={form.handleSubmit((values) => createMovementMutation.mutate(values))}
              disabled={createMovementMutation.isPending}
            >
              {createMovementMutation.isPending ? "Saving..." : "Post movement"}
            </Button>
          </Box>
        </Paper>

        <Paper elevation={0} sx={{ border: "1px solid", borderColor: "divider", overflowX: "auto" }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>PPE Item</TableCell>
                <TableCell>Variant</TableCell>
                <TableCell>Location ID</TableCell>
                <TableCell align="right">Balance</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {balances.map((row) => (
                <TableRow key={`${row.ppeVariantId}-${row.locationId}`}>
                  <TableCell>{row.variant?.ppeItem.itemName ?? "Unknown"}</TableCell>
                  <TableCell>{row.variant?.variantCode ?? row.ppeVariantId}</TableCell>
                  <TableCell>{row.locationId}</TableCell>
                  <TableCell align="right">{Number(row._sum.quantity ?? 0)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Stack>
    </AppShell>
  );
}
