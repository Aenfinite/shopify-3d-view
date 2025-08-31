"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { ImageUpload } from "@/components/admin/shared/image-upload"
import { Plus, Trash2 } from "lucide-react"
import { createCustomizationOption, updateModel } from "@/lib/firebase/model-service"

const optionSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  type: z.enum(["color", "texture", "component", "style"], {
    required_error: "Type is required",
  }),
  category: z.string().min(1, { message: "Category is required" }),
  values: z
    .array(
      z.object({
        name: z.string().min(1, { message: "Name is required" }),
        value: z.string().min(1, { message: "Value is required" }),
        price: z.coerce.number().optional(),
      }),
    )
    .min(1, { message: "At least one value is required" }),
})

type OptionFormValues = z.infer<typeof optionSchema>

interface CustomizationOptionFormProps {
  modelId: string
}

export function CustomizationOptionForm({ modelId }: CustomizationOptionFormProps) {
  const [loading, setLoading] = useState(false)
  const [thumbnails, setThumbnails] = useState<Record<number, File | null>>({})
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<OptionFormValues>({
    resolver: zodResolver(optionSchema),
    defaultValues: {
      name: "",
      type: "color",
      category: "",
      values: [{ name: "", value: "", price: 0 }],
    },
  })

  const { fields, append, remove } = form.useFieldArray({
    name: "values",
  })

  const onSubmit = async (data: OptionFormValues) => {
    try {
      setLoading(true)

      // Create the customization option
      const option = await createCustomizationOption(data)

      // Update the model to include this option
      await updateModel(modelId, {
        customizationOptions: [option.id], // This would need to be merged with existing options in a real implementation
      })

      toast({
        title: "Success",
        description: "Customization option added successfully",
      })

      router.push(`/admin/models/€{modelId}`)
    } catch (error) {
      console.error("Error saving customization option:", error)
      toast({
        title: "Error",
        description: "Failed to save customization option. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Add Customization Option</CardTitle>
            <CardDescription>Define a new customization option for this 3D model</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Option Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Collar Style" {...field} />
                    </FormControl>
                    <FormDescription>The name of this customization option</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Option Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="color">Color</SelectItem>
                        <SelectItem value="texture">Texture</SelectItem>
                        <SelectItem value="component">Component</SelectItem>
                        <SelectItem value="style">Style</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>The type of customization</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="collar">Collar</SelectItem>
                      <SelectItem value="cuff">Cuff</SelectItem>
                      <SelectItem value="pocket">Pocket</SelectItem>
                      <SelectItem value="button">Button</SelectItem>
                      <SelectItem value="fabric">Fabric</SelectItem>
                      <SelectItem value="fit">Fit</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>The category this option belongs to</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <FormLabel>Option Values</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ name: "", value: "", price: 0 })}
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Value
                </Button>
              </div>

              {fields.map((field, index) => (
                <Card key={field.id}>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name={`values.€{index}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Button Down" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`values.€{index}.value`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Value</FormLabel>
                            <FormControl>
                              <Input placeholder="#FF0000 or texture-id" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`values.€{index}.price`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Additional Price</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <span className="absolute left-3 top-2.5">€</span>
                                <Input type="number" step="0.01" className="pl-7" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {form.watch("type") === "texture" && (
                      <div className="mt-4">
                        <FormLabel>Texture Image</FormLabel>
                        <ImageUpload
                          onFileSelected={(file) => {
                            setThumbnails({ ...thumbnails, [index]: file })
                          }}
                          aspectRatio="1:1"
                        />
                      </div>
                    )}

                    {index > 0 && (
                      <Button type="button" variant="ghost" size="sm" className="mt-4" onClick={() => remove(index)}>
                        <Trash2 className="mr-2 h-4 w-4" /> Remove
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button variant="outline" type="button" onClick={() => router.push(`/admin/models/€{modelId}`)}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Add Customization Option"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
