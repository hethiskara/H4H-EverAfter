# EverAfter Landing Page - Detailed Design Prompt for Lovable

## 🎯 Project Overview

Create a stunning, production-ready landing page for **EverAfter** - a mobile app that helps preserve memories before they fade, especially for those with memory loss conditions like Alzheimer's and dementia. The landing page should be sleek, modern, and emotionally impactful, designed to resonate with people of all ages while emphasizing the humanitarian mission.

---

## 🎨 Design Theme & Brand Identity

### **Core Message**
"Preserve a Mind Before It Fades" - EverAfter is about preserving precious memories, human connection, and the essence of who we are.

### **Visual Theme**
- **Style:** Modern tech startup aesthetic (think Stripe, Linear, Vercel)
- **Mood:** Warm, hopeful, human-centered, emotionally resonant
- **Accessibility:** Clear enough for a child to understand, profound enough for adults

### **Color Palette** (From the App)

**Primary Colors:**
```
Purple (Primary):    #A78BFA
Purple (Dark):       #8B5CF6
Purple (Darker):     #7C3AED
Purple (Deep):       #5B4FC4
```

**Accent Colors:**
```
Pink:                #EC4899
Orange (Streak):     #FF8C00
Orange (Warm):       #FFA500
Gold (Happy):        #FFD700
```

**Emotion-Based Gradients:**
```
Happy:      #FFD700 → #FFA500 → #FF8C00
Calm:       #50C878 → #3CB371 → #2E8B57
Excited:    #FF6B9D → #C44569 → #A73E5C
Nostalgic:  #9B59B6 → #8E44AD → #7D3C98
```

**Background & Neutrals:**
```
Background Dark:     #0B0B2B
Background Mid:      #1a1a3e
Text Primary:        #FFFFFF
Text Secondary:      #A1A1AA
Text Muted:          #8888AA
Subtle Border:       rgba(255,255,255,0.06)
```

### **Typography**
```
Headings:    Inter, SF Pro Display, or similar modern sans-serif
             Font weights: 700 (Bold), 600 (Semibold)
             
Body:        Inter, SF Pro Text
             Font weights: 400 (Regular), 500 (Medium)
             
Accent:      Monospace for code/technical elements (optional)
```

### **Gradients to Use**

**Hero Gradient:**
```css
background: linear-gradient(135deg, #0B0B2B 0%, #1a1a3e 50%, #0B0B2B 100%);
```

**Card Gradients:**
```css
/* Purple Glow */
background: linear-gradient(135deg, #A78BFA 0%, #8B5CF6 50%, #7C3AED 100%);

/* Warm Emotion */
background: linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%);

/* Calm */
background: linear-gradient(135deg, #50C878 0%, #3CB371 50%, #2E8B57 100%);
```

---

## 📐 Landing Page Structure

### **Section 1: Hero Banner** (Above the Fold)

**Purpose:** Immediately capture attention and communicate the mission

**Content:**
- **Headline (H1):** "Preserve a Mind Before It Fades"
  - Font size: 64px (desktop), 40px (mobile)
  - Font weight: 700
  - Color: #FFFFFF
  - Add subtle text shadow for depth

- **Subheadline:** 
  "Capture and preserve precious memories with AI-powered memory preservation. For those living with memory loss, and the families who love them."
  - Font size: 24px (desktop), 18px (mobile)
  - Font weight: 400
  - Color: #A1A1AA
  - Max width: 800px, centered

- **Tagline (Small, above headline):**
  "For Humanity 🤍"
  - Font size: 14px
  - Font weight: 600
  - Color: #A78BFA
  - Letter spacing: 2px
  - Text transform: uppercase

