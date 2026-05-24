# GitHub Setup & Pushing Guide

This guide outlines the steps required to finalize credentials, authenticate with GitHub, and push the committed code to the repository.

---

## 1. Pushing to GitHub (Initial Upload)

Since we have already initialized, staged, committed, and added the remote, run the following command to push the local commit to the remote repository:

```bash
# Push the main branch to remote (uses default browser SSO or Git credential manager)
git push -u origin main
```

If you use SSH instead of HTTPS, you can re-target the remote:
```bash
# Swap remote origin link to SSH format
git remote set-url origin git@github.com:HusseinA-H/FitnessTracker.git

# Push changes
git push -u origin main
```

---

## 2. Setting Up GitHub Environment Secrets

To run automated checks (like GitHub Actions) or deploy production servers automatically, configure secrets under **Repository Settings → Secrets and variables → Actions**:

| Secret Key | Type | Example / Value | Purpose |
| :--- | :--- | :--- | :--- |
| `GROQ_API_KEY` | Secret | `gsk_Fp...` | Authenticators for AI telemetry tests |
| `DJANGO_SECRET_KEY` | Secret | `django-insecure-prod...` | Production token sign key |
| `DOCKER_USERNAME` | Secret | `husseinah` | Authentication for Docker Hub image pushing |
| `DOCKER_PASSWORD` | Secret | `dhp_prod_key...` | Access token for Docker registries |

---

## 3. Branch Protection & Contribution Flow

To preserve mainline stability on the public repository:
1.  Navigate to **Settings → Branches → Add branch protection rule**.
2.  Set pattern to `main`.
3.  Tick **Require a pull request before merging** and **Require status checks to pass before merging** (e.g. lint validation, automated test pipelines).
4.  Develop new features on branch sub-routes:
    ```bash
    # Create new feature branch
    git checkout -b feat/add-stripe-gateway

    # Stage & commit changes
    git add .
    git commit -m "feat: integrate stripe elements checkout modal"

    # Push feature branch to remote
    git push origin feat/add-stripe-gateway
    ```
5.  Open a Pull Request on GitHub to merge into `main` after automated checks complete successfully.
