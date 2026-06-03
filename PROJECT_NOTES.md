# Bridal Party Proposal Link Builder

This project is a static bridal party proposal slot reveal with a separate link
builder form.

## Main Files

- `index.html` is the recipient-facing reveal experience.
- `form.html` is the creator-facing link builder.
- `envelope.js` controls the opening envelope/note animation.
- `netlify/functions/shorten-url.js` is the optional TinyURL proxy.
- `netlify.toml` configures Netlify static publishing and functions.

## Recipient Flow

The recipient opens a generated `index.html` link.

1. The envelope appears.
2. The envelope front says `To {name}`.
3. The envelope flips to show the personal intro message.
4. The recipient continues to the slot game.
5. The How to Play popup explains the generic surprise reveal.
6. After the winning spin, the final reveal message appears.

## Builder Flow

`form.html` is a 4-step wizard:

1. Set proposal defaults.
2. Add bridal party recipients.
3. Personalize each recipient with default or custom messages.
4. Generate one link per recipient.

The builder supports adding multiple names at once by pasting names separated
by commas or new lines.

## URL Parameters

Generated links use these params:

- `name`: envelope front text, rendered as `To {name}`.
- `message`: envelope back message.
- `landingMessage`: legacy/preview-friendly copy of the envelope message.
- `reveal`: final slot reveal message.
- `date`: optional extra line on the final reveal screen.
- `from`: optional signature line on the final reveal screen.
- `finalIcon=ringflower.png`: fixed winning slot icon.

The builder intentionally does not generate `sub`, because that caused the role
to appear as a duplicate line under the final reveal message.

## Wedding Date

The wedding date is optional. In the builder it is hidden behind an
`Include wedding date` checkbox.

If included, it is sent as `date=...` and appears as an extra line on the final
reveal screen.

## TinyURL / Netlify

TinyURL shortening is implemented through a Netlify Function so the API token is
not exposed in browser code.

Required Netlify environment variable:

```text
TINYURL_TOKEN
```

The function reads it from:

```js
process.env.TINYURL_TOKEN
```

The TinyURL function file is:

```text
netlify/functions/shorten-url.js
```

## Development Toggle

TinyURL shortening is currently disabled in `form.html` to avoid wasting short
links during development:

```js
const ENABLE_TINYURL_SHORT_LINKS = false;
```

Set it to `true` when ready to generate short links:

```js
const ENABLE_TINYURL_SHORT_LINKS = true;
```

When shortening is disabled or unavailable, the builder falls back to the long
generated URL.

## Local Preview

A local static server has been used at:

```text
http://localhost:5174/form.html
```

Open the form through the local server rather than directly from Finder when
testing URL behavior.
