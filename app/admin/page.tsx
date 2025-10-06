"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, ShoppingCart, DollarSign } from "lucide-react";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { AdminStats } from "@/lib/types";

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
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
      } catch {
        setStats(null);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="bg-gradient-to-r from-accent/10 to-accent/5 rounded-xl p-4 sm:p-6 lg:p-8 border border-accent/20 shadow-sm">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-2 sm:mb-3">
          Welcome to ThePreMax Admin Panel
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base lg:text-lg max-w-2xl">
          Manage your e-commerce platform, users, products, and orders from this
          central dashboard.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
        {loading || !stats ? (
          Array.from({ length: 6 }).map((_, i) => (
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
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Users
                </CardTitle>
                <Users className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.users.total}</div>
                <div className="flex items-center text-sm mt-2">
                  <TrendingUp className="h-4 w-4 mr-1 text-green-600" />
                  <span className="text-green-600 font-medium">
                    {stats.users.growth}
                  </span>
                  <span className="text-muted-foreground ml-1">
                    from last month
                  </span>
                </div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Active Users
                </CardTitle>
                <Users className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.users.active}</div>
                <div className="flex items-center text-sm mt-2">
                  <TrendingUp className="h-4 w-4 mr-1 text-green-600" />
                  <span className="text-green-600 font-medium">
                    {stats.users.activeGrowth}
                  </span>
                  <span className="text-muted-foreground ml-1">
                    from last month
                  </span>
                </div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Email Verified
                </CardTitle>
                <Users className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {stats.verification.emailVerified}
                </div>
                <div className="flex items-center text-sm mt-2">
                  <TrendingUp className="h-4 w-4 mr-1 text-green-600" />
                  <span className="text-green-600 font-medium">
                    {stats.verification.emailGrowth}
                  </span>
                  <span className="text-muted-foreground ml-1">
                    from last month
                  </span>
                </div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Phone Verified
                </CardTitle>
                <Users className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {stats.verification.phoneVerified}
                </div>
                <div className="flex items-center text-sm mt-2">
                  <TrendingUp className="h-4 w-4 mr-1 text-green-600" />
                  <span className="text-green-600 font-medium">
                    {stats.verification.phoneGrowth}
                  </span>
                  <span className="text-muted-foreground ml-1">
                    from last month
                  </span>
                </div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Orders
                </CardTitle>
                <ShoppingCart className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.orders.total}</div>
                <div className="flex items-center text-sm mt-2">
                  <TrendingUp className="h-4 w-4 mr-1 text-green-600" />
                  <span className="text-green-600 font-medium">
                    {stats.orders.growth}
                  </span>
                  <span className="text-muted-foreground ml-1">
                    from last month
                  </span>
                </div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Revenue
                </CardTitle>
                <DollarSign className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  ${stats.orders.totalRevenue.toLocaleString()}
                </div>
                <div className="flex items-center text-sm mt-2">
                  <TrendingUp className="h-4 w-4 mr-1 text-green-600" />
                  <span className="text-green-600 font-medium">
                    {stats.orders.revenueGrowth}
                  </span>
                  <span className="text-muted-foreground ml-1">
                    from last month
                  </span>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="text-lg sm:text-xl">Recent Users</CardTitle>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Latest registered users
          </p>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          {loading || !stats ? (
            <div className="space-y-3 sm:space-y-4 p-4 sm:p-0">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between border-b border-border pb-3 last:border-b-0"
                >
                  <div className="bg-muted h-4 w-32 animate-pulse rounded" />
                  <span className="bg-muted h-4 w-16 animate-pulse rounded" />
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Mobile Card Layout */}
              <div className="block sm:hidden space-y-3 p-4">
                {stats.recentUsers.map((user, index) => (
                  <div
                    key={user.id}
                    className="bg-gradient-to-r from-background to-muted/30 rounded-lg p-4 border border-border/50 shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-primary font-semibold text-sm">
                          {user.firstName?.charAt(0)?.toUpperCase() || "U"}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-foreground break-words leading-tight">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-muted-foreground text-xs break-all leading-tight mt-1">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                        #{index + 1}
                      </span>
                      <span className="text-xs text-muted-foreground text-right">
                        {formatDistanceToNow(new Date(user.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table Layout */}
              <div className="hidden sm:block">
                <div className="space-y-3 sm:space-y-4">
                  {stats.recentUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-start justify-between border-b border-border pb-3 last:border-b-0 hover:bg-muted/30 transition-colors duration-200 rounded-md px-2 py-2"
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-primary font-semibold text-xs">
                            {user.firstName?.charAt(0)?.toUpperCase() || "U"}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm break-words leading-tight">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-muted-foreground text-xs break-all leading-tight mt-1">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <span className="text-muted-foreground text-xs flex-shrink-0 ml-4 text-right min-w-fit">
                        {formatDistanceToNow(new Date(user.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
