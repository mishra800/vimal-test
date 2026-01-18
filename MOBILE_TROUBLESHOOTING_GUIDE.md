# 🔧 Mobile App Troubleshooting Guide

## 🚨 **GPS & Camera Not Working in Mobile App**

This guide helps resolve GPS and camera issues when your web app is converted to a mobile app using Cordova, PhoneGap, or similar frameworks.

---

## 🔍 **Quick Diagnosis**

### **Step 1: Test Your Environment**
Open `mobile-test.html` in your mobile app to check:
- ✅ Available GPS APIs
- ✅ Available Camera APIs  
- ✅ Environment detection
- ✅ Permissions status

### **Step 2: Check Common Issues**

#### **❌ GPS Not Working:**
```
Error: "Permission denied" or "Location unavailable"
```

#### **❌ Camera Not Working:**
```
Error: "Camera not available" or blank screen
```

---

## 🛠️ **GPS Troubleshooting**

### **Issue 1: GPS Permission Denied**

**Symptoms:**
- GPS button shows "Permission denied"
- Location request fails immediately

**Solutions:**

#### **For Cordova Apps:**
1. **Check config.xml permissions:**
```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
```

2. **Add iOS permissions:**
```xml
<edit-config target="NSLocationWhenInUseUsageDescription" file="*-Info.plist" mode="merge">
    <string>This app needs location access to record seizure locations.</string>
</edit-config>
```

3. **Install geolocation plugin:**
```bash
cordova plugin add cordova-plugin-geolocation
```

#### **For Web/PWA:**
1. Ensure HTTPS is enabled
2. Check browser permissions in settings
3. Clear browser cache and try again

### **Issue 2: GPS Timeout**

**Symptoms:**
- GPS request times out after 30 seconds
- "Location unavailable" error

**Solutions:**
1. **Test outdoors** - GPS needs clear sky view
2. **Enable high accuracy** in device location settings
3. **Restart location services** on device
4. **Check if other apps** can get GPS location

### **Issue 3: GPS Accuracy Issues**

**Symptoms:**
- GPS works but shows wrong location
- Very low accuracy (>1000m)

**Solutions:**
1. **Wait longer** - GPS needs time to get satellite fix
2. **Move outdoors** - Indoor GPS is unreliable
3. **Enable WiFi** - Helps with location accuracy
4. **Restart device** - Clears GPS cache

---

## 📷 **Camera Troubleshooting**

### **Issue 1: Camera Permission Denied**

**Symptoms:**
- Camera button shows "Permission denied"
- Black screen when opening camera

**Solutions:**

#### **For Cordova Apps:**
1. **Check config.xml permissions:**
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
```

2. **Add iOS permissions:**
```xml
<edit-config target="NSCameraUsageDescription" file="*-Info.plist" mode="merge">
    <string>This app needs camera access to capture vehicle photos.</string>
</edit-config>
```

3. **Install camera plugin:**
```bash
cordova plugin add cordova-plugin-camera
```

#### **For Web/PWA:**
1. Ensure HTTPS is enabled
2. Check browser camera permissions
3. Close other apps using camera

### **Issue 2: Camera Not Available**

**Symptoms:**
- "Camera not available" error
- Camera buttons hidden

**Solutions:**
1. **Check device has camera** - Test with native camera app
2. **Restart app** - Camera may be locked by another app
3. **Update browser** - Older browsers lack camera support
4. **Check camera plugin** - Ensure Cordova plugin is installed

### **Issue 3: Camera Opens but Can't Capture**

**Symptoms:**
- Camera preview works
- Capture button doesn't work
- Photos not saved

**Solutions:**
1. **Check storage permissions** - App needs write access
2. **Free up storage space** - Device may be full
3. **Test in good lighting** - Camera may fail in dark conditions
4. **Try different camera** - Switch front/back camera

---

## 🔧 **Platform-Specific Fixes**

### **Android Issues:**

#### **GPS Problems:**
```bash
# Check if GPS is enabled
adb shell settings get secure location_providers_allowed

# Enable GPS via ADB (for testing)
adb shell settings put secure location_providers_allowed +gps
```

#### **Camera Problems:**
```bash
# Check camera permissions
adb shell pm list permissions | grep CAMERA

