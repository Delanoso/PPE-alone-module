import { Card, CardContent, Typography } from "@mui/material";

type Props = {
  label: string;
  value: number | string;
  helper?: string;
};

export function KpiCard({ label, value, helper }: Props) {
  return (
    <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
      <CardContent>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {label}
        </Typography>
        <Typography variant="h4" fontWeight={700}>
          {value}
        </Typography>
        {helper ? (
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            {helper}
          </Typography>
        ) : null}
      </CardContent>
    </Card>
  );
}
