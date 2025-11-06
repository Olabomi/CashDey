"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Book, Shield, Bell, Calculator } from "lucide-react";
import Link from "next/link";

export default function ExplorePage() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Explore</h1>

      <div className="space-y-6">
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
  );
}

