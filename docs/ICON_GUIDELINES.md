# Icon Submission Guidelines

This document outlines the requirements and process for contributing icons to TechBadges.

## Table of Contents

- [Technical Requirements](#technical-requirements)
- [Visual Guidelines](#visual-guidelines)
- [Naming Conventions](#naming-conventions)
- [Themed Icons](#themed-icons)
- [Submission Process](#submission-process)
- [Review Criteria](#review-criteria)

## Technical Requirements

### File Format
- **Format**: SVG only (no PNG, JPG, or other raster formats)
- **SVG Version**: SVG 1.1
- **File Extension**: `.svg` (lowercase)

### Dimensions
- **Canvas Size**: 256x256 pixels
- **ViewBox**: `viewBox="0 0 256 256"`
- **Width/Height**: `width="256" height="256"`

### File Size
- **Maximum**: 50KB
- **Recommended**: Under 20KB
- **Optimization**: Run through SVGO before submission

### SVG Structure
```xml
<svg width="256" height="256" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Background (rounded rectangle) -->
  <rect width="256" height="256" rx="60" fill="#000000"/>

  <!-- Icon content -->
  <path d="..." fill="#FFFFFF"/>
</svg>
```

### Prohibited Elements
- No embedded raster images (`<image>` with base64 or external URLs)
- No external references (fonts, stylesheets, images)
- No JavaScript or `<script>` tags
- No animations (`<animate>`, CSS animations)
- No `<foreignObject>` elements
- No inline styles with `url()` references

### Recommended Practices
- Use paths (`<path>`) instead of basic shapes when possible
- Minimize decimal precision (2 decimal places max)
- Remove unnecessary groups and transforms
- Remove metadata, comments, and editor artifacts
- Use `fill` instead of `stroke` where possible

## Visual Guidelines

### Background
- Use a rounded rectangle with `rx="60"` as the background
- Background should provide good contrast with the icon
- For dark theme: Dark background (e.g., `#1a1a2e`, `#242938`)
- For light theme: Light background (e.g., `#ffffff`, `#f5f5f5`)

### Icon Placement
- Center the icon within the canvas
- Maintain adequate padding (at least 40px from edges)
- Icon should be clearly visible at 48x48 pixels

### Colors
- Use the official brand colors when available
- Ensure sufficient contrast between icon and background
- Avoid gradients if they significantly increase file size

### Consistency
- Icons should feel cohesive with the existing collection
- Maintain similar visual weight to other icons
- Avoid overly complex or detailed designs

## Naming Conventions

### Standard Icons
- Use PascalCase: `JavaScript.svg`, `React.svg`, `NodeJS.svg`
- Use the technology's official name
- No spaces or special characters

### Themed Icons
- Append `-Dark` or `-Light` to the base name
- Example: `React-Dark.svg`, `React-Light.svg`
- Both variants must be provided together

### Examples

| Technology | File Name(s) |
|------------|--------------|
| React | `React-Dark.svg`, `React-Light.svg` |
| Docker | `Docker.svg` |
| Visual Studio Code | `VSCode-Dark.svg`, `VSCode-Light.svg` |
| JavaScript | `JavaScript.svg` |

## Themed Icons

Icons that need different versions for dark and light backgrounds should provide both variants.

### When to Create Themed Versions
- Icon has light elements that disappear on light backgrounds
- Icon has dark elements that disappear on dark backgrounds
- Brand guidelines specify different versions for different backgrounds

### Theme Requirements
- **Dark variant**: Optimized for dark backgrounds (light foreground colors)
- **Light variant**: Optimized for light backgrounds (dark foreground colors)
- Both variants must be submitted together
- File sizes should be similar between variants

### Example Comparison

**Dark Variant (`Icon-Dark.svg`)**:
- Dark background (`#242938`)
- Light/colored icon elements

**Light Variant (`Icon-Light.svg`)**:
- Light background (`#ffffff`)
- Dark/colored icon elements

## Submission Process

### Step 1: Check Existing Icons
- Search the icons directory for the technology
- Check open issues for existing requests
- Ensure the icon doesn't already exist

### Step 2: Open an Issue
1. Go to the Issues tab
2. Select "Icon Suggestion" template
3. Fill out all required fields:
   - Technology/skill name
   - Official website
   - Why this icon should be added
   - Reference to official logo/branding

### Step 3: Wait for Approval
- A maintainer will review your suggestion
- Discussion may happen in the issue
- Wait for explicit approval before creating a PR

### Step 4: Create Your Icon
- Follow all technical requirements above
- Use the official branding as reference
- Optimize with SVGO

### Step 5: Submit a Pull Request
1. Fork the repository
2. Add your icon(s) to the `icons/` directory
3. Create a PR using the template
4. Link to the approved issue
5. Wait for review

## Review Criteria

Your icon submission will be evaluated on:

### Technical Compliance
- [ ] Valid SVG structure
- [ ] Correct dimensions (256x256)
- [ ] File size under 50KB
- [ ] No prohibited elements
- [ ] Proper naming convention

### Visual Quality
- [ ] Clear and recognizable at 48x48 pixels
- [ ] Consistent with existing icon style
- [ ] Proper use of brand colors
- [ ] Adequate contrast and padding

### Legal/Brand Compliance
- [ ] Respects trademark guidelines
- [ ] Uses official brand assets as reference
- [ ] Appropriate for open-source use

### Completeness
- [ ] Both themed variants provided (if applicable)
- [ ] Linked to approved issue
- [ ] PR template filled out completely

## Optimizing Your SVG

Before submission, optimize your SVG using SVGO:

```bash
# Install SVGO globally
npm install -g svgo

# Optimize a single file
svgo icon.svg -o icon.svg

# Check optimization without modifying
svgo icon.svg --dry-run
```

### Recommended SVGO Configuration

```yaml
# .svgo.yml
multipass: true
plugins:
  - preset-default
  - removeXMLNS
  - removeDimensions: false
  - removeAttrs:
      attrs:
        - 'data-*'
        - 'class'
  - sortAttrs
```

## Questions?

If you have questions about icon submissions:
- Comment on your issue
- Ask in discussions
- Review existing icons for reference

Thank you for contributing to TechBadges!
