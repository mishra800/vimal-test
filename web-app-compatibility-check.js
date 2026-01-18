/**
 * Web-to-App Compatibility Verification Script
 * Ensures ALL features work in both web and mobile app environments
 */

console.log('🔍 Starting Web-to-App Compatibility Check...');

// Compatibility test results
const compatibilityResults = {
    web: {},
    app: {},
    issues: [],
    fixes: []
};

// Feature compatibility matrix
const featureMatrix = {
    authentication: {
        functions: ['showSignup', 'showLogin', 'switchLoginMethod', 'togglePassword'],
        webRequirements: ['localStorage'],
        appRequirements: ['localStorage'],
        critical: true
    },
    gpsLocation: {
        functions: ['getCurrentLocation', 'getGeolocationAPI'],
        webRequirements: ['navigator.geolocation', 'HTTPS'],
        appRequirements: ['cordova-plugin-geolocation', 'location permissions'],
        critical: true
    },
    camera: {
        functions: ['openCamera', 'capturePhoto', 'closeCamera'],
        webRequirements: ['navigator.mediaDevices.getUserMedia', 'HTTPS'],
        appRequirements: ['cordova-plugin-camera', 'camera permissions'],
        critical: true
    },
    forms: {
        functions: ['submitSeizureReport', 'saveReport', 'checkUsernameAvailability'],
        webRequirements: ['localStorage', 'FormData'],
        appRequirements: ['localStorage', 'FormData'],
        critical: true
    },
    dashboard: {
        functions: ['initUserDashboard', 'initAdminDashboard', 'loadReports'],
        webRequirements: ['localStorage', 'DOM manipulation'],
        appRequirements: ['localStorage', 'DOM manipulation'],
        critical: true
    },
    pwa: {
        functions: ['serviceWorker registration'],
        webRequirements: ['serviceWorker', 'manifest.json'],
        appRequirements: ['optional'],
        critical: false
    },
    storage: {
        functions: ['localStorage operations'],
        webRequirements: ['localStorage'],
        appRequirements: ['localStorage', 'cordova-plugin-file (optional)'],
        critical: true
    },
    ui: {
        functions: ['responsive design', 'touch events'],
        webRequirements: ['CSS media queries', 'touch events'],
        appRequirements: ['CSS media queries', 'touch events'],
        critical: true
    }
};

// Environment detection
function detectEnvironment() {
    const env = {
        isCordova: !!window.cordova,
        isWeb: !window.cordova,
        isPWA: window.matchMedia('(display-mode: standalone)').matches,
        isHTTPS: location.protocol === 'https:',
        isMobile: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
        hasTouch: 'ontouchstart' in window,
        platform: window.device ? window.device.platform : 'web'
    };
    
    console.log('🌍 Environment detected:', env);
    return env;
}

// Check function availability
function checkFunctionAvailability() {
    console.log('🔧 Checking function availability...');
    
    const results = {};
    
    Object.entries(featureMatrix).forEach(([feature, config]) => {
        results[feature] = {
            functions: {},
            available: true
        };
        
        config.functions.forEach(func => {
            if (func.includes('.')) {
                // Check nested properties (e.g., 'navigator.geolocation')
                const parts = func.split('.');
                let obj = window;
                let available = true;
                
                for (const part of parts) {
                    if (obj && obj[part]) {
                        obj = obj[part];
                    } else {
                        available = false;
                        break;
                    }
                }
                
                results[feature].functions[func] = available;
            } else {
                // Check global functions
                results[feature].functions[func] = typeof window[func] === 'function';
            }
            
            if (!results[feature].functions[func]) {
                results[feature].available = false;
            }
        });
    });
    
    return results;
}

