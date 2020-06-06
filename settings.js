import { SettingsForm } from './settingsForm.js';

export const modName = 'Compendium Hider';
const mod = 'compendium-hider';

/**
 * Provides functionality for interaction with module settings
 */
export class Settings {
    static getPackKeyList(){
        var packKeyList = [];
        for (var key of game.packs.keys()){ 
            packKeyList.push(key);
        };
        return packKeyList;
    }
    static getReadablePackList(){
        var readableList = [];
        for (var i = 0;i<game.packs.entries.length;i++){
            readableList.push(game.packs.entries[i].metadata.label+' ['+game.packs.entries[i].metadata.package+']');
        }
        return readableList;
    }
    static generateHideRule(pack){
        return 'li.compendium-pack[data-pack="'+pack+'"]{ display: none; }';
    }
    static removeRule(pack,sheet){
        for (var i=sheet.cssRules.length-1;i>=0;i--){
            if (sheet.cssRules[i].selectorText==='li.compendium-pack[data-pack="'+pack+'"]'){
                sheet.deleteRule(i);
            }
        }
    }

    static isPackHidden(pack) {
        var packReplace = pack.replace('.','-');
        return (game.settings.get(mod, packReplace+'-hidden')==='true');
    }

    static hidePack(pack) {
        var packReplaced = pack.replace('.','-');
        game.settings.set(mod, packReplaced+'-hidden', true).then(function() {
            var sheet = window.document.styleSheets[0];
            console.log("CompendiumHider | Hiding compendium: "+pack);
            sheet.insertRule(Settings.generateHideRule(pack),sheet.cssRules.length);
            ui.players.render();
        });
    }
    static unhidePack(pack) {
        var packReplaced = pack.replace('.','-');
        game.settings.set(mod, packReplaced+'-hidden', false).then(function() {
            var sheet = window.document.styleSheets[0];
            console.log("CompendiumHider | Unhiding compendium: "+pack);
            Settings.removeRule(pack,sheet);
            ui.players.render();
        });
    }
   
    /**
     * Registers all of the necessary game settings for the module
     */
    static registerSettings() {
        game.settings.registerMenu(mod, 'settingsMenu', {
            name: 'Compendium Hider',
            label: 'Compendium Hider',
            icon: 'fas fa-book',
            type: SettingsForm,
            restricted: true
        });

        for (var pack of game.packs.keys()){
            var packReplaced = pack.replace('.','-');
            game.settings.register(mod, packReplaced+'-hidden', {
                scope: 'world',
                config: false,
                type: String,
                default: false
            });
        };
    }
}
