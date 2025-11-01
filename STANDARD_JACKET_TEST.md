# Standard Jacket Model Testing Guide

## Ready to Test Your Standard Jacket Model! 🎯

The system is now set up to handle your basic GLTF jacket model. Here's what I've prepared:

### What's Ready:
1. **StandardJacketViewer** - Simple viewer for basic jacket models
2. **Automatic Part Detection** - Finds jacket parts by common naming patterns
3. **Basic Customizations** - Color changes and fabric properties
4. **Error Handling** - Clear feedback if model doesn't load

### How to Test:

#### Step 1: Add Your Model
Place your standard jacket GLTF model at:
```
public/models/jackets/basic-jacket.gltf
```

#### Step 2: Model Naming
Your jacket model can use any of these common names:

**Main Body:**
- `jacket`, `body`, `main`, `torso`, `jacket_body`, `main_body`

**Sleeves:**
- `sleeve_left`/`sleeve_right`
- `left_sleeve`/`right_sleeve` 
- `arm_left`/`arm_right`

**Collar:**
- `collar`, `jacket_collar`

**Buttons:**
- `button`, `buttons`, `button_front`

**Pockets:**
- `pocket`, `pockets`

**Lining:**
- `lining`, `inner`, `inside`

*The system is case-insensitive and checks many variations!*

#### Step 3: Test in Configurator
1. Navigate to any jacket configurator
2. The system will automatically try to load your GLTF model
3. You can test these customizations:
   - **Fabric Color** - Changes main jacket color
   - **Fabric Type** - Adjusts material properties (wool, silk, cotton, etc.)
   - **Button Color** - Changes button colors
   - **Lining Color** - Changes inner lining color

### Current Configuration:
- Using `useStandardJacket={true}` for simple testing
- Loads from `/models/jackets/basic-jacket.gltf`
- Falls back to geometric shapes if model fails

### Testing Checklist:
- [ ] Model loads without errors
- [ ] Fabric color changes work
- [ ] Fabric type affects material appearance
- [ ] Button colors change (if buttons are named correctly)
- [ ] Lining color changes (if lining exists)

### If Something Doesn't Work:
1. **Check browser console** for error messages
2. **Verify file path** is correct
3. **Check model part names** in your 3D software
4. **Test with different naming** if parts aren't detected

### What's Next:
Once your standard model is working:
1. ✅ **I'll help you extend it** with swappable components
2. ✅ **Add advanced customizations** like different lapel/pocket styles
3. ✅ **Create part-swapping system** for maximum flexibility

### Quick Test Commands:
```javascript
// In browser console, you can check what parts were found:
// Look for console messages like "Found jacket body: your_part_name"
```

Ready to test! Let me know how the standard model loading goes, and then we can move to the customizable components phase! 🚀