// Check web requirements
function checkWebRequirements() {
    console.log('🌐 Checking web requirements...');
    
    const results = {};
    
    Object.entries(featureMatrix).forEach(([feature, config]) => {
        results[feature] = {
            requirements: {},
            satisfied: true
        };
        
        config.webRequirements.forEach(req => {
            let satisfied = false;
            
            switch (req) {
                case 'localStorage':
                    satisfied = typeof Storage !== 'undefined' && window.localStorage;
                    break;
                case 'navigator.geolocation':
                    satisfied = !!navigator.geolocation;
                    break;
                case 'navigator.mediaDevices.getUserMedia':
                    satisfied = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
                    break;
                case 'HTTPS':
                    satisfied = location.protocol === 'https:' || location.hostname === 'localhost';
                    break;
                case 'serviceWorker':
                    satisfied = 'serviceWorker' in navigator;
                    break;
                case 'manifest.json':
                    satisfied = !!document.querySelector('link[rel="manifest"]');
                    break;
                case 'FormData':
                    satisfied = typeof FormData !== 'undefined';
                    break;
                case 'DOM manipulation':
                    satisfied = typeof document !== 'undefined';
                    break;
                case 'CSS media queries':
                    satisfied = typeof window.matchMedia === 'function';
                    break;
                case 'touch events':
                    satisfied = 'ontouchstart' in window;
                    break;
                default:
                    satisfied = true; // Unknown requirement, assume satisfied
            }
            
            results[feature].requirements[req] = satisfied;
            
            if (!satisfied && config.critical) {
                results[feature].satisfied = false;
            }
        });
    });
    
    return results;
}

// Check app requirements (Cordova)
function checkAppRequirements() {
    console.log('📱 Checking app requirements...');
    
    const results = {};
    
    Object.entries(featureMatrix).forEach(([feature, config]) => {
        results[feature] = {
            requirements: {},
            satisfied: true
        };
        
        config.appRequirements.forEach(req => {
            let satisfied = false;
            
            switch (req) {
                case 'localStorage':
                    satisfied = typeof Storage !== 'undefined' && window.localStorage;
                    break;
                case 'cordova-plugin-geolocation':
                    satisfied = window.cordova && navigator.geolocation;
                    break;
                case 'cordova-plugin-camera':
                    satisfied = window.cordova && navigator.camera;
                    break;
                case 'cordova-plugin-file (optional)':
                    satisfied = true; // Optional, so always satisfied
                    break;
                case 'location permissions':
                    // Can't check permissions directly, assume satisfied if plugin exists
                    satisfied = window.cordova && navigator.geolocation;
                    break;
                case 'camera permissions':
                    // Can't check permissions directly, assume satisfied if plugin exists
                    satisfied = window.cordova && navigator.camera;
                    break;
                case 'FormData':
                    satisfied = typeof FormData !== 'undefined';
                    break;
                case 'DOM manipulation':
                    satisfied = typeof document !== 'undefined';
                    break;
                case 'CSS media queries':
                    satisfied = typeof window.matchMedia === 'function';
                    break;
                case 'touch events':
                    satisfied = 'ontouchstart' in window;
                    break;
                case 'optional':
                    satisfied = true;
                    break;
                default:
                    satisfied = true; // Unknown requirement, assume satisfied
            }
            
            results[feature].requirements[req] = satisfied;
            
            if (!satisfied && config.critical && req !== 'optional') {
                results[feature].satisfied = false;
            }
        });
    });
    
    return results;
}

// Test actual functionality
async function testFunctionality() {
    console.log('🧪 Testing actual functionality...');
    
    const results = {};
    
    // Test GPS
    results.gps = await testGPS();
    
    // Test Camera
    results.camera = await testCamera();
    
    // Test Storage
    results.storage = testStorage();
    
    // Test Authentication
    results.auth = testAuthentication();
    
    // Test Forms
    results.forms = testForms();
    
    return results;
}

// GPS functionality test
function testGPS() {
    return new Promise((resolve) => {
        if (!navigator.geolocation) {
            resolve({ working: false, error: 'Geolocation not available' });
            return;
        }
        
        const timeout = setTimeout(() => {
            resolve({ working: false, error: 'GPS timeout' });
        }, 10000);
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                clearTimeout(timeout);
                resolve({ 
                    working: true, 
                    accuracy: position.coords.accuracy,
                    timestamp: position.timestamp
                });
            },
            (error) => {
                clearTimeout(timeout);
                resolve({ working: false, error: error.message });
            },
            {
                enableHighAccuracy: true,
                timeout: 8000,
                maximumAge: 60000
            }
        );
    });
}

// Camera functionality test
function testCamera() {
    return new Promise((resolve) => {
        // Test Cordova camera first
        if (window.cordova && navigator.camera) {
            resolve({ working: true, type: 'cordova', api: 'Cordova Camera Plugin' });
            return;
        }
        
        // Test web camera
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: true })
                .then((stream) => {
                    // Stop the stream immediately
                    stream.getTracks().forEach(track => track.stop());
                    resolve({ working: true, type: 'web', api: 'MediaDevices API' });
                })
                .catch((error) => {
                    resolve({ working: false, error: error.message });
                });
        } else {
            resolve({ working: false, error: 'No camera API available' });
        }
    });
}

