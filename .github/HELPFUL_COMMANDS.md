# Delete all local branches that have been merged into a branch

`git branch --merged YOUR-BRANCH | grep -v "*" | xargs -n 1 git branch -d`