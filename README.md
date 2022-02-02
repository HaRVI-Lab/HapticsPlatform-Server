Setup: 
1. have homebrew
2. dependencies: 
    - node.js: brew install node (use npm --version to verify installation)
    - redis client: brew install redis
    - npm packages: npm i redis express
    - dev dependencies: npm i nodemon
    - testing dependencies: npm i mocha sinon
3. profit

Local Development:
1. start redis client in terminal: brew services start redis
    - to stop, use: brew services stop redis
2. start npm in dev mode: npm run start:dev
3. use curl/postman to test api calls at http://localhost:5000/...

Prod:
1. heroku web url: https://haptics-test.herokuapp.com/...


