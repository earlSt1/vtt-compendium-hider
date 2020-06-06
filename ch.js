(() => { })();

import { Settings } from "./settings.js";

Hooks.once('ready', async function() {
  const version = 1.0;  //Current Version

  //Bootstrap
  if (!window.CompendiumHider) {
    window.CompendiumHider = { loaded: 0 };
    window.CompendiumHider.setup = () => console.error('CompendiumHider | Failed to setup CompendiumHider');
    $(() => window.CompendiumHider.setup());
  }

  window.CompendiumHider.loaded = version;

  window.CompendiumHider.setup = () => {
    Settings.registerSettings();

     var sheet = window.document.styleSheets[0];

     Settings.getPackKeyList().forEach(packKey => {
        if (Settings.isPackHidden(packKey)){
            console.log("CompendiumHider | Hiding pack "+packKey);
            sheet.insertRule(Settings.generateHideRule(packKey),sheet.cssRules.length);
        }else{
            Settings.removeRule(packKey,sheet);
        }
     })   
     console.log(sheet);
  };

  function update(settings) {
    console.log(settings);
  }
});
