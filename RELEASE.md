# 🚀 Release Process - Real-World Scenarios

## 📋 Common Release Scenarios

### **Scenario 1: I Just Finished a Feature and Want to Release**

**Situation:** You've completed a new feature, tested it locally, and want to release it.

**Current State:**

```bash
$ git status
On branch main
Your branch is up to date with 'origin/main'.

Changes not staged for commit:
  modified:   src/js/new-feature.js
  modified:   src/css/styles.css
  modified:   README.md

Untracked files:
  src/js/feature-helper.js
```

**Steps:**

```bash
# 1. Commit your feature changes
git add .
git commit -m "Add new PDF watermark feature"

# 2. Choose your release type and run
pnpm run release        # Patch: 1.0.0 → 1.0.1 (bug fixes, small improvements)
pnpm run release:minor  # Minor: 1.0.0 → 1.1.0 (new features, backward compatible)
pnpm run release:major  # Major: 1.0.0 → 2.0.0 (breaking changes)
```

**What Happens:**

- ✅ Your feature commit stays as-is
- ✅ Version gets bumped in `package.json` and `chart/Chart.yaml`
- ✅ New release commit is created
- ✅ Git tag is created (e.g., `v1.0.1`)
- ✅ Everything gets pushed to GitHub
- ✅ Docker image gets built and published

---

### **Scenario 2: I Have Uncommitted Changes and Want to Release**

**Situation:** You have local changes but haven't committed them yet.

**Current State:**

```bash
$ git status
Changes not staged for commit:
  modified:   package.json
  modified:   src/js/main.js
  modified:   README.md
```

**❌ This Will Fail:**

```bash
pnpm run release
# Error: Your local changes would be overwritten by merge
```

**✅ Solution Options:**

**Option A: Commit Everything First (Recommended)**

```bash
git add .
git commit -m "Add new features and improvements"
pnpm run release
```

**Option B: Stash Changes Temporarily**

```bash
git stash
pnpm run release
git stash pop  # Restore your changes after release
```

**Option C: Commit Only What's Needed**

```bash
git add package.json src/js/main.js
git commit -m "Add core improvements"
pnpm run release
git add README.md
git commit -m "Update documentation"
```

---

### **Scenario 3: I Want to Release a Hotfix**

**Situation:** There's a critical bug in production that needs immediate fixing.

**Steps:**

```bash
# 1. Fix the bug
git add src/js/bug-fix.js
git commit -m "Fix critical PDF rendering issue"

# 2. Release as patch (bug fix)
pnpm run release
# This creates: 1.0.0 → 1.0.1
```

**Result:**

- ✅ Bug fix gets released immediately
- ✅ Docker image with fix is available
- ✅ Users can pull the fixed version

---

### **Scenario 4: I Want to Release a Major Update**

**Situation:** You've added significant new features that might break existing functionality.

**Steps:**

```bash
# 1. Commit all your changes
git add .
git commit -m "Add major PDF editing features and API changes"

# 2. Release as major version
pnpm run release:major
# This creates: 1.0.0 → 2.0.0
```

**Result:**

- ✅ Major version bump indicates breaking changes
- ✅ Users know to check compatibility
- ✅ Both old and new versions available

---

### **Scenario 5: I Want to Release Multiple Features at Once**

**Situation:** You've been working on multiple features and want to release them together.

**Steps:**

```bash
# 1. Commit all features
git add .
git commit -m "Add multiple PDF tools: watermark, encryption, and compression"

# 2. Choose appropriate release type
pnpm run release:minor  # For new features (1.0.0 → 1.1.0)
# OR
pnpm run release:major  # For breaking changes (1.0.0 → 2.0.0)
```

---

### **Scenario 6: I Want to Test the Release Process**

**Situation:** You want to test the release system without affecting production.

**Steps:**

```bash
# 1. Make a small test change
echo "// Test comment" >> src/js/main.js
git add src/js/main.js
git commit -m "Test release process"

# 2. Run patch release
pnpm run release
# This creates: 1.0.0 → 1.0.1

# 3. Verify everything works
# Check GitHub Actions release workflow

# 4. If you want to undo the test release
git tag -d v1.0.1
git push origin :refs/tags/v1.0.1
git reset --hard HEAD~1
```

---

## 🎯 **Release Type Guidelines**

| Scenario            | Command                 | Version Change  | When to Use                          |
| ------------------- | ----------------------- | --------------- | ------------------------------------ |
| **Bug Fix**         | `pnpm run release`       | `1.0.0 → 1.0.1` | Fixing bugs, small improvements      |
| **New Feature**     | `pnpm run release:minor` | `1.0.0 → 1.1.0` | Adding features, backward compatible |
| **Breaking Change** | `pnpm run release:major` | `1.0.0 → 2.0.0` | API changes, major rewrites          |

---

## 🔄 **What Happens After You Run a Release Command**

### **Immediate Actions (Local):**

1. **Version Update**: `package.json` version gets bumped
2. **Git Commit**: New commit created with "Release vX.X.X"
3. **Git Tag**: Tag created (e.g., `v1.0.1`)
4. **Git Push**: Everything pushed to GitHub

### **Automatic Actions (GitHub):**

1. **GitHub Actions Triggered** on version tag (`v*`)
2. **Tests + build** run in CI
3. **GitHub Release** created with `dist-*.zip` assets

### **Docker (local):**

```bash
docker compose up -d --build   # image: tooleasy:latest
```

**Problem:** You've run the same release before
**Solution:** This is normal! The script will skip creating duplicate tags

### **❌ GitHub Actions fails**

**Problem:** Various build issues
**Solution:**

1. Check Actions tab for detailed logs
2. Check Actions tab logs
3. Check Dockerfile for syntax errors

---

## 🧪 **Testing Your Release System**

### **Quick Test:**

```bash
# Make a small change
echo "// Test" >> src/js/main.js
git add src/js/main.js
git commit -m "Test release"
pnpm run release
```

### **Verify Results:**

1. **GitHub Actions**: Check Actions tab for successful build
2. **GitHub Release**: Verify dist zip assets are attached
3. **Git Tags**: `git tag --list` should show new tag
4. **Version**: `cat package.json | grep version` should show updated version

### **Undo Test Release:**

```bash
git tag -d v1.0.1
git push origin :refs/tags/v1.0.1
git reset --hard HEAD~1
```

---

## 🎉 **That's It!**

Your release system is now ready! Just follow the scenarios above based on your situation and run the appropriate `pnpm run release` command.
