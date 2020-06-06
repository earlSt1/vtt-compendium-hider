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
        var valueArray1 = [];
        for (var key of game.packs.keys()){
            valueArray1.push(Settings.isPackHidden(key));
        }
        var readableList1 = Settings.getReadablePackList()
        var keyList = Settings.getPackKeyList()

        const data = {
            rules: this.mergeArrays(readableList1,valueArray1,keyList),
        }

        console.log(data);

        return data;
    }

    /** 
     * Executes on form submission.
     * @param {Object} e - the form submission event
     * @param {Object} d - the form data
     */
    async _updateObject(e, d) {
        Settings.getPackKeyList().forEach(packKey => {
            var hasBeenHidden = d[packKey];
            if (!Settings.isPackHidden(packKey) && hasBeenHidden){
                Settings.hidePack(packKey);
            }else if (Settings.isPackHidden(packKey) && !hasBeenHidden){
                Settings.unhidePack(packKey);
            }
        });
    }

    activateListeners(html) {
        super.activateListeners(html);
    }

    mergeArrays(names,values,keys) {
        let options = [];
        for (var i=0;i<names.length;i++){
            console.log(values[i]);
            options.push({ name:names[i], value:(values[i] ? 'true':''), key:keys[i] })
        }
        return options;
    }
}
