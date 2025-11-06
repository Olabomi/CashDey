"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Book, Shield, Bell, Eye, Newspaper, TrendingUp, X } from "lucide-react";
import Link from "next/link";
import VisualAnalyzer from "@/components/explore/VisualAnalyzer";
import MarketNews from "@/components/explore/MarketNews";
import ExploreTools from "@/components/explore/ExploreTools";

export default function ExplorePage() {
  const [activeFeature, setActiveFeature] = useState<"analyzer" | "news" | "tools" | null>(null);

  if (activeFeature === "analyzer") {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Visual Analyzer</h1>
          <Button variant="ghost" size="icon" onClick={() => setActiveFeature(null)}>
            <X className="w-5 h-5" />
          </Button>
        </div>
        <VisualAnalyzer />
      </div>
    );
  }

  if (activeFeature === "news") {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Market News</h1>
          <Button variant="ghost" size="icon" onClick={() => setActiveFeature(null)}>
            <X className="w-5 h-5" />
          </Button>
        </div>
        <MarketNews />
      </div>
    );
  }

  if (activeFeature === "tools") {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Explore Tools</h1>
          <Button variant="ghost" size="icon" onClick={() => setActiveFeature(null)}>
            <X className="w-5 h-5" />
          </Button>
        </div>
        <ExploreTools />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Explore</h1>

      <div className="space-y-6">
        {/* New Features */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveFeature("tools")}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Explore Tools</CardTitle>
                  <CardDescription>Deeper insights and market intelligence</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Get advanced analytics and market insights to make better financial decisions
              </p>
              <Button className="w-full">Open Tools</Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveFeature("analyzer")}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Eye className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Visual Analyzer</CardTitle>
                  <CardDescription>Get financial insights from images</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Upload bills, receipts, or products to analyze and automatically track expenses
              </p>
              <Button className="w-full">Start Analyzing</Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow md:col-span-2" onClick={() => setActiveFeature("news")}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Newspaper className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Market News</CardTitle>
                  <CardDescription>Search for real-time financial news and analysis</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Stay informed with the latest financial news, market trends, and economic updates
              </p>
              <Button className="w-full">View News</Button>
            </CardContent>
          </Card>
        </div>

        {/* Existing Features */}
        <div className="border-t pt-6">
          <h2 className="text-xl font-semibold mb-4">More Features</h2>
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Financial Dictionary</CardTitle>
                <CardDescription>
                  Learn Nigerian financial terms like Esusu, MPR, and more
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">300+ Terms</p>
                <Button>Browse Dictionary</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security Center</CardTitle>
                <CardDescription>
                  Protect your account with advanced security features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">Safe & Secure</p>
                <Button variant="outline">View Security</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Smart Reminders</CardTitle>
                <CardDescription>
                  Never miss bills, goals, or important financial dates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">5 Active</p>
                <Button variant="outline">Manage Reminders</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

