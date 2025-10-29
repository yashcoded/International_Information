# Scroll to Top Button Feature

## Overview

The scroll-to-top button is a floating action button that appears when users scroll down in the conversation interface, allowing them to quickly return to the top of the conversation with a smooth animation.

## Implementation Details

### Component Location

- **File**: `pages/TravelInfo.tsx`
- **Styles**: `pages/TravelInfo.module.css`

### State Management

```typescript
const [showScrollToTop, setShowScrollToTop] = useState<boolean>(false);
```

The button visibility is controlled by this boolean state, which updates based on the scroll position.

### Scroll Detection

```typescript
useEffect(() => {
  const chatMessages = chatMessagesRef.current;
  if (!chatMessages) return;

  const handleScroll = () => {
    const scrollTop = chatMessages.scrollTop;
    setShowScrollToTop(scrollTop > 300);
  };

  chatMessages.addEventListener('scroll', handleScroll);
  return () => chatMessages.removeEventListener('scroll', handleScroll);
}, [conversationHistory.length]);
```

**How it works:**
1. Listens to scroll events on the `.chatMessages` container
2. Shows button when scrolled more than 300px from the top
3. Hides button when within 300px of the top
4. Cleans up event listener when component unmounts

### Scroll to Top Function

```typescript
const scrollToTop = () => {
  chatMessagesRef.current?.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
};
```

Uses the browser's native `scrollTo` API with smooth behavior for a pleasant animation.

### JSX Structure

```tsx
{showScrollToTop && (
  <button
    className={styles.scrollToTopButton}
    onClick={scrollToTop}
    title="Scroll to top"
  >
    ↑
  </button>
)}
```

The button:
- Only renders when `showScrollToTop` is true
- Displays an upward arrow (↑) symbol
- Has a descriptive title for accessibility

## Styling

### Base Styles (Dark Theme)

```css
.scrollToTopButton {
  position: fixed;
  bottom: 32px;
  right: 32px;
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 1.5rem;
  cursor: pointer;
  box-shadow: 
    0 8px 24px rgba(59, 130, 246, 0.4),
    0 4px 12px rgba(0, 0, 0, 0.2);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeInUp 0.3s ease-out;
}
```

**Key Design Choices:**
- **Fixed positioning**: Stays in view while scrolling
- **Circular shape**: 56×56px circle (common FAB size)
- **Blue gradient**: Matches the app's primary color scheme
- **High z-index**: Ensures it stays above other elements
- **Flexbox centering**: Centers the arrow icon perfectly
- **Entry animation**: Fades in with upward motion

### Hover Effects

```css
.scrollToTopButton:hover {
  transform: translateY(-4px);
  box-shadow: 
    0 12px 32px rgba(59, 130, 246, 0.5),
    0 6px 16px rgba(0, 0, 0, 0.3);
  background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
}

.scrollToTopButton:active {
  transform: translateY(-2px);
}
```

**Interactive States:**
- **Hover**: Lifts up 4px with enhanced shadow and darker gradient
- **Active**: Reduces lift to 2px for pressed feedback

### Light Theme Support

```css
[data-theme='light'] .scrollToTopButton {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  box-shadow: 
    0 8px 24px rgba(59, 130, 246, 0.3),
    0 4px 12px rgba(0, 0, 0, 0.1);
}

[data-theme='light'] .scrollToTopButton:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
}
```

The button maintains good contrast in both themes with slightly adjusted shadow opacity for light mode.

## User Experience

### Behavior Flow

1. **Initial State**: Button is hidden when at the top of conversation
2. **User scrolls down**: Button fades in after 300px
3. **User clicks button**: Smooth scroll animation to top
4. **Reached top**: Button automatically fades out

### Why 300px Threshold?

- Prevents button from appearing too early
- Ensures there's enough content scrolled past to justify the feature
- Common UX pattern across modern web applications
- Balances visibility with non-intrusiveness

### Accessibility Features

- **ARIA title**: "Scroll to top" tooltip on hover
- **Large click target**: 56×56px exceeds minimum 44×44px accessibility guidelines
- **High contrast**: Blue gradient on dark/light backgrounds
- **Visual feedback**: Hover and active states clearly visible
- **Semantic HTML**: Uses `<button>` element for proper keyboard navigation

## Mobile Considerations

The button works seamlessly on mobile:
- **Touch-friendly**: 56px size is perfect for touch targets
- **Fixed positioning**: Stays accessible during scroll
- **Smooth animation**: Uses native browser scrolling for optimal performance
- **No conflicts**: Positioned to avoid overlap with other UI elements

## Performance

### Optimization Strategies

1. **Event listener cleanup**: Properly removes scroll listener on unmount
2. **Conditional rendering**: Button only exists in DOM when needed
3. **CSS animations**: Uses hardware-accelerated transforms
4. **Smooth scrolling**: Delegates to browser's native implementation
5. **Minimal re-renders**: State only updates on threshold crossing

### Memory Management

The `useEffect` dependency array includes `conversationHistory.length` to:
- Reinitialize listener when conversation updates
- Ensure scroll detection works after dynamic content changes
- Clean up and recreate listener as needed

## Testing

Comprehensive test coverage in `tests/scroll-to-top.spec.ts`:

### Test Cases

1. ✅ Initial state (button hidden)
2. ✅ Button appearance on scroll
3. ✅ Scroll to top functionality
4. ✅ Button hide on reaching top
5. ✅ Styling and hover effects
6. ✅ Theme compatibility

### Running Tests

```bash
# Run all scroll-to-top tests
pnpm test tests/scroll-to-top.spec.ts

# Run in UI mode for debugging
pnpm test:ui tests/scroll-to-top.spec.ts

# Run with browser visible
pnpm test:headed tests/scroll-to-top.spec.ts
```

See [TESTING.md](./TESTING.md) for comprehensive testing documentation.

## Future Enhancements

Potential improvements for consideration:

- [ ] **Progress indicator**: Show scroll progress ring around button
- [ ] **Configurable threshold**: Allow users to set when button appears
- [ ] **Keyboard shortcut**: Add hotkey (e.g., Home key) support
- [ ] **Position options**: Allow button placement customization
- [ ] **Animation variants**: Different entry/exit animations
- [ ] **Scroll position memory**: Remember scroll position on navigation

## Browser Compatibility

The feature uses standard web APIs with excellent browser support:

- **Element.scrollTo()**: Supported in all modern browsers
- **CSS transforms**: Full support
- **CSS gradients**: Full support
- **Smooth scrolling**: Gracefully degrades to instant scroll in older browsers

## Dependencies

No external dependencies required:
- ✅ Pure React hooks (`useState`, `useEffect`, `useRef`)
- ✅ Vanilla JavaScript scroll APIs
- ✅ CSS for styling and animations
- ✅ No third-party libraries

## Code Quality

### TypeScript

Fully typed with TypeScript:
```typescript
const [showScrollToTop, setShowScrollToTop] = useState<boolean>(false);
```

### Linting

Passes all ESLint checks with no warnings or errors.

### Best Practices

- ✅ Single Responsibility Principle
- ✅ Declarative React patterns
- ✅ Proper cleanup in effects
- ✅ Semantic HTML
- ✅ Accessible design
- ✅ Performance optimized

## Related Documentation

- [DESIGN_CHANGES.md](./DESIGN_CHANGES.md) - Overall design system
- [TESTING.md](./TESTING.md) - Testing guide
- [CONVERSATION_JUMP_TO_FIX.md](./CONVERSATION_JUMP_TO_FIX.md) - Related navigation feature

---

*Last Updated: October 29, 2025*

