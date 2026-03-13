# SFIMP Playground 🧪

## Purpose
This is a safe space to experiment with UX/UI designs and component styles before merging to main.

## Workflow

### 1. Experiment in Playground
- Add new variants to `playground/index.html`
- Test different layouts, colors, typography
- Pair components against different styles

### 2. Review
- Preview at: `https://jaylohokare.github.io/sfimp-website/playground/`
- Share with team for feedback
- Mark variants as:
  - `Testing` - Early experiments
  - `Ready to Review` - Ready for team feedback
  - `Approved` - Team approved, ready to integrate
  - `Deprecated` - Discarded ideas

### 3. Integrate to Dev
- Move approved variants to main components
- Update `index.html`, `styles.css`, `script.js`
- Test full integration

### 4. Merge to Main
- Create PR from `dev` → `main`
- Review changes
- Merge when ready
- Main site updates at: `https://findianmusicproject.org`

## Current Experiments

### Hero Section Variants
- **Variant A**: Minimal - Clean, centered logo
- **Variant B**: Bold - Gradient background
- **Variant C**: Split - Logo left, text right

### Card Styles
- **Style A**: Clean - White with subtle shadow
- **Style B**: Gradient - Purple gradient background
- **Style C**: Minimal - Light gray background

### Color Schemes
- **Current**: Warm browns, oranges, golds (SFIMP logo colors)
- **Test**: Purple gradient palette

## Adding New Experiments

1. Copy existing variant card structure
2. Modify styles in the inline CSS
3. Update variant label
4. Change status badge as needed

## Notes
- All experiments are isolated in playground
- Main site remains stable
- Easy to rollback if needed
- Team can review before committing
