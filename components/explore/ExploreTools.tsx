"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, BarChart3, PieChart, DollarSign, Target, TrendingDown } from "lucide-react";

export default function ExploreTools() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Market Intelligence Tools</CardTitle>
          <CardDescription>
            Access deeper insights and analytics to make informed financial decisions
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <CardTitle>Market Trends</CardTitle>
                <CardDescription>Analyze market trends</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Get insights into market trends, price movements, and economic indicators that affect
              your finances.
            </p>
            <Button variant="outline" className="w-full">
              View Trends
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <CardTitle>Spending Analytics</CardTitle>
                <CardDescription>Deep dive into your spending</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Analyze your spending patterns, identify trends, and discover opportunities to save
              money.
            </p>
            <Button variant="outline" className="w-full">
              View Analytics
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <PieChart className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <CardTitle>Budget Breakdown</CardTitle>
                <CardDescription>Visualize your budget</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              See how your money is distributed across categories and get recommendations for budget
              optimization.
            </p>
            <Button variant="outline" className="w-full">
              View Breakdown
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <CardTitle>Goal Performance</CardTitle>
                <CardDescription>Track your goals</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Monitor your savings goals, see progress over time, and get personalized
              recommendations to achieve them faster.
            </p>
            <Button variant="outline" className="w-full">
              View Goals
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <CardTitle>Savings Opportunities</CardTitle>
                <CardDescription>Find ways to save</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Discover areas where you can reduce expenses and increase your savings potential.
            </p>
            <Button variant="outline" className="w-full">
              Find Opportunities
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <CardTitle>Investment Insights</CardTitle>
                <CardDescription>Smart investment advice</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Get personalized investment recommendations based on your financial goals and risk
              tolerance.
            </p>
            <Button variant="outline" className="w-full">
              Get Insights
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-muted">
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>More tools on the way</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            We&apos;re constantly adding new tools and features to help you manage your finances better.
            Stay tuned for updates!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