// Storage functionality test
function testStorage() {
    try {
        const testKey = 'compatibilityTest';
        const testValue = { test: true, timestamp: Date.now() };
        
        localStorage.setItem(testKey, JSON.stringify(testValue));
        const retrieved = JSON.parse(localStorage.getItem(testKey));
        localStorage.removeItem(testKey);
        
        return { 
            working: retrieved && retrieved.test === true,
            type: 'localStorage'
        };
    } catch (error) {
        return { working: false, error: error.message };
    }
}

// Authentication functionality test
function testAuthentication() {
    const authFunctions = ['showSignup', 'showLogin', 'switchLoginMethod'];
    const available = authFunctions.filter(func => typeof window[func] === 'function');
    
    return {
        working: available.length === authFunctions.length,
        available: available,
        missing: authFunctions.filter(func => typeof window[func] !== 'function')
    };
}

// Forms functionality test
function testForms() {
    const formFunctions = ['submitSeizureReport', 'checkUsernameAvailability'];
    const available = formFunctions.filter(func => typeof window[func] === 'function');
    
    return {
        working: available.length >= 1, // At least one form function should work
        available: available,
        missing: formFunctions.filter(func => typeof window[func] !== 'function')
    };
}

// Generate compatibility report
function generateCompatibilityReport(env, functions, webReqs, appReqs, functionality) {
    console.log('📊 Generating compatibility report...');
    
    const report = {
        environment: env,
        summary: {
            totalFeatures: Object.keys(featureMatrix).length,
            workingFeatures: 0,
            criticalIssues: 0,
            warnings: 0
        },
        features: {},
        recommendations: []
    };
    
    // Analyze each feature
    Object.entries(featureMatrix).forEach(([feature, config]) => {
        const funcResult = functions[feature];
        const webResult = webReqs[feature];
        const appResult = appReqs[feature];
        
        const featureReport = {
            critical: config.critical,
            functions: funcResult,
            webRequirements: webResult,
            appRequirements: appResult,
            status: 'unknown',
            issues: [],
            recommendations: []
        };
        
        // Determine status
        if (env.isCordova) {
            // In app environment
            if (funcResult.available && appResult.satisfied) {
                featureReport.status = 'working';
                report.summary.workingFeatures++;
            } else {
                featureReport.status = 'broken';
                if (config.critical) {
                    report.summary.criticalIssues++;
                } else {
                    report.summary.warnings++;
                }
            }
        } else {
            // In web environment
            if (funcResult.available && webResult.satisfied) {
                featureReport.status = 'working';
                report.summary.workingFeatures++;
            } else {
                featureReport.status = 'broken';
                if (config.critical) {
                    report.summary.criticalIssues++;
                } else {
                    report.summary.warnings++;
                }
            }
        }
        
        // Add specific issues and recommendations
        if (featureReport.status === 'broken') {
            // Function issues
            Object.entries(funcResult.functions).forEach(([func, available]) => {
                if (!available) {
                    featureReport.issues.push(`Function ${func} not available`);
                    featureReport.recommendations.push(`Ensure ${func} is properly defined and exposed globally`);
                }
            });
            
            // Requirement issues
            const reqResult = env.isCordova ? appResult : webResult;
            Object.entries(reqResult.requirements).forEach(([req, satisfied]) => {
                if (!satisfied) {
                    featureReport.issues.push(`Requirement ${req} not satisfied`);
                    
                    // Add specific recommendations
                    if (req === 'HTTPS') {
                        featureReport.recommendations.push('Enable HTTPS for GPS and Camera functionality');
                    } else if (req.includes('cordova-plugin')) {
                        featureReport.recommendations.push(`Install ${req}: cordova plugin add ${req}`);
                    } else if (req.includes('permissions')) {
                        featureReport.recommendations.push(`Add ${req} to config.xml`);
                    }
                }
            });
        }
        
        report.features[feature] = featureReport;
    });
    
    // Add functionality test results
    if (functionality) {
        report.functionalityTests = functionality;
        
        // Add recommendations based on functionality tests
        if (!functionality.gps.working) {
            report.recommendations.push('🔧 GPS not working: ' + functionality.gps.error);
        }
        
        if (!functionality.camera.working) {
            report.recommendations.push('🔧 Camera not working: ' + functionality.camera.error);
        }
        
        if (!functionality.storage.working) {
            report.recommendations.push('🔧 Storage not working: ' + functionality.storage.error);
        }
    }
    
    // Overall recommendations
    if (report.summary.criticalIssues > 0) {
        report.recommendations.unshift('⚠️ Critical issues detected - app may not work properly');
    }
    
    if (!env.isHTTPS && !env.isCordova) {
        report.recommendations.push('🔒 Enable HTTPS for full functionality');
    }
    
    if (env.isCordova && (!navigator.camera || !navigator.geolocation)) {
        report.recommendations.push('📱 Install missing Cordova plugins for full functionality');
    }
    
    return report;
}

