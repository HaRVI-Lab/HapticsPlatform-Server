1. have homebrew
2. install node.js: brew install node (or use npm --version to check for node.js existence)
3. install redis: brew install redis
4. install node dependencies: npm i express node-fetch redis
5. start redis in background: brew services start (stop) redis
6. profit

Notes:
Request port configured to be 5000 and redis port configured to be 6379.