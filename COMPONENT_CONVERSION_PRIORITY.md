# Component Conversion Priority List

## High Priority (Most Commonly Used)

### 1. Form Components
- [ ] **Checkbox** - Essential form component
- [ ] **Radio Group** - Essential form component  
- [ ] **Select** - Essential form component
- [ ] **Switch** - Essential form component
- [ ] **Slider** - Essential form component
- [ ] **Label** - Essential form component
- [ ] **Form** - Form validation and handling

### 2. Navigation & Menu Components
- [ ] **Tabs** - Very commonly used
- [ ] **Context Menu** - Right-click menus
- [ ] **Navigation Menu** - Main navigation
- [ ] **Menubar** - Application menus
- [ ] **Menu** - Dropdown menus (different from dropdown-menu)

### 3. Overlay Components
- [ ] **Popover** - Tooltip-like overlays
- [ ] **Tooltip** - Information tooltips
- [ ] **Hover Card** - Rich hover overlays
- [ ] **Alert Dialog** - Confirmation dialogs

### 4. Layout & Display Components
- [ ] **Separator** - Visual dividers
- [ ] **Avatar** - User avatars
- [ ] **Aspect Ratio** - Responsive containers
- [ ] **Scroll Area** - Custom scrollable areas

## Medium Priority

### 5. Advanced Form Components
- [ ] **One Time Password Field** - OTP input
- [ ] **Password Toggle Field** - Password with show/hide

### 6. Utility Components
- [ ] **Progress** - Progress indicators
- [ ] **Toast** - Notification system
- [ ] **Toggle** - Simple toggle buttons
- [ ] **Toggle Group** - Group of toggles
- [ ] **Collapsible** - Expandable content

### 7. Advanced Components
- [ ] **Portal** - Render outside DOM hierarchy
- [ ] **Presence** - Animation presence
- [ ] **Focus Scope** - Focus management
- [ ] **Focus Guards** - Focus containment

## Low Priority (Utilities & Hooks)

### 8. Utility Components
- [ ] **Accessible Icon** - Screen reader icons
- [ ] **Arrow** - Directional arrows
- [ ] **Announce** - Screen reader announcements
- [ ] **Visually Hidden** - Hide content visually

### 9. Hook Equivalents (Vanilla JS Utilities)
- [ ] **use-rect** → Rect utilities
- [ ] **use-size** → Size utilities  
- [ ] **use-escape-keydown** → Escape key utilities
- [ ] **use-id** → ID generation utilities
- [ ] **use-direction** → RTL/LTR utilities

## Implementation Plan

### Phase 1: Core Form Components (Week 1)
1. Checkbox
2. Radio Group
3. Select
4. Switch
5. Slider
6. Label

### Phase 2: Navigation & Menus (Week 2)
1. Tabs
2. Context Menu
3. Navigation Menu
4. Menubar

### Phase 3: Overlays & Dialogs (Week 3)
1. Popover
2. Tooltip
3. Hover Card
4. Alert Dialog

### Phase 4: Layout & Display (Week 4)
1. Separator
2. Avatar
3. Aspect Ratio
4. Scroll Area

### Phase 5: Advanced Components (Week 5)
1. Progress
2. Toast
3. Toggle/Toggle Group
4. Collapsible

### Phase 6: Utilities & Polish (Week 6)
1. Portal
2. Presence
3. Focus utilities
4. Remaining utilities

## Component Complexity Assessment

### Simple Components (1-2 days each)
- Separator
- Label
- Accessible Icon
- Visually Hidden
- Arrow
- Announce

### Medium Components (3-4 days each)
- Checkbox
- Radio Group
- Switch
- Slider
- Toggle
- Avatar
- Aspect Ratio
- Progress

### Complex Components (5-7 days each)
- Select
- Tabs
- Context Menu
- Navigation Menu
- Menubar
- Popover
- Tooltip
- Hover Card
- Alert Dialog
- Scroll Area
- Toast
- Toggle Group
- Collapsible

### Very Complex Components (1-2 weeks each)
- Form (with validation)
- Portal
- Presence
- Focus Scope
- Focus Guards

## Estimated Timeline
- **Total Components**: ~50
- **High Priority**: ~20 components
- **Estimated Time**: 8-12 weeks for all components
- **Recommended Approach**: Focus on high-priority components first

## Next Steps
1. Start with Phase 1 (Form Components)
2. Convert one component at a time
3. Add to testing app as we go
4. Update documentation
5. Create migration examples