// Display report in console
function displayReport(report) {
    console.log('\n📊 WEB-TO-APP COMPATIBILITY REPORT');
    console.log('=====================================');
    
    console.log('\n🌍 Environment:', report.environment);
    
    console.log('\n📈 Summary:');
    console.log(`✅ Working Features: ${report.summary.workingFeatures}/${report.summary.totalFeatures}`);
    console.log(`❌ Critical Issues: ${report.summary.criticalIssues}`);
    console.log(`⚠️ Warnings: ${report.summary.warnings}`);
    
    console.log('\n🔧 Feature Status:');
    Object.entries(report.features).forEach(([feature, data]) => {
        const icon = data.status === 'working' ? '✅' : 
                    data.critical ? '❌' : '⚠️';
        console.log(`${icon} ${feature}: ${data.status.toUpperCase()}`);
        
        if (data.issues.length > 0) {
            data.issues.forEach(issue => console.log(`   - ${issue}`));
        }
    });
    
    if (report.functionalityTests) {
        console.log('\n🧪 Functionality Tests:');
        Object.entries(report.functionalityTests).forEach(([test, result]) => {
            const icon = result.working ? '✅' : '❌';
            console.log(`${icon} ${test}: ${result.working ? 'WORKING' : 'FAILED'}`);
            if (!result.working && result.error) {
                console.log(`   Error: ${result.error}`);
            }
        });
    }
    
    if (report.recommendations.length > 0) {
        console.log('\n💡 Recommendations:');
        report.recommendations.forEach(rec => console.log(`- ${rec}`));
    }
    
    // Overall status
    const overallStatus = report.summary.criticalIssues === 0 ? 
        (report.summary.warnings === 0 ? 'EXCELLENT' : 'GOOD') : 'NEEDS WORK';
    
    console.log(`\n🎯 Overall Status: ${overallStatus}`);
    
    if (overallStatus === 'EXCELLENT') {
        console.log('🎉 All features are compatible for web-to-app conversion!');
    } else if (overallStatus === 'GOOD') {
        console.log('✅ Most features working, minor issues to address');
    } else {
        console.log('⚠️ Critical issues need to be resolved before deployment');
    }
}

// Main compatibility check function
async function runCompatibilityCheck() {
    console.log('🚀 Starting comprehensive compatibility check...');
    
    try {
        // Step 1: Detect environment
        const environment = detectEnvironment();
        
        // Step 2: Check function availability
        const functions = checkFunctionAvailability();
        
        // Step 3: Check web requirements
        const webRequirements = checkWebRequirements();
        
        // Step 4: Check app requirements
        const appRequirements = checkAppRequirements();
        
        // Step 5: Test actual functionality
        const functionality = await testFunctionality();
        
        // Step 6: Generate report
        const report = generateCompatibilityReport(
            environment, functions, webRequirements, appRequirements, functionality
        );
        
        // Step 7: Display report
        displayReport(report);
        
        // Step 8: Store results globally for access
        window.compatibilityReport = report;
        
        return report;
        
    } catch (error) {
        console.error('❌ Compatibility check failed:', error);
        return null;
    }
}

// Auto-run compatibility check
if (typeof window !== 'undefined') {
    // Run after DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', runCompatibilityCheck);
    } else {
        // DOM already loaded
        setTimeout(runCompatibilityCheck, 1000);
    }
}

// Export for manual use
if (typeof window !== 'undefined') {
    window.runCompatibilityCheck = runCompatibilityCheck;
}

console.log('✅ Compatibility check script loaded. Run runCompatibilityCheck() to test.');