#!/usr/bin/env node
// Build-time security configuration for ProductBaker Extension

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class SecurityBuildProcessor {
  constructor() {
    this.buildDir = path.join(__dirname, '..', 'build');
    this.securityConfigFile = path.join(__dirname, '..', 'lib', 'security.ts');
  }

  async processBuild() {
    console.log('🛡️ Starting security build processing...');
    
    try {
      // 1. Get extension ID from manifest
      const extensionId = await this.getExtensionId();
      console.log('📋 Extension ID:', extensionId);

      // 2. Calculate file checksums
      const checksums = await this.calculateFileChecksums();
      console.log('🔍 File checksums calculated');

      // 3. Update security configuration
      await this.updateSecurityConfig(extensionId, checksums);
      console.log('⚙️ Security configuration updated');

      // 4. Generate obfuscation rules
      await this.generateObfuscationConfig();
      console.log('🎭 Obfuscation configuration generated');

      console.log('✅ Security build processing completed successfully');
    } catch (error) {
      console.error('❌ Security build processing failed:', error);
      process.exit(1);
    }
  }

  async getExtensionId() {
    // For production builds, this should be the actual Chrome Web Store extension ID
    // For development builds, we'll use a placeholder
    const manifestPath = path.join(this.buildDir, 'chrome-mv3-prod', 'manifest.json');
    
    if (fs.existsSync(manifestPath)) {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      // In production, the extension ID would be known after publishing
      return process.env.CHROME_EXTENSION_ID || 'development-mode-id';
    }
    
    return 'development-mode-id';
  }

  async calculateFileChecksums() {
    const checksums = new Map();
    const filesToCheck = [
      'background.js',
      'sidepanel.js', 
      'popup.js',
      'content.js'
    ];

    const buildPath = path.join(this.buildDir, 'chrome-mv3-prod');
    
    for (const file of filesToCheck) {
      const filePath = path.join(buildPath, file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath);
        const hash = crypto.createHash('sha256').update(content).digest('hex');
        checksums.set(file, hash);
        console.log(`  ${file}: ${hash.substring(0, 16)}...`);
      }
    }

    return checksums;
  }

  async updateSecurityConfig(extensionId, checksums) {
    let securityContent = fs.readFileSync(this.securityConfigFile, 'utf8');

    // Replace extension ID placeholder
    securityContent = securityContent.replace(
      'PLACEHOLDER_EXTENSION_ID',
      extensionId
    );

    // Replace checksum placeholders
    for (const [file, checksum] of checksums) {
      const placeholder = `PLACEHOLDER_${file.toUpperCase().replace('.', '_')}_CHECKSUM`;
      securityContent = securityContent.replace(placeholder, checksum);
    }

    // Update integrity checksums map
    const checksumEntries = Array.from(checksums.entries())
      .map(([file, checksum]) => `    ['${file}', '${checksum}']`)
      .join(',\n');
    
    securityContent = securityContent.replace(
      /private readonly INTEGRITY_CHECKSUMS = new Map\(\[[\s\S]*?\]\);/,
      `private readonly INTEGRITY_CHECKSUMS = new Map([\n${checksumEntries}\n  ]);`
    );

    fs.writeFileSync(this.securityConfigFile, securityContent);
  }

  async generateObfuscationConfig() {
    const obfuscationConfig = {
      compact: true,
      controlFlowFlattening: true,
      controlFlowFlatteningThreshold: 0.75,
      deadCodeInjection: true,
      deadCodeInjectionThreshold: 0.4,
      debugProtection: true,
      debugProtectionInterval: 2000,
      disableConsoleOutput: true,
      identifierNamesGenerator: 'hexadecimal',
      log: false,
      numbersToExpressions: true,
      renameGlobals: false,
      rotateStringArray: true,
      selfDefending: true,
      shuffleStringArray: true,
      splitStrings: true,
      splitStringsChunkLength: 10,
      stringArray: true,
      stringArrayEncoding: ['base64'],
      stringArrayIndexShift: true,
      stringArrayRotate: true,
      stringArrayShuffle: true,
      stringArrayWrappersCount: 2,
      stringArrayWrappersChainedCalls: true,
      stringArrayWrappersParametersMaxCount: 4,
      stringArrayWrappersType: 'function',
      stringArrayThreshold: 0.75,
      transformObjectKeys: true,
      unicodeEscapeSequence: false
    };

    const configPath = path.join(__dirname, '..', 'obfuscation.config.json');
    fs.writeFileSync(configPath, JSON.stringify(obfuscationConfig, null, 2));
  }
}

// Run if called directly
if (require.main === module) {
  const processor = new SecurityBuildProcessor();
  processor.processBuild();
}

module.exports = SecurityBuildProcessor;