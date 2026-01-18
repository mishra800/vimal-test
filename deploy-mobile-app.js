#!/usr/bin/env node

/**
 * Mobile App Deployment Script
 * Ensures GPS and Camera functionality works in mobile apps
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Car Seizure Management System - Mobile App Deployment');
console.log('📱 Configuring GPS and Camera for mobile apps...\n');

// Check if we're in a Cordova project
const isCordovaProject = fs.existsSync('config.xml') && fs.existsSync('www');

if (isCordovaProject) {
    console.log('✅ Cordova project detected');
    configureCordovaProject();
} else {
    console.log('ℹ️  Not a Cordova project - providing setup instructions');
    showCordovaSetupInstructions();
}

function configureCordovaProject() {
    console.log('\n🔧 Configuring Cordova project for GPS and Camera...');
    
    // Check config.xml
    checkConfigXml();
    
    // Check plugins
    checkPlugins();
    
    // Copy files to www directory
    copyFilesToWww();
    
    console.log('\n✅ Cordova project configured successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Run: cordova build');
    console.log('2. Test on device: cordova run android/ios');
    console.log('3. Open mobile-test.html to verify GPS and camera');
}

function checkConfigXml() {
    console.log('\n📄 Checking config.xml...');
    
    const configPath = 'config.xml';
    if (!fs.existsSync(configPath)) {
        console.log('❌ config.xml not found');
        return;
    }
    
    let config = fs.readFileSync(configPath, 'utf8');
    let modified = false;
    
    // Check for required permissions
    const requiredPermissions = [
        '<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />',
        '<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />',
        '<uses-permission android:name="android.permission.CAMERA" />',
        '<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />'
    ];
    
    requiredPermissions.forEach(permission => {
        if (!config.includes(permission)) {
            console.log(`➕ Adding permission: ${permission}`);
            config = config.replace('</platform>', `    ${permission}\n    </platform>`);
            modified = true;
        }
    });
    
    // Check for iOS permissions
    const iosPermissions = [
        {
            key: 'NSLocationWhenInUseUsageDescription',
            value: 'This app needs location access to record seizure locations.'
        },
        {
            key: 'NSCameraUsageDescription', 
            value: 'This app needs camera access to capture vehicle and document photos.'
        },
        {
            key: 'NSPhotoLibraryUsageDescription',
            value: 'This app needs photo library access to select images.'
        }
    ];
    
    iosPermissions.forEach(perm => {
        const editConfig = `<edit-config target="${perm.key}" file="*-Info.plist" mode="merge">
        <string>${perm.value}</string>
    </edit-config>`;
        
        if (!config.includes(perm.key)) {
            console.log(`➕ Adding iOS permission: ${perm.key}`);
            config = config.replace('</widget>', `    ${editConfig}\n</widget>`);
            modified = true;
        }
    });
    
    if (modified) {
        fs.writeFileSync(configPath, config);
        console.log('✅ config.xml updated with required permissions');
    } else {
        console.log('✅ config.xml already has required permissions');
    }
}

function checkPlugins() {
    console.log('\n🔌 Checking Cordova plugins...');
    
    const requiredPlugins = [
        'cordova-plugin-geolocation',
        'cordova-plugin-camera',
        'cordova-plugin-device',
        'cordova-plugin-file'
    ];
    
    // Check if plugins are installed
    const pluginsDir = 'plugins';
    if (!fs.existsSync(pluginsDir)) {
        console.log('❌ Plugins directory not found');
        showPluginInstallCommands(requiredPlugins);
        return;
    }
    
    const installedPlugins = fs.readdirSync(pluginsDir);
    const missingPlugins = requiredPlugins.filter(plugin => 
        !installedPlugins.some(installed => installed.includes(plugin))
    );
    
    if (missingPlugins.length > 0) {
        console.log('❌ Missing required plugins:');
        showPluginInstallCommands(missingPlugins);
    } else {
        console.log('✅ All required plugins are installed');
    }
}

function showPluginInstallCommands(plugins) {
    console.log('\n📦 Install missing plugins:');
    plugins.forEach(plugin => {
        console.log(`cordova plugin add ${plugin}`);
    });
}

function copyFilesToWww() {
    console.log('\n📁 Copying files to www directory...');
    
    const filesToCopy = [
        'index.html',
        'user-dashboard.html', 
        'admin-dashboard.html',
        'script.js',
        'styles.css',
        'manifest.json',
        'sw.js',
        'mobile-test.html',
        'logo.png'
    ];
    
    const wwwDir = 'www';
    if (!fs.existsSync(wwwDir)) {
        fs.mkdirSync(wwwDir);
    }
    
    filesToCopy.forEach(file => {
        if (fs.existsSync(file)) {
            fs.copyFileSync(file, path.join(wwwDir, file));
            console.log(`✅ Copied ${file}`);
        } else {
            console.log(`⚠️  ${file} not found`);
        }
    });
}

function showCordovaSetupInstructions() {
    console.log('\n📋 Cordova Setup Instructions:');
    console.log('\n1. Install Cordova CLI:');
    console.log('   npm install -g cordova');
    
    console.log('\n2. Create Cordova project:');
    console.log('   cordova create CarSeizureApp com.yourcompany.carseizure "Car Seizure Management"');
    console.log('   cd CarSeizureApp');
    
    console.log('\n3. Add platforms:');
    console.log('   cordova platform add android');
    console.log('   cordova platform add ios');
    
    console.log('\n4. Install required plugins:');
    console.log('   cordova plugin add cordova-plugin-geolocation');
    console.log('   cordova plugin add cordova-plugin-camera');
    console.log('   cordova plugin add cordova-plugin-device');
    console.log('   cordova plugin add cordova-plugin-file');
    
    console.log('\n5. Copy your app files to www/ directory');
    
    console.log('\n6. Build and run:');
    console.log('   cordova build');
    console.log('   cordova run android');
    
    console.log('\n📱 For detailed setup, see APP_CONVERSION_GUIDE.md');
}

// Verify deployment
function verifyDeployment() {
    console.log('\n🔍 Verifying deployment...');
    
    const criticalFiles = [
        'script.js',
        'user-dashboard.html',
        'mobile-test.html'
    ];
    
    let allFilesExist = true;
    
    criticalFiles.forEach(file => {
        const filePath = isCordovaProject ? path.join('www', file) : file;
        if (fs.existsSync(filePath)) {
            console.log(`✅ ${file} exists`);
        } else {
            console.log(`❌ ${file} missing`);
            allFilesExist = false;
        }
    });
    
    if (allFilesExist) {
        console.log('\n🎉 Deployment verification successful!');
        console.log('\n📱 Test your mobile app:');
        console.log('1. Open mobile-test.html in your app');
        console.log('2. Test GPS functionality');
        console.log('3. Test Camera functionality');
        console.log('4. Check environment detection');
    } else {
        console.log('\n❌ Deployment verification failed');
        console.log('Please ensure all files are present and try again');
    }
}

// Run verification
verifyDeployment();

console.log('\n🚀 Mobile app deployment complete!');
console.log('📖 For troubleshooting, see MOBILE_TROUBLESHOOTING_GUIDE.md');