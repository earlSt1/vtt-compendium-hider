import { SettingsForm } from './settingsForm.js';

export const modName = 'Compendium Hider';
const mod = 'compendium-hider';

/**
 * Provides functionality for interaction with module settings
 */
export class Settings {

    // Called by registerSettings()
    // This method adds a CSS class to each Submenu in the Compendiums screen
    // so it's easier to hide them later
    // in the form .submenu-<name>
    static initSubmenus(){
        //Ordered list of all entities (submenus)
        let sortedEntities = game.packs.entries.map(entry => entry.metadata.entity.toLowerCase()).sort()
        let sortedUniqueEntities = [...new Set(sortedEntities)];
        //Ordered list of all compendium submenus
        let sortedCompendiumSubmenus = document.getElementsByClassName('compendium-entity');
        for (var i=0;i<sortedUniqueEntities.length;i++){
            let element = sortedCompendiumSubmenus[i];
            let submenuName = sortedUniqueEntities[i];
            if (!('submenu-'+sortedEntities[i] in element.classList)){
                element.classList.add("submenu-"+submenuName.toLowerCase());
            }
        }
        return sortedUniqueEntities;
    }

    // This function exists to overcome a bug where settings are not persisted over sessions 
    // (even though all packs in a submenu are hidden)
    static checkIfAnySubmenuEmpty(){
        for (var submenu of  Settings.getSubmenuList()){
            if (!Settings.isSubmenuHidden(submenu)){
                let shouldBeHidden = true;
                for (var pack of Settings.getSubmenuEntries(submenu)){                
                    if (!Settings.isPackHidden(pack)){
                        console.log("CompendiumHider | Pack visible, skipping "+submenu);
                        shouldBeHidden = false;
                        break;
                    }
                }
                if (shouldBeHidden && !Settings.isSubmenuHidden(submenu)){
                    console.log("CompendiumHider | Detected submenu that should be hidden. Persisting correct settings.");
                    Settings.hideSubmenu(submenu);
                }
            }
        }
    }
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
    static getSubmenuList(){
        return [...new Set(game.packs.entries.map(entry => entry.metadata.entity))].sort();
    }
    static getSubmenuEntries(submenu){
        return game.packs.entries.filter(entry => entry.metadata.entity===submenu).map(entry => entry.metadata.package+'.'+entry.metadata.name);
    }
    static getReadableSubmenuPackList(){
        var packSubmenuList = [];
        var sortedEntities = Settings.getSubmenuList();
        for (var submenu of sortedEntities){
            let submenuEntries = game.packs.entries.filter(entry => entry.metadata.entity === submenu)
            let listEntry = {'name':submenu,'type':'submenu','key':submenu.toLowerCase(),'submenu':''}
            let packList = []
            packSubmenuList.push(listEntry);
            for (var entry of submenuEntries){
                
                listEntry = {
                    'name':entry.metadata.label+' ['+entry.metadata.package+']',
                    'type':'pack',
                    'submenu':submenu.toLowerCase(),
                    'key':entry.metadata.package+'.'+entry.metadata.name
                }
                packList.push(listEntry);
            }
            // Sort entries alphabetically (instead of by module)
            // to make it easier to compare to Compendium Tab
            packList.sort(function(first,second){
                if (first.name<second.name){return -1;}
                if (first.name>second.name){return  1;}
                return 0;
            });
            packSubmenuList.push(...packList);
            
        }
        return packSubmenuList;
    }

    static generateHidePackRule(pack){
        return 'li.compendium-pack[data-pack="'+pack+'"]{ display: none; }';
    }
    static generateHideSubmenuRule(submenu){
        return 'li.submenu-'+submenu.toLowerCase()+'{ display:none; }';
    }

    static removePackRule(pack,sheet){
        for (var i=sheet.cssRules.length-1;i>=0;i--){
            if (sheet.cssRules[i].selectorText==='li.compendium-pack[data-pack="'+pack+'"]'){
                sheet.deleteRule(i);
            }
        }
    }

    static removeSubmenuRule(submenu,sheet){
        for (var i=sheet.cssRules.length-1;i>=0;i--){
            if (sheet.cssRules[i].selectorText==='li.submenu-'+submenu.toLowerCase()+''){
                sheet.deleteRule(i);
            }
        }
    }

    static isPackHidden(pack) {
        var packReplace = pack.replace('.','-');
        return (game.settings.get(mod, packReplace+'-hidden')==='true');
    }
    static isSubmenuHidden(submenu) {
        var val = game.settings.get(mod, 'submenu-'+submenu.toLowerCase()+'-hidden');
        return (val==='true');
    }

    // BEGIN Main show/hide functions
    static hidePack(pack) {
        var packReplaced = pack.replace('.','-');
        game.settings.set(mod, packReplaced+'-hidden', true).then(function() {
            var sheet = window.document.styleSheets[0];
            console.log("CompendiumHider | Hiding compendium: "+pack);
            sheet.insertRule(Settings.generateHidePackRule(pack),sheet.cssRules.length);
            ui.players.render();
        });
    }
    static showPack(pack) {
        var packReplaced = pack.replace('.','-');
        game.settings.set(mod, packReplaced+'-hidden', false).then(function() {
            var sheet = window.document.styleSheets[0];
            console.log("CompendiumHider | Unhiding compendium: "+pack);
            Settings.removePackRule(pack,sheet);
            ui.players.render();
        });
    }
    static hideSubmenu(submenu){
        game.settings.set(mod, 'submenu-'+submenu.toLowerCase()+'-hidden', true).then(function() {
            var sheet = window.document.styleSheets[0];
            console.log("CompendiumHider | Hiding submenu: "+submenu.capitalize());
            sheet.insertRule(Settings.generateHideSubmenuRule(submenu),sheet.cssRules.length);
            ui.players.render();
        });
    }
    static showSubmenu(submenu){
        game.settings.set(mod, 'submenu-'+submenu.toLowerCase()+'-hidden', false).then(function() {
            var sheet = window.document.styleSheets[0];
            console.log("CompendiumHider | Unhiding submenu: "+submenu.capitalize());
            Settings.removeSubmenuRule(submenu,sheet);
            ui.players.render();
        });
    }
    // END Main show/hide functions
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
        for (var submenu of Settings.initSubmenus()){
           
            game.settings.register(mod, 'submenu-'+submenu.toLowerCase()+'-hidden', {
                scope: 'world',
                config: false,
                type: String,
                default: false
            });
            
        }
        Settings.checkIfAnySubmenuEmpty();
    }
}
