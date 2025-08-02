# The Big Reveal

This project contains a single HTML file that displays an interactive slot machine-style reveal. Spinning the reels a few times eventually triggers a personalized message overlay with optional confetti effects. It's designed for fun occasions like pregnancy announcements, graduations, or other surprises.

## Opening the page

You can open `index.html` directly in any modern web browser. Simply double-click the file or serve it through a local HTTP server and navigate to the page.

```
open index.html            # macOS
# or
xdg-open index.html        # Linux
```

## Customizing via URL parameters

`index.html` supports several query parameters so you can customize the reveal text and appearance. Parameters are optional and can be combined:

- `main` – main headline (default: "We are expecting!")
- `sub` – secondary line of text
- `date` – additional date or detail line
- `photo` – URL to an image shown as a circular avatar
- `from` – a closing signature line
- `color` – overlay color when the message appears. Allowed values: `beige` (default), `pink`, `blue`, `yellow`, `green`, `purple`, `gold`, `white`, `none`. You can also supply any valid hex or CSS color value for a custom overlay.
- `textColor` – color for the message text (any valid CSS color value)
- `outlineColor` – color for the outline around the message text
- `mainTextColor` – text color for the main headline
- `mainOutlineColor` – outline color for the main headline
- `subTextColor` – text color for the secondary line
- `subOutlineColor` – outline color for the secondary line
- `dateTextColor` – text color for the date line
- `dateOutlineColor` – outline color for the date line
- `fromTextColor` – text color for the closing signature
- `fromOutlineColor` – outline color for the closing signature
- `font` – Google Fonts family name to use for all text (e.g. `font=Playfair+Display`)
- `fontMain` – font family for the main headline
- `fontSub` – font family for the secondary line
- `fontDate` – font family for the date line
- `fontFrom` – font family for the closing signature
- `finalIcon` – icon to display on the fourth spin. Allowed values:
  `ringflower.png`, `teambride.png`, `girls.png`

Font parameters expect Google Fonts family names just like `font`, using `+` instead of spaces.

Line-specific color parameters fall back to `textColor` and `outlineColor` if omitted.

`color` only affects the overlay background, whereas `textColor` and `outlineColor` control the message text and its outline.

### Resetting parameters

To revert to the default message while keeping a custom final slot icon, clear
all query parameters except `finalIcon` in the page URL. For example:

```
index.html?finalIcon=girls.png
```


### Example links

```
index.html?main=We%27re%20Engaged!&sub=Save%20the%20Date&date=June%202024
```

```
index.html?main=We%E2%80%99re%20expecting&font=Playfair+Display
```

```
index.html?main=Congrats!&sub=You%20Did%20It&fontMain=Playfair+Display&fontSub=Roboto+Slab
```

```
index.html?main=It%27s%20a%20Boy%21&photo=https%3A%2F%2Fexample.com%2Fbaby.jpg&from=Love%2C%20Alice%20and%20Bob&color=coral
```

```
index.html?main=We%27re%20expecting%21&sub=Baby%20Miller%20%233&date=Arriving%20January%202026&photo=<url>&from=Love%2C%20Geoffrey%20and%20Kristina&color=beige&textColor=%23000000&outlineColor=%23888888
```

Open one of these URLs in your browser to see the customized reveal.

## How the reel spinning works

The slot machine now shows a **1×3 grid** of icons. Each of the three columns is
a reel that spins vertically. When the spin button is pressed, the
`handleSpin()` function disables the button and calls `spinReel()` for each reel
using small delays so they start one after another. Each reel is initialized
with a reusable `.reel-strip` of placeholder icons. `spinReel()` updates the
`src` of those images in place, applies a `transform` transition to scroll
through them, and after the transition snaps the strip back so the chosen symbol
sits in the first slot—without rebuilding the container.

During the first three spins the grid stops on random, nonmatching symbols. On
the fourth spin all reels are forced to stop on the icon specified by the
`finalIcon` parameter (default is the blue bottle). After that,
`showReveal()` is triggered, revealing the personalized message overlay. Any
spins after the reveal return to being completely random, so matches may occur
naturally.
