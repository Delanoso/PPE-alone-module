import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { apiClient } from "@/services/api";
import { useAuthStore } from "@/store/auth-store";

const schema = z.object({
  username: z.string().min(3, "Username is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginForm = z.infer<typeof schema>;

export function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<LoginForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setError(null);
    try {
      const response = await apiClient.post("/auth/login", values);
      const payload = response.data.data as {
        accessToken: string;
        user: { id: string; fullName: string; email: string; roleCode: string };
      };
      setAuth({
        accessToken: payload.accessToken,
        user: payload.user,
      });
      navigate("/dashboard");
    } catch (submissionError) {
      setError("Login failed. Please verify your credentials and try again.");
    }
  });

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 4, md: 8 } }}>
      <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Typography variant="h4" fontWeight={700}>
            HFR PPE Login
          </Typography>
          <Typography color="text.secondary" mb={3}>
            Access health and safety PPE issuance system
          </Typography>

          <Stack spacing={2} component="form" onSubmit={onSubmit}>
            {error ? <Alert severity="error">{error}</Alert> : null}

            <TextField
              label="Email or Employee Number"
              fullWidth
              {...form.register("username")}
              error={!!form.formState.errors.username}
              helperText={form.formState.errors.username?.message}
            />

            <TextField
              label="Password"
              type="password"
              fullWidth
              {...form.register("password")}
              error={!!form.formState.errors.password}
              helperText={form.formState.errors.password?.message}
            />

            <Button type="submit" variant="contained" size="large" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Signing in..." : "Sign in"}
            </Button>

            <Box>
              <Typography variant="body2" color="text.secondary">
                Need an account? <RouterLink to="/register">Register user</RouterLink>
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
}
