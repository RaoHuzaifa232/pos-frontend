# Dark Theme Implementation for POS Frontend

This document describes the dark theme implementation for the POS (Point of Sale) frontend application.

## Features

- **Automatic Theme Detection**: Automatically detects system preference (light/dark)
- **Manual Theme Selection**: Users can manually choose between light, dark, or system themes
- **Persistent Storage**: Theme preference is saved in localStorage
- **Smooth Transitions**: All theme changes include smooth color transitions
- **Comprehensive Coverage**: Dark theme applied to all major components

## How to Use

### Quick Theme Toggle
- **Fixed Position Button**: A floating theme toggle button is available in the top-right corner of the screen
- **Navigation Bar**: Theme toggle button in the main navigation bar
- **Settings Page**: Full theme management in the Settings section

### Theme Options

1. **Light Theme**: Classic light appearance with white backgrounds and dark text
2. **Dark Theme**: Modern dark appearance with dark backgrounds and light text
3. **System Theme**: Automatically follows your operating system's theme preference

### Accessing Theme Settings

1. Navigate to the **Settings** tab in the main navigation
2. In the **Appearance** section, you'll find:
   - Three theme selection buttons (Light, Dark, System)
   - A quick toggle switch for dark mode
   - Visual indicators showing the current theme

## Technical Implementation

### Theme Service (`src/app/services/theme.service.ts`)

The core theme management is handled by the `ThemeService`:

- **Signals**: Uses Angular signals for reactive theme state management
- **localStorage**: Persists theme preference across browser sessions
- **System Detection**: Automatically detects OS theme preference
- **CSS Classes**: Applies `dark` or `light` classes to the document root

### Tailwind Configuration

The dark theme is implemented using Tailwind CSS:

- **Dark Mode**: Set to `'class'` for manual control
- **CSS Variables**: Custom CSS variables for consistent theming
- **Responsive Design**: Dark theme works across all screen sizes

### Component Integration

All major components have been updated with dark mode support:

- **Layout Components**: Main navigation, sidebar, and content areas
- **Dashboard**: Inventory dashboard with dark mode styling
- **Forms**: Input fields, buttons, and form elements
- **Cards**: All card components with dark backgrounds and borders

## CSS Classes Used

### Background Colors
- `bg-white dark:bg-gray-800` - Main content areas
- `bg-gray-50 dark:bg-gray-800` - Secondary backgrounds
- `bg-gray-100 dark:bg-gray-900` - Page backgrounds

### Text Colors
- `text-gray-900 dark:text-white` - Primary text
- `text-gray-600 dark:text-gray-400` - Secondary text
- `text-gray-500 dark:text-gray-500` - Muted text

### Border Colors
- `border-gray-200 dark:border-gray-700` - Standard borders
- `border-gray-300 dark:border-gray-600` - Hover state borders

### Interactive Elements
- `hover:bg-gray-100 dark:hover:bg-gray-700` - Hover states
- `bg-blue-100 dark:bg-blue-900/30` - Active/selected states

## Customization

### Adding Dark Mode to New Components

1. **Import ThemeService**: Inject the service into your component
2. **Add Dark Classes**: Use `dark:` prefixed Tailwind classes
3. **Test Both Themes**: Ensure your component looks good in both light and dark modes

### Example Component Template

```html
<div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
  <h2 class="text-gray-900 dark:text-white">Title</h2>
  <p class="text-gray-600 dark:text-gray-400">Description</p>
  <button class="bg-blue-500 hover:bg-blue-600 text-white">
    Action
  </button>
</div>
```

### CSS Variables

Custom CSS variables are available for consistent theming:

```css
:root {
  --primary-color: #2563eb;
  --background-light: #f9fafb;
  --background-dark: #111827;
  --surface-light: #ffffff;
  --surface-dark: #1f2937;
}
```

## Browser Support

- **Modern Browsers**: Full support for Chrome, Firefox, Safari, Edge
- **CSS Custom Properties**: Requires CSS custom properties support
- **localStorage**: Requires localStorage support for theme persistence

## Performance Considerations

- **CSS Transitions**: Smooth theme switching with minimal performance impact
- **No JavaScript Rendering**: Theme changes are handled via CSS classes
- **Efficient Updates**: Only necessary DOM elements are updated

## Accessibility

- **High Contrast**: Dark theme maintains WCAG contrast requirements
- **Focus Indicators**: Clear focus states for keyboard navigation
- **Screen Readers**: Theme changes are properly announced to assistive technologies

## Troubleshooting

### Theme Not Persisting
- Check if localStorage is enabled in your browser
- Verify the browser supports localStorage

### Dark Mode Not Working
- Ensure Tailwind CSS is properly configured
- Check that `darkMode: 'class'` is set in `tailwind.config.js`
- Verify the `ThemeService` is properly injected

### Styling Issues
- Check for conflicting CSS rules
- Ensure dark mode classes are properly applied
- Verify component imports include the ThemeService

## Future Enhancements

- **Custom Color Schemes**: User-defined color preferences
- **Theme Presets**: Pre-built theme variations
- **Animation Options**: Customizable transition effects
- **Export/Import**: Share theme preferences across devices
