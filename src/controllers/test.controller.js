module.exports = {
    getHealth: async (req, res) => {
        try {
            const healthCheck = {
                uptime: process.uptime(),
                message: "OK",
                timestamp: Date.now(),
            };
            res.status(200).json(healthCheck);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
    getVersion: async (req, res) => {
        try {
            const versionCheck = {
                version: process.version,
            };
            res.status(200).json(versionCheck);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
    getEnvironment: async (req, res) => {
        try {
            const environmentCheck = {
                environment: process.env.NODE_ENV,
            };
            res.status(200).json(environmentCheck);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
};
