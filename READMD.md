# Puzzle Suite

This game can be published to GitHub Pages because it now runs entirely in the browser as a static site.

## Local Use

Open [/Users/xinyuyuan/workspace/game1/index.html](/Users/xinyuyuan/workspace/game1/index.html) in a browser, or keep using Flask if you still want a tiny local server.

## Publish To GitHub Pages

1. Create a new GitHub repository.
2. In this folder, run:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

3. In GitHub, open `Settings` -> `Pages`.
4. Under `Build and deployment`, choose `Deploy from a branch`.
5. Select branch `main` and folder `/ (root)`.
6. Save, then wait about a minute for the site to publish.

Your game will be available at:

```text
https://YOUR_USERNAME.github.io/YOUR_REPO/
```

## Notes

- GitHub Pages cannot run Flask or Python server code.
- The playable version is the root `index.html`, which includes the solver in JavaScript.
- `app.py` is still there if you want to keep the original local Flask version around.
