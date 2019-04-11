# CS2102 Pet Sharing

## Tool requirements:

- Node.js 11.9.0 or later
- Postgres

## Setup 

### Install required node.js modules

```bash
cd cs2102-pet
npm install express ejs pg passport passport-local body-parser express-session bcrypt connect-flash multer
```

### Setup environment

We avoid committing sensitive information such as Postgres password into the repo
by using environment variables.

For Windows

```
copy env.sample.bat env.bat
env.bat
```

For Unix

```bash
cp env.sample .env
source .env
```

Remember to set environment variables before running the app. You can edit `.env`
and `env.bat` according to your own setup.

### Set database schema (will destroy previous data)

For Unix

```bash
psql -U $POSTGRES_USERNAME -f sql/schema.sql
```

For Windows

```
psql -U %POSTGRES_USERNAME% -f sql/schema.sql
```

### Add some dummy data

For Unix

```bash
psql -U $POSTGRES_USERNAME -f sql/dummy.sql
```

For Windows

```
psql -U %POSTGRES_USERNAME% -f sql/dummy.sql
```

## Run server

```bash
node app.js
```

The website will be available at http://localhost:3000.
