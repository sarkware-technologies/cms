import EM from "./entity.js";

class Setting {

    constructor () {

        if (!Setting.instance) {            
            Setting.instance = this;            
        }
  
        return Setting.instance;

    }

    list = (_module) => {

    };

    get = (_module, _key) => {

    };

    update = (_module, _key) => {

    };

    create = (_module, _key) => {

    };

    delete = (_module, _key) => {

    };

}

const SETTING = new Setting();
export default SETTING;