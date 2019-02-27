# Developer guide

## Repo layout

```
+---db (initialize Postgres client pool)
+---docs (documentation)
+---public (static files)
+---routes (express router functions)
+---sql (SQL files for schema and dummy data)
\---views (ejs template files)
```

## Code style

We will be using [Google Javascript Style Guide](https://google.github.io/styleguide/jsguide.html)
for this project.

Since we only need to support latest version of Chrome and Node.js, there is no
restriction on ES6 features. In particular, `async/await` version of APIs are highly
encouraged instead of Node.js usual callback style APIs.

