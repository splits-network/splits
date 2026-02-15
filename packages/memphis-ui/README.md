# @splits-network/memphis-ui

Memphis UI design system for Splits Network. Provides React components, Tailwind CSS theme, and utilities following the Memphis design aesthetic.

## Design Principles

- **FLAT design** - No shadows, no gradients
- **Sharp corners** - border-radius: 0 everywhere
- **Thick borders** - 4px standard border width
- **Bold colors** - coral, teal, yellow, purple, dark, cream
- **Accent cycling** - Rotate through accent colors for lists and repeating elements
- **Clean and geometric** - Memphis-inspired shapes and patterns

## Installation

```bash
pnpm add @splits-network/memphis-ui
```

## Setup

### Import the theme CSS in your Tailwind config

```css
@import "@splits-network/memphis-ui/theme.css";
```

### Use the Tailwind plugin (optional)

```typescript
import { memphisPlugin } from '@splits-network/memphis-ui';

// Add to your Tailwind config plugins
```

## Components

### Button

```tsx
import { Button } from '@splits-network/memphis-ui';

<Button variant="coral" size="md">Click Me</Button>
<Button variant="teal" size="lg">Save</Button>
<Button variant="dark" disabled>Disabled</Button>
```

Variants: `coral`, `teal`, `yellow`, `purple`, `dark`
Sizes: `sm`, `md`, `lg`

### Card

```tsx
import { Card } from '@splits-network/memphis-ui';

<Card>Basic card content</Card>
<Card accent="teal">Card with teal accent border</Card>
<Card dark>Dark background card</Card>
```

### Badge

```tsx
import { Badge } from '@splits-network/memphis-ui';

<Badge variant="coral">Active</Badge>
<Badge variant="teal" outline>Open</Badge>
<Badge variant="purple">Info</Badge>
```

### Input

```tsx
import { Input } from '@splits-network/memphis-ui';

<Input label="Email" placeholder="Enter email" />
<Input label="Name" error="Required field" />
```

### Select

```tsx
import { Select } from '@splits-network/memphis-ui';

<Select
    label="Status"
    placeholder="Choose..."
    options={[
        { value: 'open', label: 'Open' },
        { value: 'closed', label: 'Closed' },
    ]}
/>
```

### Modal

```tsx
import { Modal } from '@splits-network/memphis-ui';

<Modal open={isOpen} onClose={() => setIsOpen(false)} title="Confirm">
    <p>Are you sure?</p>
</Modal>
```

### Table

```tsx
import { Table } from '@splits-network/memphis-ui';

<Table
    columns={[
        { key: 'name', header: 'Name' },
        { key: 'status', header: 'Status', render: (item) => <Badge>{item.status}</Badge> },
    ]}
    data={items}
    keyExtractor={(item) => item.id}
    onRowClick={(item) => navigate(item.id)}
/>
```

### Tabs

```tsx
import { Tabs } from '@splits-network/memphis-ui';

<Tabs
    tabs={[
        { key: 'overview', label: 'Overview' },
        { key: 'details', label: 'Details' },
    ]}
    activeKey={activeTab}
    onChange={setActiveTab}
    accent="coral"
/>
```

### GeometricDecoration

```tsx
import { GeometricDecoration } from '@splits-network/memphis-ui';

<GeometricDecoration shape="circle" color="coral" size={40} />
<GeometricDecoration shape="triangle" color="teal" size={24} />
<GeometricDecoration shape="zigzag" color="yellow" size={60} />
```

Shapes: `circle`, `square`, `triangle`, `cross`, `zigzag`

### AccentCycle

```tsx
import { AccentCycle, Card } from '@splits-network/memphis-ui';

<AccentCycle count={items.length}>
    {(color, hex, index) => (
        <Card key={index} accent={color}>
            {items[index].name}
        </Card>
    )}
</AccentCycle>
```

## Utilities

### Accent Color Functions

```typescript
import {
    getAccentColor,
    getAccentHex,
    getAccentText,
    ACCENT_COLORS,
    ACCENT_HEX,
} from '@splits-network/memphis-ui';

// Get color name by index (cycles)
getAccentColor(0); // 'coral'
getAccentColor(4); // 'coral' (wraps around)

// Get hex value by index
getAccentHex(1); // '#4ECDC4'

// Get contrast text color
getAccentText(0); // '#FFFFFF' (white on coral)
getAccentText(1); // '#1A1A2E' (dark on teal)
```

### useAccentCycle Hook

```typescript
import { useAccentCycle } from '@splits-network/memphis-ui';

function MyComponent() {
    const { color, hex, textColor, next, reset } = useAccentCycle();
    // color: 'coral', hex: '#FF6B6B', textColor: '#FFFFFF'
    // Call next() to advance to the next color
}
```

## Color Palette

| Name   | Hex       | Usage                              |
| ------ | --------- | ---------------------------------- |
| Coral  | `#FF6B6B` | Primary actions, CTAs, errors      |
| Teal   | `#4ECDC4` | Secondary actions, success         |
| Yellow | `#FFE66D` | Accents, highlights, warnings      |
| Purple | `#A78BFA` | Tertiary accent, info, tags        |
| Dark   | `#1A1A2E` | Backgrounds, text, borders         |
| Cream  | `#F5F0EB` | Light backgrounds                  |
| White  | `#FFFFFF` | Card backgrounds                   |
