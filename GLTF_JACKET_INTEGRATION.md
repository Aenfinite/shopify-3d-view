# GLTF Jacket Model Integration Guide

## Overview

This system enables you to use actual GLTF 3D models for jacket customization instead of basic geometric shapes. It provides a flexible framework for mapping jacket customization options to specific parts of your GLTF models.

## Directory Structure

```
public/models/
├── jackets/
│   ├── basic-jacket.gltf        # Your main jacket model
│   ├── formal-jacket.gltf       # Optional: formal variant
│   └── blazer.gltf              # Optional: blazer variant
├── shirts/
│   └── (future shirt models)
└── pants/
    └── (future pants models)
```

## How to Add Your GLTF Jacket Model

### 1. Model Requirements

Your GLTF jacket model should have named parts/nodes that correspond to customizable elements:

**Recommended Naming Convention:**
- `jacket_body` or `body` - Main jacket body
- `sleeve_left`, `sleeve_right` - Left and right sleeves
- `front_left`, `front_right` - Front panels
- `lapel_notched_left`, `lapel_notched_right` - Notched lapels
- `lapel_peak_left`, `lapel_peak_right` - Peak lapels
- `lapel_shawl_left`, `lapel_shawl_right` - Shawl lapels
- `pocket_chest_welt`, `pocket_chest_flap` - Chest pockets
- `pocket_waist_welt`, `pocket_waist_flap` - Waist pockets
- `button_front_single`, `button_front_double` - Button configurations
- `collar`, `collar_standard` - Collar variations
- `cuff_left`, `cuff_right` - Sleeve cuffs
- `lining` - Inner lining

### 2. Adding Your Model

1. Export your jacket model as a GLTF file from your 3D software (Blender, Maya, etc.)
2. Place the file in `public/models/jackets/`
3. Update the model path in the configurator components

### 3. Model Configuration

The system uses flexible name matching, so it will work with various naming conventions:

**Alternative Names Supported:**
- Body: `main_body`, `torso`, `jacket_main`
- Sleeves: `arm_left`, `left_arm`, `l_sleeve`
- Front: `panel_left`, `left_panel`
- And many more...

## Customization Mapping

### Jacket Parts Mapping

The system automatically maps customization options to model parts:

```typescript
// Example customization mapping
{
  fabricColor: "#FF0000",        // Applied to body, sleeves, front panels
  fabricType: "wool",            // Affects material roughness/metalness
  lapelStyle: "peak",           // Shows peak lapels, hides others
  pocketStyle: "flap",          // Shows flap pockets, hides welt/patch
  frontStyle: "double-breasted", // Shows double-breasted buttons
  liningColor: "#0000FF"        // Applied to lining parts
}
```

### Supported Customizations

1. **Fabric Properties**
   - `fabricColor` - Main fabric color
   - `fabricType` - Material properties (wool, silk, cotton, etc.)

2. **Lapel Styles**
   - `notched` - Classic business style
   - `peak` - Formal style
   - `shawl` - Rounded style

3. **Pocket Styles**
   - `welt` - Clean, minimal pockets
   - `flap` - Traditional flap pockets
   - `patch` - Patch pockets

4. **Front Styles**
   - `single-breasted` - Single row of buttons
   - `double-breasted` - Double row of buttons

5. **Additional Options**
   - `collarStyle` - Collar variations
   - `liningColor` - Inner lining color
   - `ventStyle` - Back vent configuration

## Usage in Components

### Basic Usage

```tsx
import { ModelViewer } from "@/components/3d-model-viewer"

// In your configurator component
<ModelViewer
  modelUrl="sample-jacket"
  useGLTF={true}
  gltfModelPath="/models/jackets/basic-jacket.gltf"
  customizations={{
    fabricColor: "#000080",
    lapelStyle: "peak",
    pocketStyle: "flap",
    frontStyle: "single-breasted"
  }}
/>
```

### Advanced Usage with Custom Model

```tsx
import { GLTFModelViewer } from "@/components/gltf-model-viewer"

<GLTFModelViewer
  modelPath="/models/jackets/your-custom-jacket.gltf"
  customizations={{
    fabricColor: "#FF0000",
    fabricType: "velvet",
    lapelStyle: "shawl",
    liningColor: "#FFFF00"
  }}
  fallbackToGeometry={true}  // Falls back to basic shapes if GLTF fails
/>
```

## Customizing the Parts Mapping

If your GLTF model uses different naming conventions, you can customize the mapping:

```typescript
// In lib/3d/jacket-parts-mapping.ts
export const customJacketMapping: JacketPartsMapping = {
  body: {
    meshNames: ["your_body_name", "main_jacket"],
    materialChanges: {
      color: true,
      texture: true
    }
  },
  sleeves: {
    left: {
      meshNames: ["your_left_sleeve", "arm_L"]
    },
    right: {
      meshNames: ["your_right_sleeve", "arm_R"]
    }
  }
  // ... more customizations
}
```

## Material Properties by Fabric Type

The system automatically adjusts material properties based on fabric type:

- **Wool**: roughness: 0.8, metalness: 0.0
- **Silk**: roughness: 0.2, metalness: 0.1
- **Cotton**: roughness: 0.9, metalness: 0.0
- **Velvet**: roughness: 0.95, metalness: 0.0
- **Leather**: roughness: 0.3, metalness: 0.0

## Performance Considerations

1. **Model Caching**: Models are cached after first load
2. **Fallback System**: Automatically falls back to geometric shapes if GLTF fails
3. **Optimization**: Use compressed GLTF (.glb) for better performance

## Troubleshooting

### Model Not Loading
1. Check file path is correct
2. Ensure GLTF file is valid
3. Check browser console for errors
4. Verify model is accessible (test direct URL)

### Parts Not Responding to Customization
1. Check part names in your GLTF model
2. Update the parts mapping if needed
3. Ensure materials are properly set up in the model

### Performance Issues
1. Reduce model polygon count
2. Optimize textures
3. Use .glb instead of .gltf for compression

## File Structure After Integration

```
lib/3d/
├── jacket-model-loader.ts      # Main GLTF loader class
├── jacket-parts-mapping.ts     # Parts mapping configuration
├── model-analyzer.ts           # Model analysis utilities
└── fallback-models.ts          # Geometric fallback models

components/
├── gltf-model-viewer.tsx       # GLTF-specific viewer component
├── 3d-model-viewer.tsx         # Enhanced main viewer with GLTF support
└── configurator/
    ├── wireframe-configurator.tsx  # Updated with GLTF support
    ├── fullscreen-configurator.tsx # Updated with GLTF support
    └── universal-configurator.tsx  # Updated with GLTF support
```

## Next Steps

1. **Add Your Model**: Place your GLTF jacket model in `public/models/jackets/`
2. **Test Customizations**: Use the jacket configurator to test different options
3. **Customize Mapping**: Adjust part names in the mapping file if needed
4. **Add More Models**: Add additional jacket variants as needed
5. **Extend System**: Use similar approach for shirts and pants when ready

The system is now ready to work with your GLTF jacket models while maintaining backward compatibility with the existing geometric models!