# Grant camera permission manually
adb shell pm grant com.yourapp.package android.permission.CAMERA
```

### **iOS Issues:**

#### **GPS Problems:**
1. **Settings > Privacy & Security > Location Services**
2. **Enable Location Services**
3. **Find your app and set to "While Using App"**

#### **Camera Problems:**
1. **Settings > Privacy & Security > Camera**
2. **Find your app and enable camera access**
3. **Restart app after enabling permissions**

---

## 🧪 **Testing Checklist**

### **Before Deployment:**
- [ ] Test on actual device (not simulator)
- [ ] Test GPS outdoors with clear sky
- [ ] Test camera in good lighting
- [ ] Test permissions flow (deny then allow)
- [ ] Test offline functionality
- [ ] Test with device in airplane mode
- [ ] Test with location services disabled
- [ ] Test with camera blocked by another app

### **GPS Testing:**
- [ ] GPS button responds to clicks
- [ ] Permission prompt appears (first time)
- [ ] Location obtained within 30 seconds
- [ ] Coordinates displayed correctly
- [ ] Address reverse-geocoding works
- [ ] Error messages are user-friendly

### **Camera Testing:**
- [ ] Camera button opens camera
- [ ] Camera preview shows correctly
- [ ] Photo capture works
- [ ] Photo preview displays
- [ ] Gallery selection works as fallback
- [ ] Document camera modals work

---

## 🚀 **Performance Optimization**

### **GPS Optimization:**
```javascript
// Optimized GPS options for mobile
const gpsOptions = {
    enableHighAccuracy: true,
    timeout: 30000,        // 30 seconds for mobile
    maximumAge: 60000      // Cache for 1 minute
};
```

### **Camera Optimization:**
```javascript
// Optimized camera constraints for mobile
const cameraConstraints = {
    video: {
        facingMode: 'environment',  // Back camera
        width: { ideal: 1920, max: 1920 },
        height: { ideal: 1080, max: 1080 }
    }
};
```

---

## 📱 **Cordova Plugin Verification**

### **Check Installed Plugins:**
```bash
cordova plugin list
```

### **Required Plugins:**
```bash
# GPS functionality
cordova plugin add cordova-plugin-geolocation

# Camera functionality  
cordova plugin add cordova-plugin-camera

# Device information
cordova plugin add cordova-plugin-device

# File system access
cordova plugin add cordova-plugin-file
```

### **Plugin Configuration:**
Add to `config.xml`:
```xml
<plugin name="cordova-plugin-geolocation" spec="^4.1.0" />
<plugin name="cordova-plugin-camera" spec="^6.0.0" />
<plugin name="cordova-plugin-device" spec="^2.1.0" />
<plugin name="cordova-plugin-file" spec="^7.0.0" />
```

---

## 🔍 **Debug Mode**

### **Enable Debug Logging:**
Add to your app's JavaScript:
```javascript
// Enable debug mode
window.DEBUG_MODE = true;

// Enhanced logging for mobile debugging
if (window.DEBUG_MODE) {
    console.log('🔧 Debug mode enabled');
    console.log('📱 User Agent:', navigator.userAgent);
    console.log('🌍 Location API:', navigator.geolocation ? 'Available' : 'Not Available');
    console.log('📷 Camera API:', navigator.mediaDevices ? 'Available' : 'Not Available');
    console.log('📱 Cordova:', window.cordova ? 'Available' : 'Not Available');
}
```

### **Remote Debugging:**
- **Android:** Use Chrome DevTools with USB debugging
- **iOS:** Use Safari Web Inspector with device connected

---

## 🆘 **Emergency Fallbacks**

### **If GPS Completely Fails:**
1. **Manual Location Entry** - Always provide text input
2. **Network Location** - Use IP-based location as fallback
3. **Saved Locations** - Let users save frequent locations

### **If Camera Completely Fails:**
1. **Gallery Selection** - Always provide file input option
2. **External Camera** - Guide users to take photos separately
3. **Skip Photos** - Make photos optional for critical reports

---

## ✅ **Success Indicators**

### **GPS Working Correctly:**
- ✅ GPS button responds within 2 seconds
- ✅ Location obtained within 30 seconds
- ✅ Accuracy better than 100 meters
- ✅ Address lookup works
- ✅ Coordinates stored with report

### **Camera Working Correctly:**
- ✅ Camera opens within 3 seconds
- ✅ Preview shows live video
- ✅ Photo capture works instantly
- ✅ Photo quality is acceptable
- ✅ Photos saved with report

---

## 🎯 **Next Steps**

1. **Test with `mobile-test.html`** - Verify all APIs work
2. **Check device permissions** - Ensure GPS and camera access
3. **Test in real conditions** - Outdoor GPS, good lighting for camera
4. **Deploy and test** - Test on actual target devices
5. **Monitor user feedback** - Track GPS/camera success rates

**Your Car Seizure Management System should now work perfectly in mobile apps! 📱✅**