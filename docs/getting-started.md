---
layout: default
title: Getting Started - TechBadges
description: Learn how to use TechBadges to showcase your skills
---

# Getting Started

## Basic Usage

To display icons in your README, use the following markdown:

```markdown
[![My Skills](https://techbadges.santosr2.xyz/icons?i=js,html,css,wasm)](https://techbadges.santosr2.xyz)
```

**Result:**

[![My Skills](https://techbadges.santosr2.xyz/icons?i=js,html,css,wasm)](https://techbadges.santosr2.xyz)

## Parameters

| Parameter | Description | Default | Example |
|-----------|-------------|---------|---------|
| `i` or `icons` | Comma-separated list of icon names | Required | `i=js,ts,react` |
| `t` or `theme` | Icon theme (`dark` or `light`) | `dark` | `theme=light` |
| `perline` | Number of icons per row (1-50) | `15` | `perline=8` |

## Themed Icons

Many icons have dark and light variants. The theme affects the background color:

**Dark Theme (default):**

```markdown
[![My Skills](https://techbadges.santosr2.xyz/icons?i=github,vscode,docker&theme=dark)](https://techbadges.santosr2.xyz)
```

[![My Skills](https://techbadges.santosr2.xyz/icons?i=github,vscode,docker&theme=dark)](https://techbadges.santosr2.xyz)

**Light Theme:**

```markdown
[![My Skills](https://techbadges.santosr2.xyz/icons?i=github,vscode,docker&theme=light)](https://techbadges.santosr2.xyz)
```

[![My Skills](https://techbadges.santosr2.xyz/icons?i=github,vscode,docker&theme=light)](https://techbadges.santosr2.xyz)

## Icons Per Line

Control the number of icons displayed per row:

```markdown
[![My Skills](https://techbadges.santosr2.xyz/icons?i=js,ts,react,vue,angular,svelte&perline=3)](https://techbadges.santosr2.xyz)
```

[![My Skills](https://techbadges.santosr2.xyz/icons?i=js,ts,react,vue,angular,svelte&perline=3)](https://techbadges.santosr2.xyz)

## Centering Icons

To center icons in your README:

```html
<p align="center">
  <a href="https://techbadges.santosr2.xyz">
    <img src="https://techbadges.santosr2.xyz/icons?i=git,kubernetes,docker,aws,gcp" />
  </a>
</p>
```

<p align="center">
  <a href="https://techbadges.santosr2.xyz">
    <img src="https://techbadges.santosr2.xyz/icons?i=git,kubernetes,docker,aws,gcp" />
  </a>
</p>

## Icon Aliases

Some icons have short aliases for convenience:

| Alias | Full Name |
|-------|-----------|
| `js` | `javascript` |
| `ts` | `typescript` |
| `py` | `python` |
| `md` | `markdown` |
| `postgres` | `postgresql` |
| `go` | `golang` |

## Examples

### Full Stack Developer

```markdown
[![My Skills](https://techbadges.santosr2.xyz/icons?i=react,nodejs,typescript,postgresql,docker,aws&perline=6)](https://techbadges.santosr2.xyz)
```

### DevOps Engineer

```markdown
[![My Skills](https://techbadges.santosr2.xyz/icons?i=kubernetes,docker,terraform,ansible,jenkins,prometheus&perline=6)](https://techbadges.santosr2.xyz)
```

### Data Scientist

```markdown
[![My Skills](https://techbadges.santosr2.xyz/icons?i=python,pytorch,tensorflow,jupyter,pandas,numpy&perline=6)](https://techbadges.santosr2.xyz)
```

## Next Steps

- Browse all [available icons](./icons)
- Check the [API reference](./api) for advanced usage
- [Contribute](https://github.com/santosr2/techbadges/blob/main/CONTRIBUTING.md) to the project
