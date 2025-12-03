# Icon Review Checklist

Use this checklist when reviewing icon contribution PRs.

## Technical Requirements

- [ ] **Format**: SVG file format
- [ ] **Dimensions**: 256x256 pixels with proper viewBox
- [ ] **File Size**: Under 50KB (ideally under 20KB)
- [ ] **Naming**: Follows `IconName.svg` or `IconName-Dark.svg`/`IconName-Light.svg` convention
- [ ] **No Scripts**: SVG contains no `<script>` elements
- [ ] **No External Resources**: No external images or fonts referenced
- [ ] **Valid SVG**: Properly structured SVG 1.1 compliant markup

## Theme Requirements

- [ ] **Themed Pair**: If icon has variants, both Dark and Light versions provided
- [ ] **Consistent Design**: Both variants are visually consistent
- [ ] **Contrast**: Each variant has appropriate contrast for its intended background

## Visual Quality

- [ ] **Recognizable**: Icon is clearly identifiable as the intended brand/technology
- [ ] **Clean Design**: No artifacts, rough edges, or visual glitches
- [ ] **Appropriate Detail**: Not too complex, renders well at small sizes
- [ ] **Centered**: Icon is properly centered within the viewBox
- [ ] **Consistent Style**: Matches the overall style of existing icons

## Legal & Attribution

- [ ] **Permission**: Contributor has rights to submit this icon
- [ ] **Trademark Compliance**: Icon respects trademark guidelines of the brand
- [ ] **No Copyright Issues**: Not copied from a proprietary source without permission

## Optimization

- [ ] **SVGO Optimized**: Icon passes SVGO optimization check
- [ ] **No Redundant Elements**: No unnecessary groups, transforms, or attributes
- [ ] **Efficient Paths**: Paths are simplified where possible

## CI Checks

- [ ] **Validation Passes**: `mise run validate` succeeds
- [ ] **Build Passes**: `mise run build` succeeds
- [ ] **Size Report**: Reviewed size impact in CI output

---

## Review Decision

- [ ] **APPROVED**: All requirements met, ready to merge
- [ ] **CHANGES REQUESTED**: Issues identified, needs revision
- [ ] **REJECTED**: Does not meet requirements or not appropriate for inclusion

### Notes for Contributor

_Add any feedback or requested changes here_
