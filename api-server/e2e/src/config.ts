/* Autor: Prof. Dr. Norman Lahme-Hütig (FH Münster) */

import fs from 'node:fs';

const configFile = JSON.parse(fs.readFileSync(new URL('./config.json', import.meta.url), 'utf-8'));

class Config {
  testProfile = false;

  activateTestProfile() {
    this.testProfile = true;
  }

  deactivateTestProfile() {
    this.testProfile = false;
  }
  url(relUrl: string) {
    return `${configFile.server}${relUrl.startsWith('/') ? '' : '/'}${relUrl}`;
  }
}

export default new Config();
