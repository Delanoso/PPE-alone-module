import {
  Alert,
  Box,
  Button,
  Chip,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SendIcon from "@mui/icons-material/Send";
import { useFieldArray, useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { apiClient } from "@/services/api";

type Person = {
  id: string;
  firstName: string;
  lastName: string;
  employeeNo: string;
  mobileNumber: string;
};

type Variant = {
  id: string;
  variantCode: string;
  sizeValue: string;
  ppeItem: { itemName: string };
};

type Location = {
  id: string;
  locationName: string;
};

type IssueLineInput = {
  ppeVariantId: string;
  quantity: number;
};

type IssueForm = {
  personId: string;
  locationId: string;
  signatureMode: "in_person" | "remote";
  lines: IssueLineInput[];
};

type Issue = {
  id: string;
  issueNo: string;
  issueStatus: string;
  signatureMode: "in_person" | "remote";
  person: { id: string; firstName: string; lastName: string; mobileNumber: string };
};

export function IssuesPage() {
  const queryClient = useQueryClient();

  const peopleQuery = useQuery({
    queryKey: ["people"],
    queryFn: async () => {
      const response = await apiClient.get<{ data: Person[] }>("/people");
      return response.data.data;
    },
  });

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

  const issuesQuery = useQuery({
    queryKey: ["issues"],
    queryFn: async () => {
      const response = await apiClient.get<{ data: Issue[] }>("/issues");
      return response.data.data;
    },
  });

  const form = useForm<IssueForm>({
    defaultValues: {
      personId: "",
      locationId: "",
      signatureMode: "remote",
      lines: [{ ppeVariantId: "", quantity: 1 }],
    },
  });
  const linesArray = useFieldArray({
    control: form.control,
    name: "lines",
  });

  const createIssueMutation = useMutation({
    mutationFn: async (values: IssueForm) => {
      await apiClient.post("/issues", values);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["issues"] });
      form.reset({
        personId: "",
        locationId: "",
        signatureMode: "remote",
        lines: [{ ppeVariantId: "", quantity: 1 }],
      });
    },
  });

  const sendLinkMutation = useMutation({
    mutationFn: async ({ issueId, mobileNumber }: { issueId: string; mobileNumber: string }) => {
      await apiClient.post(`/issues/${issueId}/send-signature-link`, { mobileNumber });
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["issues"] }),
  });

  return (
    <AppShell>
      <Stack spacing={2.5}>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Issue PPE
          </Typography>
          <Typography color="text.secondary">
            Create PPE issue transactions and send remote signature links via WhatsApp.
          </Typography>
        </Box>

        {(peopleQuery.error || variantsQuery.error || issuesQuery.error) && (
          <Alert severity="warning">Some issue data could not be loaded. Check API connectivity.</Alert>
        )}

        <Paper elevation={0} sx={{ p: 2.5, border: "1px solid", borderColor: "divider" }}>
          <Typography variant="h6" fontWeight={700} mb={2}>
            Create issue transaction
          </Typography>
          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
            }}
          >
            <Box>
              <TextField select label="Person" fullWidth {...form.register("personId")}>
                {(peopleQuery.data ?? []).map((person) => (
                  <MenuItem key={person.id} value={person.id}>
                    {person.firstName} {person.lastName} ({person.employeeNo})
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
            <Box>
              <TextField select label="Signature mode" fullWidth {...form.register("signatureMode")}>
                <MenuItem value="in_person">In Person Signature</MenuItem>
                <MenuItem value="remote">Remote Signature - WhatsApp Link</MenuItem>
              </TextField>
            </Box>
          </Box>

          <Stack spacing={1.25} mt={2}>
            {linesArray.fields.map((line, index) => (
              <Box
                key={line.id}
                sx={{
                  display: "grid",
                  gap: 1.5,
                  gridTemplateColumns: { xs: "1fr", md: "2fr 1fr auto" },
                  alignItems: "center",
                }}
              >
                <Box>
                  <TextField
                    select
                    label={`PPE item ${index + 1}`}
                    fullWidth
                    {...form.register(`lines.${index}.ppeVariantId`)}
                  >
                    {(variantsQuery.data ?? []).map((variant) => (
                      <MenuItem key={variant.id} value={variant.id}>
                        {variant.ppeItem.itemName} - {variant.sizeValue} ({variant.variantCode})
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>
                <Box>
                  <TextField
                    label="Qty"
                    type="number"
                    fullWidth
                    {...form.register(`lines.${index}.quantity`, { valueAsNumber: true })}
                  />
                </Box>
                <Box>
                  <IconButton
                    color="error"
                    disabled={linesArray.fields.length === 1}
                    onClick={() => linesArray.remove(index)}
                  >
                    <DeleteOutlineIcon />
                  </IconButton>
                </Box>
              </Box>
            ))}
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} mt={2}>
            <Button
              variant="outlined"
              startIcon={<AddCircleOutlineIcon />}
              onClick={() => linesArray.append({ ppeVariantId: "", quantity: 1 })}
            >
              Add item
            </Button>
            <Button
              variant="contained"
              onClick={form.handleSubmit((values) => createIssueMutation.mutate(values))}
              disabled={createIssueMutation.isPending}
            >
              {createIssueMutation.isPending ? "Saving..." : "Issue PPE"}
            </Button>
          </Stack>
        </Paper>

        <Paper elevation={0} sx={{ border: "1px solid", borderColor: "divider", overflowX: "auto" }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Issue No</TableCell>
                <TableCell>Person</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Signature</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(issuesQuery.data ?? []).map((issue) => (
                <TableRow key={issue.id}>
                  <TableCell>{issue.issueNo}</TableCell>
                  <TableCell>
                    {issue.person.firstName} {issue.person.lastName}
                  </TableCell>
                  <TableCell>
                    <Chip size="small" label={issue.issueStatus} />
                  </TableCell>
                  <TableCell>{issue.signatureMode === "remote" ? "WhatsApp link" : "In person"}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Send signature link">
                      <span>
                        <IconButton
                          color="primary"
                          disabled={issue.signatureMode !== "remote" || issue.issueStatus === "signed"}
                          onClick={() =>
                            sendLinkMutation.mutate({
                              issueId: issue.id,
                              mobileNumber: issue.person.mobileNumber,
                            })
                          }
                        >
                          <SendIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Stack>
    </AppShell>
  );
}
