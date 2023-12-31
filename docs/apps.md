## Platform's Apps

| App Name                 | Listen Port | Required env variables                  |
|--------------------------|-------------|-----------------------------------------|
| Murew Backend            | 1337        |                                         |
| Supervisor               | 1323        |                                         |
| Distance Helper          | 1338        | DISTANCE_HELPER_URL                     |
| Docker MongoDB Container | 27018       | DATABASE_URI                            |
| Reverse Proxy            | 80          |                                         |
| Apps Builder Agent       | 1339        | DATABASE_URI, MOBILE_CLIENT_PROJECT_DIR |


#### Environment Variables definition

DATABASE_URI: Is the connection string to mongodb server (mongodb uri)
MOBILE_CLIENT_PROJECT_DIR: Absolute path to the flutter project of mobile store client project