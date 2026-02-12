import { useState } from "react";
import {
  Alert,
  Button,
  Card,
  CardContent,
  Container,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link as RouterLink } from "react-router-dom";
import { apiClient } from "@/services/api";

const schema = z.object({
  fullName: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(10),
  roleCode: z.string().min(3),
});

type RegisterForm = z.infer<typeof schema>;

const roleOptions = [
  { value: "super_admin", label: "Super Admin" },
  { value: "health_safety_manager", label: "Health and Safety Manager" },
  { value: "storeman", label: "Storeman" },
  { value: "department_supervisor", label: "Department Supervisor" },
  { value: "hr_admin", label: "HR/Admin Officer" },
];

export function RegisterPage() {
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<RegisterForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      roleCode: "storeman",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setError(null);
    setSuccess(null);
    try {
      await apiClient.post("/auth/register", values);
      setSuccess("User registered successfully");
      form.reset({
        fullName: "",
        email: "",
        password: "",
        roleCode: "storeman",
      });
    } catch (submissionError) {
      setError("Registration failed. Please verify details and try again.");
    }
  });

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 4, md: 8 } }}>
      <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Typography variant="h4" fontWeight={700}>
            Register User
          </Typography>
          <Typography color="text.secondary" mb={3}>
            Create platform access for health and safety operations
          </Typography>

          <Stack spacing={2} component="form" onSubmit={onSubmit}>
            {success ? <Alert severity="success">{success}</Alert> : null}
            {error ? <Alert severity="error">{error}</Alert> : null}

            <TextField
              label="Full Name"
              fullWidth
              {...form.register("fullName")}
              error={!!form.formState.errors.fullName}
              helperText={form.formState.errors.fullName?.message}
            />

            <TextField
              label="Email"
              type="email"
              fullWidth
              {...form.register("email")}
              error={!!form.formState.errors.email}
              helperText={form.formState.errors.email?.message}
            />

            <TextField
              label="Password"
              type="password"
              fullWidth
              {...form.register("password")}
              error={!!form.formState.errors.password}
              helperText={form.formState.errors.password?.message}
            />

            <TextField
              label="Role"
              select
              fullWidth
              defaultValue="storeman"
              {...form.register("roleCode")}
              error={!!form.formState.errors.roleCode}
              helperText={form.formState.errors.roleCode?.message}
            >
              {roleOptions.map((role) => (
                <MenuItem key={role.value} value={role.value}>
                  {role.label}
                </MenuItem>
              ))}
            </TextField>

            <Button variant="contained" type="submit" size="large" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Creating..." : "Create User"}
            </Button>

            <Typography variant="body2" color="text.secondary">
              Back to <RouterLink to="/login">login</RouterLink>
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
}
