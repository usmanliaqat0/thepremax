"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/stats");
        const data = await res.json();
        if (data.success) {
          setStats(data.data);
        } else {
          setStats(null);
        }
      } catch (error) {
        setStats(null);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-accent/10 to-accent/5 rounded-lg p-6 border border-accent/20">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Welcome to ThePreMax Admin Panel
        </h1>
        <p className="text-muted-foreground">
          Manage your e-commerce platform, users, products, and orders from this
          central dashboard.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading || !stats ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground bg-muted h-4 w-24 animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold bg-muted h-8 w-20 animate-pulse rounded" />
                <div className="flex items-center text-sm bg-muted h-4 w-16 animate-pulse rounded mt-2" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Users
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.users.total}</div>
                <div className="flex items-center text-sm">
                  <TrendingUp className="h-4 w-4 mr-1 text-green-600" />
                  <span className="text-green-600">{stats.users.growth}</span>
                  <span className="text-muted-foreground ml-1">
                    from last month
                  </span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Active Users
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.users.active}</div>
                <div className="flex items-center text-sm">
                  <TrendingUp className="h-4 w-4 mr-1 text-green-600" />
                  <span className="text-green-600">{stats.users.growth}</span>
                  <span className="text-muted-foreground ml-1">
                    from last month
                  </span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Email Verified
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.verification.emailVerified}
                </div>
                <div className="flex items-center text-sm">
                  <TrendingUp className="h-4 w-4 mr-1 text-green-600" />
                  <span className="text-green-600">
                    {stats.verification.emailVerificationRate}%
                  </span>
                  <span className="text-muted-foreground ml-1">verified</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Phone Verified
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.verification.phoneVerified}
                </div>
                <div className="flex items-center text-sm">
                  <TrendingUp className="h-4 w-4 mr-1 text-green-600" />
                  <span className="text-green-600">
                    {stats.verification.phoneVerificationRate}%
                  </span>
                  <span className="text-muted-foreground ml-1">verified</span>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Recent Users */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading || !stats
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between border-b border-border pb-3 last:border-b-0"
                  >
                    <div className="bg-muted h-4 w-32 animate-pulse rounded" />
                    <span className="bg-muted h-4 w-16 animate-pulse rounded" />
                  </div>
                ))
              : stats.recentUsers.map((user: any) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between border-b border-border pb-3 last:border-b-0"
                  >
                    <div>
                      <p className="font-medium text-sm">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {user.email}
                      </p>
                    </div>
                    <span className="text-muted-foreground text-xs">
                      {formatDistanceToNow(new Date(user.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Manage Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              View, edit, and manage user accounts and permissions.
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Manage Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Add, edit, and organize your product catalog.
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Manage Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Process orders, track shipments, and handle returns.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
