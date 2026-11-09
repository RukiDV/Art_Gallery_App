# Setup GitHub Repository Template and Issues

## Getting Started with the GitHub Repository Template

This template is designed to help you quickly start your own project with predefined issues and a GitHub project board.

> 💡 **Recommendation**: Read this entire guide carefully before executing the steps to ensure a smooth setup process.

### Step 1: Use the Template

This is an individual project: everybody creates their own repository.

1. Click on the "Use this template" button on the GitHub template repository page to create your new repository.
2. Choose **Public** as the visibility: branch protection on a free GitHub account needs a public repository, and SonarQube Cloud is free for public repositories.
3. Open the **"Issues"** tab of your new repository. After a short moment, 13 issues appear there: 8 core stories, 2 bonus stories and 3 setup issues.

> 💡 Do not run the action twice: if the issues are already there, you are done with this step. Only if the "Issues" tab is still empty after a few minutes, open the **"Actions"** tab, select the workflow **create-issues** and click "Run workflow".

### Step 2: Create a GitHub Project Board

1. **Go to your repository** on GitHub.
2. **Click on "Projects"**: Find the "Projects" tab and click on it.
3. **Create a new project**: Click "New project", choose the "Board" template and name your project.
4. **Import Items from Repository:** Make sure this option is checked.
5. **Create Project**
6. **Ensure that the visibility of your board is set to 'public':** More Options (3 Dot Button) -> Settings -> Danger Zone -> Visibility

### Step 3: Deploy to Vercel

Deploying your app is required. Do this step when the project brief tells you to: after your first setup pull request is merged.

1. **Go to Vercel**: Visit [Vercel](https://vercel.com/) and sign up or log in.
2. **Import your project**: Click on "New Project" and select your GitHub repository. Vercel detects the Vite project automatically.

From now on, every merge to `main` deploys your app automatically.

### Step 4: Start working and have fun. 🌈

Clone the repository to your local machine and install the dependencies (Node.js 22.22 or newer is required):

```bash
npm i
```

Start the development server:

```bash
npm run dev
```

Before you write your first prompt, set up your security baseline as described in the project brief of Recap Project 6 in your curriculum.
