# Scents by Kidida - Luxury Perfume Website

A sleek, elegant, and luxurious interactive website built with Astro for selling high-end perfumes.

## ✨ Features

### 🎨 Luxury Design
- **Premium Color Palette**: Gold accents, charcoal blacks, and cream whites
- **Elegant Typography**: Playfair Display for headings, Inter for body text
- **Sophisticated Animations**: Smooth transitions and luxury hover effects
- **Glass Morphism Effects**: Modern backdrop blur and transparency

### 🖼️ Image Support
- **Product Images**: Ready for high-quality perfume photography
- **Image Optimization**: Astro's built-in image optimization
- **Fallback Placeholders**: Elegant 3D bottle illustrations when images aren't available
- **Zoom Effects**: Interactive image scaling on hover

### 🛍️ Interactive Shopping Experience
- **Dynamic Product Cards**: Hover effects with overlay actions
- **Shopping Cart**: Full cart functionality with quantity controls
- **Quick View**: Modal product previews
- **Wishlist**: Heart icon for favorite products
- **Smooth Animations**: Luxury fade-in effects and transitions

### 📱 Responsive Design
- **Mobile-First**: Optimized for all screen sizes
- **Touch-Friendly**: Large buttons and intuitive interactions
- **Progressive Enhancement**: Works without JavaScript

### 🏗️ Component Architecture
- **Modular Components**: Reusable Astro components
- **Type Safety**: TypeScript interfaces for product data
- **Clean Code**: Organized file structure

## 🚀 Project Structure

```text
/
├── public/
│   └── images/           # Product images (user-provided)
├── src/
│   ├── components/
│   │   ├── Navigation.astro
│   │   ├── Hero.astro
│   │   ├── ProductCollection.astro
│   │   ├── About.astro
│   │   ├── Contact.astro
│   │   ├── Footer.astro
│   │   └── ShoppingCart.astro
│   ├── layouts/
│   │   └── Layout.astro
│   └── pages/
│       └── index.astro
└── package.json
```

## 🎯 Product Data Structure

Each product supports:
- **Basic Info**: ID, name, description, price
- **Categories**: Oriental, Citrus, Floral, Aquatic
- **Fragrance Notes**: Top, middle, and base notes
- **Images**: High-quality product photography
- **Metadata**: Additional product details

```typescript
{
  id: 'midnight-elegance',
  name: 'Midnight Elegance',
  description: 'A sophisticated blend...',
  price: 180,
  category: 'Oriental',
  notes: ['Bergamot', 'Sandalwood', 'Black Pepper', 'Amber'],
  image: '/images/midnight-elegance.jpg'
}
```

## 🧞 Commands

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`     |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |

## 📸 Adding Product Images

1. Place your perfume images in the `public/images/` directory
2. Use the naming convention: `product-id.jpg` (e.g., `midnight-elegance.jpg`)
3. Recommended image specs:
   - **Format**: JPG or WebP
   - **Size**: 800x800px minimum
   - **Quality**: High resolution for luxury appeal
   - **Background**: Clean, preferably white or transparent

## 🎨 Customization

### Colors
The luxury color palette is defined in CSS custom properties:
- `--luxury-gold`: #d4af37
- `--luxury-dark`: #1a1a1a
- `--luxury-charcoal`: #2c2c2c
- `--luxury-cream`: #faf8f5

### Typography
- **Headings**: Playfair Display (serif, elegant)
- **Body**: Inter (sans-serif, modern)
- **Accents**: Gold gradients and letter spacing

### Animations
- **Fade-in**: Staggered product card animations
- **Hover Effects**: Scale, shadow, and color transitions
- **Loading**: Smooth reveal animations

## 🌟 Interactive Features

- **Shopping Cart**: Add/remove items, quantity controls
- **Quick View**: Product modal with detailed information
- **Wishlist**: Save favorite products
- **Mobile Menu**: Hamburger navigation
- **Smooth Scrolling**: Anchor link navigation
- **Contact Form**: Functional form with validation

## 🚀 Performance

- **Static Generation**: Pre-built pages for fast loading
- **Component Islands**: Interactive elements only where needed
- **Optimized Assets**: Compressed images and minified CSS
- **Modern CSS**: Grid, Flexbox, and custom properties

## 📱 Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Progressive enhancement for older browsers

Ready to showcase your luxury perfume collection with style! 🌟
