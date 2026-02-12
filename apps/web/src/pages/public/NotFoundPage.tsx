import { Box, Button, Container, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

export function NotFoundPage() {
  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Box textAlign="center">
        <Typography variant="h3" fontWeight={700} mb={1}>
          404
        </Typography>
        <Typography color="text.secondary" mb={3}>
          The page you requested was not found.
        </Typography>
        <Button component={RouterLink} to="/dashboard" variant="contained">
          Go to dashboard
        </Button>
      </Box>
    </Container>
  );
}
