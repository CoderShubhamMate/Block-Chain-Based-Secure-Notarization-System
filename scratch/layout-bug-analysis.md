# Layout Bug Analysis: Governance Detail View

## Root Cause
The "too much empty space and cannot be scrolled" issue is caused by a missing flexbox constraint (`min-h-0`) on the scrollable container, combined with a missing `h-full overflow-hidden` boundary on the detail view's root wrapper. 

In CSS flexbox, a flex child (the scrollable container) has a default `min-height: auto`. This means it refuses to shrink smaller than the size of its content. Because the card content was large, the container stretched vertically to fit the card rather than scrolling, which pushed the "Cast Approval" buttons beyond the visible boundaries of the application window. Since the outermost application wrapper has `overflow: hidden` to simulate a native desktop window, the bottom of the card was simply cut off and no scrollbar appeared.

Additionally, a minor spacing bug was caused by an empty "Blockchain Receipts" `<div>` receiving `margin-top: 1.5rem` via Tailwind's `space-y-6` class when no hashes were present.

## Fix Applied
1. **Container Constraint**: Added `h-full overflow-hidden` to the root `div` of the selected proposal view in `Governance.tsx`.
2. **Scroll Fix**: Added `min-h-0` to the `<div className="flex-1 overflow-y-auto...">` container to allow it to shrink and trigger the scrollbar correctly.
3. **Spacing Fix**: Conditionally wrapped the Blockchain Receipts `div` so it does not render when empty, eliminating the phantom margin.

The changes have been saved to `Frontend Desktop Application/src/components/admin/Governance.tsx`.
