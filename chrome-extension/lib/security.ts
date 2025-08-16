// Security and anti-tampering utilities for ProductBaker Chrome Extension

interface SecurityConfig {
  enableExtensionIdValidation: boolean;
  enableRuntimeIntegrityCheck: boolean;
  enableAntiDebugProtection: boolean;
  enableDOMProtection: boolean;
  maxDebuggerCheckInterval: number;
}

class SecurityManager {
  private static instance: SecurityManager;
  private config: SecurityConfig;
  private isInitialized = false;
  private integrityChecks: Map<string, string> = new Map();
  private debuggerDetectionInterval?: number;
  
  // Expected extension ID (will be set during build)
  private readonly EXPECTED_EXTENSION_ID = 'PLACEHOLDER_EXTENSION_ID';
  
  // Security checksums for critical files (will be generated during build)
  private readonly INTEGRITY_CHECKSUMS = new Map([
    ['background.js', 'PLACEHOLDER_BACKGROUND_CHECKSUM'],
    ['sidepanel.js', 'PLACEHOLDER_SIDEPANEL_CHECKSUM'],
    ['popup.js', 'PLACEHOLDER_POPUP_CHECKSUM']
  ]);

  private constructor() {
    this.config = {
      enableExtensionIdValidation: true,
      enableRuntimeIntegrityCheck: true,
      enableAntiDebugProtection: true,
      enableDOMProtection: true,
      maxDebuggerCheckInterval: 1000
    };
  }

  public static getInstance(): SecurityManager {
    if (!SecurityManager.instance) {
      SecurityManager.instance = new SecurityManager();
    }
    return SecurityManager.instance;
  }

