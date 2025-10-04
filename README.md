# detect-html-change

To Build:
`npm build`

Usage:
`ts-node checker.ts <config.json> [--save]`

Example config:

```
{
  "url": "https://www.targetsite.org/",
  "selector": "#site-news > div.site-news-inner > ul > li:nth-child(1)",
  "value": "Latest title"
}
```
