# LinkedIn Post Importer

Create a Hugo blog post from a LinkedIn post without relying on LinkedIn read API access.

```sh
npm run import:linkedin -- \
  --url "https://www.linkedin.com/posts/..." \
  --date 2026-04-29 \
  --title "My Post Title" \
  --text-file ./post.txt \
  --image ./post.png
```

Use `--text "Post body"` instead of `--text-file` for short posts. The image argument is optional; when omitted, the post uses `img/default.jpg`.

The importer writes Markdown to `content/blog/YYYY-MM-DD-title-slug.md`, copies images to `static/img/thirdparty/`, and rejects duplicates unless `--overwrite` is supplied.
