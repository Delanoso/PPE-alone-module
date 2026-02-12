import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
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
  Typography,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AppShell } from "@/components/layout/AppShell";
import { apiClient } from "@/services/api";

type SubDepartment = {
  id: string;
  subDepartmentName: string;
  departmentId: string;
};

type Department = {
  id: string;
  departmentName: string;
  subDepartments: SubDepartment[];
};

type Person = {
  id: string;
  employeeNo: string;
  firstName: string;
  lastName: string;
  mobileNumber: string;
  employmentStatus: string;
  department: { departmentName: string };
  subDepartment: { subDepartmentName: string };
  sizes: Array<{ sizeType: string; sizeValue: string }>;
};

const personSchema = z.object({
  employeeNo: z.string().min(2),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  mobileNumber: z.string().min(8),
  departmentId: z.string().uuid(),
  subDepartmentId: z.string().uuid(),
  bootsSize: z.string().min(1),
  gloveSize: z.string().min(1),
  overallSize: z.string().min(1),
  vestSize: z.string().min(1),
});

type PersonForm = z.infer<typeof personSchema>;

const alphaSizes = ["2XS", "XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"];
const bootSizes = ["3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14"];
const gloveSizes = ["6", "7", "8", "9", "10", "11", "12"];

export function PeoplePage() {
  const queryClient = useQueryClient();
  const [openCreate, setOpenCreate] = useState(false);
  const [sizeEditPerson, setSizeEditPerson] = useState<Person | null>(null);
  const [sizeDraft, setSizeDraft] = useState<Record<string, string>>({});

  const departmentsQuery = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const response = await apiClient.get<{ data: Department[] }>("/departments");
      return response.data.data;
    },
  });

  const peopleQuery = useQuery({
    queryKey: ["people"],
    queryFn: async () => {
      const response = await apiClient.get<{ data: Person[] }>("/people");
      return response.data.data;
    },
  });

  const form = useForm<PersonForm>({
    resolver: zodResolver(personSchema),
    defaultValues: {
      employeeNo: "",
      firstName: "",
      lastName: "",
      mobileNumber: "",
      departmentId: "",
      subDepartmentId: "",
      bootsSize: "9",
      gloveSize: "9",
      overallSize: "L",
      vestSize: "L",
    },
  });

  const selectedDepartment = form.watch("departmentId");
  const subDepartmentOptions = useMemo(() => {
    const department = departmentsQuery.data?.find((item) => item.id === selectedDepartment);
    return department?.subDepartments ?? [];
  }, [departmentsQuery.data, selectedDepartment]);

  const createPersonMutation = useMutation({
    mutationFn: async (values: PersonForm) => {
      await apiClient.post("/people", {
        employeeNo: values.employeeNo,
        firstName: values.firstName,
        lastName: values.lastName,
        mobileNumber: values.mobileNumber,
        departmentId: values.departmentId,
        subDepartmentId: values.subDepartmentId,
        sizes: [
          { sizeType: "boots", sizeValue: values.bootsSize },
          { sizeType: "gloves", sizeValue: values.gloveSize },
          { sizeType: "overalls", sizeValue: values.overallSize },
          { sizeType: "safety_vest", sizeValue: values.vestSize },
        ],
      });
    },
    onSuccess: () => {
      setOpenCreate(false);
      form.reset();
      void queryClient.invalidateQueries({ queryKey: ["people"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (personId: string) => apiClient.delete(`/people/${personId}`),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["people"] }),
  });

  const updateSizesMutation = useMutation({
    mutationFn: async ({ personId, sizes }: { personId: string; sizes: Array<{ sizeType: string; sizeValue: string }> }) =>
      apiClient.put(`/people/${personId}/sizes`, { sizes }),
    onSuccess: () => {
      setSizeEditPerson(null);
      setSizeDraft({});
      void queryClient.invalidateQueries({ queryKey: ["people"] });
    },
  });

  return (
    <AppShell>
      <Stack spacing={2.5}>
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" gap={1.5}>
          <Box>
            <Typography variant="h4" fontWeight={700}>
              People and Sizes
            </Typography>
            <Typography color="text.secondary">
              Add, delete, and update worker PPE sizes by department and sub-department.
            </Typography>
          </Box>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenCreate(true)}>
            Add person
          </Button>
        </Stack>

        {(peopleQuery.error || departmentsQuery.error) && (
          <Alert severity="warning">Unable to load full people data. Verify API connectivity.</Alert>
        )}

        <Paper elevation={0} sx={{ border: "1px solid", borderColor: "divider", overflowX: "auto" }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Employee</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Sub-department</TableCell>
                <TableCell>Mobile</TableCell>
                <TableCell>Sizes</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(peopleQuery.data ?? []).map((person) => (
                <TableRow key={person.id} hover>
                  <TableCell>{person.employeeNo}</TableCell>
                  <TableCell>{person.firstName} {person.lastName}</TableCell>
                  <TableCell>{person.department.departmentName}</TableCell>
                  <TableCell>{person.subDepartment.subDepartmentName}</TableCell>
                  <TableCell>{person.mobileNumber}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                      {person.sizes.slice(0, 4).map((size) => (
                        <Chip key={`${person.id}-${size.sizeType}`} size="small" label={`${size.sizeType}: ${size.sizeValue}`} />
                      ))}
                    </Stack>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      color="primary"
                      onClick={() => {
                        setSizeEditPerson(person);
                        setSizeDraft(
                          person.sizes.reduce<Record<string, string>>((acc, item) => {
                            acc[item.sizeType] = item.sizeValue;
                            return acc;
                          }, {}),
                        );
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton color="error" onClick={() => deleteMutation.mutate(person.id)}>
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Stack>

      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} fullWidth maxWidth="md">
        <DialogTitle>Add person</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 0.25 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Employee No"
                fullWidth
                {...form.register("employeeNo")}
                error={!!form.formState.errors.employeeNo}
                helperText={form.formState.errors.employeeNo?.message}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Mobile"
                fullWidth
                {...form.register("mobileNumber")}
                error={!!form.formState.errors.mobileNumber}
                helperText={form.formState.errors.mobileNumber?.message}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="First name"
                fullWidth
                {...form.register("firstName")}
                error={!!form.formState.errors.firstName}
                helperText={form.formState.errors.firstName?.message}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Last name"
                fullWidth
                {...form.register("lastName")}
                error={!!form.formState.errors.lastName}
                helperText={form.formState.errors.lastName?.message}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Department"
                select
                fullWidth
                {...form.register("departmentId")}
                error={!!form.formState.errors.departmentId}
                helperText={form.formState.errors.departmentId?.message}
              >
                {(departmentsQuery.data ?? []).map((department) => (
                  <MenuItem value={department.id} key={department.id}>
                    {department.departmentName}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Sub-department"
                select
                fullWidth
                {...form.register("subDepartmentId")}
                error={!!form.formState.errors.subDepartmentId}
                helperText={form.formState.errors.subDepartmentId?.message}
              >
                {subDepartmentOptions.map((subDepartment) => (
                  <MenuItem value={subDepartment.id} key={subDepartment.id}>
                    {subDepartment.subDepartmentName}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField select label="Boot size" fullWidth {...form.register("bootsSize")}>
                {bootSizes.map((size) => (
                  <MenuItem key={size} value={size}>
                    {size}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField select label="Glove size" fullWidth {...form.register("gloveSize")}>
                {gloveSizes.map((size) => (
                  <MenuItem key={size} value={size}>
                    {size}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField select label="Overalls size" fullWidth {...form.register("overallSize")}>
                {alphaSizes.map((size) => (
                  <MenuItem key={size} value={size}>
                    {size}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField select label="Safety vest size" fullWidth {...form.register("vestSize")}>
                {alphaSizes.map((size) => (
                  <MenuItem key={size} value={size}>
                    {size}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreate(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={form.handleSubmit((values) => createPersonMutation.mutate(values))}
            disabled={createPersonMutation.isPending}
          >
            {createPersonMutation.isPending ? "Saving..." : "Save person"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!sizeEditPerson} onClose={() => setSizeEditPerson(null)} fullWidth maxWidth="sm">
        <DialogTitle>Update size profile</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} mt={0.5}>
            <TextField
              select
              label="Boot size"
              fullWidth
              value={sizeDraft.boots ?? ""}
              onChange={(event) => setSizeDraft((prev) => ({ ...prev, boots: event.target.value }))}
            >
              {bootSizes.map((size) => (
                <MenuItem key={size} value={size}>
                  {size}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Glove size"
              fullWidth
              value={sizeDraft.gloves ?? ""}
              onChange={(event) => setSizeDraft((prev) => ({ ...prev, gloves: event.target.value }))}
            >
              {gloveSizes.map((size) => (
                <MenuItem key={size} value={size}>
                  {size}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Overalls size"
              fullWidth
              value={sizeDraft.overalls ?? ""}
              onChange={(event) => setSizeDraft((prev) => ({ ...prev, overalls: event.target.value }))}
            >
              {alphaSizes.map((size) => (
                <MenuItem key={size} value={size}>
                  {size}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSizeEditPerson(null)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={updateSizesMutation.isPending}
            onClick={() => {
              if (!sizeEditPerson) return;
              const sizes = Object.entries(sizeDraft)
                .filter((entry) => entry[1])
                .map(([sizeType, sizeValue]) => ({ sizeType, sizeValue }));
              updateSizesMutation.mutate({
                personId: sizeEditPerson.id,
                sizes,
              });
            }}
          >
            {updateSizesMutation.isPending ? "Saving..." : "Save sizes"}
          </Button>
        </DialogActions>
      </Dialog>
    </AppShell>
  );
}
