# Github Webhook for Node.js Apps

## Goal
The goal is to have a webhook that listens to github events. The purpose of this webhook would be to trigger a git pull from the origin server and run any subsequent commands needed.

## Approach
The approach is to have a webserver listen on a particular port. For security reasons, this webhook ensures that the right github secret is passed and then triggers a git pull to update the local git repository.

## Requirements
The requirements must be values that must be passed in as environment variables. These can be placed in a `.env` file that would be loaded as early as possible.

- GITHUB_WEBHOOK_SECRET: The secret used when setting up the webhook at Github
- GITHUB_REPO: The repository that needs to be updated upon the webhook trigger
- PORT: The port on which the webserver is listening on

## Using Webhook as a Systemd Service
The first step is to create a service with the command `sudo nano /etc/systemd/system/webhook.service`. Since the file is named `webhook.service`, it implies that the service is called `webhook`. You can change it to whatever you want. The next steps is to add instructions as to how systemd should run the script. A typical instruction could be as follows:
```
[Unit]
Description=Github webhook
After=network.target

[Service]
Environment=NODE_PORT=3500
Type=simple
User=<your_github_username>
ExecStart=/usr/bin/nodejs /home/<your_github_username>/NodeWebhooks/webhook.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
```
At this stage, the new service needs to be enabled so that it starts when the system boots up. This can be done using `sudo systemctl enable webhook.service`. The service can also be manually started using `sudo systemctl start webhook`. The status of the service can be checked using `sudo systemctl status webhook`.
