"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Profile, CommunicationStyle } from "@/types";
import { useToast } from "@/hooks/use-toast";
import {
  User,
  Bell,
  Languages,
  Lock,
  Fingerprint,
  CreditCard,
  LogOut,
  Mail,
  Settings,
  Shield,
  Link as LinkIcon,
  Plus,
  X,
} from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";

interface ProfileContentProps {
  profile: Profile | null;
  subscription: any;
  user: any;
}

export default function ProfileContent({
  profile,
  subscription,
  user,
}: ProfileContentProps) {
  const [preferredName, setPreferredName] = useState(profile?.preferred_name || "");
  const [communicationStyle, setCommunicationStyle] = useState<CommunicationStyle>(
    profile?.communication_style || "auto"
  );
  const [pushNotifications, setPushNotifications] = useState(false);
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [linkedAccounts, setLinkedAccounts] = useState<any[]>([]);

  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();

  const handleSave = async () => {
    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        preferred_name: preferredName,
        communication_style: communicationStyle,
      })
      .eq("user_id", user.id);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      router.refresh();
    }
    setLoading(false);
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Password updated successfully",
      });
      setShowPasswordDialog(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update password",
        variant: "destructive",
      });
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  const handleLinkBankAccount = () => {
    toast({
      title: "Coming Soon",
      description: "Bank account linking will be available soon",
    });
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* User Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">CashDey User</h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <Mail className="w-4 h-4" />
              {user.email}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Settings Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              <CardTitle>Settings</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Push Notifications */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-muted-foreground" />
                <div>
                  <Label htmlFor="pushNotifications" className="text-base font-medium">
                    Push Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications about your finances
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPushNotifications(!pushNotifications)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  pushNotifications ? "bg-primary" : "bg-muted"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    pushNotifications ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Language */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Languages className="w-5 h-5 text-muted-foreground" />
                <Label htmlFor="language" className="text-base font-medium">
                  Language
                </Label>
              </div>
              <select
                id="language"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={communicationStyle}
                onChange={(e) =>
                  setCommunicationStyle(e.target.value as CommunicationStyle)
                }
              >
                <option value="auto">Auto</option>
                <option value="formal">English</option>
                <option value="pidgin">Pidgin</option>
              </select>
              <p className="text-sm text-muted-foreground">
                Choose how CashDey Coach communicates with you
              </p>
            </div>

            {/* Preferred Name */}
            <div className="space-y-2">
              <Label htmlFor="preferredName">Preferred Name</Label>
              <Input
                id="preferredName"
                value={preferredName}
                onChange={(e) => setPreferredName(e.target.value)}
                placeholder="Enter your preferred name"
              />
            </div>

            <Button onClick={handleSave} disabled={loading} className="w-full">
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </CardContent>
        </Card>

        {/* Security Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <CardTitle>Security</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Change Password */}
            <Dialog.Root open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
              <Dialog.Trigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <Lock className="w-4 h-4 mr-2" />
                  Change Password
                </Button>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50" />
                <Dialog.Content className="fixed left-[50%] top-[50%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-background p-6 shadow-lg">
                  <Dialog.Title className="text-lg font-semibold mb-4">
                    Change Password
                  </Dialog.Title>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Dialog.Close asChild>
                        <Button variant="outline">Cancel</Button>
                      </Dialog.Close>
                      <Button
                        onClick={handleChangePassword}
                        disabled={changingPassword}
                      >
                        {changingPassword ? "Updating..." : "Update Password"}
                      </Button>
                    </div>
                  </div>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>

            {/* Enable Biometrics */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Fingerprint className="w-5 h-5 text-muted-foreground" />
                <div>
                  <Label htmlFor="biometrics" className="text-base font-medium">
                    Enable Biometrics
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Use fingerprint or face ID to unlock
                  </p>
                </div>
              </div>
              <button
                onClick={() => setBiometricsEnabled(!biometricsEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  biometricsEnabled ? "bg-primary" : "bg-muted"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    biometricsEnabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Linked Accounts Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <LinkIcon className="w-5 h-5" />
              <CardTitle>Linked Accounts</CardTitle>
            </div>
            <CardDescription>
              Connect your bank accounts to track transactions automatically
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {linkedAccounts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CreditCard className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No accounts linked yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {linkedAccounts.map((account, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{account.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {account.bank} • •••• {account.last4}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <Button
              onClick={handleLinkBankAccount}
              variant="outline"
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Link Bank Account
            </Button>
          </CardContent>
        </Card>

        {/* Log Out */}
        <Card>
          <CardContent className="pt-6">
            <Button
              variant="destructive"
              onClick={handleSignOut}
              className="w-full"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Log Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
