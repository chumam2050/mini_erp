// Test script to check SerialPort detection
import { SerialPort } from 'serialport';

console.log('Testing SerialPort.list()...\n');

SerialPort.list()
  .then(ports => {
    console.log('Total ports found:', ports.length);
    console.log('\nDetailed port information:');
    console.log('='.repeat(80));
    
    if (ports.length === 0) {
      console.log('No serial ports detected!');
      console.log('\nPossible reasons:');
      console.log('1. No USB serial devices connected');
      console.log('2. Device drivers not installed');
      console.log('3. Devices not recognized as serial ports');
      console.log('4. Permission issues');
    } else {
      ports.forEach((port, index) => {
        console.log(`\nPort ${index + 1}:`);
        console.log('  Path:', port.path);
        console.log('  Manufacturer:', port.manufacturer || 'Unknown');
        console.log('  Serial Number:', port.serialNumber || 'N/A');
        console.log('  Product ID:', port.productId || 'N/A');
        console.log('  Vendor ID:', port.vendorId || 'N/A');
        console.log('  Location ID:', port.locationId || 'N/A');
        console.log('  PnP ID:', port.pnpId || 'N/A');
      });
    }
    console.log('\n' + '='.repeat(80));
  })
  .catch(error => {
    console.error('Error listing serial ports:', error);
  });
