# How to Setup GitHub Token

To increase the API rate limit for the Roadmap page (from 60 requests/hour to 5,000 requests/hour), you need to add a GitHub Personal Access Token to your environment variables.

## Step 1: Generate Token

1. Log in to [GitHub](https://github.com).
2. Navigate to **Settings** (click your avatar top-right).
3. Scroll down to **Developer settings** (bottom of left sidebar).
4. Click **Personal access tokens** -> **Tokens (classic)**.
5. Click **Generate new token (classic)**.
6. **Note**: Name it something like "SpellcastersDB Local".
7. **Scopes**:
   - If the repository is **Public**: You do not need to check any scopes. Just generating the token is enough to authenticate and get the higher rate limit.
   - If you want to access private data later: Check `repo`.
8. Click **Generate token**.
9. **Copy the token** immediately (it usually starts with `ghp_`). You won't see it again.

## Step 2: Add to Project

1. Open the file `.env.local` in the root directory of the project.
   - If it doesn't exist, create it by copying the example: `cp .env.local.example .env.local`
2. Add the following line to the file:

```env
GITHUB_TOKEN=ghp_YourCopiedTokenStringHere
```

## Step 3: Restart Server

For the new environment variable to take effect, you must restart your development server:

1. Stop the current server (Press `Ctrl + C` in your terminal).
2. Run `npm run dev` again.

You should now see the Roadmap page using the **Green "Live" indicator** consistently!
