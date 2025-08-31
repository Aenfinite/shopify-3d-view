"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"

const measurementFormSchema = z.object({
  measurementUnit: z.enum(["cm", "inches"], {
    required_error: "You need to select a measurement unit.",
  }),
  allowCustomMeasurements: z.boolean().default(true),
  requireAllMeasurements: z.boolean().default(false),
  showMeasurementGuides: z.boolean().default(true),
  defaultTolerance: z.coerce.number().min(0).max(10),
})

type MeasurementFormValues = z.infer<typeof measurementFormSchema>

// This can come from your database or API
const defaultValues: Partial<MeasurementFormValues> = {
  measurementUnit: "cm",
  allowCustomMeasurements: true,
  requireAllMeasurements: false,
  showMeasurementGuides: true,
  defaultTolerance: 1.5,
}

export function MeasurementSettings() {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<MeasurementFormValues>({
    resolver: zodResolver(measurementFormSchema),
    defaultValues,
  })

  async function onSubmit(data: MeasurementFormValues) {
    setIsLoading(true)

    try {
      // Here you would typically save the data to your database
      console.log("Form submitted:", data)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Measurement settings updated",
        description: "Your measurement settings have been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update measurement settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Measurement Settings</CardTitle>
        <CardDescription>Configure how measurements are handled in your application.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="measurementUnit"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Default Measurement Unit</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="cm" />
                        </FormControl>
                        <FormLabel className="font-normal">Centimeters (cm)</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="inches" />
                        </FormControl>
                        <FormLabel className="font-normal">Inches (in)</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormDescription>The default unit of measurement for all garments.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="defaultTolerance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default Tolerance (±)</FormLabel>
                  <FormControl>
                    <div className="flex items-center">
                      <Input type="number" step="0.1" min="0" max="10" {...field} className="w-24" />
                      <span className="ml-2">{form.watch("measurementUnit") === "cm" ? "cm" : "inches"}</span>
                    </div>
                  </FormControl>
                  <FormDescription>
                    The default tolerance for measurements. This is the amount of variation allowed in each measurement.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Measurement Options</h3>

              <FormField
                control={form.control}
                name="allowCustomMeasurements"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Allow Custom Measurements</FormLabel>
                      <FormDescription>Allow customers to enter their own measurements.</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="requireAllMeasurements"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Require All Measurements</FormLabel>
                      <FormDescription>Require customers to enter all measurements before proceeding.</FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={!form.watch("allowCustomMeasurements")}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="showMeasurementGuides"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Show Measurement Guides</FormLabel>
                      <FormDescription>
                        Show measurement guides to help customers take accurate measurements.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
