module.exports = {
    apps: [
        {
            name: "klusterthon-96",
            script: "build/index.js",
            exec_mode: "cluster",
            instances: "max",
            ignore_watch: ["node_modules"]
        }
    ],

    deploy: {
        production: {
            user: "SSH_USERNAME",
            host: "SSH_HOSTMACHINE",
            ref: "origin/main",
            repo: "GIT_REPOSITORY",
            path: "DESTINATION_PATH",
            "pre-deploy-local": "",
            "post-deploy": "npm install && pm2 reload ecosystem.config.js --env production",
            "pre-setup": ""
        }
    }
};
