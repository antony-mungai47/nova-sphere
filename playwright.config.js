"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var test_1 = require("@playwright/test");
exports.default = (0, test_1.defineConfig)({
    testDir: './tests/e2e',
    fullyParallel: true,
    retries: 1,
    workers: 1,
    reporter: 'list',
    use: {
        baseURL: 'http://localhost:3000',
        trace: 'on-first-retry',
    },
    webServer: {
        command: 'npm run start',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        stdout: 'pipe',
        stderr: 'pipe',
    },
    projects: [
        {
            name: 'chromium',
            use: __assign({}, test_1.devices['Desktop Chrome']),
        },
        {
            name: 'firefox',
            use: __assign({}, test_1.devices['Desktop Firefox']),
        },
        {
            name: 'webkit',
            use: __assign({}, test_1.devices['Desktop Safari']),
        },
        {
            name: 'Mobile Chrome',
            use: __assign({}, test_1.devices['Pixel 5']),
        },
        {
            name: 'Mobile Safari',
            use: __assign({}, test_1.devices['iPhone 12']),
        },
    ],
    webServer: {
        command: 'npm run start',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
    },
});