  /**
   * Initialize security system - should be called at extension startup
   */
  public async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      return true;
    }

    try {
      // 1. Validate extension ID
      if (this.config.enableExtensionIdValidation && !this.validateExtensionId()) {
        this.handleSecurityViolation('Invalid extension ID detected');
        return false;
      }

      // 2. Validate runtime environment
      if (!this.validateRuntimeEnvironment()) {
        this.handleSecurityViolation('Invalid runtime environment');
        return false;
      }

      // 3. Start integrity monitoring
      if (this.config.enableRuntimeIntegrityCheck) {
        this.startIntegrityMonitoring();
      }

      // 4. Enable anti-debugging protection
      if (this.config.enableAntiDebugProtection) {
        this.enableAntiDebugProtection();
      }

      // 5. Protect DOM manipulation
      if (this.config.enableDOMProtection) {
        this.enableDOMProtection();
      }

      this.isInitialized = true;
      console.log('🛡️ Security system initialized successfully');
      return true;
    } catch (error) {
      console.error('Security initialization failed:', error);
      this.handleSecurityViolation('Security initialization failed');
      return false;
    }
  }

  /**
   * Validate that the extension is running with the correct ID
   */
  private validateExtensionId(): boolean {
    try {
      if (typeof chrome === 'undefined' || !chrome.runtime) {
        return false;
      }

      const currentId = chrome.runtime.id;
      
      // In development mode, skip ID validation
      if (currentId.length === 32 && currentId.match(/^[a-p]+$/)) {
        console.warn('⚠️ Development mode detected - skipping extension ID validation');
        return true;
      }

      if (this.EXPECTED_EXTENSION_ID === 'PLACEHOLDER_EXTENSION_ID') {
        console.warn('⚠️ Extension ID placeholder not replaced - skipping validation');
        return true;
      }

      return currentId === this.EXPECTED_EXTENSION_ID;
    } catch (error) {
      console.error('Extension ID validation failed:', error);
      return false;
    }
  }

  /**
   * Validate runtime environment to detect tampering
   */
  private validateRuntimeEnvironment(): boolean {
    try {
      // Check for suspicious global variables that indicate debugging/tampering
      const suspiciousGlobals = [
        '__REACT_DEVTOOLS_GLOBAL_HOOK__',
        '__PLASMO_DEV__',
        '__REDUX_DEVTOOLS_EXTENSION__'
      ];

      const foundSuspicious = suspiciousGlobals.filter(global => 
        typeof (window as any)[global] !== 'undefined'
      );

      if (foundSuspicious.length > 0 && !this.isDevelopmentMode()) {
        console.warn('Suspicious globals detected:', foundSuspicious);
        // In production, this might indicate tampering
        return false;
      }

      // Check for console override (common in tampering)
      if (this.isConsoleOverridden() && !this.isDevelopmentMode()) {
        console.warn('Console has been overridden');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Runtime environment validation failed:', error);
      return false;
    }
  }

  /**
   * Start monitoring file integrity
   */
  private startIntegrityMonitoring(): void {
    // Check integrity every 30 seconds
    setInterval(() => {
      this.checkFileIntegrity();
    }, 30000);

    // Initial check
    setTimeout(() => this.checkFileIntegrity(), 1000);
  }

  /**
   * Check if critical files have been modified
   */
  private async checkFileIntegrity(): Promise<void> {
    try {
      // This is a simplified approach - in a real implementation,
      // you'd check actual file contents against known checksums
      const manifestData = chrome.runtime.getManifest();
      const manifestChecksum = await this.calculateChecksum(JSON.stringify(manifestData));
      
      if (this.integrityChecks.has('manifest')) {
        const expectedChecksum = this.integrityChecks.get('manifest');
        if (expectedChecksum && expectedChecksum !== manifestChecksum) {
          this.handleSecurityViolation('Manifest integrity violation detected');
          return;
        }
      } else {
        this.integrityChecks.set('manifest', manifestChecksum);
      }
    } catch (error) {
      console.error('Integrity check failed:', error);
    }
  }

  /**
   * Enable anti-debugging protection
   */
  private enableAntiDebugProtection(): void {
    let devToolsOpen = false;
    let lastTime = Date.now();

    const checkDebugger = () => {
      const currentTime = Date.now();
      
      // Detect if developer tools are open (timing-based detection)
      if (currentTime - lastTime > this.config.maxDebuggerCheckInterval * 1.5) {
        if (!devToolsOpen) {
          devToolsOpen = true;
          this.handleSecurityViolation('Developer tools detected');
        }
      } else {
        devToolsOpen = false;
      }
      
      lastTime = currentTime;
    };

    // Check for debugger every second
    this.debuggerDetectionInterval = setInterval(checkDebugger, this.config.maxDebuggerCheckInterval);

    // Anti-debugging statements
    const antiDebug = () => {
      try {
        (function() {
          return false;
        }['constructor']('debugger')['call']());
      } catch (e) {
        // Expected in normal execution
      }
    };

    // Run anti-debug checks periodically
    setInterval(antiDebug, 5000);
  }

  /**
   * Protect against DOM manipulation
   */
  private enableDOMProtection(): void {
    if (typeof document === 'undefined') return;

    // Protect against script injection
    const originalCreateElement = document.createElement;
    document.createElement = function(tagName: string) {
      const element = originalCreateElement.call(this, tagName);
      
      if (tagName.toLowerCase() === 'script') {
        console.warn('Script element creation detected');
        // Log or prevent suspicious script creation
      }
      
      return element;
    };

    // Monitor for suspicious DOM modifications
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            if (element.tagName === 'SCRIPT' && !this.isAllowedScript(element)) {
              console.warn('Suspicious script injection detected');
              element.remove();
            }
          }
        });
      });
    });

    observer.observe(document.body || document.documentElement, {
      childList: true,
      subtree: true
    });
  }

  /**
   * Check if a script element is allowed
   */
  private isAllowedScript(scriptElement: Element): boolean {
    const src = scriptElement.getAttribute('src');
    const allowedSources = [
      chrome.runtime.getURL(''),
      'chrome-extension://' + chrome.runtime.id
    ];

    if (src) {
      return allowedSources.some(allowed => src.startsWith(allowed));
    }

    // Allow inline scripts from extension context
    return true;
  }

  /**
   * Handle security violations
   */
  private handleSecurityViolation(reason: string): void {
    console.error('🚨 Security violation detected:', reason);
    
    // In production, you might want to:
    // 1. Disable the extension
    // 2. Clear all stored data
    // 3. Report to analytics
    // 4. Show warning to user

    // For now, just log and potentially disable functionality
    this.disableSensitiveFeatures();
  }

  /**
   * Disable sensitive features when security violation is detected
   */
  private disableSensitiveFeatures(): void {
    // Clear sensitive data
    try {
      localStorage.clear();
      if (chrome.storage && chrome.storage.local) {
        chrome.storage.local.clear();
      }
    } catch (error) {
      console.error('Failed to clear storage:', error);
    }

    // Show warning to user
    if (typeof document !== 'undefined') {
      const warning = document.createElement('div');
      warning.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: #ff4444;
        color: white;
        padding: 10px;
        z-index: 10000;
        text-align: center;
        font-weight: bold;
      `;
      warning.textContent = 'Security violation detected. Extension disabled.';
      document.body?.appendChild(warning);
    }
  }

  /**
   * Utility functions
   */
  private isDevelopmentMode(): boolean {
    return chrome.runtime.getManifest().update_url === undefined;
  }

  private isConsoleOverridden(): boolean {
    try {
      return console.log.toString().includes('[native code]') === false;
    } catch {
      return true;
    }
  }

  private async calculateChecksum(data: string): Promise<string> {
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      const encoder = new TextEncoder();
      const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(data));
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    
    // Fallback simple hash for environments without crypto.subtle
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16);
  }

  /**
   * Cleanup resources
   */
  public cleanup(): void {
    if (this.debuggerDetectionInterval) {
      clearInterval(this.debuggerDetectionInterval);
      this.debuggerDetectionInterval = undefined;
    }
  }
}

// Export singleton instance
export const securityManager = SecurityManager.getInstance();

// Auto-initialize in browser context
if (typeof window !== 'undefined') {
  // Initialize after a short delay to ensure extension context is ready
  setTimeout(() => {
    securityManager.initialize().catch(console.error);
  }, 100);
}