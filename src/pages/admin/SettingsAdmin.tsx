import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function SettingsAdmin() {
  return (
    <AdminLayout title="Settings">
      <div className="max-w-2xl space-y-6">
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle className="font-display">Business Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Business Name</Label>
              <Input defaultValue="Sahyadri Surgicals" />
            </div>
            <div>
              <Label>Phone Number</Label>
              <Input defaultValue="+91 98765 43210" />
            </div>
            <div>
              <Label>WhatsApp Number</Label>
              <Input defaultValue="+91 98765 43210" />
            </div>
            <div>
              <Label>Email</Label>
              <Input defaultValue="info@sahyadrisurgicals.com" />
            </div>
            <Button className="gradient-hero text-primary-foreground" onClick={() => toast.success("Settings saved!")}>
              Save Changes
            </Button>
          </CardContent>
        </Card>

        <Card className="card-shadow">
          <CardHeader>
            <CardTitle className="font-display">Data Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Currently using local storage. Connect Lovable Cloud for persistent database storage, authentication, and more.
            </p>
            <Button variant="outline" onClick={() => {
              localStorage.removeItem("sahyadri_inquiries");
              localStorage.removeItem("sahyadri_products");
              toast.success("All local data cleared");
              window.location.reload();
            }}>
              Clear All Local Data
            </Button>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
