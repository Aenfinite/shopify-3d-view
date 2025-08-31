"use client"

import { useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, User, Shirt } from "lucide-react"
import { useConfigurator } from "@/context/configurator-context"

export function FitBodySelector() {
  const { 
    fitPreference, 
    setFitPreference, 
    bodyShape, 
    setBodyShape 
  } = useConfigurator()

  // Fit preference options
  const fitOptions = [
    { id: "slim", name: "Slim Fit", description: "Tailored close to the body" },
    { id: "regular", name: "Regular Fit", description: "Classic comfortable fit" },
    { id: "loose", name: "Loose Fit", description: "Relaxed and roomy" }
  ]

  // Shoulder type options with real image paths
  const shoulderOptions = [
    { 
      id: "normal", 
      name: "Normal Shoulder", 
      description: "Balanced shoulder width",
      image: "/images/jacket-configuration/fit-style/shoulder/normal.png"
    },
    { 
      id: "square", 
      name: "Square Shoulder", 
      description: "Broad, straight shoulders",
      image: "/images/jacket-configuration/fit-style/shoulder/square.png"
    },
    { 
      id: "sloping", 
      name: "Sloping Shoulder", 
      description: "Naturally sloped shoulders",
      image: "/images/jacket-configuration/fit-style/shoulder/sloping.png"
    }
  ]

  // Back shape options with real image paths
  const backOptions = [
    { 
      id: "ideal", 
      name: "Ideal Back", 
      description: "Straight, well-aligned posture",
      image: "/images/jacket-configuration/fit-style/back/ideal.png"
    },
    { 
      id: "flat", 
      name: "Flat Back", 
      description: "Less curved lower back",
      image: "/images/jacket-configuration/fit-style/back/flat.png"
    },
    { 
      id: "sway", 
      name: "Sway Back", 
      description: "Pronounced lower back curve",
      image: "/images/jacket-configuration/fit-style/back/sway.png"
    },
    { 
      id: "rounded", 
      name: "Rounded Back", 
      description: "Forward shoulder posture",
      image: "/images/jacket-configuration/fit-style/back/rounded.png"
    }
  ]

  // Belly type options with real image paths
  const bellyOptions = [
    { 
      id: "slim", 
      name: "Slim", 
      description: "Lean midsection",
      image: "/images/jacket-configuration/fit-style/belly/slim.png"
    },
    { 
      id: "normal", 
      name: "Normal", 
      description: "Average midsection",
      image: "/images/jacket-configuration/fit-style/belly/normal.png"
    },
    { 
      id: "large", 
      name: "Large", 
      description: "Fuller midsection",
      image: "/images/jacket-configuration/fit-style/belly/large.png"
    }
  ]

  const handleBodyShapeChange = (type: 'shoulderType' | 'backShape' | 'bellyType', value: string) => {
    setBodyShape({
      ...bodyShape,
      [type]: value
    })
  }

  return (
    <div className="space-y-8" style={{ fontFamily: 'Concord W00 ExtraLight, Arial, sans-serif' }}>
      {/* Fit Preference Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Shirt className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-medium text-gray-900">Fit Preference</h3>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {fitOptions.map((option) => (
            <motion.div
              key={option.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                onClick={() => setFitPreference(option.id)}
                className={`cursor-pointer transition-all border-2 €{
                  fitPreference === option.id
                    ? "border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-200"
                    : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{option.name}</h4>
                      <p className="text-sm text-gray-600">{option.description}</p>
                    </div>
                    {fitPreference === option.id && (
                      <Check className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Body Shape Selection */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <User className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-medium text-gray-900">Body Shape Profile</h3>
        </div>

        {/* Shoulder Types */}
        <div className="mb-8">
          <h4 className="font-medium text-gray-900 mb-3">Shoulder Type</h4>
          <div className="grid grid-cols-1 gap-3">
            {shoulderOptions.map((option) => (
              <motion.div
                key={option.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <Card
                  onClick={() => handleBodyShapeChange('shoulderType', option.id)}
                  className={`cursor-pointer transition-all border-2 €{
                    bodyShape.shoulderType === option.id
                      ? "border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-200"
                      : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Body shape image */}
                      <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-200 flex-shrink-0 p-2">
                        <img 
                          src={option.image} 
                          alt={option.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900">{option.name}</h5>
                        <p className="text-sm text-gray-600">{option.description}</p>
                      </div>
                      {bodyShape.shoulderType === option.id && (
                        <Check className="w-5 h-5 text-blue-500 flex-shrink-0" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Back Shapes */}
        <div className="mb-8">
          <h4 className="font-medium text-gray-900 mb-3">Back Shape</h4>
          <div className="grid grid-cols-1 gap-3">
            {backOptions.map((option) => (
              <motion.div
                key={option.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <Card
                  onClick={() => handleBodyShapeChange('backShape', option.id)}
                  className={`cursor-pointer transition-all border-2 €{
                    bodyShape.backShape === option.id
                      ? "border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-200"
                      : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Body shape image */}
                      <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-200 flex-shrink-0 p-2">
                        <img 
                          src={option.image} 
                          alt={option.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900">{option.name}</h5>
                        <p className="text-sm text-gray-600">{option.description}</p>
                      </div>
                      {bodyShape.backShape === option.id && (
                        <Check className="w-5 h-5 text-blue-500 flex-shrink-0" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Belly Types */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Belly Type</h4>
          <div className="grid grid-cols-1 gap-3">
            {bellyOptions.map((option) => (
              <motion.div
                key={option.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <Card
                  onClick={() => handleBodyShapeChange('bellyType', option.id)}
                  className={`cursor-pointer transition-all border-2 €{
                    bodyShape.bellyType === option.id
                      ? "border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-200"
                      : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Body shape image */}
                      <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-200 flex-shrink-0 p-2">
                        <img 
                          src={option.image} 
                          alt={option.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900">{option.name}</h5>
                        <p className="text-sm text-gray-600">{option.description}</p>
                      </div>
                      {bodyShape.bellyType === option.id && (
                        <Check className="w-5 h-5 text-blue-500 flex-shrink-0" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Selection Summary */}
      {(fitPreference || bodyShape.shoulderType || bodyShape.backShape || bodyShape.bellyType) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Your Selections</h4>
          <div className="space-y-1 text-sm text-blue-800">
            {fitPreference && (
              <div className="flex justify-between">
                <span>Fit Preference:</span>
                <span className="font-medium">{fitOptions.find(o => o.id === fitPreference)?.name}</span>
              </div>
            )}
            {bodyShape.shoulderType && (
              <div className="flex justify-between">
                <span>Shoulder Type:</span>
                <span className="font-medium">{shoulderOptions.find(o => o.id === bodyShape.shoulderType)?.name}</span>
              </div>
            )}
            {bodyShape.backShape && (
              <div className="flex justify-between">
                <span>Back Shape:</span>
                <span className="font-medium">{backOptions.find(o => o.id === bodyShape.backShape)?.name}</span>
              </div>
            )}
            {bodyShape.bellyType && (
              <div className="flex justify-between">
                <span>Belly Type:</span>
                <span className="font-medium">{bellyOptions.find(o => o.id === bodyShape.bellyType)?.name}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