**Visual Elements:**
1. **Animated Background:**
   - Dark gradient (#0B0B2B → #1a1a3e)
   - Subtle floating particles or orbs with purple glow
   - Gentle pulsing animation (2-3s loop)

2. **Logo:**
   - EverAfter logo (centered or top-left)
   - Size: 180px height
   - Add subtle glow effect (#A78BFA, opacity 0.3)

3. **QR Code Section:**
   - Position: Right side of hero (desktop) or below CTA (mobile)
   - Size: 200x200px
   - Border: 3px solid #A78BFA with glow
   - Label: "Scan to Download"
   - Include App Store & Google Play badges below QR

4. **Call-to-Action Buttons:**
   ```
   Primary Button: "Try EverAfter Now"
   - Background: linear-gradient(135deg, #A78BFA, #8B5CF6)
   - Padding: 18px 48px
   - Border radius: 12px
   - Font size: 18px
   - Font weight: 600
   - Shadow: 0 8px 24px rgba(167,139,250,0.4)
   - Hover: Scale 1.05, increase shadow
   
   Secondary Button: "Watch Demo"
   - Background: rgba(255,255,255,0.05)
   - Border: 2px solid rgba(255,255,255,0.1)
   - Same padding and styling as primary
   ```

**Layout:**
- Full viewport height (100vh)
- Content centered vertically and horizontally
- Responsive grid: 60% content, 40% QR code (desktop)
- Stack vertically on mobile

---

### **Section 2: The Problem** (Emotional Impact)

**Purpose:** Connect emotionally, explain why this matters

**Headline:** "Every 3 Seconds, Someone Develops Dementia"

**Content:**
- Statistics in large, impactful numbers
- Personal story snippet (1-2 sentences)
- Emphasis on human connection and memory loss

**Visual Style:**
- Dark background with subtle gradient
- Large numbers in purple (#A78BFA)
- Emotional imagery (optional): Blurred photos, fading memories visual
- Animated counter for statistics

**Layout:**
```
[Large Number]     [Emotional Text]
   55M+            people worldwide live with dementia
   
[Large Number]     [Emotional Text]  
   10M+            new cases every year
```

---

### **Section 3: The Solution** (How EverAfter Helps)

**Purpose:** Explain the app's value proposition simply

**Headline:** "Preserve What Matters Most"

**Content - 4 Key Features:**

1. **🎙 Voice Memories**
   - "Capture stories in their own voice"
   - Icon: Microphone with purple glow
   - Description: Record and preserve memories through natural conversation

2. **🧠 AI-Powered Recall**
   - "Relive memories through conversation"
   - Icon: Brain with neural network
   - Description: Ask questions and hear your memories come alive

3. **📅 Timeline Visualization**
   - "See your life's journey"
   - Icon: Calendar/Timeline
   - Description: Beautiful visualization of memories across time

4. **🌌 Memory Network**
   - "Discover connections"
   - Icon: Connected nodes
   - Description: See how memories relate and form your life story

**Visual Style:**
- 4-column grid (desktop), 1-column (mobile)
- Each feature in a card with gradient background
- Hover effect: Lift card, increase glow
- Icons: Large (64px), with subtle animation on hover

**Card Design:**
```css
background: rgba(255,255,255,0.03);
border: 1px solid rgba(255,255,255,0.06);
border-radius: 20px;
padding: 32px;
backdrop-filter: blur(10px);
```

---

### **Section 4: Demo Video** (16:9 Placeholder)

**Purpose:** Show the app in action

**Headline:** "See EverAfter in Action"

**Video Container:**
- Aspect ratio: 16:9
- Max width: 1200px
- Border radius: 24px
- Shadow: 0 20px 60px rgba(0,0,0,0.5)
- Border: 2px solid rgba(167,139,250,0.3)

**Placeholder Design (before video):**
```
- Background: linear-gradient(135deg, #A78BFA, #8B5CF6)
- Play button icon (centered, large)
- Text: "Watch Demo Video"
- Subtle pulsing animation
```

**Layout:**
- Centered on page
- Padding: 80px top/bottom
- Background: Slightly lighter than main (#1a1a3e)

---

### **Section 5: For Humanity** (Mission Statement)

**Purpose:** Emphasize the humanitarian aspect

**Headline:** "Built for Humanity, Not Profit"

**Content:**
- Mission statement (3-4 sentences)
- Emphasis on accessibility, privacy, and human dignity
- Statistics on impact (if available)

**Visual Elements:**
- Heart icon with glow
- Testimonial cards (optional)
- Warm gradient background (orange/gold tones)

**Quote/Testimonial Format:**
```
"This app gave me back my grandmother's stories."
- Family Member
```

**Layout:**
- Full-width section
- Background: Warm gradient (#F39C12 → #E67E22)
- White text for contrast
- Centered content, max-width 900px

---

### **Section 6: How It Works** (Simple Steps)

**Purpose:** Make it easy to understand for all ages

**Headline:** "Simple as 1, 2, 3"

**Steps:**

1. **Download & Sign Up**
   - Icon: Phone with download arrow
   - "Get started in seconds"

2. **Capture Memories**
   - Icon: Microphone/Camera
   - "Record stories, add photos, write notes"

3. **Relive & Share**
   - Icon: Heart/Play button
   - "Ask questions, explore your timeline, share with loved ones"

**Visual Style:**
- Horizontal timeline with connecting line
- Each step in a circle (numbered)
- Purple gradient line connecting steps
- Animated on scroll (steps appear one by one)

**Layout:**
- 3 columns (desktop), vertical (mobile)
- Icons: 80px diameter circles
- Connecting line: 4px, gradient

---

### **Section 7: Features Showcase** (Detailed)

**Purpose:** Dive deeper into key features

**Features to Highlight:**

1. **Memory Calendar**
   - Screenshot/mockup of calendar view
   - Description: "See memories organized by date"
   - Emotion indicators visualization

2. **Relive Memories (AI Chat)**
   - Screenshot of conversational interface
   - Description: "Ask about your past, get meaningful answers"
   - Example questions shown

3. **LifeLine Visualization**
   - Screenshot of network graph
   - Description: "Discover how memories connect"
   - Beautiful node visualization

4. **Streak Tracking**
   - Screenshot of streak banner
   - Description: "Build the habit of memory preservation"
   - Fire emoji and motivation

**Layout:**
- Alternating left/right layout
- Image on one side, text on other
- Each feature gets full section
- Smooth scroll animations

---

### **Section 8: Privacy & Security**

**Purpose:** Build trust

**Headline:** "Your Memories, Your Privacy"

**Content:**
- End-to-end encryption
- Local storage options
- No data selling
- HIPAA compliance (if applicable)

**Visual:**
- Lock icon with shield
- Trust badges
- Simple, clean design

---

### **Section 9: Call-to-Action** (Final Push)

**Purpose:** Convert visitors to users

**Headline:** "Start Preserving Memories Today"

**Content:**
- Large QR code (300x300px)
- App Store & Google Play buttons
- Email signup for updates (optional)

**Visual:**
- Gradient background (purple)
- Centered content
- Generous padding (120px top/bottom)

**CTA Button:**
```
"Download EverAfter"
- Size: Extra large (24px font, 24px padding)
- Gradient background
- Prominent shadow
- Pulse animation
```

---

### **Section 10: Footer**

**Content:**
- Logo
- Navigation links (About, Privacy, Terms, Contact)
- Social media icons
- Copyright notice
- "Made with 🤍 for humanity"

**Style:**
- Dark background (#0B0B2B)
- Minimal, clean layout
- Purple accent links

---

## 🎭 Animations & Interactions

### **Scroll Animations:**
1. **Fade in from bottom:** Sections appear as you scroll
2. **Parallax effect:** Background moves slower than content
3. **Number counters:** Animate statistics counting up
4. **Card hover:** Lift and glow on hover

### **Micro-interactions:**
1. **Button hover:** Scale 1.05, increase shadow
2. **QR code:** Subtle pulse animation
3. **Feature icons:** Rotate or bounce on hover
4. **Timeline:** Progress line fills as you scroll

### **Loading States:**
1. **Page load:** Fade in hero content
2. **Video placeholder:** Pulse animation
3. **Smooth transitions:** 300-400ms ease-in-out

---

## 📱 Responsive Design

### **Breakpoints:**
```
Mobile:     < 768px
Tablet:     768px - 1024px
Desktop:    > 1024px
Large:      > 1440px
```

### **Mobile Optimizations:**
- Stack all sections vertically
- Reduce font sizes (40px → 32px for H1)
- Full-width cards
- Touch-friendly buttons (min 44px height)
- Simplified animations
- QR code below hero content

---

## 🎨 Component Specifications

### **Card Component:**
```css
.card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 20px;
  padding: 32px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(167, 139, 250, 0.2);
  border-color: rgba(167, 139, 250, 0.3);
}
```

### **Button Component:**
```css
.button-primary {
  background: linear-gradient(135deg, #A78BFA, #8B5CF6);
  color: #FFFFFF;
  padding: 18px 48px;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 600;
  border: none;
  box-shadow: 0 8px 24px rgba(167, 139, 250, 0.4);
  cursor: pointer;
  transition: all 0.3s ease;
}

.button-primary:hover {
  transform: scale(1.05);
  box-shadow: 0 12px 32px rgba(167, 139, 250, 0.6);
}
```

### **Section Container:**
```css
.section {
  padding: 120px 20px;
  max-width: 1400px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .section {
    padding: 60px 20px;
  }
}
```

---

## 📝 Copy Guidelines

### **Tone of Voice:**
- **Warm & Empathetic:** Acknowledge the emotional weight
- **Clear & Simple:** Explain complex features simply
- **Hopeful:** Focus on preservation, not loss
- **Human-Centered:** Always about people, not technology

### **Key Messages:**
1. "Every memory matters"
2. "Preserve a mind before it fades"
3. "For those who forget, and those who remember"
4. "Your story deserves to be preserved"
5. "Built for humanity, not profit"

### **Avoid:**
- Medical jargon
- Overly technical language
- Negative framing (focus on preservation, not loss)
- Corporate speak

---

## 🎯 Accessibility Requirements

### **WCAG 2.1 AA Compliance:**
1. **Color Contrast:** Minimum 4.5:1 for text
2. **Keyboard Navigation:** All interactive elements accessible
3. **Alt Text:** All images and icons
4. **Focus Indicators:** Visible focus states
5. **Screen Reader:** Semantic HTML, ARIA labels

### **Performance:**
1. **Page Load:** < 3 seconds
2. **Lighthouse Score:** > 90
3. **Mobile-First:** Optimized for mobile
4. **Lazy Loading:** Images and videos

---

## 🖼️ Assets Needed

### **Images:**
1. EverAfter logo (PNG, SVG)
2. App screenshots (high-res, 2x)
3. QR code (generated, 300x300px minimum)
4. App Store badges (official)
5. Google Play badges (official)
6. Hero background (optional abstract/particles)

### **Icons:**
1. Feature icons (64px, SVG preferred)
2. Social media icons
3. Trust/security badges

### **Video:**
1. Demo video (16:9, MP4, H.264)
2. Poster image for video (1920x1080px)

---

## 🚀 Technical Requirements

### **Framework:**
- React, Next.js, or similar modern framework
- TypeScript for type safety
- Tailwind CSS or styled-components for styling

### **Performance:**
- Code splitting
- Image optimization (WebP, lazy loading)
- Minified CSS/JS
- CDN delivery

### **SEO:**
- Meta tags (title, description, OG tags)
- Structured data (JSON-LD)
- Sitemap
- robots.txt

### **Analytics:**
- Google Analytics or similar
- Conversion tracking
- Heatmaps (optional)

---

## 📊 Success Metrics

### **Primary Goals:**
1. QR code scans
2. App downloads
3. Video watch time
4. Time on page

### **Secondary Goals:**
1. Email signups
2. Social shares
3. Bounce rate < 40%
4. Page load time < 3s

---

## 🎨 Design Inspiration

**Reference Sites:**
- Linear.app (clean, modern, animated)
- Stripe.com (clear value prop, beautiful gradients)
- Vercel.com (dark theme, smooth animations)
- Apple.com (product showcase, emotional storytelling)

**Key Takeaways:**
- Generous white space
- Smooth scroll animations
- Clear hierarchy
- Emotional storytelling
- Trust-building elements

---

## 📋 Final Checklist

### **Before Launch:**
- [ ] All copy proofread
- [ ] All images optimized
- [ ] QR code tested and working
- [ ] Video embedded and playing
- [ ] Mobile responsive on all devices
- [ ] Accessibility audit passed
- [ ] Performance optimized (Lighthouse > 90)
- [ ] SEO meta tags added
- [ ] Analytics tracking set up
- [ ] Cross-browser testing complete
- [ ] SSL certificate installed
- [ ] Privacy policy linked
- [ ] Terms of service linked

---

## 🎯 Key Differentiators

**What Makes This Landing Page Special:**

1. **Emotional Resonance:** Not just features, but human stories
2. **Accessibility:** Designed for all ages and abilities
3. **Humanitarian Focus:** Clear mission beyond profit
4. **Beautiful Design:** Matches app's polished aesthetic
5. **Clear CTA:** Easy path to download and try
6. **Trust Building:** Privacy, security, and transparency
7. **Educational:** Explains complex AI simply
8. **Inspiring:** Motivates action through hope, not fear

---

## 💜 Brand Essence

**EverAfter is:**
- Compassionate technology
- Memory preservation
- Human connection
- Hope and dignity
- Accessible to all
- Built with love for humanity

**The landing page should make visitors feel:**
- Understood and seen
- Hopeful about preservation
- Confident in the solution
- Motivated to take action
- Part of something meaningful

---

## 🎨 Color Usage Guide

**Hero Section:** Dark purple gradient (#0B0B2B → #1a1a3e)
**Problem Section:** Dark with orange accents (#FF8C00)
**Solution Section:** Purple cards (#A78BFA)
**Demo Section:** Mid-tone background (#1a1a3e)
**Humanity Section:** Warm gradient (#F39C12 → #E67E22)
**How It Works:** Purple timeline (#8B5CF6)
**Features:** Alternating purple/pink gradients
**CTA Section:** Bold purple gradient (#A78BFA → #7C3AED)
**Footer:** Deep dark (#0B0B2B)

---

## 📱 QR Code Specifications

**Design:**
- Size: 200x200px (hero), 300x300px (CTA)
- Border: 3px solid #A78BFA
- Border radius: 16px
- Shadow: 0 8px 24px rgba(167, 139, 250, 0.4)
- Background: White
- Padding: 16px inside border

**Label:**
- "Scan to Download EverAfter"
- Font size: 14px
- Font weight: 600
- Color: #A78BFA
- Position: Below QR code

**Animation:**
- Subtle pulse (scale 1.0 → 1.02)
- Duration: 2s
- Loop: infinite
- Easing: ease-in-out

---

## 🎬 Demo Video Section Details

**Container:**
```css
.video-container {
  max-width: 1200px;
  margin: 0 auto;
  aspect-ratio: 16/9;
  border-radius: 24px;
  overflow: hidden;
  border: 2px solid rgba(167, 139, 250, 0.3);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}
```

**Placeholder (before video loads):**
```css
.video-placeholder {
  background: linear-gradient(135deg, #A78BFA, #8B5CF6);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.play-button {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  border: 3px solid #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: pulse 2s infinite;
}
```

---

## 🌟 Final Notes

This landing page should be a **digital experience** that:
1. Tells a compelling story
2. Builds emotional connection
3. Explains complex technology simply
4. Inspires action
5. Builds trust
6. Honors the humanity of users

**Remember:** Every element should serve the mission of helping people preserve precious memories. The design should be beautiful but never overshadow the human stories at the heart of EverAfter.

---

**Tagline to Feature:**
"Preserve a Mind Before It Fades"

**Mission Statement:**
"EverAfter helps preserve precious memories for those living with memory loss and the families who love them. Using AI-powered technology, we make it simple to capture, organize, and relive life's most meaningful moments. Built for humanity, not profit."

---

*This prompt is comprehensive and ready to be used with Lovable or any modern web development tool. All design specifications match the EverAfter mobile app for brand consistency.*
