require('dotenv').config();
const http = require('http');
const crypto = require('crypto');
const fs = require('fs');
const exec = require('child_process').exec;

const {
    GITHUB_WEBHOOK_SECRET,
    GITHUB_REPO,
    PORT,
} = process.env;
const DEFAULT_PORT = 3500;

if (!fs.existsSync(GITHUB_REPO))
    throw new Error('No Github repo path specified.');
if (!GITHUB_WEBHOOK_SECRET)
    throw new Error('No Webhook secret specified.');

const generateSignature = (chunk) => {
    const hash = crypto
        .createHmac('sha1', GITHUB_WEBHOOK_SECRET)
        .update(chunk.toString())
        .digest('hex');
    let signature = `sha1=${hash}`;
    return signature;
};

http.createServer((req, res) => {
    req.on('data', (chunk) => {
        const signature = generateSignature(chunk);
        if (req.headers['x-hub-signature'] === signature) {
            exec(`cd ${GITHUB_REPO} && git pull`)
        }
    });
    res.end();
}).listen(PORT || DEFAULT_PORT);

process.on('uncaughtException', (error) => {
    console.error();
    process.exit(1);
});
