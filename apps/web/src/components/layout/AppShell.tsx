import { useMemo, useState } from "react";
import {
  AppBar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
  Button,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth-store";

const drawerWidth = 280;

const navItems = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "People", path: "/people" },
  { label: "PPE Inventory", path: "/inventory" },
  { label: "Issue PPE", path: "/issues" },
];

type Props = {
  children: React.ReactNode;
};

export function AppShell({ children }: Props) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));
  const isTablet = useMediaQuery(theme.breakpoints.up("md"));
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, clearAuth } = useAuthStore();

  const title = useMemo(() => {
    const found = navItems.find((item) => location.pathname.startsWith(item.path));
    return found?.label ?? "HFR PPE";
  }, [location.pathname]);

  const contentPadding = isDesktop ? 4 : isTablet ? 3 : 2;

  const drawerContent = (
    <Box display="flex" flexDirection="column" height="100%">
      <Box px={2.5} py={2}>
        <Typography variant="h6" fontWeight={700}>
          HFR PPE System
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Health & Safety
        </Typography>
      </Box>
      <Divider />
      <List sx={{ flex: 1, p: 1 }}>
        {navItems.map((item) => (
          <ListItemButton
            key={item.path}
            selected={location.pathname.startsWith(item.path)}
            onClick={() => {
              navigate(item.path);
              setOpen(false);
            }}
            sx={{ borderRadius: 2, mb: 0.5 }}
          >
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
      <Divider />
      <Box px={2} py={2}>
        <Typography variant="body2" color="text.secondary" mb={1}>
          {user?.fullName}
        </Typography>
        <Button
          variant="outlined"
          color="inherit"
          size="small"
          startIcon={<LogoutIcon />}
          onClick={() => {
            clearAuth();
            navigate("/login");
          }}
          fullWidth
        >
          Log out
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: "background.default" }}>
      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{
          width: { lg: `calc(100% - ${drawerWidth}px)` },
          ml: { lg: `${drawerWidth}px` },
          borderBottom: "1px solid",
          borderColor: "divider",
          backgroundColor: "background.paper",
        }}
      >
        <Toolbar>
          {!isDesktop && (
            <IconButton edge="start" onClick={() => setOpen(true)} sx={{ mr: 1 }}>
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" fontWeight={700}>
            {title}
          </Typography>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { lg: drawerWidth }, flexShrink: { lg: 0 } }}>
        <Drawer
          variant={isDesktop ? "permanent" : "temporary"}
          open={isDesktop ? true : open}
          onClose={() => setOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
            },
          }}
        >
          {drawerContent}
        </Drawer>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, pt: 10, px: contentPadding, pb: 3 }}>
        {children}
      </Box>
    </Box>
  );
}
