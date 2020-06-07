import { Settings } from './settings.js';

export class SettingsForm extends FormApplication {

    constructor(object, options = {}) {
        super(object, options);
    }

    /**
    * Default Options for this FormApplication
    */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "compendiumhider-settings-form",
            title: "Compendium Hider",
            template: "./modules/compendium-hider/templates/settings.html",
            classes: ["sheet"],
            width: 500,
            closeOnSubmit: true
        });
    }

    getData() {
        
        var readableSubmenuPackList = Settings.getReadableSubmenuPackList();
        var keyList = [];
        var valueArray = [];
        for (var entry of readableSubmenuPackList){
            if (entry['type']==='submenu'){
                valueArray.push(Settings.isSubmenuHidden(entry['key']))
            }else{
                valueArray.push(Settings.isPackHidden(entry['key']));
            }
            keyList.push(entry['key']);
        }

        const data = {
            rules: this.constructData(readableSubmenuPackList,valueArray,keyList)
        }

        console.log(data);

        return data;
    }

    /** 
     * Executes on form submission.
     * @param {Object} e - the form submission event
     * @param {Object} d - the form data
     *
     *  'name': entry.metadata.label+' ['+entry.metadata.package+']',
     *  'type':'pack',
     *  'submenu':submenu.toLowerCase(),
     *  'key':entry.metadata.package+'.'+entry.metadata.name
     */
    async _updateObject(e, d) {
        let submenuPackList = Settings.getReadableSubmenuPackList();
        //Update packs
        submenuPackList.filter(e => e['type'] === 'pack').forEach(entry => {
            let hasBeenHidden = d[entry['key']];
            //If pack
            if (!Settings.isPackHidden(entry['key']) && hasBeenHidden){
                Settings.hidePack(entry['key']);
            }else if (Settings.isPackHidden(entry['key']) && !hasBeenHidden){
                Settings.showPack(entry['key']);
            }
        });
        //Update submenus
        submenuPackList.filter(e => e['type'] === 'submenu').forEach(entry => {
            let hasBeenHidden = d[entry['key']];
            if (!Settings.isSubmenuHidden(entry['key']) && hasBeenHidden){
                Settings.hideSubmenu(entry['key']);
            }else if (Settings.isSubmenuHidden(entry['key']) && !hasBeenHidden){
                Settings.showSubmenu(entry['key']);
            }
        });
    }
    

    activateListeners(html) {
        super.activateListeners(html);
        // Listener for Pack to either enable a Submenu if all packs are selected
        // Or disable a submenu if all packs were selected, but this one was unselected
        html.find('input.ch-pack').click(event => {
            let submenu = $(event.currentTarget).attr("data-submenu");
            let checked = $(event.currentTarget).prop("checked");
            if (checked){
                let allChecked = checked;
                for (var element of html.find('input.ch-pack[data-submenu="'+submenu+'"]')){
                    allChecked = allChecked && element.checked;
                }
                if (allChecked){
                    html.find('input.ch-submenu[name="'+submenu+'"]').prop("checked",true);
                }
            }else{
                html.find('input.ch-submenu[name="'+submenu+'"]').prop("checked",false);
            }
        });
        // Listener for submenu to toggle enabling/disabling all packs
        html.find('input.ch-submenu').click(event =>{
            let submenu = $(event.currentTarget).attr("name");
            let checked = $(event.currentTarget).prop("checked");
            html.find('input.ch-pack[data-submenu="'+submenu+'"]').prop("checked",checked);
        });
    }

    constructData(names,values,keys) {
        let options = [];
        for (var i=0;i<names.length;i++){
            options.push({ 
                name:names[i]['name'], 
                value:(values[i] ? 'true':''), 
                key:keys[i],
                type:names[i]['type'],
                isSubmenu:names[i]['submenu'] ? '' : 'true',
                submenu:names[i]['submenu'] 
             })
        }
        return options;
    }
}
