import { useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { apiClient } from "@/services/api";

type SignatureForm = {
  signerName: string;
  signerMobile: string;
  signatureType: "consent" | "type";
  signaturePayload: string;
};

export function SignaturePage() {
  const { token = "" } = useParams();

  const previewQuery = useQuery({
    queryKey: ["signature-preview", token],
    queryFn: async () => {
      const response = await apiClient.get(`/sign/${token}/preview`);
      return response.data.data;
    },
    enabled: !!token,
  });

  const form = useForm<SignatureForm>({
    defaultValues: {
      signerName: "",
      signerMobile: "",
      signatureType: "consent",
      signaturePayload: "I confirm receipt of the PPE listed above.",
    },
  });

  const completeMutation = useMutation({
    mutationFn: async (values: SignatureForm) => {
      await apiClient.post(`/sign/${token}/complete`, values);
    },
  });

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 3, md: 6 } }}>
      <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Typography variant="h4" fontWeight={700} mb={1}>
            PPE Receipt Signature
          </Typography>
          <Typography color="text.secondary" mb={3}>
            Review the issued items and sign to confirm receipt.
          </Typography>

          {previewQuery.isError ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              This link is invalid, expired, or has already been used.
            </Alert>
          ) : null}

          {previewQuery.data ? (
            <Box mb={2}>
              <Typography variant="body2" color="text.secondary">
                Issue No: {previewQuery.data.issue.issueNo}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Receiver: {previewQuery.data.issue.person.firstName} {previewQuery.data.issue.person.lastName}
              </Typography>
              <Divider sx={{ my: 1.5 }} />
              <Stack spacing={0.75}>
                {previewQuery.data.issue.lines.map((line: any) => (
                  <Typography key={line.id} variant="body2">
                    {line.ppeVariant.ppeItem.itemName} ({line.ppeVariant.sizeValue}) x {line.quantity}
                  </Typography>
                ))}
              </Stack>
            </Box>
          ) : null}

          <Stack spacing={2} component="form" onSubmit={form.handleSubmit((values) => completeMutation.mutate(values))}>
            {completeMutation.isSuccess ? (
              <Alert severity="success">Thank you. Your signature has been captured successfully.</Alert>
            ) : null}

            {completeMutation.isError ? (
              <Alert severity="error">Unable to submit signature. The link may be expired.</Alert>
            ) : null}

            <TextField label="Your full name" fullWidth {...form.register("signerName")} />
            <TextField label="Mobile number" fullWidth {...form.register("signerMobile")} />
            <TextField
              label="Confirmation statement"
              multiline
              minRows={3}
              fullWidth
              {...form.register("signaturePayload")}
            />
            <Button variant="contained" type="submit" disabled={completeMutation.isPending}>
              {completeMutation.isPending ? "Submitting..." : "Sign and confirm"}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
}
