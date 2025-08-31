"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useConfigurator } from "@/context/configurator-context"
import { useAuth } from "@/context/auth-context"
import { Save } from "lucide-react"

export function SaveCustomizationDialog() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [saving, setSaving] = useState(false)
  const { saveProgress, customizationName, setCustomizationName } = useConfigurator()
  const { user } = useAuth()

  const handleSave = async () => {
    try {
      setSaving(true)

      const customizationName = name.trim() || "My Customization"
      setCustomizationName(customizationName)

      await saveProgress(customizationName)

      setOpen(false)
      setName("")
    } catch (error) {
      console.error("Error saving customization:", error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Save className="mr-2 h-4 w-4" />
          Save
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Save Your Customization</DialogTitle>
          <DialogDescription>
            {user
              ? "Save your customization to your account for future reference."
              : "Save your customization to your browser. Create an account to access your saved designs from any device."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              placeholder="My Custom Shirt"
              className="col-span-3"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Customization"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
