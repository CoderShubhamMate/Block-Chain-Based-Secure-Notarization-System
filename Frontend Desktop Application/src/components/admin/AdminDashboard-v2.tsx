import { useState, useEffect } from "react";
import { Layout, MainContent, Container, Grid, GridItem, Stack, Inline, Section } from "../ui/layout-v2";
import { SidebarV2, SidebarSection } from "../ui/sidebar-v2";
import { Header } from "../ui/header-v2";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card-v2";
import { Button } from "../ui/button-v2";
import { Badge } from "../ui/badge-v2";
import { Table, Column } from "../ui/table-v2";
import {
    LayoutDashboard,
    Users,
    FileText,
    Settings,
    BarChart3,
    Shield,
    Activity,
    TrendingUp,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    User,
    LogOut,
} from "lucide-react";
import { useToast } from "../ui/toast-v2";

interface AdminDashboardProps {
    onNavigate: (screen: string) => void;
    onLogout: () => void;
    userName: string;
}

interface RecentActivity {
    id: string;
    type: string;
    description: string;
    timestamp: string;
    status: "approved" | "pending" | "rejected";
}

export function AdminDashboard({ onNavigate, onLogout, userName }: AdminDashboardProps) {
    const { addToast } = useToast();
    const [stats, setStats] = useState({
        totalNotaries: 0,
        pendingRequests: 0,
        activeDocuments: 0,
        systemHealth: 100,
    });
    const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch dashboard data
        const fetchDashboardData = async () => {
            try {
                // Simulated API calls
                await new Promise((resolve) => setTimeout(resolve, 1000));

                setStats({
                    totalNotaries: 125,
                    pendingRequests: 18,
                    activeDocuments: 342,
                    systemHealth: 98,
                });

                setRecentActivity([
                    {
                        id: "1",
                        type: "Notary Registration",
                        description: "New notary application from John Doe",
                        timestamp: "2 hours ago",
                        status: "pending",
                    },
                    {
                        id: "2",
                        type: "Document Notarization",
                        description: "Document #DOC-4523 approved",
                        timestamp: "3 hours ago",
                        status: "approved",
                    },
                    {
                        id: "3",
                        type: "Notary Registration",
                        description: "Application rejected - Invalid credentials",
                        timestamp: "5 hours ago",
                        status: "rejected",
                    },
                ]);

                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
                addToast({
                    type: "error",
                    title: "Failed to load dashboard",
                    message: "Please try refreshing the page",
                });
            }
        };

        fetchDashboardData();
    }, [addToast]);

    const sidebarSections: SidebarSection[] = [
        {
            title: "Main",
            items: [
                {
                    id: "dashboard",
                    label: "Dashboard",
                    icon: <LayoutDashboard size={20} />,
                    active: true,
                    onClick: () => onNavigate("dashboard"),
                },
                {
                    id: "notaries",
                    label: "Manage Notaries",
                    icon: <Users size={20} />,
                    onClick: () => onNavigate("manage-notaries"),
                    badge: stats.pendingRequests,
                },
                {
                    id: "governance",
                    label: "Governance",
                    icon: <Shield size={20} />,
                    onClick: () => onNavigate("governance"),
                },
            ],
        },
        {
            title: "System",
            items: [
                {
                    id: "logs",
                    label: "System Logs",
                    icon: <FileText size={20} />,
                    onClick: () => onNavigate("system-logs"),
                },
                {
                    id: "multisig",
                    label: "Multi-Sig",
                    icon: <Activity size={20} />,
                    onClick: () => onNavigate("multi-sig"),
                },
                {
                    id: "settings",
                    label: "Settings",
                    icon: <Settings size={20} />,
                    onClick: () => onNavigate("settings"),
                },
            ],
        },
    ];

    const activityColumns: Column<RecentActivity>[] = [
        { key: "type", header: "Type", sortable: true },
        { key: "description", header: "Description", sortable: false },
        {
            key: "status",
            header: "Status",
            render: (row) => (
                <Badge
                    variant={
                        row.status === "approved"
                            ? "success"
                            : row.status === "pending"
                                ? "warning"
                                : "error"
                    }
                    size="sm"
                >
                    {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                </Badge>
            ),
        },
        { key: "timestamp", header: "Time", sortable: true },
    ];

    return (
        <Layout>
            <SidebarV2
                logo={
                    <div className="flex items-center gap-2">
                        <Shield className="text-[var(--accent-primary)]" size={24} />
                        <span className="font-bold text-[var(--text-primary)]">BBSNS</span>
                    </div>
                }
                sections={sidebarSections}
                userInfo={{
                    name: userName,
                    role: "Administrator",
                }}
                onLogout={onLogout}
            />

            <MainContent>
                <Header
                    breadcrumbs={[
                        { label: "Home", onClick: () => onNavigate("dashboard") },
                        { label: "Dashboard" },
                    ]}
                    showSearch
                    onSearch={(query) => console.log("Search:", query)}
                    notifications={stats.pendingRequests}
                    onNotificationsClick={() => onNavigate("manage-notaries")}
                    user={{ name: userName }}
                    userMenu={[
                        {
                            label: "Profile",
                            icon: <User size={16} />,
                            onClick: () => addToast({ type: "info", title: "Profile clicked" }),
                        },
                        {
                            label: "Settings",
                            icon: <Settings size={16} />,
                            onClick: () => onNavigate("settings"),
                        },
                        {
                            label: "Logout",
                            icon: <LogOut size={16} />,
                            onClick: onLogout,
                            destructive: true,
                        },
                    ]}
                />

                <Container size="xl">
                    <Section>
                        <Stack gap={8}>
                            {/* Page Header */}
                            <div>
                                <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
                                    Dashboard
                                </h1>
                                <p className="text-[var(--text-secondary)]">
                                    Welcome back, {userName}. Here's what's happening today.
                                </p>
                            </div>

                            {/* Stats Grid */}
                            <Grid cols={4} gap={6}>
                                <Card variant="elevated" className="hover:shadow-xl transition-shadow cursor-pointer" onClick={() => onNavigate("manage-notaries")}>
                                    <CardContent className="p-6">
                                        <Inline justify="between" align="start">
                                            <Stack gap={2}>
                                                <p className="text-sm font-medium text-[var(--text-tertiary)]">
                                                    Total Notaries
                                                </p>
                                                <p className="text-3xl font-bold text-[var(--text-primary)]">
                                                    {loading ? "..." : stats.totalNotaries}
                                                </p>
                                                <Inline gap={2} align="center">
                                                    <TrendingUp size={14} className="text-[var(--status-success)]" />
                                                    <span className="text-xs text-[var(--status-success)]">+12% this month</span>
                                                </Inline>
                                            </Stack>
                                            <div className="w-12 h-12 rounded-lg bg-[var(--accent-muted)] flex items-center justify-center">
                                                <Users size={24} className="text-[var(--accent-primary)]" />
                                            </div>
                                        </Inline>
                                    </CardContent>
                                </Card>

                                <Card variant="elevated" className="hover:shadow-xl transition-shadow cursor-pointer" onClick={() => onNavigate("manage-notaries")}>
                                    <CardContent className="p-6">
                                        <Inline justify="between" align="start">
                                            <Stack gap={2}>
                                                <p className="text-sm font-medium text-[var(--text-tertiary)]">
                                                    Pending Requests
                                                </p>
                                                <p className="text-3xl font-bold text-[var(--text-primary)]">
                                                    {loading ? "..." : stats.pendingRequests}
                                                </p>
                                                <Inline gap={2} align="center">
                                                    <Clock size={14} className="text-[var(--status-warning)]" />
                                                    <span className="text-xs text-[var(--status-warning)]">Requires attention</span>
                                                </Inline>
                                            </Stack>
                                            <div className="w-12 h-12 rounded-lg bg-[var(--status-warning-bg)] flex items-center justify-center">
                                                <AlertCircle size={24} className="text-[var(--status-warning)]" />
                                            </div>
                                        </Inline>
                                    </CardContent>
                                </Card>

                                <Card variant="elevated" className="hover:shadow-xl transition-shadow">
                                    <CardContent className="p-6">
                                        <Inline justify="between" align="start">
                                            <Stack gap={2}>
                                                <p className="text-sm font-medium text-[var(--text-tertiary)]">
                                                    Active Documents
                                                </p>
                                                <p className="text-3xl font-bold text-[var(--text-primary)]">
                                                    {loading ? "..." : stats.activeDocuments}
                                                </p>
                                                <Inline gap={2} align="center">
                                                    <CheckCircle size={14} className="text-[var(--status-success)]" />
                                                    <span className="text-xs text-[var(--status-success)]">All verified</span>
                                                </Inline>
                                            </Stack>
                                            <div className="w-12 h-12 rounded-lg bg-[var(--status-success-bg)] flex items-center justify-center">
                                                <FileText size={24} className="text-[var(--status-success)]" />
                                            </div>
                                        </Inline>
                                    </CardContent>
                                </Card>

                                <Card variant="elevated" className="hover:shadow-xl transition-shadow">
                                    <CardContent className="p-6">
                                        <Inline justify="between" align="start">
                                            <Stack gap={2}>
                                                <p className="text-sm font-medium text-[var(--text-tertiary)]">
                                                    System Health
                                                </p>
                                                <p className="text-3xl font-bold text-[var(--text-primary)]">
                                                    {loading ? "..." : `${stats.systemHealth}%`}
                                                </p>
                                                <Inline gap={2} align="center">
                                                    <Activity size={14} className="text-[var(--status-success)]" />
                                                    <span className="text-xs text-[var(--status-success)]">Excellent</span>
                                                </Inline>
                                            </Stack>
                                            <div className="w-12 h-12 rounded-lg bg-[var(--status-info-bg)] flex items-center justify-center">
                                                <BarChart3 size={24} className="text-[var(--status-info)]" />
                                            </div>
                                        </Inline>
                                    </CardContent>
                                </Card>
                            </Grid>

                            {/* Recent Activity */}
                            <div>
                                <Inline justify="between" align="center" className="mb-4">
                                    <div>
                                        <h2 className="text-xl font-semibold text-[var(--text-primary)]">
                                            Recent Activity
                                        </h2>
                                        <p className="text-sm text-[var(--text-secondary)]">
                                            Latest system activities and updates
                                        </p>
                                    </div>
                                    <Button variant="outline" size="sm" onClick={() => onNavigate("system-logs")}>
                                        View All Logs
                                    </Button>
                                </Inline>

                                <Table
                                    data={recentActivity}
                                    columns={activityColumns}
                                    keyExtractor={(row) => row.id}
                                    loading={loading}
                                    emptyMessage="No recent activity"
                                    onRowClick={(row) => {
                                        addToast({
                                            type: "info",
                                            title: "Activity Details",
                                            message: row.description,
                                        });
                                    }}
                                />
                            </div>

                            {/* Quick Actions */}
                            <Card variant="default">
                                <CardHeader>
                                    <CardTitle>Quick Actions</CardTitle>
                                    <CardDescription>Common administrative tasks</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Grid cols={3} gap={4}>
                                        <Button
                                            variant="outline"
                                            fullWidth
                                            onClick={() => onNavigate("manage-notaries")}
                                        >
                                            <Users size={18} />
                                            Manage Notaries
                                        </Button>
                                        <Button
                                            variant="outline"
                                            fullWidth
                                            onClick={() => onNavigate("system-logs")}
                                        >
                                            <FileText size={18} />
                                            View Logs
                                        </Button>
                                        <Button
                                            variant="outline"
                                            fullWidth
                                            onClick={() => onNavigate("settings")}
                                        >
                                            <Settings size={18} />
                                            System Settings
                                        </Button>
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Stack>
                    </Section>
                </Container>
            </MainContent>
        </Layout>
    );
}
