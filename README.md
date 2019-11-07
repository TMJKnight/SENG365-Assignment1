# SENG365 student repo

## Overview of the continuous deployment process

1. You hackity hack...
2. You commit your changes to your git repo on `eng-git.canterbury.ac.nz`.
3. That triggers the GitLab CI runner, which starts a GitLab docker executor on the build VM to build your application within a docker container.
4. The executor runs the build defined in your .gitlab-ci.yml. Docker compose build follows the build steps from docker-compose.yml to build the application.
5. If the build step succeeds, the CI runner on the VM then runs the scripts in the deploy section of .gitlab-ci.yml in the same way. This calls `docker compose down` to stop any previous version of your app, and then `docker compose up` to start your server, mapping your unique `SENG365_PORT` on the VM to port `4941` in the container.
6. Your application is now up-and-running at `csse-s365.canterbury.ac.nz:{SENG365_PORT}`.
7. The CI runner then runs the verify scripts in .gitlab-ci.yml, checking that the server has not immediately crashed, and retrieving the logs so far to provide debug information.

Logs for the entire CI process are available in the CI/CD -> Pipelines section in your GitLab repo.

Note: The value of ```SENG365_PORT``` is defined for you when the skeleton project was added into your eng-git repo. You can find the value for your project by going to the eng-git project and then: settings > CI / CD > Expand Variables > Reveal Values.

## Running locally

All you need to do to run your server locally is create a `.env` file in the root directory of this project including the following information:

```
SENG365_MYSQL_HOST=mysql3.csse.canterbury.ac.nz
SENG365_MYSQL_USER={your usercode}
SENG365_MYSQL_PASSWORD={your ID number}
SENG365_MYSQL_DATABASE={your usercode}
```

1. Use `npm install` to populate the `node_modules/` directory with up-to-date packages.
2. Run `npm run start` or `npm run debug` to start the server.
3. The server will be accessible on `localhost:4941`.

## Automated testing

1. Open your browser to `http://csse-s365.canterbury.ac.nz/`
2. Enter the url `csse-s365.canterbury.ac.nz` and your unique `SENG365_PORT` in order to run the API tests on the latest build of your server. 
3. The test runner will generate a report of the results for you. "# SENG365-Assignment1" 
