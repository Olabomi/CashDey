"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BackButton from "@/components/ui/back-button";
import { Book, Shield, Bell, Eye, Newspaper, TrendingUp, X } from "lucide-react";
import Link from "next/link";
import VisualAnalyzer from "@/components/explore/VisualAnalyzer";
import MarketNews from "@/components/explore/MarketNews";
import ExploreTools from "@/components/explore/ExploreTools";

export default function ExplorePage() {
  const [activeFeature, setActiveFeature] = useState<"analyzer" | "news" | "tools" | null>(null);

  if (activeFeature === "analyzer") {
    return (
      <div className="max-w-sm mx-auto bg-light-bg min-h-screen pb-24">
        <div className="sticky top-0 z-40 glass-effect px-4 py-4 border-b border-gray-200/50 shadow-sm">
          <div className="flex items-center justify-between">
            <BackButton onClick={() => setActiveFeature(null)} label="Back to Explore" />
          </div>
        </div>
        <div className="px-4 py-6">
          <h1 className="text-2xl font-bold text-text-dark tracking-tight mb-6">Visual Analyzer</h1>
          <VisualAnalyzer />
        </div>
      </div>
    );
  }

  if (activeFeature === "news") {
    return (
      <div className="max-w-sm mx-auto bg-light-bg min-h-screen pb-24">
        <div className="sticky top-0 z-40 glass-effect px-4 py-4 border-b border-gray-200/50 shadow-sm">
          <div className="flex items-center justify-between">
            <BackButton onClick={() => setActiveFeature(null)} label="Back to Explore" />
          </div>
        </div>
        <div className="px-4 py-6">
          <h1 className="text-2xl font-bold text-text-dark tracking-tight mb-6">Market News</h1>
          <MarketNews />
        </div>
      </div>
    );
  }

  if (activeFeature === "tools") {
    return (
      <div className="max-w-sm mx-auto bg-light-bg min-h-screen pb-24">
        <div className="sticky top-0 z-40 glass-effect px-4 py-4 border-b border-gray-200/50 shadow-sm">
          <div className="flex items-center justify-between">
            <BackButton onClick={() => setActiveFeature(null)} label="Back to Explore" />
          </div>
        </div>
        <div className="px-4 py-6">
          <h1 className="text-2xl font-bold text-text-dark tracking-tight mb-6">Explore Tools</h1>
          <ExploreTools />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto bg-light-bg min-h-screen pb-24">
      <div className="sticky top-0 z-40 glass-effect px-4 py-4 border-b border-gray-200/50 shadow-sm">
        <h1 className="text-2xl font-bold text-text-dark tracking-tight">Explore</h1>
      </div>
      <div className="px-4 py-6">

      <div className="space-y-6">
        {/* New Features */}
        <div className="space-y-4">
          <Card className="cursor-pointer card-hover shadow-soft border-gray-200/50" onClick={() => setActiveFeature("tools")}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-naija-green/20 to-eko-teal/20 rounded-2xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-naija-green" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold tracking-tight">Explore Tools</CardTitle>
                  <CardDescription className="text-text-muted font-medium">Deeper insights and market intelligence</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-text-muted mb-4 font-medium">
                Get advanced analytics and market insights to make better financial decisions
              </p>
              <Button className="w-full">Open Tools</Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer card-hover shadow-soft border-gray-200/50" onClick={() => setActiveFeature("analyzer")}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-naija-green/20 to-eko-teal/20 rounded-2xl flex items-center justify-center">
                  <Eye className="w-6 h-6 text-naija-green" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold tracking-tight">Visual Analyzer</CardTitle>
                  <CardDescription className="text-text-muted font-medium">Get financial insights from images</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-text-muted mb-4 font-medium">
                Upload bills, receipts, or products to analyze and automatically track expenses
              </p>
              <Button className="w-full">Start Analyzing</Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer card-hover shadow-soft border-gray-200/50" onClick={() => setActiveFeature("news")}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-naija-green/20 to-eko-teal/20 rounded-2xl flex items-center justify-center">
                  <Newspaper className="w-6 h-6 text-naija-green" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold tracking-tight">Market News</CardTitle>
                  <CardDescription className="text-text-muted font-medium">Search for real-time financial news and analysis</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-text-muted mb-4 font-medium">
                Stay informed with the latest financial news, market trends, and economic updates
              </p>
              <Button className="w-full">View News</Button>
            </CardContent>
          </Card>
        </div>

        {/* Existing Features */}
        <div className="border-t border-gray-200/50 pt-6">
          <h2 className="text-xl font-bold text-text-dark tracking-tight mb-4">More Features</h2>
          <div className="space-y-4">
            <Card className="shadow-soft border-gray-200/50 card-hover">
              <CardHeader>
                <CardTitle className="text-lg font-bold tracking-tight">Financial Dictionary</CardTitle>
                <CardDescription className="text-text-muted font-medium">
                  Learn Nigerian financial terms like Esusu, MPR, and more
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-text-muted mb-4 font-medium">300+ Terms</p>
                <Button variant="outline" className="w-full">Browse Dictionary</Button>
              </CardContent>
            </Card>

            <Card className="shadow-soft border-gray-200/50 card-hover">
              <CardHeader>
                <CardTitle className="text-lg font-bold tracking-tight">Security Center</CardTitle>
                <CardDescription className="text-text-muted font-medium">
                  Protect your account with advanced security features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-text-muted mb-4 font-medium">Safe & Secure</p>
                <Button variant="outline" className="w-full">View Security</Button>
              </CardContent>
            </Card>

            <Card className="shadow-soft border-gray-200/50 card-hover">
              <CardHeader>
                <CardTitle className="text-lg font-bold tracking-tight">Smart Reminders</CardTitle>
                <CardDescription className="text-text-muted font-medium">
                  Never miss bills, goals, or important financial dates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-text-muted mb-4 font-medium">5 Active</p>
                <Button variant="outline" className="w-full">Manage Reminders</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

