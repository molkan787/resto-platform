## Prerequisites
The following packages must be installed on the target machine

- Node.js 12.20.0 (must be the default node version available using command `node`)
- Node.js 20.10.0 (must be available at `/root/.nvm/versions/node/v20.10.0/bin/node`)
- Yarn (npm package - globally installed)
- Servicer (follow install instruction from https://github.com/servicer-labs/servicer final command must be `ser`)
- Docker
- MongoDB Command Line Database Tools (v100)
- Certbot 2.8.0
- NGINX 1.18.0


## Deployment

Currently the whole platform can be setup only on a linux machine.

1. install all the preequisites from above list
2. clone "resto-e-commerce" repository into the home directory
3. cd into each of thus directories ['supervisor', 'murew-backend', 'apps-builder-agent', 'nginx-reverseproxy-client']  and run `yarn` to install node modules
4. cd back to main directory and run `sudo node platform-apps-servicer.js boot` this will create systemd services for all apps of the platform
5. load all of thus docker images ['murew-vendor', 'emailagent', 'distance-helper'] using `docker load -i <image-file>` (if not done already you need first to build thus images using the dockerfile files in the root directory of the prject)
6. create docker network called "vendor_apps_sharednetwork"