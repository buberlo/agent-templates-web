# Grok Bot templates

Every template detail page offers a Grok Bot setup message. In Grok Bot, choose **New Bot** (+) in the sidebar or press Cmd+N or Ctrl+N, name the bot, and paste the setup message as its first message. Connect the apps and MCP connectors listed in the template. [Grok Bot documentation](https://docs.x.ai/grok-bot/bots)

## Publish a template for one-click import

1. In an existing Grok Bot, choose **Share → Create a copy → Publish → Copy link**.
2. In the content repository, set the optional `grokbot_template_url` field in the matching template’s YAML frontmatter to the published link you copied.
3. After the site rebuilds, readers can open the link from **Add to Grok Bot** and choose **Add to Grok Bot** or **Import Bot** on x.ai.

Use only official published template links with HTTPS on `x.ai` or one of its subdomains. The site checks the scheme and hostname. Invalid or missing values leave the copy-and-paste flow available on its own. The site will never fabricate a template link. [Official template guide](https://x.ai/bot/guides/templates-for-grok-bot) · [Official gallery](https://x.ai/bot/marketplace)
