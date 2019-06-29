require('dotenv').config();
const Hapi = require('@hapi/hapi');
const Boom = require('boom');
const Crypto = require('crypto');
const Fs = require('fs');
const { exec } = require('child_process');

const DEFAULT_PORT = 3000;

if (!Fs.existsSync(process.env.LOCAL_REPO_DIR))
    throw new Error('No local Github repo path specified.');
if (!process.env.GITHUB_WEBHOOK_SECRET)
    throw new Error('No Webhook secret specified.');

const generateSignature = (data, secret) => {
    const hash = Crypto
        .createHmac('sha1', secret)
        .update(data)
        .digest('hex');
    let signature = `sha1=${hash}`;
    return signature;
};

const getValidGithubHeader = (request) => {
    const githubSignature = request.headers['x-hub-signature'];
    if (!githubSignature) throw Boom.badRequest('Invalid github header signature');
    return githubSignature;
};

const execAsync = (command) => new Promise((resolve, reject) => {
    exec(command, (error, stdout, _) => {
        if (error) reject(error);
        resolve(stdout);
    });
});

const init = async ({ GITHUB_WEBHOOK_SECRET, GITHUB_REPO_BRANCH, LOCAL_REPO_DIR, PORT }, shouldStart = true) => {
    const server = Hapi.server({
        port: PORT || DEFAULT_PORT,
        host: 'localhost',
    });

    server.route({
        method: 'GET',
        path: '/',
        options: {
            handler: () => {
                return 'Github Webhook for Node.js Apps: Change 1';
            },
        },
    });

    server.route({
        method: 'POST',
        path:  '/',
        options: {
            handler: async (request, h) => {
                const sanitizedPayload = JSON.stringify(request.payload);
                const computedSignature = generateSignature(sanitizedPayload, GITHUB_WEBHOOK_SECRET);
                const githubSignature = getValidGithubHeader(request);

                if (computedSignature !== githubSignature) 
                    throw Boom.badRequest('Invalid signature passed');

                const command = `cd ${LOCAL_REPO_DIR} && git pull origin ${GITHUB_REPO_BRANCH}`;
                const execLogs = await execAsync(command);
                console.log('================== exec logs ==================');
                console.log(execLogs);
                console.log('================== /exec logs ==================');

                return h.continue;
            }
        }
    });

    if (shouldStart) {
        await server.start();
        console.log('Server running on %s', server.info.uri);
    }
    return server;
};

process.on('unhandledRejection', (error) => {
    console.error(error);
    process.exit(1);
});

process.on('uncaughtException', (error) => {
    console.error(error);
    process.exit(1);
});

init(process.env);
