(() => { })();

import { Settings } from "./settings.js";

//Is called once the Settings tab is rendered (after the Compendium tab is rendered)
Hooks.once('renderSettings', async function() {
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
     
     //Hide submenus if set
     Settings.getPackKeyList().forEach(packKey => {
        if (Settings.isPackHidden(packKey)){
            //console.log("CompendiumHider | Hiding pack "+packKey);
            //sheet.insertRule(Settings.generateHidePackRule(packKey),sheet.cssRules.length);
            console.log("CompendiumHider | Hiding compendium: "+packKey);
            sheet.insertRule(Settings.generateHidePackRule(packKey),sheet.cssRules.length);
            //Settings.hidePack(packKey);
        }else{
          console.log("CompendiumHider | Unhiding compendium: "+packKey);
          Settings.removePackRule(packKey,sheet);
            //Settings.showPack(packKey);
        }
     });
     Settings.getSubmenuList().forEach(submenu => {
       if (Settings.isSubmenuHidden(submenu)){
        console.log("CompendiumHider | Hiding submenu: "+submenu.capitalize());
        sheet.insertRule(Settings.generateHideSubmenuRule(submenu),sheet.cssRules.length);
        //Settings.hideSubmenu(submenu);
       }else{
        console.log("CompendiumHider | Unhiding submenu: "+submenu.capitalize());
        Settings.removeSubmenuRule(submenu,sheet);
        //Settings.showSubmenu(submenu);
       }
     });
     console.log(sheet);
  };

  function update(settings) {
    console.log(settings);
  }
});
